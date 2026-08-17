"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AccessibilityControls from "./AccessibilityControls";

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
    <header className="absolute top-0 left-0 z-50 w-full border-b border-[#D1AD75]/70 bg-[#FFF3DF]/95 shadow-sm shadow-[#1C5A50]/10 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <Link
          href="/"
          aria-label="Other People's Recipes home"
          className="font-brand flex shrink-0 items-center gap-2.5 text-2xl font-semibold leading-none tracking-[0.01em] text-[#123C39] transition hover:text-[#75451F] sm:gap-3 sm:text-3xl"
        >
          <Image
            src="/images/social/opr-pinterest-profile.png"
            alt=""
            width={44}
            height={44}
            priority
            className="h-9 w-9 rounded-full sm:h-11 sm:w-11"
          />
          <span className="sm:hidden" aria-hidden="true">OPR</span>
          <span className="hidden sm:inline">Other People&apos;s Recipes<sup aria-hidden="true" className="ml-0.5 align-super text-[0.35em]">™</sup></span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ul className="hidden gap-6 text-sm font-medium lg:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[#123C39] transition hover:text-[#9A622A] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#9A622A]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <AccessibilityControls />

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="min-h-11 min-w-11 rounded-lg px-3 py-2 text-2xl leading-none text-[#123C39] transition hover:bg-[#F4DDAE] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#9A622A] lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-[#D1AD75]/70 bg-[#FFF3DF] px-8 py-5 lg:hidden">
          <ul className="space-y-4 text-base font-medium">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-[#123C39] transition hover:text-[#9A622A]"
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
