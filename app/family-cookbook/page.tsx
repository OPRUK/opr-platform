import Link from "next/link";
import Image from "next/image";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const recipes = [
  {
    title: "Nana Serb's Sunday Rice Pudding",
    place: "Birmingham, England",
    story:
      "Every Sunday after church, Nana Serb would put this in the oven before lunch. By dessert, the whole house smelled of vanilla and nutmeg.",
    number: "01",
    slug: "nans-sunday-rice-pudding",
    image: "/images/recipes/nana-serbs-rice-pudding.png",
  },
  {
    title: "Dave's Butter Chicken",
    place: "New Malden, England",
    story:
      "Dave learnt this from his Indian mother-in-law. He replaced chopped tomatoes with passata to enhance the flavour, and now cooks it for his Indian family whenever he is in India.",
    number: "02",
    slug: "dads-friday-night-butter-chicken",
    image: "/images/recipes/daves-butter-chicken.png",
  },
  {
    title: "Grandad's Steak & Ale Pie",
    place: "Yorkshire, England",
    story:
      "He always made the filling a day early, saying that good things were worth waiting for. We still use his battered recipe book.",
    number: "03",
    slug: "grandads-steak-and-ale-pie",
    image: "/images/recipes/grandads-steak-ale-pie.png",
  },
];

export default function FamilyCookbook() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#4A4232]">
      <Navigation />

      <section className="bg-[#4A4232] px-6 pb-24 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">
          The Family Cookbook
        </p>
        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          Every recipe has travelled through time before finding its way here.
        </h1>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-8">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            Choose a page
          </p>
          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            Stories from family kitchens
          </h2>
          <p className="mt-6 text-lg leading-8 text-stone-700">
            These are the first pages of the OPR cookbook: recipes shared with
            love, and the memories that make them matter.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {recipes.map((recipe) => (
            <Link
              key={recipe.number}
              href={`/family-cookbook/${recipe.slug}`}
              className="group overflow-hidden rounded-3xl bg-[#FFF3DF] shadow-lg shadow-[#6E4B2C]/15 transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <Image
                src={recipe.image}
                alt={recipe.title}
                width={1200}
                height={900}
                className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="flex min-h-80 flex-col p-9">
                <p className="text-sm tracking-[0.3em] text-amber-700">
                  {recipe.number}
                </p>
                <h3 className="mt-5 text-3xl font-bold leading-tight">
                  {recipe.title}
                </h3>
                <p className="mt-3 text-sm uppercase tracking-[0.16em] text-stone-500">
                  {recipe.place}
                </p>
                <p className="mt-7 grow leading-7 text-stone-700">
                  “{recipe.story}”
                </p>
                <span className="mt-8 font-medium text-[#4A4232] transition group-hover:text-amber-700">
                  Open recipe →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#FFF3DF] px-6 py-24 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
          Your page awaits
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold md:text-5xl">
          Could your family&apos;s recipe be next?
        </h2>
        <Link
          href="/share"
          className="mt-10 inline-block rounded-full bg-[#4A4232] px-8 py-4 text-lg font-medium text-white transition hover:scale-105"
        >
          Share Your Story
        </Link>
      </section>
      <Footer />
    </main>
  );
}
