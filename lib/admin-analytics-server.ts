import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { attributionSources } from "./attribution";
import { getSearchConsoleSummary } from "./google-search-console";
import { getYouTubeSummary } from "./youtube";
import { getInstagramSummary } from "./instagram";
import { getTikTokSummary } from "./tiktok";
import { getPinterestSummary } from "./pinterest";
import { getLinkedInSummary } from "./linkedin";
import { getFacebookSummary } from "./facebook";
import { getVercelAnalyticsSummary } from "./vercel-analytics";
import { analyticsReport } from "./analytics-report-data";
import { loadLatestDailySnapshot } from "./analytics-daily-snapshots";
import type {
  AdminAnalyticsResponse,
  AnalyticsParticipationMetric,
  AnalyticsCampaignSummary,
  AnalyticsSnapshot,
  AnalyticsSourceSummary,
} from "./admin-analytics-types";
import type { AnalyticsReport } from "./analytics-report-types";

const conversionEvents = new Set([
  "join_table_success",
  "recipe_submission_success",
]);

const currentRecommendations: AnalyticsSnapshot["recommendations"] = [
  {
    title: "Increase Google visibility",
    evidence: "OPR earns clicks when its recipes appear in search; the continuing constraint is broader non-brand discovery, not a site redesign.",
    action: "Expand verified recipe coverage, strengthen contextual links between related stories and earn relevant links directly to individual recipe pages.",
  },
  {
    title: "Turn exploration into action",
    evidence: "Visitors explore several pages, and first-party source, campaign and conversion reporting can now show what happens next.",
    action: "Keep one clear primary action on each important page and compare its source, campaign and conversion totals at every complete calendar-month close.",
  },
  {
    title: "Build independent authority",
    evidence: "The original Search Console baseline showed a very thin independent backlink profile despite healthy technical SEO and encouraging engagement.",
    action: "Give contributors, local press, food-history organisations and community groups a relevant recipe URL and a simple request to link to it.",
  },
];

function withCurrentRecommendations(snapshot: AnalyticsSnapshot | null): AnalyticsSnapshot | null {
  return snapshot ? { ...snapshot, recommendations: currentRecommendations } : snapshot;
}

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

async function getSnapshot(client: SupabaseClient): Promise<AnalyticsSnapshot | null> {
  const savedSnapshot = await loadLatestDailySnapshot(client);
  if (savedSnapshot) return savedSnapshot;

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
      google: { ...snapshot.google, fetchedAt: null },
      social: snapshot.social.map((platform) => ({ ...platform, fetchedAt: null })),
    } as AnalyticsSnapshot;
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

async function withLiveYouTube(snapshot: AnalyticsSnapshot | null): Promise<AnalyticsSnapshot | null> {
  if (!snapshot) return snapshot;

  const live = await getYouTubeSummary();
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

async function withLiveInstagram(snapshot: AnalyticsSnapshot | null): Promise<AnalyticsSnapshot | null> {
  if (!snapshot) return snapshot;

  const live = await getInstagramSummary();
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

async function withLiveTikTok(snapshot: AnalyticsSnapshot | null): Promise<AnalyticsSnapshot | null> {
  if (!snapshot) return snapshot;

  const live = await getTikTokSummary();
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

async function withLivePinterest(snapshot: AnalyticsSnapshot | null): Promise<AnalyticsSnapshot | null> {
  if (!snapshot) return snapshot;

  const live = await getPinterestSummary();
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

function withLatestPinterestSnapshot(snapshot: AnalyticsSnapshot | null): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;

  return {
    ...snapshot,
    social: snapshot.social.map((platform) =>
      platform.platform.toLowerCase() === "pinterest"
        ? {
            ...platform,
            period: "22 Jul–21 Aug 2026",
            exposureLabel: "Impressions",
            exposures: 256,
            interactions: 11,
            followers: null,
            profileVisits: null,
            outboundClicks: 1,
            fetchedAt: null,
          }
        : platform,
    ),
  };
}

async function withCurrentPinterest(snapshot: AnalyticsSnapshot | null): Promise<AnalyticsSnapshot | null> {
  // Pinterest returns null until the app's trial access is approved. Once the
  // credentials work, the live figures take over automatically.
  return withLivePinterest(withLatestPinterestSnapshot(snapshot));
}

function withLatestFacebookSnapshot(snapshot: AnalyticsSnapshot | null): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;

  return {
    ...snapshot,
    social: snapshot.social.map((platform) =>
      platform.platform.toLowerCase() === "facebook"
        ? {
            ...platform,
            period: "24 Jul–20 Aug 2026",
            exposureLabel: "Views",
            exposures: 6600,
            interactions: 402,
            followers: 53,
            profileVisits: 344,
            outboundClicks: null,
            fetchedAt: null,
          }
        : platform,
    ),
  };
}

async function withLiveFacebook(snapshot: AnalyticsSnapshot | null): Promise<AnalyticsSnapshot | null> {
  if (!snapshot) return snapshot;
  const live = await getFacebookSummary();
  if (!live) return snapshot;

  return {
    ...snapshot,
    social: snapshot.social.map((platform) =>
      platform.platform.toLowerCase() === "facebook"
        ? {
            ...platform,
            period: live.period,
            exposureLabel: "Views",
            exposures: live.views28d,
            interactions: live.interactions28d,
            followers: live.followers,
            profileVisits: live.profileVisits28d,
            fetchedAt: live.fetchedAt,
          }
        : platform,
    ),
  };
}

function withLatestYouTubeSnapshot(snapshot: AnalyticsSnapshot | null): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;

  return {
    ...snapshot,
    social: snapshot.social.map((platform) =>
      platform.platform.toLowerCase() === "youtube"
        ? {
            ...platform,
            period: "24 Jul–20 Aug 2026",
            exposureLabel: "Views",
            exposures: 223,
            interactions: 2,
            followers: 9,
            profileVisits: null,
            outboundClicks: null,
            fetchedAt: null,
          }
        : platform,
    ),
  };
}

function withLatestInstagramSnapshot(snapshot: AnalyticsSnapshot | null): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;

  return {
    ...snapshot,
    social: snapshot.social.map((platform) =>
      platform.platform.toLowerCase() === "instagram"
        ? {
            ...platform,
            period: "Last 30 days to 21 Aug 2026",
            exposureLabel: "Views",
            exposures: 4838,
            interactions: 356,
            followers: 68,
            profileVisits: 230,
            outboundClicks: 2,
            fetchedAt: null,
          }
        : platform,
    ),
  };
}

