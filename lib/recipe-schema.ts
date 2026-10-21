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

export function buildRecipeAuthor(names: string[], publisherName: string, publisherUrl: string) {
  const people = [...new Set(names.map((name) => name.trim()).filter(Boolean))]
    .map((name) => ({ "@type": "Person" as const, name }));
  // An organization must not be presented as a person when a cook is unknown.
  return people.length ? people : { "@type": "Organization" as const, name: publisherName, url: publisherUrl };
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
