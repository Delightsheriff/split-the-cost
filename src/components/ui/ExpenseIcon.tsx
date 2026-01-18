import React from "react";
import { Text, View } from "react-native";

export const ExpenseIcon = ({ type }: { type: string }) => {
  const icons = {
    food: "🍽️",
    transport: "🚕",
    supplies: "🛒",
    fuel: "⛽",
    other: "💰",
  };
  return (
    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
      <Text className="text-xl">
        {icons[type as keyof typeof icons] || "💰"}
      </Text>
    </View>
  );
};
