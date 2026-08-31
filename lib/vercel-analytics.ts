import "server-only";

const CACHE_MS = 15 * 60 * 1000;
const REPORT_WINDOW_DAYS = 28;

export type VercelAudienceRow = { label: string; share: number; visitors: number };

export type VercelTrafficWindow = {
  visitors: number;
  pageviews: number;
  pagesPerVisitor: number;
};

export type VercelAnalyticsSummary = {
  period: string;
  visitors: number;
  pageviews: number;
  last7Days: VercelTrafficWindow | null;
  previous7Days: VercelTrafficWindow | null;
  topPages: VercelAudienceRow[];
  topReferrers: VercelAudienceRow[];
  audienceCountry: VercelAudienceRow[];
  audienceDevice: VercelAudienceRow[];
  audienceOS: VercelAudienceRow[];
  fetchedAt: string;
};

// Module-scope cache: best-effort within a warm serverless instance, not a
// shared/persistent cache across instances — same trade-off as the other
// live integrations.
let cached: { data: VercelAnalyticsSummary; expiresAt: number } | null = null;

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function queryAggregate(
  token: string,
  projectId: string,
  teamId: string,
  by: string,
  since: string,
  until: string,
): Promise<Array<Record<string, unknown>>> {
  const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/aggregate");
  url.searchParams.set("projectId", projectId);
  url.searchParams.set("teamId", teamId);
  url.searchParams.set("by", by);
  url.searchParams.set("since", since);
  url.searchParams.set("until", until);
  url.searchParams.set("limit", "10");

  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    console.error(`OPR Vercel Analytics aggregate(${by}) failed`, await response.text());
    return [];
  }
  const payload = await response.json();
  return payload.data ?? [];
}

async function queryCount(
  token: string,
  projectId: string,
  teamId: string,
  since: string,
  until: string,
): Promise<VercelTrafficWindow | null> {
  const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/count");
  url.searchParams.set("projectId", projectId);
  url.searchParams.set("teamId", teamId);
  url.searchParams.set("since", since);
  url.searchParams.set("until", until);

  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    console.error("OPR Vercel Analytics count failed", await response.text());
    return null;
  }

  const payload = await response.json();
  const visitors = Number(payload.data?.visitors ?? 0);
  const pageviews = Number(payload.data?.pageviews ?? 0);
  return {
    visitors,
    pageviews,
    pagesPerVisitor: visitors > 0 ? pageviews / visitors : 0,
  };
}

function toAudienceRows(rows: Array<Record<string, unknown>>, dimension: string): VercelAudienceRow[] {
  const totalVisitors = rows.reduce((sum, row) => sum + (Number(row.visitors) || 0), 0);
  return rows
    .map((row) => {
      const visitors = Number(row.visitors) || 0;
      const rawLabel = row[dimension];
      // Vercel returns an empty string (not null/undefined) for visits where
      // this dimension couldn't be detected, so a plain `?? "Unknown"` still
      // lets a blank label through — check for that explicitly.
      const label = typeof rawLabel === "string" && rawLabel.trim().length > 0 ? rawLabel : "Unknown";
      return {
        label,
        visitors,
        share: totalVisitors > 0 ? visitors / totalVisitors : 0,
      };
    })
    .sort((a, b) => b.visitors - a.visitors);
}

export async function getVercelAnalyticsSummary(
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<VercelAnalyticsSummary | null> {
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.data;

  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const projectId = process.env.VERCEL_ANALYTICS_PROJECT_ID;
  const teamId = process.env.VERCEL_ANALYTICS_TEAM_ID;
  if (!token || !projectId || !teamId) return null;

  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - (REPORT_WINDOW_DAYS - 1));
    const since = isoDate(startDate);
    const until = isoDate(endDate);

    const last7StartDate = new Date(endDate);
    last7StartDate.setUTCDate(last7StartDate.getUTCDate() - 6);
    const previous7EndDate = new Date(last7StartDate);
    previous7EndDate.setUTCDate(previous7EndDate.getUTCDate() - 1);
    const previous7StartDate = new Date(previous7EndDate);
    previous7StartDate.setUTCDate(previous7StartDate.getUTCDate() - 6);

    const [count, last7Days, previous7Days, pageRows, referrerRows, countryRows, deviceRows, osRows] = await Promise.all([
      queryCount(token, projectId, teamId, since, until),
      queryCount(token, projectId, teamId, isoDate(last7StartDate), until),
      queryCount(token, projectId, teamId, isoDate(previous7StartDate), isoDate(previous7EndDate)),
      queryAggregate(token, projectId, teamId, "requestPath", since, until),
      queryAggregate(token, projectId, teamId, "referrerHostname", since, until),
      queryAggregate(token, projectId, teamId, "country", since, until),
      queryAggregate(token, projectId, teamId, "deviceType", since, until),
      queryAggregate(token, projectId, teamId, "osName", since, until),
    ]);

    if (!count) return null;

    const summary: VercelAnalyticsSummary = {
      period: `${REPORT_WINDOW_DAYS} days to ${until}`,
      visitors: count.visitors,
      pageviews: count.pageviews,
      last7Days,
      previous7Days,
      topPages: toAudienceRows(pageRows, "requestPath"),
      topReferrers: toAudienceRows(referrerRows, "referrerHostname"),
      audienceCountry: toAudienceRows(countryRows, "country"),
      audienceDevice: toAudienceRows(deviceRows, "deviceType"),
      audienceOS: toAudienceRows(osRows, "osName"),
      fetchedAt: new Date().toISOString(),
    };

    cached = { data: summary, expiresAt: Date.now() + CACHE_MS };
    return summary;
  } catch (error) {
    console.error("OPR Vercel Analytics summary could not be loaded", error);
    return null;
  }
}
