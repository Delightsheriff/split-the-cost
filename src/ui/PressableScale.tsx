import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRESS = { duration: 150, easing: Easing.out(Easing.quad) };

type Props = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** A light tap on press. Off for rows that are pressed often. */
  haptic?: boolean;
  /** Skip the scale where it would distract, as on full-width rows. */
  static?: boolean;
};

/** Every tappable surface: scales to 0.96 while held, or dims under reduced motion. */
export function PressableScale({ haptic, static: isStatic, disabled, onPressIn, onPressOut, onPress, style, ...props }: Props) {
  const pressed = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  const animated = useAnimatedStyle(() =>
    reduceMotion || isStatic
      ? { opacity: 1 - pressed.value * 0.3 }
      : { transform: [{ scale: 1 - pressed.value * 0.04 }] },
  );

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(e) => {
        pressed.value = withTiming(1, PRESS);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = withTiming(0, PRESS);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      style={[style, animated, disabled && { opacity: 0.4 }]}
    />
  );
}
