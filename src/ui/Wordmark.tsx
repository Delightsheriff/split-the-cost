import React from "react";
import { Text } from "react-native";

/** The app's name set in type. */
export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <Text className="text-ink font-manropeHeavy tracking-tight" style={{ fontSize: size }} accessibilityRole="header">
      Split<Text className="text-pos">It</Text>
    </Text>
  );
}
