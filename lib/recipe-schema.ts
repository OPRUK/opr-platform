export function buildRecipeKeywords(values: Array<string | null | undefined>): string {
  const keywords = values
    .flatMap((value) => value?.split(",") ?? [])
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, all) =>
      all.findIndex((candidate) => candidate.toLocaleLowerCase("en-GB") === value.toLocaleLowerCase("en-GB")) === index,
    );

  return keywords.join(", ");
}

export function recipeInstructionUrl(recipeUrl: string, position: number): string {
  return `${recipeUrl}#method-step-${position}`;
}

export function buildRecipeVideoJsonLd({
  name,
  description,
  contentUrl,
  thumbnailUrl,
}: {
  name: string;
  description: string;
  contentUrl: string;
  thumbnailUrl?: string | null;
}) {
  return {
    "@type": "VideoObject",
    name,
    description,
    contentUrl,
    ...(thumbnailUrl ? { thumbnailUrl: [thumbnailUrl] } : {}),
  };
}
