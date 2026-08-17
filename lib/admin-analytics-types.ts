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
};

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
};
