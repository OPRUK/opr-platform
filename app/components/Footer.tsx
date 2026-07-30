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
            <li><Link href="/our-story" className="transition hover:text-[#DDB765]">Our Story</Link></li>
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
            <li>
              <a
                href="https://www.instagram.com/opr_uk/"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-[#DDB765]"
              >
                Instagram · @opr_uk
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/61592736388045"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-[#DDB765]"
              >
                Facebook · Other People&apos;s Recipes
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
