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
    title: "Dave & Rubble | Some Recipes Never Leave You",
    video: "/videos/opr-dave-and-rubble-some-recipes-never-leave-you.mp4",
  },
  {
    title: "Dave & Rubble | Finding an Old Family Recipe",
    video: "/videos/opr-dave-and-rubble-old-family-recipe.mov",
  },
  {
    title: "Mummy Morris & Rubble | Dave’s Mum’s Beef Casserole",
    video: "/videos/opr-mummy-morris-and-rubble-beef-casserole.mov",
  },
  {
    title: "Dave & Rubble | A Recipe Worth Passing On",
    video: "/videos/opr-dave-and-rubble-recipe-worth-passing-on.mp4",
    poster: "/images/opr-dave-and-rubble-recipe-worth-passing-on-poster.jpg",
  },
