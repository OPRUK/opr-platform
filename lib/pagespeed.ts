import "server-only";

type Category = { score?: number | null };
type Audit = { numericValue?: number | null };

type PageSpeedPayload = {
  lighthouseResult?: {
    fetchTime?: string;
    lighthouseVersion?: string;
    categories?: Record<string, Category>;
    audits?: Record<string, Audit>;
  };
  loadingExperience?: { overall_category?: string };
  originLoadingExperience?: { overall_category?: string };
};

export type PageSpeedSummary = {
  fetchedAt: string;
  lighthouseVersion: string | null;
  strategy: "mobile";
  testedUrl: string;
  fieldCategory: string | null;
  metrics: Array<{ metric: string; value: number; unit: string; context: string }>;
};

const testedUrl = "https://otherpeoplesrecipes.co.uk/";

function score(category: Category | undefined) {
  return Math.round((category?.score ?? 0) * 100);
}

function milliseconds(audit: Audit | undefined) {
  return Number((audit?.numericValue ?? 0).toFixed(0));
}

function seconds(audit: Audit | undefined) {
  return Number(((audit?.numericValue ?? 0) / 1000).toFixed(2));
}

export async function getPageSpeedSummary(forceRefresh = false): Promise<PageSpeedSummary | null> {
  const url = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  url.searchParams.set("url", testedUrl);
  url.searchParams.set("strategy", "mobile");
  for (const category of ["performance", "accessibility", "best-practices", "seo"]) {
    url.searchParams.append("category", category);
  }
  if (process.env.GOOGLE_PAGESPEED_API_KEY) {
    url.searchParams.set("key", process.env.GOOGLE_PAGESPEED_API_KEY);
  }

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(45_000),
      ...(forceRefresh ? { cache: "no-store" as const } : { next: { revalidate: 21_600 } }),
    });
    if (!response.ok) {
      console.warn("OPR PageSpeed query failed", response.status);
      return null;
    }

    const payload = await response.json() as PageSpeedPayload;
    const lighthouse = payload.lighthouseResult;
    if (!lighthouse?.categories || !lighthouse.audits) return null;

    const categories = lighthouse.categories;
    const audits = lighthouse.audits;
    const fieldCategory = payload.loadingExperience?.overall_category
      ?? payload.originLoadingExperience?.overall_category
      ?? null;

    return {
      fetchedAt: lighthouse.fetchTime ?? new Date().toISOString(),
      lighthouseVersion: lighthouse.lighthouseVersion ?? null,
      strategy: "mobile",
      testedUrl,
      fieldCategory,
      metrics: [
        { metric: "Performance", value: score(categories.performance), unit: "score", context: "Live mobile Lighthouse lab score." },
        { metric: "Accessibility", value: score(categories.accessibility), unit: "score", context: "Live mobile Lighthouse accessibility score." },
        { metric: "Best Practices", value: score(categories["best-practices"]), unit: "score", context: "Live mobile Lighthouse best-practices score." },
        { metric: "SEO", value: score(categories.seo), unit: "score", context: "Live mobile Lighthouse SEO score." },
        { metric: "First Contentful Paint", value: seconds(audits["first-contentful-paint"]), unit: "seconds", context: "Live mobile lab result." },
        { metric: "Largest Contentful Paint", value: seconds(audits["largest-contentful-paint"]), unit: "seconds", context: "Live mobile lab result." },
        { metric: "Total Blocking Time", value: milliseconds(audits["total-blocking-time"]), unit: "milliseconds", context: "Live mobile lab result." },
        { metric: "Cumulative Layout Shift", value: Number((audits["cumulative-layout-shift"]?.numericValue ?? 0).toFixed(3)), unit: "score", context: "Live mobile lab result." },
        { metric: "Speed Index", value: seconds(audits["speed-index"]), unit: "seconds", context: "Live mobile lab result." },
      ],
    };
  } catch (error) {
    console.warn("OPR PageSpeed query could not complete", error);
    return null;
  }
}
