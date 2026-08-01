import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "../../../components/Navigation";
import Footer from "../../../components/Footer";
import RecipeActions from "../../../components/RecipeActions";
import { supabase } from "../../../../lib/supabase/client";
import { SITE_NAME, absoluteUrl } from "../../../../lib/site";

type CommunityRecipe = {
  id: number;
  title: string;
  name: string;
  location: string | null;
  category: string;
  servings: string | null;
  story: string;
  ingredients: string;
  method: string;
  photo_path: string | null;
};

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : clipped.length)}…`;
}

async function getCommunityRecipe(id: string): Promise<CommunityRecipe | null> {
  const { data } = await supabase
    .from("recipe_submissions")
    .select("id, title, name, location, category, servings, story, ingredients, method, photo_path")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  return (data as CommunityRecipe | null) ?? null;
}

function imageUrlFor(recipe: CommunityRecipe): string | null {
  if (recipe.photo_path) {
    return supabase.storage.from("recipe-photos").getPublicUrl(recipe.photo_path).data.publicUrl;
  }
  if (recipe.title.toLowerCase().includes("sudesh") && recipe.title.toLowerCase().includes("bhindi")) {
    return "/images/recipes/sudeshs-bhindi.png";
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getCommunityRecipe(id);
  if (!recipe) return {};

  const title = recipe.location ? `${recipe.title} — ${recipe.location}` : recipe.title;
  const description = truncate(recipe.story, 155);
  const url = `/family-cookbook/community/${recipe.id}`;
  const image = imageUrlFor(recipe);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: image ? [{ url: image, width: 1200, height: 900, alt: recipe.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function CommunityRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getCommunityRecipe(id);

  if (!recipe) {
    return (
      <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
        <Navigation />
        <section className="flex min-h-screen items-center justify-center px-6 text-center">
          <div>
            <h1 className="text-4xl font-bold">This page is not available.</h1>
            <Link href="/family-cookbook" className="mt-8 inline-block rounded-full bg-[#123C39] px-6 py-3 text-white">Return to the Cookbook</Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const imageUrl = imageUrlFor(recipe);
  const ingredients = recipe.ingredients.split("\n").filter(Boolean);
  const method = recipe.method.split("\n").filter(Boolean);

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    ...(imageUrl ? { image: [imageUrl] } : {}),
    description: truncate(recipe.story, 300),
    author: { "@type": "Person", name: recipe.name || SITE_NAME },
    ...(recipe.category ? { recipeCategory: recipe.category } : {}),
    ...(recipe.servings ? { recipeYield: recipe.servings } : {}),
    recipeIngredient: ingredients,
    recipeInstructions: method.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Family Cookbook", item: absoluteUrl("/family-cookbook") },
      { "@type": "ListItem", position: 2, name: recipe.title, item: absoluteUrl(`/family-cookbook/community/${recipe.id}`) },
    ],
  };

  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navigation />
      <section className="bg-[#123C39] px-6 pb-20 pt-40 text-center text-white">
        <p className="text-sm uppercase tracking-[0.4em] text-amber-300">A page from the community cookbook</p>
        <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">{recipe.title}</h1>
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-300">Shared by {recipe.name}{recipe.location ? ` · ${recipe.location}` : ""}</p>
      </section>
      <section className="mx-auto grid max-w-6xl gap-14 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <article className="rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">The story</p>
          <p className="mt-7 text-2xl leading-relaxed">“{recipe.story}”</p>
          <p className="mt-10 border-t border-[#D1AD75] pt-6 text-sm italic text-stone-600">Shared with the Other People&apos;s Recipes community.</p>
        </article>
        <aside className="rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          {imageUrl ? <img src={imageUrl} alt={recipe.title} className="mb-8 aspect-[4/3] w-full rounded-2xl object-cover" /> : null}
          <p className="text-sm uppercase tracking-[0.25em] text-amber-700">{recipe.category}</p>
          {recipe.servings ? <p className="mt-2 text-sm text-stone-600">Serves {recipe.servings}</p> : null}
          <h2 className="mt-6 text-3xl font-bold">What you&apos;ll need</h2>
          <ul className="mt-7 space-y-4 leading-7 text-stone-700">
            {ingredients.map((ingredient) => <li key={ingredient} className="border-b border-[#E7CEA2] pb-4">{ingredient}</li>)}
          </ul>
        </aside>
      </section>
      <section className="bg-[#FFF3DF] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">The method</p>
          <ol className="mt-9 space-y-7">
            {method.map((step, index) => <li key={step} className="flex gap-6 text-lg leading-8 text-stone-700"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#123C39] text-sm font-bold text-white">{index + 1}</span>{step}</li>)}
          </ol>
        </div>
      </section>
      <RecipeActions title={recipe.title} imageUrl={imageUrl} />
      <section className="px-6 py-20 text-center">
        <Link
          href="/family-cookbook"
          className="inline-block rounded-full bg-[#123C39] px-8 py-4 text-lg font-medium text-white transition hover:scale-105"
        >
          Return to the Cookbook
        </Link>
      </section>
      <Footer />
    </main>
  );
}
