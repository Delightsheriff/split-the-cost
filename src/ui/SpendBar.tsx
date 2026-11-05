import { formatMoney, type Cents } from "@/src/domain/money";
import { categoryColors, type Category } from "@/src/theme/tokens";
import React from "react";
import { Text, View } from "react-native";
import { CATEGORY_LABELS, asCategory } from "./CategoryBadge";

/** Spending per category as one stacked bar with a legend, biggest first. */
export function SpendBar({ expenses, currency }: { expenses: { type: string; amountCents: Cents }[]; currency: string }) {
  const byCategory = new Map<Category, number>();
  for (const e of expenses) byCategory.set(asCategory(e.type), (byCategory.get(asCategory(e.type)) ?? 0) + e.amountCents);
  const rows = [...byCategory].sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((sum, [, c]) => sum + c, 0);
  if (total === 0) return null;

  return (
    <View
      accessible
      accessibilityLabel={`Spent ${formatMoney(total, currency)}: ${rows
        .map(([cat, c]) => `${CATEGORY_LABELS[cat]} ${formatMoney(c, currency)}`)
        .join(", ")}`}
    >
      <View className="flex-row h-3 gap-[3px]">
        {rows.map(([cat, cents], i) => (
          <View
            key={cat}
            style={{
              flex: cents,
              backgroundColor: categoryColors[cat],
              borderTopLeftRadius: i === 0 ? 6 : 2,
              borderBottomLeftRadius: i === 0 ? 6 : 2,
              borderTopRightRadius: i === rows.length - 1 ? 6 : 2,
              borderBottomRightRadius: i === rows.length - 1 ? 6 : 2,
            }}
          />
        ))}
      </View>
      <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-3">
        {rows.map(([cat, cents]) => (
          <View key={cat} className="flex-row items-center gap-1.5">
            <View style={{ backgroundColor: categoryColors[cat] }} className="w-2.5 h-2.5 rounded-full" />
            <Text className="text-ink-muted font-manropeSemi text-[13px]">{CATEGORY_LABELS[cat]}</Text>
            <Text className="text-ink font-manropeBold text-[13px]" style={{ fontVariant: ["tabular-nums"] }}>
              {formatMoney(cents, currency)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
