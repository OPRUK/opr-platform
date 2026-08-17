import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnalyticsEventKey, Attribution } from "./attribution";

export async function recordAnalyticsEvent(
  client: SupabaseClient,
  {
    eventKey,
    pagePath,
    destination,
    attribution,
  }: {
    eventKey: AnalyticsEventKey;
    pagePath: string;
    destination: string | null;
    attribution: Attribution;
  },
) {
  const { error } = await client.from("site_events").insert({
    event_key: eventKey,
    page_path: pagePath,
    destination,
    source: attribution.source,
    utm_source: attribution.utmSource,
    utm_medium: attribution.utmMedium,
    utm_campaign: attribution.utmCampaign,
  });

  if (error) {
    // Analytics is deliberately non-blocking: a tracking problem must never
    // undo a recipe submission or a place at the table.
    console.error("OPR analytics event could not be recorded", error);
  }
}
