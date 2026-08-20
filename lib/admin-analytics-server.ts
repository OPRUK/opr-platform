import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { attributionSources } from "./attribution";
import { getSearchConsoleSummary, type SearchConsoleSummary } from "./google-search-console";
import { getYouTubeSummary, type YouTubeSummary } from "./youtube";
import { getInstagramSummary, type InstagramSummary } from "./instagram";
import { getTikTokSummary, type TikTokSummary } from "./tiktok";
import { getPinterestSummary, type PinterestSummary } from "./pinterest";
import { getLinkedInSummary, type LinkedInSummary } from "./linkedin";
import { getVercelAnalyticsSummary, type VercelAnalyticsSummary } from "./vercel-analytics";
import { getPageSpeedSummary, type PageSpeedSummary } from "./pagespeed";
import { analyticsReport } from "./analytics-report-data";
import type {
  AdminAnalyticsResponse,
  AnalyticsParticipationMetric,
  AnalyticsSnapshot,
  AnalyticsSourceSummary,
} from "./admin-analytics-types";
import type { AnalyticsReport } from "./analytics-report-types";

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

const analyticsPageSize = 1_000;

async function loadAnalyticsRows<T extends Record<string, unknown>>(
  client: SupabaseClient,
  table: "link_clicks" | "site_events",
  columns: string,
  since: string,
): Promise<{ data: T[]; error: unknown | null }> {
  const data: T[] = [];

  for (let from = 0; ; from += analyticsPageSize) {
    const result = await client
      .from(table)
      .select(columns)
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .range(from, from + analyticsPageSize - 1);

    if (result.error) return { data, error: result.error };
    const page = (result.data ?? []) as unknown as T[];
    data.push(...page);
    if (page.length < analyticsPageSize) break;
  }

  return { data, error: null };
}

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
    // The stored JSON predates the fetchedAt fields, so they're never present
    // on the raw manual snapshot — normalise them explicitly rather than
    // leaving them undefined, which the AnalyticsSnapshot type doesn't allow.
    return {
      ...snapshot,
      website: { ...snapshot.website, fetchedAt: null },
      google: { ...snapshot.google, fetchedAt: null, provisionalFrom: null },
      social: snapshot.social.map((platform) => ({ ...platform, fetchedAt: null })),
    } as AnalyticsSnapshot;
  } catch (error) {
    console.error("OPR analytics snapshot could not be read", error);
    return null;
  }
}

function withLiveSearchConsole(
  snapshot: AnalyticsSnapshot | null,
  live: SearchConsoleSummary | null,
): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;
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
      provisionalFrom: live.provisionalFrom,
      fetchedAt: live.fetchedAt,
    },
  };
}

function withLiveYouTube(
  snapshot: AnalyticsSnapshot | null,
  live: YouTubeSummary | null,
): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;
  if (!live) return snapshot;

  return {
    ...snapshot,
    social: snapshot.social.map((platform) =>
      platform.platform.toLowerCase() === "youtube"
        ? {
            ...platform,
            period: live.period,
            exposureLabel: "Views",
            exposures: live.views28d,
            followers: live.subscribers,
            fetchedAt: live.fetchedAt,
          }
        : platform,
    ),
  };
}

function withLiveInstagram(
  snapshot: AnalyticsSnapshot | null,
  live: InstagramSummary | null,
): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;
  if (!live) return snapshot;

  return {
    ...snapshot,
    social: snapshot.social.map((platform) =>
      platform.platform.toLowerCase() === "instagram"
        ? {
            ...platform,
            period: live.period,
            exposureLabel: "Views",
            exposures: live.views28d,
            followers: live.followers,
            profileVisits: live.profileViews28d,
            fetchedAt: live.fetchedAt,
          }
        : platform,
    ),
  };
}

function withLiveTikTok(
  snapshot: AnalyticsSnapshot | null,
  live: TikTokSummary | null,
): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;
  if (!live) return snapshot;

  return {
    ...snapshot,
    social: snapshot.social.map((platform) =>
      platform.platform.toLowerCase() === "tiktok"
        ? {
            ...platform,
            period: live.period,
            exposureLabel: "Views",
            exposures: live.views28d,
            followers: live.followers,
            fetchedAt: live.fetchedAt,
          }
        : platform,
    ),
  };
}

function withLivePinterest(
  snapshot: AnalyticsSnapshot | null,
  live: PinterestSummary | null,
): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;
  if (!live) return snapshot;

  return {
    ...snapshot,
    social: snapshot.social.map((platform) =>
      platform.platform.toLowerCase() === "pinterest"
        ? {
            ...platform,
            period: live.period,
            exposureLabel: "Impressions",
            exposures: live.impressions28d,
            followers: live.followers,
            outboundClicks: live.outboundClicks28d,
            fetchedAt: live.fetchedAt,
          }
        : platform,
    ),
  };
}

