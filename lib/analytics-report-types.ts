// Types for the full SEO/social traffic report — a periodic manual export
// (currently sourced from Vercel Web Analytics, Google Search Console and
// each social platform's native dashboard) checked into the repo as data
// rather than an env var, since its size and structure don't fit an
// environment variable well. See lib/analytics-report-data.ts.

export type KpiTile = { label: string; value: string };

export type NumberedRow = Record<string, string | number | null>;

export type ExecutiveSummary = {
  preparedDate: string;
  kpis: KpiTile[];
  whatTheNumbersSay: Array<{
    area: string;
    evidence: string;
    meaning: string;
    decision: string;
  }>;
  topPriorities: Array<{
    priority: string;
    action: string;
    whyNow: string;
    successMeasure: string;
    owner: string;
  }>;
  footnote: string;
};

export type WebsiteTrafficReport = {
  period: string;
  core: Array<{
    metric: string;
    last30Days: number;
    last7Days: number;
    change7d: number | null;
  }>;
  topPages: Array<{
    path: string;
    visitors: number;
    role: string;
    seoNote: string;
  }>;
  topReferrers: Array<{
    host: string;
    visitors: number;
    channel: string;
    observation: string;
    action: string;
  }>;
  audienceCountry: Array<{ country: string; share: number; visitors: number }>;
  audienceDevice: Array<{ device: string; share: number }>;
  audienceOS: Array<{ os: string; share: number; visitors: number }>;
  note: string;
  fetchedAt: string | null;
};

export type GoogleSearchReport = {
  period: string;
  kpis: Array<{ metric: string; value: number; definition: string; read: string }>;
  daily: Array<{ date: string; clicks: number; impressions: number; ctr: number }>;
  queries: Array<{ query: string; clicks: number; impressions: number }>;
  pages: Array<{ page: string; clicks: number; impressions: number }>;
  countries: Array<{ country: string; clicks: number; impressions: number }>;
  devices: Array<{ device: string; clicks: number; impressions: number }>;
  note: string;
  fetchedAt: string | null;
};

export type SeoTechnicalReport = {
  asOf: string;
  indexing: Array<{
    measure: string;
    value: number;
    status: string;
    interpretation: string;
    action: string;
    lastUpdate: string;
  }>;
  notIndexed: Array<{
    url: string;
    reason: string;
    assessment: string;
    treatment: string;
    priority: string;
    observed: string;
  }>;
  pageSpeed: Array<{ metric: string; value: number; unit: string; context: string }>;
  pageSpeedMeta: {
    testedUrl: string;
    strategy: "mobile" | "desktop";
    fetchedAt: string | null;
    lighthouseVersion: string | null;
  };
  structuredData: Array<{
    area: string;
    valid: number;
    invalidOrExcluded: number;
    finding: string;
    action: string;
  }>;
  authority: Array<{
    measure: string;
    count: number;
    breakdown: string;
    implication: string;
    action: string;
  }>;
  note: string;
};

export type SocialPlatformSummary = {
  platform: string;
  period: string;
  views: number;
  viewers: number | string | null;
  interactions: number | string;
  followers: number | string | null;
  profileVisits: number | string | null;
  outboundClicks: number | string | null;
  websiteVisitors: number | string | null;
  interactionRate: number | null;
};

export type SocialOverviewReport = {
  platforms: SocialPlatformSummary[];
  diagnosis: Array<{
    channel: string;
    strength: string;
    constraint: string;
    nextMove: string;
    workingKpi: string;
  }>;
  note: string;
};

export type PlatformMetricRow = {
  metric: string;
  value: string;
  interpretation: string;
  action: string;
};

export type PlatformTopContentRow = {
  rank: number;
  title: string;
  value: string;
  extra: string;
  note: string;
};

export type PlatformDiscoverySourceRow = {
  source: string;
  share: number;
  approxViews: number;
  meaning: string;
  action: string;
};

export type PlatformReport = {
  handle: string;
  period: string;
  metrics: PlatformMetricRow[];
  topContent: PlatformTopContentRow[];
  discoverySources: PlatformDiscoverySourceRow[];
  note: string;
};

export type MeasurementActionsReport = {
  linkClicks: Array<{
    linkKey: string;
    clicks: number;
    firstClick: string;
    lastClick: string;
    status: string;
    interpretation: string;
  }>;
  gaps: Array<{
    gap: string;
    currentState: string;
    risk: string;
    fix: string;
    priority: string;
    owner: string;
    due: string;
  }>;
  deliveryPlan: Array<{
    priority: string;
    workstream: string;
    action: string;
    baseline: string;
    goal30d: string;
    goal90d: string;
    owner: string;
    timing: string;
    status: string;
  }>;
  note: string;
};

export type AnalyticsReport = {
  preparedDate: string;
  executiveSummary: ExecutiveSummary;
  website: WebsiteTrafficReport;
  googleSearch: GoogleSearchReport;
  seoTechnical: SeoTechnicalReport;
  socialOverview: SocialOverviewReport;
  platforms: {
    instagram: PlatformReport;
    facebook: PlatformReport;
    pinterest: PlatformReport;
    youtube: PlatformReport;
    tiktok: PlatformReport;
  };
  measurementActions: MeasurementActionsReport;
};
