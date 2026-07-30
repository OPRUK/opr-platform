import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#33291F] px-6 py-16 text-[#FFF3DF]">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-2xl font-bold tracking-wide">Other People&apos;s Recipes</p>
          <p className="mt-5 max-w-sm leading-7 text-[#E7CEA2]">
            Preserving recipes. Celebrating people. Sharing stories around the
            table.
          </p>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#DDB765]">
            Explore
          </p>
          <ul className="mt-5 space-y-3 text-[#FFF3DF]">
            <li><Link href="/" className="transition hover:text-[#DDB765]">Home</Link></li>
            <li><Link href="/our-story" className="transition hover:text-[#DDB765]">Your Story</Link></li>
            <li><Link href="/founder" className="transition hover:text-[#DDB765]">Founder</Link></li>
            <li><Link href="/family-cookbook" className="transition hover:text-[#DDB765]">Family Cookbook</Link></li>
            <li><Link href="/films" className="transition hover:text-[#DDB765]">Films</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#DDB765]">
            Get involved
          </p>
          <ul className="mt-5 space-y-3 text-[#FFF3DF]">
            <li><Link href="/share" className="transition hover:text-[#DDB765]">Share your recipe</Link></li>
            <li><a href="mailto:info@otherpeoplesrecipes.co.uk" className="transition hover:text-[#DDB765]">Contact OPR</a></li>
            <li className="flex items-center gap-4 pt-2">
              <a
                href="https://www.instagram.com/opr_uk/"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Other People's Recipes on Instagram"
                className="rounded-full border border-[#8B6B42] p-2.5 text-[#FFF3DF] transition hover:-translate-y-0.5 hover:border-[#DDB765] hover:bg-[#DDB765] hover:text-[#33291F]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.4" cy="6.7" r="1" className="fill-current stroke-none" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/61592736388045"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Other People's Recipes on Facebook"
                className="rounded-full border border-[#8B6B42] p-2.5 text-[#FFF3DF] transition hover:-translate-y-0.5 hover:border-[#DDB765] hover:bg-[#DDB765] hover:text-[#33291F]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M13.7 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.6 1.7-1.6H17V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.8V13h2.7v8h3.2Z" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-6xl border-t border-[#6E4B2C] pt-6 text-sm text-[#DABF8D]">
        © {new Date().getFullYear()}{" "}Other People&apos;s Recipes. Every recipe has a story.
      </div>
    </footer>
  );
}
