import { firstNewsletterEmail, sendEmail } from "../../../../lib/email";
import { createUnsubscribeLink } from "../../../../lib/unsubscribe";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

// Manually triggered, not scheduled — no vercel.json cron entry. Uses its
// own secret (NEWSLETTER_TEST_SEND_SECRET) rather than CRON_SECRET so it
// stays independent of the actual scheduled cron jobs.
const TEST_RECIPIENT = "chaten@otherpeoplesrecipes.co.uk";

function isAuthorised(request: Request): boolean {
  const secret = process.env.NEWSLETTER_TEST_SEND_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorised(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unsubscribeUrl = createUnsubscribeLink(TEST_RECIPIENT);
  if (!unsubscribeUrl) {
    return Response.json({ error: "Unsubscribe signing is not configured." }, { status: 500 });
  }

  const attachments = await Promise.all(
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

  const { sent } = await sendEmail({
    to: TEST_RECIPIENT,
    ...firstNewsletterEmail({
      name: "Chaten",
      unsubscribeUrl,
      parchmentUrl: "cid:opr-parchment",
      logoUrl: "cid:opr-logo",
      gautamShobhaUrl: "cid:gautam-shobha",
      tandooriAlooUrl: "cid:tandoori-aloo",
      daveRubbleUrl: "cid:dave-and-rubble",
    }),
    attachments,
  });

  return Response.json({ ok: sent, to: TEST_RECIPIENT });
}
