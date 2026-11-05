import { allocate, type Cents } from "./money";

export type SplitType = "equal" | "exact" | "percent" | "shares";

/**
 * How an expense is divided. `values` depends on the type:
 * exact = cents per person, percent = basis points (100 = 1%), shares = whole-number weights.
 * Equal splits ignore `values`.
 */
export type Split = {
  type: SplitType;
  members: string[];
  values?: Record<string, number>;
};

export type Share = { userId: string; cents: Cents };

export class SplitError extends Error {}

const FULL_PERCENT = 10_000;

export function computeShares(total: Cents, split: Split): Share[] {
  if (!Number.isSafeInteger(total) || total <= 0) throw new SplitError("Amount must be more than zero");
  const members = [...new Set(split.members)];
  if (members.length === 0) throw new SplitError("Pick at least one person to split with");

  const value = (id: string) => split.values?.[id] ?? 0;
  const zip = (cents: Cents[]) => members.map((userId, i) => ({ userId, cents: cents[i] }));

  switch (split.type) {
    case "equal":
      return zip(allocate(total, members.map(() => 1)));

    case "exact": {
      const cents = members.map(value);
      if (cents.some((c) => !Number.isSafeInteger(c) || c < 0)) throw new SplitError("Amounts can't be negative");
      const sum = cents.reduce((a, b) => a + b, 0);
      if (sum !== total) throw new SplitError(`Amounts add up to ${sum} cents, not ${total}`);
      return zip(cents);
    }

    case "percent": {
      const points = members.map(value);
      if (points.some((p) => !Number.isInteger(p) || p < 0)) throw new SplitError("Percentages can't be negative");
      if (points.reduce((a, b) => a + b, 0) !== FULL_PERCENT) throw new SplitError("Percentages must add up to 100");
      return zip(allocate(total, points));
    }

    case "shares": {
      const weights = members.map(value);
      if (weights.some((w) => !Number.isInteger(w) || w < 0)) throw new SplitError("Shares must be whole numbers");
      if (weights.every((w) => w === 0)) throw new SplitError("Give at least one person a share");
      return zip(allocate(total, weights));
    }
  }
}
