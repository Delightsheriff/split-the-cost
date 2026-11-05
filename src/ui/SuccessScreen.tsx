import { memberColors } from "@/src/theme/tokens";
import * as Haptics from "expo-haptics";
import { Check } from "lucide-react-native";
import React, { useEffect } from "react";
import { Modal, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "./PressableScale";

const PIECES = 28;

function Confetti({ seed, width, height }: { seed: number; width: number; height: number }) {
  // Deterministic per piece so re-renders don't reshuffle it.
  const r = (n: number) => {
    const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const fall = useSharedValue(0);
  const delay = r(1) * 300;
  const duration = 1600 + r(2) * 900;
  useEffect(() => {
    fall.set(withDelay(delay, withTiming(1, { duration, easing: Easing.in(Easing.quad) })));
  }, [fall, delay, duration]);
  const size = 8 + r(3) * 8;
  const round = r(4) > 0.5;
  const startX = r(5) * width;
  const drift = (r(6) - 0.5) * 120;
  const spin = (r(7) - 0.5) * 720;
  // Start staggered above the screen so they rain rather than fall as a line.
  const startY = -40 - r(8) * height * 0.5;
  const style = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, fall.value - 0.8) * 5,
    transform: [
      { translateX: startX + drift * fall.value },
      { translateY: startY + fall.value * (height - startY + 40) },
      { rotate: `${spin * fall.value}deg` },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: size,
          height: round ? size : size * 0.45,
          borderRadius: round ? size / 2 : 2,
          backgroundColor: memberColors[seed % memberColors.length] === "#13EC5B" ? "#0E0E10" : memberColors[seed % memberColors.length],
        },
        style,
      ]}
    />
  );
}

/** A full-screen lime "it worked" moment with a burst of confetti. */
export function SuccessScreen({
  visible,
  title,
  line,
  onDone,
}: {
  visible: boolean;
  title: string;
  line: string;
  onDone: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!visible) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onDone}>
      <View className="flex-1 bg-lime items-center justify-center px-8" style={{ paddingBottom: insets.bottom }}>
        {!reduceMotion &&
          Array.from({ length: PIECES }, (_, i) => <Confetti key={i} seed={i + 1} width={width} height={height} />)}

        <Animated.View entering={ZoomIn.springify().damping(12).delay(100)} className="w-28 h-28 rounded-full bg-onfill items-center justify-center">
          <Check size={56} color="#13EC5B" strokeWidth={3.5} />
        </Animated.View>
        <Animated.Text entering={FadeInDown.duration(300).delay(250)} className="text-onfill font-manropeHeavy text-4xl mt-8 text-center">
          {title}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.duration(300).delay(350)} className="text-onfill/70 font-manropeSemi text-lg mt-2 text-center">
          {line}
        </Animated.Text>

        <Animated.View entering={FadeIn.duration(300).delay(600)} className="absolute left-6 right-6" style={{ bottom: insets.bottom + 24 }}>
          <PressableScale haptic onPress={onDone} className="bg-onfill rounded-full py-4 items-center">
            <Text className="text-lime font-manropeBold text-base">Done</Text>
          </PressableScale>
        </Animated.View>
      </View>
    </Modal>
  );
}
