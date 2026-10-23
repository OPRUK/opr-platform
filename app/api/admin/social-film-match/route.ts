import { requireAdmin } from "../../../../lib/admin-auth";
import { filmForReference, filmIdentity } from "../../../../lib/film-identity";

export const runtime = "nodejs";

const platforms = new Set(["facebook", "instagram", "tiktok", "youtube", "pinterest"]);

export async function PATCH(request: Request) {
  const { client, error: accessError } = await requireAdmin(request);
  if (!client) return Response.json({ error: accessError }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const platform = typeof body?.platform === "string" ? body.platform : "";
  const postId = typeof body?.postId === "string" ? body.postId.trim() : "";
  const ignored = body?.ignored === true;
  const filmVideo = typeof body?.filmVideo === "string" ? body.filmVideo : "";
  const film = filmForReference(filmVideo);
  if (!platforms.has(platform) || !postId || (!ignored && !film)) {
    return Response.json({ error: "Choose a valid social post and OPR film." }, { status: 400 });
  }

  const result = await client
    .from("social_film_posts")
    .update({ film_video: ignored || !film ? null : filmIdentity(film), ignored })
    .eq("platform", platform)
    .eq("post_id", postId);
  if (result.error) return Response.json({ error: "The post match could not be saved." }, { status: 400 });
  return Response.json({ ok: true });
}
