import "server-only";
import {
  configuredPinterestAccessToken,
  configuredPinterestOAuthCredentials,
} from "./pinterest-auth";
import { getSocialRefreshToken } from "./social-connections";

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

async function resolvePinterestAccessToken(): Promise<string | null> {
  // Production-limited Pinterest tokens are a short-lived bridge while the
  // app awaits OAuth approval. Prefer one when explicitly configured, then
  // fall back to the durable refresh-token connection.
  const configuredAccessToken = configuredPinterestAccessToken();
  if (configuredAccessToken) return configuredAccessToken;

  const refreshToken = (await getSocialRefreshToken("pinterest")) ?? process.env.PINTEREST_REFRESH_TOKEN ?? null;
  const credentials = configuredPinterestOAuthCredentials(refreshToken);
  if (!credentials) return null;

  return getAccessToken(credentials.clientId, credentials.clientSecret, credentials.refreshToken);
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getPinterestSummary(
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<PinterestSummary | null> {
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.data;

  try {
    const accessToken = await resolvePinterestAccessToken();
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

export type PinterestFilmViews = {
  fetchedAt: string;
  films: Array<{ id: string; title: string; views: number }>;
};

const PIN_PAGE_SIZE = 100;
const MAX_PIN_PAGES = 5;

let cachedFilmViews: { data: PinterestFilmViews; expiresAt: number } | null = null;

// Per-pin metrics come inline from List Pins (pin_metrics=true) rather than a
// separate call per pin — Pinterest's batch analytics endpoint is beta-gated
// and not available to all apps, so this is the reliable path.
export async function getPinterestFilmViews(
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<PinterestFilmViews | null> {
  if (!forceRefresh && cachedFilmViews && cachedFilmViews.expiresAt > Date.now()) return cachedFilmViews.data;

  try {
    const accessToken = await resolvePinterestAccessToken();
    if (!accessToken) return null;

    const authHeaders = { Authorization: `Bearer ${accessToken}` };
    const films: Array<{ id: string; title: string; views: number }> = [];
    let bookmark: string | undefined;
    let page = 0;

    do {
      const pinsUrl = new URL("https://api.pinterest.com/v5/pins");
      pinsUrl.searchParams.set("page_size", String(PIN_PAGE_SIZE));
      pinsUrl.searchParams.set("pin_metrics", "true");
      if (bookmark) pinsUrl.searchParams.set("bookmark", bookmark);

      const response = await fetch(pinsUrl, { headers: authHeaders });
      if (!response.ok) {
        console.error("OPR Pinterest pins list failed", await response.text());
        break;
      }

      const payload = await response.json();
      for (const pin of payload.items ?? []) {
        const impressions = pin.pin_metrics?.["90d"]?.impression;
        films.push({
          id: pin.id ?? "",
          title: pin.title || pin.description || "Untitled pin",
          views: Number(impressions ?? 0),
        });
      }

      bookmark = typeof payload.bookmark === "string" ? payload.bookmark : undefined;
      page += 1;
    } while (bookmark && page < MAX_PIN_PAGES);

    const data: PinterestFilmViews = { fetchedAt: new Date().toISOString(), films };
    cachedFilmViews = { data, expiresAt: Date.now() + CACHE_MS };
    return data;
  } catch (error) {
    console.error("OPR Pinterest film views could not be loaded", error);
    return null;
  }
}
