export const GA_ID = "G-KRYXGNPZES";
export const CONSENT_KEY = "opr-analytics-consent-v1";
export const CONSENT_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
export type AnalyticsChoice = "accepted" | "rejected";

export function readChoice(raw: string | null, now = Date.now()): AnalyticsChoice | null {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value?.version !== 1 || !["accepted", "rejected"].includes(value.choice)) return null;
    if (typeof value.savedAt !== "number" || value.savedAt > now || now - value.savedAt >= CONSENT_MAX_AGE) return null;
    return value.choice;
  } catch { return null; }
}

export function gaCookieNames(cookieHeader: string): string[] {
  return cookieHeader.split(";").map((part) => part.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_") || name === "_gid" || name.startsWith("_gat"));
}

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  "ga-disable-G-KRYXGNPZES"?: boolean;
};

export function stopGoogleAnalytics(win: AnalyticsWindow, doc: Document) {
  win[`ga-disable-${GA_ID}`] = true;
  const hostParts = win.location.hostname.split(".");
  const domains = ["", ...hostParts.map((_, i) => hostParts.slice(i).join(".")).filter((s) => s.includes("."))];
  for (const name of gaCookieNames(doc.cookie)) {
    for (const domain of domains) {
      doc.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

export function startGoogleAnalytics(win: AnalyticsWindow, doc: Document) {
  win[`ga-disable-${GA_ID}`] = false;
  if (doc.getElementById("opr-google-analytics")) return;
  win.dataLayer = win.dataLayer || [];
  // Google’s gtag queue expects an Arguments object for each command.
  // eslint-disable-next-line prefer-rest-params
  win.gtag = function () { win.dataLayer!.push(arguments); };
  // Basic consent mode: nothing from Google loads before explicit acceptance.
  win.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  win.gtag("js", new Date());
  win.gtag("config", GA_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: CONSENT_MAX_AGE / 1000,
    cookie_update: false,
    cookie_flags: "SameSite=Lax;Secure",
  });
  const script = doc.createElement("script");
  script.id = "opr-google-analytics";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  doc.head.appendChild(script);
}
