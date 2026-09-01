import "server-only";

import { buildLinkedInPageStatisticsUrl, buildLinkedInShareStatisticsUrl } from "./linkedin-query";

const API_VERSION = "202608";
const CACHE_MS = 15 * 60 * 1000;
const REPORT_LAG_DAYS = 1;
const REPORT_WINDOW_DAYS = 28;
const ORGANIZATION_URN = "urn:li:organization:141313963";

export type LinkedInSummary = {
  period: string;
  followers: number;
  pageViews28d: number | null;
  uniquePageViews28d: number | null;
  pageButtonClicks28d: number | null;
  postClicks28d: number | null;
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

async function resolveAccessToken(): Promise<string | null> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const refreshToken = process.env.LINKEDIN_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    const refreshedAccessToken = await getAccessToken(clientId, clientSecret, refreshToken);
    if (refreshedAccessToken) return refreshedAccessToken;
  }

  return process.env.LINKEDIN_ACCESS_TOKEN ?? null;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getLinkedInSummary(
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<LinkedInSummary | null> {
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.data;

  try {
    const accessToken = await resolveAccessToken();
    if (!accessToken) return null;

    const authHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": API_VERSION,
      "X-Restli-Protocol-Version": "2.0.0",
    };

    const followersResponse = await fetch(
      `https://api.linkedin.com/rest/networkSizes/${encodeURIComponent(ORGANIZATION_URN)}?edgeType=COMPANY_FOLLOWED_BY_MEMBER`,
      { headers: authHeaders },
    );
    if (!followersResponse.ok) {
      console.error("OPR LinkedIn follower count lookup failed", await followersResponse.text());
      return null;
    }
    const followers = await followersResponse.json();

    const endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() - REPORT_LAG_DAYS);
    endDate.setUTCHours(23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - (REPORT_WINDOW_DAYS - 1));
    startDate.setUTCHours(0, 0, 0, 0);

    const pageStatsUrl = buildLinkedInPageStatisticsUrl({
      organizationUrn: ORGANIZATION_URN,
      start: startDate.getTime(),
      end: endDate.getTime(),
    });
    const shareStatsUrl = buildLinkedInShareStatisticsUrl({
      organizationUrn: ORGANIZATION_URN,
      start: startDate.getTime(),
      end: endDate.getTime(),
    });

    const [pageStatsResponse, shareStatsResponse] = await Promise.all([
      fetch(pageStatsUrl, { headers: authHeaders }),
      fetch(shareStatsUrl, { headers: authHeaders }),
    ]);

    let pageViews: number | null = null;
    let uniquePageViews: number | null = null;
    let pageButtonClicks: number | null = null;
    if (pageStatsResponse.ok) {
      const stats = await pageStatsResponse.json();
      const elements = Array.isArray(stats.elements) ? stats.elements : [];
      pageViews = elements.reduce(
        (total: number, element: { totalPageStatistics?: { views?: { allPageViews?: { pageViews?: number } } } }) =>
          total + (element.totalPageStatistics?.views?.allPageViews?.pageViews ?? 0),
        0,
      );
      uniquePageViews = elements.reduce(
        (total: number, element: { totalPageStatistics?: { views?: { allPageViews?: { uniquePageViews?: number } } } }) =>
          total + (element.totalPageStatistics?.views?.allPageViews?.uniquePageViews ?? 0),
        0,
      );
      pageButtonClicks = elements.reduce((total: number, element: {
        totalPageStatistics?: {
          clicks?: {
            desktopCustomButtonClickCounts?: Array<{ clicks?: number }>;
            mobileCustomButtonClickCounts?: Array<{ clicks?: number }>;
          };
        };
      }) => {
        const clickGroups = [
          ...(element.totalPageStatistics?.clicks?.desktopCustomButtonClickCounts ?? []),
          ...(element.totalPageStatistics?.clicks?.mobileCustomButtonClickCounts ?? []),
        ];
        return total + clickGroups.reduce((subtotal, row) => subtotal + (row.clicks ?? 0), 0);
      }, 0);
    } else {
      console.warn("OPR LinkedIn page statistics query failed", await pageStatsResponse.text());
    }

    let postClicks: number | null = null;
    if (shareStatsResponse.ok) {
      const shareStats = await shareStatsResponse.json();
      const elements = Array.isArray(shareStats.elements) ? shareStats.elements : [];
      postClicks = elements.reduce(
        (total: number, element: { totalShareStatistics?: { clickCount?: number } }) =>
          total + (element.totalShareStatistics?.clickCount ?? 0),
        0,
      );
    } else {
      console.warn("OPR LinkedIn post statistics query failed", await shareStatsResponse.text());
    }

    const summary: LinkedInSummary = {
      period: `${REPORT_WINDOW_DAYS} days to ${isoDate(endDate)}`,
      followers: followers.firstDegreeSize ?? 0,
      pageViews28d: pageViews,
      uniquePageViews28d: uniquePageViews,
      pageButtonClicks28d: pageButtonClicks,
      postClicks28d: postClicks,
      fetchedAt: new Date().toISOString(),
    };

    cached = { data: summary, expiresAt: Date.now() + CACHE_MS };
    return summary;
  } catch (error) {
    console.error("OPR LinkedIn summary could not be loaded", error);
    return null;
  }
}
