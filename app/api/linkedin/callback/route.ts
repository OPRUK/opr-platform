import "server-only";

import { NextRequest, NextResponse } from "next/server";

const REDIRECT_URI = "https://otherpeoplesrecipes.co.uk/api/linkedin/callback";
const SETUP_STATE = "opr-linkedin-setup";

function htmlResponse(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "text/html; charset=utf-8",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const errorDescription = request.nextUrl.searchParams.get("error_description");

  if (error) {
    return htmlResponse(
      `<p>LinkedIn authorization failed: ${escapeHtml(error)} — ${escapeHtml(errorDescription ?? "")}</p>`,
      400,
    );
  }
  if (state !== SETUP_STATE) {
    return htmlResponse("<p>LinkedIn authorization state did not match.</p>", 400);
  }
  if (!code) {
    return htmlResponse("<p>Missing authorization code.</p>", 400);
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return htmlResponse("<p>Server is missing LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET.</p>", 500);
  }

  const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const payload = await tokenResponse.json().catch(() => null) as Record<string, unknown> | null;

  if (!tokenResponse.ok || !payload) {
    return htmlResponse("<p>LinkedIn token exchange failed. Please restart the authorization flow.</p>", 400);
  }

  const hasRefreshToken = typeof payload.refresh_token === "string";
  const token = hasRefreshToken ? payload.refresh_token : payload.access_token;
  if (typeof token !== "string") {
    return htmlResponse("<p>LinkedIn did not return a usable token. Please restart the authorization flow.</p>", 400);
  }

  const variableName = hasRefreshToken ? "LINKEDIN_REFRESH_TOKEN" : "LINKEDIN_ACCESS_TOKEN";
  const expiresIn = hasRefreshToken ? payload.refresh_token_expires_in : payload.expires_in;
  const expiryDays = typeof expiresIn === "number" ? Math.round(expiresIn / 86_400) : null;
  const serializedToken = JSON.stringify(token).replaceAll("<", "\\u003c");
  const scope = String(payload.scope ?? "");

  return htmlResponse(`<!doctype html>
<html>
  <body style="font-family: sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem;">
    <h1>LinkedIn authorized</h1>
    <p>Scope: ${escapeHtml(scope)}</p>
    <p>Vercel variable: <strong>${variableName}</strong></p>
    ${expiryDays ? `<p>Expected lifespan: approximately ${expiryDays} days.</p>` : ""}
    <p>Copy the token below, then replace this variable in the OPR Vercel production environment.</p>
    <button id="copy" style="font-size: 1rem; padding: 0.75rem 1rem;">Copy ${variableName}</button>
    <script>
      window.history.replaceState({}, "", "/api/linkedin/callback");
      document.getElementById("copy").addEventListener("click", function () {
        var ta = document.createElement("textarea");
        ta.value = ${serializedToken};
        ta.style.position = "fixed";
        ta.style.top = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        this.textContent = "Copied — paste into Vercel";
      });
    </script>
  </body>
</html>`);
}
