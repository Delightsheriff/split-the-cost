const DAY = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Today", "Yesterday", a weekday within the last week, else "Mar 4" (with the year if it isn't this one). */
export function dayLabel(date: Date, now: Date) {
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  });
}

/** Groups items into days, newest first, keeping each day's items newest first. */
export function byDay<T>(items: T[], dateOf: (item: T) => string, now: Date) {
  const sorted = [...items].sort((a, b) => +new Date(dateOf(b)) - +new Date(dateOf(a)));
  const days: { label: string; items: T[] }[] = [];
  for (const item of sorted) {
    const label = dayLabel(new Date(dateOf(item)), now);
    if (days.at(-1)?.label === label) days.at(-1)!.items.push(item);
    else days.push({ label, items: [item] });
  }
  return days;
}
