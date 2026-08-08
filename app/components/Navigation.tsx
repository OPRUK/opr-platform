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
    <header className="absolute top-0 left-0 z-50 w-full border-b border-[#DDB765]/45 bg-[#1C0B18]/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <Link
          href="/"
          className="font-display max-w-[10rem] text-3xl font-semibold leading-[0.92] tracking-[-0.02em] text-[#F4E8CE] transition hover:text-[#D7AD5C]"
        >
          Other People&apos;s Recipes
        </Link>

        <ul className="hidden gap-9 text-sm font-semibold uppercase tracking-[0.17em] md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[#E8C66F] transition hover:text-[#F4E8CE]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-sm px-3 py-2 text-2xl leading-none text-[#F4E8CE] transition hover:bg-[#3A1B31] md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-[#DDB765]/35 bg-[#1C0B18] px-8 py-5 md:hidden">
          <ul className="space-y-4 text-base font-medium uppercase tracking-[0.15em]">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-[#E8C66F] transition hover:text-[#F4E8CE]"
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
