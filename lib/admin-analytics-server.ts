import "server-only";

import { countryName } from "@/lib/country-names";

import type { SupabaseClient } from "@supabase/supabase-js";
import { attributionSources } from "./attribution";
import { getSearchConsoleSummary, type SearchConsoleSummary } from "./google-search-console";
import { getYouTubeSummary } from "./youtube";
import { getInstagramSummary } from "./instagram";
import { getTikTokSummary } from "./tiktok";
import { getPinterestFilmViews, getPinterestSummary } from "./pinterest";
import { getLinkedInSummary } from "./linkedin";
import { getFacebookSummary } from "./facebook";
import { getVercelAnalyticsSummary } from "./vercel-analytics";
import { getPageSpeedSummary, type PageSpeedSummary } from "./pagespeed";
import { analyticsReport } from "./analytics-report-data";
import { loadLatestDailySnapshot } from "./analytics-daily-snapshots";
import { films, filmUploadDate } from "./films";
import { featuredRecipes } from "./recipes";
import { buildDashboardPriorities } from "./dashboard-priorities";
import { buildSubmissionFunnel } from "./submission-funnel";
import {
  facebookFilmViews,
  instagramFilmViews,
  matchSocialFilmId,
  matchSocialFilmTitle,
  pinterestFilmImpressions,
  socialFilmAuditCapturedAt,
  tiktokFilmViews,
  youtubeFilmViews,
} from "./social-film-matching";
import type {
  AdminAnalyticsResponse,
  AnalyticsParticipationMetric,
  AnalyticsCampaignSummary,
  AnalyticsFilmSummary,
  AnalyticsSocialFilmSummary,
  SocialConnectionStatus,
  UnmatchedSocialPost,
  AnalyticsSnapshot,
  AnalyticsSourceSummary,
} from "./admin-analytics-types";
import type { AnalyticsReport } from "./analytics-report-types";

const conversionEvents = new Set([
  "join_table_success",
  "recipe_submission_success",
]);

