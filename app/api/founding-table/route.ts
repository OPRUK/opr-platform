import { createClient } from "@supabase/supabase-js";
import { foundingTableWelcomeEmail, newFoundingTableEmail, sendEmail } from "../../../lib/email";
import { createUnsubscribeLink } from "../../../lib/unsubscribe";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";

export async function POST(request: Request) {
  try {
    const { name: submittedName, email: submittedEmail, marketingOptIn = false } = await request.json();
    const name = typeof submittedName === "string" ? submittedName.trim() : "";
    const email = typeof submittedEmail === "string" ? submittedEmail.trim().toLowerCase() : "";

    if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ error: "Please enter your name and a valid email address." }, { status: 400 });
    }

    const secretKey = process.env.SUPABASE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!secretKey || !supabaseUrl) {
      console.error("OPR Founding Table service is not configured", {
        hasSupabaseSecretKey: Boolean(secretKey),
        hasSupabaseUrl: Boolean(supabaseUrl),
      });
      return Response.json({ error: "The Founding Table is not available just now. Please try again shortly." }, { status: 503 });
    }

    // The secret key is used only on this server route. The browser never sees it,
    // and the database table has no public read or write permissions.
    const supabase = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const wantsMarketing = marketingOptIn === true;
    const { error: saveError } = await supabase.from("founding_table_members").insert({
      name,
      email,
      marketing_opt_in: wantsMarketing,
      source: "website",
    });

    if (saveError) {
      if (saveError.code === "23505") {
        // A new, explicit opt-in is consent to resume optional updates.
        if (wantsMarketing) {
          const { error: rejoinError } = await supabase
            .from("founding_table_members")
            .update({ marketing_opt_in: true, marketing_unsubscribed_at: null })
            .eq("email", email);
          if (rejoinError) throw rejoinError;
        }
        return Response.json({ alreadyJoined: true });
      }

      throw saveError;
    }

    await Promise.all([
      sendEmail({
        to: email,
        ...foundingTableWelcomeEmail({
          name,
          unsubscribeUrl: wantsMarketing ? createUnsubscribeLink(email) : null,
          marketingOptIn: wantsMarketing,
        }),
      }),
      sendEmail({ to: adminEmail, ...newFoundingTableEmail({ name, email }) }),
    ]);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("OPR Founding Table signup failed", error);
    return Response.json({ error: "We could not join you to the Founding Table just now." }, { status: 400 });
  }
}
