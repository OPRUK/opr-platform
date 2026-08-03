import type { Metadata } from "next";
import Navigation from "../components/Navigation";

export const metadata: Metadata = {
  title: "The OPR Film Collection",
  description:
    "Short films about food, family and the recipes we choose to pass on.",
  alternates: { canonical: "/films" },
};

const films = [
  {
    title: "Three Recipes, Three Stories",
    label: "The OPR cookbook — now",
    synopsis:
      "Nana Serb’s Sunday Rice Pudding, Dave’s Butter Chicken and Barbara’s Beef Casserole: three dishes, three homes and three memories now preserved in the OPR cookbook.",
    relevance:
      "This is OPR today: real dishes, real people and stories that can be cooked, shared and passed on.",
    source: "/videos/opr-recipe-stories-film-v2.mp4",
    poster: "/images/recipes/nana-serbs-rice-pudding-wide.png",
  },
  {
    title: "A Menu Written by the People",
    label: "A future OPR concept",
    synopsis:
      "A restaurant kitchen curates recipes submitted by the public, choosing dishes whose food and story deserve a place on the menu. With every contribution, a wall of handwritten memories grows.",
    relevance:
      "This remains central to OPR’s long-term vision, but it is a future chapter. Today, we are building the cookbook and community that could one day power that menu.",
    source: "/videos/opr-teaser-1.mp4",
  },
  {
    title: "Same Town. Same Dish.",
    label: "A future OPR format",
    synopsis:
      "Two home cooks bring their family versions of the same classic to the table, inviting people to choose a side and spark a friendly local debate.",
    relevance:
      "The rivalry idea is still strong. It could become a brilliant voting format once more community recipes are live; for now, it is a glimpse of what OPR could host.",
    source: "/videos/opr-teaser-2.mp4",
  },
  {
    title: "A New Menu Every Month",
    label: "A future OPR concept",
    synopsis:
      "A rotating restaurant menu built from nine mains and three desserts, with family stories, familiar faces and new dishes arriving each month.",
    relevance:
      "This is the most ambitious idea in the collection. It belongs as a future vision rather than an immediate promise, so OPR stays honest about what is live today.",
    source: "/videos/opr-teaser-3.mp4",
  },
];

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
