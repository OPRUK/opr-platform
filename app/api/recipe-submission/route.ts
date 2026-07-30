import { newSubmissionEmail, recipeReceivedEmail, sendEmail } from "../../../lib/email";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";

export async function POST(request: Request) {
  try {
    const { name, email, title, location } = await request.json();

    if (!name || !email || !title) {
      return Response.json({ error: "Missing recipe details" }, { status: 400 });
    }

    const contributorEmail = recipeReceivedEmail({ name, title });
    const teamEmail = newSubmissionEmail({ name, email, title, location });

    await Promise.all([
      sendEmail({ to: email, ...contributorEmail }),
      sendEmail({ to: adminEmail, ...teamEmail }),
    ]);

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Email could not be prepared" }, { status: 400 });
  }
}
