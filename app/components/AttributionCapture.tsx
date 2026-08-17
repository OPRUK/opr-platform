"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { storeAttribution } from "../../lib/attribution-client";

export default function AttributionCapture() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams(queryString);
    storeAttribution({
      src: params.get("src"),
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
    });
  }, [queryString]);

  return null;
}
