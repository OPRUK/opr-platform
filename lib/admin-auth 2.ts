import "server-only";
import { createClient } from "@supabase/supabase-js";
import { decodeAal, extractBearerToken } from "./admin-auth-token";
import { getSupabaseAdmin } from "./supabase/admin";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";

export async function requireAdmin(request: Request) {
  const token = extractBearerToken(request.headers.get("authorization"));
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
