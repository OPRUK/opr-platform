import type { Metadata } from "next";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms covering use of Other People's Recipes and recipe submissions.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />
      <section className="bg-[#123C39] px-6 pb-20 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">Legal</p>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight md:text-6xl">Terms of Use</h1>
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-300">Last updated: 3 August 2026</p>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          <div className="space-y-9 leading-7 text-stone-700">
            <p>These terms apply to otherpeoplesrecipes.co.uk (the “site”). The site is operated by <strong>OTHER PEOPLES RECIPES LTD</strong>, company number 17370145 (“OPR”, “we”, “us”).</p>
            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">1. Sharing a recipe</h2>
              <p className="mt-3">When you submit a recipe, story, image or audio, you confirm that you have the right to share it and that it is not copied from a cookbook, blog or other source without permission. You also confirm that you have permission from anyone identifiable in a photo, recipe-card image or voice recording that you share with us.</p>
              <p className="mt-3">Recipe submissions are currently open to people aged 18 and over. Please do not submit personal information on behalf of a child.</p>
              <p className="mt-3">By ticking the submission licence box, you grant OPR a perpetual, worldwide, royalty-free licence to publish, edit, adapt and reproduce your submission in connection with OPR, including on the site, in print, film, social media, events and a future OPR restaurant. We will credit you in the way agreed with you.</p>
              <p className="mt-3">You can ask us to remove a published submission from the site. This will not affect material already printed, recorded or shared before removal was reasonably possible.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">2. Our editorial role</h2>
              <p className="mt-3">We may edit a contribution for length, clarity, spelling, format or safety, while respecting the substance of the contributor&apos;s story. We may decline or remove submissions that are unlawful, offensive, misleading, unsafe, infringe someone else&apos;s rights or do not fit OPR.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">3. Cooking safely</h2>
              <p className="mt-3">Recipes are shared by contributors and may not have been professionally tested. Check ingredients for allergens, use safe food-handling practices, adapt quantities to your circumstances and use your own judgement. OPR cannot guarantee that a recipe will be suitable for every dietary, medical or allergy requirement.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">4. Site content</h2>
              <p className="mt-3">OPR&apos;s name, design, text and original imagery belong to OPR or its licensors. Do not copy or reuse them without permission. You may share a link to a public OPR page.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">5. Liability</h2>
              <p className="mt-3">We work hard to keep the site useful and available, but it is provided on an “as is” basis. Nothing in these terms limits liability that cannot lawfully be limited or excluded. To the fullest extent allowed by law, we are not responsible for losses caused by relying on recipe content or by temporary interruption of the site.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">6. Privacy and changes</h2>
              <p className="mt-3">Our <a href="/privacy" className="underline underline-offset-4">Privacy Notice</a> explains how we use personal information. We may update these terms when OPR develops; the date at the top will show when they were last changed.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">7. Contact and governing law</h2>
              <p className="mt-3">Questions? Email <a className="underline underline-offset-4" href="mailto:chaten@otherpeoplesrecipes.co.uk">chaten@otherpeoplesrecipes.co.uk</a>. These terms are governed by the law of England and Wales.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
