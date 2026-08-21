import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navigation from "../../../components/Navigation";
import IngredientMeasurements from "../../../components/IngredientMeasurements";
import RecipeActions from "../../../components/RecipeActions";
import RecipeFaqs from "../../../components/RecipeFaqs";
import RecipeVisualGuide from "../../../components/RecipeVisualGuide";
import CommunityCookForm from "../../../components/CommunityCookForm";
import FamiliesWhoMadeThis from "../../../components/FamiliesWhoMadeThis";
import { fallbackImageForCommunityRecipe } from "../../../../lib/community-recipe-image";
import { supabase } from "../../../../lib/supabase/client";
import { getApprovedCommunityCooks } from "../../../../lib/community-cooks";
import { communityRecipeMethodPhotos } from "../../../../lib/community-recipe-visuals";
import { buildFaqPageJsonLd, communityRecipeFaqs } from "../../../../lib/recipe-faqs";
import { SITE_NAME, absoluteUrl } from "../../../../lib/site";

export const dynamic = "force-dynamic";

type CommunityRecipe = {
  id: number;
  title: string;
  name: string;
  location: string | null;
  category: string;
  servings: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
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

function splitRecipeLines(value: string | null): string[] {
  return value
    ? value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [];
}

async function getCommunityRecipe(id: string): Promise<CommunityRecipe | null> {
  const { data } = await supabase
    .from("recipe_submissions")
    .select("id, title, name, location, category, servings, prep_time_minutes, cook_time_minutes, story, ingredients, method, cook_notes, photo_path, contributor_photo_path, original_recipe_path, audio_story_path, recipe_video_path")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  return (data as CommunityRecipe | null) ?? null;
}

function imageUrlFor(recipe: CommunityRecipe): string | null {
  if (recipe.photo_path) {
    return supabase.storage.from("recipe-published").getPublicUrl(recipe.photo_path).data.publicUrl;
  }
  return fallbackImageForCommunityRecipe(recipe.title);
}

function originalRecipeImageUrlFor(recipe: CommunityRecipe): string | null {
  return recipe.original_recipe_path
    ? supabase.storage.from("recipe-published").getPublicUrl(recipe.original_recipe_path).data.publicUrl
    : null;
}

function contributorPhotoUrlFor(recipe: CommunityRecipe): string | null {
  return recipe.contributor_photo_path
    ? supabase.storage.from("recipe-published").getPublicUrl(recipe.contributor_photo_path).data.publicUrl
    : null;
}

function audioStoryUrlFor(recipe: CommunityRecipe): string | null {
  return recipe.audio_story_path
    ? supabase.storage.from("recipe-published").getPublicUrl(recipe.audio_story_path).data.publicUrl
    : null;
}

function recipeVideoUrlFor(recipe: CommunityRecipe): string | null {
  return recipe.recipe_video_path
    ? supabase.storage.from("recipe-published").getPublicUrl(recipe.recipe_video_path).data.publicUrl
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
  const ingredients = splitRecipeLines(recipe.ingredients);
  const method = splitRecipeLines(recipe.method);
  const methodPhotos = communityRecipeMethodPhotos[recipe.id] ?? [];
  const faqs = communityRecipeFaqs[recipe.id] ?? [];

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
    ...(recipe.prep_time_minutes ? { prepTime: `PT${recipe.prep_time_minutes}M` } : {}),
    ...(recipe.cook_time_minutes ? { cookTime: `PT${recipe.cook_time_minutes}M` } : {}),
    recipeIngredient: ingredients,
    recipeInstructions: method.map((step, index) => {
      const methodPhoto = methodPhotos.find((photo) => photo.step === index + 1);

      return {
        "@type": "HowToStep",
        position: index + 1,
        name: truncate(step, 60),
        text: step,
        ...(methodPhoto ? { image: absoluteUrl(methodPhoto.src) } : {}),
      };
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Living Cookbook", item: absoluteUrl("/family-cookbook") },
      { "@type": "ListItem", position: 2, name: recipe.title, item: absoluteUrl(`/family-cookbook/community/${recipe.id}`) },
    ],
  };

  const faqJsonLd = faqs.length ? buildFaqPageJsonLd(faqs) : null;

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
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <Navigation />
      <section className="bg-[#123C39] px-6 pb-12 pt-32 text-center text-white">
        <p className="text-sm uppercase tracking-[0.4em] text-amber-300">A page from the Living Cookbook</p>
        <h1 className="font-display mx-auto mt-3 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">{recipe.title}</h1>
        <p className="mt-4 text-sm uppercase tracking-[0.25em] text-stone-300">Shared by {recipe.name}{recipe.location ? ` · ${recipe.location}` : ""}</p>
      </section>
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 md:px-8 md:py-10">
        <article className="rounded-3xl bg-[#FFF3DF] p-6 shadow-xl shadow-[#1C5A50]/15 md:p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">The story</p>
          <p className="mt-5 max-w-5xl text-xl leading-9 md:text-2xl md:leading-relaxed">“{recipe.story}”</p>
          {contributorPhotoUrl ? (
            <div className="mt-10 flex items-center gap-4 border-t border-[#DDB765] pt-6">
              <Image
                src={contributorPhotoUrl}
                alt={`${recipe.name}, who shared ${recipe.title}`}
                width={64}
                height={64}
                unoptimized
                className="h-16 w-16 rounded-full object-cover shadow-md"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Meet the cook</p>
                <p className="mt-1 text-lg font-bold text-[#123C39]">{recipe.name}</p>
                {recipe.location ? <p className="text-sm text-stone-600">{recipe.location}</p> : null}
              </div>
            </div>
          ) : null}
          <p className="mt-7 border-t border-[#DDB765] pt-5 text-sm italic text-stone-600">Shared with the Other People&apos;s Recipes community.</p>
        </article>
        <aside className="recipe-card-paper w-full p-5 sm:p-7 md:p-9">
          <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-start md:gap-3">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={recipe.title}
                width={1200}
                height={675}
                unoptimized
                className="aspect-video min-w-0 flex-1 rounded-2xl object-cover shadow-md"
              />
            ) : (
              <div className="min-w-0 flex-1 rounded-2xl border border-[#9A622A]/30 bg-[#FFF3DF]/45 px-5 py-6 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9A622A]">From the family table</p>
                <p className="mt-2 text-lg font-bold text-[#123C39]">A treasured family recipe</p>
              </div>
            )}
            <RecipeActions title={recipe.title} imageUrl={imageUrl} layout="responsive" />
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-[#5F4B38]">
            <span className="rounded-full border border-[#9A622A]/30 bg-[#FFF3DF]/45 px-4 py-2 font-bold uppercase tracking-[0.18em] text-[#9A622A]">{recipe.category}</span>
            {recipe.servings ? <span className="rounded-full border border-[#9A622A]/25 bg-[#FFF3DF]/35 px-4 py-2">Serves {recipe.servings}</span> : null}
            {recipe.prep_time_minutes || recipe.cook_time_minutes ? (
              <span className="rounded-full border border-[#9A622A]/25 bg-[#FFF3DF]/35 px-4 py-2">
                {recipe.prep_time_minutes ? `Prep ${recipe.prep_time_minutes} min` : null}
                {recipe.prep_time_minutes && recipe.cook_time_minutes ? " · " : null}
                {recipe.cook_time_minutes ? `Cook ${recipe.cook_time_minutes} min` : null}
              </span>
            ) : null}
          </div>
          <div className="mt-7">
            <IngredientMeasurements ingredients={ingredients} size="regular" />
          </div>
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
            <audio aria-label={`Audio story for ${recipe.title}`} controls preload="metadata" src={audioStoryUrl} className="mx-auto mt-8 w-full max-w-2xl" />
          </div>
        </section>
      ) : null}
      {recipeVideoUrl ? (
        <section className="bg-[#EED8B2]/60 px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Watch it come to life</p>
            <h2 className="mt-5 text-4xl font-bold">Made in their kitchen.</h2>
            <p className="mx-auto mt-5 max-w-2xl leading-7 text-stone-700">A short film shared by the cook behind this recipe.</p>
            <video aria-label={`Cooking video for ${recipe.title}`} controls playsInline preload="metadata" src={recipeVideoUrl} className="mx-auto mt-8 aspect-video w-full max-w-3xl rounded-3xl bg-black shadow-xl shadow-[#1C5A50]/15" />
          </div>
        </section>
      ) : null}
      {originalRecipeImageUrl ? (
        <section className="bg-[#EED8B2]/60 px-6 py-20">
          <div className="mx-auto grid max-w-5xl items-center gap-10 rounded-3xl bg-[#FFF3DF] p-7 shadow-xl shadow-[#1C5A50]/10 md:grid-cols-[0.85fr_1.15fr] md:p-10">
            <Image
              src={originalRecipeImageUrl}
              alt={`The original handwritten recipe for ${recipe.title}`}
              width={1200}
              height={1600}
              unoptimized
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
      <section className="bg-[#FFF3DF] px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">The method</p>
          <ol className="mt-7 space-y-4">
            {method.map((step, index) => (
              <li key={`${index}-${step}`} className="grid grid-cols-[2.25rem_1fr] gap-4 rounded-2xl border border-[#DDB765] bg-white/55 p-4 text-base leading-7 text-stone-700 md:p-5 md:text-lg md:leading-8">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#123C39] text-sm font-bold text-white">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <RecipeVisualGuide photos={methodPhotos} />
      {recipe.cook_notes ? (
        <section className="bg-[#EED8B2] px-6 py-10 md:py-12">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#DDB765] bg-[#FFF3DF] p-6 shadow-xl shadow-[#1C5A50]/10 md:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#9A622A]">Cook&apos;s notes &amp; swaps</p>
            <h2 className="mt-3 text-4xl font-bold text-[#123C39]">A little help from the OPR kitchen</h2>
            <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-stone-700">{recipe.cook_notes}</p>
          </div>
        </section>
      ) : null}
      <FamiliesWhoMadeThis cooks={communityCooks} recipeTitle={recipe.title} />
      <CommunityCookForm recipeId={recipe.id} recipeTitle={recipe.title} />
      <RecipeFaqs recipeTitle={recipe.title} faqs={faqs} />
      <section className="px-6 py-10 text-center md:py-12">
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
