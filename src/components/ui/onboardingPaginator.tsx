import React from "react";
import { Animated, View } from "react-native";

interface OnboardingPaginatorProps {
  data: any[];
  scrollX: Animated.Value;
  width: number;
}

const OnboardingPaginator = ({
  data,
  scrollX,
  width,
}: OnboardingPaginatorProps) => {
  return (
    <View className="flex-row justify-center items-center mb-6">
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={i.toString()}
            style={{ width: dotWidth, opacity }}
            className="h-2 rounded-full bg-primary mx-1"
          />
        );
      })}
    </View>
  );
};

export default OnboardingPaginator;
