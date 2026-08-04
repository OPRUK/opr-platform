"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";

type PublishedRecipe = {
  id: number;
  title: string;
  name: string;
  location: string | null;
  story: string;
  photo_path: string | null;
  category: string;
};

type FeaturedRecipe = {
  title: string;
  place: string;
  story: string;
  slug: string;
  image: string;
  category: string;
};

type RecipeCard = {
  id: string;
  title: string;
  contributor: string;
  location: string | null;
  story: string;
  category: string;
  imageUrl: string | null;
  href: string;
};

export default function PublishedRecipes({
  featuredRecipes,
}: {
  featuredRecipes: FeaturedRecipe[];
}) {
  const [communityRecipes, setCommunityRecipes] = useState<PublishedRecipe[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    async function loadPublishedRecipes() {
      const { data } = await supabase
        .from("recipe_submissions")
        .select("id, title, name, location, story, photo_path, category")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      setCommunityRecipes((data ?? []) as PublishedRecipe[]);
    }

    void loadPublishedRecipes();
  }, []);

  const cards: RecipeCard[] = [
    ...featuredRecipes.map((recipe) => ({
      id: `featured-${recipe.slug}`,
      title: recipe.title,
      contributor: "From the OPR collection",
      location: recipe.place,
      story: recipe.story,
      category: recipe.category,
      imageUrl: recipe.image,
      href: `/family-cookbook/${recipe.slug}`,
    })),
    ...communityRecipes.map((recipe) => ({
      id: `community-${recipe.id}`,
      title: recipe.title,
      contributor: recipe.name,
      location: recipe.location,
      story: recipe.story,
      category: recipe.category,
      imageUrl: recipe.photo_path
        ? supabase.storage.from("recipe-photos").getPublicUrl(recipe.photo_path).data.publicUrl
        : null,
      href: `/family-cookbook/community/${recipe.id}`,
    })),
  ];

  const categories = [
    { value: "all", label: "All Recipes", matches: [] },
    { value: "starter", label: "Starter", matches: ["Starter", "Starter or side"] },
    { value: "main", label: "Main", matches: ["Main", "Main course"] },
    { value: "dessert", label: "Dessert", matches: ["Dessert", "Dessert or baking"] },
  ];
  const categoryOrder: Record<string, number> = {
    Starter: 1,
    "Starter or side": 1,
    Main: 2,
    "Main course": 2,
    Dessert: 3,
    "Dessert or baking": 3,
  };
  const query = search.trim().toLowerCase();
  const visibleRecipes = cards
    .filter((recipe) => {
      const selectedCategory = categories.find((item) => item.value === category);
      const matchesCategory = category === "all" || selectedCategory?.matches.includes(recipe.category);
      const matchesSearch =
        !query ||
        [recipe.title, recipe.contributor, recipe.location ?? "", recipe.story, recipe.category]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesSearch;
    })
    .sort((firstRecipe, secondRecipe) => {
      const courseDifference =
        (categoryOrder[firstRecipe.category] ?? 4) - (categoryOrder[secondRecipe.category] ?? 4);

      return courseDifference || firstRecipe.title.localeCompare(secondRecipe.title, "en");
    });

  return (
    <section>
      <div className="rounded-3xl border border-[#D1AD75]/70 bg-[#FFF3DF] p-5 shadow-sm shadow-[#1C5A50]/10 md:flex md:items-center md:justify-between md:gap-6 md:p-6">
        <label className="block flex-1">
          <span className="sr-only">Search recipes</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            type="search"
            placeholder="Search by recipe, story, cook or place"
            className="w-full rounded-xl border border-[#D1AD75] bg-white px-5 py-3.5 text-[#123C39] outline-none transition placeholder:text-stone-500 focus:border-[#9A622A] focus:ring-2 focus:ring-[#D1AD75]/50"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === item.value
                  ? "bg-[#123C39] text-white"
                  : "border border-[#D1AD75] text-[#123C39] hover:bg-[#F4DDAE]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-[#D1AD75]/70 bg-[#F4DDAE]/55 px-6 py-6 md:flex md:items-center md:justify-between md:gap-8">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[#9A622A]">
            The cookbook is growing
          </p>
          <p className="mt-2 max-w-2xl leading-7 text-stone-700">
            These are the first {cards.length} family recipes to find their place
            in the OPR cookbook. Have a recipe waiting in a drawer, notebook or
            memory? Help write the next page.
          </p>
        </div>
        <Link
          href="/share"
          className="mt-5 inline-flex shrink-0 rounded-full bg-[#123C39] px-5 py-3 font-medium text-white transition hover:scale-105 md:mt-0"
        >
          Share your recipe →
        </Link>
      </div>

      <p className="mt-8 text-sm text-stone-600">
        {visibleRecipes.length} {visibleRecipes.length === 1 ? "recipe" : "recipes"} to discover
      </p>

      {visibleRecipes.length ? (
        <div className="mt-5 grid gap-8 md:grid-cols-3">
          {visibleRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={recipe.href}
              className="group overflow-hidden rounded-3xl bg-[#FFF3DF] shadow-lg shadow-[#1C5A50]/15 transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              {recipe.imageUrl ? (
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-[#DDBB82] px-8 text-center text-xl font-bold text-[#123C39]">
                  A treasured family recipe
                </div>
              )}
              <div className="flex min-h-80 flex-col p-8">
                <p className="text-sm uppercase tracking-[0.16em] text-stone-500">
                  {recipe.category}
                </p>
                <h3 className="mt-5 text-3xl font-bold leading-tight">{recipe.title}</h3>
                <p className="mt-3 text-sm uppercase tracking-[0.16em] text-stone-500">
                  {recipe.contributor}
                  {recipe.location ? ` · ${recipe.location}` : ""}
                </p>
                <p className="mt-6 grow leading-7 text-stone-700">“{recipe.story}”</p>
                <span className="mt-8 font-medium transition group-hover:text-amber-700">
                  Open recipe →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-[#D1AD75] bg-[#FFF3DF]/60 px-8 py-14 text-center">
          <h3 className="text-2xl font-bold">No recipes match that search.</h3>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
            className="mt-5 font-medium text-[#9A622A] underline underline-offset-4"
          >
            Show every recipe
          </button>
        </div>
      )}
    </section>
  );
}
