import { films, filmSlug, getFilmBySlug, type Film } from "./films.ts";

// Keep historical asset references after a master is replaced. Saved post
// matches use the watch-page path so later media repairs cannot break them.
const legacyFilmReferences: Record<string, string> = {
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-ada-and-rubble-party-jollof-with-audio-v2.mp4": "ada-and-rubble-party-jollof",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-the-timer.mp4": "dave-and-rubble-the-timer",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-does-it-mention-me.mp4": "dave-and-rubble-does-it-mention-me",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-taste-test.mp4": "dave-and-rubble-taste-test",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-the-guest-list.mp4": "dave-and-rubble-the-guest-list",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-more-chicken.mp4": "dave-and-rubble-more-chicken",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-the-inheritance.mp4": "dave-and-rubble-the-inheritance",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-the-finishing-touch-v1.mp4": "dave-and-rubble-the-finishing-touch",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-the-carrot-v1.mp4": "dave-and-rubble-the-carrot",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-the-simmer-v1.mp4": "dave-and-rubble-the-simmer",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-the-leftovers-v2.mp4": "dave-and-rubble-the-leftovers",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-the-portion-v2.mp4": "dave-and-rubble-the-portion",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-the-garnish.mp4": "dave-and-rubble-the-garnish",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-the-lemon.mp4": "dave-and-rubble-the-lemon",
  "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/videos/opr-dave-and-rubble-the-first-bite.mp4": "dave-and-rubble-the-first-bite"
};

export function filmIdentity(film: Film): string {
  return `/films/${filmSlug(film)}`;
}

export function filmForReference(reference: string | null | undefined): Film | null {
  if (!reference) return null;
  const current = films.find((film) => film.video === reference || filmIdentity(film) === reference);
  if (current) return current;
  const oldSlug = legacyFilmReferences[reference];
  return oldSlug ? getFilmBySlug(oldSlug) : null;
}
