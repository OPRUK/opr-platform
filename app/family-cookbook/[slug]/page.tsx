import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navigation from "../../components/Navigation";
import IngredientMeasurements from "../../components/IngredientMeasurements";
import RecipeActions from "../../components/RecipeActions";
import RecipeFaqs from "../../components/RecipeFaqs";
import RecipeVisualGuide from "../../components/RecipeVisualGuide";
import CommunityCookForm from "../../components/CommunityCookForm";
import FamiliesWhoMadeThis from "../../components/FamiliesWhoMadeThis";
import { getFeaturedRecipe } from "../../../lib/recipes";
import { buildFaqPageJsonLd } from "../../../lib/recipe-faqs";
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
      title: "Sudesh’s Bhindi Recipe | Indian Okra Masala",
      description: "Cook Sudesh’s Indian bhindi masala: tender okra without the slime, gently fried before it is folded through a tomato and spice masala.",
    },
    "adas-jollof-rice": {
      title: "Ada’s Nigerian Party Jollof Rice Recipe",
      description: "Cook Ada’s smoky Nigerian party Jollof rice with a deeply reduced pepper base, rich stock and a lightly scorched finish.",
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
  const relatedRecipes = (recipe.relatedRecipeSlugs ?? []).flatMap((relatedSlug) => {
    const relatedRecipe = getFeaturedRecipe(relatedSlug);
    return relatedRecipe ? [relatedRecipe] : [];
  });

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
    recipeInstructions: recipe.method.map((step, index) => {
      const methodPhoto = recipe.methodPhotos?.find((photo) => photo.step === index + 1);

      return {
        "@type": "HowToStep",
        position: index + 1,
        name: truncate(step, 60),
        text: step,
        ...(methodPhoto ? { image: absoluteUrl(methodPhoto.src) } : {}),
      };
    }),
    ...(recipe.datePublished ? { datePublished: recipe.datePublished } : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Living Cookbook", item: absoluteUrl("/family-cookbook") },
      { "@type": "ListItem", position: 2, name: recipe.title, item: absoluteUrl(`/family-cookbook/${recipe.slug}`) },
    ],
  };

  const faqJsonLd = buildFaqPageJsonLd(recipe.faqs);

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
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navigation />

      <section className="bg-[#123C39] px-6 pb-12 pt-32 text-center text-white">
        <p className="mb-3 text-sm uppercase tracking-[0.4em] text-amber-300">
          A page from the living cookbook
        </p>
        <h1 className="font-display mx-auto max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          {recipe.title}
        </h1>
        <p className="mt-4 text-sm uppercase tracking-[0.25em] text-stone-300">
          {recipe.place}
        </p>
        {metaStripItems.length > 0 ? (
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-amber-200">
            {metaStripItems.join(" · ")}
          </p>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-6 py-12 md:px-8 md:py-16">
        <article className="rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-10">
          <div className={recipe.contributorImage ? "grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_18rem]" : undefined}>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
                The story
              </p>
              <p className="mt-7 text-2xl leading-relaxed text-[#123C39]">
                “{recipe.story}”
              </p>
              <p className="mt-10 border-t border-[#DDB765] pt-6 text-sm italic text-stone-600">
                This recipe now belongs to every family who cooks it.
              </p>
            </div>
            {recipe.contributorImage ? (
              <figure>
                <Image
                  src={recipe.contributorImage}
                  alt={recipe.contributorImageAlt ?? recipe.contributorName ?? "Recipe contributor"}
                  width={900}
                  height={1200}
                  sizes="(min-width: 768px) 288px, 100vw"
                  className="aspect-[3/4] w-full rounded-2xl object-cover shadow-lg shadow-[#1C5A50]/15"
                />
                {recipe.contributorName ? (
                  <figcaption className="mt-3 text-center text-sm font-medium text-stone-600">
                    {recipe.contributorName}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
          </div>
        </article>

        <aside className="recipe-card-paper w-full p-8 md:p-10">
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
          <IngredientMeasurements ingredients={recipe.ingredients} />
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

      {recipe.methodPhotos ? <RecipeVisualGuide photos={recipe.methodPhotos} /> : null}

      {recipe.notes?.length ? (
        <section className="bg-[#EED8B2] px-6 pb-4 pt-10 md:pb-5 md:pt-12">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#DDB765] bg-[#FFF3DF] p-6 shadow-xl shadow-[#1C5A50]/10 md:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#9A622A]">
              Cook&apos;s notes &amp; swaps
            </p>
            <h2 className="mt-3 text-4xl font-bold text-[#123C39]">
              A little help from the OPR kitchen
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-stone-700">
              These are optional pointers for making the recipe your own while
              keeping the spirit of the original.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {recipe.notes.map((note) => (
                <article key={note.title} className="rounded-2xl border border-[#DDB765] bg-[#FFF3DF] p-5">
                  <h3 className="text-xl font-bold text-[#123C39]">{note.title}</h3>
                  <p className="mt-3 leading-7 text-stone-700">{note.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <FamiliesWhoMadeThis cooks={communityCooks} recipeTitle={recipe.title} />
      <CommunityCookForm recipeSlug={recipe.slug} recipeTitle={recipe.title} />

      <RecipeFaqs recipeTitle={recipe.title} faqs={recipe.faqs} />

      {relatedRecipes.length ? (
        <section className="bg-[#FFF3DF] px-6 py-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-sm font-bold uppercase tracking-[0.35em] text-[#9A622A]">
              Keep cooking
            </p>
            <h2 className="mt-3 text-center text-4xl font-bold text-[#123C39]">
              More family recipes for your table
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {relatedRecipes.map((relatedRecipe) => (
                <Link
                  key={relatedRecipe.slug}
                  href={`/family-cookbook/${relatedRecipe.slug}`}
                  className="group overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <Image
                    src={relatedRecipe.image}
                    alt=""
                    width={720}
                    height={480}
                    className="aspect-[3/2] w-full object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[#123C39]">{relatedRecipe.title}</h3>
                    <p className="mt-2 text-stone-600">{relatedRecipe.place}</p>
                    <p className="mt-4 font-semibold text-[#9A622A] group-hover:underline">
                      Open this recipe →
                    </p>
                  </div>
                </Link>
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

      <section className="px-6 py-8 text-center md:py-10">
        <Link
          href="/family-cookbook"
          className="inline-block rounded-full bg-[#123C39] px-8 py-4 text-lg font-medium text-white transition hover:scale-105"
        >
          Return to the Living Cookbook
        </Link>
      </section>
    </main>
  );
}
