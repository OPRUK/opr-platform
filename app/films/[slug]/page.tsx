import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navigation from "../../components/Navigation";
import TrackedLink from "../../components/TrackedLink";
import { filmDescription, filmDuration, filmSlug, films, filmUploadDate, getFilmBySlug, getRelatedFilms } from "../../../lib/films";
import { buildMetadata } from "../../../lib/metadata";
import { getFeaturedRecipe } from "../../../lib/recipes";
import { absoluteUrl } from "../../../lib/site";

type FilmPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return films.map((film) => ({ slug: filmSlug(film) }));
}

export async function generateMetadata({ params }: FilmPageProps): Promise<Metadata> {
  const film = getFilmBySlug((await params).slug);
  if (!film) return {};

  const metadata = buildMetadata({
    title: film.title,
    absoluteTitle: true,
    description: filmDescription(film),
    path: `/films/${filmSlug(film)}`,
    image: film.poster,
  });
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "video.other",
      images: [{ url: absoluteUrl(film.poster!), width: film.posterWidth, height: film.posterHeight, alt: film.title }],
      videos: [{ url: absoluteUrl(film.video), secureUrl: absoluteUrl(film.video), type: "video/mp4", width: film.width, height: film.height }],
    },
    twitter: { card: "summary_large_image", title: film.title, description: filmDescription(film), images: [absoluteUrl(film.poster!)] },
  };
}

export default async function FilmWatchPage({ params }: FilmPageProps) {
  const film = getFilmBySlug((await params).slug);
  if (!film) notFound();

  const slug = filmSlug(film);
  const recipe = film.recipeSlug ? getFeaturedRecipe(film.recipeSlug) : null;
  const recipeLink = film.recipeLink ?? (recipe ? { href: `/family-cookbook/${recipe.slug}`, title: recipe.title } : null);
  const relatedFilms = getRelatedFilms(film);
  const description = filmDescription(film);
  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${absoluteUrl(`/films/${slug}`)}#video`,
    name: film.title,
    description,
    thumbnailUrl: [absoluteUrl(film.poster ?? "/images/recipes/barbaras-beef-casserole-wide.webp")],
    uploadDate: filmUploadDate(film),
    contentUrl: absoluteUrl(film.video),
    duration: filmDuration(film),
    width: film.width,
    height: film.height,
    isAccessibleForFree: true,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/films/${slug}`) },
    caption: film.captions ? { "@type": "MediaObject", contentUrl: absoluteUrl(film.captions), encodingFormat: "text/vtt", inLanguage: "en-GB" } : undefined,
    transcript: film.transcript,
    inLanguage: "en-GB",
    isFamilyFriendly: true,
  };

  const watchPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl(`/films/${slug}`),
    url: absoluteUrl(`/films/${slug}`),
    name: film.title,
    description,
    mainEntity: { "@id": `${absoluteUrl(`/films/${slug}`)}#video` },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(watchPageJsonLd).replace(/</g, "\\u003c") }} />
      <link rel="preload" as="image" href={film.poster} fetchPriority="high" />
      <Navigation />

      <article className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 md:px-8">
        <Link href="/films" className="font-semibold text-[#1C5A50] underline decoration-[#DDB765] decoration-2 underline-offset-4">
          ← The OPR Film Collection
        </Link>

        <header className="mx-auto mt-4 max-w-5xl text-center">
          <h1 className="font-display text-2xl font-bold leading-tight md:text-4xl">{film.title}</h1>
        </header>

        <div style={{ width: `min(100%, ${68 * (film.width ?? 16) / (film.height ?? 9)}svh)` }} className="relative mx-auto mt-5 max-w-full overflow-hidden rounded-2xl bg-black shadow-xl shadow-[#123C39]/20">
          <video
            id="film-player"
            src={film.video}
            aria-label={film.title}
            className="block h-auto w-full bg-black object-contain"
            style={{ aspectRatio: `${film.width ?? 16} / ${film.height ?? 9}` }}
            width={film.width}
            height={film.height}
            controls
            playsInline
            preload="none"
            poster={film.poster ?? "/images/recipes/barbaras-beef-casserole-wide.webp"}
          >
            <source src={film.video} type="video/mp4" />
            {film.captions ? <track kind="captions" src={film.captions} srcLang="en" label="English captions" default /> : null}
            Your browser does not support video playback.
          </video>
        </div>

        <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-stone-700">{description}</p>
        <p className="mt-3 text-center text-sm text-stone-600">{Math.ceil(film.durationSeconds ?? 0)} seconds · English captions available</p>

        {recipeLink ? (
          <section className="mx-auto mt-10 max-w-3xl rounded-3xl bg-[#123C39] p-8 text-center text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-200">From film to table</p>
            <h2 className="mt-3 text-3xl font-bold">Cook {recipeLink.title}</h2>
            <TrackedLink href={recipeLink.href} eventKey="film_recipe" className="mt-6 inline-flex rounded-full bg-[#DDB765] px-6 py-3 font-bold text-[#123C39] transition hover:bg-[#FFF3DF]">
              Open the recipe →
            </TrackedLink>
          </section>
        ) : (
          <section className="mx-auto mt-8 max-w-3xl rounded-3xl bg-[#123C39] p-7 text-center text-white">
            <h2 className="text-2xl font-bold">Bring a family recipe to your table</h2>
            <p className="mt-3 leading-7">Discover the dishes and people in the Living Cookbook, or share a story of your own.</p>
            <TrackedLink href="/family-cookbook" eventKey="film_recipe" className="mt-5 inline-flex rounded-full bg-[#DDB765] px-6 py-3 font-bold text-[#123C39]">Find a recipe to cook →</TrackedLink>
            <Link href="/share" className="ml-4 mt-5 inline-block font-semibold underline underline-offset-4">Tell us yours</Link>
          </section>
        )}

        <section aria-labelledby="transcript-heading" className="mx-auto mt-12 max-w-3xl rounded-3xl bg-[#FFF3DF] p-7 shadow-lg shadow-[#1C5A50]/10 md:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-800">Accessible transcript</p>
          <h2 id="transcript-heading" className="mt-3 text-3xl font-bold">Read the film</h2>
          <div className="mt-6 whitespace-pre-wrap text-lg leading-8 text-stone-700">{film.transcript}</div>
        </section>

        {relatedFilms.length ? (
          <nav aria-labelledby="more-film-stories-heading" className="mx-auto mt-12 max-w-5xl">
            <p className="text-center text-sm font-bold uppercase tracking-[0.35em] text-[#9A622A]">
              Keep watching
            </p>
            <h2 id="more-film-stories-heading" className="mt-3 text-center text-3xl font-bold text-[#123C39] md:text-4xl">
              More stories from the OPR Film Collection
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {relatedFilms.map((relatedFilm) => (
                <Link
                  key={relatedFilm.video}
                  href={`/films/${filmSlug(relatedFilm)}`}
                  className="group flex min-h-48 flex-col justify-between rounded-3xl border border-[#DDB765] bg-[#FFF3DF] p-6 shadow-md shadow-[#1C5A50]/10 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#9A622A]">Film story</span>
                  <span className="mt-4 text-xl font-bold leading-snug text-[#123C39]">{relatedFilm.title}</span>
                  <span className="mt-6 font-semibold text-[#1C5A50] group-hover:underline">Watch this film →</span>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/films" className="font-semibold text-[#1C5A50] underline decoration-[#DDB765] decoration-2 underline-offset-4">
                Browse every film in the collection
              </Link>
            </div>
          </nav>
        ) : null}
      </article>
    </main>
  );
}
