import "server-only";

import { getGoogleServiceAccountAccessToken } from "./google-search-console";

const CACHE_MS = 15 * 60 * 1000;
const REPORT_WINDOW_DAYS = 28;
const ANALYTICS_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

export type GoogleAnalyticsRow = { label: string; value: number };

export type GoogleAnalyticsSummary = {
  period: string;
  activeUsers: number;
  sessions: number;
  views: number;
  eventCount: number;
  engagementRate: number;
  topPages: GoogleAnalyticsRow[];
  channels: GoogleAnalyticsRow[];
  events: GoogleAnalyticsRow[];
  fetchedAt: string;
};

type ApiRow = {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
};

let cached: { data: GoogleAnalyticsSummary; expiresAt: number } | null = null;

function readablePage(value: string) {
  return value || "/";
}

function numeric(value: string | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function runReport(
  accessToken: string,
  propertyId: string,
  body: Record<string, unknown>,
): Promise<ApiRow[] | null> {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    console.error("OPR Google Analytics report failed", response.status, await response.text());
    return null;
  }

  const payload = await response.json() as { rows?: ApiRow[] };
  return payload.rows ?? [];
}

export async function getGoogleAnalyticsSummary(
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<GoogleAnalyticsSummary | null> {
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.data;

  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  if (!propertyId) return null;

  try {
    const accessToken = await getGoogleServiceAccountAccessToken(ANALYTICS_SCOPE);
    if (!accessToken) return null;

    const range = [{ startDate: `${REPORT_WINDOW_DAYS}daysAgo`, endDate: "yesterday" }];
    const [totals, topPages, channels, events] = await Promise.all([
      runReport(accessToken, propertyId, {
        dateRanges: range,
        metrics: ["activeUsers", "sessions", "screenPageViews", "eventCount", "engagementRate"].map((name) => ({ name })),
      }),
      runReport(accessToken, propertyId, {
        dateRanges: range,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: "10",
      }),
      runReport(accessToken, propertyId, {
        dateRanges: range,
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: "10",
      }),
      runReport(accessToken, propertyId, {
        dateRanges: range,
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: "15",
      }),
    ]);
    if (!totals) return null;

    const total = totals[0]?.metricValues ?? [];
    const summary: GoogleAnalyticsSummary = {
      period: `Last ${REPORT_WINDOW_DAYS} complete days`,
      activeUsers: numeric(total[0]?.value),
      sessions: numeric(total[1]?.value),
      views: numeric(total[2]?.value),
      eventCount: numeric(total[3]?.value),
      engagementRate: numeric(total[4]?.value),
      topPages: (topPages ?? []).map((row) => ({ label: readablePage(row.dimensionValues?.[0]?.value ?? ""), value: numeric(row.metricValues?.[0]?.value) })),
      channels: (channels ?? []).map((row) => ({ label: row.dimensionValues?.[0]?.value ?? "Unassigned", value: numeric(row.metricValues?.[0]?.value) })),
      events: (events ?? []).map((row) => ({ label: row.dimensionValues?.[0]?.value ?? "Unknown", value: numeric(row.metricValues?.[0]?.value) })),
      fetchedAt: new Date().toISOString(),
    };
    cached = { data: summary, expiresAt: Date.now() + CACHE_MS };
    return summary;
  } catch (error) {
    console.error("OPR Google Analytics summary could not be loaded", error);
    return null;
  }
}
