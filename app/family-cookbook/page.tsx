import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import PublishedRecipes from "./PublishedRecipes";

const recipes = [
  {
    title: "Nana Serb's Sunday Rice Pudding",
    place: "Birmingham, England",
    story:
      "Every Sunday after church, Nana Serb would put this in the oven before lunch. By dessert, the whole house smelled of vanilla and nutmeg.",
    number: "01",
    slug: "nans-sunday-rice-pudding",
    image: "/images/recipes/nana-serbs-rice-pudding.png",
    category: "Dessert",
  },
  {
    title: "Dave's Butter Chicken",
    place: "New Malden, England",
    story:
      "Dave learnt this from his Indian mother-in-law. He replaced chopped tomatoes with passata to enhance the flavour, and now cooks it for his Indian family whenever he is in India.",
    number: "02",
    slug: "dads-friday-night-butter-chicken",
    image: "/images/recipes/daves-butter-chicken.png",
    category: "Main",
  },
  {
    title: "Barbara's Beef Casserole",
    place: "Swansea, Wales",
    story:
      "Barbara learnt it from her mother Pat, then made it her own with a tablespoon of Bovril. She always prepared it a day early, saying that good things were worth waiting for.",
    number: "03",
    slug: "barbaras-beef-casserole",
    image: "/images/recipes/barbaras-beef-casserole.png",
    category: "Main",
  },
];

export default function FamilyCookbook() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#4A4232]">
      <Navigation />

      <section className="relative isolate overflow-hidden bg-[#4A4232] px-6 pb-24 pt-40 text-center text-white">
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/videos/opr-recipe-stories-film.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-[#2D2117]/75" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#20160F]/65 via-[#4A4232]/45 to-[#20160F]/80" />

        <div className="mx-auto max-w-4xl">
          <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-200">
            The Family Cookbook
          </p>
          <h1 className="text-5xl font-bold leading-tight drop-shadow-lg md:text-7xl">
            Every recipe has travelled through time before finding its way here.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-8">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            Choose a recipe
          </p>
          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            Stories from family kitchens
          </h2>
          <p className="mt-6 text-lg leading-8 text-stone-700">
            These are the first pages of the OPR cookbook: recipes shared with
            love, and the memories that make them matter.
          </p>
        </div>

        <PublishedRecipes featuredRecipes={recipes} />
      </section>

      <section className="bg-[#FFF3DF] px-6 py-24 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
          Whet Our Appetite
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold md:text-5xl">
          Could your family&apos;s recipe be next?
        </h2>
        <Link
          href="/share"
          className="mt-10 inline-block rounded-full bg-[#4A4232] px-8 py-4 text-lg font-medium text-white transition hover:scale-105"
        >
          Share Your Story
        </Link>
      </section>
      <Footer />
    </main>
  );
}
