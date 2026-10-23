import assert from "node:assert/strict";
import test from "node:test";
import { filmForReference, filmIdentity } from "../lib/film-identity.ts";
import { getFilmBySlug } from "../lib/films.ts";

test("media repairs preserve saved post identity and historical website events", () => {
  const film = getFilmBySlug("dave-and-rubble-the-timer")!;
  const oldMaster = "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-the-timer.mp4";
  assert.equal(filmForReference(oldMaster), film);
  assert.equal(filmForReference(film.video), film);
  assert.equal(filmForReference(filmIdentity(film)), film);
  assert.equal(filmIdentity(film), "/films/dave-and-rubble-the-timer");
  assert.equal(filmForReference("https://unrelated.example/video.mp4"), null);
});

test("persisted matches accept every repaired master reference", () => {
  for (const slug of ["ada-and-rubble-party-jollof", "dave-and-rubble-the-finishing-touch", "dave-and-rubble-the-carrot", "dave-and-rubble-the-leftovers"]) {
    const film = getFilmBySlug(slug)!;
    assert.equal(filmForReference(filmIdentity(film)), film);
  }
});
