import type { Metadata } from "next";
import Navigation from "./components/Navigation";
import Image from "next/image";
import Link from "next/link";
import HomeHero from "./components/HomeHero";
import { supabase } from "../lib/supabase/client";

export const metadata: Metadata = {
  title: {
    absolute: "Other People's Recipes — A Living Cookbook of Family Recipes",
  },
  description:
    "Handwritten, handed-down and half-remembered family recipes from across Britain, preserved with the stories behind them.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Other People's Recipes — A Living Cookbook of Family Recipes",
    description:
      "Handwritten, handed-down and half-remembered family recipes from across Britain, preserved with the stories behind them.",
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
  const recipeOfWeek = await getRecipeOfWeek();
  const recipeOfWeekImage = recipeOfWeek?.photo_path
    ? supabase.storage.from("recipe-photos").getPublicUrl(recipeOfWeek.photo_path).data.publicUrl
    : null;
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />

      {/* Hero */}
      <HomeHero>
        <div className="relative z-10 mx-auto max-w-4xl px-8 text-center text-white animate-rise-in">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.4em] text-[#FFD58C] drop-shadow-md">
            A Living Cookbook
          </p>

          <h1 className="font-brand text-7xl font-semibold leading-[0.9] tracking-[-0.02em] drop-shadow-2xl md:text-9xl">
            Other People&apos;s Recipes
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-xl leading-9 text-stone-200">
            Every Recipe Has a Story.
            <br />
            Every Story Deserves a Table.
          </p>

          <div className="mt-12 flex flex-col justify-center gap-5 sm:flex-row">
            <Link
              href="/family-cookbook"
              className="rounded-full bg-[#123C39] px-10 py-4 text-lg font-medium transition hover:scale-105"
            >
              Open the Cookbook
            </Link>

            <Link
              href="/our-story"
              className="rounded-full border border-white px-10 py-4 text-lg transition hover:bg-white hover:text-black"
            >
              Your Story
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
              <p className="text-sm font-bold uppercase tracking-[0.38em] text-[#FFD58C]">
                The Recipe That Feels Like Home
              </p>
              <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
                Tell us the story your family always asks for.
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#FFF1D8] md:text-xl">
                Throughout August, we&apos;re looking for recipes that bring
                people back to the table — to feature in the OPR Cookbook and
                share with our growing community.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/share"
                  className="inline-flex w-fit rounded-full bg-[#DDB765] px-8 py-4 text-base font-bold text-[#08231F] transition hover:scale-105 hover:bg-[#FFD58C]"
                >
                  Share your recipe →
                </Link>
                <p className="text-sm text-[#F0D4A0]">Your family story could be next.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#EED8B2] px-8 py-24 animate-rise-in-delayed">
          <div className="mx-auto max-w-6xl text-center">
            <p className="mb-4 uppercase tracking-[0.35em] text-amber-700">
              EVERY RECIPE HAS A STORY
            </p>

            <h2 className="text-5xl font-bold text-[#123C39]">
              More Than Just Recipes
            </h2>

            <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-stone-700">
              Some recipes are passed down through generations. Others are
              found in faded notebooks, handwritten cards, or scribbled on the
              back of shopping lists. Every one carries a memory worth
              preserving.
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <Link
                href="/our-story"
                className="group rounded-3xl bg-[#FFF3DF] p-10 text-left shadow-lg shadow-[#1C5A50]/15 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <h3 className="mb-4 text-2xl font-bold text-[#123C39]">
                  Family Stories
                </h3>

                <p className="text-stone-600">
                  Discover the memories behind treasured family recipes.
                </p>
                <span className="mt-7 inline-block text-sm font-semibold text-[#9A622A] transition group-hover:translate-x-1">
                  Read Your Story →
                </span>
              </Link>

              <Link
                href="/family-cookbook"
                className="group rounded-3xl bg-[#FFF3DF] p-10 text-left shadow-lg shadow-[#1C5A50]/15 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <h3 className="mb-4 text-2xl font-bold text-[#123C39]">
                  Kitchen Keepsakes
                </h3>

                <p className="text-stone-600">
                  Preserve recipes that deserve to live on for generations.
                </p>
                <span className="mt-7 inline-block text-sm font-semibold text-[#9A622A] transition group-hover:translate-x-1">
                  Explore the cookbook →
                </span>
              </Link>

              <Link
                href="/share"
                className="group rounded-3xl bg-[#FFF3DF] p-10 text-left shadow-lg shadow-[#1C5A50]/15 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <h3 className="mb-4 text-2xl font-bold text-[#123C39]">
                  Shared Around the Table
                </h3>

                <p className="text-stone-600">
                  Celebrate the moments that bring families together.
                </p>
                <span className="mt-7 inline-block text-sm font-semibold text-[#9A622A] transition group-hover:translate-x-1">
                  Share your recipe →
                </span>
              </Link>
            </div>
          </div>
      </section>

      <section className="bg-[#123C39] px-6 py-24 md:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[2rem] bg-[#79502D] p-8 shadow-2xl md:min-h-[480px] md:p-14">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,232,181,0.16),transparent_42%,rgba(45,24,10,0.35))]" />
            <div
              className="font-founder-hand relative w-full max-w-sm -rotate-3 overflow-hidden border border-[#A46C36] bg-[#E7C58D] p-8 text-[#123C39] shadow-[10px_15px_22px_rgba(31,18,8,0.46)] md:p-10"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 9% 8%, rgba(91,57,25,0.22), transparent 20%), radial-gradient(ellipse at 92% 84%, rgba(114,68,29,0.2), transparent 24%), radial-gradient(ellipse at 54% 43%, rgba(255,244,211,0.38), transparent 55%), repeating-linear-gradient(to bottom, transparent 0, transparent 35px, rgba(126,74,35,0.2) 36px)",
              }}
            >
              <div className="pointer-events-none absolute -left-10 top-20 h-28 w-28 rounded-full bg-[#6A4022]/10 blur-2xl" />
              <div className="pointer-events-none absolute -right-10 bottom-2 h-24 w-36 rotate-12 rounded-full bg-[#704323]/15 blur-2xl" />
              <p className="text-xs uppercase tracking-[0.28em] text-[#8B5A2B]">From the kitchen drawer</p>
              <p className="mt-5 text-3xl font-semibold italic leading-tight text-[#123C39] md:text-4xl">Krishna Vanti&apos;s Baingan ka Bharta</p>
              <div className="mt-8 space-y-1 text-[1.25rem] leading-[1.4] text-[#5F3B23] md:text-[1.45rem]">
                <p>onions, cooked till pink</p>
                <p>4–5 tomatoes, cooked till mashed</p>
                <p>salt &amp; deghi mirch</p>
                <p>mashed bhuna baingan</p>
                <p className="pl-5">2 slit green chillies</p>
              </div>
              <p className="mt-9 text-xl italic text-[#6C472A]">Don&apos;t let it turn brown.</p>
            </div>
          </div>

          <div className="text-[#FFF3DF]">
            <p className="text-sm uppercase tracking-[0.35em] text-[#FFD58C]">
              Bring an old recipe back to life
            </p>
            <h2 className="mt-5 max-w-xl text-4xl font-bold leading-tight md:text-6xl">
              Scan a handwritten recipe card
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#F1DFC5] md:text-xl">
              Take a clear photo of a recipe card or notebook page and OPR will
              make an editable first draft of the title, ingredients and method.
              You stay in control and can correct every word before sharing.
            </p>
            <Link
              href="/share#scan-a-recipe"
              className="mt-10 inline-flex w-fit items-center rounded-full bg-[#DDB765] px-8 py-4 text-lg font-bold text-[#123C39] shadow-lg transition hover:scale-105 hover:bg-[#F0CC7A]"
            >
              Choose the recipe card →
            </Link>
            <p className="mt-5 text-sm italic text-[#DABF91]">Your original stays yours. The draft is always editable.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#FFF3DF] px-6 py-24">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-[#1C5A50] shadow-2xl md:grid-cols-2">
          <div className="relative min-h-[340px]">
            {recipeOfWeek ? (
              recipeOfWeekImage ? <img src={recipeOfWeekImage} alt={recipeOfWeek.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-[#DDBB82] p-8 text-center text-2xl font-bold text-[#123C39]">A treasured family recipe</div>
            ) : (
              <Image
                src="/images/recipes/daves-butter-chicken-feature.png"
                alt="Dave's Butter Chicken"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>

          <div className="flex flex-col justify-center p-9 text-[#FFF3DF] md:p-14">
            <p className="text-sm uppercase tracking-[0.35em] text-[#FFD58C]">
              This week&apos;s story from the OPR cookbook
            </p>
            <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
              {recipeOfWeek?.title ?? "Dave's Butter Chicken"}
            </h2>
            <p className="mt-3 text-sm uppercase tracking-[0.25em] text-[#F0D4A0]">
              {recipeOfWeek?.location ?? "New Malden, England"}
            </p>
            <p className="mt-7 text-lg leading-8 text-[#FFF1D8]">
              {recipeOfWeek?.recipe_of_week_note ?? recipeOfWeek?.story ?? "Dave learned this from his Indian mother-in-law, then made it his own with passata for a smoother, richer sauce. He has cooked it in India for family — and even she now says his is better."}
            </p>
            <Link
              href={recipeOfWeek ? `/family-cookbook/community/${recipeOfWeek.id}` : "/family-cookbook/daves-butter-chicken"}
              className="mt-9 inline-flex w-fit items-center rounded-full bg-[#DDB765] px-7 py-4 font-medium text-[#08231F] transition hover:scale-105 hover:bg-[#FFD58C]"
            >
              Read {recipeOfWeek ? `${recipeOfWeek.name}'s` : "Dave's"} story →
            </Link>
          </div>
        </div>
      </section>

      <section
        id="cookbook"
        className="bg-[#123C39] px-6 py-24 animate-rise-in-delayed"
      >
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
            <Image
              src="/images/living-cookbook-feature.png"
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
