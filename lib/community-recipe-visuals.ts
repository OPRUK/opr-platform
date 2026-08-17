import type { RecipeMethodPhoto } from "./recipes";

// Community recipes can opt into the same visual-guide treatment as the
// curated collection. Keep this keyed by the published recipe ID so the
// public URL and approved submission remain the source of truth.
export const communityRecipeMethodPhotos: Record<number, RecipeMethodPhoto[]> = {
  41: [
    {
      src: "/images/recipes/grandads-steak-ale-pie-step-3-ai.webp",
      alt: "Lightly floured pieces of beef steak browning in an uncrowded casserole pan",
      title: "Brown without crowding",
      caption: "Work in batches so the lightly floured beef develops a deep brown crust instead of steaming in the pan.",
      step: 3,
    },
    {
      src: "/images/recipes/grandads-steak-ale-pie-step-7-ai.webp",
      alt: "Steak, vegetables and mushrooms in a thick dark ale gravy that holds a trail from a wooden spoon",
      title: "Reduce to a rich filling",
      caption: "The Guinness gravy is ready when it coats the beef and a spoon drawn through the pan leaves a trail before the sauce closes.",
      step: 7,
    },
    {
      src: "/images/recipes/grandads-steak-ale-pie-step-16-ai.webp",
      alt: "Two individual steak and ale pies with crimped unbaked pastry lids and four steam slits",
      title: "Crimp and vent the lids",
      caption: "Seal the pastry around each rim, cut four small steam slits and brush on only a light, even layer of egg glaze.",
      step: 16,
    },
  ],
};
