import { describe, expect, it } from "vitest";
import { allocate, centsToInput, formatMoney, parseCents } from "./money";

describe("parseCents", () => {
  it.each([
    ["12", 1200],
    ["12.5", 1250],
    ["12.50", 1250],
    ["0.07", 7],
    ["1,234.56", 123456],
    [" 3 ", 300],
    ["12.", 1200],
  ])("reads %j as %i cents", (input, cents) => {
    expect(parseCents(input)).toBe(cents);
  });

  it.each(["", "abc", "-5", "1.234", "1e3", "."])("rejects %j", (input) => {
    expect(parseCents(input)).toBeNull();
  });

  it("avoids the float error in 0.1 + 0.2 style inputs", () => {
    expect(parseCents("19.99")).toBe(1999);
    expect(parseCents("0.29")).toBe(29);
  });
});

describe("formatMoney and centsToInput", () => {
  it("formats cents in the group's currency", () => {
    expect(formatMoney(123456)).toBe("$1,234.56");
    expect(formatMoney(-500)).toBe("-$5.00");
    expect(formatMoney(1050, "EUR")).toBe("€10.50");
  });

  it("round-trips through an input string", () => {
    expect(parseCents(centsToInput(1999))).toBe(1999);
  });
});

describe("allocate", () => {
  it("always adds back up to the total", () => {
    for (let total = 1; total < 500; total++) {
      for (const weights of [[1, 1, 1], [1, 2], [3, 3, 4], [10_000], [1, 1, 1, 1, 1, 1, 1]]) {
        expect(allocate(total, weights).reduce((a, b) => a + b, 0)).toBe(total);
      }
    }
  });

  it("gives leftover cents to the earliest people when remainders tie", () => {
    expect(allocate(100, [1, 1, 1])).toEqual([34, 33, 33]);
    expect(allocate(1000, [1, 1, 1])).toEqual([334, 333, 333]);
  });

  it("gives leftover cents to the largest remainder first", () => {
    // Exact parts are 1.4 and 3.6, so the cent goes to the second.
    expect(allocate(5, [7, 18])).toEqual([1, 4]);
  });

  it("rejects weights that sum to zero", () => {
    expect(() => allocate(100, [0, 0])).toThrow();
  });
});
