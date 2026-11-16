const STORAGE_ORIGIN = "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com";

/** Explicit Main Profile Level 3.1 encodes with constant frame rate and fast-start metadata. */
export function filmPlaybackUrl(video: string): string {
  // New Christmas masters already use the verified mobile-safe encoding.
  if (video.startsWith(`${STORAGE_ORIGIN}/christmas-films-20261116/`)) return video;
  if (!video.startsWith(`${STORAGE_ORIGIN}/`)) return video;
  return `${STORAGE_ORIGIN}/simple-endcards-20261113/${video.slice(video.lastIndexOf("/") + 1)}`;
}
