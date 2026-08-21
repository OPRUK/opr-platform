import "server-only";

const GRAPH_API_VERSION = "v21.0";
const CACHE_MS = 15 * 60 * 1000;
const REPORT_LAG_DAYS = 1;
const REPORT_WINDOW_DAYS = 28;

export type InstagramSummary = {
  period: string;
  followers: number;
  mediaCount: number;
  views28d: number;
  profileViews28d: number;
  fetchedAt: string;
  films: Array<{ title: string; views: number }>;
};

// Module-scope cache: best-effort within a warm serverless instance, not a
// shared/persistent cache across instances — same trade-off as the other
// live integrations (Search Console, YouTube).
let cached: { data: InstagramSummary; expiresAt: number } | null = null;

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getInstagramSummary(
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<InstagramSummary | null> {
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.data;

  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!accountId || !accessToken) return null;

  try {
    const endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() - REPORT_LAG_DAYS);
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - (REPORT_WINDOW_DAYS - 1));

    const [accountResponse, insightsResponse, mediaResponse] = await Promise.all([
      fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${accountId}?fields=followers_count,media_count&access_token=${accessToken}`,
      ),
      fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${accountId}/insights?metric=views,profile_views&period=day&metric_type=total_value&since=${isoDate(startDate)}&until=${isoDate(endDate)}&access_token=${accessToken}`,
      ),
      fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${accountId}/media?fields=id,caption,media_type,media_product_type&limit=100&access_token=${accessToken}`,
      ),
    ]);

    if (!accountResponse.ok) {
      console.error("OPR Instagram account lookup failed", await accountResponse.text());
      return null;
    }
    const account = await accountResponse.json();

    let views = 0;
    let profileViews = 0;
    if (insightsResponse.ok) {
      const insights = await insightsResponse.json();
      for (const metric of insights.data ?? []) {
        if (metric.name === "views") views = metric.total_value?.value ?? 0;
        if (metric.name === "profile_views") profileViews = metric.total_value?.value ?? 0;
      }
    } else {
      console.error("OPR Instagram insights query failed", await insightsResponse.text());
    }

    let films: Array<{ title: string; views: number }> = [];
    if (mediaResponse.ok) {
      const mediaPayload = await mediaResponse.json();
      const videos = (mediaPayload.data ?? []).filter((item: { media_type?: string; media_product_type?: string }) =>
        item.media_type === "VIDEO" || item.media_product_type === "REELS",
      );
      films = (await Promise.all(videos.map(async (item: { id: string; caption?: string }) => {
        const response = await fetch(
          `https://graph.facebook.com/${GRAPH_API_VERSION}/${item.id}/insights?metric=views&access_token=${accessToken}`,
        );
        if (!response.ok) return { title: item.caption ?? "Untitled video", views: 0 };
        const payload = await response.json();
        return {
          title: item.caption ?? "Untitled video",
          views: Number(payload.data?.[0]?.values?.[0]?.value ?? payload.data?.[0]?.total_value?.value ?? 0),
        };
      }))).filter((film) => film.views >= 0);
    }

    const summary: InstagramSummary = {
      period: `${REPORT_WINDOW_DAYS} days to ${isoDate(endDate)}`,
      followers: account.followers_count ?? 0,
      mediaCount: account.media_count ?? 0,
      views28d: views,
      profileViews28d: profileViews,
      fetchedAt: new Date().toISOString(),
      films,
    };

    cached = { data: summary, expiresAt: Date.now() + CACHE_MS };
    return summary;
  } catch (error) {
    console.error("OPR Instagram summary could not be loaded", error);
    return null;
  }
}
