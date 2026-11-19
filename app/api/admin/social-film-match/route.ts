import { requireAdmin } from "../../../../lib/admin-auth";
import { filmForReference, filmIdentity } from "../../../../lib/film-identity";

import { loadOpcFilms } from "../../../../lib/opc-film-catalog";

export const runtime = "nodejs";

const platforms = new Set(["facebook", "instagram", "tiktok", "youtube", "pinterest", "linkedin"]);

export async function PATCH(request: Request) {
  const { client, error: accessError } = await requireAdmin(request);
  if (!client) return Response.json({ error: accessError }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const platform = typeof body?.platform === "string" ? body.platform : "";
  const postId = typeof body?.postId === "string" ? body.postId.trim() : "";
  const ignored = body?.ignored === true;
  const filmVideo = typeof body?.filmVideo === "string" ? body.filmVideo : "";
  const brand = body?.brand ?? "opr";
  if (brand !== "opr" && brand !== "opc") return Response.json({ error: "Choose an analytics brand." }, { status: 400 });
  const oprFilm = brand === "opr" ? filmForReference(filmVideo) : null;
  const filmId = brand === "opc" && !ignored
    ? (await loadOpcFilms()).find((film) => film.id === filmVideo)?.id
    : oprFilm ? filmIdentity(oprFilm) : null;
  if (!platforms.has(platform) || !postId || (!ignored && !filmId)) {
    return Response.json({ error: "Choose a valid social post and OPR film." }, { status: 400 });
  }

  const result = await client
    .from(brand === "opc" ? "opc_social_film_posts" : "social_film_posts")
    .update({ film_video: ignored ? null : filmId, ignored })
    .eq("platform", platform)
    .eq("post_id", postId)
    .select("post_id")
    .maybeSingle();
  if (result.error) return Response.json({ error: "The post match could not be saved." }, { status: 400 });
  if (!result.data) return Response.json({ error: "The social post was not found. Refresh the dashboard and try again." }, { status: 404 });
  return Response.json({ ok: true });
}
