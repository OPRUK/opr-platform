import type { Metadata } from "next";
import Navigation from "../components/Navigation";
import { buildMetadata } from "../../lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Notice",
  description: "How Other People's Recipes collects, uses and protects the information you share with us.",
  path: "/privacy",
});

const effectiveDate = "5 August 2026";

export default function PrivacyPolicyPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />
      <section className="bg-[#123C39] px-6 pb-20 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">Legal</p>
        <h1 className="font-display mx-auto max-w-3xl text-5xl font-bold leading-tight md:text-6xl">Privacy Notice</h1>
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-300">Effective from: {effectiveDate}</p>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          <div className="space-y-9 leading-7 text-stone-700">
            <p>
              This notice explains how <strong>OTHER PEOPLES RECIPES LTD</strong> (company number 17370145, “OPR”, “we”, “us”) uses personal information when you visit <strong>otherpeoplesrecipes.co.uk</strong>, share a recipe, join our table or contact us.
            </p>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">1. Who is responsible for your information?</h2>
              <p className="mt-3">OPR is the controller of the personal information described in this notice. For privacy questions, requests or concerns, email <a className="underline underline-offset-4" href="mailto:info@otherpeoplesrecipes.co.uk">info@otherpeoplesrecipes.co.uk</a> or write to us at 1a Bazalgette Close, New Malden, KT3 5HG.</p>
              <p className="mt-3">Our UK data-protection registration reference is <strong>ZC211828</strong>, issued by the Information Commissioner&apos;s Office (ICO).</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">2. Information we collect</h2>
              <p className="mt-3">We collect information you choose to give us. Depending on how you use OPR, this may include:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>your name, email address and town or region;</li>
                <li>the recipe, ingredients, method, notes and story or memory you share;</li>
                <li>photos of a finished dish, a contributor, or an original handwritten recipe card, plus any optional audio you provide;</li>
                <li>comments, photos or notes you share after cooking another family&apos;s recipe;</li>
                <li>your table-signup details and marketing choices; and</li>
                <li>limited, aggregated information about how people use the website.</li>
              </ul>
              <p className="mt-3">Please do not include someone else&apos;s private information unless you have their permission to share it. Recipe submissions are currently for adults aged 18 and over. We do not knowingly collect recipe submissions from children.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">3. How we use information and our legal bases</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong>To receive, assess, administer and contact you about a recipe submission or enquiry:</strong> this is necessary for our legitimate interests in operating OPR and responding to people who choose to contact us.</li>
                <li><strong>To publish and celebrate a recipe, story, image or audio:</strong> we do this where you have submitted it and granted the contributor licence shown on the submission form.</li>
                <li><strong>To send OPR news, events and invitations:</strong> we rely on your consent. You can withdraw it at any time by using the unsubscribe link in an email or contacting us.</li>
                <li><strong>To keep the site secure, working and useful:</strong> we rely on our legitimate interests in running, protecting and improving OPR.</li>
              </ul>
              <p className="mt-3">You are not required by law to provide personal information. However, we need the contact and recipe details marked as required on a form in order to process that submission or request.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">4. Optional AI recipe reader</h2>
              <p className="mt-3">If you select “Read my recipe with AI”, we send the image you choose to our AI provider, OpenAI, solely to create an editable draft of the title, ingredients and method. This processing happens at your request. You remain responsible for checking and correcting the draft before you submit it. The tool does not make decisions about you and does not automatically publish anything.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">5. Who we share information with</h2>
              <p className="mt-3">We use carefully selected service providers to help run OPR:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Vercel, which hosts the website and provides privacy-focused website analytics;</li>
                <li>Supabase, which provides our database, secure form processing and file storage;</li>
                <li>Resend, which delivers OPR emails and manages unsubscribe requests; and</li>
                <li>OpenAI, only when you choose to use the optional recipe-card transcription helper.</li>
              </ul>
              <p className="mt-3">We require providers to handle personal information securely and only for the services they provide to us. Some providers may process information outside the UK. Where they do, we use appropriate transfer safeguards, such as an adequacy regulation or approved contractual safeguards. You can ask us for more information. We do not sell personal information.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">6. How long we keep information</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Published recipes and their accompanying stories are kept in the living OPR archive unless we agree to remove them.</li>
                <li>Unpublished recipe submissions are normally deleted within 24 months, unless we need to keep them longer to resolve a query, protect legal rights or meet a legal obligation.</li>
                <li>Table-signup and marketing details are kept until you unsubscribe or ask us to remove them.</li>
                <li>We retain a minimal suppression record after an unsubscribe where necessary to make sure we honour that choice.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">7. Your rights</h2>
              <p className="mt-3">Subject to the UK GDPR, you can ask us to access, correct, erase, restrict or transfer your personal information. You can object at any time to processing based on our legitimate interests, and you can object to direct marketing at any time. Where we rely on consent, you can withdraw it at any time without affecting the lawfulness of processing before you withdrew it.</p>
              <p className="mt-3">To exercise a right, email <a className="underline underline-offset-4" href="mailto:info@otherpeoplesrecipes.co.uk">info@otherpeoplesrecipes.co.uk</a>. We may need to confirm your identity before acting on a request.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">8. Security and complaints</h2>
              <p className="mt-3">We use appropriate technical and organisational measures designed to protect the information we hold. No online service can promise absolute security, so please take care when choosing what to submit.</p>
              <p className="mt-3">Please contact us first so we can try to help. You can also complain to the ICO at <a className="underline underline-offset-4" href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noreferrer">ico.org.uk/make-a-complaint</a> or on 0303 123 1113.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">9. Cookies and changes to this notice</h2>
              <p className="mt-3">OPR uses Vercel Web Analytics to understand aggregated page visits. It does not use advertising, marketing or cross-site tracking cookies. Read our <a className="underline underline-offset-4" href="/cookies">Cookie Notice</a> for more information.</p>
              <p className="mt-3">We may update this notice when our services or legal obligations change. The effective date at the top tells you when it was last updated.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
