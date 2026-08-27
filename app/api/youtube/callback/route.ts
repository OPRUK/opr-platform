import { NextRequest, NextResponse } from "next/server";
import { consumeSocialOAuthState, saveSocialConnection } from "../../../../lib/social-connections";

export const runtime = "nodejs";
const REDIRECT_URI = "https://otherpeoplesrecipes.co.uk/api/youtube/callback";

function back(status: "connected" | "failed") {
  return NextResponse.redirect(`https://otherpeoplesrecipes.co.uk/admin/analytics?youtube=${status}`);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state || !(await consumeSocialOAuthState(state, "youtube"))) return back("failed");
  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return back("failed");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: REDIRECT_URI, grant_type: "authorization_code" }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || typeof payload?.refresh_token !== "string") return back("failed");
  return back(await saveSocialConnection("youtube", payload.refresh_token, String(payload.scope ?? "")) ? "connected" : "failed");
}
