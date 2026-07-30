import Navigation from "../components/Navigation";
import RecipeForm from "./RecipeForm";

export default function ShareYourStory() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#4A4232]">
      <Navigation />

      <section className="bg-[#4A4232] px-6 pb-24 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">
          Add a page to the book
        </p>
        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
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
    </main>
  );
}
