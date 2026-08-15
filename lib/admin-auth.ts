import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./supabase/admin";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";

// The service-role client this returns bypasses RLS entirely, so aal2 is
// enforced here rather than left to a database policy.
function decodeAal(accessToken: string): string | null {
  try {
    const payload = accessToken.split(".")[1];
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json).aal ?? null;
  } catch {
    return null;
  }
}

export async function requireAdmin(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!token) {
    return { client: null, error: "Your secure sign-in has expired. Please sign out and use a new sign-in link." };
  }
  if (!publicUrl || !publishableKey) {
    return { client: null, error: "The private inbox connection is not fully configured." };
  }

  const authClient = createClient(publicUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || authData.user?.email?.toLowerCase() !== adminEmail) {
    return { client: null, error: "This secure sign-in is not authorised for the OPR inbox. Please sign out and use the OPR team email." };
  }

  if (decodeAal(token) !== "aal2") {
    return {
      client: null,
      error: "Two-factor verification is required for this account. Please sign out and sign in again to complete the authenticator step.",
    };
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return { client: null, error: "The private inbox connection is not fully configured." };
  }

  return { client, error: null };
}
