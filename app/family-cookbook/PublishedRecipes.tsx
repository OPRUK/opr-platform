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

type VoteResults = {
  monthKey: string;
  selectedRecipeKey: string | null;
  totals: Record<string, number>;
};

type MapPin = {
  recipe: RecipeCard;
  left: string;
  top: string;
};

const knownPlaces = [
  { match: "birmingham", left: "52%", top: "55%" },
  { match: "new malden", left: "63%", top: "68%" },
  { match: "swansea", left: "40%", top: "64%" },
] as const;

function recipeTitleKey(title: string) {
  return title
    .toLocaleLowerCase("en-GB")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export default function PublishedRecipes({
  featuredRecipes,
}: {
  featuredRecipes: FeaturedRecipe[];
}) {
  const [communityRecipes, setCommunityRecipes] = useState<PublishedRecipe[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [voteResults, setVoteResults] = useState<VoteResults | null>(null);
  const [voteError, setVoteError] = useState("");
  const [votingFor, setVotingFor] = useState<string | null>(null);

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

  useEffect(() => {
    async function loadVoting() {
      try {
        const response = await fetch("/api/recipe-of-month", { cache: "no-store" });
        if (!response.ok) return;
        setVoteResults((await response.json()) as VoteResults);
      } catch {
        // The cookbook still works if voting has not yet been switched on.
      }
    }

    void loadVoting();
  }, []);

  const curatedRecipeTitles = new Set(
    featuredRecipes.map((recipe) => recipeTitleKey(recipe.title)),
  );

  function isCuratedRecipeVersion(recipe: PublishedRecipe) {
    const submittedTitle = recipeTitleKey(recipe.title);

    if (curatedRecipeTitles.has(submittedTitle)) return true;

    // Sudesh's original submission is retained privately in the recipe inbox.
    // The public cookbook should show the finished, curated Bhindi recipe once.
    return (
      submittedTitle.includes("sudesh") &&
      submittedTitle.includes("bhindi") &&
      featuredRecipes.some((featuredRecipe) => {
        const featuredTitle = recipeTitleKey(featuredRecipe.title);
        return featuredTitle.includes("sudesh") && featuredTitle.includes("bhindi");
      })
    );
  }

  // Keep an original submission in the private inbox, but once OPR has
  // published a curated recipe page, show only that finished version publicly.
  const uniqueCommunityRecipes = communityRecipes.filter(
    (recipe) => !isCuratedRecipeVersion(recipe),
  );

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
    ...uniqueCommunityRecipes.map((recipe) => ({
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

  const mapPins: MapPin[] = cards.flatMap((recipe) => {
    const place = recipe.location?.toLowerCase() ?? "";
    const knownPlace = knownPlaces.find(({ match }) => place.includes(match));
    if (!knownPlace) return [];

    const existingPinsAtPlace = cards
      .slice(0, cards.indexOf(recipe))
      .filter((item) => item.location?.toLowerCase().includes(knownPlace.match)).length;

    return [
      {
        recipe,
        left: `calc(${knownPlace.left} + ${existingPinsAtPlace * 18}px)`,
        top: `calc(${knownPlace.top} + ${existingPinsAtPlace * 15}px)`,
      },
    ];
  });

  const beyondBritainRecipes = cards.filter((recipe) =>
    recipe.location?.toLowerCase().includes("nigeria"),
  );
  const recipePlaces = Array.from(
    new Map(
      cards
        .filter(
          (recipe) =>
            recipe.location &&
            !recipe.location.toLowerCase().startsWith("from the opr") &&
            !recipe.location.toLowerCase().startsWith("from the family"),
        )
        .map((recipe) => [`${recipe.location}-${recipe.href}`, recipe]),
    ).values(),
  );

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

  const monthName = voteResults
    ? new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "Europe/London" }).format(
        new Date(`${voteResults.monthKey}-01T12:00:00Z`),
      )
    : new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "Europe/London" }).format(new Date());
  const hasVoted = Boolean(voteResults?.selectedRecipeKey);
  const votingRecipes = [...cards].sort((firstRecipe, secondRecipe) => {
    const courseDifference =
      (categoryOrder[firstRecipe.category] ?? 4) - (categoryOrder[secondRecipe.category] ?? 4);

    return courseDifference || firstRecipe.title.localeCompare(secondRecipe.title, "en");
  });

  async function voteForRecipe(recipeKey: string) {
    if (hasVoted || votingFor) return;

    setVotingFor(recipeKey);
    setVoteError("");
    try {
      const response = await fetch("/api/recipe-of-month", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeKey }),
      });
      const payload = (await response.json()) as VoteResults & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Your vote could not be saved just now.");
      setVoteResults(payload);
    } catch (error) {
      setVoteError(error instanceof Error ? error.message : "Your vote could not be saved just now.");
    } finally {
      setVotingFor(null);
    }
  }

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

      <section className="mt-10 overflow-hidden rounded-3xl border border-[#D1AD75]/70 bg-[#123C39] p-6 text-[#FFF3DF] shadow-xl shadow-[#1C5A50]/20 md:p-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.28em] text-[#F0C45A]">From kitchen to kitchen</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">The OPR recipe map</h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#F6E3BE]">
            Every pin begins with a person, a place and a recipe worth passing on. Explore the kitchens that make up the OPR cookbook so far.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(15rem,0.75fr)]">
          <div className="relative min-h-[25rem] overflow-hidden rounded-3xl border border-[#D1AD75]/60 bg-[#E8C67C]">
            <svg viewBox="0 0 720 480" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <rect width="720" height="480" fill="#E8C67C" />
              <path
                d="M280 43c26-18 67-12 78 18l-7 34 25 25-13 31 29 25-4 40-35 26 4 45-28 35 3 43-32 30-7 51-42-13-27-42-34-23 2-46-25-37 18-38-9-51 25-28 1-47 30-24 5-44 31-14Z"
                fill="#F8E7BF"
                stroke="#805126"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path
                d="M173 199l28 17 2 39-23 20-23-22 4-34 12-20Z"
                fill="#F8E7BF"
                stroke="#805126"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path d="M70 113c70 24 91 85 72 139M471 80c63 24 105 77 99 137M424 330c68 14 116 51 139 105" fill="none" stroke="#9A622A" strokeDasharray="4 12" strokeWidth="2" opacity=".55" />
              <text x="235" y="122" fill="#805126" fontSize="19" letterSpacing="4">SCOTLAND</text>
              <text x="278" y="275" fill="#805126" fontSize="19" letterSpacing="4">ENGLAND</text>
              <text x="172" y="300" fill="#805126" fontSize="16" letterSpacing="3">WALES</text>
              <text x="41" y="450" fill="#805126" fontSize="15" letterSpacing="3">RECIPES IN BRITAIN</text>
            </svg>

            {mapPins.map(({ recipe, left, top }) => (
              <Link
                key={recipe.id}
                href={recipe.href}
                style={{ left, top }}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                aria-label={`Open ${recipe.title}, from ${recipe.location}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#FFF3DF] bg-[#123C39] text-[#F0C45A] shadow-lg transition duration-200 group-hover:scale-110">✦</span>
                <span className="pointer-events-none absolute left-1/2 top-12 z-10 w-max max-w-40 -translate-x-1/2 rounded-lg bg-[#123C39] px-3 py-2 text-center text-xs font-semibold leading-4 text-[#FFF3DF] opacity-0 shadow-lg transition group-hover:opacity-100">
                  {recipe.title}<br /><span className="font-normal text-[#F0C45A]">{recipe.location}</span>
                </span>
              </Link>
            ))}
          </div>

          <div className="rounded-3xl border border-[#D1AD75]/60 bg-[#0F312F] p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-[#F0C45A]">Beyond Britain</p>
            <p className="mt-3 leading-7 text-[#F6E3BE]">OPR is a living cookbook for recipes that travel across borders, generations and families.</p>
            {beyondBritainRecipes.length ? (
              <div className="mt-6 space-y-3">
                {beyondBritainRecipes.map((recipe) => (
                  <Link key={recipe.id} href={recipe.href} className="block rounded-2xl border border-[#D1AD75]/50 bg-white/10 p-4 transition hover:bg-white/15">
                    <span className="block text-xs uppercase tracking-[0.18em] text-[#F0C45A]">{recipe.location}</span>
                    <span className="mt-1 block font-semibold text-white">{recipe.title} →</span>
                  </Link>
                ))}
              </div>
            ) : null}
            <Link href="/share" className="mt-7 inline-block font-medium text-[#F0C45A] underline underline-offset-4">Put your family on the map →</Link>
          </div>
        </div>

        {recipePlaces.length ? (
          <div className="mt-7 border-t border-[#D1AD75]/40 pt-6">
            <p className="text-sm uppercase tracking-[0.22em] text-[#F0C45A]">Browse by place</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {recipePlaces.map((recipe) => (
                <Link key={recipe.id} href={recipe.href} className="rounded-full border border-[#D1AD75]/60 px-4 py-2 text-sm text-[#FFF3DF] transition hover:bg-white/10">
                  {recipe.location}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-10 overflow-hidden rounded-3xl border border-[#D1AD75]/80 bg-[#123C39] px-6 py-9 text-[#FFF3DF] shadow-xl shadow-[#1C5A50]/20 md:px-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.28em] text-[#F0C45A]">OPR Recipe of the Month</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Which recipe should take the table this {monthName}?</h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#F6E3BE]">
            Choose the family recipe you would most like to cook. The winning story becomes OPR&apos;s Recipe of the Month.
          </p>
          <p className="mt-4 text-sm text-[#F0C45A]">
            {hasVoted ? "Your vote is safely recorded. Thank you for helping choose this month’s recipe." : "One vote per person each month."}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {votingRecipes.map((recipe) => {
            const selected = voteResults?.selectedRecipeKey === recipe.id;
            const votes = voteResults?.totals[recipe.id] ?? 0;

            return (
              <div key={recipe.id} className={`rounded-2xl border p-5 ${selected ? "border-[#F0C45A] bg-[#1D665C]" : "border-[#D1AD75]/60 bg-white/10"}`}>
                <p className="text-xs uppercase tracking-[0.18em] text-[#F0C45A]">{recipe.category}</p>
                <h3 className="mt-2 text-xl font-bold text-white">{recipe.title}</h3>
                <p className="mt-1 text-sm text-[#F6E3BE]">{recipe.location ?? "From the OPR cookbook"}</p>
                <button
                  type="button"
                  onClick={() => voteForRecipe(recipe.id)}
                  disabled={hasVoted || Boolean(votingFor)}
                  className={`mt-5 rounded-full px-4 py-2.5 text-sm font-semibold transition ${selected ? "bg-[#F0C45A] text-[#123C39]" : hasVoted ? "cursor-default border border-[#D1AD75]/70 text-[#F6E3BE]" : "bg-[#F0C45A] text-[#123C39] hover:scale-105"}`}
                >
                  {selected ? "Your choice ✓" : votingFor === recipe.id ? "Saving your vote…" : hasVoted ? "Voting complete" : "Vote for this recipe"}
                </button>
                {hasVoted ? <p className="mt-3 text-sm text-[#F6E3BE]">{votes} {votes === 1 ? "vote" : "votes"}</p> : null}
              </div>
            );
          })}
        </div>

        {voteError ? <p className="mt-5 rounded-xl border border-red-300/70 bg-red-950/30 px-4 py-3 text-sm text-red-100">{voteError}</p> : null}
      </section>

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
