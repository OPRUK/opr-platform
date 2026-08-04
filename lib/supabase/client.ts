import { createClient } from "@supabase/supabase-js";

// Public pages are rendered during a build as well as in a visitor's browser.
// This harmless fallback prevents local builds from crashing when credentials
// are unavailable. Vercel supplies the real values for the live website.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "placeholder-key";

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
);
