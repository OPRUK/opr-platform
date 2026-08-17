import "client-only";

import {
  type AnalyticsEventKey,
  type Attribution,
  hasAttribution,
  normaliseAttribution,
} from "./attribution";

const attributionStorageKey = "opr-session-attribution";

export function storeAttribution(input: unknown): Attribution | null {
  const attribution = normaliseAttribution(input);
  if (!hasAttribution(attribution)) return null;

  try {
    window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(attribution));
  } catch {
    // Attribution should never interfere with browsing or form completion.
  }

  return attribution;
}

export function getStoredAttribution(): Attribution | null {
  try {
    const saved = window.sessionStorage.getItem(attributionStorageKey);
    if (!saved) return null;
    const attribution = normaliseAttribution(JSON.parse(saved));
    return hasAttribution(attribution) ? attribution : null;
  } catch {
    return null;
  }
}

export function addAttributionToFormData(formData: FormData) {
  const attribution = getStoredAttribution();
  if (!attribution) return;

  formData.set("attributionSource", attribution.source ?? "");
  formData.set("utmSource", attribution.utmSource ?? "");
  formData.set("utmMedium", attribution.utmMedium ?? "");
  formData.set("utmCampaign", attribution.utmCampaign ?? "");
}

export function sendAnalyticsEvent(eventKey: AnalyticsEventKey, destination: string) {
  try {
    const attribution = getStoredAttribution();
    const body = new Blob(
      [JSON.stringify({ eventKey, destination, attribution })],
      { type: "application/json" },
    );
    navigator.sendBeacon("/api/analytics/event", body);
  } catch {
    // A missed event must never stop the visitor following a link.
  }
}
