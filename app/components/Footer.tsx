import Link from "next/link";
import FooterFoundingTableForm from "./FooterFoundingTableForm";

export default function Footer() {
  return (
    <footer className="bg-[#08231F] px-6 py-16 text-[#FFF3DF]">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-brand text-4xl font-semibold leading-none tracking-[0.01em]">
            Other People&apos;s Recipes<sup aria-hidden="true" className="ml-0.5 align-super text-[0.3em]">™</sup>
          </p>
          <p className="mt-5 max-w-sm leading-7 text-[#E7CEA2]">
            Preserving recipes. Celebrating people. Sharing stories around the
            table.
          </p>
          <FooterFoundingTableForm />
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#DDB765]">
            Explore
          </p>
          <ul className="mt-5 space-y-3 text-[#FFF3DF]">
            <li><Link href="/" className="transition hover:text-[#DDB765]">Home</Link></li>
            <li><Link href="/founder" className="transition hover:text-[#DDB765]">Founder</Link></li>
            <li><Link href="/family-cookbook" className="transition hover:text-[#DDB765]">Living Cookbook</Link></li>
            <li><Link href="/films" className="transition hover:text-[#DDB765]">Films</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#DDB765]">
            Get involved
          </p>
          <ul className="mt-5 space-y-3 text-[#FFF3DF]">
            <li><Link href="/share" className="transition hover:text-[#DDB765]">Share your recipe</Link></li>
            <li><Link href="/founding-table" className="transition hover:text-[#DDB765]">Join Our Table</Link></li>
            <li><a href="mailto:info@otherpeoplesrecipes.co.uk" className="transition hover:text-[#DDB765]">Contact OPR</a></li>
            <li className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="https://www.instagram.com/opr_uk/"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Other People's Recipes on Instagram"
                className="rounded-full border border-[#8B6B42] p-2.5 text-[#FFF3DF] transition hover:-translate-y-0.5 hover:border-[#DDB765] hover:bg-[#DDB765] hover:text-[#08231F]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.4" cy="6.7" r="1" className="fill-current stroke-none" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/otherpeoplesrecipesuk/"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Other People's Recipes on Facebook"
                className="rounded-full border border-[#8B6B42] p-2.5 text-[#FFF3DF] transition hover:-translate-y-0.5 hover:border-[#DDB765] hover:bg-[#DDB765] hover:text-[#08231F]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M13.7 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.6 1.7-1.6H17V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.8V13h2.7v8h3.2Z" />
                </svg>
              </a>
              <a
                href="https://www.pinterest.com/otherpeoplesrecipes/"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Other People's Recipes on Pinterest"
                className="rounded-full border border-[#8B6B42] p-2.5 text-[#FFF3DF] transition hover:-translate-y-0.5 hover:border-[#DDB765] hover:bg-[#DDB765] hover:text-[#08231F]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M12 2.2a9.8 9.8 0 0 0-3.6 18.9c-.1-1.6 0-3.5.4-5.2l1.1-4.6s-.3-.7-.3-1.8c0-1.7 1-3 2.2-3 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1.1 4-.3 1.2.6 2.1 1.8 2.1 2.2 0 3.7-2.8 3.7-6.1 0-2.5-1.7-4.3-4.8-4.3-3.5 0-5.6 2.6-5.6 5.5 0 1 .3 1.8.9 2.4.2.2.2.3.1.6l-.3 1.1c-.1.4-.4.5-.7.4-2-.8-2.9-3-2.9-5.4 0-4 3.3-8.8 9.8-8.8 5.2 0 8.6 3.8 8.6 7.8 0 5.3-2.9 9.3-7.2 9.3-1.4 0-2.8-.8-3.2-1.6l-.9 3.4c-.3 1.3-1 2.7-1.6 3.7.9.3 1.9.5 2.9.5A9.8 9.8 0 0 0 12 2.2Z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/channel/UCdRQdldwQPFPoMr5N-FwIkQ"
                target="_blank"
                rel="noreferrer"
                aria-label="Watch Other People's Recipes on YouTube"
                className="rounded-full border border-[#8B6B42] p-2.5 text-[#FFF3DF] transition hover:-translate-y-0.5 hover:border-[#DDB765] hover:bg-[#DDB765] hover:text-[#08231F]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M21.6 7.1a2.95 2.95 0 0 0-2.1-2.1C17.6 4.5 12 4.5 12 4.5s-5.6 0-7.5.5A2.95 2.95 0 0 0 2.4 7.1C1.9 9 1.9 12 1.9 12s0 3 .5 4.9A2.95 2.95 0 0 0 4.5 19c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a2.95 2.95 0 0 0 2.1-2.1c.5-1.9.5-4.9.5-4.9s0-3-.5-4.9ZM10 15.5v-7l6 3.5-6 3.5Z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@opr_uk"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Other People's Recipes on TikTok"
                className="rounded-full border border-[#8B6B42] p-2.5 text-[#FFF3DF] transition hover:-translate-y-0.5 hover:border-[#DDB765] hover:bg-[#DDB765] hover:text-[#08231F]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M16.7 3c.4 2.7 1.9 4.3 4.3 4.5v3.1c-1.6.1-3-.4-4.2-1.2v6.8c0 4.3-4.7 6.8-8.2 4.6-2.1-1.3-2.9-4.3-1.8-6.6 1.1-2.3 3.9-3.3 6.2-2.4v3.2c-.9-.4-2-.1-2.5.7-.5.8-.3 1.9.5 2.5 1 .8 2.7.1 2.7-1.3V3h3Z" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-3 border-t border-[#1C5A50] pt-6 text-sm text-[#DABF8D] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p>© {new Date().getFullYear()} Other People&apos;s Recipes. Every Recipe has a Story.</p>
          <p className="mt-2 max-w-xl text-xs leading-5 text-[#BFA77B]">
            Other People&apos;s Recipes™ and OPR™ are trade marks of OTHER PEOPLES
            RECIPES LTD. UK trade mark applications pending.
          </p>
        </div>
        <p className="flex flex-wrap gap-4">
          <Link href="/accessibility" className="transition hover:text-[#DDB765]">Accessibility</Link>
          <Link href="/privacy" className="transition hover:text-[#DDB765]">Privacy Policy</Link>
          <Link href="/cookies" className="transition hover:text-[#DDB765]">Cookies</Link>
          <Link href="/terms" className="transition hover:text-[#DDB765]">Terms of Use</Link>
        </p>
      </div>
    </footer>
  );
}
