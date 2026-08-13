import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// The service-role-equivalent client. Bypasses RLS entirely, so it must only
// ever be imported by server-side code (API routes). The "server-only" import
// above fails the build if a client component ever pulls this in.
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) return null;

  if (!cached) {
    cached = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
