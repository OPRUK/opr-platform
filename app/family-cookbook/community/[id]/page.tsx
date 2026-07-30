"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "../../../components/Navigation";
import Footer from "../../../components/Footer";
import RecipeActions from "../../../components/RecipeActions";
import { supabase } from "../../../../lib/supabase/client";

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

export default function CommunityRecipePage() {
  const params = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<CommunityRecipe | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadRecipe() {
      const { data } = await supabase
        .from("recipe_submissions")
        .select("id, title, name, location, category, servings, story, ingredients, method, photo_path")
        .eq("id", params.id)
        .eq("is_published", true)
        .maybeSingle();

      setRecipe(data as CommunityRecipe | null);
      setLoaded(true);
    }

    void loadRecipe();
  }, [params.id]);

  const imageUrl = recipe?.photo_path
    ? supabase.storage.from("recipe-photos").getPublicUrl(recipe.photo_path).data.publicUrl
    : null;

  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#4A4232]">
      <Navigation />
      {!loaded ? <div className="min-h-screen" /> : null}
      {loaded && !recipe ? (
        <section className="flex min-h-screen items-center justify-center px-6 text-center">
          <div>
            <h1 className="text-4xl font-bold">This page is not available.</h1>
            <Link href="/family-cookbook" className="mt-8 inline-block rounded-full bg-[#4A4232] px-6 py-3 text-white">Return to the Cookbook</Link>
          </div>
        </section>
      ) : null}
      {recipe ? (
        <>
          <section className="bg-[#4A4232] px-6 pb-20 pt-40 text-center text-white">
            <p className="text-sm uppercase tracking-[0.4em] text-amber-300">A page from the community cookbook</p>
            <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">{recipe.title}</h1>
            <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-300">Shared by {recipe.name}{recipe.location ? ` · ${recipe.location}` : ""}</p>
          </section>
          <section className="mx-auto grid max-w-6xl gap-14 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:px-8">
            <article className="rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#6E4B2C]/15 md:p-12">
              <p className="text-sm uppercase tracking-[0.35em] text-amber-700">The story</p>
              <p className="mt-7 text-2xl leading-relaxed">“{recipe.story}”</p>
              <p className="mt-10 border-t border-[#D1AD75] pt-6 text-sm italic text-stone-600">Shared with the Other People&apos;s Recipes community.</p>
            </article>
            <aside className="rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#6E4B2C]/15 md:p-12">
              {imageUrl ? <img src={imageUrl} alt={recipe.title} className="mb-8 aspect-[4/3] w-full rounded-2xl object-cover" /> : null}
              <p className="text-sm uppercase tracking-[0.25em] text-amber-700">{recipe.category}</p>
              {recipe.servings ? <p className="mt-2 text-sm text-stone-600">Serves {recipe.servings}</p> : null}
              <h2 className="mt-6 text-3xl font-bold">What you&apos;ll need</h2>
              <ul className="mt-7 space-y-4 leading-7 text-stone-700">
                {recipe.ingredients.split("\n").filter(Boolean).map((ingredient) => <li key={ingredient} className="border-b border-[#E7CEA2] pb-4">{ingredient}</li>)}
              </ul>
            </aside>
          </section>
          <section className="bg-[#FFF3DF] px-6 py-20">
            <div className="mx-auto max-w-4xl">
              <p className="text-sm uppercase tracking-[0.35em] text-amber-700">The method</p>
              <ol className="mt-9 space-y-7">
                {recipe.method.split("\n").filter(Boolean).map((step, index) => <li key={step} className="flex gap-6 text-lg leading-8 text-stone-700"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4A4232] text-sm font-bold text-white">{index + 1}</span>{step}</li>)}
              </ol>
            </div>
          </section>
          <RecipeActions title={recipe.title} />
        </>
      ) : null}
      <Footer />
    </main>
  );
}
