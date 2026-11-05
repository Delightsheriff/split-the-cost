import * as Haptics from "expo-haptics";
import { ArrowRight } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const KNOB = 56;
const PAD = 4;
const SPRING = { damping: 20, stiffness: 240 };

/**
 * A track you drag the knob across to confirm. Past 85% it commits and waits
 * for `onConfirm`; if that resolves false the knob springs back. VoiceOver
 * users get a plain button action instead of the drag.
 */
export function SwipeToConfirm({
  label,
  disabled,
  onConfirm,
}: {
  label: string;
  disabled?: boolean;
  onConfirm: () => Promise<boolean>;
}) {
  const [width, setWidth] = useState(0);
  const [busy, setBusy] = useState(false);
  const x = useSharedValue(0);
  const max = Math.max(0, width - KNOB - PAD * 2);

  const confirm = async () => {
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const ok = await onConfirm();
    setBusy(false);
    if (!ok) x.set(withSpring(0, SPRING));
  };

  const tick = () => Haptics.selectionAsync();

  const pan = Gesture.Pan()
    .enabled(!disabled && !busy && max > 0)
    .onBegin(() => scheduleOnRN(tick))
    .onChange((e) => {
      x.value = Math.min(max, Math.max(0, x.value + e.changeX));
    })
    .onEnd(() => {
      if (x.value > max * 0.85) {
        x.value = withTiming(max, { duration: 120 });
        scheduleOnRN(confirm);
      } else {
        x.value = withSpring(0, SPRING);
      }
    });

  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const fill = useAnimatedStyle(() => ({ width: x.value + KNOB + PAD }));
  const text = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, max * 0.6], [1, 0], "clamp") }));

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, busy }}
      accessibilityActions={[{ name: "activate" }]}
      onAccessibilityAction={() => !disabled && !busy && confirm()}
      className={`h-16 rounded-full bg-surface justify-center overflow-hidden ${disabled ? "opacity-40" : ""}`}
    >
      <Animated.View style={[{ position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999, backgroundColor: "#13EC5B" }, fill]} />
      <Animated.Text style={text} className="text-ink font-manropeBold text-base text-center">
        {label}
      </Animated.Text>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[{ position: "absolute", left: PAD, width: KNOB, height: KNOB, borderRadius: KNOB / 2, backgroundColor: "#13EC5B" }, knob]}
          className="items-center justify-center"
          hitSlop={12}
        >
          {busy ? <ActivityIndicator color="#0E0E10" /> : <ArrowRight size={24} color="#0E0E10" strokeWidth={2.75} />}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
