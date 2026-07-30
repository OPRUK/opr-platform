import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";
import RecipeActions from "../../components/RecipeActions";

const recipes = {
  "nans-sunday-rice-pudding": {
    title: "Nana Serb's Sunday Rice Pudding",
    place: "Birmingham, England",
    story:
      "Every Sunday after church, Nana Serb put this pudding in the oven before we sat down for lunch. By the time we reached dessert, the house smelled of vanilla and nutmeg. She never measured a thing — she simply knew. One spoonful still takes us straight back to her kitchen.",
    ingredients: [
      "100g pudding rice",
      "850ml whole milk",
      "50g caster sugar",
      "1 vanilla pod, or 1 teaspoon vanilla extract",
      "Freshly grated nutmeg",
      "A small knob of butter",
    ],
    method: [
      "Heat the oven to 150°C fan. Butter a medium ovenproof dish.",
      "Add the rice, sugar and vanilla to the dish. Pour in the milk and stir gently.",
      "Dust generously with nutmeg and dot the surface with butter.",
      "Bake for 1 hour 45 minutes to 2 hours, stirring once after the first 45 minutes, until the rice is tender and the top is golden.",
      "Let it stand for ten minutes before serving. Nana Serb always insisted it was best with a little extra nutmeg on top.",
    ],
    image: "/images/recipes/nana-serbs-rice-pudding.png",
  },
  "dads-friday-night-butter-chicken": {
    title: "Dave's Butter Chicken",
    place: "New Malden, England",
    story:
      "Dave learnt this recipe from his Indian mother-in-law. Wanting to enhance the flavour, he replaced chopped tomatoes with passata. He now cooks it for his Indian family whenever he is in India — a recipe that has become part of the family table on both sides of the world.",
    ingredients: [
      "600g chicken breast, diced",
      "200g natural yoghurt",
      "2 tablespoons tandoori paste (or garam masala with a little red food colouring if tandoori paste is unavailable)",
      "A large handful of finely chopped fresh coriander, including the stalks",
      "400g passata",
      "150ml double cream",
      "40g butter",
    ],
    method: [
      "Marinate the chicken breast in yoghurt and tandoori paste for at least 30 minutes. If using garam masala instead, add a little red food colouring for the authentic red colour.",
      "When Dave cooks this in India, he uses chicken pieces on the bone instead of chicken breast.",
      "Melt the butter in a pan, add the chicken and cook until lightly coloured. There is no onion or garlic in this recipe.",
      "Stir in the passata and coriander, including the finely chopped stalks, then simmer for 20 minutes.",
      "Add the cream and simmer gently until the sauce is rich and the chicken is cooked through.",
      "Serve with rice, naan and the people you love most.",
    ],
    image: "/images/recipes/daves-butter-chicken.png",
  },
  "grandads-steak-and-ale-pie": {
    title: "Grandad's Steak & Ale Pie",
    place: "Yorkshire, England",
    story:
      "Grandad made this every Christmas Eve. He always prepared the filling the day before because, as he put it, good things are worth waiting for. We still make it from his flour-dusted recipe book, and nobody is allowed to skip the extra gravy.",
    ingredients: [
      "750g braising steak, diced",
      "2 onions, sliced",
      "2 carrots, diced",
      "500ml dark ale",
      "300ml beef stock",
      "2 tablespoons plain flour",
      "1 sheet ready-rolled puff pastry",
      "1 egg, beaten",
    ],
    method: [
      "Brown the beef in batches, then soften the onions and carrots in the same pan.",
      "Stir in the flour, then add the ale and stock. Return the beef to the pan.",
      "Simmer gently for two hours until tender. Cool the filling completely — overnight is even better.",
      "Fill a pie dish, cover with pastry and brush with beaten egg.",
      "Bake at 200°C fan for 30–35 minutes, until deeply golden. Serve with plenty of gravy.",
    ],
    image: "/images/recipes/grandads-steak-ale-pie.png",
  },
};

type RecipeSlug = keyof typeof recipes;

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = recipes[slug as RecipeSlug];

  if (!recipe) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#4A4232]">
      <Navigation />

      <section className="bg-[#4A4232] px-6 pb-20 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">
          A page from the family cookbook
        </p>
        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          {recipe.title}
        </h1>
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-300">
          {recipe.place}
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-14 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <article className="rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#6E4B2C]/15 md:p-12">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            The story
          </p>
          <p className="mt-7 text-2xl leading-relaxed text-[#4A4232]">
            “{recipe.story}”
          </p>
          <p className="mt-10 border-t border-[#D1AD75] pt-6 text-sm italic text-stone-600">
            This recipe now belongs to every family who cooks it.
          </p>
        </article>

        <aside className="rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#6E4B2C]/15 md:p-12">
          <Image
            src={recipe.image}
            alt={recipe.title}
            width={1200}
            height={900}
            className="mb-8 aspect-[4/3] w-full rounded-2xl object-cover"
          />
          <h2 className="text-3xl font-bold">What you&apos;ll need</h2>
          <ul className="mt-7 space-y-4 leading-7 text-stone-700">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient} className="border-b border-[#E7CEA2] pb-4">
                {ingredient}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="bg-[#FFF3DF] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            The method
          </p>
          <ol className="mt-9 space-y-7">
            {recipe.method.map((step, index) => (
              <li key={step} className="flex gap-6 text-lg leading-8 text-stone-700">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4A4232] text-sm font-bold text-white">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <RecipeActions title={recipe.title} imageUrl={recipe.image} />

      <section className="px-6 py-20 text-center">
        <Link
          href="/family-cookbook"
          className="inline-block rounded-full bg-[#4A4232] px-8 py-4 text-lg font-medium text-white transition hover:scale-105"
        >
          Return to the Cookbook
        </Link>
      </section>
      <Footer />
    </main>
  );
}
