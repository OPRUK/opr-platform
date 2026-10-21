import Link from "next/link";
import Navigation from "../components/Navigation";
import { buildMetadata } from "../../lib/metadata";

export const metadata = buildMetadata({
  title: "How to Preserve Family Recipes and Their Stories",
  description: "A free practical guide to recording family recipes: interview questions, cooking notes and a downloadable worksheet to keep the people behind each dish in the story.",
  path: "/preserve-family-recipes",
});

const steps = [
  { title: "Start with a person, then a dish", text: "Ask which dish they would most like someone else to keep making. It might be an everyday supper rather than a celebration cake. Write down their name, what they call the dish and who taught them. Keep their own words, including family nicknames and the original name of the recipe." },
  { title: "Ask about the moments around the meal", text: "Who was usually at the table? When did they make it? What did the kitchen smell like? Which part did everyone argue over? Ask one question at a time and leave room for the answer. A small memory often says more than a polished life story." },
  { title: "Cook it together and measure as you go", text: "A handful, a teacup and a little bit can make perfect sense to the cook. Ask them to show you, then weigh or measure what they actually use. Record the size of the tin or pan, the number of portions, the oven setting and whether the oven is fan-assisted. Note substitutions separately from the version you watched." },
  { title: "Record what ready looks like", text: "Alongside timings, describe the colour, texture and consistency at each important stage. Does the sauce coat a spoon? Do the onions turn golden? Is the dough soft or firm? Keep the order of the steps and any resting or cooling time. Follow current food-safety advice when cooking; a remembered habit is not a safety check." },
  { title: "Keep the original and a readable copy", text: "Photograph both sides of a handwritten recipe card in good light, without cutting off the edges. Keep the original safely. Type a separate copy, keeping uncertain words marked as uncertain rather than guessing. Save photographs, audio and the typed recipe together with the date and the name of the person who recorded them." },
  { title: "Ask before recording or sharing", text: "Explain what you want to record and where you would like to share it. A relative may be happy to keep a recording within the family but prefer not to publish it. Ask separately about names, photographs and their words. Let them check the finished version, and leave private details out." },
  { title: "Let another person cook from your notes", text: "The best way to find a missing step is to hand the recipe to someone who has never made it. Write down their questions, check the answers with the original cook where possible and date each revision. Keep family variations together so that one person’s version does not erase another’s." },
];

export default function PreserveFamilyRecipesPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />
      <article className="mx-auto max-w-4xl px-6 pb-20 pt-36 md:px-8">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-900">A free OPR guide</p>
        <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-6xl">Keep the recipe. Keep the person in the story.</h1>
        <p className="mt-7 text-xl leading-9">The ingredients tell you how to make it. The person tells you why it matters. Here is a simple way to record both, one conversation and one dish at a time.</p>
        <div className="mt-8 rounded-2xl bg-[#FFF3DF] p-6">
          <p className="leading-7">You only need a notebook, something to measure with and, if the cook agrees, a phone for photographs or audio. You can keep everything privately within your family.</p>
          <a href="/downloads/family-recipe-interview-worksheet.txt" download className="mt-5 inline-block rounded-full bg-[#123C39] px-6 py-3 font-semibold text-white">Download the recipe interview worksheet</a>
          <p className="mt-3 text-sm">A free text file you can edit, print or read aloud. No sign-up needed.</p>
        </div>
        <section aria-label="Seven steps to preserve a family recipe" className="mt-12 space-y-10">
          {steps.map((step, index) => <section key={step.title}><h2 className="text-2xl font-bold">{index + 1}. {step.title}</h2><p className="mt-4 text-lg leading-8">{step.text}</p></section>)}
        </section>
        <section className="mt-12 rounded-3xl bg-[#FFF3DF] p-7 md:p-10">
          <h2 className="text-3xl font-bold">Five questions to begin with</h2>
          <ul className="mt-5 list-disc space-y-3 pl-6 text-lg leading-8">
            <li>Who first made this for you?</li><li>What do you remember about their kitchen?</li><li>What have you changed, and what would you never change?</li><li>What should someone making it for the first time know?</li><li>Who would you like to cook it for next?</li>
          </ul>
        </section>
        <section className="mt-12">
          <h2 className="text-3xl font-bold">See how a family recipe travels</h2>
          <p className="mt-4 text-lg leading-8"><Link href="/family-cookbook/daves-butter-chicken" className="font-semibold underline underline-offset-4">Dave’s Butter Chicken</Link> is one place to start. Explore the <Link href="/family-cookbook" className="font-semibold underline underline-offset-4">Living Cookbook</Link> for more recipes and the people who passed them on, or read <Link href="/founder" className="font-semibold underline underline-offset-4">why Chaten started OPR</Link>.</p>
        </section>
        <aside className="mt-12 border-t border-[#9A622A]/40 pt-8 text-lg leading-8">
          <h2 className="text-2xl font-bold">For libraries and community groups</h2>
          <p className="mt-4">You are welcome to print this guide and the worksheet for free, non-commercial family and community activities, with credit to Other People’s Recipes. Please link to this page so others can find the current version. For other uses, <a href="mailto:info@otherpeoplesrecipes.co.uk" className="font-semibold underline">contact OPR</a>.</p>
        </aside>
        <section className="mt-12 rounded-3xl bg-[#123C39] p-8 text-center text-[#FFF3DF]">
          <h2 className="text-3xl font-bold">Every Recipe Has a Story. Tell Us Yours.</h2>
          <p className="mt-4 text-lg leading-8">If you and the person behind the dish would like to share it, there is a place for your recipe at our table.</p>
          <Link href="/share" className="mt-6 inline-block rounded-full bg-[#DDB765] px-7 py-3 font-bold text-[#08231F]">Share your family recipe</Link>
        </section>
        <p className="mt-8 text-sm">Written by the OPR team · Published 21 October 2026</p>
      </article>
    </main>
  );
}
