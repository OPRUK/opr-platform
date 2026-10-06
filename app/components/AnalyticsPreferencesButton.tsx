"use client";

import { openAnalyticsPreferences } from "./GoogleAnalytics";

export default function AnalyticsPreferencesButton() {
  return (
    <button
      type="button"
      onClick={openAnalyticsPreferences}
      className="rounded-full bg-[#123C39] px-5 py-3 text-sm font-bold text-[#FFF3DF] transition hover:bg-[#1C5A50]"
    >
      Manage analytics preferences
    </button>
  );
}
