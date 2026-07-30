"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/our-story", label: "Your Story" },
    { href: "/founder", label: "Founder" },
    { href: "/family-cookbook", label: "Cookbook" },
    { href: "/films", label: "Films" },
    { href: "/founding-table", label: "Founding Table" },
    { href: "/share", label: "Share" },
  ];

  return (
    <header className="absolute top-0 left-0 z-50 w-full border-b border-[#D1AD75]/70 bg-[#FFF3DF]/95 shadow-sm shadow-[#6E4B2C]/10 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <Link
          href="/"
          className="text-xl font-bold tracking-wide text-[#4A4232] transition hover:text-[#9A622A]"
        >
          Other People&apos;s Recipes
        </Link>

        <ul className="hidden gap-8 text-sm font-medium md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[#4A4232] transition hover:text-[#9A622A]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg px-3 py-2 text-2xl leading-none text-[#4A4232] transition hover:bg-[#F4DDAE] md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-[#D1AD75]/70 bg-[#FFF3DF] px-8 py-5 md:hidden">
          <ul className="space-y-4 text-base font-medium">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-[#4A4232] transition hover:text-[#9A622A]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
