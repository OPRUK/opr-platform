import { requireAdmin } from "../../../../lib/admin-auth";
import { loadAdminAnalytics } from "../../../../lib/admin-analytics-server";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-vercel-id");
  const forceRefresh = new URL(request.url).searchParams.get("refresh") === "1";
  console.log(JSON.stringify({
    level: "info",
    message: "Admin analytics request started",
    route: "/api/admin/analytics",
    requestId,
    forceRefresh,
  }));

  const { client, error: accessError } = await requireAdmin(request);
  if (!client) {
    return Response.json(
      { error: accessError },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  try {
    const analytics = await loadAdminAnalytics(client, { forceRefresh });
    console.log(JSON.stringify({
      level: "info",
      message: "Admin analytics request completed",
      route: "/api/admin/analytics",
      requestId,
      forceRefresh,
      durationMs: Date.now() - startedAt,
    }));
    return Response.json(analytics, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      message: "Admin analytics request failed",
      route: "/api/admin/analytics",
      requestId,
      forceRefresh,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    }));
    return Response.json({ error: "Traffic-source reporting could not be loaded." }, { status: 400 });
  }
}
