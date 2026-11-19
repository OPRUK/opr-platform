import "server-only";

import { getOpcSocialConnection, opcSocialAccounts, rotateOpcSocialCredential } from "./opc-social-connections";

import { socialCache, type SocialBrand, type SocialRequestOptions } from "./social-brand";
import {
  configuredPinterestAccessToken,
  configuredPinterestOAuthCredentials,
} from "./pinterest-auth";
import { pinterestLifetimeImpressions } from "./pinterest-metrics";
import { getSocialRefreshToken, saveSocialConnection } from "./social-connections";

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
const cache = socialCache<PinterestSummary>();
const tokenCaches = new Map<SocialBrand, { value: string; expiresAt: number }>();
const tokenRequests = new Map<SocialBrand, Promise<string | null>>();

async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string, brand: SocialBrand): Promise<string | null> {
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
  if (typeof payload.access_token !== "string") return null;
  if (typeof payload.refresh_token === "string" && payload.refresh_token !== refreshToken) {
    if (brand === "opc") await rotateOpcSocialCredential("pinterest", refreshToken, payload.refresh_token);
    else await saveSocialConnection("pinterest", payload.refresh_token, String(payload.scope ?? ""));
  }
  tokenCaches.set(brand, { value: payload.access_token, expiresAt: Date.now() + Math.max(0, Number(payload.expires_in ?? 3600) - 60) * 1000 });
  return payload.access_token;
}

async function resolvePinterestAccessToken(brand: SocialBrand): Promise<string | null> {
  const tokenCache = tokenCaches.get(brand);
  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.value;
  const pending = tokenRequests.get(brand);
  if (pending) return pending;
  const tokenRequest = (async () => {
    const refreshToken = brand === "opc"
      ? (await getOpcSocialConnection("pinterest"))?.credential ?? null
      : (await getSocialRefreshToken("pinterest")) ?? process.env.PINTEREST_REFRESH_TOKEN ?? null;
    const credentials = configuredPinterestOAuthCredentials(refreshToken);
    if (credentials) {
      const token = await getAccessToken(credentials.clientId, credentials.clientSecret, credentials.refreshToken, brand);
      if (token) return token;
    }
    return brand === "opc" ? process.env.OPC_PINTEREST_ACCESS_TOKEN ?? null : configuredPinterestAccessToken();
  })();
  tokenRequests.set(brand, tokenRequest);
  try { return await tokenRequest; } finally { tokenRequests.delete(brand); }
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getPinterestSummary(
  { forceRefresh = false, brand = "opr" }: SocialRequestOptions = {},
): Promise<PinterestSummary | null> {
  const cached = cache.get(brand);
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.data;

  try {
    const accessToken = await resolvePinterestAccessToken(brand);
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
    if (brand === "opc" && account.username?.toLowerCase() !== opcSocialAccounts.pinterestUsername) return null;

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
      return null;
    }

    const summary: PinterestSummary = {
      period: `${REPORT_WINDOW_DAYS} days to ${isoDate(endDate)}`,
      followers: account.follower_count ?? 0,
      impressions28d: impressions,
      saves28d: saves,
      outboundClicks28d: outboundClicks,
      fetchedAt: new Date().toISOString(),
    };

    cache.set(brand, { data: summary, expiresAt: Date.now() + CACHE_MS });
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

const filmCache = socialCache<PinterestFilmViews>();

// Per-pin metrics come inline from List Pins (pin_metrics=true) rather than a
// separate call per pin — Pinterest's batch analytics endpoint is beta-gated
// and not available to all apps, so this is the reliable path.
export async function getPinterestFilmViews(
  { forceRefresh = false, brand = "opr" }: SocialRequestOptions = {},
): Promise<PinterestFilmViews | null> {
  const cachedFilmViews = filmCache.get(brand);
  if (!forceRefresh && cachedFilmViews && cachedFilmViews.expiresAt > Date.now()) return cachedFilmViews.data;

  try {
    const accessToken = await resolvePinterestAccessToken(brand);
    if (!accessToken) return null;

    const authHeaders = { Authorization: `Bearer ${accessToken}` };
    if (brand === "opc" && !(await getPinterestSummary({ brand }))) return null;
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
        return page === 0 ? null : { fetchedAt: new Date().toISOString(), films };
      }

      const payload = await response.json();
      for (const pin of payload.items ?? []) {
        const mediaType = String(pin.media?.media_type ?? "");
        if (!mediaType.includes("video")) continue;
        // The agreed generic brand cards have no corresponding website film.
        if (/^every recipe has a story/i.test(pin.title ?? "")) continue;
        const impressions = pinterestLifetimeImpressions(pin);
        if (impressions === null) continue;
        films.push({
          id: pin.id ?? "",
          title: pin.title || pin.description || "Untitled pin",
          views: impressions,
        });
      }

      bookmark = typeof payload.bookmark === "string" ? payload.bookmark : undefined;
      page += 1;
    } while (bookmark && page < MAX_PIN_PAGES);

    const data: PinterestFilmViews = { fetchedAt: new Date().toISOString(), films };
    filmCache.set(brand, { data, expiresAt: Date.now() + CACHE_MS });
    return data;
  } catch (error) {
    console.error("OPR Pinterest film views could not be loaded", error);
    return null;
  }
}
