import "server-only";

const CACHE_MS = 15 * 60 * 1000;
const REPORT_LAG_DAYS = 1;
const REPORT_WINDOW_DAYS = 28;
const VIDEO_LIST_PAGE_SIZE = 20;
const VIDEO_LIST_MAX_PAGES = 5;

export type TikTokSummary = {
  period: string;
  followers: number;
  likesTotal: number;
  videoCount: number;
  views28d: number;
  fetchedAt: string;
  films: Array<{ title: string; views: number }>;
};

// Module-scope cache: best-effort within a warm serverless instance, not a
// shared/persistent cache across instances — same trade-off as the other
// live integrations (Search Console, YouTube, Instagram).
let cached: { data: TikTokSummary; expiresAt: number } | null = null;

async function getAccessToken(clientKey: string, clientSecret: string, refreshToken: string): Promise<string | null> {
  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    console.error("OPR TikTok auth failed", await response.text());
    return null;
  }

  const payload = await response.json();
  return typeof payload.access_token === "string" ? payload.access_token : null;
}

type TikTokVideo = {
  create_time: number;
  view_count: number;
  title?: string;
  video_description?: string;
};

async function fetchRecentVideos(accessToken: string, since: Date): Promise<TikTokVideo[]> {
  const sinceSeconds = Math.floor(since.getTime() / 1000);
  let cursor: number | undefined;
  const recent: TikTokVideo[] = [];

  for (let page = 0; page < VIDEO_LIST_MAX_PAGES; page += 1) {
    const response = await fetch(
      "https://open.tiktokapis.com/v2/video/list/?fields=create_time,view_count,title,video_description",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          max_count: VIDEO_LIST_PAGE_SIZE,
          ...(cursor ? { cursor } : {}),
        }),
      },
    );

    if (!response.ok) {
      console.error("OPR TikTok video list failed", await response.text());
      break;
    }

    const payload = await response.json();
    const videos = (payload.data?.videos ?? []) as TikTokVideo[];

    let reachedOlderVideo = false;
    for (const video of videos) {
      if (video.create_time < sinceSeconds) {
        reachedOlderVideo = true;
        continue;
      }
      recent.push(video);
    }

    if (reachedOlderVideo || !payload.data?.has_more) break;
    cursor = payload.data.cursor;
  }

  return recent;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getTikTokSummary(
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<TikTokSummary | null> {
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.data;

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const refreshToken = process.env.TIKTOK_REFRESH_TOKEN;
  if (!clientKey || !clientSecret || !refreshToken) return null;

  try {
    const accessToken = await getAccessToken(clientKey, clientSecret, refreshToken);
    if (!accessToken) return null;

    const userInfoResponse = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=follower_count,likes_count,video_count",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!userInfoResponse.ok) {
      console.error("OPR TikTok user info lookup failed", await userInfoResponse.text());
      return null;
    }
    const userInfoPayload = await userInfoResponse.json();
    const user = userInfoPayload.data?.user as
      | { follower_count?: number; likes_count?: number; video_count?: number }
      | undefined;

    const endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() - REPORT_LAG_DAYS);
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - (REPORT_WINDOW_DAYS - 1));

    const recentVideos = await fetchRecentVideos(accessToken, startDate);
    const views28d = recentVideos.reduce((total, video) => total + (video.view_count ?? 0), 0);

    const summary: TikTokSummary = {
      period: `${REPORT_WINDOW_DAYS} days to ${isoDate(endDate)}`,
      followers: user?.follower_count ?? 0,
      likesTotal: user?.likes_count ?? 0,
      videoCount: user?.video_count ?? 0,
      views28d,
      fetchedAt: new Date().toISOString(),
      films: recentVideos.map((video) => ({
        title: video.title || video.video_description || "Untitled video",
        views: video.view_count ?? 0,
      })),
    };

    cached = { data: summary, expiresAt: Date.now() + CACHE_MS };
    return summary;
  } catch (error) {
    console.error("OPR TikTok summary could not be loaded", error);
    return null;
  }
}
