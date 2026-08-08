import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackButton, Divider, Eyebrow, SecondaryButton, Tag } from "../../_components/primitives";
import { getMobileRecipe } from "../../../../lib/mobile-recipes";

function CheckmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#123C39" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-[3px] flex-shrink-0">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getMobileRecipe(id);
  return recipe ? { title: recipe.title } : {};
}

export default async function RecipeDetailScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getMobileRecipe(id);

  if (!recipe) notFound();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto pb-6">
      <div className="relative">
        <div className="h-[260px] w-full bg-[#EAD8AE]">
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- may be a Supabase Storage URL, not a configured Image domain
            <img src={recipe.image} alt={recipe.title} className="h-[260px] w-full object-cover" />
          ) : null}
        </div>
        <div className="absolute left-4 top-14">
          <BackButton href="/app/cookbook" />
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="mb-2.5 flex items-center gap-2">
          <Tag>{recipe.category}</Tag>
          <span className="text-xs uppercase tracking-[0.1em] text-[#123C39]/80">{recipe.place}</span>
        </div>
        <h1 className="mb-4 text-[30px]">{recipe.title}</h1>
        <Divider />

        <Eyebrow className="mb-2.5 mt-5">The story</Eyebrow>
        <p className="text-[16px] italic leading-[1.6]">&ldquo;{recipe.story}&rdquo;</p>

        {recipe.ingredients.length > 0 ? (
          <>
            <Divider className="mt-5" />
            <Eyebrow className="mb-2.5 mt-5">What you&apos;ll need</Eyebrow>
            <div className="flex flex-col">
              {recipe.ingredients.map((ingredient) => (
                <div key={ingredient} className="flex gap-2.5 border-b border-[#123C39]/35 py-2.5 text-[15px]">
                  <CheckmarkIcon />
                  {ingredient}
                </div>
              ))}
            </div>
          </>
        ) : null}

        {recipe.method.length > 0 ? (
          <>
            <Eyebrow className="mb-2.5 mt-5">The method</Eyebrow>
            <div className="flex flex-col gap-3.5">
              {recipe.method.map((step, index) => (
                <div key={step} className="flex gap-3 text-[15px] leading-[1.6]">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center bg-[#123C39] text-xs font-bold text-[#EED8B2]">
                    {index + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </>
        ) : null}

        <div className="mt-6">
          <SecondaryButton href={`/app/cookbook/${recipe.id}/cooks`}>
            <span className="flex-1 text-left">See families who made this</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
