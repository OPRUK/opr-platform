"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

/** Keeps the public footer identical on every public OPR page. */
export default function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <Footer />;
}
