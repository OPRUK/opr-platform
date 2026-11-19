import "server-only";

import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { opcSocialAccounts, saveOpcSocialConnection, type OpcOAuthPlatform } from "./opc-social-connections";
import { getSupabaseAdmin } from "./supabase/admin";

const origin = "https://otherpeoplesrecipes.co.uk";
const graph = "https://graph.facebook.com/v21.0";
const providers = {
  facebook: { authorize: "https://www.facebook.com/v21.0/dialog/oauth", token: `${graph}/oauth/access_token`, scope: "pages_show_list,pages_read_engagement,read_insights,instagram_basic,instagram_manage_insights", id: "META_APP_ID", secret: "META_APP_SECRET" },
  tiktok: { authorize: "https://www.tiktok.com/v2/auth/authorize/", token: "https://open.tiktokapis.com/v2/oauth/token/", scope: "user.info.basic,user.info.stats,video.list", id: "TIKTOK_CLIENT_KEY", secret: "TIKTOK_CLIENT_SECRET" },
  youtube: { authorize: "https://accounts.google.com/o/oauth2/v2/auth", token: "https://oauth2.googleapis.com/token", scope: "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly", id: "YOUTUBE_OAUTH_CLIENT_ID", secret: "YOUTUBE_OAUTH_CLIENT_SECRET" },
  pinterest: { authorize: "https://www.pinterest.com/oauth/", token: "https://api.pinterest.com/v5/oauth/token", scope: "boards:read,pins:read,user_accounts:read", id: "PINTEREST_CLIENT_ID", secret: "PINTEREST_CLIENT_SECRET" },
} as const;

function redirectUri(platform: OpcOAuthPlatform) {
  return `${origin}/api/${platform}/callback`;
}

export async function startOpcOAuth(client: SupabaseClient, platform: OpcOAuthPlatform) {
  const provider = providers[platform];
  const id = process.env[provider.id];
  if (!id || !process.env[provider.secret]) return null;
  const state = `opc.${randomBytes(32).toString("base64url")}`;
  const { error } = await client.from("opc_social_oauth_states").insert({
    state, platform, expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
  });
  if (error) return null;

  const url = new URL(provider.authorize);
  url.search = new URLSearchParams({
    [platform === "tiktok" ? "client_key" : "client_id"]: id,
    redirect_uri: redirectUri(platform), response_type: "code", scope: provider.scope, state,
  }).toString();
  if (platform === "youtube") {
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent select_account");
  }
  return url.toString();
}

async function providerJson(url: string, token?: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options, cache: "no-store", signal: AbortSignal.timeout(9000),
    headers: { ...options?.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  return response.ok ? await response.json() : null;
}

async function exchange(platform: OpcOAuthPlatform, code: string) {
  const provider = providers[platform];
  const id = process.env[provider.id];
  const secret = process.env[provider.secret];
  if (!id || !secret) return null;

  const params = new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri(platform) });
  const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
  if (platform === "pinterest") {
    headers.Authorization = `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
  } else {
    params.set(platform === "tiktok" ? "client_key" : "client_id", id);
    params.set("client_secret", secret);
  }
  if (platform === "facebook") return providerJson(`${provider.token}?${params}`);
  return providerJson(provider.token, undefined, { method: "POST", headers, body: params });
}

async function verifyAccount(platform: OpcOAuthPlatform, accessToken: string) {
  if (platform === "youtube") {
    const channels = await providerJson("https://www.googleapis.com/youtube/v3/channels?part=id&mine=true", accessToken);
    return channels?.items?.some((item: { id?: string }) => item.id === opcSocialAccounts.youtubeChannel)
      ? opcSocialAccounts.youtubeChannel : null;
  }
  if (platform === "pinterest") {
    const account = await providerJson("https://api.pinterest.com/v5/user_account", accessToken);
    return account?.username?.toLowerCase() === opcSocialAccounts.pinterestUsername ? account.username as string : null;
  }
  // TikTok verifies ownership when a token queries known OPC video IDs. This
  // keeps account validation within the app's existing video.list scope.
  const videoIds = ["7709628518224694550", "7709629389993970946"];
  const [profile, videos] = await Promise.all([
    providerJson("https://open.tiktokapis.com/v2/user/info/?fields=open_id", accessToken),
    providerJson("https://open.tiktokapis.com/v2/video/query/?fields=id", accessToken, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters: { video_ids: videoIds } }),
    }),
  ]);
  const user = profile?.data?.user;
  return typeof user?.open_id === "string"
    && videos?.data?.videos?.some((video: { id?: string }) => video.id && videoIds.includes(video.id))
    ? user.open_id as string : null;
}

async function saveMetaPage(accessToken: string) {
  // Upgrade the short-lived user token before deriving the Page-scoped token.
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return false;
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token", client_id: appId, client_secret: appSecret, fb_exchange_token: accessToken,
  });
  const exchanged = await providerJson(`${graph}/oauth/access_token?${params}`);
  if (typeof exchanged?.access_token !== "string") return false;

  const pageId = opcSocialAccounts.facebookPage;
  const page = await providerJson(`${graph}/${pageId}?fields=id,access_token,instagram_business_account%7Bid,username%7D`, exchanged.access_token);
  if (page?.id !== pageId || typeof page.access_token !== "string") return false;
  const instagram = page.instagram_business_account;
  return saveOpcSocialConnection("facebook", {
    account_id: pageId, credential: page.access_token,
    instagram_id: instagram?.username?.toLowerCase() === opcSocialAccounts.instagramUsername ? instagram.id : null,
  });
}

export async function finishOpcOAuth(request: Request, platform: OpcOAuthPlatform) {
  const stateCookie = `opc_oauth_${platform}`;
  function back(status: "connected" | "failed" | "wrong-account" | "denied") {
    const response = NextResponse.redirect(`${origin}/admin/analytics?brand=opc&opcPlatform=${platform}&opcStatus=${status}`);
    response.headers.set("Cache-Control", "private, no-store");
    response.cookies.set(stateCookie, "", { maxAge: 0, secure: true, httpOnly: true, path: `/api/${platform}/callback` });
    return response;
  }
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const state = params.get("state") ?? "";
  const client = getSupabaseAdmin();
  if (!client || !/^opc\.[A-Za-z0-9_-]{43}$/.test(state)
    || new NextRequest(request).cookies.get(stateCookie)?.value !== state) return back("failed");
  const consumed = await client.from("opc_social_oauth_states").delete()
    .eq("state", state).eq("platform", platform).gt("expires_at", new Date().toISOString()).select("state").maybeSingle();
  if (consumed.error || !consumed.data) return back("failed");
  if (!code) return back(params.has("error") ? "denied" : "failed");

  try {
    const token = await exchange(platform, code);
    if (typeof token?.access_token !== "string") return back("failed");
    if (platform === "facebook") return back(await saveMetaPage(token.access_token) ? "connected" : "failed");
    if (typeof token.refresh_token !== "string") return back("failed");
    const account = await verifyAccount(platform, token.access_token);
    if (!account) return back("wrong-account");
    return back(await saveOpcSocialConnection(platform, {
      account_id: account, credential: token.refresh_token, instagram_id: null,
    }) ? "connected" : "failed");
  } catch {
    return back("failed");
  }
}
