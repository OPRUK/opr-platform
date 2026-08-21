import assert from "node:assert/strict";
import test from "node:test";
import { matchSocialFilmTitle } from "../lib/social-film-matching.ts";

test("matches approved Pinterest aliases to canonical website film names", () => {
  assert.equal(matchSocialFilmTitle("Quality Control"), "Dave & Rubble | Quality Control");
  assert.equal(
    matchSocialFilmTitle("OPR Dave and Rubble's steak story"),
    "Dave & Rubble | Some Recipes Are Made with a Little Extra Company",
  );
  assert.equal(
    matchSocialFilmTitle("Dave and Rubbles Souffle"),
    "Dave & Rubble | Sam's Soufflé",
  );
});

test("excludes the agreed Every Recipe Has a Story pins", () => {
  assert.equal(matchSocialFilmTitle("Every Recipe Has a Story | Other Peoples Recipes"), null);
});

test("matches live social captions and channel-specific titles", () => {
  assert.equal(
    matchSocialFilmTitle("Rubble's relationship with time needs work. Every recipe has a story."),
    "Dave & Rubble | The Longest Two Seconds",
  );
  assert.equal(
    matchSocialFilmTitle('Some recipes get "adjusted." Rubble never lets it slide. 🐾'),
    "Dave & Rubble | Butter Chicken Recipe",
  );
  assert.equal(
    matchSocialFilmTitle("OPR Dave and Rubble Gautam Shobha dish of the week"),
    "Dave & Rubble | Dish of the Week: Gautam & Shobha",
  );
  assert.equal(
    matchSocialFilmTitle("Dave says the recipe needs one secret ingredient. Rubble doesn’t need long to decide."),
    "Dave & Rubble | The Secret Ingredient",
  );
});
