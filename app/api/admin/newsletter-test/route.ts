import { requireAdmin } from "../../../../lib/admin-auth";
import { firstNewsletterEmail, novemberNewsletterEmail, recipeReceivedEmail, foundingTableWelcomeEmail, sendEmail } from "../../../../lib/email";
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
  const content = body.preview === 'november-2026' ? novemberNewsletterEmail({name:'Chaten',unsubscribeUrl})
    : body.preview === 'welcome' ? foundingTableWelcomeEmail({name:'Chaten',unsubscribeUrl,marketingOptIn:true})
    : body.preview === 'recipe' ? recipeReceivedEmail({name:'Chaten',title:'Your family favourite'})
    : firstNewsletterEmail({name:'Chaten',unsubscribeUrl});
  const { sent } = await sendEmail({
    to: TEST_RECIPIENT,
    ...content,
    subject: "[DESIGN PREVIEW] " + content.subject,
  });

  if (!sent) {
    return Response.json(
      { error: "The test newsletter could not be sent." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, recipient: "Chaten's admin inbox" });
}
