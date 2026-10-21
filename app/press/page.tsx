import Link from "next/link";
import Navigation from "../components/Navigation";
import { buildMetadata } from "../../lib/metadata";

export const metadata = buildMetadata({ title: "Press and Community Enquiries", description: "The story behind Other People's Recipes, useful links for journalists and community groups, and how to contact the OPR team.", path: "/press" });

export default function PressPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />
      <article className="mx-auto max-w-4xl px-6 pb-24 pt-36 md:px-8">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-900">Press and community enquiries</p>
        <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-6xl">People before recipes. Stories before ingredients.</h1>
        <p className="mt-7 text-xl leading-9">Other People’s Recipes is a living cookbook for family recipes and the people, memories and traditions behind them.</p>
        <section className="mt-12 rounded-3xl bg-[#FFF3DF] p-7 md:p-10">
          <h2 className="text-3xl font-bold">The OPR story</h2>
          <p className="mt-5 text-lg leading-8">Founder Chaten Oberoi-Morris first wrote down the idea in 2000: build a place where family recipes can live on. OPR brings that idea to life through a growing cookbook, contributor stories and short films.</p>
          <p className="mt-5 text-lg leading-8">Dave’s Butter Chicken, learnt from Chaten’s mum and made his own, captures the idea: recipes change as they pass between people, while keeping a connection to the person who taught them.</p>
          <p className="mt-5 text-lg leading-8">Every Recipe Has a Story. Tell Us Yours.</p>
        </section>
        <section className="mt-12">
          <h2 className="text-3xl font-bold">Useful starting points</h2>
          <ul className="mt-6 space-y-4 text-lg underline underline-offset-4">
            <li><Link href="/founder">Read Chaten’s founder’s letter</Link></li>
            <li><Link href="/family-cookbook/daves-butter-chicken">Dave’s Butter Chicken: a family recipe passed on</Link></li>
            <li><Link href="/family-cookbook/robin-vaughans-gingerbread">Robin Vaughan’s Gingerbread</Link></li>
            <li><Link href="/films">Watch the OPR Film Collection</Link></li>
            <li><Link href="/preserve-family-recipes">Free guide: how to preserve family recipes and their stories</Link></li>
            <li><Link href="/share">Share a recipe with the Living Cookbook</Link></li>
          </ul>
        </section>
        <section className="mt-12 rounded-3xl bg-[#123C39] p-8 text-[#FFF3DF]">
          <h2 className="text-3xl font-bold">Talk to OPR</h2>
          <p className="mt-4 text-lg leading-8">For founder interviews, story enquiries, image permissions or community collaboration enquiries, email <a href="mailto:info@otherpeoplesrecipes.co.uk" className="font-semibold underline underline-offset-4">info@otherpeoplesrecipes.co.uk</a>.</p>
          <p className="mt-4 leading-7">Please ask before reproducing photographs, films or contributors’ words. The team can discuss availability and seek the relevant permissions.</p>
        </section>
        <p className="mt-8 text-sm leading-7">Other People’s Recipes is operated by OTHER PEOPLES RECIPES LTD, company number 17370145. Updated 21 October 2026.</p>
      </article>
    </main>
  );
}
