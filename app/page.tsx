import type { Metadata } from "next";
import { Suspense } from "react";
import Navigation from "./components/Navigation";
import Image from "next/image";
import Link from "next/link";
import HomeHero from "./components/HomeHero";
import { optimizedPoster } from "../lib/optimized-poster";
import { supabase } from "../lib/supabase/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Other People's Recipes — A Living Cookbook of Family Recipes",
  },
  description:
    "Handwritten, handed-down and half-remembered family recipes from across the world, preserved with the stories behind them.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Other People's Recipes — A Living Cookbook of Family Recipes",
    description:
      "Handwritten, handed-down and half-remembered family recipes from across the world, preserved with the stories behind them.",
    url: "/",
  },
};

type RecipeOfWeek = {
  id: number;
  title: string;
  name: string;
  location: string | null;
  story: string;
  photo_path: string | null;
  recipe_of_week_note: string | null;
};

async function getRecipeOfWeek(): Promise<RecipeOfWeek | null> {
  const { data } = await supabase
    .from("recipe_submissions")
    .select("id, title, name, location, story, photo_path, recipe_of_week_note")
    .eq("is_published", true)
    .eq("is_recipe_of_week", true)
    .maybeSingle();

  return (data as RecipeOfWeek | null) ?? null;
}

export default async function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      {/* The hero's first video poster is the LCP element, but HomeHero is a
          client component — without this hint the browser only discovers the
          poster after JS hydrates, well after the preload scanner has moved
          on. Rendered directly (rather than via react-dom's preload() call)
          because the imperative API stopped flushing once a Suspense
          boundary was introduced below — a literal <link> is hoisted to
          <head> by React regardless of where it sits in the tree, so it
          isn't affected by the streaming boundary. Must match the exact URL
          HomeHero requests or this preload goes to waste. */}
      <link
        rel="preload"
        href={optimizedPoster("/images/opr-add-your-recipe-promo-poster.jpg")}
        as="image"
        fetchPriority="high"
      />
      <Navigation />

      {/* Hero */}
      <HomeHero>
        <div className="relative z-10 mx-auto max-w-4xl px-6 pb-24 text-center text-white animate-rise-in sm:px-8 sm:pb-28">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-[#DDB765] drop-shadow-md sm:text-sm sm:tracking-[0.4em]">
            A Living Cookbook
          </p>

          <h1 className="font-brand mx-auto max-w-3xl text-5xl font-semibold leading-[0.92] tracking-[-0.02em] drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl">
            Other People&apos;s <span className="block">Recipes</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-200 sm:text-xl sm:leading-9">
            Every Recipe has a Story.
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-stone-100 sm:text-lg sm:leading-8">
            Other People&apos;s Recipes is a living cookbook preserving the
            recipes families return to, and the people, memories and traditions
            behind them.
          </p>

          <div className="mt-9 flex justify-center">
            <Link
              href="/family-cookbook"
              className="rounded-full bg-[#123C39] px-8 py-3.5 text-base font-medium transition hover:scale-105 sm:px-10 sm:py-4 sm:text-lg"
            >
              Open the Living Cookbook
            </Link>
          </div>
        </div>
      </HomeHero>

      <section className="bg-[#EED8B2] px-6 py-10 md:py-14">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border-2 border-[#DDB765] bg-[#123C39] shadow-2xl shadow-[#08231F]/25">
          <div className="grid items-stretch md:grid-cols-[0.7fr_1.7fr]">
            <div className="flex min-h-[200px] flex-col justify-between bg-[#DDB765] p-8 text-[#123C39] md:min-h-full md:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em]">OPR invitation</p>
              <div>
                <p className="font-brand text-7xl font-semibold leading-none md:text-8xl">August</p>
                <p className="mt-2 text-sm font-bold uppercase tracking-[0.22em]">2026</p>
              </div>
              <p className="max-w-[13rem] text-sm leading-6">
                A month for the meals that make a family feel at home.
              </p>
            </div>

            <div className="relative px-8 py-11 text-[#FFF3DF] md:px-14 md:py-14">
              <p className="text-sm font-bold uppercase tracking-[0.38em] text-[#DDB765]">
                The Recipe That Feels Like Home
              </p>
              <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
                Every family has that one recipe. What&apos;s yours?
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#FFF3DF] md:text-xl">
                Throughout August, we&apos;re looking for the recipes your family
                asks for again and again. Share the recipe and the story behind
                it for a chance to be featured in the OPR Cookbook and
                shared with our growing community.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/share"
                  className="inline-flex w-fit rounded-full bg-[#DDB765] px-8 py-4 text-base font-bold text-[#08231F] transition hover:scale-105 hover:bg-[#DDB765]"
                >
                  Share your recipe →
                </Link>
                <p className="text-sm text-[#DDB765]">Your family story could be next.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#EED8B2] px-6 py-16 animate-rise-in-delayed md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-display mx-auto max-w-4xl text-4xl font-bold leading-tight text-[#123C39] md:text-6xl">
              Every family has a recipe worth remembering.
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-stone-700 md:text-xl md:leading-9">
              Other People&apos;s Recipes exists to preserve the meals, memories and
              traditions that make a house feel like home.
            </p>
          </div>

          <div className="mt-12 grid overflow-hidden rounded-[2rem] bg-[#FFF3DF] shadow-xl shadow-[#1C5A50]/15 md:grid-cols-[0.85fr_1.15fr]">
            <div className="flex flex-col justify-center bg-[#123C39] p-8 text-[#FFF3DF] md:p-12">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#DDB765]">
                Why we started
              </p>
              <h3 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
                Recipes are more than instructions.
              </h3>
            </div>
            <div className="space-y-6 p-8 text-lg leading-8 text-stone-700 md:p-12">
              <p>
                They are Sunday lunches, birthday cakes, handwritten notes and
                the people who taught us how to cook them.
              </p>
              <p>
                We are creating a living collection of family recipes and the
                stories behind them — shared with care, discovered by others,
                and one day celebrated around real restaurant tables.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-[#DDB765] bg-[#FFF3DF] px-7 py-10 text-center shadow-lg shadow-[#1C5A50]/10 md:px-12 md:py-12">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-700">
              The invitation
            </p>
            <h3 className="mx-auto mt-5 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
              What&apos;s the one recipe your family would never let disappear?
            </h3>
            <Link
              href="/share"
              className="mt-8 inline-block rounded-full bg-[#123C39] px-8 py-4 text-lg font-medium text-white transition hover:scale-105 hover:bg-[#08231F]"
            >
              Share your recipe
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#123C39] px-6 py-24 md:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] shadow-2xl md:min-h-[530px]">
            <Image
              src="/images/recipes/krishna-vantis-baingan-ka-bharta-wide.webp"
              alt="Krishna Anand's Baingan ka Bharta"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="text-[#FFF3DF]">
            <p className="text-sm uppercase tracking-[0.35em] text-[#DDB765]">
              From the kitchen drawer
            </p>
            <h2 className="mt-5 max-w-xl text-4xl font-bold leading-tight md:text-6xl">
              Krishna Anand&apos;s Baingan ka Bharta
            </h2>
            <div className="font-founder-hand mt-8 space-y-2 text-2xl leading-[1.35] text-[#EED8B2] md:text-3xl">
              <p>onions, cooked till pink</p>
              <p>tomatoes, salt &amp; deghi mirch</p>
              <p>2 slit green chillies</p>
              <p>fold in mashed bhuna baingan</p>
              <p className="pl-6">simmer till smoky &amp; rich</p>
            </div>
            <p className="font-founder-hand mt-7 text-2xl italic text-[#DDB765] md:text-3xl">
              Don&apos;t let it turn brown.
            </p>
            <Link
              href="/family-cookbook/krishna-anands-baingan-ka-bharta"
              className="mt-10 inline-flex w-fit items-center rounded-full bg-[#DDB765] px-8 py-4 text-lg font-bold text-[#123C39] shadow-lg transition hover:scale-105 hover:bg-[#EED8B2]"
            >
              Cook Krishna&apos;s recipe →
            </Link>
            <p className="mt-5 max-w-xl text-sm italic leading-6 text-[#DABF91]">
              A treasured family recipe, carried from Krishna&apos;s kitchen into yours.
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<RecipeOfWeekFallback />}>
        <RecipeOfWeekSection />
      </Suspense>

      <section
        id="cookbook"
        className="bg-[#123C39] px-6 py-24 animate-rise-in-delayed"
      >
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
            <Image
              src="/images/living-cookbook-feature.webp"
              alt="Vintage recipe book"
              width={1000}
              height={750}
              className="rounded-3xl shadow-2xl"
            />

            <div>
              <p className="mb-4 uppercase tracking-[0.35em] text-amber-300">
                A LIVING COOKBOOK
              </p>

              <h2 className="text-5xl font-bold text-white">
                Every Family Has One Recipe
              </h2>

              <p className="mt-8 text-lg leading-8 text-stone-300">
                Hidden inside kitchen drawers, handwritten notebooks and old
                family albums are recipes that deserve to be remembered.
              </p>

              <p className="mt-6 text-lg leading-8 text-stone-300">
                Other People&apos;s Recipes exists to preserve not only the food,
                but the people, memories and traditions behind it.
              </p>
            </div>
          </div>
      </section>
    </main>
  );
}

