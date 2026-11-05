import { describe, expect, it } from "vitest";
import { netBalances, simplifyDebts, type Ledger } from "./balances";
import { computeShares } from "./splits";

const expense = (paidBy: string, cents: number, members: string[]) => ({
  paidBy,
  shares: computeShares(cents, { type: "equal", members }),
});

const trip: Ledger = {
  expenses: [
    expense("you", 12000, ["you", "tari", "ada", "kemi"]),
    expense("tari", 4650, ["you", "tari", "ada", "kemi"]),
    expense("ada", 9000, ["you", "tari", "ada", "kemi"]),
  ],
  settlements: [],
};

const total = (m: Map<string, number>) => [...m.values()].reduce((a, b) => a + b, 0);

describe("netBalances", () => {
  it("always sums to zero", () => {
    expect(total(netBalances(trip))).toBe(0);
  });

  it("matches the seeded trip", () => {
    const net = netBalances(trip);
    // You paid 120.00 and owe a quarter of 256.50 (64.13 after the leftover cent).
    expect(net.get("you")).toBe(12000 - 3000 - 1163 - 2250);
    expect(net.get("kemi")).toBe(-(3000 + 1162 + 2250));
  });

  it("counts a settlement as money moving from payer to payee", () => {
    const net = netBalances({ expenses: [expense("a", 1000, ["a", "b"])], settlements: [{ paidBy: "b", paidTo: "a", cents: 500 }] });
    expect(net.get("a")).toBe(0);
    expect(net.get("b")).toBe(0);
  });
});

describe("simplifyDebts", () => {
  it("settles everyone with at most n - 1 payments", () => {
    const net = netBalances(trip);
    const payments = simplifyDebts(net);
    expect(payments.length).toBeLessThanOrEqual(net.size - 1);

    const after = new Map(net);
    for (const p of payments) {
      after.set(p.from, after.get(p.from)! + p.cents);
      after.set(p.to, after.get(p.to)! - p.cents);
    }
    expect([...after.values()].every((c) => c === 0)).toBe(true);
  });

  it("removes a chain: a owes b and b owes c becomes a pays c", () => {
    const net = new Map([
      ["a", -1000],
      ["b", 0],
      ["c", 1000],
    ]);
    expect(simplifyDebts(net)).toEqual([{ from: "a", to: "c", cents: 1000 }]);
  });

  it("only produces positive payments and nothing when everyone is settled", () => {
    expect(simplifyDebts(new Map([["a", 0]]))).toEqual([]);
    for (const p of simplifyDebts(netBalances(trip))) expect(p.cents).toBeGreaterThan(0);
  });
});
