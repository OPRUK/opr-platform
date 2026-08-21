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
