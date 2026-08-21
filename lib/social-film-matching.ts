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
