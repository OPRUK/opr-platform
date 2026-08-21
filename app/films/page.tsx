import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "../components/Navigation";
import FilmEmbed from "../components/FilmEmbed";
import VideoBrandMark from "../components/VideoBrandMark";
import TrackedLink from "../components/TrackedLink";
import { filmSlug, films, filmUploadDate } from "../../lib/films";
import { getFeaturedRecipe } from "../../lib/recipes";
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
      uploadDate: filmUploadDate(film),
      contentUrl: absoluteUrl(film.video),
      embedUrl: absoluteUrl(`/films/${filmSlug(film)}`),
      transcript: film.transcript,
    })),
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
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
        <div className="absolute inset-0 -z-10 bg-[#123C39]/75" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#08231F]/65 via-[#123C39]/45 to-[#08231F]/80" />

        <div className="mx-auto max-w-4xl">
          <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-200">
            The OPR Film Collection
          </p>
          <h1 className="font-display text-5xl font-bold leading-tight drop-shadow-lg md:text-7xl">
            Some stories are best told around a table. Others deserve a screen.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#FFF3DF]">
            Some films show OPR as it is today. Others capture the ideas we are
            building towards: a growing collection about food, family and the
            memories we choose to pass on.
          </p>
        </div>
      </section>

      <section className="bg-[#DDB765] px-6 py-8 md:py-9">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center text-[#08231F] sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em]">Live cook-along · Sunday 4 October</p>
            <p className="mt-2 text-xl font-bold leading-snug sm:text-2xl">See Dave cook his butter chicken live, over Zoom.</p>
          </div>
          <Link
            href="/live-with-dave"
            className="inline-flex shrink-0 rounded-full bg-[#123C39] px-7 py-3.5 font-bold text-[#FFF3DF] transition hover:scale-105 hover:bg-[#08231F]"
          >
            Save my spot →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {films.map((film) => {
            const recipe = film.recipeSlug ? getFeaturedRecipe(film.recipeSlug) : null;
            const recipeHref = recipe ? `/family-cookbook/${recipe.slug}` : null;

            return (
              <article
                id={encodeURIComponent(film.title)}
                key={film.video}
                className="overflow-hidden rounded-3xl bg-[#FFF3DF] shadow-lg shadow-[#1C5A50]/15"
              >
                <FilmEmbed video={film.video} poster={film.poster} captions={film.captions} title={film.title} className="aspect-video w-full" />
                <div className="p-6">
                  <h2 className="text-xl font-bold leading-snug">{film.title}</h2>
                  <Link
                    href={`/films/${filmSlug(film)}`}
                    className="mt-5 inline-flex rounded-full border border-[#123C39] px-5 py-3 font-semibold text-[#123C39] transition hover:bg-[#123C39] hover:text-white"
                  >
                    Watch this film →
                  </Link>
                  {film.transcript ? (
                    <details className="mt-4 border-t border-[#DDB765] pt-4">
                      <summary className="cursor-pointer font-semibold text-[#123C39]">Read transcript</summary>
                      <div className="mt-3 whitespace-pre-wrap leading-7 text-stone-700">{film.transcript}</div>
                    </details>
                  ) : null}
                  {recipe && recipeHref ? (
                    <TrackedLink
                      href={recipeHref}
                      eventKey="film_recipe"
                      className="mt-5 inline-flex rounded-full bg-[#123C39] px-5 py-3 font-medium text-white transition hover:scale-105 hover:bg-[#08231F]"
                    >
                      Cook {recipe.title} →
                    </TrackedLink>
                  ) : null}
                </div>
              </article>
            );
          })}
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
