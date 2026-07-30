import Navigation from "./components/Navigation";
import Image from "next/image";
import Link from "next/link";
import Footer from "./components/Footer";
import HeroCarousel from "./components/HeroCarousel";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />

      {/* Hero */}
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#0D342F]">
        <HeroCarousel />

        <div className="relative z-10 mx-auto max-w-4xl px-8 text-center text-white animate-rise-in">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.4em] text-[#FFD58C] drop-shadow-md">
            A Living Cookbook
          </p>

          <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight drop-shadow-2xl">
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
                  Treasured Recipes
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

      <section className="bg-[#FFF3DF] px-6 py-24">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-[#1C5A50] shadow-2xl md:grid-cols-2">
          <div className="relative min-h-[340px]">
            <Image
              src="/images/recipes/daves-butter-chicken.png"
              alt="Dave's Butter Chicken"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center p-9 text-[#FFF3DF] md:p-14">
            <p className="text-sm uppercase tracking-[0.35em] text-[#FFD58C]">
              This week&apos;s story from the OPR cookbook
            </p>
            <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
              Dave&apos;s Butter Chicken
            </h2>
            <p className="mt-3 text-sm uppercase tracking-[0.25em] text-[#F0D4A0]">
              New Malden, England
            </p>
            <p className="mt-7 text-lg leading-8 text-[#FFF1D8]">
              Dave learned this from his Indian mother-in-law, then made it his
              own with passata for a smoother, richer sauce. He has cooked it
              in India for family — and even she now says his is better.
            </p>
            <Link
              href="/family-cookbook/dads-friday-night-butter-chicken"
              className="mt-9 inline-flex w-fit items-center rounded-full bg-[#DDB765] px-7 py-4 font-medium text-[#08231F] transition hover:scale-105 hover:bg-[#FFD58C]"
            >
              Read Dave&apos;s story →
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
              src="/images/hero-kitchen.png"
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
      <Footer />
    </main>
  );
}
