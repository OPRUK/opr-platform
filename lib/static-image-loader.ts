'use client';

import variants from './image-variants.json';

// Sizes are generated once during the build, not by Vercel on each new request.
const manifest = variants as Record<string, { width: number; src: string }[]>;
export default function staticImageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  const choices = manifest[src.split('?')[0]];
  if (!choices?.length) return src;
  return (choices.find(choice => choice.width >= width) || choices[choices.length - 1]).src;
}
