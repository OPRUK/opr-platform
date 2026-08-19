import "server-only";

import { NextRequest, NextResponse } from "next/server";

const REDIRECT_URI = "https://otherpeoplesrecipes.co.uk/api/linkedin/callback";

function htmlResponse(body: string) {
  return new NextResponse(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const errorDescription = request.nextUrl.searchParams.get("error_description");

  if (error) {
    return htmlResponse(`<p>LinkedIn authorization failed: ${error} — ${errorDescription ?? ""}</p>`);
  }
  if (!code) {
    return htmlResponse("<p>Missing authorization code.</p>");
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return htmlResponse("<p>Server is missing LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET.</p>");
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

  const payload = await tokenResponse.json();

  if (!tokenResponse.ok || typeof payload.refresh_token !== "string") {
    return htmlResponse(`<p>Token exchange failed.</p><pre>${JSON.stringify(payload, null, 2)}</pre>`);
  }

  const refreshToken = JSON.stringify(payload.refresh_token);
  const scope = String(payload.scope ?? "");

  return htmlResponse(`<!doctype html>
<html>
  <body style="font-family: sans-serif; max-width: 40rem; margin: 3rem auto;">
    <h1>LinkedIn authorized</h1>
    <p>Scope: ${scope}</p>
    <p>Click below, then paste into the terminal / Vercel env command.</p>
    <button id="copy" style="font-size: 1rem; padding: 0.5rem 1rem;">Copy refresh token</button>
    <script>
      document.getElementById("copy").addEventListener("click", function () {
        var ta = document.createElement("textarea");
        ta.value = ${refreshToken};
        ta.style.position = "fixed";
        ta.style.top = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        this.textContent = "Copied";
      });
    </script>
  </body>
</html>`);
}
