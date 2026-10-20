// Pinterest List Pins returns both rolling 90d and lifetime metrics. The film
// table must use the lifetime count, consistent with the other post columns.
export function pinterestLifetimeImpressions(pin: { pin_metrics?: { lifetime_metrics?: { impression?: unknown } } }): number | null {
  const value = pin.pin_metrics?.lifetime_metrics?.impression;
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}
