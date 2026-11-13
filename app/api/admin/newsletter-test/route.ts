import { requireAdmin } from "../../../../lib/admin-auth";
import { sendEmail } from "../../../../lib/email";
import { designReviewEmail, type ReviewKind } from "../../../../lib/email-design-review";
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

  const body = await request.json().catch(() => ({})) as { preview?: string };
  const allowed: ReviewKind[] = ['first','november-2026','welcome','recipe','opc-welcome','opc-recipe'];
  const kind = (body.preview || 'first') as ReviewKind;
  if (!allowed.includes(kind)) return Response.json({error:'Unknown design preview.'},{status:400});
  const content = designReviewEmail(kind,{name:'Chaten',title:kind==='opc-recipe'?'Your favourite cocktail':'Your family favourite',unsubscribeUrl});
  const { sent } = await sendEmail({
    to: TEST_RECIPIENT,
    ...content,
    subject: "[REDESIGN REVIEW] " + content.subject,
  });

  if (!sent) {
    return Response.json(
      { error: "The test newsletter could not be sent." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, recipient: "Chaten's admin inbox" });
}
