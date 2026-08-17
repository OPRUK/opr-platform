import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { normaliseAttribution } from "../../../../lib/attribution";

export const runtime = "nodejs";

// Keep this in sync with the `key` values used in app/links/LinkButtons.tsx —
// validating against a fixed list means a request can only ever increment a
// real link's count, not write arbitrary strings.
const knownLinks = {
  share: "/share",
  "family-cookbook": "/family-cookbook",
  "join-our-table": "/join-our-table",
  "recipe-of-month": "/app/vote",
  films: "/films",
  contact: "mailto:info@otherpeoplesrecipes.co.uk",
  instagram: "https://www.instagram.com/opr_uk/",
  facebook: "https://www.facebook.com/otherpeoplesrecipesuk/",
  pinterest: "https://www.pinterest.com/otherpeoplesrecipes/",
  youtube: "https://www.youtube.com/channel/UCdRQdldwQPFPoMr5N-FwIkQ",
  tiktok: "https://www.tiktok.com/@opr_uk",
} as const;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const key = body.key;
  if (typeof key !== "string" || !(key in knownLinks)) {
    return new Response(null, { status: 400 });
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return new Response(null, { status: 204 });
  }

  const attribution = normaliseAttribution(body.attribution);
  const { error } = await client.from("link_clicks").insert({
    link_key: key,
    destination: knownLinks[key as keyof typeof knownLinks],
    source: attribution.source,
    utm_source: attribution.utmSource,
    utm_medium: attribution.utmMedium,
    utm_campaign: attribution.utmCampaign,
  });

  if (error) console.error("OPR link click could not be recorded", error);

  return new Response(null, { status: 204 });
}
