import { useTheme } from "@/src/theme/theme";
import React from "react";
import { View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { Avatar } from "./Avatar";

export type RingSegment = {
  key: string;
  value: number;
  color: string;
  user?: { _id: string; name: string; avatar?: string };
};

/**
 * A donut with one arc per segment and, where a segment belongs to a person,
 * their avatar riding on the middle of the arc. Whatever the segments don't
 * cover of `total` shows as an empty track.
 */
export function DonutRing({
  segments,
  total,
  size = 240,
  stroke = 22,
  children,
}: {
  segments: RingSegment[];
  total: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2 - 12;
  const c = 2 * Math.PI * r;
  const shown = segments.filter((s) => s.value > 0);
  // A small gap between arcs, unless one arc is the whole ring.
  const gap = shown.length > 1 ? Math.min(10, c * 0.02) : 0;

  const fractions = shown.map((s) => (total > 0 ? s.value / total : 0));
  const arcs = shown.map((s, i) => ({
    ...s,
    fraction: fractions[i],
    start: fractions.slice(0, i).reduce((a, b) => a + b, 0),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceMuted} strokeWidth={stroke} fill="none" />
        {arcs.map((a) => (
          <Circle
            key={a.key}
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={a.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${Math.max(0.1, a.fraction * c - gap - stroke * (shown.length > 1 ? 1 : 0))} ${c}`}
            strokeDashoffset={-(a.start * c + (shown.length > 1 ? (gap + stroke) / 2 : 0))}
          />
        ))}
      </Svg>

      {arcs
        .filter((a) => a.user)
        .map((a) => {
          const angle = (a.start + a.fraction / 2) * 2 * Math.PI - Math.PI / 2;
          return (
            <Animated.View
              key={a.key}
              entering={ZoomIn.duration(250)}
              style={{ position: "absolute", left: size / 2 + r * Math.cos(angle) - 16, top: size / 2 + r * Math.sin(angle) - 16 }}
            >
              <Avatar user={a.user!} size="sm" ring />
            </Animated.View>
          );
        })}

      <View style={{ position: "absolute", inset: stroke + 24, alignItems: "center", justifyContent: "center" }}>{children}</View>
    </View>
  );
}
