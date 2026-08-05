import type { Metadata } from "next";
import Navigation from "../components/Navigation";
import { films } from "../../lib/films";

export const metadata: Metadata = {
  title: "The OPR Film Collection",
  description:
    "Short films about food, family and the recipes we choose to pass on.",
  alternates: { canonical: "/films" },
};

export default function FilmsPage() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />

      <section className="relative isolate overflow-hidden bg-[#123C39] px-6 pb-24 pt-40 text-center text-white">
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/images/recipes/barbaras-beef-casserole-wide.png"
          aria-hidden="true"
        >
          <source src="/videos/opr-recipe-stories-film-v2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-[#0D342F]/75" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#08231F]/65 via-[#123C39]/45 to-[#08231F]/80" />

        <div className="mx-auto max-w-4xl">
          <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-200">
            The OPR Film Collection
          </p>
          <h1 className="text-5xl font-bold leading-tight drop-shadow-lg md:text-7xl">
            Some stories are best told around a table. Others deserve a screen.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#FFF1D8]">
            Some films show OPR as it is today. Others capture the ideas we are
            building towards: a growing collection about food, family and the
            memories we choose to pass on.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-20 px-6 py-20 md:px-8">
        {films.map((film, index) => (
          <article
            key={film.title}
            className={`grid items-center gap-10 md:grid-cols-2 ${index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            <div className="overflow-hidden rounded-3xl bg-black shadow-2xl">
              <video
                className="aspect-video w-full"
                controls
                preload="metadata"
                poster={film.poster}
              >
                <source src={film.source} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>

            <div className="max-w-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
                Film {String(index + 1).padStart(2, "0")} · {film.label}
              </p>
              <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
                {film.title}
              </h2>
              <p className="mt-6 text-lg leading-8 text-stone-700">
                {film.synopsis}
              </p>
              <div className="mt-7 rounded-2xl border border-[#D1AD75] bg-[#FFF3DF] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
                  Where it sits today
                </p>
                <p className="mt-3 leading-7 text-stone-700">{film.relevance}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="bg-[#123C39] px-6 py-24 text-center text-[#FFF3DF]">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-[#DDB765]">
            Watch on YouTube
          </p>
          <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            Follow the OPR Film Collection.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#E7CEA2]">
            New recipe stories, conversations from the kitchen and future OPR
            films live on our YouTube channel.
          </p>
          <a
            href="https://www.youtube.com/channel/UCdRQdldwQPFPoMr5N-FwIkQ"
            target="_blank"
            rel="noreferrer"
            className="mt-9 inline-flex items-center rounded-full bg-[#DDB765] px-8 py-4 text-lg font-bold text-[#123C39] transition hover:scale-105 hover:bg-[#F0CC7A]"
          >
            Visit OPR on YouTube <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section className="bg-[#FFF3DF] px-6 py-24 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
          The next chapter
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold md:text-5xl">
          Every recipe has a story. Perhaps yours is the one we tell next.
        </h2>
      </section>
    </main>
  );
}
