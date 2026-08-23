import { sendEmail, welcomeNewsletterEmail } from "../../../../lib/email";
import { createUnsubscribeLink } from "../../../../lib/unsubscribe";

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

  const { sent } = await sendEmail({
    to: TEST_RECIPIENT,
    ...welcomeNewsletterEmail({
      name: "Chaten",
      unsubscribeUrl: createUnsubscribeLink(TEST_RECIPIENT),
    }),
  });

  return Response.json({ ok: sent, to: TEST_RECIPIENT });
}
