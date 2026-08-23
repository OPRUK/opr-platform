import { requireAdmin } from "../../../../lib/admin-auth";
import { firstNewsletterEmail, sendEmail } from "../../../../lib/email";
import { createUnsubscribeLink } from "../../../../lib/unsubscribe";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

type SubscriberRow = {
  name: string | null;
  email: string;
};

type NewsletterSubscriber = {
  name: string;
  email: string;
};

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
  return Response.json({ newsletter: "welcome-newsletter-1", recipients: audience.length });
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

  let sent = 0;
  const failed: string[] = [];
  const embeddedImages = await Promise.all(
    [
      ["opr-parchment.jpg", "opr-parchment"],
      ["opr-logo.png", "opr-logo"],
      ["gautam-shobha-portrait.jpg", "gautam-shobha"],
      ["tandoori-aloo-nazakat.jpg", "tandoori-aloo"],
      ["dave-and-rubble.jpg", "dave-and-rubble"],
    ].map(async ([filename, contentId]) => ({
      content: (await readFile(join(process.cwd(), "public/images/email", filename))).toString("base64"),
      filename,
      content_id: contentId,
    })),
  );
  for (const subscriber of audience) {
    const unsubscribeUrl = createUnsubscribeLink(subscriber.email);
    if (!unsubscribeUrl) {
      failed.push(subscriber.email);
      continue;
    }
    const result = await sendEmail({
      to: subscriber.email,
      idempotencyKey: `welcome-newsletter-1-${Buffer.from(subscriber.email).toString("base64url")}`,
      ...firstNewsletterEmail({
        name: subscriber.name,
        unsubscribeUrl,
        parchmentUrl: "cid:opr-parchment",
        logoUrl: "cid:opr-logo",
        gautamShobhaUrl: "cid:gautam-shobha",
        tandooriAlooUrl: "cid:tandoori-aloo",
        daveRubbleUrl: "cid:dave-and-rubble",
      }),
      attachments: embeddedImages,
    });
    if (result.sent) sent += 1;
    else failed.push(subscriber.email);
  }

  return Response.json({
    newsletter: "welcome-newsletter-1",
    recipients: audience.length,
    sent,
    failed: failed.length,
  });
}
