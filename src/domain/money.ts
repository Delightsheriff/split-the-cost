// Money is always a whole number of cents (the currency's minor unit), never a float.

export type Cents = number;

export const DEFAULT_CURRENCY = "USD";

/** Parses what someone typed ("12", "12.5", "1,234.56") into cents, or null if it isn't an amount. */
export function parseCents(input: string): Cents | null {
  const cleaned = input.replace(/[,\s]/g, "");
  const match = cleaned.match(/^(\d+)(?:\.(\d{0,2}))?$/);
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

export function formatMoney(cents: Cents, currency = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

/** Cents as a plain decimal string for an input field, e.g. 1250 -> "12.50". */
export function centsToInput(cents: Cents): string {
  return (cents / 100).toFixed(2);
}

/**
 * Splits `total` in proportion to `weights` so the parts always add back up to `total`.
 * Leftover cents go to the largest fractional remainders, ties to the earlier entry.
 */
export function allocate(total: Cents, weights: number[]): Cents[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) throw new Error("Weights must add up to more than zero");
  const exact = weights.map((w) => (total * w) / sum);
  const parts = exact.map(Math.floor);
  let left = total - parts.reduce((a, b) => a + b, 0);
  const order = exact
    .map((x, i) => ({ i, rem: x - Math.floor(x) }))
    .sort((a, b) => b.rem - a.rem || a.i - b.i);
  for (const { i } of order) {
    if (left === 0) break;
    parts[i] += 1;
    left -= 1;
  }
  return parts;
}
