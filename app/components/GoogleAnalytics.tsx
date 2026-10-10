"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  GOOGLE_ANALYTICS_CONSENT_KEY,
  GOOGLE_ANALYTICS_MEASUREMENT_ID,
} from "../../lib/google-analytics-client";

const MEASUREMENT_ID = GOOGLE_ANALYTICS_MEASUREMENT_ID;
const CONSENT_KEY = GOOGLE_ANALYTICS_CONSENT_KEY;
type ConsentChoice = "accepted" | "rejected";
const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;

  try {
    const storedValue = window.localStorage.getItem(CONSENT_KEY);
    return storedValue === "accepted" || storedValue === "rejected" ? storedValue : null;
  } catch {
    return null;
  }
}

function enableGoogleAnalytics() {
  window[`ga-disable-${MEASUREMENT_ID}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);

  if (document.querySelector(`script[data-opr-google-analytics="${MEASUREMENT_ID}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  script.dataset.oprGoogleAnalytics = MEASUREMENT_ID;
  document.head.appendChild(script);
}

function disableGoogleAnalytics() {
  window[`ga-disable-${MEASUREMENT_ID}`] = true;
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.trim().split("=")[0];
    if (name === "_ga" || name.startsWith("_ga_")) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${window.location.hostname}; SameSite=Lax`;
    }
  });
}

export function openAnalyticsPreferences() {
  window.dispatchEvent(new Event("opr:open-analytics-preferences"));
}

export default function GoogleAnalytics() {
  const hydrated = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const [consent, setConsent] = useState<ConsentChoice | null>(getStoredConsent);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    if (consent === "accepted") enableGoogleAnalytics();
  }, [consent]);

  useEffect(() => {
    const openPreferences = () => setShowPreferences(true);
    window.addEventListener("opr:open-analytics-preferences", openPreferences);
    return () => window.removeEventListener("opr:open-analytics-preferences", openPreferences);
  }, []);

  if (!hydrated || (!showPreferences && consent)) return null;

  function saveConsent(choice: ConsentChoice) {
    try {
      window.localStorage.setItem(CONSENT_KEY, choice);
    } catch {
      // Keep the choice for this visit if the browser cannot persist it.
    }

    try {
      if (choice === "accepted") {
        enableGoogleAnalytics();
      } else {
        disableGoogleAnalytics();
      }
    } finally {
      setConsent(choice);
      setShowPreferences(false);
    }
  }

  return (
    <aside
      aria-label="Analytics preferences"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl rounded-3xl border border-[#DDB765] bg-[#123C39] p-6 text-[#FFF3DF] shadow-2xl md:bottom-6"
    >
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#DDB765]">Your privacy</p>
      <h2 className="mt-2 text-2xl font-bold">Help us understand what is useful</h2>
      <p className="mt-3 text-sm leading-6 text-[#FFF3DF]/90">
        With your permission, OPR uses Google Analytics to understand how people use the website. We do not use it for advertising or cross-site tracking.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => saveConsent("accepted")}
          className="rounded-full bg-[#DDB765] px-5 py-3 text-sm font-bold text-[#123C39] transition hover:bg-[#FFF3DF]"
        >
          Accept analytics
        </button>
        <button
          type="button"
          onClick={() => saveConsent("rejected")}
          className="rounded-full border border-[#FFF3DF]/70 px-5 py-3 text-sm font-bold text-[#FFF3DF] transition hover:bg-white/10"
        >
          Keep essential only
        </button>
      </div>
    </aside>
  );
}
