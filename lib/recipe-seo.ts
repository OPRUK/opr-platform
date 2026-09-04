type RecipeSeoInput = {
  slug: string;
  title: string;
  story: string;
};

type CommunityRecipeSeoInput = {
  id: number;
  title: string;
  location: string | null;
  story: string;
};

export type RecipeSeo = {
  title: string;
  description: string;
};

const featuredRecipeSeo: Record<string, RecipeSeo> = {
  "nana-serbs-sunday-rice-pudding": {
    title: "Nana Serb’s Rice Pudding Recipe | Traditional Baked Rice Pudding",
    description:
      "Bake Nana Serb’s traditional rice pudding with whole milk, vanilla and nutmeg for a soft, comforting British family dessert.",
  },
  "daves-butter-chicken": {
    title: "Dave’s Butter Chicken Recipe | Homemade Indian Butter Chicken",
    description:
      "Cook Dave’s homemade Indian butter chicken with passata, tandoori masala, whole chillies, butter and cream for a smooth, rich sauce.",
  },
  "barbaras-beef-casserole": {
    title: "Barbara’s Beef Casserole Recipe | Traditional Slow-Cooked Casserole",
    description:
      "Cook Barbara’s slow-cooked beef casserole with dark ale, Bovril and rich stock, then leave it overnight for an even deeper family-style gravy.",
  },
  "krishna-anands-baingan-ka-bharta": {
    title: "Krishna Anand’s Baingan ka Bharta | Smoky Aubergine Recipe",
    description:
      "Make Krishna Anand’s baingan ka bharta: smoky aubergine cooked with onions, tomatoes, green chillies and warming Indian spices.",
  },
  "sudeshs-bhindi": {
    title: "Sudesh’s Bhindi Recipe | Indian Okra Masala",
    description:
      "Cook Sudesh’s Indian bhindi masala: tender okra fried gently before it is folded through an onion, tomato, ginger and spice masala.",
  },
  "adas-jollof-rice": {
    title: "Ada’s Nigerian Party Jollof Rice Recipe",
    description:
      "Cook Ada’s smoky Nigerian party Jollof rice with a deeply reduced pepper base, rich stock and the treasured lightly scorched bottom layer.",
  },
  "sams-shepherds-pie": {
    title: "Sam’s Shepherd’s Pie Recipe | Traditional Lamb Shepherd’s Pie",
    description:
      "Make Sam’s comforting lamb shepherd’s pie with vegetables, rich gravy and crisp mashed potato, deepened with anchovies and Marmite.",
  },
  "phils-and-serbs-three-cheese-souffle": {
    title: "Phil & Serb’s Three-Cheese Soufflé Recipe",
    description:
      "Bake Phil and Serb’s light three-cheese soufflé with Gruyère, mature Cheddar and Parmigiano-Reggiano, plus clear tips for a clean rise.",
  },
  "gautam-and-shobhas-tandoori-aloo-nazakat": {
    title: "Gautam & Shobha’s Tandoori Aloo Nazakat Recipe",
    description:
      "Make tandoori aloo nazakat with potato barrels, a spiced paneer filling and smoky tandoori marinade, from Gautam and Shobha’s family recipe.",
  },
  "auntie-marcias-pineapple-jerk-chicken": {
    title: "Auntie Marcia’s Jamaican Jerk Chicken Recipe",
    description:
      "Make Auntie Marcia’s Jamaican jerk chicken with Scotch bonnet, allspice, thyme, lime and pineapple juice for a sweet, sour and fiery marinade.",
  },
  "badepapas-pindi-cholley": {
    title: "Badepapa’s Pindi Chole Recipe | Punjabi Chickpea Curry",
    description:
      "Cook Badepapa’s dark Punjabi Pindi chole with tea-simmered chickpeas, paneer and a dry, tangy masala that clings to every chickpea.",
  },
};

const communityRecipeSeo: Record<number, RecipeSeo> = {
  41: {
    title: "Grandad’s Steak & Ale Pie Recipe | Traditional British Pie",
    description:
      "Bake Grandad’s steak and ale pie with slow-cooked beef, Guinness gravy and a golden pastry lid: a family recipe handed down in Bermondsey.",
  },
  45: {
    title: "Pat’s Haddock and Tomato Bake Recipe | Family Fish Bake",
    description:
      "Make Pat’s comforting haddock and tomato bake with smoked fish, prawns, onions, cream and milk, then serve it with rice and green vegetables.",
  },
  47: {
    title: "Mum’s Apple and Pear Chutney Recipe | Family Chutney",
    description:
      "Cook Georgina’s inherited apple or pear chutney with onions, sultanas, brown sugar, vinegar and ginger, then pot it into prepared jars.",
  },
};

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : clipped.length)}…`;
}

export function getFeaturedRecipeSeo(recipe: RecipeSeoInput): RecipeSeo {
  return featuredRecipeSeo[recipe.slug] ?? {
    title: `${recipe.title} Recipe`,
    description: truncate(recipe.story, 155),
  };
}

export function getCommunityRecipeSeo(recipe: CommunityRecipeSeoInput): RecipeSeo {
  const fallbackTitle = /\brecipe\b/i.test(recipe.title)
    ? recipe.title
    : `${recipe.title} Recipe`;

  return communityRecipeSeo[recipe.id] ?? {
    title: recipe.location
      ? `${fallbackTitle} | A Family Recipe from ${recipe.location}`
      : `${fallbackTitle} | A Real Family Recipe`,
    description: truncate(recipe.story, 155),
  };
}

