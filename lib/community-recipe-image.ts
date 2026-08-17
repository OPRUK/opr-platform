export function fallbackImageForCommunityRecipe(title: string): string | null {
  const normalisedTitle = title.toLowerCase();

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
