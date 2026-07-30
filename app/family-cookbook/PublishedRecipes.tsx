"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";

type PublishedRecipe = {
  id: number;
  title: string;
  name: string;
  location: string | null;
  story: string;
  photo_path: string | null;
};

export default function PublishedRecipes() {
  const [recipes, setRecipes] = useState<PublishedRecipe[]>([]);

  useEffect(() => {
    async function loadPublishedRecipes() {
      const { data } = await supabase
        .from("recipe_submissions")
        .select("id, title, name, location, story, photo_path")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      setRecipes((data ?? []) as PublishedRecipe[]);
    }

    void loadPublishedRecipes();
  }, []);

  if (recipes.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 border-t border-[#D1AD75]/70 pt-16">
      <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Newly shared</p>
      <h2 className="mt-4 text-4xl font-bold md:text-5xl">Fresh pages from the community</h2>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {recipes.map((recipe) => {
          const imageUrl = recipe.photo_path
            ? supabase.storage.from("recipe-photos").getPublicUrl(recipe.photo_path).data.publicUrl
            : null;

          return (
            <Link
              key={recipe.id}
              href={`/family-cookbook/community/${recipe.id}`}
              className="group overflow-hidden rounded-3xl bg-[#FFF3DF] shadow-lg shadow-[#6E4B2C]/15 transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={recipe.title}
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-[#DDBB82] px-8 text-center text-xl font-bold text-[#4A4232]">
                  A treasured family recipe
                </div>
              )}
              <div className="flex min-h-72 flex-col p-8">
                <p className="text-sm uppercase tracking-[0.16em] text-stone-500">
                  Shared by {recipe.name}{recipe.location ? ` · ${recipe.location}` : ""}
                </p>
                <h3 className="mt-5 text-3xl font-bold leading-tight">{recipe.title}</h3>
                <p className="mt-5 grow leading-7 text-stone-700">“{recipe.story}”</p>
                <span className="mt-8 font-medium transition group-hover:text-amber-700">Open recipe →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
