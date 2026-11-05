import { formatMoney, type Cents } from "@/src/domain/money";
import React from "react";
import { Text, type TextProps } from "react-native";

type Tone = "plain" | "signed" | "muted";

/**
 * An amount in tabular figures. "signed" colours it by direction: green when
 * money comes to you, red when it leaves, and shows the magnitude only.
 */
export function Money({
  cents,
  currency,
  tone = "plain",
  className = "",
  ...props
}: TextProps & { cents: Cents; currency: string; tone?: Tone; className?: string }) {
  const color =
    tone === "muted" ? "text-ink-muted" : tone === "signed" ? (cents > 0 ? "text-pos" : cents < 0 ? "text-neg" : "text-ink-muted") : "text-ink";
  return (
    <Text {...props} className={`${color} font-manropeBold ${className}`} style={[{ fontVariant: ["tabular-nums"] }, props.style]}>
      {formatMoney(tone === "signed" ? Math.abs(cents) : cents, currency)}
    </Text>
  );
}
