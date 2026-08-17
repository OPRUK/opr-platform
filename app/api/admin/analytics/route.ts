import { requireAdmin } from "../../../../lib/admin-auth";
import { loadAdminAnalytics } from "../../../../lib/admin-analytics-server";

export async function GET(request: Request) {
  const { client, error: accessError } = await requireAdmin(request);
  if (!client) return Response.json({ error: accessError }, { status: 401 });

  try {
    return Response.json(await loadAdminAnalytics(client), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("OPR attribution summary could not load", error);
    return Response.json({ error: "Traffic-source reporting could not be loaded." }, { status: 400 });
  }
}
