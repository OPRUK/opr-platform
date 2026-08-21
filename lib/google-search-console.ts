import "server-only";
import { createSign } from "node:crypto";

const SITE_URL = "sc-domain:otherpeoplesrecipes.co.uk";
const CACHE_MS = 15 * 60 * 1000;
const REPORT_WINDOW_DAYS = 28;

export type SearchConsoleRow = { label: string; clicks: number; impressions: number };

export type SearchConsoleSummary = {
  period: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
  provisionalFrom: string | null;
  queries: SearchConsoleRow[];
  pages: SearchConsoleRow[];
  countries: SearchConsoleRow[];
  devices: SearchConsoleRow[];
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

async function queryDimension(
  accessToken: string,
  dimension: "query" | "page" | "country" | "device",
  startDate: string,
  endDate: string,
): Promise<SearchConsoleRow[]> {
  const response = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: [dimension],
        dataState: "all",
        rowLimit: 10,
      }),
    },
  );

  if (!response.ok) {
    console.error(`OPR Search Console ${dimension} query failed`, await response.text());
    return [];
  }

  const payload = await response.json();
  const rows = (payload.rows ?? []) as Array<{ keys?: string[]; clicks?: number; impressions?: number }>;
  return rows.map((row) => ({
    label: row.keys?.[0] ?? "Unknown",
    clicks: Math.round(row.clicks ?? 0),
    impressions: Math.round(row.impressions ?? 0),
  }));
}

export async function getSearchConsoleSummary(
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<SearchConsoleSummary | null> {
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.data;

  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  // Vercel env vars are single strings, so the key's real newlines are
  // stored escaped as literal "\n" — restore them before signing with it.
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) return null;

  try {
    const accessToken = await getAccessToken(clientEmail, privateKey);
    if (!accessToken) return null;

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - (REPORT_WINDOW_DAYS - 1));
    const since = isoDate(startDate);
    const until = isoDate(endDate);

    const [response, queries, pages, countries, devices] = await Promise.all([
      fetch(
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: since,
            endDate: until,
            dimensions: [],
            dataState: "all",
          }),
        },
      ),
      queryDimension(accessToken, "query", since, until),
      queryDimension(accessToken, "page", since, until),
      queryDimension(accessToken, "country", since, until),
      queryDimension(accessToken, "device", since, until),
    ]);

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
      provisionalFrom: payload.metadata?.first_incomplete_date ?? null,
      queries,
      pages,
      countries,
      devices,
      fetchedAt: new Date().toISOString(),
    };

    cached = { data: summary, expiresAt: Date.now() + CACHE_MS };
    return summary;
  } catch (error) {
    console.error("OPR Search Console summary could not be loaded", error);
    return null;
  }
}
