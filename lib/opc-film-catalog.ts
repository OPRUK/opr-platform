const titles = [
  "The Good Glasses", "The Guest List", "The Christmas Spirit", "The Christmas Budget",
  "The Review", "On the House", "The Usual", "My Spirit",
];

export const opcFilms = titles.map((title) => ({
  title: `Suki & Olive | ${title}`,
  id: `suki-and-olive-${title.toLowerCase().replaceAll(" ", "-")}`,
}));

export async function loadOpcFilms() {
  try {
    const response = await fetch("https://otherpeoplescocktails.co.uk/sitemap.xml", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return opcFilms;

    const xml = await response.text();
    const ids = new Set(Array.from(xml.matchAll(
      /<loc>https:\/\/otherpeoplescocktails\.co\.uk\/films\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?<\/loc>/g,
    ), (match) => match[1]));
    if (!ids.size) return opcFilms;

    const knownTitles = new Map(opcFilms.map((film) => [film.id, film.title]));
    return [...ids].map((id) => {
      const isSukiAndOlive = id.startsWith("suki-and-olive-");
      const words = id.replace(/^suki-and-olive-/, "").split("-");
      const title = words.map((word, index) => index > 0 && ["a", "and", "of", "the"].includes(word)
        ? word : word[0].toUpperCase() + word.slice(1)).join(" ");
      return { id, title: knownTitles.get(id) ?? (isSukiAndOlive ? `Suki & Olive | ${title}` : title) };
    });
  } catch {
    return opcFilms;
  }
}
