import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackButton, Eyebrow } from "../../../_components/primitives";
import { getMobileRecipe } from "../../../../../lib/mobile-recipes";
import { getApprovedCommunityCooks } from "../../../../../lib/community-cooks";
import AddCookForm from "./AddCookForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getMobileRecipe(id);
  return recipe ? { title: `Families who made ${recipe.title}` } : {};
}

export default async function CommunityCooksScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipeSlug = id.startsWith("featured-") ? id.slice("featured-".length) : undefined;
  const recipeId = id.startsWith("community-") ? Number(id.slice("community-".length)) : undefined;

  const [recipe, cooks] = await Promise.all([
    getMobileRecipe(id),
    getApprovedCommunityCooks({ recipeId, recipeSlug }),
  ]);

  if (!recipe) notFound();

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto px-5 pb-8 pt-16">
      <div className="absolute left-4 top-5">
        <BackButton href={`/app/cookbook/${id}`} />
      </div>

      <Eyebrow className="mb-2">{recipe.title}</Eyebrow>
      <h1 className="mb-5 text-[27px]">Families who made this</h1>

      {cooks.length > 0 ? (
        <div className="flex flex-col">
          {cooks.map((cook) => (
            <div key={cook.id} className="flex gap-3 border-b-2 border-[#123C39]/35 py-4">
              {cook.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, not a configured Image domain
                <img src={cook.photoUrl} alt={cook.name} className="h-[52px] w-[52px] flex-shrink-0 object-cover" />
              ) : (
                <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center bg-[#F5E6C4] text-base font-bold text-[#123C39]">
                  {cook.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="mb-1 text-[15px] font-bold">{cook.name}</div>
                {cook.note ? <p className="m-0 text-sm leading-[1.55] opacity-85">{cook.note}</p> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="border-b-2 border-[#123C39]/35 py-4 text-sm opacity-70">
          No families have shared a photo or note yet — be the first.
        </p>
      )}

      <AddCookForm recipeSlug={recipeSlug ?? null} recipeTitle={recipe.title} recipeId={recipeId ?? null} />
    </div>
  );
}
