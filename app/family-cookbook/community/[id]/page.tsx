import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navigation from "../../../components/Navigation";
import RecipeActions from "../../../components/RecipeActions";
import CommunityCookForm from "../../../components/CommunityCookForm";
import FamiliesWhoMadeThis from "../../../components/FamiliesWhoMadeThis";
import { supabase } from "../../../../lib/supabase/client";
import { getApprovedCommunityCooks } from "../../../../lib/community-cooks";
import { SITE_NAME, absoluteUrl } from "../../../../lib/site";

export const dynamic = "force-dynamic";

type CommunityRecipe = {
  id: number;
  title: string;
  name: string;
  location: string | null;
  category: string;
  servings: string | null;
  story: string;
  ingredients: string | null;
  method: string | null;
  cook_notes: string | null;
  photo_path: string | null;
  contributor_photo_path: string | null;
  original_recipe_path: string | null;
  audio_story_path: string | null;
  recipe_video_path: string | null;
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
    .select("id, title, name, location, category, servings, story, ingredients, method, cook_notes, photo_path, contributor_photo_path, original_recipe_path, audio_story_path, recipe_video_path")
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
    return "/images/recipes/sudeshs-bhindi-wide.webp";
  }
  return null;
}

function originalRecipeImageUrlFor(recipe: CommunityRecipe): string | null {
  return recipe.original_recipe_path
    ? supabase.storage.from("recipe-photos").getPublicUrl(recipe.original_recipe_path).data.publicUrl
    : null;
}

function contributorPhotoUrlFor(recipe: CommunityRecipe): string | null {
  return recipe.contributor_photo_path
    ? supabase.storage.from("recipe-photos").getPublicUrl(recipe.contributor_photo_path).data.publicUrl
    : null;
}

function audioStoryUrlFor(recipe: CommunityRecipe): string | null {
  return recipe.audio_story_path
    ? supabase.storage.from("recipe-photos").getPublicUrl(recipe.audio_story_path).data.publicUrl
    : null;
}

