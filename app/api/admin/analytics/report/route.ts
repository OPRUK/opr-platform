import ExcelJS from "exceljs";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { loadAdminAnalytics } from "../../../../../lib/admin-analytics-server";

export const runtime = "nodejs";

const colours = {
  green: "FF123C39",
  gold: "FFDDB765",
  cream: "FFFFF3DF",
  white: "FFFFFFFF",
};

function styleSheet(worksheet: ExcelJS.Worksheet) {
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.getRow(1).font = { bold: true, color: { argb: colours.white } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: colours.green },
  };
  worksheet.getRow(1).alignment = { vertical: "middle" };
  worksheet.autoFilter = {
    from: "A1",
    to: `${worksheet.getColumn(worksheet.columnCount).letter}${Math.max(1, worksheet.rowCount)}`,
  };

  for (let index = 2; index <= worksheet.rowCount; index += 1) {
    if (index % 2 === 0) {
      worksheet.getRow(index).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colours.cream },
      };
    }
  }
}

function isCurrentData(value: string | null) {
  if (!value) return false;
  const refreshedAt = Date.parse(value);
  return Number.isFinite(refreshedAt) && Date.now() - refreshedAt <= 48 * 60 * 60 * 1000;
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-vercel-id");
  console.log(JSON.stringify({
    level: "info",
    message: "Admin analytics spreadsheet request started",
    route: "/api/admin/analytics/report",
    requestId,
  }));

  const { client, error: accessError } = await requireAdmin(request);
  if (!client) {
    return Response.json(
      { error: accessError },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  try {
    // A download is an explicit request for a report, so bypass the short
    // connector caches and use each platform's latest available figures.
    const analytics = await loadAdminAnalytics(client, { forceRefresh: true });
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Other People's Recipes";
    workbook.created = new Date();

    const overview = workbook.addWorksheet("Overview");
    overview.columns = [
      { header: "Metric", key: "metric", width: 34 },
      { header: "Value", key: "value", width: 18 },
      { header: "Period", key: "period", width: 30 },
      { header: "Source", key: "source", width: 28 },
      { header: "Data status", key: "status", width: 22 },
      { header: "Source refreshed", key: "refreshedAt", width: 25 },
    ];

    if (analytics.snapshot) {
      const websiteLive = isCurrentData(analytics.snapshot.website.fetchedAt);
      const googleLive = isCurrentData(analytics.snapshot.google.fetchedAt);
      const googleStatus = googleLive
        ? analytics.snapshot.google.provisionalFrom
          ? `Latest API data; provisional from ${analytics.snapshot.google.provisionalFrom}`
          : "Latest available via API"
        : "Historical snapshot";
      if (websiteLive) overview.addRows([
        { metric: "Website visitors", value: analytics.snapshot.website.visitors, period: analytics.snapshot.website.period, source: "Vercel Web Analytics", status: "Latest available via API", refreshedAt: analytics.snapshot.website.fetchedAt },
        { metric: "Website page views", value: analytics.snapshot.website.pageViews, period: analytics.snapshot.website.period, source: "Vercel Web Analytics", status: "Latest available via API", refreshedAt: analytics.snapshot.website.fetchedAt },
        { metric: "Pages per visitor", value: analytics.snapshot.website.pagesPerVisitor, period: analytics.snapshot.website.period, source: "Vercel Web Analytics", status: "Calculated from live API", refreshedAt: analytics.snapshot.website.fetchedAt },
      ]);
      if (googleLive) overview.addRows([
        { metric: "Google clicks", value: analytics.snapshot.google.clicks, period: analytics.snapshot.google.period, source: "Google Search Console", status: googleStatus, refreshedAt: analytics.snapshot.google.fetchedAt },
        { metric: "Google impressions", value: analytics.snapshot.google.impressions, period: analytics.snapshot.google.period, source: "Google Search Console", status: googleStatus, refreshedAt: analytics.snapshot.google.fetchedAt },
        { metric: "Google CTR", value: analytics.snapshot.google.ctr, period: analytics.snapshot.google.period, source: "Google Search Console", status: googleStatus, refreshedAt: analytics.snapshot.google.fetchedAt },
        { metric: "Google average position", value: analytics.snapshot.google.averagePosition, period: analytics.snapshot.google.period, source: "Google Search Console", status: googleStatus, refreshedAt: analytics.snapshot.google.fetchedAt },
      ]);
      if (analytics.snapshot.indexAudit) overview.addRows([
        { metric: "Sitemap URLs submitted", value: analytics.snapshot.indexAudit.submittedUrls, period: "Latest URL inspection audit", source: "Google URL Inspection API", status: "Live sitemap audit", refreshedAt: analytics.snapshot.indexAudit.auditedAt },
        { metric: "Sitemap URLs indexed", value: analytics.snapshot.indexAudit.indexedUrls, period: "Latest URL inspection audit", source: "Google URL Inspection API", status: "Live sitemap audit", refreshedAt: analytics.snapshot.indexAudit.auditedAt },
        { metric: "Sitemap URLs not indexed", value: analytics.snapshot.indexAudit.notIndexedUrls, period: "Latest URL inspection audit", source: "Google URL Inspection API", status: "Review listed URLs", refreshedAt: analytics.snapshot.indexAudit.auditedAt },
        { metric: "URL inspection errors", value: analytics.snapshot.indexAudit.failedInspections, period: "Latest URL inspection audit", source: "Google URL Inspection API", status: analytics.snapshot.indexAudit.failedInspections ? "Retry required" : "Clear", refreshedAt: analytics.snapshot.indexAudit.auditedAt },
      ]);
      overview.eachRow((row) => {
        if (row.getCell(1).value === "Google CTR") row.getCell(2).numFmt = "0.0%";
      });
    }
    styleSheet(overview);

    const participation = workbook.addWorksheet("Participation");
    participation.columns = [
      { header: "Action", key: "label", width: 30 },
      { header: "Last 30 days", key: "last30Days", width: 18 },
      { header: "All time", key: "allTime", width: 18 },
    ];
    participation.addRows(analytics.participation);
    styleSheet(participation);

    const submissionFunnel = workbook.addWorksheet("Submission Funnel");
    submissionFunnel.columns = [
      { header: "Stage", key: "stage", width: 32 },
      { header: `Count (${analytics.windowDays}d)`, key: "count", width: 22 },
    ];
    submissionFunnel.addRows([
      { stage: "Started", count: analytics.submissionFunnel.started },
      { stage: "Recipe details ready", count: analytics.submissionFunnel.recipeReady },
      { stage: "Submit attempted", count: analytics.submissionFunnel.attempted },
      { stage: "Completed", count: analytics.submissionFunnel.completed },
      { stage: "Estimated drop-off before submit", count: analytics.submissionFunnel.abandonedBeforeAttempt },
      { stage: "Attempt did not complete", count: analytics.submissionFunnel.unsuccessfulAttempts },
    ]);
    styleSheet(submissionFunnel);

    const sources = workbook.addWorksheet("Traffic Sources");
    sources.columns = [
      { header: "Source", key: "source", width: 24 },
      { header: `Link clicks (${analytics.windowDays}d)`, key: "linkClicks", width: 22 },
      { header: `Site actions (${analytics.windowDays}d)`, key: "ctaClicks", width: 22 },
      { header: `Conversions (${analytics.windowDays}d)`, key: "conversions", width: 22 },
    ];
    sources.addRows(analytics.sources);

    const campaigns = workbook.addWorksheet("Campaign attribution");
    campaigns.columns = [
      { header: "Campaign", key: "campaign", width: 28 },
      { header: "Source", key: "source", width: 20 },
      { header: `Link clicks (${analytics.windowDays}d)`, key: "linkClicks", width: 22 },
      { header: `Site actions (${analytics.windowDays}d)`, key: "ctaClicks", width: 22 },
      { header: `Conversions (${analytics.windowDays}d)`, key: "conversions", width: 22 },
    ];
    campaigns.addRows(analytics.campaigns);
    styleSheet(sources);

    const social = workbook.addWorksheet("Social Latest");
    social.columns = [
      { header: "Platform", key: "platform", width: 20 },
      { header: "Period", key: "period", width: 27 },
      { header: "Exposure measure", key: "exposureLabel", width: 22 },
      { header: "Exposures", key: "exposures", width: 16 },
      { header: "Interactions", key: "interactions", width: 16 },
      { header: "Followers", key: "followers", width: 14 },
      { header: "Profile visits", key: "profileVisits", width: 16 },
      { header: "Outbound clicks", key: "outboundClicks", width: 18 },
      { header: "Website visitors", key: "websiteVisitors", width: 18 },
      { header: "Data status", key: "status", width: 22 },
      { header: "Source refreshed", key: "refreshedAt", width: 25 },
    ];
    if (analytics.snapshot) {
      social.addRows(analytics.snapshot.social.filter((platform) => isCurrentData(platform.fetchedAt)).map((platform) => ({
        ...platform,
        status: "Latest available via API",
        refreshedAt: platform.fetchedAt,
      })));
    }
    styleSheet(social);

    const pageSpeed = workbook.addWorksheet("PageSpeed Lab");
    pageSpeed.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Value", key: "value", width: 14 },
      { header: "Unit", key: "unit", width: 16 },
      { header: "Context", key: "context", width: 70 },
      { header: "Strategy", key: "strategy", width: 14 },
      { header: "Tested URL", key: "testedUrl", width: 45 },
      { header: "Data status", key: "status", width: 24 },
      { header: "Source refreshed", key: "refreshedAt", width: 25 },
    ];
    pageSpeed.addRows((isCurrentData(analytics.report.seoTechnical.pageSpeedMeta.fetchedAt) ? analytics.report.seoTechnical.pageSpeed : []).map((metric) => ({
      ...metric,
      strategy: analytics.report.seoTechnical.pageSpeedMeta.strategy,
      testedUrl: analytics.report.seoTechnical.pageSpeedMeta.testedUrl,
      status: "Latest Google Lighthouse lab run",
      refreshedAt: analytics.report.seoTechnical.pageSpeedMeta.fetchedAt,
    })));
    pageSpeed.eachRow((row) => {
      row.alignment = { vertical: "top", wrapText: true };
    });
    styleSheet(pageSpeed);

    const indexAudit = workbook.addWorksheet("Google Index Audit");
    indexAudit.columns = [
      { header: "URL", key: "url", width: 62 },
      { header: "Indexed", key: "indexed", width: 14 },
      { header: "Verdict", key: "verdict", width: 18 },
      { header: "Coverage state", key: "coverageState", width: 34 },
      { header: "Indexing state", key: "indexingState", width: 24 },
      { header: "Fetch state", key: "pageFetchState", width: 24 },
      { header: "Last crawl", key: "lastCrawlTime", width: 25 },
      { header: "Google canonical", key: "googleCanonical", width: 62 },
      { header: "Declared canonical", key: "userCanonical", width: 62 },
      { header: "Crawled as", key: "crawledAs", width: 20 },
      { header: "Inspection error", key: "error", width: 42 },
    ];
    indexAudit.addRows((analytics.snapshot?.indexAudit?.results ?? []).map((result) => ({
      ...result,
      indexed: result.indexed === null ? "Not checked" : result.indexed ? "Yes" : "No",
    })));
    indexAudit.eachRow((row) => {
      row.alignment = { vertical: "top", wrapText: true };
    });
    styleSheet(indexAudit);

    const actions = workbook.addWorksheet("Recommended Actions");
    actions.columns = [
      { header: "Priority", key: "priority", width: 14 },
      { header: "Area", key: "area", width: 24 },
      { header: "Finding", key: "title", width: 34 },
      { header: "Evidence", key: "evidence", width: 65 },
      { header: "Recommended action", key: "action", width: 70 },
    ];
    actions.addRows(analytics.priorities);
    actions.eachRow((row) => {
      row.alignment = { vertical: "top", wrapText: true };
    });
    styleSheet(actions);

    const buffer = await workbook.xlsx.writeBuffer();
    const date = new Date().toISOString().slice(0, 10);

    console.log(JSON.stringify({
      level: "info",
      message: "Admin analytics spreadsheet request completed",
      route: "/api/admin/analytics/report",
      requestId,
      durationMs: Date.now() - startedAt,
    }));
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="opr-analytics-${date}.xlsx"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      message: "Admin analytics spreadsheet request failed",
      route: "/api/admin/analytics/report",
      requestId,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    }));
    return Response.json({ error: "The analytics spreadsheet could not be prepared." }, { status: 400 });
  }
}
