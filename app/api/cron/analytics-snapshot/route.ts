import { loadAdminAnalytics } from "../../../../lib/admin-analytics-server";
import { saveDailySnapshot } from "../../../../lib/analytics-daily-snapshots";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorised(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return Response.json({ error: "Analytics storage is not configured." }, { status: 503 });
  }

  try {
    const analytics = await loadAdminAnalytics(client);
    if (!analytics.snapshot) {
      return Response.json({ error: "No analytics baseline is available." }, { status: 503 });
    }

    await saveDailySnapshot(client, analytics.snapshot);
    return Response.json({
      ok: true,
      snapshotDate: new Date().toISOString().slice(0, 10),
      capturedAt: analytics.generatedAt,
    });
  } catch (error) {
    console.error("OPR daily analytics snapshot failed", error);
    return Response.json({ error: "Daily analytics snapshot failed." }, { status: 500 });
  }
}
import { loadAdminAnalytics } from "../../../../lib/admin-analytics-server";
import { saveDailySnapshot } from "../../../../lib/analytics-daily-snapshots";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorised(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return Response.json({ error: "Analytics storage is not configured." }, { status: 503 });
  }

  try {
    const analytics = await loadAdminAnalytics(client);
    if (!analytics.snapshot) {
      return Response.json({ error: "No analytics baseline is available." }, { status: 503 });
    }

    await saveDailySnapshot(client, analytics.snapshot);
    return Response.json({
      ok: true,
      snapshotDate: new Date().toISOString().slice(0, 10),
      capturedAt: analytics.generatedAt,
    });
  } catch (error) {
    console.error("OPR daily analytics snapshot failed", error);
    return Response.json({ error: "Daily analytics snapshot failed." }, { status: 500 });
  }
}
