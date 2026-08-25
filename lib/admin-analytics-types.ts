export type AnalyticsSourceSummary = {
  source: string;
  linkClicks: number;
  ctaClicks: number;
  conversions: number;
};

export type AnalyticsCampaignSummary = AnalyticsSourceSummary & {
  campaign: string;
};

export type AnalyticsParticipationMetric = {
  key: "table" | "recipes" | "votes" | "community";
  label: string;
  allTime: number | null;
  last30Days: number | null;
};

export type AnalyticsFilmSummary = {
  title: string;
  video: string;
  plays: number;
  completions: number;
};

export type AnalyticsSocialFilmSummary = AnalyticsFilmSummary & {
  facebookViews: number | null;
  instagramViews: number | null;
  tiktokViews: number | null;
  youtubeViews: number | null;
  pinterestImpressions: number | null;
  uploadDate: string;
  daysOnline: number;
};

export type AnalyticsSnapshotPlatform = {
  platform: string;
  period: string;
  exposureLabel: string;
  exposures: number;
  interactions: number | null;
  followers: number | null;
  profileVisits: number | null;
  outboundClicks: number | null;
  websiteVisitors: number | null;
  // Set when these figures came from a connected platform API. Null means
  // this row is still the dated OPR_ANALYTICS_SNAPSHOT fallback.
  fetchedAt: string | null;
};

import type { AnalyticsReport } from "./analytics-report-types";
import type { PageSpeedSummary } from "./pagespeed-data";
export type { AnalyticsReport } from "./analytics-report-types";

export type AnalyticsSnapshot = {
  capturedAt: string;
  title: string;
  website: {
    period: string;
    visitors: number;
    pageViews: number;
    bounceRate: number;
    pagesPerVisitor: number;
    fetchedAt: string | null;
  };
  google: {
    period: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
    indexedPages: number;
    provisionalFrom: string | null;
    // Set when these figures came from the Search Console API. Null means
    // they are still the dated OPR_ANALYTICS_SNAPSHOT fallback.
    fetchedAt: string | null;
  };
  social: AnalyticsSnapshotPlatform[];
  pageSpeed: PageSpeedSummary | null;
  recommendations: Array<{
    title: string;
    evidence: string;
    action: string;
  }>;
};

export type AdminAnalyticsResponse = {
  generatedAt: string;
  windowDays: number;
  linkClicks: number;
  ctaClicks: number;
  conversions: number;
  sources: AnalyticsSourceSummary[];
  campaigns: AnalyticsCampaignSummary[];
  participation: AnalyticsParticipationMetric[];
  filmViews: AnalyticsFilmSummary[];
  socialFilmViews: AnalyticsSocialFilmSummary[];
  snapshot: AnalyticsSnapshot | null;
  // The full dated SEO/social analysis (see lib/analytics-report-data.ts).
  // Current headline figures stay in snapshot above; live website figures are
  // also overlaid on the report where matching fields are available.
  report: AnalyticsReport;
};
