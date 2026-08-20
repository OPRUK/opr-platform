import "server-only";

const API_VERSION = "202508";
const CACHE_MS = 15 * 60 * 1000;
const REPORT_LAG_DAYS = 1;
const REPORT_WINDOW_DAYS = 28;
const ORGANIZATION_URN = "urn:li:organization:141313963";

export type LinkedInSummary = {
  period: string;
  followers: number;
  impressions28d: number;
  uniqueImpressions28d: number;
  clicks28d: number;
  fetchedAt: string;
};

// Module-scope cache: best-effort within a warm serverless instance, not a
// shared/persistent cache across instances — same trade-off as the other
// live integrations.
let cached: { data: LinkedInSummary; expiresAt: number } | null = null;

async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string | null> {
  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    console.error("OPR LinkedIn auth failed", await response.text());
    return null;
  }

  const payload = await response.json();
  return typeof payload.access_token === "string" ? payload.access_token : null;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getLinkedInSummary(
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<LinkedInSummary | null> {
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.data;

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const refreshToken = process.env.LINKEDIN_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  try {
    const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);
    if (!accessToken) return null;

    const authHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": API_VERSION,
      "X-Restli-Protocol-Version": "2.0.0",
    };

    const followersResponse = await fetch(
      `https://api.linkedin.com/rest/networkSizes/${encodeURIComponent(ORGANIZATION_URN)}?edgeType=CompanyFollowedByMember`,
      { headers: authHeaders },
    );
    if (!followersResponse.ok) {
      console.error("OPR LinkedIn follower count lookup failed", await followersResponse.text());
      return null;
    }
    const followers = await followersResponse.json();

    const endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() - REPORT_LAG_DAYS);
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - (REPORT_WINDOW_DAYS - 1));

    const statsUrl = new URL("https://api.linkedin.com/rest/organizationPageStatistics");
    statsUrl.searchParams.set("q", "organization");
    statsUrl.searchParams.set("organization", ORGANIZATION_URN);

    const statsResponse = await fetch(statsUrl, { headers: authHeaders });

    let impressions = 0;
    let uniqueImpressions = 0;
    let clicks = 0;
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      const totals = stats.elements?.[0]?.totalPageStatistics?.views?.allPageViews;
      impressions = totals?.pageViews ?? 0;
      uniqueImpressions = totals?.uniquePageViews ?? 0;
      clicks = stats.elements?.[0]?.totalPageStatistics?.clicks?.mobileCustomButtonClickCounts?.[0]?.clicks ?? 0;
    } else {
      console.error("OPR LinkedIn page statistics query failed", await statsResponse.text());
    }

    const summary: LinkedInSummary = {
      period: `${REPORT_WINDOW_DAYS} days to ${isoDate(endDate)}`,
      followers: followers.firstDegreeSize ?? 0,
      impressions28d: impressions,
      uniqueImpressions28d: uniqueImpressions,
      clicks28d: clicks,
      fetchedAt: new Date().toISOString(),
    };

    cached = { data: summary, expiresAt: Date.now() + CACHE_MS };
    return summary;
  } catch (error) {
    console.error("OPR LinkedIn summary could not be loaded", error);
    return null;
  }
}
