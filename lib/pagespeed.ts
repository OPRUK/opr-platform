import "server-only";

import {
  parsePageSpeedResponse,
  type PageSpeedApiResponse,
  type PageSpeedSummary,
} from "./pagespeed-data";

export type { PageSpeedSummary } from "./pagespeed-data";

const CACHE_MS = 15 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 45_000;
const DEFAULT_TEST_URL = "https://otherpeoplesrecipes.co.uk/";

let cached: { data: PageSpeedSummary; expiresAt: number } | null = null;

export async function getPageSpeedSummary(
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<PageSpeedSummary | null> {
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.data;

  const targetUrl = process.env.PAGESPEED_TEST_URL ?? DEFAULT_TEST_URL;
  const apiKey = process.env.PAGESPEED_API_KEY;
  // Google's anonymous PageSpeed quota is not reliable for automated use.
  // Keep the dated report visible until a project-owned API key is supplied.
  if (!apiKey) return null;

  const apiUrl = new URL("https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed");
  apiUrl.searchParams.set("url", targetUrl);
  apiUrl.searchParams.set("strategy", "mobile");
  apiUrl.searchParams.set("locale", "en_GB");
  for (const category of ["performance", "accessibility", "best-practices", "seo"]) {
    apiUrl.searchParams.append("category", category);
  }

  apiUrl.searchParams.set("key", apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(JSON.stringify({
        level: "error",
        message: "PageSpeed Insights request failed",
        status: response.status,
        durationMs: Date.now() - startedAt,
      }));
      return null;
    }

    const payload = (await response.json()) as PageSpeedApiResponse;
    const summary = parsePageSpeedResponse(payload, targetUrl);
    if (!summary) {
      console.error(JSON.stringify({
        level: "error",
        message: "PageSpeed Insights response was incomplete",
        durationMs: Date.now() - startedAt,
      }));
      return null;
    }

    cached = { data: summary, expiresAt: Date.now() + CACHE_MS };
    console.log(JSON.stringify({
      level: "info",
      message: "PageSpeed Insights request completed",
      strategy: summary.strategy,
      durationMs: Date.now() - startedAt,
    }));
    return summary;
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      message: "PageSpeed Insights request could not be completed",
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
    }));
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
