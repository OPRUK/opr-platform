// The OPR Film Collection — shared between the desktop /films page and the
// mobile app's /app/films screen so both stay in sync from one source.
export type Film = {
  title: string;
  label: string;
  synopsis: string;
  relevance: string;
  source: string;
  poster?: string;
};

export const films: Film[] = [
  {
    title: "Three Recipes, Three Stories",
    label: "The OPR cookbook — now",
    synopsis:
      "Nana Serb’s Sunday Rice Pudding, Dave’s Butter Chicken and Barbara’s Beef Casserole: three dishes, three homes and three memories now preserved in the OPR cookbook.",
    relevance:
      "This is OPR today: real dishes, real people and stories that can be cooked, shared and passed on.",
    source: "/videos/opr-recipe-stories-film-v2.mp4",
    poster: "/images/recipes/nana-serbs-rice-pudding-wide.png",
  },
  {
    title: "Krishna Anand’s Baingan ka Bharta",
    label: "A recipe from the kitchen drawer",
    synopsis:
      "Krishna Anand, the late grandmother of OPR founder Chaten, cooks baingan ka bharta with her family beside her: roasted aubergine, gently softened onions, tomatoes and chillies becoming a dish that has travelled through generations.",
    relevance:
      "This is OPR at its most personal: Chaten’s late grandmother’s recipe, once held in a drawer, can be carefully translated, shared with the world and made part of another family’s table.",
    source: "/videos/opr-krishna-vanti-film.mp4",
    poster: "/images/opr-krishna-vanti-film-poster.jpg",
  },
  {
    title: "The OPR Restaurant Idea",
    label: "A future OPR concept",
    synopsis:
      "A glimpse of a menu beginning with recipes from real home kitchens: three starters, three mains and three desserts, selected for the food and the story behind every plate.",
    relevance:
      "The restaurant is an exciting future direction for OPR. The living cookbook and the community come first — they are the foundation that could one day bring this table to life.",
    source: "/videos/opr-the-idea.mp4",
    poster: "/images/opr-the-idea-poster.jpg",
  },
  {
    title: "Every Story Stays",
    label: "The OPR memory wall",
    synopsis:
      "A wall of handwritten family recipes grows as more people share the dishes, memories and traditions they want the next generation to keep.",
    relevance:
      "This is the emotional heart of OPR: recipes are not only instructions. They are a way of keeping people, places and stories close.",
    source: "/videos/opr-emotional-payoff.mp4",
    poster: "/images/opr-emotional-payoff-poster.jpg",
  },
  {
    title: "A Menu Written by the People",
    label: "A future OPR concept",
    synopsis:
      "A restaurant kitchen curates recipes submitted by the public, choosing dishes whose food and story deserve a place on the menu. With every contribution, a wall of handwritten memories grows.",
    relevance:
      "This remains central to OPR’s long-term vision, but it is a future chapter. Today, we are building the cookbook and community that could one day power that menu.",
    source: "/videos/opr-teaser-1.mp4",
  },
  {
    title: "Same Town. Same Dish.",
    label: "A future OPR format",
    synopsis:
      "Two home cooks bring their family versions of the same classic to the table, inviting people to choose a side and spark a friendly local debate.",
    relevance:
      "The rivalry idea is still strong. It could become a brilliant voting format once more community recipes are live; for now, it is a glimpse of what OPR could host.",
    source: "/videos/opr-teaser-2.mp4",
  },
  {
    title: "A New Menu Every Month",
    label: "A future OPR concept",
    synopsis:
      "A rotating restaurant menu built from nine mains and three desserts, with family stories, familiar faces and new dishes arriving each month.",
    relevance:
      "This is the most ambitious idea in the collection. It belongs as a future vision rather than an immediate promise, so OPR stays honest about what is live today.",
    source: "/videos/opr-teaser-3.mp4",
  },
];