function withLiveLinkedIn(
  snapshot: AnalyticsSnapshot | null,
  live: LinkedInSummary | null,
): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;
  if (!live) return snapshot;

  const hasLinkedIn = snapshot.social.some((platform) => platform.platform.toLowerCase() === "linkedin");

  const linkedInRow = {
    platform: "LinkedIn",
    period: live.period,
    exposureLabel: "Impressions",
    exposures: live.impressions28d,
    interactions: null,
    followers: live.followers,
    profileVisits: null,
    outboundClicks: live.clicks28d,
    websiteVisitors: null,
    fetchedAt: live.fetchedAt,
  };

  return {
    ...snapshot,
    social: hasLinkedIn
      ? snapshot.social.map((platform) =>
          platform.platform.toLowerCase() === "linkedin" ? { ...platform, ...linkedInRow } : platform,
        )
      : [...snapshot.social, linkedInRow],
  };
}

function withLiveWebsiteSnapshot(
  snapshot: AnalyticsSnapshot | null,
  live: VercelAnalyticsSummary | null,
): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;
  if (!live) return snapshot;

  return {
    ...snapshot,
    website: {
      ...snapshot.website,
      period: live.period,
      visitors: live.visitors,
      pageViews: live.pageviews,
      pagesPerVisitor: live.visitors > 0 ? live.pageviews / live.visitors : 0,
      fetchedAt: live.fetchedAt,
    },
  };
}

function withLiveWebsiteReport(
  report: AnalyticsReport,
  live: VercelAnalyticsSummary | null,
): AnalyticsReport {
  if (!live) return report;

  const pagesPerVisitor = live.visitors > 0 ? live.pageviews / live.visitors : 0;

  return {
    ...report,
    website: {
      ...report.website,
      period: live.period,
      core: report.website.core.map((row) => {
        if (row.metric === "Visitors") return { ...row, last30Days: live.visitors };
        if (row.metric === "Page views") return { ...row, last30Days: live.pageviews };
        if (row.metric === "Pages per visitor") return { ...row, last30Days: Number(pagesPerVisitor.toFixed(2)) };
        return row;
      }),
      audienceCountry: live.audienceCountry.length
        ? live.audienceCountry.map((row) => ({ country: row.label, share: row.share, visitors: row.visitors }))
        : report.website.audienceCountry,
      audienceDevice: live.audienceDevice.length
        ? live.audienceDevice.map((row) => ({ device: row.label, share: row.share }))
        : report.website.audienceDevice,
      audienceOS: live.audienceOS.length
        ? live.audienceOS.map((row) => ({ os: row.label, share: row.share, visitors: row.visitors }))
        : report.website.audienceOS,
      fetchedAt: live.fetchedAt,
    },
  };
}

function withLivePageSpeedReport(
  report: AnalyticsReport,
  live: PageSpeedSummary | null,
): AnalyticsReport {
  if (!live) return report;

  return {
    ...report,
    seoTechnical: {
      ...report.seoTechnical,
      pageSpeed: live.metrics,
      pageSpeedMeta: {
        testedUrl: live.testedUrl,
        strategy: live.strategy,
        fetchedAt: live.fetchedAt,
        lighthouseVersion: live.lighthouseVersion,
      },
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
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<AdminAnalyticsResponse> {
  const since90Days = new Date();
  since90Days.setUTCDate(since90Days.getUTCDate() - 90);
  const since30Days = new Date();
  since30Days.setUTCDate(since30Days.getUTCDate() - 30);

  const liveOptions = { forceRefresh };
  const [
    clickResult,
    eventResult,
    participation,
    searchConsole,
    youtube,
    instagram,
    tiktok,
    pinterest,
    linkedin,
    vercel,
    pageSpeed,
  ] = await Promise.all([
    loadAnalyticsRows<{ source: string | null; link_key: string }>(
      client,
      "link_clicks",
      "source, link_key",
      since90Days.toISOString(),
    ),
    loadAnalyticsRows<{ source: string | null; event_key: string }>(
      client,
      "site_events",
      "source, event_key",
      since90Days.toISOString(),
    ),
    loadParticipation(client, since30Days.toISOString()),
    getSearchConsoleSummary(liveOptions),
    getYouTubeSummary(liveOptions),
    getInstagramSummary(liveOptions),
    getTikTokSummary(liveOptions),
    getPinterestSummary(liveOptions),
    getLinkedInSummary(liveOptions),
    getVercelAnalyticsSummary(liveOptions),
    getPageSpeedSummary(liveOptions),
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

  const snapshot = withLiveLinkedIn(
    withLiveWebsiteSnapshot(
      withLivePinterest(
        withLiveTikTok(
          withLiveInstagram(
            withLiveYouTube(withLiveSearchConsole(getSnapshot(), searchConsole), youtube),
            instagram,
          ),
          tiktok,
        ),
        pinterest,
      ),
      vercel,
    ),
    linkedin,
  );

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
    snapshot,
    report: withLivePageSpeedReport(
      withLiveWebsiteReport(analyticsReport, vercel),
      pageSpeed,
    ),
  };
}
