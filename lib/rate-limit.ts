import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";

// Backed by public.api_rate_limits (service-role only, see
// supabase/migrations/20260812_add_api_rate_limits.sql) rather than an
// external service — this is the only table these public write routes touch
// besides their own insert, so it's cheap enough to check on every request.
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const HOURLY_LIMIT = 5;
const DAILY_LIMIT = 20;

function clientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();
  return ip || request.headers.get("x-real-ip") || "unknown";
}

// Tracked per-route rather than globally, since a single mobile submission
// makes several upload-url calls (one per attachment) before the one
// recipe-submission-mobile call — sharing a bucket between them would let
// attachments alone exhaust a legitimate submitter's hourly limit.
export async function checkRateLimit(
  supabase: SupabaseClient,
  request: Request,
  route: string,
): Promise<Response | null> {
  const key = clientKey(request);
  const now = Date.now();
  const dayAgo = new Date(now - DAY_MS).toISOString();

  const { data, error } = await supabase
    .from("api_rate_limits")
    .select("created_at")
    .eq("route", route)
    .eq("client_key", key)
    .gte("created_at", dayAgo);

  if (error) {
    // Fail open on infra errors — a broken rate limiter must not take the
    // whole submission pipeline down with it.
    console.error("OPR rate limit check failed", error);
  } else {
    const hourAgo = now - HOUR_MS;
    const hourlyCount = data.filter((row) => new Date(row.created_at).getTime() >= hourAgo).length;
    if (hourlyCount >= HOURLY_LIMIT || data.length >= DAILY_LIMIT) {
      return Response.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
    }
  }

  const { error: insertError } = await supabase.from("api_rate_limits").insert({ route, client_key: key });
  if (insertError) console.error("OPR rate limit record could not be saved", insertError);

  return null;
}
