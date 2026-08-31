import type {
  AnalyticsSnapshot,
  AnalyticsSocialFilmSummary,
  DashboardPriority,
} from "./admin-analytics-types";
import type { AnalyticsReport } from "./analytics-report-types";

type RecipeAudit = {
  title: string;
  faqCount: number;
  visualCount: number;
};

type PriorityInputs = {
  now: string;
  linkClicks: number;
  ctaClicks: number;
  conversions: number;
  campaigns: number;
  snapshot: AnalyticsSnapshot | null;
  report: AnalyticsReport;
  films: AnalyticsSocialFilmSummary[];
  recipes: RecipeAudit[];
};

function ageInHours(value: string, now: string) {
  return Math.max(0, (Date.parse(now) - Date.parse(value)) / 3_600_000);
}

function scoreMetric(report: AnalyticsReport, name: string) {
  return report.seoTechnical.pageSpeed.find((metric) => metric.metric === name)?.value ?? null;
}

export function buildDashboardPriorities(input: PriorityInputs): DashboardPriority[] {
  const priorities: DashboardPriority[] = [];
  const add = (priority: DashboardPriority) => priorities.push(priority);

  if (!input.snapshot) {
    add({
      id: "analytics-baseline-missing",
      priority: "P1",
      area: "Measurement",
      title: "Restore the analytics baseline",
      evidence: "Website, search and social baseline data is unavailable in this environment.",
      action: "Check the daily snapshot job and OPR_ANALYTICS_SNAPSHOT fallback before making channel decisions.",
      source: "live data",
    });
  } else {
    const coreSources = [
      ["Website", input.snapshot.website.fetchedAt],
      ["Google Search", input.snapshot.google.fetchedAt],
    ] as const;
    const staleCoreSources = coreSources.filter(([, fetchedAt]) =>
      !fetchedAt || ageInHours(fetchedAt, input.now) > 48,
    );
    if (staleCoreSources.length) {
      add({
        id: "core-data-stale",
        priority: "P1",
        area: "Measurement",
        title: "Restore current website and search data",
        evidence: `${staleCoreSources.map(([name]) => name).join(" and ")} ${staleCoreSources.length === 1 ? "is" : "are"} missing or more than 48 hours old.`,
        action: "Refresh the dashboard, then inspect the affected API credentials and scheduled snapshot logs if the timestamp does not advance.",
        source: "live data",
      });
    }

    const manualPlatforms = input.snapshot.social
      .filter((platform) => !platform.fetchedAt || ageInHours(platform.fetchedAt, input.now) > 48)
      .map((platform) => platform.platform);
    if (manualPlatforms.length) {
      add({
        id: "social-data-manual",
        priority: "P2",
        area: "Measurement",
        title: "Close remaining social-data gaps",
        evidence: `${manualPlatforms.join(", ")} ${manualPlatforms.length === 1 ? "is" : "are"} missing a current API result or last refreshed more than 48 hours ago.`,
        action: "Restore or obtain API access where practical; until then, date every manual update and treat cross-channel comparisons as directional.",
        source: "live data",
      });
    }
  }

  const actions = input.ctaClicks + input.linkClicks;
  if (actions >= 20 && input.conversions === 0) {
    add({
      id: "conversion-zero",
      priority: "P1",
      area: "Conversion",
      title: "Repair or simplify the participation journey",
      evidence: `${actions} tracked actions produced no recorded conversions in the current window.`,
      action: "Test each primary form end to end, confirm success events are stored, then remove competing calls to action on the weakest landing pages.",
      source: "live data",
    });
  } else if (actions >= 20 && input.conversions / actions < 0.05) {
    add({
      id: "conversion-low",
      priority: "P2",
      area: "Conversion",
      title: "Improve action-to-conversion performance",
      evidence: `${input.conversions} conversions were recorded from ${actions} tracked actions (${Math.round((input.conversions / actions) * 100)}%).`,
      action: "Compare conversion rates by source and campaign, then simplify the lowest-performing journey first.",
      source: "live data",
    });
  }

  if (input.linkClicks > 0 && input.campaigns === 0) {
    add({
      id: "campaign-coding-missing",
      priority: "P2",
      area: "Attribution",
      title: "Add campaign codes to active links",
      evidence: `${input.linkClicks} link clicks were recorded without any campaign grouping.`,
      action: "Add a stable utm_campaign value to every current social, email and partner link.",
      source: "live data",
    });
  }

  const accessibility = scoreMetric(input.report, "Accessibility");
  const performance = scoreMetric(input.report, "Performance");
  if (accessibility !== null && accessibility < 100) {
    add({
      id: "accessibility-score",
      priority: accessibility < 90 ? "P1" : "P2",
      area: "Accessibility",
      title: "Resolve current accessibility audit findings",
      evidence: `The latest mobile Lighthouse accessibility score is ${accessibility}/100.`,
      action: "Review the failing Lighthouse audits, then verify fixes with keyboard, screen-reader and contrast checks as well as automation.",
      source: "live data",
    });
  }
  if (performance !== null && performance < 90) {
    add({
      id: "performance-score",
      priority: "P1",
      area: "Performance",
      title: "Recover mobile performance",
      evidence: `The latest mobile Lighthouse performance score is ${performance}/100.`,
      action: "Inspect the slowest route and largest asset, then retest before publishing further media-heavy changes.",
      source: "live data",
    });
  }

  const missingFilmCoverage = input.films.filter((film) =>
    [film.facebookViews, film.instagramViews, film.tiktokViews, film.youtubeViews, film.pinterestImpressions]
      .some((value) => value === null),
  );
  if (missingFilmCoverage.length) {
    add({
      id: "film-reporting-coverage",
      priority: "P2",
      area: "Film reporting",
      title: "Review unmatched film metrics",
      evidence: `${missingFilmCoverage.length} of ${input.films.length} films have at least one unmatched channel metric.`,
      action: "Confirm whether each film was published on that channel; add a stable platform ID or caption alias only where a post genuinely exists.",
      source: "live data",
    });
  }

  const incompleteFaqs = input.recipes.filter((recipe) => recipe.faqCount < 4);
  const incompleteVisuals = input.recipes.filter((recipe) => recipe.visualCount !== 3);
  if (incompleteFaqs.length) {
    add({
      id: "recipe-faq-coverage",
      priority: "P2",
      area: "Recipe quality",
      title: "Complete helpful-answer coverage",
      evidence: `${incompleteFaqs.length} curated ${incompleteFaqs.length === 1 ? "recipe has" : "recipes have"} fewer than four verified helpful answers: ${incompleteFaqs.map((recipe) => recipe.title).join(", ")}.`,
      action: "Add answers based only on the approved recipe, method and cook notes; do not invent substitutions or timings.",
      source: "site audit",
    });
  }
  if (incompleteVisuals.length) {
    add({
      id: "recipe-visual-coverage",
      priority: "P2",
      area: "Recipe quality",
      title: "Complete visual cooking guides",
      evidence: `${incompleteVisuals.length} curated ${incompleteVisuals.length === 1 ? "recipe is" : "recipes are"} missing a complete three-stage visual guide: ${incompleteVisuals.map((recipe) => recipe.title).join(", ")}.`,
      action: "Create and editorially verify three useful method-stage images with accurate alt text before publishing them.",
      source: "site audit",
    });
  }

  const reportAgeDays = ageInHours(input.report.staticDataUpdatedAt, input.now) / 24;
  if (reportAgeDays > 7) {
    add({
      id: "static-report-stale",
      priority: reportAgeDays > 30 ? "P1" : "P2",
      area: "Reporting",
      title: "Refresh the manual report layer",
      evidence: `The remaining manual report fields are ${Math.floor(reportAgeDays)} days old.`,
      action: "Refresh only fields that cannot be sourced automatically, archive resolved actions, and update the report timestamp.",
      source: "site audit",
    });
  }

  return priorities.sort((a, b) =>
    a.priority.localeCompare(b.priority) || a.area.localeCompare(b.area) || a.title.localeCompare(b.title),
  );
}
