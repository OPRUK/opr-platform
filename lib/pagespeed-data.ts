import type { SeoTechnicalReport } from "./analytics-report-types";

type LighthouseCategory = { score?: number | null };
type LighthouseAudit = { numericValue?: number | null };

export type PageSpeedApiResponse = {
  analysisUTCTimestamp?: string;
  lighthouseResult?: {
    fetchTime?: string;
    finalUrl?: string;
    lighthouseVersion?: string;
    categories?: Record<string, LighthouseCategory | undefined>;
    audits?: Record<string, LighthouseAudit | undefined>;
  };
};

export type PageSpeedSummary = {
  metrics: SeoTechnicalReport["pageSpeed"];
  testedUrl: string;
  strategy: "mobile";
  fetchedAt: string;
  lighthouseVersion: string | null;
};

function categoryScore(category: LighthouseCategory | undefined) {
  return typeof category?.score === "number"
    ? Math.round(category.score * 100)
    : null;
}

function auditValue(audit: LighthouseAudit | undefined) {
  return typeof audit?.numericValue === "number" ? audit.numericValue : null;
}

function seconds(milliseconds: number | null) {
  return milliseconds === null ? null : Number((milliseconds / 1_000).toFixed(2));
}

export function parsePageSpeedResponse(
  payload: PageSpeedApiResponse,
  targetUrl: string,
): PageSpeedSummary | null {
  const lighthouse = payload.lighthouseResult;
  const categories = lighthouse?.categories;
  const audits = lighthouse?.audits;

  const performance = categoryScore(categories?.performance);
  const accessibility = categoryScore(categories?.accessibility);
  const bestPractices = categoryScore(categories?.["best-practices"]);
  const seo = categoryScore(categories?.seo);
  const firstContentfulPaint = seconds(auditValue(audits?.["first-contentful-paint"]));
  const largestContentfulPaint = seconds(auditValue(audits?.["largest-contentful-paint"]));
  const totalBlockingTime = auditValue(audits?.["total-blocking-time"]);
  const cumulativeLayoutShift = auditValue(audits?.["cumulative-layout-shift"]);
  const speedIndex = seconds(auditValue(audits?.["speed-index"]));

  if (
    performance === null ||
    accessibility === null ||
    bestPractices === null ||
    seo === null ||
    firstContentfulPaint === null ||
    largestContentfulPaint === null ||
    totalBlockingTime === null ||
    cumulativeLayoutShift === null ||
    speedIndex === null
  ) {
    return null;
  }

  return {
    metrics: [
      { metric: "Performance", value: performance, unit: "score", context: "Latest Google Lighthouse mobile lab score; results can vary between runs." },
      { metric: "Accessibility", value: accessibility, unit: "score", context: "Automated Lighthouse accessibility audit; manual accessibility checks are still required." },
      { metric: "Best Practices", value: bestPractices, unit: "score", context: "Latest Lighthouse best-practices audit." },
      { metric: "SEO", value: seo, unit: "score", context: "Latest Lighthouse technical SEO audit; this is not a Google ranking score." },
      { metric: "First Contentful Paint", value: firstContentfulPaint, unit: "seconds", context: "Mobile lab estimate for the first visible content." },
      { metric: "Largest Contentful Paint", value: largestContentfulPaint, unit: "seconds", context: "Mobile lab estimate for the largest visible content." },
      { metric: "Total Blocking Time", value: Math.round(totalBlockingTime), unit: "milliseconds", context: "Mobile lab estimate of main-thread blocking during load." },
      { metric: "Cumulative Layout Shift", value: Number(cumulativeLayoutShift.toFixed(3)), unit: "score", context: "Mobile lab estimate of unexpected layout movement." },
      { metric: "Speed Index", value: speedIndex, unit: "seconds", context: "Mobile lab estimate of how quickly page content becomes visible." },
    ],
    testedUrl: lighthouse?.finalUrl ?? targetUrl,
    strategy: "mobile",
    fetchedAt: payload.analysisUTCTimestamp ?? lighthouse?.fetchTime ?? new Date().toISOString(),
    lighthouseVersion: lighthouse?.lighthouseVersion ?? null,
  };
}
