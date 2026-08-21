import "server-only";

const GRAPH_API_VERSION = "v21.0";
const REPORT_WINDOW_DAYS = 28;

export type FacebookSummary = {
  period: string;
  views28d: number;
  interactions28d: number;
  followers: number;
  profileVisits28d: number;
  fetchedAt: string;
  films: Array<{ title: string; views: number }>;
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getFacebookSummary(): Promise<FacebookSummary | null> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !accessToken) return null;

  try {
    const endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() - 1);
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - (REPORT_WINDOW_DAYS - 1));

    const accountUrl = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}`);
    accountUrl.searchParams.set("fields", "followers_count,fan_count");
    accountUrl.searchParams.set("access_token", accessToken);

    const insightsUrl = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/insights`);
    insightsUrl.searchParams.set("metric", "page_impressions,page_post_engagements,page_views_total");
    insightsUrl.searchParams.set("period", "day");
    insightsUrl.searchParams.set("since", isoDate(startDate));
    insightsUrl.searchParams.set("until", isoDate(endDate));
    insightsUrl.searchParams.set("access_token", accessToken);

    const videosUrl = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/videos`);
    videosUrl.searchParams.set("fields", "title,description,views");
    videosUrl.searchParams.set("limit", "100");
    videosUrl.searchParams.set("access_token", accessToken);

    const [accountResponse, insightsResponse, videosResponse] = await Promise.all([
      fetch(accountUrl),
      fetch(insightsUrl),
      fetch(videosUrl),
    ]);
    if (!accountResponse.ok || !insightsResponse.ok) {
      console.error("OPR Facebook analytics query failed", await insightsResponse.text());
      return null;
    }

    const account = await accountResponse.json();
    const insights = await insightsResponse.json();
    const videos = videosResponse.ok ? await videosResponse.json() : { data: [] };
    const totals = new Map<string, number>();
    for (const metric of insights.data ?? []) {
      totals.set(
        metric.name,
        (metric.values ?? []).reduce((sum: number, point: { value?: number }) => sum + Number(point.value ?? 0), 0),
      );
    }

    return {
      period: `${REPORT_WINDOW_DAYS} days to ${isoDate(endDate)}`,
      views28d: totals.get("page_impressions") ?? 0,
      interactions28d: totals.get("page_post_engagements") ?? 0,
      followers: Number(account.followers_count ?? account.fan_count ?? 0),
      profileVisits28d: totals.get("page_views_total") ?? 0,
      fetchedAt: new Date().toISOString(),
      films: (videos.data ?? []).map((video: { title?: string; description?: string; views?: number }) => ({
        title: video.title || video.description || "Untitled video",
        views: Number(video.views ?? 0),
      })),
    };
  } catch (error) {
    console.error("OPR Facebook summary could not be loaded", error);
    return null;
  }
}
