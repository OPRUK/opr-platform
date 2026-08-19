import "server-only";

const CACHE_MS = 15 * 60 * 1000;
const REPORT_WINDOW_DAYS = 28;

export type VercelAudienceRow = { label: string; share: number; visitors: number };

export type VercelAnalyticsSummary = {
  period: string;
  visitors: number;
  pageviews: number;
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

function toAudienceRows(rows: Array<Record<string, unknown>>, dimension: string): VercelAudienceRow[] {
  const totalVisitors = rows.reduce((sum, row) => sum + (Number(row.visitors) || 0), 0);
  return rows
    .map((row) => {
      const visitors = Number(row.visitors) || 0;
      return {
        label: String(row[dimension] ?? "Unknown"),
        visitors,
        share: totalVisitors > 0 ? visitors / totalVisitors : 0,
      };
    })
    .sort((a, b) => b.visitors - a.visitors);
}

export async function getVercelAnalyticsSummary(): Promise<VercelAnalyticsSummary | null> {
  if (cached && cached.expiresAt > Date.now()) return cached.data;

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

    const countUrl = new URL("https://api.vercel.com/v1/query/web-analytics/visits/count");
    countUrl.searchParams.set("projectId", projectId);
    countUrl.searchParams.set("teamId", teamId);
    countUrl.searchParams.set("since", since);
    countUrl.searchParams.set("until", until);

    const [countResponse, countryRows, deviceRows, osRows] = await Promise.all([
      fetch(countUrl, { headers: { Authorization: `Bearer ${token}` } }),
      queryAggregate(token, projectId, teamId, "country", since, until),
      queryAggregate(token, projectId, teamId, "deviceType", since, until),
      queryAggregate(token, projectId, teamId, "osName", since, until),
    ]);

    if (!countResponse.ok) {
      console.error("OPR Vercel Analytics count failed", await countResponse.text());
      return null;
    }
    const count = await countResponse.json();

    const summary: VercelAnalyticsSummary = {
      period: `${REPORT_WINDOW_DAYS} days to ${until}`,
      visitors: count.data?.visitors ?? 0,
      pageviews: count.data?.pageviews ?? 0,
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
