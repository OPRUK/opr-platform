export function fallbackImageForCommunityRecipe(title: string): string | null {
  const normalisedTitle = title.toLowerCase();

  if (
    normalisedTitle.includes("mum") &&
    normalisedTitle.includes("apple") &&
    normalisedTitle.includes("pear") &&
    normalisedTitle.includes("chutney")
  ) {
    return "/images/recipes/georginas-mums-apple-pear-chutney.webp";
  }

  if (
    normalisedTitle.includes("pat") &&
    normalisedTitle.includes("haddock") &&
    normalisedTitle.includes("tomato") &&
    normalisedTitle.includes("bake")
  ) {
    return "/images/recipes/pats-haddock-tomato-bake.webp";
  }

  if (
    normalisedTitle.includes("grandad") &&
    normalisedTitle.includes("steak") &&
    normalisedTitle.includes("ale") &&
    normalisedTitle.includes("pie")
  ) {
    return "/images/recipes/grandads-steak-ale-pie.png";
  }

  if (normalisedTitle.includes("sudesh") && normalisedTitle.includes("bhindi")) {
    return "/images/recipes/sudeshs-bhindi-wide.webp";
  }

  return null;
}

export type CommunityOriginalRecipeImage = {
  src: string;
  width: number;
  height: number;
};

const communityOriginalRecipeImages: Record<number, CommunityOriginalRecipeImage> = {
  47: {
    src: "/images/recipes/georginas-mums-apple-pear-chutney-original.webp",
    width: 1600,
    height: 1200,
  },
};

export function fallbackOriginalImageForCommunityRecipe(
  recipeId: number,
): CommunityOriginalRecipeImage | null {
  return communityOriginalRecipeImages[recipeId] ?? null;
}
