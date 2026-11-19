import "server-only";

import { getSupabaseAdmin } from "./supabase/admin";

export const opcOAuthPlatforms = ["facebook", "tiktok", "youtube", "pinterest"] as const;
export type OpcOAuthPlatform = typeof opcOAuthPlatforms[number];

export const opcSocialAccounts = {
  facebookPage: "61596414003109",
  instagramUsername: "opc_uk",
  youtubeChannel: "UC6KhSnh_V_wv3VDC1inY8WQ",
  pinterestUsername: "otherpeoplescocktails",
};

type Connection = {
  account_id: string;
  credential: string;
  instagram_id: string | null;
};

export async function getOpcSocialConnection(platform: OpcOAuthPlatform): Promise<Connection | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;
  const { data, error } = await client.from("opc_social_connections")
    .select("account_id,credential,instagram_id").eq("platform", platform).maybeSingle<Connection>();
  if (error) console.error("OPC connection lookup failed", platform, error.code);
  return data;
}

export async function saveOpcSocialConnection(platform: OpcOAuthPlatform, connection: Connection) {
  const client = getSupabaseAdmin();
  if (!client) return false;
  const { error } = await client.from("opc_social_connections").upsert({
    platform, ...connection, updated_at: new Date().toISOString(),
  });
  if (error) console.error("OPC connection save failed", platform, error.code);
  return !error;
}

export async function rotateOpcSocialCredential(platform: "tiktok" | "pinterest", previous: string, credential: string) {
  const client = getSupabaseAdmin();
  if (!client) return;
  const { error } = await client.from("opc_social_connections").update({ credential, updated_at: new Date().toISOString() })
    .eq("platform", platform).eq("credential", previous);
  if (error) console.error("OPC credential rotation failed", platform, error.code);
}
