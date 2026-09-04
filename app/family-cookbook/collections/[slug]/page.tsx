import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navigation from "../../../components/Navigation";
import {
  getRecipeCollection,
  recipeCollections,
} from "../../../../lib/recipe-collections";
import { SITE_NAME, absoluteUrl } from "../../../../lib/site";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return recipeCollections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getRecipeCollection(slug);
  if (!collection) return {};

  const path = `/family-cookbook/collections/${collection.slug}`;
  const image = collection.recipes[0]?.image ?? "/opengraph-image";

  return {
    title: { absolute: collection.metaTitle },
    description: collection.description,
    alternates: { canonical: path },
    openGraph: {
      title: collection.metaTitle,
      description: collection.description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_GB",
      type: "website",
      images: [{ url: image, width: 1200, height: 675, alt: collection.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: collection.metaTitle,
      description: collection.description,
      images: [image],
    },
  };
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : clipped.length)}…`;
}

export default async function RecipeCollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getRecipeCollection(slug);
  if (!collection) notFound();

  const path = `/family-cookbook/collections/${collection.slug}`;
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    description: collection.description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "CollectionPage",
      name: "The Living Cookbook",
      url: absoluteUrl("/family-cookbook"),
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: collection.recipes.length,
      itemListElement: collection.recipes.map((recipe, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: recipe.title,
        url: absoluteUrl(`/family-cookbook/${recipe.slug}`),
      })),
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Living Cookbook",
        item: absoluteUrl("/family-cookbook"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: collection.title,
        item: absoluteUrl(path),
      },
    ],
  };
  const otherCollections = recipeCollections.filter(
    (item) => item.slug !== collection.slug,
  );

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navigation />

      <header className="bg-[#123C39] px-6 pb-14 pt-36 text-center text-white md:pb-20 md:pt-44">
        <p className="text-sm font-bold uppercase tracking-[0.32em] text-[#DDB765]">
          {collection.eyebrow}
        </p>
        <h1 className="font-display mx-auto mt-5 max-w-5xl text-5xl font-bold leading-tight md:text-7xl">
          {collection.title}
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-stone-200 md:text-xl">
          {collection.description}
        </p>
      </header>

      <section className="bg-[#FFF3DF] px-6 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.32em] text-[#9A622A]">
            From the Living Cookbook
          </p>
          <div className="mt-5 space-y-5 text-lg leading-8 text-stone-700">
            {collection.introduction.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-[0.32em] text-[#9A622A]">
            {collection.recipes.length} recipes to discover
          </p>
          <h2 className="font-display mt-4 text-4xl font-bold md:text-5xl">
            Cook the collection
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collection.recipes.map((recipe) => (
              <Link
                key={recipe.slug}
                href={`/family-cookbook/${recipe.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl bg-[#FFF3DF] shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >
                <Image
                  src={recipe.image}
                  alt=""
                  width={800}
                  height={600}
                  sizes="(min-width: 1024px) 352px, (min-width: 768px) 50vw, 100vw"
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9A622A]">
                    {recipe.cuisine ?? recipe.category} · {recipe.place}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold leading-tight text-[#123C39]">
                    {recipe.title}
                  </h3>
                  <p className="mt-4 flex-1 leading-7 text-stone-700">
                    {truncate(recipe.story, 170)}
                  </p>
                  <span className="mt-5 font-semibold text-[#1C5A50] group-hover:underline">
                    Open recipe →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FFF3DF] px-6 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-bold uppercase tracking-[0.32em] text-[#9A622A]">
            Keep exploring
          </p>
          <h2 className="font-display mt-4 text-center text-4xl font-bold">
            More recipe collections
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {otherCollections.map((item) => (
              <Link
                key={item.slug}
                href={`/family-cookbook/collections/${item.slug}`}
                className="rounded-full border border-[#9A622A]/40 bg-white px-5 py-3 font-semibold text-[#123C39] transition hover:border-[#123C39] hover:bg-[#EED8B2]"
              >
                {item.title}
              </Link>
            ))}
          </div>
          <div className="mt-9 text-center">
            <Link
              href="/family-cookbook"
              className="inline-flex rounded-full bg-[#123C39] px-7 py-4 font-semibold text-white transition hover:bg-[#08231F]"
            >
              Browse every recipe
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
