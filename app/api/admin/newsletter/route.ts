import { requireAdmin } from "../../../../lib/admin-auth";
import { firstNewsletterEmail, sendEmail } from "../../../../lib/email";
import { createUnsubscribeLink } from "../../../../lib/unsubscribe";
import type { SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type SubscriberRow = {
  name: string | null;
  email: string;
};

type NewsletterSubscriber = {
  name: string;
  email: string;
};

type NewsletterFailure = {
  email: string;
  reason: string;
};

const NEWSLETTER_SEND_INTERVAL_MS = 300;
const NEWSLETTER_ID = "welcome-newsletter-1";
const INITIAL_SEND_RECOVERY_DEADLINE = Date.parse("2026-09-03T13:05:21.688Z");

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function getNewsletterDeliveryStatus(client: SupabaseClient, audience: NewsletterSubscriber[]) {
  const { data, error } = await client
    .from("newsletter_deliveries")
    .select("email, status")
    .eq("newsletter_id", NEWSLETTER_ID);
  if (error) {
    console.error("OPR newsletter delivery ledger could not be loaded", error);
    return { error: "The newsletter delivery ledger could not be loaded.", alreadySent: null, pending: null, recoveryMode: false };
  }

  const sentRecipients = new Set(
    (data ?? [])
      .filter((delivery) => delivery.status === "sent")
      .map((delivery) => String(delivery.email).trim().toLowerCase()),
  );
  const alreadySent = audience.filter((subscriber) => sentRecipients.has(subscriber.email));
  const pending = audience.filter((subscriber) => !sentRecipients.has(subscriber.email));
  const recoveryMode = (data ?? []).length === 0 && Date.now() < INITIAL_SEND_RECOVERY_DEADLINE;
  return { error: null, alreadySent, pending, recoveryMode };
}

async function recordNewsletterDelivery(
  client: SupabaseClient,
  subscriber: NewsletterSubscriber,
  delivery: {
    status: "sending" | "sent" | "failed";
    attempts?: number;
    providerStatus?: number | null;
    errorCode?: string | null;
    errorMessage?: string | null;
  },
) {
  const { error } = await client.from("newsletter_deliveries").upsert({
    newsletter_id: NEWSLETTER_ID,
    email: subscriber.email,
    name: subscriber.name,
    status: delivery.status,
    attempts: delivery.attempts ?? 0,
    provider_status: delivery.providerStatus ?? null,
    error_code: delivery.errorCode ?? null,
    error_message: delivery.errorMessage ?? null,
    sent_at: delivery.status === "sent" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "newsletter_id,email" });

  if (error) console.error("OPR newsletter delivery could not be recorded", error);
  return error;
}

async function getNewsletterAudience(request: Request) {
  const { client, error: accessError } = await requireAdmin(request);
  if (!client) return { error: accessError, audience: null, client: null };

  const [tableMembers, recipeContributors, cookalongGuests] = await Promise.all([
    client
      .from("founding_table_members")
      .select("name, email")
      .eq("marketing_opt_in", true)
      .is("marketing_unsubscribed_at", null)
      .neq("status", "unsubscribed"),
    client
      .from("recipe_submissions")
      .select("name, email")
      .eq("marketing_opt_in", true)
      .is("marketing_unsubscribed_at", null),
    client
      .from("cookalong_signups")
      .select("name, email")
      .eq("marketing_opt_in", true)
      .is("marketing_unsubscribed_at", null),
  ]);

  const queryError = tableMembers.error || recipeContributors.error || cookalongGuests.error;
  if (queryError) {
    console.error("OPR newsletter audience could not be loaded", queryError);
    return { error: "The newsletter audience could not be loaded.", audience: null, client };
  }

  const deduplicated = new Map<string, NewsletterSubscriber>();
  for (const subscriber of [
    ...(tableMembers.data ?? []),
    ...(recipeContributors.data ?? []),
    ...(cookalongGuests.data ?? []),
  ] as SubscriberRow[]) {
    const email = subscriber.email.trim().toLowerCase();
    if (!email || deduplicated.has(email)) continue;
    deduplicated.set(email, { name: subscriber.name?.trim() || "there", email });
  }

  return { error: null, audience: [...deduplicated.values()], client };
}

// Subscriber details are returned only after the existing MFA-protected admin check.
export async function GET(request: Request) {
  const { audience, client, error } = await getNewsletterAudience(request);
  if (!audience || !client) return Response.json({ error }, { status: 401 });

  const deliveryStatus = await getNewsletterDeliveryStatus(client, audience);
  if (!deliveryStatus.pending || !deliveryStatus.alreadySent) {
    return Response.json({ error: deliveryStatus.error }, { status: 502 });
  }

  return Response.json({
    newsletter: NEWSLETTER_ID,
    recipients: audience.length,
    alreadySent: deliveryStatus.alreadySent.length,
    pending: deliveryStatus.pending.length,
    pendingRecipients: deliveryStatus.pending.map(({ name, email }) => ({ name, email })),
    recoveryMode: deliveryStatus.recoveryMode,
    recoveryDeadline: deliveryStatus.recoveryMode ? new Date(INITIAL_SEND_RECOVERY_DEADLINE).toISOString() : null,
  });
}

export async function POST(request: Request) {
  const { audience, client, error } = await getNewsletterAudience(request);
  if (!audience || !client) return Response.json({ error }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (body?.confirmation !== "SEND OPR NEWSLETTER 1") {
    return Response.json(
      { error: "The newsletter was not sent. Exact confirmation is required.", recipients: audience.length },
      { status: 400 },
    );
  }

  const deliveryStatus = await getNewsletterDeliveryStatus(client, audience);
  if (!deliveryStatus.pending || !deliveryStatus.alreadySent) {
    return Response.json({ error: deliveryStatus.error }, { status: 502 });
  }

  let sent = 0;
  const failed: NewsletterFailure[] = [];
  for (const [index, subscriber] of deliveryStatus.pending.entries()) {
    if (index > 0) await wait(NEWSLETTER_SEND_INTERVAL_MS);

    const trackingError = await recordNewsletterDelivery(client, subscriber, { status: "sending" });
    if (trackingError) {
      failed.push({ email: subscriber.email, reason: "The delivery could not be tracked safely, so it was not sent." });
      continue;
    }

    const unsubscribeUrl = createUnsubscribeLink(subscriber.email);
    if (!unsubscribeUrl) {
      const reason = "A secure unsubscribe link could not be created.";
      await recordNewsletterDelivery(client, subscriber, { status: "failed", errorCode: "unsubscribe_link_failed", errorMessage: reason });
      failed.push({ email: subscriber.email, reason });
      continue;
    }
    const result = await sendEmail({
      to: subscriber.email,
      idempotencyKey: `welcome-newsletter-1-${Buffer.from(subscriber.email).toString("base64url")}`,
      retry: { maxAttempts: 4, minimumDelayMs: 1_000 },
      ...firstNewsletterEmail({ name: subscriber.name, unsubscribeUrl }),
    });
    if (result.sent) {
      const recordError = await recordNewsletterDelivery(client, subscriber, {
        status: "sent",
        attempts: result.attempts,
        providerStatus: result.status,
      });
      if (recordError) {
        failed.push({
          email: subscriber.email,
          reason: "Resend accepted the email, but its delivery record could not be saved.",
        });
      } else {
        sent += 1;
      }
    } else {
      await recordNewsletterDelivery(client, subscriber, {
        status: "failed",
        attempts: result.attempts,
        providerStatus: result.status,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      });
      failed.push({
        email: subscriber.email,
        reason: result.errorMessage || "The email provider rejected the request.",
      });
    }
  }

  return Response.json({
    newsletter: NEWSLETTER_ID,
    recipients: audience.length,
    alreadySent: deliveryStatus.alreadySent.length,
    attempted: deliveryStatus.pending.length,
    sent,
    failed: failed.length,
    failedRecipients: failed,
    recoveryMode: deliveryStatus.recoveryMode,
  });
}
