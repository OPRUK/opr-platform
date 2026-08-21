import { films } from "./films.ts";

function normalise(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, " and ")
    .replace(/[’']/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const aliases: Record<string, string> = {
  "quality control": "Dave & Rubble | Quality Control",
  "the secret ingredient": "Dave & Rubble | The Secret Ingredient",
  "some recipes never leave you": "Dave & Rubble | Some Recipes Never Leave You",
  "dave and rubbles souffle": "Dave & Rubble | Sam's Soufflé",
  "sam and nadines shepherds pie opr": "Sam & Nadine’s Shepherd’s Pie | A Recipe Worth Passing On",
  "opr dave and rubbles steak story": "Dave & Rubble | Some Recipes Are Made with a Little Extra Company",
  "some recipes are made with a little extra company": "Dave & Rubble | Some Recipes Are Made with a Little Extra Company",
  "dave and rubble a recipe worth passing on": "Dave & Rubble | A Recipe Worth Passing On",
  "mummy morris and rubble daves mums beef casserole": "Mummy Morris & Rubble | Dave’s Mum’s Beef Casserole",
  "dave and rubble butter chicken recipe": "Dave & Rubble | Butter Chicken Recipe",
  "dave and rubble daves butter chicken": "Dave & Rubble | Dave's Butter Chicken",
};

export function matchSocialFilmTitle(rawTitle: string): string | null {
  const title = normalise(rawTitle.split("\n")[0] ?? rawTitle);
  if (!title || title.startsWith("every recipe has a story")) return null;
  if (aliases[title]) return aliases[title];
  for (const film of films) {
    const canonical = normalise(film.title);
    const shortTitle = normalise(film.title.split("|").at(-1) ?? film.title);
    if (title === canonical || title.startsWith(`${canonical} `) || (shortTitle.length >= 12 && title === shortTitle)) return film.title;
  }
  return null;
}

export const pinterestFilmImpressions = [
  { title: "Dave & Rubble | Dave's Butter Chicken", views: 9 },
  { title: "The Secret Ingredient", views: 9 },
  { title: "Sam & Nadine’s Shepherd’s Pie | OPR", views: 7 },
  { title: "Dave and Rubbles Souffle", views: 6 },
  { title: "Some recipes never leave you.", views: 6 },
  { title: "Dave & Rubble | A Recipe Worth Passing On", views: 5 },
  { title: "Mummy Morris & Rubble | Dave’s Mum’s Beef Casserole", views: 3 },
  { title: "Dave and Rubble Butter Chicken Recipe", views: 1 },
  { title: "Quality Control", views: 10 },
  { title: "OPR Dave and Rubble's steak story", views: 9 },
] as const;

// Verified directly in each channel's creator dashboard. These figures provide
// a fallback when an API is unavailable or a post caption does not match the
// website title. Live API totals override them when available.
export const socialFilmAuditCapturedAt = "2026-08-21T18:35:00+01:00";

export const facebookFilmViews = [
  { title: "Dave & Rubble | Your Nomination", views: 27 },
  { title: "Dave & Rubble | Dish of the Week: Gautam & Shobha", views: 54 },
  { title: "Dave & Rubble | The Longest Two Seconds", views: 173 },
  { title: "Dave & Rubble | Butter Chicken Recipe", views: 301 },
  { title: "Dave & Rubble | Quality Control", views: 137 },
  { title: "Dave & Rubble | The Secret Ingredient", views: 186 },
  { title: "Dave & Rubble | Dave's Butter Chicken", views: 332 },
] as const;

export const instagramFilmViews = [
  { title: "Dave & Rubble | Your Nomination", views: 41 },
  { title: "Dave & Rubble | Dish of the Week: Gautam & Shobha", views: 103 },
  { title: "Dave & Rubble | The Longest Two Seconds", views: 366 },
  { title: "Dave & Rubble | Butter Chicken Recipe", views: 218 },
  { title: "Dave & Rubble | Quality Control", views: 314 },
  { title: "Dave & Rubble | The Secret Ingredient", views: 195 },
  { title: "Dave & Rubble | Dave's Butter Chicken", views: 424 },
  { title: "Dave & Rubble | Sam's Soufflé", views: 231 },
  { title: "Dave & Rubble | Some Recipes Never Leave You", views: 206 },
  { title: "Mummy Morris & Rubble | Dave’s Mum’s Beef Casserole", views: 215 },
  { title: "Dave & Rubble | Finding an Old Family Recipe", views: 180 },
  { title: "Dave & Rubble | A Recipe Worth Passing On", views: 177 },
  { title: "Dave & Rubble | OPR Recipe of the Month", views: 169 },
  { title: "Dave & Rubble | Cooking Together", views: 158 },
  { title: "Dave & Rubble | Some Recipes Are Made with a Little Extra Company", views: 206 },
] as const;

export const tiktokFilmViews = [
  { title: "Dave & Rubble | Dave's Butter Chicken", views: 250 },
  { title: "Dave & Rubble | Quality Control", views: 246 },
  { title: "Dave & Rubble | Finding an Old Family Recipe", views: 243 },
  { title: "Dave & Rubble | The Secret Ingredient", views: 241 },
  { title: "Dave & Rubble | Sam's Soufflé", views: 239 },
] as const;

export const youtubeFilmViews = [
  { title: "Dave & Rubble | Your Nomination", views: 0 },
  { title: "Dave & Rubble | Dish of the Week: Gautam & Shobha", views: 0 },
  { title: "Dave & Rubble | The Longest Two Seconds", views: 0 },
  { title: "Dave & Rubble | Butter Chicken Recipe", views: 0 },
  { title: "Dave & Rubble | Quality Control", views: 0 },
  { title: "Dave & Rubble | The Secret Ingredient", views: 0 },
  { title: "Dave & Rubble | Dave's Butter Chicken", views: 1 },
  { title: "Dave & Rubble | Sam's Soufflé", views: 2 },
  { title: "Dave & Rubble | Some Recipes Never Leave You", views: 3 },
  { title: "Dave & Rubble | Finding an Old Family Recipe", views: 0 },
  { title: "Dave & Rubble | A Recipe Worth Passing On", views: 0 },
  { title: "Dave & Rubble | OPR Recipe of the Month", views: 0 },
] as const;
