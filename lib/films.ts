// The OPR Film Collection. Video and poster files live in the "films"
// Supabase Storage bucket (self-hosted, not YouTube) so watching a film
// never sends visitors off the site. Both /films (desktop) and
// /app/films (mobile) read from this one list — to add a film, upload
// its video (and an optional poster frame) to the bucket and add one
// entry here.
const storageBase = "https://gtvgjymbmtaplvxdrnln.supabase.co/storage/v1/object/public/films";

export type Film = {
  title: string;
  video: string;
  poster?: string;
};

function film(title: string, file: string, hasPoster = true): Film {
  return {
    title,
    video: `${storageBase}/${file}.mp4`,
    poster: hasPoster ? `${storageBase}/posters/${file}.jpg` : undefined,
  };
}

export const films: Film[] = [
  {
    title: "Dave & Rubble | A Recipe Worth Passing On",
    video: "/videos/opr-dave-and-rubble-recipe-worth-passing-on.mp4",
    poster: "/images/opr-dave-and-rubble-recipe-worth-passing-on-poster.jpg",
  },
  {
    title: "Dave & Rubble | OPR Recipe of the Month",
    video: "/videos/opr-dave-and-rubble-recipe-of-the-month.mp4",
  },
  {
    title: "Dave & Rubble | Cooking Together",
    video: "/videos/opr-dave-and-rubble-kitchen-story-enhanced.mp4",
    poster: "/images/opr-dave-and-rubble-kitchen-story-poster.jpg",
  },
  film("Three Recipes, Three Stories | The OPR Cookbook", "three-recipes-three-stories"),
  film("Ada’s Party Jollof Rice | A Recipe to Bring People Together", "adas-party-jollof-rice"),
  film("Sam & Nadine’s Shepherd’s Pie | A Recipe Worth Passing On", "sam-and-nadines-shepherds-pie"),
  film("Krishna Anand’s Baingan Ka Bharta | From the Kitchen Drawer", "krishna-anands-baingan-ka-bharta-kitchen-drawer"),
  film("Krishna Anand’s Baingan ka Bharta | A Family Recipe", "krishna-anands-baingan-ka-bharta-family-recipe"),
  film("The OPR Idea | A Menu Written by the People", "the-opr-idea"),
  film("A Menu Written by the People | The OPR Vision", "a-menu-written-by-the-people"),
  film("Same Town. Same Dish. | The OPR Vision", "same-town-same-dish"),
  film("A New Menu Every Month | The OPR Vision", "a-new-menu-every-month"),
];
