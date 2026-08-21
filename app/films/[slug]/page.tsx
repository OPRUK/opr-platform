import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navigation from "../../components/Navigation";
import TrackedLink from "../../components/TrackedLink";
import VideoBrandMark from "../../components/VideoBrandMark";
import { filmSlug, films, getFilmBySlug } from "../../../lib/films";
import { buildMetadata } from "../../../lib/metadata";
import { getFeaturedRecipe } from "../../../lib/recipes";
import { absoluteUrl } from "../../../lib/site";

type FilmPageProps = { params: Promise<{ slug: string }> };

function descriptionFor(title: string) {
  return `${title}, from the OPR Film Collection: a short film about food, family and the recipes we choose to pass on.`;
}

export function generateStaticParams() {
  return films.map((film) => ({ slug: filmSlug(film) }));
}

export async function generateMetadata({ params }: FilmPageProps): Promise<Metadata> {
  const film = getFilmBySlug((await params).slug);
  if (!film) return {};

  return buildMetadata({
    title: film.title,
    description: descriptionFor(film.title),
    path: `/films/${filmSlug(film)}`,
    image: film.poster,
  });
}

export default async function FilmWatchPage({ params }: FilmPageProps) {
  const film = getFilmBySlug((await params).slug);
  if (!film) notFound();

  const slug = filmSlug(film);
  const recipe = film.recipeSlug ? getFeaturedRecipe(film.recipeSlug) : null;
  const description = descriptionFor(film.title);
  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${absoluteUrl(`/films/${slug}`)}#video`,
    name: film.title,
    description,
    thumbnailUrl: [absoluteUrl(film.poster ?? "/images/recipes/barbaras-beef-casserole-wide.webp")],
    uploadDate: film.uploadDate ?? "2026-08-01",
    contentUrl: absoluteUrl(film.video),
    embedUrl: absoluteUrl(`/films/${slug}`),
    transcript: film.transcript,
    inLanguage: "en-GB",
    isFamilyFriendly: true,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Films", item: absoluteUrl("/films") },
      { "@type": "ListItem", position: 2, name: film.title, item: absoluteUrl(`/films/${slug}`) },
    ],
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <Navigation />

      <article className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-8">
        <Link href="/films" className="font-semibold text-[#1C5A50] underline decoration-[#DDB765] decoration-2 underline-offset-4">
          ← The OPR Film Collection
        </Link>

        <header className="mx-auto mt-10 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-800">Watch the story</p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-6xl">{film.title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-700">{description}</p>
        </header>

        <div className="relative mt-12 overflow-hidden rounded-3xl bg-black shadow-2xl shadow-[#123C39]/25">
          <VideoBrandMark />
          <video className="aspect-video w-full" controls playsInline preload="metadata" poster={film.poster} aria-label={film.title}>
            <source src={film.video} type="video/mp4" />
            {film.captions ? <track kind="captions" src={film.captions} srcLang="en" label="English" default /> : null}
            Your browser does not support embedded video. <a href={film.video}>Open the film directly.</a>
          </video>
        </div>

        <section aria-labelledby="transcript-heading" className="mx-auto mt-12 max-w-3xl rounded-3xl bg-[#FFF3DF] p-7 shadow-lg shadow-[#1C5A50]/10 md:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-800">Accessible transcript</p>
          <h2 id="transcript-heading" className="mt-3 text-3xl font-bold">Read the film</h2>
          <div className="mt-6 whitespace-pre-wrap text-lg leading-8 text-stone-700">{film.transcript}</div>
        </section>

        {recipe ? (
          <section className="mx-auto mt-10 max-w-3xl rounded-3xl bg-[#123C39] p-8 text-center text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-200">From film to table</p>
            <h2 className="mt-3 text-3xl font-bold">Cook {recipe.title}</h2>
            <TrackedLink href={`/family-cookbook/${recipe.slug}`} eventKey="film_recipe" className="mt-6 inline-flex rounded-full bg-[#DDB765] px-6 py-3 font-bold text-[#123C39] transition hover:bg-[#FFF3DF]">
              Open the recipe →
            </TrackedLink>
          </section>
        ) : null}
      </article>
    </main>
  );
}
