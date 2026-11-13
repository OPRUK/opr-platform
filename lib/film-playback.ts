const STORAGE_ORIGIN = "https://kag2qb9d0la7upu4.public.blob.vercel-storage.com";

/** Explicit Main Profile Level 3.1 encodes with constant frame rate and fast-start metadata. */
export function filmPlaybackUrl(video: string): string {
  if (!video.startsWith(`${STORAGE_ORIGIN}/`)) return video;
  return `${STORAGE_ORIGIN}/mobile-compatible-20261113/${video.slice(video.lastIndexOf("/") + 1)}`;
}
