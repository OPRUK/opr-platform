import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { filmDescription, filmSlug, films } from "../../lib/films";
import { buildMetadata } from "../../lib/metadata";

const daveAndRubbleFilms = films.filter((film) => film.title.startsWith("Dave & Rubble |"));

export const metadata: Metadata = buildMetadata({
  title: "Dave & Rubble | OPR Kitchen Stories",
  description:
    "Meet Dave and Rubble: OPR's short kitchen stories about family recipes, food memories and one very determined dog.",
  path: "/dave-and-rubble",
});

export default function DaveAndRubblePage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />
      <article className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-800">The OPR Film Collection</p>
          <h1 className="mt-5 font-display text-5xl font-bold leading-tight md:text-7xl">Dave &amp; Rubble</h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-stone-700">
            Dave cooks. Rubble asks the important questions—usually about chicken. Together they share the family recipes,
            kitchen memories and small jokes that make a table feel like home.
          </p>
        </header>

        <section aria-labelledby="episodes-heading" className="mt-16">
          <h2 id="episodes-heading" className="text-center text-3xl font-bold md:text-4xl">Watch every Dave &amp; Rubble story</h2>
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {daveAndRubbleFilms.map((film) => (
              <article key={film.video} className="overflow-hidden rounded-3xl bg-[#FFF3DF] shadow-lg shadow-[#1C5A50]/10">
                <Link href={`/films/${filmSlug(film)}`} className="group relative block aspect-video overflow-hidden bg-[#123C39]">
                  <img
                    src={film.poster ?? "/images/recipes/barbaras-beef-casserole-wide.webp"}
                    alt={`Still from ${film.title}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-[#08231F]/20" aria-hidden="true" />
                  <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                    <span className="rounded-full bg-[#FFF3DF] px-4 py-2 font-bold text-[#123C39] shadow-lg">Watch film ▶</span>
                  </span>
                </Link>
                <div className="p-6">
                  <h3 className="text-xl font-bold leading-snug">
                    <Link href={`/films/${filmSlug(film)}`} className="hover:underline">{film.title}</Link>
                  </h3>
                  <p className="mt-3 leading-7 text-stone-700">{filmDescription(film)}</p>
                  <Link href={`/films/${filmSlug(film)}`} className="mt-5 inline-block font-semibold text-[#1C5A50] underline decoration-[#DDB765] decoration-2 underline-offset-4">
                    Watch and read the transcript →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-14 text-center">
          <Link href="/films" className="font-semibold text-[#1C5A50] underline decoration-[#DDB765] decoration-2 underline-offset-4">
            Browse the complete OPR Film Collection →
          </Link>
        </p>
      </article>
    </main>
  );
}
