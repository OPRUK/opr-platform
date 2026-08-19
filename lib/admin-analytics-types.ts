export type AnalyticsSourceSummary = {
  source: string;
  linkClicks: number;
  ctaClicks: number;
  conversions: number;
};

export type AnalyticsParticipationMetric = {
  key: "table" | "recipes" | "votes" | "community";
  label: string;
  allTime: number | null;
  last30Days: number | null;
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
  // Set only when these figures came from a live API call this request
  // (currently only the YouTube row can be live — see lib/youtube.ts).
  // Null means it's still the manually-pasted OPR_ANALYTICS_SNAPSHOT baseline.
  fetchedAt: string | null;
};

import type { AnalyticsReport } from "./analytics-report-types";
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
  };
  google: {
    period: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
    indexedPages: number;
    // Set only when these figures came from a live Search Console API call
    // this request (see lib/google-search-console.ts). Null means they're
    // still the manually-pasted OPR_ANALYTICS_SNAPSHOT baseline.
    fetchedAt: string | null;
  };
  social: AnalyticsSnapshotPlatform[];
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
  participation: AnalyticsParticipationMetric[];
  snapshot: AnalyticsSnapshot | null;
  // The full manually-compiled SEO/social report (see lib/analytics-report-data.ts).
  // Its Google Search figures are historical, not live — the live numbers stay
  // in snapshot.google above so the two never contradict each other on screen.
  report: AnalyticsReport;
};
