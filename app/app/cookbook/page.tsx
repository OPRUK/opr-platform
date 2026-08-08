import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow, Tag } from "../_components/primitives";
import MobileTabBar from "../_components/MobileTabBar";
import { getAllMobileRecipes } from "../../../lib/mobile-recipes";

export const metadata: Metadata = { title: "The Family Cookbook" };

export default async function CookbookScreen() {
  const recipes = await getAllMobileRecipes();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b-2 border-[#4A2E45]/35 px-5 pb-4 pt-16">
        <Eyebrow className="mb-2">A living cookbook</Eyebrow>
        <h1 className="text-[30px]">The Family Cookbook</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {recipes.length === 0 ? (
          <p className="py-10 text-center text-sm opacity-80">
            No recipes are published yet — check back soon.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/app/cookbook/${recipe.id}`}
                className="flex gap-3.5 border-b-2 border-[#4A2E45]/35 pb-4"
              >
                <div className="h-24 w-24 flex-shrink-0 bg-[#F5E6C4]">
                  {recipe.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- may be a Supabase Storage URL, not a configured Image domain
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="h-24 w-24 object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Tag>{recipe.category}</Tag>
                    <span className="text-xs text-[#4A2E45]/80">{recipe.place}</span>
                  </div>
                  <div className="text-[19px] font-bold leading-tight">{recipe.title}</div>
                  <div className="line-clamp-2 text-sm opacity-80">{recipe.story}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <MobileTabBar />
    </div>
  );
}
