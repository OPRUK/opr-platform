export type GoogleIndexInspection = {
  url: string;
  indexed: boolean | null;
  verdict: string | null;
  coverageState: string | null;
  indexingState: string | null;
  pageFetchState: string | null;
  lastCrawlTime: string | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  crawledAs: string | null;
  error: string | null;
};

export type GoogleIndexAudit = {
  auditedAt: string;
  sitemapUrl: string;
  submittedUrls: number;
  inspectedUrls: number;
  indexedUrls: number;
  notIndexedUrls: number;
  failedInspections: number;
  results: GoogleIndexInspection[];
};

type IndexStatusResult = {
  verdict?: unknown;
  coverageState?: unknown;
  indexingState?: unknown;
  pageFetchState?: unknown;
  lastCrawlTime?: unknown;
  googleCanonical?: unknown;
  userCanonical?: unknown;
  crawledAs?: unknown;
};

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function decodeXmlText(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export function extractSitemapUrls(xml: string, expectedOrigin: string): string[] {
  const origin = new URL(expectedOrigin).origin;
  const urls = new Set<string>();

  for (const match of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)) {
    try {
      const parsed = new URL(decodeXmlText(match[1].trim()));
      if (parsed.origin !== origin || !["http:", "https:"].includes(parsed.protocol)) continue;
      parsed.hash = "";
      urls.add(parsed.toString());
    } catch {
      // Ignore malformed or external sitemap entries rather than sending them
      // to Google's inspection endpoint.
    }
  }

  return [...urls].sort((left, right) => left.localeCompare(right));
}

export function normaliseIndexInspection(
  url: string,
  result: IndexStatusResult,
): GoogleIndexInspection {
  const verdict = stringOrNull(result.verdict);
  return {
    url,
    indexed: verdict === "PASS",
    verdict,
    coverageState: stringOrNull(result.coverageState),
    indexingState: stringOrNull(result.indexingState),
    pageFetchState: stringOrNull(result.pageFetchState),
    lastCrawlTime: stringOrNull(result.lastCrawlTime),
    googleCanonical: stringOrNull(result.googleCanonical),
    userCanonical: stringOrNull(result.userCanonical),
    crawledAs: stringOrNull(result.crawledAs),
    error: null,
  };
}

export function failedIndexInspection(url: string, error: string): GoogleIndexInspection {
  return {
    url,
    indexed: null,
    verdict: null,
    coverageState: null,
    indexingState: null,
    pageFetchState: null,
    lastCrawlTime: null,
    googleCanonical: null,
    userCanonical: null,
    crawledAs: null,
    error,
  };
}

export function summariseIndexAudit(
  sitemapUrl: string,
  results: GoogleIndexInspection[],
  auditedAt = new Date().toISOString(),
  submittedUrls = results.length,
): GoogleIndexAudit {
  const inspected = results.filter((result) => result.indexed !== null);
  return {
    auditedAt,
    sitemapUrl,
    submittedUrls,
    inspectedUrls: inspected.length,
    indexedUrls: inspected.filter((result) => result.indexed).length,
    notIndexedUrls: inspected.filter((result) => result.indexed === false).length,
    failedInspections: results.filter((result) => result.indexed === null).length,
    results,
  };
}

export function indexAuditTreatment(result: GoogleIndexInspection): string {
  if (result.error) return "Retry the inspection during the next audit.";
  if (result.indexingState?.includes("BLOCKED")) {
    return "Remove the indexing block if this page should appear in Google, then request indexing.";
  }
  if (result.pageFetchState && result.pageFetchState !== "SUCCESSFUL") {
    return "Fix the page-fetch problem first, confirm the live URL works, then request indexing.";
  }
  if (result.googleCanonical && result.userCanonical && result.googleCanonical !== result.userCanonical) {
    return "Review the canonical choice and internal links so Google receives one consistent preferred URL.";
  }
  const coverage = result.coverageState?.toLowerCase() ?? "";
  if (coverage.includes("discovered")) {
    return "Strengthen internal links to this page and request indexing after the next production update.";
  }
  if (coverage.includes("crawled")) {
    return "Improve the page's distinct value and internal links, then request indexing in Search Console.";
  }
  return "Inspect the URL in Search Console, resolve the reported reason and request indexing if appropriate.";
}

export function indexAuditPriority(result: GoogleIndexInspection): string {
  if (result.error) return "Retry";
  if (result.indexingState?.includes("BLOCKED")) return "P1";
  if (result.pageFetchState && result.pageFetchState !== "SUCCESSFUL") return "P1";
  return "P2";
}
