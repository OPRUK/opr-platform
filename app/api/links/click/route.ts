import { getSupabaseAdmin } from "../../../../lib/supabase/admin";

export const runtime = "nodejs";

// Keep this in sync with the `key` values used in app/links/LinkButtons.tsx —
// validating against a fixed list means a request can only ever increment a
// real link's count, not write arbitrary strings.
const knownKeys = new Set([
  "share",
  "family-cookbook",
  "founding-table",
  "recipe-of-month",
  "films",
  "contact",
  "instagram",
  "facebook",
  "pinterest",
  "youtube",
  "tiktok",
]);

export async function POST(request: Request) {
  let key: unknown;
  try {
    const body = await request.json();
    key = body?.key;
  } catch {
    return new Response(null, { status: 400 });
  }

  if (typeof key !== "string" || !knownKeys.has(key)) {
    return new Response(null, { status: 400 });
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return new Response(null, { status: 204 });
  }

  await client.from("link_clicks").insert({ link_key: key });

  return new Response(null, { status: 204 });
}
