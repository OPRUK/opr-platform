import type { Metadata } from "next";
import { Suspense } from "react";
import Navigation from "./components/Navigation";
import Image from "next/image";
import Link from "next/link";
import HomeHero from "./components/HomeHero";
import HomeRecipePoll from "./components/HomeRecipePoll";
import TrackedLink from "./components/TrackedLink";
import { supabase } from "../lib/supabase/client";
import { cookalongEvent } from "../lib/cookalong-event";
import { featuredRecipes } from "../lib/recipes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Other People's Recipes: A Living Cookbook of Family Recipes",
  },
  description:
    "Handwritten, handed-down and half-remembered family recipes from across the world, preserved with the stories behind them.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Other People's Recipes: A Living Cookbook of Family Recipes",
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

const useCuratedRecipeOfWeek = true;
const homepageMonthName = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  timeZone: "Europe/London",
}).format(new Date());

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
      <Navigation />

      {/* Hero */}
      <HomeHero>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-12 text-center text-white animate-rise-in sm:px-8 sm:pb-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#DDB765] drop-shadow-md sm:text-sm sm:tracking-[0.4em]">
            A Living Cookbook
          </p>

          <h1 className="font-brand mx-auto max-w-6xl text-balance text-[clamp(2.8rem,7vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.025em] drop-shadow-2xl">
            Other People&apos;s Recipes
            <sup
              aria-hidden="true"
              className="ml-0.5 align-super text-[0.35em]"
            >
              ™
            </sup>
          </h1>

          <p className="font-display mx-auto mt-6 max-w-3xl text-balance text-2xl leading-tight text-[#FFF3DF] sm:text-3xl md:text-4xl">
            Every Recipe has a Story.
          </p>

          <p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-7 text-stone-100 sm:text-lg sm:leading-8">
            Other People&apos;s Recipes is a living cookbook preserving the
            recipes families return to, and the people, memories and traditions
            behind them.
          </p>

          <div className="mt-8 flex justify-center">
            <TrackedLink
              href="/family-cookbook"
              eventKey="home_cookbook"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#123C39] px-8 py-3.5 text-base font-medium leading-tight transition hover:scale-105 sm:px-10 sm:py-4 sm:text-lg"
            >
              Open the Living Cookbook
            </TrackedLink>
          </div>
        </div>
      </HomeHero>
      <section className="home-cooking" aria-label="More ways to cook with OPR">
        <div className="home-cooking-grid">
          <article className="home-cooking-card">
            <Image src="/images/meal-maker/cupboard-kitchen.webp" alt="" fill sizes="(max-width: 767px) 100vw, 50vw" className="home-cooking-photo" />
            <div className="home-cooking-copy">
              <p className="home-cooking-eyebrow">Something good, already at home</p>
              <h2>Make me a <em>meal.</em></h2>
              <p>Tell us what’s in your cupboard and fridge. Find something good to cook with what you have.</p>
              <Link href="/make-me-a-meal" className="home-cooking-button">Make me a meal</Link>
            </div>
          </article>
          <article className="home-cooking-card">
            <Image src="/images/at-home/at-home-lemon-and-pea-pasta.webp" alt="" fill sizes="(max-width: 767px) 100vw, 50vw" className="home-cooking-photo" />
            <div className="home-cooking-copy">
              <p className="home-cooking-eyebrow">Everyday cooking</p>
              <h2>At home <em>recipes.</em></h2>
              <p>100 ideas for 15 minute meals, family dinners and date night. A little inspiration for every day.</p>
              <Link href="/at-home-recipes" className="home-cooking-button">Explore At home recipes</Link>
            </div>
          </article>
        </div>
        <div className="home-cookalong">
          <div className="home-cookalong-photo"><Image src="/images/recipes/daves-butter-chicken-wide.webp" alt="" fill sizes="180px" /></div>
          <div className="home-cookalong-copy">
            <p className="home-cooking-eyebrow">{cookalongEvent.public.home.eyebrow}</p>
            <h2>Let’s cook <em>together.</em></h2>
            <p>{cookalongEvent.public.home.message} Join our table to hear when it’s ready.</p>
          </div>
          <Link href={cookalongEvent.cta.href} className="home-cooking-button">Join Our Table</Link>
        </div>
      </section>

      <section aria-labelledby="opc-launch-heading" className="bg-[#FFF3DF] px-6 py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-8 rounded-[2rem] border border-[#DDB765]/50 p-7 sm:p-10 md:grid-cols-[1fr_180px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8D6520]">A new chapter from the OPR family</p>
            <h2 id="opc-launch-heading" className="mt-4 font-display text-3xl font-bold leading-tight text-[#123C39] sm:text-4xl">Meet Other People&apos;s Cocktails.</h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">Every cocktail has a story. Our sister community, OPC, is now open: a place for the drinks you love, the people who introduced you to them and the memories worth passing on.</p>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-stone-700">Discover cocktails and alcohol-free recipes, meet our first Cocktail of the Month, or share your own signature drink and its story. Join us at the bar.</p>
            <a href="https://otherpeoplescocktails.co.uk/" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#123C39] px-7 py-3 font-semibold text-[#FFF3DF] transition hover:bg-[#1C5A50]">Explore Other People&apos;s Cocktails</a>
            <p className="mt-4 text-sm leading-6 text-stone-600">Other People&apos;s Cocktails is a trading name of OTHER PEOPLES RECIPES LTD. Alcoholic recipes are intended for adults aged 18+. Drink responsibly.</p>
          </div>
          <Image src="/images/opc-sister-community.svg" alt="Other People's Cocktails" width={180} height={180} className="mx-auto w-32 md:w-44" />
        </div>
      </section>

      <section className="bg-[#EED8B2] px-6 py-10 md:py-14">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-[#FFF3DF] shadow-xl shadow-[#1C5A50]/15 md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-72 md:min-h-[22rem]">
            <Image
              src="/images/recipes/robin-vaughans-gingerbread-original.png"
              alt="Robin Vaughan's worn gingerbread recipe clipping, marked by years of family baking"
              fill
              sizes="(max-width: 767px) 100vw, 45vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center px-8 py-10 text-[#123C39] md:px-12 md:py-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8D6520]">
              Share a family recipe
            </p>
            <h2 className="mt-4 max-w-xl font-display text-4xl font-bold leading-tight md:text-5xl">
              What&apos;s the recipe everyone asks you to make?
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone-700">
              The handwritten note, the Sunday favourite, the dish that brings everyone back to the table. We&apos;d love to help preserve its story.
            </p>
            <Link
              href="/share"
              className="mt-7 inline-flex w-fit rounded-full bg-[#123C39] px-7 py-3.5 text-base font-bold text-[#FFF3DF] transition hover:scale-105 hover:bg-[#1C5A50]"
            >
              Share your recipe
            </Link>
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
                stories behind them, shared with care, discovered by others,
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
              src="/images/recipes/barbaras-beef-casserole-wide.webp"
              alt="Barbara's beef casserole with rich gravy"
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
              Barbara&apos;s Beef Casserole
            </h2>
            <div className="font-founder-hand mt-8 space-y-2 text-2xl leading-[1.35] text-[#EED8B2] md:text-3xl">
              <p>braising steak, onions &amp; carrots</p>
              <p>dark ale &amp; beef stock</p>
              <p>a spoonful of Bovril</p>
              <p>simmer gently until tender</p>
              <p className="pl-6">serve with mash and extra gravy</p>
            </div>
            <p className="font-founder-hand mt-7 text-2xl italic text-[#DDB765] md:text-3xl">
              Good things are worth waiting for.
            </p>
            <Link
              href="/family-cookbook/barbaras-beef-casserole"
              className="mt-10 inline-flex w-fit items-center rounded-full bg-[#DDB765] px-8 py-4 text-lg font-bold text-[#123C39] shadow-lg transition hover:scale-105 hover:bg-[#EED8B2]"
            >
              Cook Barbara&apos;s casserole →
            </Link>
            <p className="mt-5 max-w-xl text-sm italic leading-6 text-[#DABF91]">
              Passed from Pat to Barbara, made her own with Bovril and always prepared the day before.
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<RecipeOfWeekFallback />}>
        <RecipeOfWeekSection />
      </Suspense>

      <HomeRecipePoll
        initialMonthName={homepageMonthName}
        candidates={featuredRecipes.map((recipe) => ({
          id: `featured-${recipe.slug}`,
          title: recipe.title,
          place: recipe.place,
        }))}
      />

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
  // Keep this editorial selection in place even if an older community
  // submission is still marked as the weekly recipe.
  if (useCuratedRecipeOfWeek) {
    return <RecipeOfWeekFallback />;
  }

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
          <p className="text-sm uppercase tracking-[0.35em] text-[#FFF3DF]">
            This month&apos;s story from the OPR cookbook
          </p>
          <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            {recipeOfWeek.title}
          </h2>
          <p className="mt-3 text-sm uppercase tracking-[0.25em] text-[#FFF3DF]">
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
            src="/images/recipes/jennifers-ginger-cream-ice.webp"
            alt="Cream ice with small golden pieces of stem ginger in a ceramic bowl"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center p-9 text-[#FFF3DF] md:p-14">
          <p className="text-sm uppercase tracking-[0.35em] text-[#FFF3DF]">
            November Recipe of the Month · OPR’s editorial choice
          </p>
          <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            Jennifer&apos;s Ginger Cream Ice
          </h2>
          <p className="mt-3 text-sm uppercase tracking-[0.25em] text-[#FFF3DF]">
            Shared by Jennifer Benyon Tinker
          </p>
          <p className="mt-7 text-lg leading-8 text-[#FFF3DF]">
            A treasured no-churn cream ice, inspired by Sonia Allison’s 1968 cookbook and made Jennifer’s own with little pieces of stem ginger. No ice cream machine or freezer bowl needed.
          </p>
          <Link
            href="/family-cookbook/jennifers-ginger-cream-ice"
            className="mt-9 inline-flex w-fit items-center rounded-full bg-[#DDB765] px-7 py-4 font-medium text-[#08231F] transition hover:scale-105 hover:bg-[#DDB765]"
          >
            Make Jennifer&apos;s ginger cream ice
          </Link>
        </div>
      </div>
    </section>
  );
}
