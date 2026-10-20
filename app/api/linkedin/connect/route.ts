import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";

export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const { client } = await requireAdmin(request);
  if (!client) return new NextResponse("Admin sign-in required", { status: 401 });
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) return new NextResponse("LinkedIn app is not configured", { status: 503 });
  const state = randomBytes(32).toString("base64url");
  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", "https://otherpeoplesrecipes.co.uk/api/linkedin/callback");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "rw_organization_admin r_organization_social");
  url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set("opr_linkedin_oauth_state", state, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/api/linkedin", maxAge: 600,
  });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
