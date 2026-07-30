import { foundingTableWelcomeEmail, newFoundingTableEmail, sendEmail } from "../../../lib/email";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ error: "Please enter your name and a valid email address." }, { status: 400 });
    }

    await Promise.all([
      sendEmail({ to: email, ...foundingTableWelcomeEmail({ name }) }),
      sendEmail({ to: adminEmail, ...newFoundingTableEmail({ name, email }) }),
    ]);

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "We could not join you to the Founding Table just now." }, { status: 400 });
  }
}
