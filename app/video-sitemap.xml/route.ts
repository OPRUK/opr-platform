import { filmSlug, films, filmUploadDate } from "../../lib/films";
import { absoluteUrl } from "../../lib/site";

export const dynamic = "force-static";

function xml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const entries = films.map((film) => {
    const watchUrl = absoluteUrl(`/films/${filmSlug(film)}`);
    const thumbnail = absoluteUrl(film.poster ?? "/images/recipes/barbaras-beef-casserole-wide.webp");
    const description = `${film.title}, from the OPR Film Collection: a short film about food, family and the recipes we choose to pass on.`;

    return `  <url>
    <loc>${xml(watchUrl)}</loc>
    <video:video>
      <video:thumbnail_loc>${xml(thumbnail)}</video:thumbnail_loc>
      <video:title>${xml(film.title)}</video:title>
      <video:description>${xml(description)}</video:description>
      <video:content_loc>${xml(absoluteUrl(film.video))}</video:content_loc>
      <video:player_loc>${xml(watchUrl)}</video:player_loc>
      <video:publication_date>${xml(filmUploadDate(film))}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>`;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${entries.join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
