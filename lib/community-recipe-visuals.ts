import type { RecipeMethodPhoto } from "./recipes";

// Community recipes can opt into the same visual-guide treatment as the
// curated collection. Keep this keyed by the published recipe ID so the
// public URL and approved submission remain the source of truth.
export const communityRecipeMethodPhotos: Record<number, RecipeMethodPhoto[]> = {
  47: [
    {
      src: "/images/recipes/georginas-mums-apple-pear-chutney-step-1.webp",
      alt: "Clean glass jars standing ready beside the chutney pan",
      title: "Get the jars ready",
      caption: "Prepare enough clean jars before the chutney is finished so it can be potted while everything is still hot.",
      step: 1,
    },
    {
      src: "/images/recipes/georginas-mums-apple-pear-chutney-step-3.webp",
      alt: "Apple and pear chutney simmering with onions and sultanas in a preserving pan",
      title: "Cook until tender",
      caption: "Let the fruit, onions and sultanas soften in the vinegar before adding the sugar and spices.",
      step: 3,
    },
    {
      src: "/images/recipes/georginas-mums-apple-pear-chutney-step-6-potting.webp",
      alt: "Hot apple and pear chutney being spooned carefully into a prepared glass jar",
      title: "Pot while hot",
      caption: "Work carefully and steadily, protecting your hands with a clean tea towel while filling each prepared jar.",
      step: 6,
    },
    {
      src: "/images/recipes/georginas-mums-apple-pear-chutney-step-6-finished.webp",
      alt: "A finished batch of apple and pear chutney cooling in seven glass jars",
      title: "A batch for the cupboard",
      caption: "The finished chutney fills a family cupboard with jars to open, share and enjoy over the months ahead.",
      step: 6,
    },
  ],
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
