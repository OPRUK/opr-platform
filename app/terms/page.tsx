import type { Metadata } from "next";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms covering use of the Other People's Recipes website and the licence you grant us when you submit a recipe.",
  alternates: { canonical: "/terms" },
};

function ReviewNotice() {
  return (
    <p className="mb-8 rounded-2xl border border-dashed border-[#B77938]/70 bg-[#F4DDAE]/60 px-5 py-4 text-sm leading-6 text-stone-700">
      <strong>[LEGAL REVIEW REQUIRED]</strong> This page is a working draft. It
      has not been reviewed by a solicitor and should not be relied upon until
      it has been. It is not legal advice.
    </p>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />

      <section className="bg-[#123C39] px-6 pb-20 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">
          Legal
        </p>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight md:text-6xl">
          Terms of Use
        </h1>
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-300">
          Last updated: [DATE — LEGAL REVIEW REQUIRED]
        </p>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          <ReviewNotice />

          <div className="space-y-9 leading-7 text-stone-700">
            <p>
              These terms cover use of otherpeoplesrecipes.co.uk (&quot;the
              site&quot;) and, in particular, what happens when you submit a
              recipe to Other People&apos;s Recipes (&quot;OPR&quot;,
              &quot;we&quot;, &quot;us&quot;).
            </p>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">1. Submitting a recipe</h2>
              <p className="mt-3">
                When you submit a recipe through the Share Your Recipe form,
                you&apos;ll be asked to agree to the following before you can
                submit:
              </p>

              <p className="mt-5 font-semibold text-[#123C39]">Required — licence to publish:</p>
              <blockquote className="mt-2 border-l-4 border-[#D1AD75] pl-5 italic">
                I confirm this recipe and story are mine to share, and I grant
                Other People&apos;s Recipes a perpetual, worldwide,
                royalty-free licence to publish, edit, adapt and reproduce
                them including in print, film, at OPR events and, if we
                ever open one, an OPR restaurant.
              </blockquote>

              <p className="mt-5">This means:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>You confirm you have the right to share the recipe, story and any images or audio you upload — for example, it&apos;s a family recipe you&apos;re entitled to pass on, not something copied from a cookbook, blog or other source without permission.</li>
                <li>You grant OPR an ongoing, worldwide, free-of-charge licence to publish your submission on the site and elsewhere (including print, film, events and social media), and to edit or adapt it — for length, clarity, or format — while keeping the substance of your story intact.</li>
                <li>OPR will credit you as agreed with you at the time of submission (for example, by first name and town, or however you&apos;d prefer to be identified).</li>
                <li>This licence continues even if you later ask us to stop contacting you, though you can always ask us to remove a specific submission from the site — see our <a href="/privacy" className="underline underline-offset-4">Privacy Policy</a>.</li>
              </ul>

              <p className="mt-5 font-semibold text-[#123C39]">Optional — marketing consent:</p>
              <blockquote className="mt-2 border-l-4 border-[#D1AD75] pl-5 italic">
                Keep me posted about OPR news and events.
              </blockquote>
              <p className="mt-3">
                This is separate from the licence above. Leaving it unticked
                means we won&apos;t send you marketing emails, but your recipe
                can still be published if you&apos;ve agreed to the licence.
              </p>

              <p className="mt-5">
                We record the version of this text and the date and time you
                agreed to it, alongside your submission, so there&apos;s a
                clear record of what was agreed.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">2. Accuracy of submissions</h2>
              <p className="mt-3">
                Recipes, stories and any accompanying detail (such as prep
                time, cook time or servings) are provided by contributors and
                reflect their own memory and family history. We do our best
                to present them faithfully but cannot guarantee accuracy, and
                OPR is not liable for any outcome from following a recipe
                published on the site.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">3. Acceptable use</h2>
              <p className="mt-3">
                You agree not to submit anything that is unlawful,
                defamatory, infringes someone else&apos;s rights, or that you
                don&apos;t have permission to share. We may decline to
                publish, or remove, any submission at our discretion.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">4. Intellectual property</h2>
              <p className="mt-3">
                Aside from the licence you grant us over your own submission,
                all other site content — design, branding, and OPR&apos;s own
                text and imagery — belongs to OPR or its licensors and may not
                be reproduced without permission.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">5. Liability</h2>
              <p className="mt-3">
                <strong>[LEGAL REVIEW REQUIRED — standard liability limitation and disclaimer language to be drafted/reviewed by a solicitor.]</strong>{" "}
                The site is provided &quot;as is&quot;. To the extent
                permitted by law, OPR is not liable for any loss arising from
                use of the site or reliance on its content.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">6. Governing law</h2>
              <p className="mt-3">
                <strong>[LEGAL REVIEW REQUIRED — confirm.]</strong> These
                terms are governed by the law of England and Wales.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">7. Changes to these terms</h2>
              <p className="mt-3">
                We may update these terms from time to time. The date at the
                top shows when they were last revised. Continued use of the
                site, or future submissions, means you accept the current
                version.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">8. Contact</h2>
              <p className="mt-3">
                Questions about these terms: [CONTACT EMAIL — TO BE CONFIRMED].
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
