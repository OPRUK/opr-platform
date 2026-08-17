"use client";

import { useEffect } from "react";
import { storeAttribution } from "../../lib/attribution-client";

// Reads window.location directly instead of next/navigation's
// useSearchParams() — this only needs the URL once on mount, not
// reactively, and useSearchParams() pulls in Next's client-side search-params
// router machinery (~220 KiB shared chunk) for every page in the site since
// this renders in the root layout. That chunk showed up as the single
// biggest contributor to PageSpeed's long-main-thread-task findings.
export default function AttributionCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    storeAttribution({
      src: params.get("src"),
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
    });
  }, []);

  return null;
}
