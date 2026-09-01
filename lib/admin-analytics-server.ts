import "server-only";

import { countryName } from "@/lib/country-names";

import type { SupabaseClient } from "@supabase/supabase-js";
import { attributionSources } from "./attribution";
import { getSearchConsoleSummary, type SearchConsoleSummary } from "./google-search-console";
import { getYouTubeSummary, type YouTubeSummary } from "./youtube";
import { getInstagramSummary, type InstagramSummary } from "./instagram";
import { getTikTokSummary, type TikTokSummary } from "./tiktok";
import { getPinterestFilmViews, getPinterestSummary, type PinterestFilmViews, type PinterestSummary } from "./pinterest";
import { getLinkedInSummary, type LinkedInSummary } from "./linkedin";
import { getFacebookSummary, type FacebookSummary } from "./facebook";
import { getVercelAnalyticsSummary, type VercelAnalyticsSummary } from "./vercel-analytics";
import { getPageSpeedSummary, type PageSpeedSummary } from "./pagespeed";
import { analyticsReport } from "./analytics-report-data";
import { loadLatestDailySnapshot, saveDailySnapshot } from "./analytics-daily-snapshots";
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
import type { AnalyticsReport, PlatformReport, PlatformMetricRow, PlatformTopContentRow } from "./analytics-report-types";

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

