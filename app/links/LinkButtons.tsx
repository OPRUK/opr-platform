"use client";

import Link from "next/link";

type LinkKey =
  | "share"
  | "family-cookbook"
  | "founding-table"
  | "recipe-of-month"
  | "films"
  | "contact"
  | "instagram"
  | "facebook"
  | "pinterest"
  | "youtube"
  | "tiktok";

function logClick(key: LinkKey) {
  try {
    const body = new Blob([JSON.stringify({ key })], { type: "application/json" });
    navigator.sendBeacon("/api/links/click", body);
  } catch {
    // A missed click log should never stop someone getting where they're going.
  }
}

const primaryLinks: Array<{ key: LinkKey; label: string; href: string; external?: boolean }> = [
  { key: "share", label: "Share your family recipe", href: "/share" },
  { key: "family-cookbook", label: "Explore the Living Cookbook", href: "/family-cookbook" },
  { key: "founding-table", label: "Join Our Table", href: "/join-our-table" },
  { key: "recipe-of-month", label: "Recipe of the Month", href: "/app/vote" },
  { key: "films", label: "Watch OPR films", href: "/films" },
  { key: "contact", label: "Contact OPR", href: "mailto:info@otherpeoplesrecipes.co.uk", external: true },
];

const socialLinks: Array<{ key: LinkKey; label: string; href: string; icon: React.ReactNode }> = [
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/opr_uk/",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/otherpeoplesrecipesuk/",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="19" r="2.5" />
        <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
      </svg>
    ),
  },
  {
    key: "pinterest",
    label: "Pinterest",
    href: "https://www.pinterest.com/otherpeoplesrecipes/",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s7-7.7 7-12.5A7 7 0 0 0 5 8.5C5 13.3 12 21 12 21Z" />
        <circle cx="12" cy="8.5" r="2.3" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCdRQdldwQPFPoMr5N-FwIkQ",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5.5" width="18" height="13" rx="4" />
        <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@opr_uk",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M14 4c.3 2.3 2 4 4.5 4.2" />
      </svg>
    ),
  },
];

export default function LinkButtons() {
  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col gap-3">
        {primaryLinks.map((link) =>
          link.external ? (
            <a
              key={link.key}
              href={link.href}
              onClick={() => logClick(link.key)}
              className="min-h-14 rounded-2xl border border-[#D1AD75] bg-[#FFF3DF] px-6 py-4 text-center text-lg font-medium text-[#123C39] shadow-sm transition hover:-translate-y-0.5 hover:border-[#123C39] hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#9A622A]"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => logClick(link.key)}
              className="min-h-14 rounded-2xl border border-[#D1AD75] bg-[#FFF3DF] px-6 py-4 text-center text-lg font-medium text-[#123C39] shadow-sm transition hover:-translate-y-0.5 hover:border-[#123C39] hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#9A622A]"
            >
              {link.label}
            </Link>
          ),
        )}
      </div>

      <div className="mt-8 flex justify-center gap-3" role="group" aria-label="Follow OPR on social media">
        {socialLinks.map((social) => (
          <a
            key={social.key}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => logClick(social.key)}
            aria-label={social.label}
            title={social.label}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D1AD75] bg-[#FFF3DF] text-[#123C39] shadow-sm transition hover:-translate-y-0.5 hover:border-[#123C39] hover:bg-[#123C39] hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#9A622A]"
          >
            {social.icon}
          </a>
        ))}
      </div>
    </div>
  );
}
