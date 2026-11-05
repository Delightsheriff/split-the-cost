import { describe, expect, it } from "vitest";
import { evaluate, hasOperator, press, type Key } from "./expression";

const type = (keys: string) => [...keys].reduce((e, k) => press(e, k as Key), "");

describe("press", () => {
  it("builds an expression", () => {
    expect(type("143×2")).toBe("143×2");
  });

  it("swaps an operator typed straight after another", () => {
    expect(type("12+×")).toBe("12×");
  });

  it("ignores an operator before any number", () => {
    expect(type("+5")).toBe("5");
  });

  it("allows one decimal point and two decimal places per number", () => {
    expect(type("1.2.345")).toBe("1.23");
    expect(type("1.5+2.25")).toBe("1.5+2.25");
  });

  it("writes a leading zero for a bare point and drops leading zeros", () => {
    expect(type(".5")).toBe("0.5");
    expect(type("007")).toBe("7");
  });

  it("caps a number at 9 digits", () => {
    expect(type("1234567890")).toBe("123456789");
  });

  it("deletes the last character", () => {
    expect(press("12+", "back")).toBe("12");
  });
});

describe("evaluate", () => {
  it("works out to whole cents", () => {
    expect(evaluate("143×2")).toBe(28600);
    expect(evaluate("12.5")).toBe(1250);
    expect(evaluate("0.05")).toBe(5);
  });

  it("does × and ÷ before + and −", () => {
    expect(evaluate("10+2×3")).toBe(1600);
    expect(evaluate("100−20÷4")).toBe(9500);
  });

  it("rounds a division to the nearest cent", () => {
    expect(evaluate("10÷3")).toBe(333);
  });

  it("ignores a trailing operator so the total shows while typing", () => {
    expect(evaluate("40+")).toBe(4000);
  });

  it("is null for nothing typed or dividing by zero", () => {
    expect(evaluate("")).toBeNull();
    expect(evaluate("5÷0")).toBeNull();
  });

  it("can go negative, which the form treats as invalid", () => {
    expect(evaluate("5−10")).toBe(-500);
  });
});

describe("hasOperator", () => {
  it("tells a sum from a plain amount", () => {
    expect(hasOperator("12.50")).toBe(false);
    expect(hasOperator("12+3")).toBe(true);
  });
});
