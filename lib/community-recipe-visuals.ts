import type { RecipeMethodPhoto } from "./recipes";

// Community recipes can opt into the same visual-guide treatment as the
// curated collection. Keep this keyed by the published recipe ID so the
// public URL and approved submission remain the source of truth.
export const communityRecipeMethodPhotos: Record<number, RecipeMethodPhoto[]> = {
  45: [
    {
      src: "/images/recipes/pats-haddock-tomato-bake-step-1.webp",
      alt: "A white onion sliced into thin half-moons on a wooden chopping board",
      title: "Slice the onion",
      caption: "Cut the onion into thin, even slices so it softens gently and cooks at the same pace.",
      step: 1,
    },
    {
      src: "/images/recipes/pats-haddock-tomato-bake-step-2.webp",
      alt: "Skinned beef tomatoes roughly chopped on a wooden board with their skins beside them",
      title: "Prepare the tomatoes",
      caption: "Skin the beef tomatoes, then chop them roughly so they break down into a generous sauce.",
      step: 2,
    },
    {
      src: "/images/recipes/pats-haddock-tomato-bake-step-3.webp",
      alt: "Pieces of undyed smoked haddock with the skin removed on a wooden board",
      title: "Prepare the haddock",
      caption: "Remove the skin and break the haddock into substantial pieces that will hold their shape in the bake.",
      step: 3,
    },
    {
      src: "/images/recipes/pats-haddock-tomato-bake-step-4.webp",
      alt: "Sliced onions and garlic softening in butter in a frying pan",
      title: "Soften the aromatics",
      caption: "Gently sweat the onion and garlic in butter until soft, sweet and translucent rather than browned.",
      step: 4,
    },
    {
      src: "/images/recipes/pats-haddock-tomato-bake-step-5.webp",
      alt: "A chunky tomato and onion sauce simmering in a pan",
      title: "Cook the tomato sauce",
      caption: "Add the tomatoes, season well and let the mixture cook down for 10 minutes.",
      step: 5,
    },
    {
      src: "/images/recipes/pats-haddock-tomato-bake-step-6.webp",
      alt: "Haddock and prawns covered with tomato and onion sauce in a shallow oval baking dish",
      title: "Build the bake",
      caption: "Arrange the raw haddock in the dish, scatter over the prawns and cover everything with the tomato and onion sauce.",
      step: 6,
    },
    {
      src: "/images/recipes/pats-haddock-tomato-bake-step-7.webp",
      alt: "Milk and cream being poured over the haddock and tomato mixture in an oval baking dish",
      title: "Add the cream",
      caption: "Pour over the milk and cream mixture, then finish with plenty of black pepper and a little salt.",
      step: 7,
    },
    {
      src: "/images/recipes/pats-haddock-tomato-bake-step-8.webp",
      alt: "Pat's finished haddock and tomato bake bubbling in an oval ceramic dish",
      title: "Bake until bubbling",
      caption: "After 20–25 minutes at 190°C, the sauce should be bubbling and the haddock cooked through.",
      step: 8,
    },
    {
      src: "/images/recipes/pats-haddock-tomato-bake-step-9.webp",
      alt: "Haddock and tomato bake served with white rice and green vegetables",
      title: "Bring it to the table",
      caption: "Serve the creamy smoked-haddock bake while hot, with rice and green vegetables alongside.",
      step: 9,
    },
  ],
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
