import { requireAdmin } from "../../../../lib/admin-auth";
import {
  firstNewsletterEmail,
  getSentEmailRecipients,
  sendEmail,
  WELCOME_NEWSLETTER_SUBJECT,
} from "../../../../lib/email";
import { createUnsubscribeLink } from "../../../../lib/unsubscribe";

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

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function getNewsletterDeliveryStatus(audience: NewsletterSubscriber[]) {
  const { recipients: sentRecipients, errorMessage } = await getSentEmailRecipients({
    subject: WELCOME_NEWSLETTER_SUBJECT,
  });
  if (!sentRecipients) return { error: errorMessage, alreadySent: null, pending: null };

  const alreadySent = audience.filter((subscriber) => sentRecipients.has(subscriber.email));
  const pending = audience.filter((subscriber) => !sentRecipients.has(subscriber.email));
  return { error: null, alreadySent, pending };
}

async function getNewsletterAudience(request: Request) {
  const { client, error: accessError } = await requireAdmin(request);
  if (!client) return { error: accessError, audience: null };

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
    return { error: "The newsletter audience could not be loaded.", audience: null };
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

  return { error: null, audience: [...deduplicated.values()] };
}

// Returns a privacy-safe count only. Subscriber addresses never leave this route.
export async function GET(request: Request) {
  const { audience, error } = await getNewsletterAudience(request);
  if (!audience) return Response.json({ error }, { status: 401 });

  const deliveryStatus = await getNewsletterDeliveryStatus(audience);
  if (!deliveryStatus.pending || !deliveryStatus.alreadySent) {
    return Response.json({ error: deliveryStatus.error }, { status: 502 });
  }

  return Response.json({
    newsletter: "welcome-newsletter-1",
    recipients: audience.length,
    alreadySent: deliveryStatus.alreadySent.length,
    pending: deliveryStatus.pending.length,
    pendingRecipients: deliveryStatus.pending.map(({ name, email }) => ({ name, email })),
  });
}

export async function POST(request: Request) {
  const { audience, error } = await getNewsletterAudience(request);
  if (!audience) return Response.json({ error }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (body?.confirmation !== "SEND OPR NEWSLETTER 1") {
    return Response.json(
      { error: "The newsletter was not sent. Exact confirmation is required.", recipients: audience.length },
      { status: 400 },
    );
  }

  const deliveryStatus = await getNewsletterDeliveryStatus(audience);
  if (!deliveryStatus.pending || !deliveryStatus.alreadySent) {
    return Response.json({ error: deliveryStatus.error }, { status: 502 });
  }

  let sent = 0;
  const failed: NewsletterFailure[] = [];
  for (const [index, subscriber] of deliveryStatus.pending.entries()) {
    if (index > 0) await wait(NEWSLETTER_SEND_INTERVAL_MS);

    const unsubscribeUrl = createUnsubscribeLink(subscriber.email);
    if (!unsubscribeUrl) {
      failed.push({
        email: subscriber.email,
        reason: "A secure unsubscribe link could not be created.",
      });
      continue;
    }
    const result = await sendEmail({
      to: subscriber.email,
      idempotencyKey: `welcome-newsletter-1-${Buffer.from(subscriber.email).toString("base64url")}`,
      retry: { maxAttempts: 4, minimumDelayMs: 1_000 },
      ...firstNewsletterEmail({ name: subscriber.name, unsubscribeUrl }),
    });
    if (result.sent) sent += 1;
    else {
      failed.push({
        email: subscriber.email,
        reason: result.errorMessage || "The email provider rejected the request.",
      });
    }
  }

  return Response.json({
    newsletter: "welcome-newsletter-1",
    recipients: audience.length,
    alreadySent: deliveryStatus.alreadySent.length,
    attempted: deliveryStatus.pending.length,
    sent,
    failed: failed.length,
    failedRecipients: failed,
  });
}
