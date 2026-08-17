import type { Metadata } from "next";
import Navigation from "../components/Navigation";
import TrackedLink from "../components/TrackedLink";
import VideoBrandMark from "../components/VideoBrandMark";
import PublishedRecipes from "./PublishedRecipes";
import { featuredRecipes } from "../../lib/recipes";
import { absoluteUrl } from "../../lib/site";
import { supabase } from "../../lib/supabase/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Living Cookbook",
  description:
    "Real recipes from real family kitchens, each one saved with the memory that made it matter.",
  alternates: { canonical: "/family-cookbook" },
  openGraph: {
    title: "The Living Cookbook | Other People's Recipes",
    description:
      "Real recipes from real family kitchens, each one saved with the memory that made it matter.",
    url: "/family-cookbook",
    siteName: "Other People's Recipes",
    locale: "en_GB",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Other People's Recipes — Every Recipe has a Story." }],
  },
};

const categoryOrder: Record<string, number> = {
  Starter: 1,
  "Starter or side": 1,
  Main: 2,
  "Main course": 2,
  Dessert: 3,
  "Dessert or baking": 3,
};

// Keep this list in the same order visitors see on the cookbook page. Google
// can use an ItemList on a recipe collection page to understand the recipes
// that belong together and their canonical destinations.
const recipes = [...featuredRecipes].sort((firstRecipe, secondRecipe) => {
  const courseDifference =
    (categoryOrder[firstRecipe.category] ?? 4) - (categoryOrder[secondRecipe.category] ?? 4);

  return courseDifference || firstRecipe.title.localeCompare(secondRecipe.title, "en");
});

async function getPublishedCommunityRecipes() {
  const { data } = await supabase
    .from("recipe_submissions")
    .select("id, title, name, location, story, photo_path, category")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (data ?? []).map((recipe) => ({
    ...recipe,
    category: recipe.category ?? "Recipe",
  }));
}

const cookbookJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "The Living Cookbook",
  description:
    "Real recipes from real family kitchens, each one saved with the memory that made it matter.",
  url: absoluteUrl("/family-cookbook"),
  numberOfItems: recipes.length,
  itemListElement: recipes.map((recipe, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: recipe.title,
    url: absoluteUrl(`/family-cookbook/${recipe.slug}`),
  })),
};

export default async function FamilyCookbook() {
  const communityRecipes = await getPublishedCommunityRecipes();

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(cookbookJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navigation />

      <section className="relative isolate overflow-hidden bg-[#123C39] px-6 pb-12 pt-40 text-center text-white">
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

        <div
          className="font-founder-hand absolute right-6 top-24 hidden h-24 w-24 rotate-[8deg] items-center justify-center rounded-full border-2 border-[#DDB765] text-center text-[11px] font-bold uppercase leading-tight tracking-[0.04em] text-[#DDB765] sm:flex md:right-10 md:top-28"
          aria-hidden="true"
        >
          Every
          <br />
          Recipe
          <br />
          Has A
          <br />
          Story
        </div>

        <div className="mx-auto max-w-4xl">
          <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-200">
            The Living Cookbook
          </p>
          <h1 className="font-display text-5xl font-bold leading-tight drop-shadow-lg md:text-7xl">
            Every recipe has travelled through time before finding its way here.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-12">
        <div className="mb-7 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            Choose a recipe
          </p>
          <h2 className="font-display mt-4 text-4xl font-bold md:text-5xl">
            Stories from family kitchens
          </h2>
          <p className="mt-6 text-lg leading-8 text-stone-700">
            These are the first pages of the OPR cookbook: recipes shared with
            love, and the memories that make them matter.
          </p>
        </div>

        <PublishedRecipes
          featuredRecipes={recipes}
          initialCommunityRecipes={communityRecipes}
        />
      </section>

      <section className="bg-[#FFF3DF] px-6 py-12 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
          Whet Our Appetite
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold md:text-5xl">
          Could your family&apos;s recipe be next?
        </h2>
        <TrackedLink
          href="/share"
          eventKey="cookbook_share"
          className="mt-6 inline-block rounded-full bg-[#123C39] px-8 py-4 text-lg font-medium text-white transition hover:scale-105"
        >
          Share your recipe
        </TrackedLink>
      </section>
    </main>
  );
}