// Isolated behind Suspense so the Supabase lookup doesn't block the whole
// page (and the hero poster's preload hint) from streaming to the browser —
// this section is well below the fold and can arrive a beat later.
async function RecipeOfWeekSection() {
  const recipeOfWeek = await getRecipeOfWeek();
  if (!recipeOfWeek) return <RecipeOfWeekFallback />;

  const recipeOfWeekImage = recipeOfWeek.photo_path
    ? supabase.storage.from("recipe-published").getPublicUrl(recipeOfWeek.photo_path).data.publicUrl
    : null;

  return (
    <section className="bg-[#FFF3DF] px-6 py-24">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-[#1C5A50] shadow-2xl md:grid-cols-2">
        <div className="relative min-h-[340px]">
          {recipeOfWeekImage ? (
            <Image src={recipeOfWeekImage} alt={recipeOfWeek.title} fill sizes="(min-width: 768px) 50vw, 100vw" unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#EED8B2] p-8 text-center text-2xl font-bold text-[#123C39]">A treasured family recipe</div>
          )}
        </div>

        <div className="flex flex-col justify-center p-9 text-[#FFF3DF] md:p-14">
          <p className="text-sm uppercase tracking-[0.35em] text-[#DDB765]">
            This week&apos;s story from the OPR cookbook
          </p>
          <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            {recipeOfWeek.title}
          </h2>
          <p className="mt-3 text-sm uppercase tracking-[0.25em] text-[#DDB765]">
            {recipeOfWeek.location ?? "New Malden, England"}
          </p>
          <p className="mt-7 text-lg leading-8 text-[#FFF3DF]">
            {recipeOfWeek.recipe_of_week_note ?? recipeOfWeek.story}
          </p>
          <Link
            href={`/family-cookbook/community/${recipeOfWeek.id}`}
            className="mt-9 inline-flex w-fit items-center rounded-full bg-[#DDB765] px-7 py-4 font-medium text-[#08231F] transition hover:scale-105 hover:bg-[#DDB765]"
          >
            Read {recipeOfWeek.name}&apos;s story →
          </Link>
        </div>
      </div>
    </section>
  );
}

function RecipeOfWeekFallback() {
  return (
    <section className="bg-[#FFF3DF] px-6 py-24">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-[#1C5A50] shadow-2xl md:grid-cols-2">
        <div className="relative min-h-[340px]">
          <Image
            src="/images/recipes/daves-butter-chicken-feature.webp"
            alt="Dave's Butter Chicken"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center p-9 text-[#FFF3DF] md:p-14">
          <p className="text-sm uppercase tracking-[0.35em] text-[#DDB765]">
            This week&apos;s story from the OPR cookbook
          </p>
          <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            Dave&apos;s Butter Chicken
          </h2>
          <p className="mt-3 text-sm uppercase tracking-[0.25em] text-[#DDB765]">
            New Malden, England
          </p>
          <p className="mt-7 text-lg leading-8 text-[#FFF3DF]">
            Dave learned this from his Indian mother-in-law, then made it his own with passata for a smoother, richer sauce. He has cooked it in India for family — and even she now says his is better.
          </p>
          <Link
            href="/family-cookbook/daves-butter-chicken"
            className="mt-9 inline-flex w-fit items-center rounded-full bg-[#DDB765] px-7 py-4 font-medium text-[#08231F] transition hover:scale-105 hover:bg-[#DDB765]"
          >
            Read Dave&apos;s story →
          </Link>
        </div>
      </div>
    </section>
  );
}
