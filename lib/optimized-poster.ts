// <video poster> can't use a responsive srcset the way <img> can, so route
// it through Next's own image endpoint to get the same automatic resize +
// compression the rest of the site's images already get. Lives outside
// HomeHero.tsx (a "use client" file) so the server-rendered homepage can
// also call it directly for its preload hint — plain functions from client
// modules can't be invoked from a Server Component, only rendered as JSX.
export function optimizedPoster(path: string, width = 828): string {
  return `/_next/image?url=${encodeURIComponent(path)}&w=${width}&q=75`;
}
