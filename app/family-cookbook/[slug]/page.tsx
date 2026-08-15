import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navigation from "../../components/Navigation";
import RecipeActions from "../../components/RecipeActions";
import CommunityCookForm from "../../components/CommunityCookForm";
import FamiliesWhoMadeThis from "../../components/FamiliesWhoMadeThis";
import { getFeaturedRecipe } from "../../../lib/recipes";
import { getApprovedCommunityCooks } from "../../../lib/community-cooks";
import { SITE_NAME, absoluteUrl } from "../../../lib/site";

export const dynamic = "force-dynamic";

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : clipped.length)}…`;
}

/** Formats an ISO 8601 duration like "PT1H45M" as "1 hr 45 min". */
function formatDuration(isoDuration: string): string {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?$/.exec(isoDuration);
  if (!match) return isoDuration;
  const [, hours, minutes] = match;
  const parts: string[] = [];
  if (hours) parts.push(`${hours} hr`);
  if (minutes) parts.push(`${minutes} min`);
  return parts.join(" ") || isoDuration;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getFeaturedRecipe(slug);
  if (!recipe) return {};

  const seo = {
    "sudeshs-bhindi": {
      title: "Sudesh’s Family Bhindi Recipe | Indian Okra",
      description: "Cook Sudesh’s family bhindi recipe: a simple Indian okra dish, preserved with the personal story behind it.",
    },
    "adas-jollof-rice": {
      title: "Ada’s Family Jollof Rice Recipe",
      description: "Cook Ada’s family jollof rice recipe, a celebratory dish made to bring people together, with the story behind it.",
    },
  }[recipe.slug];
  const title = seo?.title ?? `${recipe.title} — ${recipe.place}`;
  const description = seo?.description ?? truncate(recipe.story, 155);
  const url = `/family-cookbook/${recipe.slug}`;
  const ogImage = `${url}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: recipe.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getFeaturedRecipe(slug);

  if (!recipe) {
    notFound();
  }

  const communityCooks = await getApprovedCommunityCooks({ recipeSlug: recipe.slug });
  const relatedFilm = {
    "adas-jollof-rice": "Ada’s Party Jollof Rice | A Recipe to Bring People Together",
    "krishna-anands-baingan-ka-bharta": "Krishna Anand’s Baingan ka Bharta | A Family Recipe",
    "sams-shepherds-pie": "Sam & Nadine’s Shepherd’s Pie | A Recipe Worth Passing On",
  }[recipe.slug];

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "@id": `${absoluteUrl(`/family-cookbook/${recipe.slug}`)}#recipe`,
    name: recipe.title,
    url: absoluteUrl(`/family-cookbook/${recipe.slug}`),
    mainEntityOfPage: absoluteUrl(`/family-cookbook/${recipe.slug}`),
    inLanguage: "en-GB",
    image: [absoluteUrl(recipe.image)],
    description: truncate(recipe.story, 300),
    author: { "@type": "Person", name: recipe.contributorName ?? SITE_NAME },
    ...(recipe.category ? { recipeCategory: recipe.category } : {}),
    ...(recipe.cuisine ? { recipeCuisine: recipe.cuisine } : {}),
    ...(recipe.prepTime ? { prepTime: recipe.prepTime } : {}),
    ...(recipe.cookTime ? { cookTime: recipe.cookTime } : {}),
    ...(recipe.serves ? { recipeYield: recipe.serves } : {}),
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.method.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: truncate(step, 60),
      text: step,
    })),
    ...(recipe.datePublished ? { datePublished: recipe.datePublished } : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Family Cookbook", item: absoluteUrl("/family-cookbook") },
      { "@type": "ListItem", position: 2, name: recipe.title, item: absoluteUrl(`/family-cookbook/${recipe.slug}`) },
    ],
  };

  const timeLabel = [
    recipe.prepTime ? `${formatDuration(recipe.prepTime)} prep` : null,
    recipe.cookTime ? `${formatDuration(recipe.cookTime)} cook` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const metaStripItems = [
    timeLabel || null,
    recipe.serves ? `Serves ${recipe.serves}` : null,
    recipe.category || null,
  ].filter((item): item is string => Boolean(item));

  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recipeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navigation />

      <section className="bg-[#123C39] px-6 pb-20 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">
          A page from the family cookbook
        </p>
        <h1 className="font-display mx-auto max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          {recipe.title}
        </h1>
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-300">
          {recipe.place}
        </p>
        {metaStripItems.length > 0 ? (
          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-amber-200">
            {metaStripItems.join(" · ")}
          </p>
        ) : null}
      </section>

      <section className="mx-auto grid max-w-6xl gap-14 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <article className="rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            The story
          </p>
          <p className="mt-7 text-2xl leading-relaxed text-[#123C39]">
            “{recipe.story}”
          </p>
          <p className="mt-10 border-t border-[#D1AD75] pt-6 text-sm italic text-stone-600">
            This recipe now belongs to every family who cooks it.
          </p>
        </article>

        <aside className="rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          <div className="mb-8 flex items-start gap-3">
            <Image
              src={recipe.image}
              alt={recipe.title}
              width={1200}
              height={900}
              className="min-w-0 flex-1 aspect-[4/3] rounded-2xl object-cover"
            />
            <RecipeActions title={recipe.title} imageUrl={recipe.image} />
          </div>
          <h2 className="text-3xl font-bold">What you&apos;ll need</h2>
          <ul className="mt-7 space-y-4 leading-7 text-stone-700">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient} className="border-b border-[#E7CEA2] pb-4">
                {ingredient}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="bg-[#FFF3DF] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            The method
          </p>
          <ol className="mt-9 space-y-7">
            {recipe.method.map((step, index) => (
              <li key={step} className="flex gap-6 text-lg leading-8 text-stone-700">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#123C39] text-sm font-bold text-white">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {recipe.notes?.length ? (
        <section className="bg-[#EED8B2] px-6 py-20">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#D1AD75] bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/10 md:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#9A622A]">
              Cook&apos;s notes &amp; swaps
            </p>
            <h2 className="mt-4 text-4xl font-bold text-[#123C39]">
              A little help from the OPR kitchen
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-700">
              These are optional pointers for making the recipe your own while
              keeping the spirit of the original.
            </p>
            <div className="mt-9 grid gap-5 md:grid-cols-2">
              {recipe.notes.map((note) => (
                <article key={note.title} className="rounded-2xl border border-[#E7CEA2] bg-[#FFF9EC] p-6">
                  <h3 className="text-xl font-bold text-[#123C39]">{note.title}</h3>
                  <p className="mt-3 leading-7 text-stone-700">{note.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {relatedFilm ? (
        <section className="bg-[#123C39] px-6 py-16 text-center text-white">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Watch the story</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold">{relatedFilm}</h2>
          <Link
            href={"/films#" + encodeURIComponent(relatedFilm)}
            className="mt-8 inline-block rounded-full bg-[#FFF3DF] px-8 py-4 font-medium text-[#123C39] transition hover:scale-105"
          >
            Watch this family recipe film
          </Link>
        </section>
      ) : null}

      <FamiliesWhoMadeThis cooks={communityCooks} recipeTitle={recipe.title} />
      <CommunityCookForm recipeSlug={recipe.slug} recipeTitle={recipe.title} />


      <section className="px-6 py-20 text-center">
        <Link
          href="/family-cookbook"
          className="inline-block rounded-full bg-[#123C39] px-8 py-4 text-lg font-medium text-white transition hover:scale-105"
        >
          Return to the Cookbook
        </Link>
      </section>
    </main>
  );
}
