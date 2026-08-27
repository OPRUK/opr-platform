import { randomBytes } from "node:crypto";
import { requireAdmin } from "../../../../lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { client, error: accessError } = await requireAdmin(request);
  if (!client) return Response.json({ error: accessError }, { status: 401 });
  const body = await request.json().catch(() => null) as { platform?: unknown } | null;
  const platform = body?.platform;
  if (platform !== "youtube" && platform !== "pinterest") return Response.json({ error: "Choose YouTube or Pinterest." }, { status: 400 });

  const state = randomBytes(32).toString("base64url");
  const { error } = await client.from("social_oauth_states").insert({
    state, platform, expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  if (error) return Response.json({ error: "The secure reconnect could not be started." }, { status: 400 });

  if (platform === "youtube") {
    const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
    if (!clientId) return Response.json({ error: "YouTube OAuth is not configured." }, { status: 400 });
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", "https://otherpeoplesrecipes.co.uk/api/youtube/callback");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("include_granted_scopes", "true");
    url.searchParams.set("scope", "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly");
    url.searchParams.set("state", state);
    return Response.json({ url: url.toString() });
  }

  const clientId = process.env.PINTEREST_CLIENT_ID;
  if (!clientId) return Response.json({ error: "Pinterest OAuth is not configured." }, { status: 400 });
  const url = new URL("https://www.pinterest.com/oauth/");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", "https://otherpeoplesrecipes.co.uk/api/pinterest/callback");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "boards:read,pins:read,user_accounts:read");
  url.searchParams.set("state", state);
  return Response.json({ url: url.toString() });
}
