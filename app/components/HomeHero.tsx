import type { ReactNode } from "react";
import Image from "next/image";

export default function HomeHero({ children }: { children: ReactNode }) {
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#123C39]">
      <Image
        src="/images/hero-kitchen-wide.webp"
        alt="The Other People's Recipes kitchen table"
        fill
        sizes="100vw"
        preload
        className="absolute inset-0 object-cover"
      />
      <div className="absolute inset-0 z-[1] bg-[#08231F]/35" />
      <div className="home-hero-copy relative z-10">{children}</div>
    </section>
  );
}