const submissionFunnelEvents = new Set([
  "recipe_submission_started",
  "recipe_submission_progress",
  "recipe_submission_attempt",
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
      pageSpeed: snapshot.pageSpeed ?? null,
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
            period: "1 Aug–25 Aug 2026",
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

async function withLiveReport(
  report: AnalyticsReport,
  snapshot: AnalyticsSnapshot | null,
  pageSpeed: PageSpeedSummary | null,
  searchConsole: SearchConsoleSummary | null,
): Promise<AnalyticsReport> {
  const live = await getVercelAnalyticsSummary();
  const pagesPerVisitor = live && live.visitors > 0 ? live.pageviews / live.visitors : snapshot?.website.pagesPerVisitor ?? 0;
  const socialExposures = snapshot?.social.reduce((total, platform) => total + platform.exposures, 0) ?? null;

  return {
    ...report,
    executiveSummary: {
      ...report.executiveSummary,
      kpis: report.executiveSummary.kpis.map((row) => {
        if (row.label === "Website visitors · 30d" && snapshot) return { ...row, value: snapshot.website.visitors.toLocaleString("en-GB") };
        if (row.label === "Page views · 30d" && snapshot) return { ...row, value: snapshot.website.pageViews.toLocaleString("en-GB") };
        if (row.label === "Google clicks" && snapshot) return { ...row, value: snapshot.google.clicks.toLocaleString("en-GB") };
        if (row.label === "Google CTR" && snapshot) return { ...row, value: `${(snapshot.google.ctr * 100).toFixed(1)}%` };
        if (row.label === "Indexed pages" && snapshot) return { ...row, value: snapshot.google.indexedPages.toLocaleString("en-GB") };
        if (row.label === "Social exposures*" && socialExposures !== null) return { ...row, value: socialExposures.toLocaleString("en-GB") };
        if (row.label === "Mobile SEO score" && pageSpeed) return { ...row, value: String(pageSpeed.metrics.find((metric) => metric.metric === "SEO")?.value ?? row.value) };
        if (row.label === "Accessibility score" && pageSpeed) return { ...row, value: String(pageSpeed.metrics.find((metric) => metric.metric === "Accessibility")?.value ?? row.value) };
        return row;
      }),
      whatTheNumbersSay: report.executiveSummary.whatTheNumbersSay.map((row) => {
        if (row.area === "Website" && snapshot) return {
          ...row,
          evidence: `${snapshot.website.visitors.toLocaleString("en-GB")} visitors generated ${snapshot.website.pageViews.toLocaleString("en-GB")} page views; ${pagesPerVisitor.toFixed(2)} pages per visitor.`,
          meaning: "Current visitors continue to explore beyond a single page.",
        };
        if (row.area === "Google Search" && snapshot) return {
          ...row,
          evidence: `${snapshot.google.clicks.toLocaleString("en-GB")} clicks from ${snapshot.google.impressions.toLocaleString("en-GB")} impressions; ${(snapshot.google.ctr * 100).toFixed(1)}% CTR; average position ${snapshot.google.averagePosition.toFixed(1)}.`,
          meaning: "Current Search Console totals show whether visibility is expanding.",
        };
        if (row.area === "Technical SEO" && pageSpeed) return {
          ...row,
          evidence: `Latest live mobile Lighthouse scores: performance ${pageSpeed.metrics.find((metric) => metric.metric === "Performance")?.value ?? "—"}, accessibility ${pageSpeed.metrics.find((metric) => metric.metric === "Accessibility")?.value ?? "—"}, SEO ${pageSpeed.metrics.find((metric) => metric.metric === "SEO")?.value ?? "—"}.`,
        };
        return row;
      }),
    },
    website: {
      ...report.website,
      period: live?.period ?? snapshot?.website.period ?? report.website.period,
      core: report.website.core.map((row) => {
        if (row.metric === "Visitors" && snapshot) return { ...row, last30Days: snapshot.website.visitors };
        if (row.metric === "Page views" && snapshot) return { ...row, last30Days: snapshot.website.pageViews };
        if (row.metric === "Pages per visitor") return { ...row, last30Days: Number(pagesPerVisitor.toFixed(2)) };
        if (row.metric === "Bounce rate" && snapshot) return { ...row, last30Days: snapshot.website.bounceRate };
        return row;
      }),
      topPages: live?.topPages.length
        ? live.topPages.map((row) => {
            const previous = report.website.topPages.find((page) => page.path === row.label);
            return {
              path: row.label,
              visitors: row.visitors,
              role: previous?.role ?? "Current traffic page",
              seoNote: previous?.seoNote ?? "Review its primary action and internal links.",
            };
          })
        : report.website.topPages,
      topReferrers: live?.topReferrers.length
        ? live.topReferrers.map((row) => {
            const previous = report.website.topReferrers.find((referrer) => referrer.host === row.label);
            return {
              host: row.label,
              visitors: row.visitors,
              channel: previous?.channel ?? "Referral",
              observation: previous?.observation ?? "Current Vercel referral traffic.",
              action: previous?.action ?? "Retain source and campaign coding on shared links.",
            };
          })
        : report.website.topReferrers,
      audienceCountry: live?.audienceCountry.length
        ? live.audienceCountry.map((row) => ({
            country: countryName(row.label),
            share: row.share,
            visitors: row.visitors,
          }))
        : report.website.audienceCountry,
      audienceDevice: live?.audienceDevice.length
        ? live.audienceDevice.map((row) => ({ device: row.label, share: row.share }))
        : report.website.audienceDevice,
      audienceOS: live?.audienceOS.length
        ? live.audienceOS.map((row) => ({ os: row.label, share: row.share, visitors: row.visitors }))
        : report.website.audienceOS,
      fetchedAt: live?.fetchedAt ?? snapshot?.website.fetchedAt ?? report.website.fetchedAt,
    },
    googleSearch: snapshot ? {
      ...report.googleSearch,
      period: snapshot.google.period,
      kpis: report.googleSearch.kpis.map((row) => {
        if (row.metric === "Clicks") return { ...row, value: snapshot.google.clicks };
        if (row.metric === "Impressions") return { ...row, value: snapshot.google.impressions };
        if (row.metric === "CTR") return { ...row, value: snapshot.google.ctr };
        if (row.metric === "Average position") return { ...row, value: snapshot.google.averagePosition };
        if (row.metric === "Indexed pages") return { ...row, value: snapshot.google.indexedPages };
        return row;
      }),
      daily: searchConsole?.daily.length
        ? searchConsole.daily.map((row) => ({
            date: row.label,
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
          }))
        : report.googleSearch.daily,
      queries: searchConsole?.queries.length
        ? searchConsole.queries.map((row) => ({ query: row.label, clicks: row.clicks, impressions: row.impressions }))
        : report.googleSearch.queries,
      pages: searchConsole?.pages.length
        ? searchConsole.pages.map((row) => ({ page: row.label, clicks: row.clicks, impressions: row.impressions }))
        : report.googleSearch.pages,
      countries: searchConsole?.countries.length
        ? searchConsole.countries.map((row) => ({
            country: countryName(row.label),
            clicks: row.clicks,
            impressions: row.impressions,
          }))
        : report.googleSearch.countries,
      devices: searchConsole?.devices.length
        ? searchConsole.devices.map((row) => ({ device: row.label, clicks: row.clicks, impressions: row.impressions }))
        : report.googleSearch.devices,
      fetchedAt: searchConsole?.fetchedAt ?? report.googleSearch.fetchedAt,
    } : report.googleSearch,
    socialOverview: snapshot ? {
      ...report.socialOverview,
      platforms: report.socialOverview.platforms.map((row) => {
        const livePlatform = snapshot.social.find((platform) => platform.platform.toLowerCase() === row.platform.toLowerCase());
        if (!livePlatform) return row;
        const interactions = livePlatform.interactions ?? row.interactions;
        return {
          ...row,
          period: livePlatform.period,
          views: livePlatform.exposures,
          interactions,
          followers: livePlatform.followers,
          profileVisits: livePlatform.profileVisits,
          outboundClicks: livePlatform.outboundClicks,
          websiteVisitors: livePlatform.websiteVisitors,
          interactionRate: typeof interactions === "number" && livePlatform.exposures > 0
            ? interactions / livePlatform.exposures
            : row.interactionRate,
        };
      }),
    } : report.socialOverview,
    seoTechnical: pageSpeed ? {
      ...report.seoTechnical,
      pageSpeed: pageSpeed.metrics,
      pageSpeedMeta: {
        testedUrl: pageSpeed.testedUrl,
        strategy: pageSpeed.strategy,
        fetchedAt: pageSpeed.fetchedAt,
        lighthouseVersion: pageSpeed.lighthouseVersion,
      },
      structuredData: report.seoTechnical.structuredData.map((row) => row.area === "Core Web Vitals"
        ? {
            ...row,
            finding: "Live mobile Lighthouse lab data is refreshed automatically when the PageSpeed connection is available.",
            action: "Review Vercel Speed Insights and the daily Lighthouse trend at each month-end.",
          }
        : row),
    } : report.seoTechnical,
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

const filmTitleByVideo = new Map(films.map((film) => [film.video, film.title]));

function buildFilmViews(
  events: Array<{ event_key: string; destination: string | null }>,
): AnalyticsFilmSummary[] {
  const counts = new Map<string, { plays: number; completions: number }>();

  for (const event of events) {
    if (event.event_key !== "film_play" && event.event_key !== "film_watched") continue;
    if (!event.destination || !filmTitleByVideo.has(event.destination)) continue;

    const existing = counts.get(event.destination) ?? { plays: 0, completions: 0 };
    if (event.event_key === "film_play") existing.plays += 1;
    else existing.completions += 1;
    counts.set(event.destination, existing);
  }

  return Array.from(counts.entries())
    .map(([video, { plays, completions }]) => ({
      title: filmTitleByVideo.get(video) ?? video,
      video,
      plays,
      completions,
    }))
    .sort((a, b) => b.plays - a.plays || a.title.localeCompare(b.title));
}

type SocialPlatform = "facebook" | "instagram" | "tiktok" | "youtube" | "pinterest";
type PlatformFilm = { id?: string; title: string; views: number; publishedAt?: string };
type SavedSocialPost = {
  platform: SocialPlatform;
  post_id: string;
  film_video: string | null;
  post_title: string;
  metric_value: number;
  published_at: string | null;
  ignored: boolean;
};

function socialFilmTotals(
  rows: readonly PlatformFilm[],
  platform: string,
  stablePlatform?: SocialPlatform,
  savedMatches: Map<string, string> = new Map(),
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const title = (stablePlatform && row.id ? savedMatches.get(`${stablePlatform}:${row.id}`) : null)
      ?? (stablePlatform ? matchSocialFilmId(stablePlatform, row.id) : null)
      ?? matchSocialFilmTitle(row.title);
    if (!title) {
      console.warn(`OPR ${platform} film title needs matching: ${row.title.slice(0, 100)}`);
      continue;
    }
    totals.set(title, (totals.get(title) ?? 0) + row.views);
  }
  return totals;
}

// A film with no explicit uploadDate falls back to the earliest date we can
// verify it went live anywhere, rather than a shared placeholder — showing a
// fabricated-looking specific date for films we don't actually have one for
// is worse than admitting the date is unknown.
function earliestPublishedByTitle(rows: ReadonlyArray<{ id?: string; title: string; publishedAt?: string }>): Map<string, string> {
  const earliest = new Map<string, string>();
  for (const row of rows) {
    if (!row.publishedAt) continue;
    const title = matchSocialFilmId("youtube", row.id) ?? matchSocialFilmTitle(row.title);
    if (!title) continue;
    const existing = earliest.get(title);
    if (!existing || new Date(row.publishedAt).getTime() < new Date(existing).getTime()) {
      earliest.set(title, row.publishedAt);
    }
  }
  return earliest;
}

async function buildSocialFilmViews(
  client: SupabaseClient,
  website: AnalyticsFilmSummary[],
): Promise<{
  films: AnalyticsSocialFilmSummary[];
  unmatched: UnmatchedSocialPost[];
  connections: SocialConnectionStatus[];
}> {
  const [facebook, instagram, tiktok, youtube, pinterest] = await Promise.all([
    getFacebookSummary(),
    getInstagramSummary(),
    getTikTokSummary(),
    getYouTubeSummary(),
    getPinterestFilmViews(),
  ]);
  const savedResult = await client
    .from("social_film_posts")
    .select("platform, post_id, film_video, post_title, metric_value, published_at, ignored");
  const savedPosts = savedResult.error ? [] : (savedResult.data ?? []) as SavedSocialPost[];
  if (savedResult.error) console.error("OPR saved social-film mappings could not load", savedResult.error);
  const filmTitleByVideoPath = new Map(films.map((film) => [film.video, film.title]));
  const savedMatches = new Map(
    savedPosts.flatMap((row) => {
      const title = row.film_video ? filmTitleByVideoPath.get(row.film_video) : null;
      return title ? [[`${row.platform}:${row.post_id}`, title] as const] : [];
    }),
  );
  const ignoredPostIds = new Set(
    savedPosts.filter((row) => row.ignored).map((row) => `${row.platform}:${row.post_id}`),
  );
  const auditedSources = {
    facebook: socialFilmTotals(facebookFilmViews, "Facebook audit"),
    instagram: socialFilmTotals(instagramFilmViews, "Instagram audit"),
    tiktok: socialFilmTotals(tiktokFilmViews, "TikTok audit"),
    youtube: socialFilmTotals(youtubeFilmViews, "YouTube audit"),
    pinterest: socialFilmTotals(pinterestFilmImpressions, "Pinterest audit"),
  };
  const liveSources = {
    facebook: socialFilmTotals(facebook?.films ?? [], "Facebook", "facebook", savedMatches),
    instagram: socialFilmTotals(instagram?.films ?? [], "Instagram", "instagram", savedMatches),
    tiktok: socialFilmTotals(tiktok?.films ?? [], "TikTok", "tiktok", savedMatches),
    youtube: socialFilmTotals(youtube?.films ?? [], "YouTube", "youtube", savedMatches),
    pinterest: socialFilmTotals(pinterest?.films ?? [], "Pinterest", "pinterest", savedMatches),
  };
  const savedSources = Object.fromEntries(
    (["facebook", "instagram", "tiktok", "youtube", "pinterest"] as const).map((platform) => [
      platform,
      socialFilmTotals(
        savedPosts.filter((row) => row.platform === platform && row.film_video).map((row) => ({
          id: row.post_id,
          title: row.post_title,
          views: Number(row.metric_value),
        })),
        `${platform} saved actuals`,
        platform,
        savedMatches,
      ),
    ]),
  ) as Record<SocialPlatform, Map<string, number>>;
  const sources = {
    facebook: new Map([...auditedSources.facebook, ...savedSources.facebook, ...liveSources.facebook]),
    instagram: new Map([...auditedSources.instagram, ...savedSources.instagram, ...liveSources.instagram]),
    tiktok: new Map([...auditedSources.tiktok, ...savedSources.tiktok, ...liveSources.tiktok]),
    youtube: new Map([...auditedSources.youtube, ...savedSources.youtube, ...liveSources.youtube]),
    pinterest: new Map([...auditedSources.pinterest, ...savedSources.pinterest, ...liveSources.pinterest]),
  };
  const liveByPlatform: Record<SocialPlatform, PlatformFilm[]> = {
    facebook: facebook?.films ?? [], instagram: instagram?.films ?? [], tiktok: tiktok?.films ?? [],
    youtube: youtube?.films ?? [], pinterest: pinterest?.films ?? [],
  };
  const unmatched: UnmatchedSocialPost[] = [];
  const syncedRows: Array<Record<string, unknown>> = [];
  for (const [platform, rows] of Object.entries(liveByPlatform) as Array<[SocialPlatform, PlatformFilm[]]>) {
    for (const row of rows) {
      if (!row.id) continue;
      const matchedTitle = savedMatches.get(`${platform}:${row.id}`)
        ?? matchSocialFilmId(platform, row.id)
        ?? matchSocialFilmTitle(row.title);
      const matchedFilm = matchedTitle ? films.find((film) => film.title === matchedTitle) : null;
      if (!matchedFilm && !ignoredPostIds.has(`${platform}:${row.id}`)) {
        unmatched.push({ platform, postId: row.id, title: row.title, metricValue: row.views });
      }
      syncedRows.push({
        platform,
        post_id: row.id,
        film_video: matchedFilm?.video ?? null,
        post_title: row.title,
        metric_value: row.views,
        published_at: row.publishedAt ?? null,
        last_synced_at: new Date().toISOString(),
        ignored: ignoredPostIds.has(`${platform}:${row.id}`),
      });
    }
  }
  if (syncedRows.length) {
    const syncResult = await client.from("social_film_posts").upsert(syncedRows, {
      onConflict: "platform,post_id",
    });
    if (syncResult.error) console.error("OPR social-film actuals could not be saved", syncResult.error);
  }
  const websiteByTitle = new Map(website.map((row) => [row.title, row]));
  const youtubePublishedByTitle = earliestPublishedByTitle(youtube?.films ?? []);

  const filmRows = films.map((film) => {
    const site = websiteByTitle.get(film.title);
    const uploadDate = film.uploadDate ? filmUploadDate(film) : (youtubePublishedByTitle.get(film.title) ?? null);
    const daysOnline = uploadDate
      ? Math.max(0, Math.floor((Date.now() - new Date(uploadDate).getTime()) / (1000 * 60 * 60 * 24)))
      : null;
    return {
      title: film.title,
      video: film.video,
      plays: site?.plays ?? 0,
      completions: site?.completions ?? 0,
      facebookViews: sources.facebook.get(film.title) ?? null,
      instagramViews: sources.instagram.get(film.title) ?? null,
      tiktokViews: sources.tiktok.get(film.title) ?? null,
      youtubeViews: sources.youtube.get(film.title) ?? null,
      pinterestImpressions: sources.pinterest.get(film.title) ?? null,
      uploadDate,
      daysOnline,
    };
  });
  const connections: SocialConnectionStatus[] = (["facebook", "instagram", "tiktok", "youtube", "pinterest"] as const)
    .map((platform) => {
      const summary = { facebook, instagram, tiktok, youtube, pinterest }[platform];
      const unresolvedPosts = unmatched.filter((post) => post.platform === platform).length;
      return {
        platform,
        connected: Boolean(summary),
        fetchedAt: summary?.fetchedAt ?? null,
        matchedPosts: liveByPlatform[platform].length - unresolvedPosts,
        unresolvedPosts,
      };
    });
  return { films: filmRows, unmatched, connections };
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
      .select("source, event_key, utm_campaign, destination, page_path")
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
    else if (!submissionFunnelEvents.has(event.event_key)) summary.ctaClicks += 1;
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
    else if (!submissionFunnelEvents.has(event.event_key)) summary.ctaClicks += 1;
  }

  const campaigns = Array.from(campaignSummaries.values()).sort((a, b) => {
    const bTotal = b.linkClicks + b.ctaClicks + b.conversions;
    const aTotal = a.linkClicks + a.ctaClicks + a.conversions;
    return bTotal - aTotal || a.campaign.localeCompare(b.campaign);
  });

  const filmViews = buildFilmViews(eventResult.data ?? []);
  const submissionFunnel = buildSubmissionFunnel(eventResult.data ?? []);
  const socialFilmData = await buildSocialFilmViews(client, filmViews);
  const socialFilmViews = socialFilmData.films;

  const [snapshot, pageSpeed, searchConsole] = await Promise.all([
    withLiveLinkedIn(
      await withLiveWebsiteSnapshot(
        await withCurrentPinterest(
          await withLiveFacebook(withLatestFacebookSnapshot(
            await withLiveTikTok(
              withLatestTikTokSnapshot(
                await withLiveInstagram(
                  withLatestInstagramSnapshot(
                    await withLiveYouTube(
                      withLatestYouTubeSnapshot(await withLiveSearchConsole(await getSnapshot(client))),
                    ),
                  ),
                ),
              ),
            ),
          )),
        ),
      ),
    ),
    getPageSpeedSummary({ forceRefresh: _options?.forceRefresh ?? false }),
    getSearchConsoleSummary(),
  ]);
  const effectivePageSpeed = pageSpeed ?? snapshot?.pageSpeed ?? null;
  const snapshotWithPageSpeed = snapshot
    ? { ...snapshot, pageSpeed: effectivePageSpeed }
    : snapshot;

  const generatedAt = new Date().toISOString();
  const report = await withLiveReport(
    analyticsReport,
    snapshotWithPageSpeed,
    effectivePageSpeed,
    searchConsole,
  );
  const priorities = buildDashboardPriorities({
    now: generatedAt,
    linkClicks: clickResult.data?.length ?? 0,
    ctaClicks: (eventResult.data ?? []).filter(
      (event) => !conversionEvents.has(event.event_key) && !submissionFunnelEvents.has(event.event_key),
    ).length,
    conversions: (eventResult.data ?? []).filter((event) =>
      conversionEvents.has(event.event_key),
    ).length,
    campaigns: campaigns.length,
    snapshot: snapshotWithPageSpeed,
    report,
    films: socialFilmViews,
    recipes: featuredRecipes.map((recipe) => ({
      title: recipe.title,
      faqCount: recipe.faqs.length,
      visualCount: recipe.methodPhotos?.length ?? 0,
    })),
  });

  return {
    generatedAt,
    pinterestAuditCapturedAt: socialFilmAuditCapturedAt,
    windowDays: 90,
    linkClicks: clickResult.data?.length ?? 0,
    ctaClicks: (eventResult.data ?? []).filter(
      (event) => !conversionEvents.has(event.event_key) && !submissionFunnelEvents.has(event.event_key),
    ).length,
    conversions: (eventResult.data ?? []).filter((event) =>
      conversionEvents.has(event.event_key),
    ).length,
    sources,
    campaigns,
    participation,
    submissionFunnel,
    filmViews,
    socialFilmViews,
    unmatchedSocialPosts: socialFilmData.unmatched,
    socialConnectionStatus: socialFilmData.connections,
    snapshot: snapshotWithPageSpeed,
    priorities,
    report,
  };
}
