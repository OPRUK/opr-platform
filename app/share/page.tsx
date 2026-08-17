import type { Metadata } from "next";
import Navigation from "../components/Navigation";
import RecipeForm from "./RecipeForm";

export const metadata: Metadata = {
  title: "Share Your Family Recipe and Story",
  description:
    "Preserve the recipe your family asks for again and again. Share the dish and the story behind it with Other People's Recipes.",
  alternates: { canonical: "/share" },
  openGraph: {
    title: "Share Your Family Recipe and Story | Other People's Recipes",
    description:
      "Preserve the recipe your family asks for again and again. Share the dish and the story behind it with Other People's Recipes.",
    url: "/share",
    siteName: "Other People's Recipes",
    locale: "en_GB",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Other People's Recipes — Every Recipe has a Story." }],
  },
};

export default function ShareYourStory() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />

      <section className="bg-[#123C39] px-6 pb-24 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">
          Share your recipe to the Living Cookbook
        </p>
        <h1 className="font-display mx-auto max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          Share your family&apos;s recipe.
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-stone-200">
          The ingredients matter, but the story matters too. Tell us both, in
          your own words.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 md:px-8">
        <RecipeForm />
      </section>

      <section className="border-t border-[#D1AD75]/70 bg-[#FFF3DF] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm uppercase tracking-[0.35em] text-amber-700">
            What happens next
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["01", "Send your recipe", "Your email arrives directly with the OPR team."],
              ["02", "We read the story", "We look for the people and memories behind every dish."],
              ["03", "A recipe lives on", "Selected stories can appear in the living cookbook and beyond."],
            ].map(([number, title, copy]) => (
              <article key={number} className="rounded-3xl border border-[#D1AD75]/70 bg-[#F4DDAE]/60 p-7">
                <p className="text-sm font-bold tracking-[0.25em] text-amber-800">{number}</p>
                <h2 className="mt-5 text-2xl font-bold">{title}</h2>
                <p className="mt-3 leading-7 text-stone-700">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
