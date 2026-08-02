import { createClient } from "@supabase/supabase-js";
import { hasValidUnsubscribeToken } from "../../../lib/unsubscribe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email: submittedEmail, token: submittedToken } = await request.json();
    const email = typeof submittedEmail === "string" ? submittedEmail.trim().toLowerCase() : "";
    const token = typeof submittedToken === "string" ? submittedToken : "";

    if (!email || !hasValidUnsubscribeToken(email, token)) {
      return Response.json({ error: "This unsubscribe link is not valid." }, { status: 400 });
    }

    const secretKey = process.env.SUPABASE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!secretKey || !supabaseUrl) {
      return Response.json({ error: "This service is not available just now." }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const changes = {
      marketing_opt_in: false,
      marketing_unsubscribed_at: new Date().toISOString(),
    };

    const results = await Promise.all([
      supabase.from("founding_table_members").update(changes).eq("email", email),
      supabase.from("recipe_submissions").update(changes).eq("email", email),
    ]);

    const failure = results.find((result) => result.error)?.error;
    if (failure) throw failure;

    return Response.json({ ok: true });
  } catch (error) {
    console.error("OPR unsubscribe failed", error);
    return Response.json({ error: "We could not update your preferences just now." }, { status: 400 });
  }
}
