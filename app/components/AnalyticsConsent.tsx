"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CONSENT_KEY, readChoice, startGoogleAnalytics, stopGoogleAnalytics, type AnalyticsChoice } from "../../lib/analytics-consent";

const CHANGE_EVENT = "opr-analytics-choice";
let sessionChoice: AnalyticsChoice | null = null;
function snapshot() {
  try { return readChoice(localStorage.getItem(CONSENT_KEY)) ?? sessionChoice; }
  catch { return sessionChoice; }
}
function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(CHANGE_EVENT, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(CHANGE_EVENT, notify);
  };
}
const serverSnapshot = () => null;

export default function AnalyticsConsent() {
  const choice = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (choice === "accepted") startGoogleAnalytics(window, document);
    else {
      const loaded = Boolean(document.getElementById("opr-google-analytics"));
      stopGoogleAnalytics(window, document);
      // Remove Google's in-memory listeners as well as its cookies after withdrawal.
      if (loaded) window.location.reload();
    }
  }, [choice]);

  function choose(next: AnalyticsChoice) {
    sessionChoice = next;
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: 1, choice: next, savedAt: Date.now() }));
      sessionChoice = null;
    } catch { /* Honour the choice for this page even when browser storage is blocked. */ }
    if (next === "rejected") stopGoogleAnalytics(window, document);
    setSettingsOpen(false);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <>
      <div className="bg-[#08231F] px-6 py-3 text-center text-sm text-[#FFF3DF]">
        <button type="button" onClick={() => setSettingsOpen((open) => !open)} aria-expanded={settingsOpen || choice === null} aria-controls="opr-cookie-settings" className="min-h-11 rounded px-3 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DDB765]">Cookie settings</button>
      </div>
      {(choice === null || settingsOpen) && (
        <section id="opr-cookie-settings" aria-labelledby="opr-cookie-title" className="fixed inset-x-0 bottom-0 z-[100] max-h-[85dvh] overflow-y-auto border-t-2 border-[#DDB765] bg-[#FFF3DF] px-6 py-5 text-[#123C39] shadow-2xl">
          <div className="mx-auto max-w-5xl">
            <h2 id="opr-cookie-title" className="text-xl font-bold">Your cookie choice</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6">We use essential storage to keep the site working. With your permission, Google Analytics uses cookies to help us understand visits and improve OPR. You can reject analytics and still use the whole site. Change your choice at any time using Cookie settings.</p>
            <p className="mt-2 text-sm"><a href="/cookies" className="underline underline-offset-4">Cookie Notice</a> · <a href="/privacy" className="underline underline-offset-4">Privacy Notice</a>{choice && <span> · Analytics currently {choice === "accepted" ? "on" : "off"}</span>}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => choose("accepted")} className="min-h-11 rounded-lg border-2 border-[#123C39] bg-[#123C39] px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#123C39]">Accept analytics</button>
              <button type="button" onClick={() => choose("rejected")} className="min-h-11 rounded-lg border-2 border-[#123C39] bg-[#123C39] px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#123C39]">Reject analytics</button>
              {choice && <button type="button" onClick={() => setSettingsOpen(false)} className="min-h-11 rounded-lg px-5 py-3 text-sm underline">Close settings</button>}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
