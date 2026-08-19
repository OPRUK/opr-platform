import "server-only";

const CACHE_MS = 15 * 60 * 1000;
const REPORT_LAG_DAYS = 1;
const REPORT_WINDOW_DAYS = 28;

export type PinterestSummary = {
  period: string;
  followers: number;
  impressions28d: number;
  saves28d: number;
  outboundClicks28d: number;
  fetchedAt: string;
};

// Module-scope cache: best-effort within a warm serverless instance, not a
// shared/persistent cache across instances — same trade-off as the other
// live integrations (Search Console, YouTube, Instagram, TikTok).
let cached: { data: PinterestSummary; expiresAt: number } | null = null;

async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string | null> {
  const response = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    console.error("OPR Pinterest auth failed", await response.text());
    return null;
  }

  const payload = await response.json();
  return typeof payload.access_token === "string" ? payload.access_token : null;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getPinterestSummary(): Promise<PinterestSummary | null> {
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const clientId = process.env.PINTEREST_CLIENT_ID;
  const clientSecret = process.env.PINTEREST_CLIENT_SECRET;
  const refreshToken = process.env.PINTEREST_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  try {
    const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);
    if (!accessToken) return null;

    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    const accountResponse = await fetch("https://api.pinterest.com/v5/user_account", {
      headers: authHeaders,
    });
    if (!accountResponse.ok) {
      console.error("OPR Pinterest account lookup failed", await accountResponse.text());
      return null;
    }
    const account = await accountResponse.json();

    const endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() - REPORT_LAG_DAYS);
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - (REPORT_WINDOW_DAYS - 1));

    const analyticsUrl = new URL("https://api.pinterest.com/v5/user_account/analytics");
    analyticsUrl.searchParams.set("start_date", isoDate(startDate));
    analyticsUrl.searchParams.set("end_date", isoDate(endDate));
    analyticsUrl.searchParams.set("metric_types", "IMPRESSION,SAVE,OUTBOUND_CLICK");

    const analyticsResponse = await fetch(analyticsUrl, { headers: authHeaders });

    let impressions = 0;
    let saves = 0;
    let outboundClicks = 0;
    if (analyticsResponse.ok) {
      const analyticsPayload = await analyticsResponse.json();
      const totals = analyticsPayload.all?.summary_metrics as
        | { IMPRESSION?: number; SAVE?: number; OUTBOUND_CLICK?: number }
        | undefined;
      impressions = totals?.IMPRESSION ?? 0;
      saves = totals?.SAVE ?? 0;
      outboundClicks = totals?.OUTBOUND_CLICK ?? 0;
    } else {
      console.error("OPR Pinterest analytics query failed", await analyticsResponse.text());
    }

    const summary: PinterestSummary = {
      period: `${REPORT_WINDOW_DAYS} days to ${isoDate(endDate)}`,
      followers: account.follower_count ?? 0,
      impressions28d: impressions,
      saves28d: saves,
      outboundClicks28d: outboundClicks,
      fetchedAt: new Date().toISOString(),
    };

    cached = { data: summary, expiresAt: Date.now() + CACHE_MS };
    return summary;
  } catch (error) {
    console.error("OPR Pinterest summary could not be loaded", error);
    return null;
  }
}
