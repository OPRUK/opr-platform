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

export async function GET(request: Request) {
  const { client, error: accessError } = await requireAdmin(request);
  if (!client) {
    return Response.json(
      { error: accessError },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  try {
    const analytics = await loadAdminAnalytics(client);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Other People's Recipes";
    workbook.created = new Date();

    const overview = workbook.addWorksheet("Overview");
    overview.columns = [
      { header: "Metric", key: "metric", width: 34 },
      { header: "Value", key: "value", width: 18 },
      { header: "Period", key: "period", width: 30 },
      { header: "Source", key: "source", width: 28 },
    ];

    if (analytics.snapshot) {
      overview.addRows([
        { metric: "Website visitors", value: analytics.snapshot.website.visitors, period: analytics.snapshot.website.period, source: "Vercel Web Analytics" },
        { metric: "Website page views", value: analytics.snapshot.website.pageViews, period: analytics.snapshot.website.period, source: "Vercel Web Analytics" },
        { metric: "Pages per visitor", value: analytics.snapshot.website.pagesPerVisitor, period: analytics.snapshot.website.period, source: "Vercel Web Analytics" },
        { metric: "Bounce rate", value: analytics.snapshot.website.bounceRate, period: analytics.snapshot.website.period, source: "Vercel Web Analytics" },
        { metric: "Google clicks", value: analytics.snapshot.google.clicks, period: analytics.snapshot.google.period, source: "Google Search Console" },
        { metric: "Google impressions", value: analytics.snapshot.google.impressions, period: analytics.snapshot.google.period, source: "Google Search Console" },
        { metric: "Google CTR", value: analytics.snapshot.google.ctr, period: analytics.snapshot.google.period, source: "Google Search Console" },
        { metric: "Google average position", value: analytics.snapshot.google.averagePosition, period: analytics.snapshot.google.period, source: "Google Search Console" },
        { metric: "Indexed pages", value: analytics.snapshot.google.indexedPages, period: analytics.snapshot.google.period, source: "Google Search Console" },
      ]);
      overview.getCell("B5").numFmt = "0.0%";
      overview.getCell("B8").numFmt = "0.0%";
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

    const sources = workbook.addWorksheet("Traffic Sources");
    sources.columns = [
      { header: "Source", key: "source", width: 24 },
      { header: `Link clicks (${analytics.windowDays}d)`, key: "linkClicks", width: 22 },
      { header: `Site actions (${analytics.windowDays}d)`, key: "ctaClicks", width: 22 },
      { header: `Conversions (${analytics.windowDays}d)`, key: "conversions", width: 22 },
    ];
    sources.addRows(analytics.sources);
    styleSheet(sources);

    const social = workbook.addWorksheet("Social Baseline");
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
    ];
    if (analytics.snapshot) social.addRows(analytics.snapshot.social);
    styleSheet(social);

    const actions = workbook.addWorksheet("Recommended Actions");
    actions.columns = [
      { header: "Priority", key: "title", width: 34 },
      { header: "Evidence", key: "evidence", width: 65 },
      { header: "Recommended action", key: "action", width: 70 },
    ];
    if (analytics.snapshot) actions.addRows(analytics.snapshot.recommendations);
    actions.eachRow((row) => {
      row.alignment = { vertical: "top", wrapText: true };
    });
    styleSheet(actions);

    const buffer = await workbook.xlsx.writeBuffer();
    const date = new Date().toISOString().slice(0, 10);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="opr-analytics-${date}.xlsx"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("OPR analytics spreadsheet could not be generated", error);
    return Response.json({ error: "The analytics spreadsheet could not be prepared." }, { status: 400 });
  }
}
