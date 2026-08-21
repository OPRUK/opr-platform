// Capitalises the first letter of each whitespace-separated word in a
// contributor-typed dish name, leaving the rest of each word untouched — so
// "butter chicken" becomes "Butter Chicken" without forcing something like
// "BBQ Wings" down to "Bbq Wings". Matches on the first letter only (not
// every letter run) so "sam's" becomes "Sam's", not "Sam'S".
export function titleCaseDishName(value: string): string {
  return value.replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());
}
