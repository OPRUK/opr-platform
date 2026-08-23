import { sendEmail, welcomeNewsletterEmail } from "../../../../lib/email";
import { createUnsubscribeLink } from "../../../../lib/unsubscribe";

export const runtime = "nodejs";

// Manually triggered, not scheduled — no vercel.json cron entry. Lives here
// only to reuse the static-secret auth pattern the other /api/cron routes
// already use, since curl can't hold an admin session token.
const TEST_RECIPIENT = "chaten@otherpeoplesrecipes.co.uk";

function isAuthorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
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