function withLatestTikTokSnapshot(snapshot: AnalyticsSnapshot | null): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;

  return {
    ...snapshot,
    social: snapshot.social.map((platform) =>
      platform.platform.toLowerCase() === "tiktok"
        ? {
            ...platform,
            period: "Last 28 days to 21 Aug 2026",
            exposureLabel: "Views",
            exposures: 5300,
            interactions: 44,
            followers: 4,
            profileVisits: 21,
            outboundClicks: null,
            fetchedAt: null,
          }
        : platform,
    ),
  };
}

async function withLiveLinkedIn(snapshot: AnalyticsSnapshot | null): Promise<AnalyticsSnapshot | null> {
  if (!snapshot) return snapshot;

  const live = await getLinkedInSummary();
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

async function withLiveWebsiteSnapshot(snapshot: AnalyticsSnapshot | null): Promise<AnalyticsSnapshot | null> {
  if (!snapshot) return snapshot;

  const live = await getVercelAnalyticsSummary();
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

async function withLiveWebsiteReport(report: AnalyticsReport): Promise<AnalyticsReport> {
  const live = await getVercelAnalyticsSummary();
  if (!live) return report;

  const pagesPerVisitor = live.visitors > 0 ? live.pageviews / live.visitors : 0;

  return {
    ...report,
    executiveSummary: {
      ...report.executiveSummary,
      kpis: report.executiveSummary.kpis.map((row) => {
        if (row.label === "Website visitors · 30d") return { ...row, value: live.visitors.toLocaleString("en-GB") };
        if (row.label === "Page views · 30d") return { ...row, value: live.pageviews.toLocaleString("en-GB") };
        return row;
      }),
    },
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
  _options?: { forceRefresh?: boolean },
): Promise<AdminAnalyticsResponse> {
  const since90Days = new Date();
  since90Days.setUTCDate(since90Days.getUTCDate() - 90);
  const since30Days = new Date();
  since30Days.setUTCDate(since30Days.getUTCDate() - 30);

  const [clickResult, eventResult, participation] = await Promise.all([
    client
      .from("link_clicks")
      .select("source, link_key, utm_campaign")
      .gte("created_at", since90Days.toISOString())
      .limit(10_000),
    client
      .from("site_events")
      .select("source, event_key, utm_campaign")
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

  const campaignSummaries = new Map<string, AnalyticsCampaignSummary>();
  const ensureCampaign = (campaign: string | null, source: string | null) => {
    const campaignLabel = campaign ?? "unattributed";
    const sourceLabel = source ?? "unattributed";
    const key = `${sourceLabel}:${campaignLabel}`;
    const existing = campaignSummaries.get(key);
    if (existing) return existing;

    const summary = {
      campaign: campaignLabel,
      source: sourceLabel,
      linkClicks: 0,
      ctaClicks: 0,
      conversions: 0,
    };
    campaignSummaries.set(key, summary);
    return summary;
  };

  for (const click of clickResult.data ?? []) {
    ensureCampaign(click.utm_campaign, click.source).linkClicks += 1;
  }

  for (const event of eventResult.data ?? []) {
    const summary = ensureCampaign(event.utm_campaign, event.source);
    if (conversionEvents.has(event.event_key)) summary.conversions += 1;
    else summary.ctaClicks += 1;
  }

  const campaigns = Array.from(campaignSummaries.values()).sort((a, b) => {
    const bTotal = b.linkClicks + b.ctaClicks + b.conversions;
    const aTotal = a.linkClicks + a.ctaClicks + a.conversions;
    return bTotal - aTotal || a.campaign.localeCompare(b.campaign);
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
    campaigns,
    participation,
    snapshot: await withLiveLinkedIn(
      await withLiveWebsiteSnapshot(
        await withCurrentPinterest(
          await withLiveFacebook(withLatestFacebookSnapshot(
            await withLiveTikTok(
              withLatestTikTokSnapshot(
                await withLiveInstagram(
                  withLatestInstagramSnapshot(
                    await withLiveYouTube(
                      withLatestYouTubeSnapshot(await withLiveSearchConsole(withCurrentRecommendations(await getSnapshot(client)))),
                    ),
                  ),
                ),
              ),
            ),
          )),
        ),
      ),
    ),
    report: await withLiveWebsiteReport(analyticsReport),
  };
}
