import Navigation from "../components/Navigation";

const films = [
  {
    title: "The OPR Story",
    description:
      "The beginning of an idea built around the recipes and memories people choose to share.",
    source: "/videos/opr-teaser-1.mp4",
  },
  {
    title: "A Table for Every Story",
    description:
      "A glimpse of how a family recipe can become a shared experience around an OPR table.",
    source: "/videos/opr-teaser-2.mp4",
  },
  {
    title: "The Journey Begins",
    description:
      "The next chapter: preserving recipes, celebrating people and creating new memories.",
    source: "/videos/opr-teaser-3.mp4",
  },
];

export default function FilmsPage() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#4A4232]">
      <Navigation />

      <section className="bg-[#4A4232] px-6 pb-24 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">
          The OPR Film Collection
        </p>
        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          Some stories are best told around a table. Others deserve a screen.
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-stone-200">
          Watch the films behind Other People&apos;s Recipes — a growing collection
          about food, family and the memories we choose to pass on.
        </p>
      </section>

      <section className="mx-auto max-w-6xl space-y-20 px-6 py-20 md:px-8">
        {films.map((film, index) => (
          <article
            key={film.title}
            className={`grid items-center gap-10 md:grid-cols-2 ${index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            <div className="overflow-hidden rounded-3xl bg-black shadow-2xl">
              <video className="aspect-video w-full" controls preload="metadata">
                <source src={film.source} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>

            <div className="max-w-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
                Film {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
                {film.title}
              </h2>
              <p className="mt-6 text-lg leading-8 text-stone-700">
                {film.description}
              </p>
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
