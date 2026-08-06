// Shared recipe data for the mobile app screens (app/app/**). Combines the
// static curated collection with published community submissions under one
// id scheme so a single detail/cooks/vote route can address either kind:
//   featured-<slug>     -> lib/recipes.ts
//   community-<id>      -> recipe_submissions row, is_published = true
//
// Mirrors the dedup rule in app/family-cookbook/PublishedRecipes.tsx: once a
// community submission has been curated into lib/recipes.ts under the same
// title, hide the original community entry so it isn't shown twice.
import { supabase } from "./supabase/client";
import { featuredRecipes, getFeaturedRecipe, type FeaturedRecipe } from "./recipes";

export type MobileRecipeSummary = {
  id: string;
  title: string;
  place: string;
  category: string;
  story: string;
  image: string | null;
};

export type MobileRecipeDetail = MobileRecipeSummary & {
  ingredients: string[];
  method: string[];
  contributorName?: string;
};

type CommunityRow = {
  id: number;
  title: string;
  name: string;
  location: string | null;
  category: string | null;
  story: string;
  ingredients: string | null;
  method: string | null;
  photo_path: string | null;
};

const categoryOrder: Record<string, number> = {
  Starter: 1,
  "Starter or side": 1,
  Main: 2,
  "Main course": 2,
  Dessert: 3,
  "Dessert or baking": 3,
};

function recipeTitleKey(title: string) {
  return title
    .toLocaleLowerCase("en-GB")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function featuredToSummary(recipe: FeaturedRecipe): MobileRecipeSummary {
  return {
    id: `featured-${recipe.slug}`,
    title: recipe.title,
    place: recipe.place,
    category: recipe.category,
    story: recipe.story,
    image: recipe.image,
  };
}

function communityImageUrl(row: CommunityRow): string | null {
  if (!row.photo_path) return null;
  return supabase.storage.from("recipe-photos").getPublicUrl(row.photo_path).data.publicUrl;
}

function communityToSummary(row: CommunityRow): MobileRecipeSummary {
  return {
    id: `community-${row.id}`,
    title: row.title,
    place: row.location || "From the OPR community",
    category: row.category || "Recipe",
    story: row.story,
    image: communityImageUrl(row),
  };
}

export async function getPublishedCommunityRecipes(): Promise<CommunityRow[]> {
  const { data } = await supabase
    .from("recipe_submissions")
    .select("id, title, name, location, category, story, ingredients, method, photo_path")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (data ?? []) as CommunityRow[];
}

/** All recipes, deduped, in "browse" order (course, then title). */
export async function getAllMobileRecipes(): Promise<MobileRecipeSummary[]> {
  const curatedTitles = new Set(featuredRecipes.map((recipe) => recipeTitleKey(recipe.title)));
  const community = await getPublishedCommunityRecipes();
  const uniqueCommunity = community.filter((row) => !curatedTitles.has(recipeTitleKey(row.title)));

  const cards = [...featuredRecipes.map(featuredToSummary), ...uniqueCommunity.map(communityToSummary)];

  return cards.sort((a, b) => {
    const courseDifference = (categoryOrder[a.category] ?? 4) - (categoryOrder[b.category] ?? 4);
    return courseDifference || a.title.localeCompare(b.title, "en");
  });
}

/** Every recipe is a Recipe of the Month candidate, in course order (starter, main, dessert), then alphabetically. */
export async function getVoteCandidates(): Promise<MobileRecipeSummary[]> {
  return getAllMobileRecipes();
}

export async function getMobileRecipe(id: string): Promise<MobileRecipeDetail | null> {
  if (id.startsWith("featured-")) {
    const recipe = getFeaturedRecipe(id.slice("featured-".length));
    if (!recipe) return null;
    return {
      ...featuredToSummary(recipe),
      ingredients: recipe.ingredients,
      method: recipe.method,
      contributorName: recipe.contributorName,
    };
  }

  if (id.startsWith("community-")) {
    const rowId = Number(id.slice("community-".length));
    if (!Number.isFinite(rowId)) return null;

    const { data } = await supabase
      .from("recipe_submissions")
      .select("id, title, name, location, category, story, ingredients, method, photo_path")
      .eq("id", rowId)
      .eq("is_published", true)
      .maybeSingle();

    if (!data) return null;
    const row = data as CommunityRow;

    return {
      ...communityToSummary(row),
      ingredients: row.ingredients ? row.ingredients.split("\n").filter(Boolean) : [],
      method: row.method ? row.method.split("\n").filter(Boolean) : [],
      contributorName: row.name,
    };
  }

  return null;
}
