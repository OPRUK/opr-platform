import "server-only";

import { getSupabaseAdmin } from "./supabase/admin";

export type ReconnectablePlatform = "youtube" | "pinterest";

export async function getSocialRefreshToken(platform: ReconnectablePlatform): Promise<string | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;
  const { data, error } = await client.from("social_connections").select("refresh_token").eq("platform", platform).maybeSingle();
  if (error) {
    console.error(`OPR ${platform} saved connection could not load`, error);
    return null;
  }
  return typeof data?.refresh_token === "string" ? data.refresh_token : null;
}

export async function saveSocialConnection(platform: ReconnectablePlatform, refreshToken: string, scope: string): Promise<boolean> {
  const client = getSupabaseAdmin();
  if (!client) return false;
  const { error } = await client.from("social_connections").upsert({
    platform, refresh_token: refreshToken, scope, updated_at: new Date().toISOString(),
  });
  if (error) console.error(`OPR ${platform} connection could not be saved`, error);
  return !error;
}

export async function consumeSocialOAuthState(state: string, platform: ReconnectablePlatform): Promise<boolean> {
  const client = getSupabaseAdmin();
  if (!client) return false;
  const { data } = await client.from("social_oauth_states").select("state")
    .eq("state", state).eq("platform", platform).gt("expires_at", new Date().toISOString()).maybeSingle();
  if (!data) return false;
  const { error } = await client.from("social_oauth_states").delete().eq("state", state);
  return !error;
}
