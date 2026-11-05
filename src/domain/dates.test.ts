import { describe, expect, it } from "vitest";
import { byDay, dayLabel } from "./dates";

const now = new Date(2026, 10, 5, 14, 0); // Thu 5 Nov 2026, 2pm

describe("dayLabel", () => {
  it("names recent days", () => {
    expect(dayLabel(new Date(2026, 10, 5, 0, 1), now)).toBe("Today");
    expect(dayLabel(new Date(2026, 10, 4, 23, 59), now)).toBe("Yesterday");
    expect(dayLabel(new Date(2026, 10, 2), now)).toBe("Monday");
  });

  it("falls back to a date, with the year only when it differs", () => {
    expect(dayLabel(new Date(2026, 9, 20), now)).toBe("Oct 20");
    expect(dayLabel(new Date(2025, 11, 31), now)).toBe("Dec 31, 2025");
  });
});

describe("byDay", () => {
  it("groups newest first", () => {
    const items = [
      { id: "a", date: new Date(2026, 10, 4, 9).toISOString() },
      { id: "b", date: new Date(2026, 10, 5, 9).toISOString() },
      { id: "c", date: new Date(2026, 10, 4, 18).toISOString() },
    ];
    expect(byDay(items, (i) => i.date, now).map((d) => [d.label, d.items.map((i) => i.id)])).toEqual([
      ["Today", ["b"]],
      ["Yesterday", ["c", "a"]],
    ]);
  });
});
