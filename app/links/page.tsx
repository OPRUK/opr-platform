import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "../../lib/metadata";
import LinkButtons from "./LinkButtons";

export const metadata: Metadata = buildMetadata({
  title: "Links",
  description: "Every way to explore Other People's Recipes — share a recipe, browse the Family Cookbook, join the Founding Table and more.",
  path: "/links",
});

export default function LinksPage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen flex-col items-center bg-[#EED8B2] px-6 py-14 text-[#123C39]">
      <Link href="/" className="font-brand text-3xl font-semibold leading-none tracking-[0.01em]">
        Other People&apos;s Recipes<sup aria-hidden="true" className="ml-0.5 align-super text-[0.3em]">™</sup>
      </Link>
      <p className="mt-3 text-center text-sm uppercase tracking-[0.3em] text-amber-700">
        Every Recipe has a Story
      </p>

      <div className="mt-10">
        <LinkButtons />
      </div>

      <p className="mt-12 text-center text-xs text-[#6B431E]">
        <Link href="/" className="underline underline-offset-4">
          Visit the full website
        </Link>
      </p>
    </main>
  );
}
