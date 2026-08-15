import type { Metadata } from "next";
import Navigation from "../components/Navigation";
import { buildMetadata } from "../../lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Use",
  description: "Terms covering use of Other People's Recipes and recipe submissions.",
  path: "/terms",
});

const effectiveDate = "5 August 2026";

export default function TermsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />
      <section className="bg-[#123C39] px-6 pb-20 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">Legal</p>
        <h1 className="font-display mx-auto max-w-3xl text-5xl font-bold leading-tight md:text-6xl">Terms of Use</h1>
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-300">Effective from: {effectiveDate}</p>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          <div className="space-y-9 leading-7 text-stone-700">
            <p>These terms apply to <strong>otherpeoplesrecipes.co.uk</strong> (the “site”). The site is operated by <strong>OTHER PEOPLES RECIPES LTD</strong>, company number 17370145 (“OPR”, “we”, “us”). By using the site or submitting content, you agree to these terms.</p>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">1. Using OPR</h2>
              <p className="mt-3">OPR is a home for real recipes and the stories behind them. Please use the site lawfully, respectfully and only for its intended purpose. Do not interfere with the site, attempt to access information you are not authorised to access, or use the site in a way that could harm OPR or other people.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">2. Submitting a recipe or community contribution</h2>
              <p className="mt-3">When you submit a recipe, story, image, audio, “Meet the cook” photo, or a note about making someone else&apos;s recipe, you confirm that you have the right to share it. Do not submit material copied from a cookbook, blog or another source unless you have permission.</p>
              <p className="mt-3">You also confirm that you have permission from anyone identifiable in a photo, recipe-card image or voice recording you share. Recipe submissions are currently open only to people aged 18 and over.</p>
              <p className="mt-3">By ticking the contributor confirmation on the submission form, you grant OPR a perpetual, worldwide, royalty-free, non-exclusive licence to publish, edit, adapt and reproduce your submission in connection with OPR, including on the site, in print, film, social media, events and a future OPR restaurant. We will credit you as agreed where reasonably practical.</p>
              <p className="mt-3">You may ask us to remove a published submission from the site. Removal will not affect material already printed, recorded, shared or otherwise used before removal was reasonably possible.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">3. Our editorial role</h2>
              <p className="mt-3">We may edit a contribution for length, clarity, spelling, format, accessibility or safety while respecting the substance of the contributor&apos;s story. We may decline, hide or remove content that is unlawful, offensive, misleading, unsafe, infringes someone else&apos;s rights or does not fit OPR.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">4. Cooking, allergies and health</h2>
              <p className="mt-3">Recipes are shared by contributors and may not have been professionally tested. Check ingredients and allergen information, follow safe food-handling practices, adapt quantities to your circumstances and use your own judgement. OPR cannot guarantee that a recipe will be suitable for every dietary, medical or allergy requirement. If you have an allergy, medical condition or dietary concern, take appropriate professional advice before cooking or eating a dish.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">5. OPR content and links</h2>
              <p className="mt-3">OPR&apos;s name, logo, design, original text, films and imagery belong to OPR or its licensors. You may share links to public OPR pages, but you must not copy, reproduce or commercially exploit OPR content without our permission.</p>
              <p className="mt-3">The site may link to third-party services such as social-media platforms. We do not control those services and are not responsible for their content, availability or privacy practices.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">6. Availability and liability</h2>
              <p className="mt-3">We work to keep OPR useful, accurate and available, but the site is provided on an “as is” and “as available” basis. We may change, pause or withdraw parts of it as OPR develops.</p>
              <p className="mt-3">Nothing in these terms excludes or limits liability that cannot lawfully be excluded or limited, including liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation. Subject to that, we are not responsible for losses arising from reliance on contributor recipe content or from temporary interruption of the site. Nothing in these terms affects any statutory rights you may have as a consumer.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">7. Privacy and changes</h2>
              <p className="mt-3">Our <a href="/privacy" className="underline underline-offset-4">Privacy Notice</a> and <a href="/cookies" className="underline underline-offset-4">Cookie Notice</a> explain how we use personal information and cookies. We may update these terms as OPR develops or when the law changes. The effective date at the top tells you when they were last updated.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">8. Contact and governing law</h2>
              <p className="mt-3">Questions? Email <a className="underline underline-offset-4" href="mailto:info@otherpeoplesrecipes.co.uk">info@otherpeoplesrecipes.co.uk</a> or write to us at 1a Bazalgette Close, New Malden, KT3 5HG. These terms are governed by the law of England and Wales. The courts of England and Wales will have non-exclusive jurisdiction, except where consumer law gives you the right to bring proceedings elsewhere.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
