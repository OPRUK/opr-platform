import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { attributionSources } from "./attribution";
import { getSearchConsoleSummary } from "./google-search-console";
import { analyticsReport } from "./analytics-report-data";
import type {
  AdminAnalyticsResponse,
  AnalyticsParticipationMetric,
  AnalyticsSnapshot,
  AnalyticsSourceSummary,
} from "./admin-analytics-types";

const conversionEvents = new Set([
  "join_table_success",
  "recipe_submission_success",
]);

const participationTables: Array<{
  key: AnalyticsParticipationMetric["key"];
  label: string;
  table: string;
}> = [
  { key: "table", label: "Table sign-ups", table: "founding_table_members" },
  { key: "recipes", label: "Recipe submissions", table: "recipe_submissions" },
  { key: "votes", label: "Recipe votes", table: "recipe_month_votes" },
  { key: "community", label: "Community cooks", table: "recipe_community_cooks" },
];

function getSnapshot(): AnalyticsSnapshot | null {
  const encoded = process.env.OPR_ANALYTICS_SNAPSHOT;
  if (!encoded) return null;

  try {
    const snapshot = JSON.parse(encoded) as Partial<AnalyticsSnapshot>;
    if (
      typeof snapshot.capturedAt !== "string" ||
      typeof snapshot.title !== "string" ||
      !snapshot.website ||
      !snapshot.google ||
      !Array.isArray(snapshot.social) ||
      !Array.isArray(snapshot.recommendations)
    ) {
      throw new Error("The analytics snapshot is incomplete.");
    }
    // The stored JSON predates the fetchedAt field, so it's never present
    // on the raw manual snapshot — normalise it explicitly rather than
    // leaving it undefined, which the AnalyticsSnapshot type doesn't allow.
    return { ...snapshot, google: { ...snapshot.google, fetchedAt: null } } as AnalyticsSnapshot;
  } catch (error) {
    console.error("OPR analytics snapshot could not be read", error);
    return null;
  }
}

async function withLiveSearchConsole(snapshot: AnalyticsSnapshot | null): Promise<AnalyticsSnapshot | null> {
  if (!snapshot) return snapshot;

  const live = await getSearchConsoleSummary();
  if (!live) return snapshot;

  return {
    ...snapshot,
    google: {
      ...snapshot.google,
      period: live.period,
      clicks: live.clicks,
      impressions: live.impressions,
      ctr: live.ctr,
      averagePosition: live.averagePosition,
      fetchedAt: live.fetchedAt,
    },
  };
}

async function loadParticipation(
  client: SupabaseClient,
  since30Days: string,
): Promise<AnalyticsParticipationMetric[]> {
  return Promise.all(
    participationTables.map(async ({ key, label, table }) => {
      const [allTimeResult, recentResult] = await Promise.all([
        client.from(table).select("*", { count: "exact", head: true }),
        client
          .from(table)
          .select("*", { count: "exact", head: true })
          .gte("created_at", since30Days),
      ]);

      if (allTimeResult.error || recentResult.error) {
        console.error(
          `OPR analytics participation count could not load for ${table}`,
          allTimeResult.error ?? recentResult.error,
        );
      }

      return {
        key,
        label,
        allTime: allTimeResult.error ? null : allTimeResult.count ?? 0,
        last30Days: recentResult.error ? null : recentResult.count ?? 0,
      };
    }),
  );
}

export async function loadAdminAnalytics(
  client: SupabaseClient,
): Promise<AdminAnalyticsResponse> {
  const since90Days = new Date();
  since90Days.setUTCDate(since90Days.getUTCDate() - 90);
  const since30Days = new Date();
  since30Days.setUTCDate(since30Days.getUTCDate() - 30);

  const [clickResult, eventResult, participation] = await Promise.all([
    client
      .from("link_clicks")
      .select("source, link_key")
      .gte("created_at", since90Days.toISOString())
      .limit(10_000),
    client
      .from("site_events")
      .select("source, event_key")
      .gte("created_at", since90Days.toISOString())
      .limit(10_000),
    loadParticipation(client, since30Days.toISOString()),
  ]);

  if (clickResult.error || eventResult.error) {
    throw clickResult.error ?? eventResult.error;
  }

  const summaries = new Map<string, AnalyticsSourceSummary>();
  const ensureSource = (source: string | null) => {
    const label = source ?? "unattributed";
    const existing = summaries.get(label);
    if (existing) return existing;

    const summary = {
      source: label,
      linkClicks: 0,
      ctaClicks: 0,
      conversions: 0,
    };
    summaries.set(label, summary);
    return summary;
  };

  for (const source of attributionSources) ensureSource(source);

  for (const click of clickResult.data ?? []) {
    ensureSource(click.source).linkClicks += 1;
  }

  for (const event of eventResult.data ?? []) {
    const summary = ensureSource(event.source);
    if (conversionEvents.has(event.event_key)) summary.conversions += 1;
    else summary.ctaClicks += 1;
  }

  const sources = Array.from(summaries.values())
    .filter(
      (summary) =>
        summary.source !== "unattributed" ||
        summary.linkClicks + summary.ctaClicks + summary.conversions > 0,
    )
    .sort((a, b) => {
      const bTotal = b.linkClicks + b.ctaClicks + b.conversions;
      const aTotal = a.linkClicks + a.ctaClicks + a.conversions;
      return bTotal - aTotal || a.source.localeCompare(b.source);
    });

  return {
    generatedAt: new Date().toISOString(),
    windowDays: 90,
    linkClicks: clickResult.data?.length ?? 0,
    ctaClicks: (eventResult.data ?? []).filter(
      (event) => !conversionEvents.has(event.event_key),
    ).length,
    conversions: (eventResult.data ?? []).filter((event) =>
      conversionEvents.has(event.event_key),
    ).length,
    sources,
    participation,
    snapshot: await withLiveSearchConsole(getSnapshot()),
    report: analyticsReport,
  };
}
