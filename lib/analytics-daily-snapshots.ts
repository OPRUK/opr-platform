import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnalyticsSnapshot } from "./admin-analytics-types";

type SnapshotRow = {
  payload: AnalyticsSnapshot;
};

export async function loadLatestDailySnapshot(
  client: SupabaseClient,
): Promise<AnalyticsSnapshot | null> {
  const result = await client
    .from("analytics_daily_snapshots")
    .select("payload")
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle<SnapshotRow>();

  // Keep the dashboard working during rollout, before the migration has run.
  if (result.error) {
    console.warn("OPR saved analytics snapshot could not be loaded", result.error.message);
    return null;
  }

  return result.data?.payload ?? null;
}

export async function saveDailySnapshot(
  client: SupabaseClient,
  snapshot: AnalyticsSnapshot,
): Promise<void> {
  const capturedAt = new Date().toISOString();
  const result = await client.from("analytics_daily_snapshots").upsert(
    {
      snapshot_date: capturedAt.slice(0, 10),
      captured_at: capturedAt,
      payload: snapshot,
    },
    { onConflict: "snapshot_date" },
  );

  if (result.error) throw result.error;
}
import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnalyticsSnapshot } from "./admin-analytics-types";

type SnapshotRow = {
  payload: AnalyticsSnapshot;
};

export async function loadLatestDailySnapshot(
  client: SupabaseClient,
): Promise<AnalyticsSnapshot | null> {
  const result = await client
    .from("analytics_daily_snapshots")
    .select("payload")
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle<SnapshotRow>();

  // Keep the dashboard working during rollout, before the migration has run.
  if (result.error) {
    console.warn("OPR saved analytics snapshot could not be loaded", result.error.message);
    return null;
  }

  return result.data?.payload ?? null;
}

export async function saveDailySnapshot(
  client: SupabaseClient,
  snapshot: AnalyticsSnapshot,
): Promise<void> {
  const capturedAt = new Date().toISOString();
  const result = await client.from("analytics_daily_snapshots").upsert(
    {
      snapshot_date: capturedAt.slice(0, 10),
      captured_at: capturedAt,
      payload: snapshot,
    },
    { onConflict: "snapshot_date" },
  );

  if (result.error) throw result.error;
}
