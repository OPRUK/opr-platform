export type MeasurementSystem = "metric" | "imperial";

const UNICODE_FRACTIONS: Record<string, number> = {
  "¼": 1 / 4,
  "½": 1 / 2,
  "¾": 3 / 4,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 1 / 8,
  "⅜": 3 / 8,
  "⅝": 5 / 8,
  "⅞": 7 / 8,
};

const FRACTION_GLYPHS: Record<number, string> = {
  0.25: "¼",
  0.5: "½",
  0.75: "¾",
};

const AMOUNT_PATTERN = String.raw`(?:\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d*[¼½¾⅓⅔⅛⅜⅝⅞]|\d+\/\d+)`;
const SPOON_OR_CUP_PATTERN = String.raw`(?:cups?|tablespoons?|tbsp|teaspoons?|tsp)`;

function parseAmount(value: string): number | null {
  const compact = value.trim();
  const unicodeFraction = compact.match(/^([0-9]*)([¼½¾⅓⅔⅛⅜⅝⅞])$/);

  if (unicodeFraction) {
    return Number(unicodeFraction[1] || 0) + UNICODE_FRACTIONS[unicodeFraction[2]];
  }

  const mixedFraction = compact.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedFraction) {
    return Number(mixedFraction[1]) + Number(mixedFraction[2]) / Number(mixedFraction[3]);
  }

  const fraction = compact.match(/^(\d+)\/(\d+)$/);
  if (fraction) {
    return Number(fraction[1]) / Number(fraction[2]);
  }

  const parsed = Number(compact);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatQuarter(value: number): string {
  const rounded = Math.round(value * 4) / 4;
  const whole = Math.floor(rounded);
  const fraction = rounded - whole;
  const glyph = FRACTION_GLYPHS[fraction] ?? "";

  if (whole === 0 && glyph) return glyph;
  if (glyph) return `${whole}${glyph}`;
  return String(whole);
}

function gramsToImperial(grams: number): string {
  const roundedOunces = Math.round((grams / 28.349523125) * 4) / 4;

  if (roundedOunces < 16) {
    return `${formatQuarter(Math.max(roundedOunces, 0.25))} oz`;
  }

  let pounds = Math.floor(roundedOunces / 16);
  let ounces = roundedOunces - pounds * 16;

  if (ounces >= 16) {
    pounds += 1;
    ounces = 0;
  }

  return ounces > 0
    ? `${pounds} lb ${formatQuarter(ounces)} oz`
    : `${pounds} lb`;
}

function millilitresToImperial(millilitres: number): string {
  const fluidOunces = Math.max(millilitres / 28.4130625, 0.25);
  return `${formatQuarter(fluidOunces)} fl oz`;
}

function formatMetricVolume(millilitres: number): string {
  const rounded = Math.round(millilitres * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}ml`;
}

function preferSuppliedMetricMeasurement(ingredient: string): string {
  const suppliedMetric = new RegExp(
    String.raw`(?<![\d.])${AMOUNT_PATTERN}\s*${SPOON_OR_CUP_PATTERN}\s*\(\s*(${AMOUNT_PATTERN})\s*(kg|g|ml|l)\s*\)`,
    "gi",
  );

  return ingredient.replace(suppliedMetric, (_match, amount: string, unit: string) => `${amount}${unit.toLowerCase()}`);
}

function convertCupsToMetric(ingredient: string): string {
  const cups = new RegExp(String.raw`(?<![\d.])(${AMOUNT_PATTERN})\s*cups?\b`, "gi");

  return ingredient.replace(cups, (match, amount: string) => {
    const parsed = parseAmount(amount);
    return parsed === null ? match : formatMetricVolume(parsed * 240);
  });
}

function convertMetricToImperial(ingredient: string): string {
  const metric = /(\d+(?:\.\d+)?)\s*(kg|g|ml|l)\b/gi;

  return ingredient.replace(metric, (match, rawAmount: string, rawUnit: string) => {
    const amount = Number(rawAmount);
    if (!Number.isFinite(amount)) return match;

    const unit = rawUnit.toLowerCase();
    if (unit === "kg") return gramsToImperial(amount * 1000);
    if (unit === "g") return gramsToImperial(amount);
    if (unit === "l") return millilitresToImperial(amount * 1000);
    return millilitresToImperial(amount);
  });
}

export function convertIngredient(
  ingredient: string,
  system: MeasurementSystem,
): string {
  if (system === "imperial") {
    return convertMetricToImperial(ingredient);
  }

  return convertCupsToMetric(preferSuppliedMetricMeasurement(ingredient));
}
