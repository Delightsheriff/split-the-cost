import { describe, expect, it } from "vitest";
import { checkPayers, computeShares, evenValues, mainPayer, SplitError } from "./splits";

const sum = (shares: { cents: number }[]) => shares.reduce((a, s) => a + s.cents, 0);

describe("computeShares", () => {
  it("splits equally without losing a cent", () => {
    const shares = computeShares(1000, { type: "equal", members: ["a", "b", "c"] });
    expect(shares).toEqual([
      { userId: "a", cents: 334 },
      { userId: "b", cents: 333 },
      { userId: "c", cents: 333 },
    ]);
    expect(sum(shares)).toBe(1000);
  });

  it("ignores duplicate members", () => {
    expect(computeShares(300, { type: "equal", members: ["a", "a", "b"] })).toHaveLength(2);
  });

  it("takes exact amounts when they add up", () => {
    const shares = computeShares(2500, { type: "exact", members: ["a", "b"], values: { a: 1000, b: 1500 } });
    expect(shares.map((s) => s.cents)).toEqual([1000, 1500]);
  });

  it("rejects exact amounts that don't add up", () => {
    expect(() => computeShares(2500, { type: "exact", members: ["a", "b"], values: { a: 1000, b: 1000 } })).toThrow(
      SplitError,
    );
  });

  it("splits by percentage in basis points", () => {
    const shares = computeShares(999, { type: "percent", members: ["a", "b"], values: { a: 3333, b: 6667 } });
    expect(sum(shares)).toBe(999);
    expect(shares.map((s) => s.cents)).toEqual([333, 666]);
  });

  it("rejects percentages that don't reach 100", () => {
    expect(() => computeShares(1000, { type: "percent", members: ["a", "b"], values: { a: 5000, b: 4000 } })).toThrow(
      "Percentages must add up to 100",
    );
  });

  it("splits by shares, and someone with no share pays nothing", () => {
    const shares = computeShares(1000, { type: "shares", members: ["a", "b", "c"], values: { a: 2, b: 1, c: 0 } });
    expect(shares.map((s) => s.cents)).toEqual([667, 333, 0]);
  });

  it("rejects bad totals and empty splits", () => {
    expect(() => computeShares(0, { type: "equal", members: ["a"] })).toThrow(SplitError);
    expect(() => computeShares(10.5, { type: "equal", members: ["a"] })).toThrow(SplitError);
    expect(() => computeShares(100, { type: "equal", members: [] })).toThrow(SplitError);
    expect(() => computeShares(100, { type: "shares", members: ["a"], values: { a: 0 } })).toThrow(SplitError);
  });
});

describe("checkPayers", () => {
  it("merges repeats and drops zero amounts", () => {
    expect(
      checkPayers(5000, [
        { userId: "ada", cents: 2000 },
        { userId: "tari", cents: 0 },
        { userId: "ada", cents: 3000 },
      ]),
    ).toEqual([{ userId: "ada", cents: 5000 }]);
  });

  it("needs the payments to cover the total exactly", () => {
    expect(() => checkPayers(5000, [{ userId: "ada", cents: 4000 }])).toThrow("Payments add up to 4000 cents, not 5000");
    expect(() => checkPayers(5000, [])).toThrow(SplitError);
  });

  it("names the biggest payer", () => {
    expect(
      mainPayer([
        { userId: "ada", cents: 2000 },
        { userId: "tari", cents: 3000 },
      ]),
    ).toBe("tari");
  });
});

describe("evenValues", () => {
  const people = ["a", "b", "c"];

  it("starts every type from values that already work", () => {
    for (const type of ["exact", "percent", "shares"] as const) {
      const values = evenValues(type, people, 1000);
      expect(() => computeShares(1000, { type, members: people, values })).not.toThrow();
    }
  });

  it("spreads the leftover cent and percentage point", () => {
    expect(evenValues("exact", people, 1000)).toEqual({ a: 334, b: 333, c: 333 });
    expect(evenValues("percent", people, 1000)).toEqual({ a: 3334, b: 3333, c: 3333 });
    expect(evenValues("shares", people, 1000)).toEqual({ a: 1, b: 1, c: 1 });
  });
});
