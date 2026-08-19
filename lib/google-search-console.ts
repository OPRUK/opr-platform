import "server-only";
import { createSign } from "node:crypto";

const SITE_URL = "https://otherpeoplesrecipes.co.uk/";
const CACHE_MS = 15 * 60 * 1000;
// Search Console's own data is typically incomplete for the most recent
// day or two, so the query window ends a couple of days back rather than
// "today" to avoid an artificially low final day dragging the average down.
const REPORT_LAG_DAYS = 2;
const REPORT_WINDOW_DAYS = 28;

export type SearchConsoleSummary = {
  period: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
  fetchedAt: string;
};

// Module-scope cache: best-effort within a warm serverless instance, not a
// shared/persistent cache across instances. Good enough for a low-traffic
// admin-only dashboard — worst case is an extra API call on a cold start,
// not a stale read.
let cached: { data: SearchConsoleSummary; expiresAt: number } | null = null;

function base64url(input: Buffer) {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string | null> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const encodedHeader = base64url(Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const encodedClaims = base64url(
    Buffer.from(
      JSON.stringify({
        iss: clientEmail,
        scope: "https://www.googleapis.com/auth/webmasters.readonly",
        aud: "https://oauth2.googleapis.com/token",
        iat: nowSeconds,
        exp: nowSeconds + 3600,
      }),
    ),
  );
  const signingInput = `${encodedHeader}.${encodedClaims}`;

  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = base64url(signer.sign(privateKey));

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${signingInput}.${signature}`,
    }),
  });

  if (!response.ok) {
    console.error("OPR Search Console auth failed", await response.text());
    return null;
  }

  const payload = await response.json();
  return typeof payload.access_token === "string" ? payload.access_token : null;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getSearchConsoleSummary(): Promise<SearchConsoleSummary | null> {
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  // Vercel env vars are single strings, so the key's real newlines are
  // stored escaped as literal "\n" — restore them before signing with it.
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) return null;

  try {
    const accessToken = await getAccessToken(clientEmail, privateKey);
    if (!accessToken) return null;

    const endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() - REPORT_LAG_DAYS);
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - (REPORT_WINDOW_DAYS - 1));

    const response = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: isoDate(startDate),
          endDate: isoDate(endDate),
          dimensions: [],
        }),
      },
    );

    if (!response.ok) {
      console.error("OPR Search Console query failed", await response.text());
      return null;
    }

    const payload = await response.json();
    const row = payload.rows?.[0] as
      | { clicks?: number; impressions?: number; ctr?: number; position?: number }
      | undefined;

    const summary: SearchConsoleSummary = {
      period: `${REPORT_WINDOW_DAYS} days to ${isoDate(endDate)}`,
      clicks: Math.round(row?.clicks ?? 0),
      impressions: Math.round(row?.impressions ?? 0),
      ctr: row?.ctr ?? 0,
      averagePosition: row?.position ?? 0,
      fetchedAt: new Date().toISOString(),
    };

    cached = { data: summary, expiresAt: Date.now() + CACHE_MS };
    return summary;
  } catch (error) {
    console.error("OPR Search Console summary could not be loaded", error);
    return null;
  }
}
