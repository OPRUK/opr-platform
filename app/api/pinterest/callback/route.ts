import { NextRequest, NextResponse } from "next/server";
import { consumeSocialOAuthState, saveSocialConnection } from "../../../../lib/social-connections";

export const runtime = "nodejs";
const REDIRECT_URI = "https://otherpeoplesrecipes.co.uk/api/pinterest/callback";

function back(status: "connected" | "failed") {
  return NextResponse.redirect(`https://otherpeoplesrecipes.co.uk/admin/analytics?pinterest=${status}`);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state || !(await consumeSocialOAuthState(state, "pinterest"))) return back("failed");
  const clientId = process.env.PINTEREST_CLIENT_ID;
  const clientSecret = process.env.PINTEREST_CLIENT_SECRET;
  if (!clientId || !clientSecret) return back("failed");
  const response = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || typeof payload?.refresh_token !== "string") return back("failed");
  return back(await saveSocialConnection("pinterest", payload.refresh_token, String(payload.scope ?? "")) ? "connected" : "failed");
}
