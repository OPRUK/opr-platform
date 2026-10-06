import "client-only";

import type { AnalyticsEventKey } from "./attribution";

export const GOOGLE_ANALYTICS_MEASUREMENT_ID = "G-KRYXGNPZES";
export const GOOGLE_ANALYTICS_CONSENT_KEY = "opr-google-analytics-consent-v1";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export function hasGoogleAnalyticsConsent() {
  return window.localStorage.getItem(GOOGLE_ANALYTICS_CONSENT_KEY) === "accepted";
}

// Send only the fixed OPR event name and a same-origin pathname. This keeps
// form values, names, email addresses and raw UTM strings out of GA4.
export function sendGoogleAnalyticsEvent(eventKey: AnalyticsEventKey, destination: string) {
  if (!hasGoogleAnalyticsConsent() || !window.gtag) return;

  try {
    const destinationPath = new URL(destination, window.location.origin).pathname;
    window.gtag("event", eventKey, { destination_path: destinationPath });
  } catch {
    // Analytics must never interrupt a visitor action.
  }
}
