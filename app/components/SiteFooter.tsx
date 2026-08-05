"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

/** Keeps the public footer identical on every public OPR page. */
export default function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/app")) {
    return null;
  }

  return <Footer />;
}
