import type { Metadata } from "next";
import Navigation from "../components/Navigation";
import FilmEmbed from "../components/FilmEmbed";
import VideoBrandMark from "../components/VideoBrandMark";
import { films } from "../../lib/films";
import { absoluteUrl } from "../../lib/site";
import { buildMetadata } from "../../lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "The OPR Film Collection",
  description:
    "Short films about food, family and the recipes we choose to pass on.",
  path: "/films",
});

export default function FilmsPage() {
  const videoJsonLd = {
    "@context": "https://schema.org",
    "@graph": films.map((film) => ({
      "@type": "VideoObject",
      name: film.title,
      description: film.title + ", from the OPR Film Collection: short films about food, family and the recipes we choose to pass on.",
      thumbnailUrl: [absoluteUrl(film.poster ?? "/images/recipes/barbaras-beef-casserole-wide.webp")],
      uploadDate: "2026-08-01",
      contentUrl: absoluteUrl(film.video),
      embedUrl: absoluteUrl("/films") + "#" + encodeURIComponent(film.title),
    })),
  };

  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(videoJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navigation />

      <section className="relative isolate overflow-hidden bg-[#123C39] px-6 pb-24 pt-40 text-center text-white">
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/images/recipes/barbaras-beef-casserole-wide.webp"
          aria-hidden="true"
        >
          <source src="/videos/opr-recipe-stories-film-v2.mp4" type="video/mp4" />
        </video>
        <VideoBrandMark />
        <div className="absolute inset-0 -z-10 bg-[#0D342F]/75" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#08231F]/65 via-[#123C39]/45 to-[#08231F]/80" />

        <div className="mx-auto max-w-4xl">
          <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-200">
            The OPR Film Collection
          </p>
          <h1 className="font-display text-5xl font-bold leading-tight drop-shadow-lg md:text-7xl">
            Some stories are best told around a table. Others deserve a screen.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#FFF1D8]">
            Some films show OPR as it is today. Others capture the ideas we are
            building towards: a growing collection about food, family and the
            memories we choose to pass on.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {films.map((film) => (
            <article
              id={encodeURIComponent(film.title)}
              key={film.video}
              className="overflow-hidden rounded-3xl bg-[#FFF3DF] shadow-lg shadow-[#1C5A50]/15"
            >
              <FilmEmbed video={film.video} poster={film.poster} title={film.title} className="aspect-video w-full" />
              <div className="p-6">
                <h2 className="text-xl font-bold leading-snug">{film.title}</h2>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#FFF3DF] px-6 py-24 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
          The next chapter
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold md:text-5xl">
          Every Recipe has a Story. Perhaps yours is the one we tell next.
        </h2>
      </section>
    </main>
  );
}
