import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

export type Mood = "owed" | "settled" | "owes";

export const moodFor = (balanceCents: number): Mood => (balanceCents > 0 ? "owed" : balanceCents < 0 ? "owes" : "settled");

/** Each mood is its own shape: a sunny flower, a soft pebble, a jittery burr. */
const LOOK = {
  owed: { fill: "#13EC5B", lobes: 8, depth: 0.1 },
  settled: { fill: "#FFD400", lobes: 5, depth: 0.035 },
  owes: { fill: "#FF5A36", lobes: 14, depth: 0.06 },
} as const;

const LABEL = {
  owed: "Happy face: you're owed money",
  settled: "Calm face: you're all settled",
  owes: "Nervous face: you owe money",
};

/** A closed blob whose radius ripples `lobes` times around the circle. */
function blobPath(size: number, lobes: number, depth: number) {
  const c = size / 2;
  const r = c / (1 + depth);
  const points = Array.from({ length: 120 }, (_, i) => {
    const t = (i / 120) * Math.PI * 2;
    const rr = r * (1 + depth * Math.cos(lobes * t));
    return `${(c + rr * Math.cos(t)).toFixed(2)},${(c + rr * Math.sin(t)).toFixed(2)}`;
  });
  return `M${points.join("L")}Z`;
}

const TAPS_FOR_SECRET = 7;

/**
 * The balance as a character. Tapping squishes it; tap it seven times quickly
 * and it gets dollar-sign eyes for a moment.
 */
export function Moodling({ balanceCents, size = 120 }: { balanceCents: number; size?: number }) {
  const mood = moodFor(balanceCents);
  const look = LOOK[mood];
  const reduceMotion = useReducedMotion();

  const spin = useSharedValue(0);
  const bob = useSharedValue(0);
  const blink = useSharedValue(1);
  const squish = useSharedValue(1);

  const [rich, setRich] = useState(false);
  const taps = useRef<number[]>([]);

  useEffect(() => {
    cancelAnimation(spin);
    cancelAnimation(bob);
    spin.value = 0;
    bob.value = 0;
    if (reduceMotion) return;
    if (mood === "owed") {
      spin.value = withRepeat(withTiming(360, { duration: 24000, easing: Easing.linear }), -1);
    } else if (mood === "owes") {
      // A nervous shiver every couple of seconds.
      spin.value = withRepeat(
        withSequence(
          withDelay(1800, withTiming(-5, { duration: 60 })),
          withRepeat(withTiming(5, { duration: 90 }), 4, true),
          withTiming(0, { duration: 60 }),
        ),
        -1,
      );
    } else {
      bob.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true);
    }
  }, [mood, reduceMotion, spin, bob]);

  useEffect(() => {
    if (reduceMotion) return;
    // Blink every few seconds; nervous blinks twice as often.
    const every = mood === "owes" ? 1800 : 3600;
    blink.value = withRepeat(
      withSequence(withDelay(every, withTiming(0.1, { duration: 70 })), withTiming(1, { duration: 110 })),
      -1,
    );
    return () => cancelAnimation(blink);
  }, [mood, reduceMotion, blink]);

  const bodyStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const wholeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -bob.value * 4 }, { scaleX: 2 - squish.value }, { scaleY: squish.value }],
  }));
  const eyeStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));

  const onTap = () => {
    if (!reduceMotion) {
      squish.set(withSequence(withTiming(0.88, { duration: 90 }), withSpring(1, { damping: 6, stiffness: 300 })));
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2500), now];
    if (taps.current.length >= TAPS_FOR_SECRET && !rich) {
      taps.current = [];
      setRich(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setRich(false), 2500);
    }
  };

  const eye = size * 0.1;
  // Nervous eyes glance to the side.
  const glance = mood === "owes" ? size * 0.05 : 0;

  return (
    <Pressable onPress={onTap} accessibilityRole="image" accessibilityLabel={LABEL[mood]} hitSlop={8}>
      <Animated.View style={[{ width: size, height: size }, wholeStyle]}>
        <Animated.View style={[{ position: "absolute", inset: 0 }, bodyStyle]}>
          <Svg width={size} height={size}>
            <Path d={blobPath(size, look.lobes, look.depth)} fill={look.fill} />
          </Svg>
        </Animated.View>

        {/* The face stays upright while the body turns. */}
        <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
          {rich ? (
            <Text style={{ fontSize: size * 0.22, fontFamily: "Manrope-ExtraBold", color: "#0E0E10", letterSpacing: size * 0.06 }}>
              $ $
            </Text>
          ) : mood === "owed" ? (
            // Happy eyes are closed arcs.
            <Svg width={size * 0.5} height={size * 0.14} viewBox="0 0 50 14">
              <Path d="M4 12 Q11 1 18 12" stroke="#0E0E10" strokeWidth={4} strokeLinecap="round" fill="none" />
              <Path d="M32 12 Q39 1 46 12" stroke="#0E0E10" strokeWidth={4} strokeLinecap="round" fill="none" />
            </Svg>
          ) : (
            <View style={{ flexDirection: "row", gap: size * 0.18, transform: [{ translateX: glance }] }}>
              {[0, 1].map((i) => (
                <Animated.View
                  key={i}
                  style={[{ width: eye, height: eye * 1.25, borderRadius: eye, backgroundColor: "#0E0E10" }, eyeStyle]}
                />
              ))}
            </View>
          )}

          <Svg width={size * 0.4} height={size * 0.2} viewBox="0 0 40 20" style={{ marginTop: size * 0.05 }}>
            {mood === "owed" || rich ? (
              <Path d="M6 4 Q20 22 34 4 Z" fill="#0E0E10" />
            ) : mood === "settled" ? (
              <Path d="M10 6 Q20 15 30 6" stroke="#0E0E10" strokeWidth={3.5} strokeLinecap="round" fill="none" />
            ) : (
              <Path d="M8 10 Q12 5 16 10 T24 10 T32 10" stroke="#0E0E10" strokeWidth={3.5} strokeLinecap="round" fill="none" />
            )}
          </Svg>
        </View>

        {mood === "owes" && !rich && (
          <Svg width={size * 0.16} height={size * 0.22} viewBox="0 0 16 22" style={{ position: "absolute", top: size * 0.12, right: size * 0.12 }}>
            <Path d="M8 1 C8 1 15 11 15 15 A7 7 0 0 1 1 15 C1 11 8 1 8 1 Z" fill="#2F80FF" />
            <Circle cx={5.5} cy={15} r={1.6} fill="#FFFFFF" opacity={0.7} />
          </Svg>
        )}
      </Animated.View>
    </Pressable>
  );
}
