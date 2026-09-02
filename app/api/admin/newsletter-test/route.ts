import { requireAdmin } from "../../../../lib/admin-auth";
import { firstNewsletterEmail, sendEmail } from "../../../../lib/email";
import { createUnsubscribeLink } from "../../../../lib/unsubscribe";

export const runtime = "nodejs";

const TEST_RECIPIENT = "chaten@otherpeoplesrecipes.co.uk";

export async function POST(request: Request) {
  const { client, error: accessError } = await requireAdmin(request);
  if (!client) return Response.json({ error: accessError }, { status: 401 });

  const unsubscribeUrl = createUnsubscribeLink(TEST_RECIPIENT);
  if (!unsubscribeUrl) {
    return Response.json(
      { error: "Unsubscribe signing is not configured." },
      { status: 500 },
    );
  }

  const { sent } = await sendEmail({
    to: TEST_RECIPIENT,
    ...firstNewsletterEmail({ name: "Chaten", unsubscribeUrl }),
  });

  if (!sent) {
    return Response.json(
      { error: "The test newsletter could not be sent." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, recipient: "Chaten's admin inbox" });
}
