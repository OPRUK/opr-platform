export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://otherpeoplesrecipes.co.uk";

export const SITE_NAME = "Other People's Recipes";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  return new URL(path, SITE_URL).toString();
}
