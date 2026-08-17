import Link from "next/link";
import Navigation from "../../../components/Navigation";

export default function CommunityRecipeNotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />
      <section className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-display text-4xl font-bold">This page is not available.</h1>
          <Link href="/family-cookbook" className="mt-8 inline-block rounded-full bg-[#123C39] px-6 py-3 text-white">Return to the Cookbook</Link>
        </div>
      </section>
    </main>
  );
}
