import "server-only";

const CACHE_MS = 15 * 60 * 1000;
const REPORT_LAG_DAYS = 1;
const REPORT_WINDOW_DAYS = 28;

export type YouTubeSummary = {
  period: string;
  subscribers: number;
  lifetimeViews: number;
  views28d: number;
  watchTimeMinutes28d: number;
  fetchedAt: string;
  films: Array<{ id: string; title: string; views: number; publishedAt?: string }>;
};

// Module-scope cache: best-effort within a warm serverless instance, not a
// shared/persistent cache across instances — same trade-off as the Search
// Console integration.
let cached: { data: YouTubeSummary; expiresAt: number } | null = null;

async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string | null> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    console.error("OPR YouTube auth failed", await response.text());
    return null;
  }

  const payload = await response.json();
  return typeof payload.access_token === "string" ? payload.access_token : null;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getYouTubeSummary(
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<YouTubeSummary | null> {
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.data;

  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  try {
    const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);
    if (!accessToken) return null;

    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    const channelResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails&mine=true",
      { headers: authHeaders },
    );
    if (!channelResponse.ok) {
      console.error("OPR YouTube channel lookup failed", await channelResponse.text());
      return null;
    }
    const channelPayload = await channelResponse.json();
    const statistics = channelPayload.items?.[0]?.statistics as
      | { subscriberCount?: string; viewCount?: string }
      | undefined;
    const uploadsPlaylist = channelPayload.items?.[0]?.contentDetails?.relatedPlaylists?.uploads as string | undefined;

    let films: Array<{ id: string; title: string; views: number }> = [];
    if (uploadsPlaylist) {
      const playlistResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(uploadsPlaylist)}&maxResults=50`,
        { headers: authHeaders },
      );
      if (playlistResponse.ok) {
        const playlistPayload = await playlistResponse.json();
        const ids = (playlistPayload.items ?? [])
          .map((item: { contentDetails?: { videoId?: string } }) => item.contentDetails?.videoId)
          .filter(Boolean);
        if (ids.length) {
          const videosResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids.join(",")}`,
            { headers: authHeaders },
          );
          if (videosResponse.ok) {
            const videosPayload = await videosResponse.json();
            films = (videosPayload.items ?? []).map((item: { id?: string; snippet?: { title?: string; publishedAt?: string }; statistics?: { viewCount?: string } }) => ({
              id: item.id ?? "",
              title: item.snippet?.title ?? "Untitled video",
              views: Number(item.statistics?.viewCount ?? 0),
              publishedAt: item.snippet?.publishedAt,
            }));
          }
        }
      }
    }

    const endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() - REPORT_LAG_DAYS);
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - (REPORT_WINDOW_DAYS - 1));

    const analyticsUrl = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
    analyticsUrl.searchParams.set("ids", "channel==MINE");
    analyticsUrl.searchParams.set("startDate", isoDate(startDate));
    analyticsUrl.searchParams.set("endDate", isoDate(endDate));
    analyticsUrl.searchParams.set("metrics", "views,estimatedMinutesWatched");

    const analyticsResponse = await fetch(analyticsUrl, { headers: authHeaders });
    if (!analyticsResponse.ok) {
      console.error("OPR YouTube Analytics query failed", await analyticsResponse.text());
      return null;
    }
    const analyticsPayload = await analyticsResponse.json();
    const row = analyticsPayload.rows?.[0] as [number, number] | undefined;

    const summary: YouTubeSummary = {
      period: `${REPORT_WINDOW_DAYS} days to ${isoDate(endDate)}`,
      subscribers: Number(statistics?.subscriberCount ?? 0),
      lifetimeViews: Number(statistics?.viewCount ?? 0),
      views28d: row?.[0] ?? 0,
      watchTimeMinutes28d: row?.[1] ?? 0,
      fetchedAt: new Date().toISOString(),
      films,
    };

    cached = { data: summary, expiresAt: Date.now() + CACHE_MS };
    return summary;
  } catch (error) {
    console.error("OPR YouTube summary could not be loaded", error);
    return null;
  }
}