function recipeVideoUrlFor(recipe: CommunityRecipe): string | null {
  return recipe.recipe_video_path
    ? supabase.storage.from("recipe-photos").getPublicUrl(recipe.recipe_video_path).data.publicUrl
    : null;
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
    notFound();
  }

  const imageUrl = imageUrlFor(recipe);
  const communityCooks = await getApprovedCommunityCooks({ recipeId: recipe.id });
  const contributorPhotoUrl = contributorPhotoUrlFor(recipe);
  const originalRecipeImageUrl = originalRecipeImageUrlFor(recipe);
  const audioStoryUrl = audioStoryUrlFor(recipe);
  const recipeVideoUrl = recipeVideoUrlFor(recipe);
  const ingredients = recipe.ingredients ? recipe.ingredients.split("\n").filter(Boolean) : [];
  const method = recipe.method ? recipe.method.split("\n").filter(Boolean) : [];

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "@id": `${absoluteUrl(`/family-cookbook/community/${recipe.id}`)}#recipe`,
    name: recipe.title,
    url: absoluteUrl(`/family-cookbook/community/${recipe.id}`),
    mainEntityOfPage: absoluteUrl(`/family-cookbook/community/${recipe.id}`),
    inLanguage: "en-GB",
    ...(imageUrl ? { image: [imageUrl] } : {}),
    description: truncate(recipe.story, 300),
    author: { "@type": "Person", name: recipe.name || SITE_NAME },
    ...(recipe.category ? { recipeCategory: recipe.category } : {}),
    ...(recipe.servings ? { recipeYield: recipe.servings } : {}),
    recipeIngredient: ingredients,
    recipeInstructions: method.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: truncate(step, 60),
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
        <p className="text-sm uppercase tracking-[0.4em] text-amber-300">A page from the community cookbook</p>
        <h1 className="font-display mx-auto mt-5 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">{recipe.title}</h1>
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-300">Shared by {recipe.name}{recipe.location ? ` · ${recipe.location}` : ""}</p>
      </section>
      <section className="mx-auto grid max-w-6xl gap-14 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <article className="rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">The story</p>
          <p className="mt-7 text-2xl leading-relaxed">“{recipe.story}”</p>
          {contributorPhotoUrl ? (
            <div className="mt-10 flex items-center gap-4 border-t border-[#D1AD75] pt-6">
              <img
                src={contributorPhotoUrl}
                alt={`${recipe.name}, who shared ${recipe.title}`}
                className="h-16 w-16 rounded-full object-cover shadow-md"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Meet the cook</p>
                <p className="mt-1 text-lg font-bold text-[#123C39]">{recipe.name}</p>
                {recipe.location ? <p className="text-sm text-stone-600">{recipe.location}</p> : null}
              </div>
            </div>
          ) : null}
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
      {audioStoryUrl ? (
        <section className="bg-[#123C39] px-6 py-16 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Hear the story</p>
            <h2 className="mt-5 text-4xl font-bold">In their own words.</h2>
            <p className="mx-auto mt-5 max-w-2xl leading-7 text-stone-200">
              Press play to hear the memory behind this recipe.
            </p>
            <audio controls preload="metadata" src={audioStoryUrl} className="mx-auto mt-8 w-full max-w-2xl" />
          </div>
        </section>
      ) : null}
      {recipeVideoUrl ? (
        <section className="bg-[#F4DDAE]/60 px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Watch it come to life</p>
            <h2 className="mt-5 text-4xl font-bold">Made in their kitchen.</h2>
            <p className="mx-auto mt-5 max-w-2xl leading-7 text-stone-700">A short film shared by the cook behind this recipe.</p>
            <video controls playsInline preload="metadata" src={recipeVideoUrl} className="mx-auto mt-8 aspect-video w-full max-w-3xl rounded-3xl bg-black shadow-xl shadow-[#1C5A50]/15" />
          </div>
        </section>
      ) : null}
      {originalRecipeImageUrl ? (
        <section className="bg-[#F4DDAE]/60 px-6 py-20">
          <div className="mx-auto grid max-w-5xl items-center gap-10 rounded-3xl bg-[#FFF3DF] p-7 shadow-xl shadow-[#1C5A50]/10 md:grid-cols-[0.85fr_1.15fr] md:p-10">
            <img
              src={originalRecipeImageUrl}
              alt={`The original handwritten recipe for ${recipe.title}`}
              className="max-h-[36rem] w-full rounded-2xl object-contain shadow-lg"
            />
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-amber-700">The original</p>
              <h2 className="mt-5 text-4xl font-bold">The recipe as it was first written.</h2>
              <p className="mt-6 text-lg leading-8 text-stone-700">
                The handwritten notes, stains and shortcuts are part of the story too.
              </p>
            </div>
          </div>
        </section>
      ) : null}
      <section className="bg-[#FFF3DF] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">The method</p>
          <ol className="mt-9 space-y-7">
            {method.map((step, index) => <li key={step} className="flex gap-6 text-lg leading-8 text-stone-700"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#123C39] text-sm font-bold text-white">{index + 1}</span>{step}</li>)}
          </ol>
        </div>
      </section>
      {recipe.cook_notes ? (
        <section className="bg-[#EED8B2] px-6 py-20">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#D1AD75] bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/10 md:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#9A622A]">Cook&apos;s notes &amp; swaps</p>
            <h2 className="mt-4 text-4xl font-bold text-[#123C39]">A little help from the OPR kitchen</h2>
            <p className="mt-6 whitespace-pre-wrap text-lg leading-8 text-stone-700">{recipe.cook_notes}</p>
          </div>
        </section>
      ) : null}
      <FamiliesWhoMadeThis cooks={communityCooks} recipeTitle={recipe.title} />
      <CommunityCookForm recipeId={recipe.id} recipeTitle={recipe.title} />
      <RecipeActions title={recipe.title} imageUrl={imageUrl} />
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
