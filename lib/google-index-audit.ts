import "server-only";

import { SITE_URL } from "./site";
import {
  failedIndexInspection,
  extractSitemapUrls,
  normaliseIndexInspection,
  summariseIndexAudit,
  type GoogleIndexAudit,
  type GoogleIndexInspection,
} from "./google-index-audit-core";
import {
  getSearchConsoleAccessToken,
  SEARCH_CONSOLE_SITE_URL,
} from "./google-search-console";

const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const MAX_URLS_PER_AUDIT = 100;
const CONCURRENCY = 10;

type UrlInspectionResponse = {
  inspectionResult?: {
    indexStatusResult?: {
      verdict?: unknown;
      coverageState?: unknown;
      indexingState?: unknown;
      pageFetchState?: unknown;
      lastCrawlTime?: unknown;
      googleCanonical?: unknown;
      userCanonical?: unknown;
      crawledAs?: unknown;
    };
  };
};

async function inspectUrl(
  accessToken: string,
  url: string,
): Promise<GoogleIndexInspection> {
  try {
    const response = await fetch(
      "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inspectionUrl: url,
          siteUrl: SEARCH_CONSOLE_SITE_URL,
          languageCode: "en-GB",
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      console.error(`OPR Google URL inspection failed for ${url}`, response.status, detail);
      return failedIndexInspection(url, `Google inspection returned HTTP ${response.status}.`);
    }

    const payload = (await response.json()) as UrlInspectionResponse;
    const status = payload.inspectionResult?.indexStatusResult;
    if (!status) return failedIndexInspection(url, "Google returned no index-status result.");
    return normaliseIndexInspection(url, status);
  } catch (error) {
    console.error(`OPR Google URL inspection could not complete for ${url}`, error);
    return failedIndexInspection(
      url,
      error instanceof Error && error.name === "TimeoutError"
        ? "Google inspection timed out."
        : "Google inspection could not be completed.",
    );
  }
}

async function inspectWithConcurrency(
  accessToken: string,
  urls: string[],
): Promise<GoogleIndexInspection[]> {
  const results = new Array<GoogleIndexInspection>(urls.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < urls.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await inspectUrl(accessToken, urls[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, urls.length) }, () => worker()),
  );
  return results;
}

export async function runGoogleIndexAudit(): Promise<GoogleIndexAudit | null> {
  try {
    const [accessToken, sitemapResponse] = await Promise.all([
      getSearchConsoleAccessToken(),
      fetch(SITEMAP_URL, { cache: "no-store", signal: AbortSignal.timeout(10_000) }),
    ]);
    if (!accessToken) return null;
    if (!sitemapResponse.ok) {
      console.error("OPR sitemap could not be loaded for the Google index audit", sitemapResponse.status);
      return null;
    }

    const sitemapUrls = extractSitemapUrls(await sitemapResponse.text(), SITE_URL);
    if (!sitemapUrls.length) {
      console.error("OPR sitemap contained no inspectable URLs");
      return null;
    }

    const inspected = await inspectWithConcurrency(
      accessToken,
      sitemapUrls.slice(0, MAX_URLS_PER_AUDIT),
    );
    return summariseIndexAudit(
      SITEMAP_URL,
      inspected,
      new Date().toISOString(),
      sitemapUrls.length,
    );
  } catch (error) {
    console.error("OPR Google sitemap index audit failed", error);
    return null;
  }
}
