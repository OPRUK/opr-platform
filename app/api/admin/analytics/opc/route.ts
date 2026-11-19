import { requireAdmin } from "../../../../../lib/admin-auth";
import { loadOpcSocialAnalytics } from "../../../../../lib/opc-social-analytics";

export const runtime = "nodejs";
export const maxDuration = 60;
const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  const { client, error } = await requireAdmin(request);
  if (!client) return Response.json({ error }, { status: 401, headers });
  try {
    const analytics = await loadOpcSocialAnalytics(client, new URL(request.url).searchParams.get("refresh") === "1");
    return Response.json(analytics, { headers });
  } catch (error) {
    console.error("OPC analytics request failed", error);
    return Response.json({ error: "OPC analytics could not be loaded." }, { status: 503, headers });
  }
}