function withLatestPinterestSnapshot(snapshot: AnalyticsSnapshot | null): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;

  return {
    ...snapshot,
    social: snapshot.social.map((platform) =>
      platform.platform.toLowerCase() === "pinterest" && !platform.fetchedAt
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

function withLatestFacebookSnapshot(snapshot: AnalyticsSnapshot | null): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;

  return {
    ...snapshot,
    social: snapshot.social.map((platform) =>
      platform.platform.toLowerCase() === "facebook" && !platform.fetchedAt
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

function withLatestYouTubeSnapshot(snapshot: AnalyticsSnapshot | null): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;

  return {
    ...snapshot,
    social: snapshot.social.map((platform) =>
      platform.platform.toLowerCase() === "youtube" && !platform.fetchedAt
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
      platform.platform.toLowerCase() === "instagram" && !platform.fetchedAt
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
      platform.platform.toLowerCase() === "tiktok" && !platform.fetchedAt
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

type LiveSources = {
  website: VercelAnalyticsSummary | null;
  searchConsole: SearchConsoleSummary | null;
  facebook: FacebookSummary | null;
  instagram: InstagramSummary | null;
  tiktok: TikTokSummary | null;
  youtube: YouTubeSummary | null;
  pinterest: PinterestSummary | null;
  pinterestFilms: PinterestFilmViews | null;
  linkedIn: LinkedInSummary | null;
  pageSpeed: PageSpeedSummary | null;
};

async function loadLiveSources(forceRefresh: boolean): Promise<LiveSources> {
  const options = { forceRefresh };
  const [website, searchConsole, facebook, instagram, tiktok, youtube, pinterest, pinterestFilms, linkedIn, pageSpeed] = await Promise.all([
    getVercelAnalyticsSummary(options),
    getSearchConsoleSummary(options),
    getFacebookSummary(options),
    getInstagramSummary(options),
    getTikTokSummary(options),
    getYouTubeSummary(options),
    getPinterestSummary(options),
    getPinterestFilmViews(options),
    getLinkedInSummary(options),
    getPageSpeedSummary(options),
  ]);
  return { website, searchConsole, facebook, instagram, tiktok, youtube, pinterest, pinterestFilms, linkedIn, pageSpeed };
}

function applyLiveSources(snapshot: AnalyticsSnapshot | null, live: LiveSources): AnalyticsSnapshot | null {
  if (!snapshot) return snapshot;

  let current = withLatestTikTokSnapshot(
    withLatestInstagramSnapshot(
      withLatestYouTubeSnapshot(
        withLatestFacebookSnapshot(withLatestPinterestSnapshot(snapshot)),
      ),
    ),
  );
  if (!current) return current;

  if (live.website) {
    current = {
      ...current,
      website: {
        ...current.website,
        period: live.website.period,
        visitors: live.website.visitors,
        pageViews: live.website.pageviews,
        pagesPerVisitor: live.website.visitors > 0 ? live.website.pageviews / live.website.visitors : 0,
        fetchedAt: live.website.fetchedAt,
      },
    };
  }

  if (live.searchConsole) {
    current = {
      ...current,
      google: {
        ...current.google,
        period: live.searchConsole.period,
        clicks: live.searchConsole.clicks,
        impressions: live.searchConsole.impressions,
        ctr: live.searchConsole.ctr,
        averagePosition: live.searchConsole.averagePosition,
        provisionalFrom: live.searchConsole.provisionalFrom,
        fetchedAt: live.searchConsole.fetchedAt,
      },
    };
  }

  const socialRows = current.social.map((platform) => {
    const key = platform.platform.toLowerCase();
    if (key === "facebook" && live.facebook) return {
      ...platform,
      period: live.facebook.period,
      exposureLabel: "Views",
      exposures: live.facebook.views28d,
      interactions: live.facebook.interactions28d,
      followers: live.facebook.followers,
      profileVisits: live.facebook.profileVisits28d,
      outboundClicks: null,
      fetchedAt: live.facebook.fetchedAt,
    };
    if (key === "instagram" && live.instagram) return {
      ...platform,
      period: live.instagram.period,
      exposureLabel: "Views",
      exposures: live.instagram.views28d,
      interactions: null,
      followers: live.instagram.followers,
      profileVisits: live.instagram.profileViews28d,
      outboundClicks: null,
      fetchedAt: live.instagram.fetchedAt,
    };
    if (key === "tiktok" && live.tiktok) return {
      ...platform,
      period: live.tiktok.period,
      exposureLabel: "Views",
      exposures: live.tiktok.views28d,
      interactions: null,
      followers: live.tiktok.followers,
      profileVisits: null,
      outboundClicks: null,
      fetchedAt: live.tiktok.fetchedAt,
    };
    if (key === "youtube" && live.youtube) return {
      ...platform,
      period: live.youtube.period,
      exposureLabel: "Views",
      exposures: live.youtube.views28d,
      interactions: null,
      followers: live.youtube.subscribers,
      profileVisits: null,
      outboundClicks: null,
      fetchedAt: live.youtube.fetchedAt,
    };
    if (key === "pinterest" && live.pinterest) return {
      ...platform,
      period: live.pinterest.period,
      exposureLabel: "Impressions",
      exposures: live.pinterest.impressions28d,
      interactions: live.pinterest.saves28d + live.pinterest.outboundClicks28d,
      followers: live.pinterest.followers,
      profileVisits: null,
      outboundClicks: live.pinterest.outboundClicks28d,
      fetchedAt: live.pinterest.fetchedAt,
    };
    if (key === "linkedin" && live.linkedIn) return {
      ...platform,
      period: live.linkedIn.period,
      exposureLabel: "Page views",
      exposures: live.linkedIn.pageViews28d,
      interactions: live.linkedIn.postClicks28d,
      interactionLabel: "Post clicks",
      followers: live.linkedIn.followers,
      profileVisits: live.linkedIn.uniquePageViews28d,
      profileVisitLabel: "Unique page views",
      outboundClicks: live.linkedIn.pageButtonClicks28d,
      outboundClickLabel: "Page-button clicks",
      fetchedAt: live.linkedIn.fetchedAt,
    };
    return platform;
  });

  if (live.linkedIn && !socialRows.some((platform) => platform.platform.toLowerCase() === "linkedin")) {
    socialRows.push({
      platform: "LinkedIn",
      period: live.linkedIn.period,
      exposureLabel: "Page views",
      exposures: live.linkedIn.pageViews28d,
      interactions: live.linkedIn.postClicks28d,
      interactionLabel: "Post clicks",
      followers: live.linkedIn.followers,
      profileVisits: live.linkedIn.uniquePageViews28d,
      profileVisitLabel: "Unique page views",
      outboundClicks: live.linkedIn.pageButtonClicks28d,
      outboundClickLabel: "Page-button clicks",
      websiteVisitors: null,
      fetchedAt: live.linkedIn.fetchedAt,
    });
  }

  return { ...current, social: socialRows, pageSpeed: live.pageSpeed ?? current.pageSpeed };
}

function changeRate(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / previous;
}

function isFreshSource(fetchedAt: string | null, now: number): boolean {
  if (!fetchedAt) return false;
  const fetchedAtMs = Date.parse(fetchedAt);
  return Number.isFinite(fetchedAtMs) && now - fetchedAtMs <= 48 * 60 * 60 * 1000;
}

function currentMetric(metric: string, value: number | string, interpretation: string, action: string): PlatformMetricRow {
  return { metric, value: typeof value === "number" ? value.toLocaleString("en-GB") : value, interpretation, action };
}

function currentTopContent(
  rows: ReadonlyArray<{ title: string; views: number }>,
  label: string,
): PlatformTopContentRow[] {
  return [...rows]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((row, index) => ({
      rank: index + 1,
      title: row.title,
      value: `${row.views.toLocaleString("en-GB")} ${label}`,
      extra: "",
      note: "Latest value returned by the platform API.",
    }));
}

function unavailablePlatform(report: PlatformReport): PlatformReport {
  return {
    ...report,
    period: "Live API unavailable",
    fetchedAt: null,
    metrics: [],
    topContent: [],
    discoverySources: [],
    note: "Historical figures are hidden so they are not mistaken for current statistics. Reconnect this platform to restore live reporting.",
  };
}

function buildPlatformReports(report: AnalyticsReport["platforms"], live: LiveSources): AnalyticsReport["platforms"] {
  const instagram = live.instagram ? {
    ...report.instagram,
    period: live.instagram.period,
    fetchedAt: live.instagram.fetchedAt,
    metrics: [
      currentMetric("Views", live.instagram.views28d, "Views in the current reporting window.", "Track the rolling trend."),
      currentMetric("Profile visits", live.instagram.profileViews28d, "Profile visits in the current reporting window.", "Keep the bio action clear."),
      currentMetric("Followers", live.instagram.followers, "Current follower count.", "Review net growth monthly."),
      currentMetric("Published media", live.instagram.mediaCount, "Current lifetime media count.", "Use alongside views, not as a performance rate."),
    ],
    topContent: currentTopContent(live.instagram.films, "views"),
    discoverySources: [],
    note: "Only metrics returned by the current Instagram API connection are shown; older manual figures are excluded.",
  } : unavailablePlatform(report.instagram);

  const facebook = live.facebook ? {
    ...report.facebook,
    period: live.facebook.period,
    fetchedAt: live.facebook.fetchedAt,
    metrics: [
      currentMetric("Views", live.facebook.views28d, "Views in the current reporting window.", "Track the rolling trend."),
      currentMetric("Content interactions", live.facebook.interactions28d, "Post engagements in the current reporting window.", "Review interactions relative to views."),
      currentMetric("Profile visits", live.facebook.profileVisits28d, "Page views in the current reporting window.", "Keep the page action clear."),
      currentMetric("Followers", live.facebook.followers, "Current follower count.", "Review net growth monthly."),
    ],
    topContent: currentTopContent(live.facebook.films, "views"),
    discoverySources: [],
    note: "Only metrics returned by the current Facebook API connection are shown; older manual figures are excluded.",
  } : unavailablePlatform(report.facebook);

  const pinterest = live.pinterest ? {
    ...report.pinterest,
    period: live.pinterest.period,
    fetchedAt: live.pinterest.fetchedAt,
    metrics: [
      currentMetric("Impressions", live.pinterest.impressions28d, "Impressions in the current reporting window.", "Track search-led reach."),
      currentMetric("Saves", live.pinterest.saves28d, "Saves in the current reporting window.", "Create useful recipe cards people want to keep."),
      currentMetric("Outbound clicks", live.pinterest.outboundClicks28d, "Clicks to OPR in the current reporting window.", "Link each Pin to its canonical recipe."),
      currentMetric("Followers", live.pinterest.followers, "Current follower count.", "Review net growth monthly."),
    ],
    topContent: [],
    discoverySources: [],
    note: "Current account metrics are shown. Per-Pin data uses a different window, so it remains in the film-performance table rather than being mixed here.",
  } : unavailablePlatform(report.pinterest);

  const youtube = live.youtube ? {
    ...report.youtube,
    period: live.youtube.period,
    fetchedAt: live.youtube.fetchedAt,
    metrics: [
      currentMetric("Views", live.youtube.views28d, "Views in the current reporting window.", "Track the rolling trend."),
      currentMetric("Watch time", `${(live.youtube.watchTimeMinutes28d / 60).toFixed(1)} hours`, "Watch time in the current reporting window.", "Review it alongside views."),
      currentMetric("Subscribers", live.youtube.subscribers, "Current subscriber count.", "Review net growth monthly."),
      currentMetric("Lifetime views", live.youtube.lifetimeViews, "Current channel lifetime views.", "Use as context, not a rolling performance metric."),
    ],
    topContent: currentTopContent(live.youtube.films, "lifetime views"),
    discoverySources: [],
    note: "Only metrics returned by the current YouTube API connection are shown; older manual figures are excluded.",
  } : unavailablePlatform(report.youtube);

  const tiktok = live.tiktok ? {
    ...report.tiktok,
    period: live.tiktok.period,
    fetchedAt: live.tiktok.fetchedAt,
    metrics: [
      currentMetric("Video views", live.tiktok.views28d, "Views on videos published within the current reporting window.", "Track the rolling trend."),
      currentMetric("Followers", live.tiktok.followers, "Current follower count.", "Review follower growth per 1,000 views."),
      currentMetric("Lifetime likes", live.tiktok.likesTotal, "Current lifetime likes total.", "Use as context, not a rolling interaction rate."),
      currentMetric("Published videos", live.tiktok.videoCount, "Current lifetime video count.", "Use alongside current-window views."),
    ],
    topContent: currentTopContent(live.tiktok.films, "views"),
    discoverySources: [],
    note: "Only metrics returned by the current TikTok API connection are shown; older manual figures are excluded.",
  } : unavailablePlatform(report.tiktok);

  return { instagram, facebook, pinterest, youtube, tiktok };
}

type LiveLinkClick = { link_key: string; created_at: string };

async function withLiveReport(
  report: AnalyticsReport,
  snapshot: AnalyticsSnapshot | null,
  liveSources: LiveSources,
  currentCounts: { ctaClicks: number; linkClicks: number; conversions: number },
  linkClicks: LiveLinkClick[],
): Promise<AnalyticsReport> {
  const live = liveSources.website;
  const now = Date.now();
  const savedPageSpeed = snapshot?.pageSpeed ?? null;
  const pageSpeed = liveSources.pageSpeed ?? (savedPageSpeed && isFreshSource(savedPageSpeed.fetchedAt, now) ? savedPageSpeed : null);
  const searchConsole = liveSources.searchConsole;
  const pagesPerVisitor = live && live.visitors > 0 ? live.pageviews / live.visitors : snapshot?.website.pagesPerVisitor ?? 0;
  const currentSocial = snapshot?.social.filter((platform) => isFreshSource(platform.fetchedAt, now)) ?? [];
  const socialExposures = currentSocial.reduce((total, platform) => total + (platform.exposures ?? 0), 0);
  const facebookReferrals = live?.topReferrers
    .filter((row) => row.label.toLowerCase().includes("facebook"))
    .reduce((total, row) => total + row.visitors, 0) ?? 0;
  const generatedAt = new Date().toISOString();
  const preparedDate = generatedAt.slice(0, 10);
  const currentKpis: AnalyticsReport["executiveSummary"]["kpis"] = [];
  if (live) {
    currentKpis.push(
      { label: "Website visitors · 28d", value: live.visitors.toLocaleString("en-GB") },
      { label: "Page views · 28d", value: live.pageviews.toLocaleString("en-GB") },
    );
  }
  if (searchConsole) {
    currentKpis.push(
      { label: "Google clicks · 28d", value: searchConsole.clicks.toLocaleString("en-GB") },
      { label: "Google CTR · 28d", value: `${(searchConsole.ctr * 100).toFixed(1)}%` },
    );
  }
  if (currentSocial.length) currentKpis.push({ label: "Connected social exposures*", value: socialExposures.toLocaleString("en-GB") });
  if (facebookReferrals > 0) currentKpis.push({ label: "Facebook referrals · 28d", value: facebookReferrals.toLocaleString("en-GB") });
  currentKpis.push(
    { label: "Site actions · 90d", value: currentCounts.ctaClicks.toLocaleString("en-GB") },
    { label: "Conversions · 90d", value: currentCounts.conversions.toLocaleString("en-GB") },
  );
  if (pageSpeed) {
    currentKpis.push(
      { label: "Mobile performance", value: String(pageSpeed.metrics.find((metric) => metric.metric === "Performance")?.value ?? "—") },
      { label: "Accessibility score", value: String(pageSpeed.metrics.find((metric) => metric.metric === "Accessibility")?.value ?? "—") },
      { label: "Mobile SEO score", value: String(pageSpeed.metrics.find((metric) => metric.metric === "SEO")?.value ?? "—") },
    );
  }

  const numberRead: AnalyticsReport["executiveSummary"]["whatTheNumbersSay"] = [];
  if (live) numberRead.push({
    area: "Website",
    evidence: `${live.visitors.toLocaleString("en-GB")} visitors generated ${live.pageviews.toLocaleString("en-GB")} page views; ${pagesPerVisitor.toFixed(2)} pages per visitor in the current 28-day window.`,
    meaning: "Current visitors continue to explore beyond a single page.",
    decision: "Keep one measurable primary action on the busiest landing pages.",
  });
  if (searchConsole) numberRead.push({
    area: "Google Search",
    evidence: `${searchConsole.clicks.toLocaleString("en-GB")} clicks from ${searchConsole.impressions.toLocaleString("en-GB")} impressions; ${(searchConsole.ctr * 100).toFixed(1)}% CTR; average position ${searchConsole.averagePosition.toFixed(1)}.`,
    meaning: "The current Search Console window shows how organic visibility is changing.",
    decision: "Use the live query and page tables below to prioritise recipe-led search work.",
  });
  if (currentSocial.length) numberRead.push({
    area: "Social discovery",
    evidence: `${socialExposures.toLocaleString("en-GB")} current platform-reported views or impressions across ${currentSocial.length} connected ${currentSocial.length === 1 ? "channel" : "channels"}.`,
    meaning: "The total is an activity indicator because platform definitions and periods differ.",
    decision: "Judge each channel on its own trend and source-coded site actions, not a blended reach claim.",
  });
  numberRead.push({
    area: "Measurement",
    evidence: `${currentCounts.linkClicks.toLocaleString("en-GB")} link-page clicks, ${currentCounts.ctaClicks.toLocaleString("en-GB")} site actions and ${currentCounts.conversions.toLocaleString("en-GB")} conversions were recorded in the current 90-day first-party window.`,
    meaning: "These privacy-safe events show which journeys produce participation.",
    decision: "Keep stable source and campaign codes on every active link.",
  });
  if (pageSpeed) numberRead.push({
    area: "Technical performance",
    evidence: `Latest live mobile Lighthouse scores: performance ${pageSpeed.metrics.find((metric) => metric.metric === "Performance")?.value ?? "—"}, accessibility ${pageSpeed.metrics.find((metric) => metric.metric === "Accessibility")?.value ?? "—"}, SEO ${pageSpeed.metrics.find((metric) => metric.metric === "SEO")?.value ?? "—"}.`,
    meaning: "This is current lab data for the tested production URL.",
    decision: "Investigate any score below the agreed threshold and confirm with production field data.",
  });

  const liveLinkRows = Array.from(linkClicks.reduce((groups, click) => {
    const existing = groups.get(click.link_key) ?? { count: 0, first: click.created_at, last: click.created_at };
    existing.count += 1;
    if (click.created_at < existing.first) existing.first = click.created_at;
    if (click.created_at > existing.last) existing.last = click.created_at;
    groups.set(click.link_key, existing);
    return groups;
  }, new Map<string, { count: number; first: string; last: string }>()))
    .map(([linkKey, row]) => ({
      linkKey,
      clicks: row.count,
      firstClick: row.first,
      lastClick: row.last,
      status: "Live · last 90 days",
      interpretation: "Current privacy-safe click count from the OPR links page.",
    }))
    .sort((a, b) => b.clicks - a.clicks || a.linkKey.localeCompare(b.linkKey));

  return {
    ...report,
    preparedDate,
    staticDataUpdatedAt: generatedAt,
    executiveSummary: {
      ...report.executiveSummary,
      preparedDate,
      kpis: currentKpis,
      whatTheNumbersSay: numberRead,
      topPriorities: [],
      footnote: "*Connected social exposures add platform-reported views or impressions and are not deduplicated people. Native definitions and date windows differ.",
    },
    website: {
      ...report.website,
      period: live?.period ?? "Live Vercel Web Analytics unavailable",
      core: live ? [
        { metric: "Visitors", last30Days: live.visitors, last7Days: live.last7Days?.visitors ?? null, change7d: live.last7Days && live.previous7Days ? changeRate(live.last7Days.visitors, live.previous7Days.visitors) : null },
        { metric: "Page views", last30Days: live.pageviews, last7Days: live.last7Days?.pageviews ?? null, change7d: live.last7Days && live.previous7Days ? changeRate(live.last7Days.pageviews, live.previous7Days.pageviews) : null },
        { metric: "Pages per visitor", last30Days: Number(pagesPerVisitor.toFixed(2)), last7Days: live.last7Days ? Number(live.last7Days.pagesPerVisitor.toFixed(2)) : null, change7d: live.last7Days && live.previous7Days ? changeRate(live.last7Days.pagesPerVisitor, live.previous7Days.pagesPerVisitor) : null },
      ] : [],
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
        : [],
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
        : [],
      audienceCountry: live?.audienceCountry.length
        ? live.audienceCountry.map((row) => ({
            country: countryName(row.label),
            share: row.share,
            visitors: row.visitors,
          }))
        : [],
      audienceDevice: live?.audienceDevice.length
        ? live.audienceDevice.map((row) => ({ device: row.label, share: row.share }))
        : [],
      audienceOS: live?.audienceOS.length
        ? live.audienceOS.map((row) => ({ os: row.label, share: row.share, visitors: row.visitors }))
        : [],
      note: live
        ? "Current Vercel Web Analytics data. Bounce rate is omitted because this API does not provide it; no historical value is mixed into the live table. Seven-day change compares the latest seven days with the preceding seven days."
        : "Historical website detail is hidden until the live Vercel Analytics source is available.",
      fetchedAt: live?.fetchedAt ?? null,
    },
    googleSearch: searchConsole ? {
      ...report.googleSearch,
      period: searchConsole.period,
      kpis: report.googleSearch.kpis
        .filter((row) => ["Clicks", "Impressions", "CTR", "Average position"].includes(row.metric))
        .map((row) => {
          if (row.metric === "Clicks") return { ...row, value: searchConsole.clicks };
          if (row.metric === "Impressions") return { ...row, value: searchConsole.impressions };
          if (row.metric === "CTR") return { ...row, value: searchConsole.ctr };
          return { ...row, value: searchConsole.averagePosition };
        }),
      daily: searchConsole?.daily.length
        ? searchConsole.daily.map((row) => ({
            date: row.label,
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
          }))
        : [],
      queries: searchConsole?.queries.length
        ? searchConsole.queries.map((row) => ({ query: row.label, clicks: row.clicks, impressions: row.impressions }))
        : [],
      pages: searchConsole?.pages.length
        ? searchConsole.pages.map((row) => ({ page: row.label, clicks: row.clicks, impressions: row.impressions }))
        : [],
      countries: searchConsole?.countries.length
        ? searchConsole.countries.map((row) => ({
            country: countryName(row.label),
            clicks: row.clicks,
            impressions: row.impressions,
          }))
        : [],
      devices: searchConsole?.devices.length
        ? searchConsole.devices.map((row) => ({ device: row.label, clicks: row.clicks, impressions: row.impressions }))
        : [],
      note: "Current Search Analytics data from Google Search Console. Index coverage counts are omitted because this API does not provide a trustworthy live total.",
      fetchedAt: searchConsole.fetchedAt,
    } : { ...report.googleSearch, period: "Live Search Console unavailable", kpis: [], daily: [], queries: [], pages: [], countries: [], devices: [], fetchedAt: null, note: "Historical Search Console figures are hidden until the live source is available." },
    socialOverview: snapshot ? {
      ...report.socialOverview,
      platforms: currentSocial.map((platform) => ({
        platform: platform.platform,
        period: platform.period,
        views: platform.exposures,
        viewers: null,
        interactions: platform.interactions,
        followers: platform.followers,
        profileVisits: platform.profileVisits,
        outboundClicks: platform.outboundClicks,
        websiteVisitors: platform.websiteVisitors,
        interactionRate: typeof platform.interactions === "number" && typeof platform.exposures === "number" && platform.exposures > 0
          ? platform.interactions / platform.exposures
          : null,
      })),
      diagnosis: currentSocial.map((platform) => ({
        channel: platform.platform,
        strength: platform.exposures === null
          ? `${platform.exposureLabel} are not available for ${platform.period}.`
          : `${platform.exposures.toLocaleString("en-GB")} ${platform.exposureLabel.toLowerCase()} in ${platform.period}.`,
        constraint: platform.outboundClicks === null
          ? `The current API does not expose ${(platform.outboundClickLabel ?? "outbound clicks").toLowerCase()} for this connection.`
          : `${platform.outboundClicks.toLocaleString("en-GB")} ${(platform.outboundClickLabel ?? "outbound clicks").toLowerCase()} in the same window.`,
        nextMove: "Compare the next complete window and keep every profile link source-coded.",
        workingKpi: `${platform.exposureLabel} and source-coded site actions`,
      })),
      note: "Only current API-supported platform figures are shown. Unsupported metrics are marked Not reported rather than filled from an older manual export.",
    } : report.socialOverview,
    platforms: buildPlatformReports(report.platforms, liveSources),
    seoTechnical: {
      ...report.seoTechnical,
      asOf: pageSpeed?.fetchedAt.slice(0, 10) ?? preparedDate,
      indexing: [],
      notIndexed: [],
      pageSpeed: pageSpeed?.metrics ?? [],
      pageSpeedMeta: {
        testedUrl: pageSpeed?.testedUrl ?? "https://otherpeoplesrecipes.co.uk/",
        strategy: pageSpeed?.strategy ?? "mobile",
        fetchedAt: pageSpeed?.fetchedAt ?? null,
        lighthouseVersion: pageSpeed?.lighthouseVersion ?? null,
      },
      structuredData: [],
      authority: [],
      note: pageSpeed
        ? "Current mobile Lighthouse lab data. Historical index-coverage, structured-data and backlink counts are hidden until they have a live source."
        : "Historical technical statistics are hidden until PageSpeed or another live source is available.",
    },
    measurementActions: {
      ...report.measurementActions,
      linkClicks: liveLinkRows,
      deliveryPlan: [],
      note: "Link-click rows are rebuilt from the current 90-day first-party event window. The dated delivery-plan baseline is excluded; use the dynamic action queue above for current priorities.",
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
  live: LiveSources,
): Promise<{
  films: AnalyticsSocialFilmSummary[];
  unmatched: UnmatchedSocialPost[];
  connections: SocialConnectionStatus[];
}> {
  const { facebook, instagram, tiktok, youtube, pinterestFilms: pinterest } = live;
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
      .select("source, link_key, utm_campaign, created_at")
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
  const liveSources = await loadLiveSources(_options?.forceRefresh ?? false);
  const socialFilmData = await buildSocialFilmViews(client, filmViews, liveSources);
  const socialFilmViews = socialFilmData.films;

  const snapshotWithPageSpeed = applyLiveSources(await getSnapshot(client), liveSources);

  const generatedAt = new Date().toISOString();
  const report = await withLiveReport(
    analyticsReport,
    snapshotWithPageSpeed,
    liveSources,
    {
      linkClicks: clickResult.data?.length ?? 0,
      ctaClicks: (eventResult.data ?? []).filter(
        (event) => !conversionEvents.has(event.event_key) && !submissionFunnelEvents.has(event.event_key),
      ).length,
      conversions: (eventResult.data ?? []).filter((event) => conversionEvents.has(event.event_key)).length,
    },
    (clickResult.data ?? []).map((row) => ({ link_key: row.link_key, created_at: row.created_at })),
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

  if (snapshotWithPageSpeed) {
    try {
      await saveDailySnapshot(client, snapshotWithPageSpeed);
    } catch (error) {
      console.warn("OPR current analytics snapshot could not be saved", error);
    }
  }

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
