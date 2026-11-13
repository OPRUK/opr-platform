const FILM_STORAGE_ORIGIN = "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com";

/** Keep playback on the website origin; the CDN rewrite retains range requests. */
export function filmPlaybackUrl(video: string): string {
  if (!video.startsWith(`${FILM_STORAGE_ORIGIN}/`)) return video;
  return `/film-media${video.slice(FILM_STORAGE_ORIGIN.length)}`;
}
