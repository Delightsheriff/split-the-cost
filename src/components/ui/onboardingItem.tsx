import { OnboardingInterface } from "@/src/types/onboarding";
import React from "react";
import { Image, Text, View } from "react-native";

interface OnboardingItemProps {
  item: OnboardingInterface;
  width: number;
}

const OnboardingItem = ({ item, width }: OnboardingItemProps) => {
  return (
    <View style={{ width }} className="flex-1 items-center justify-center px-6">
      {/* Image container - fixed aspect ratio */}
      <View className="w-full aspect-square max-h-[400px] items-center justify-center mb-8">
        <Image
          source={item.image}
          resizeMode="cover"
          className="w-full h-full rounded-2xl border-[15px] border-surface-dark"
        />
      </View>

      {/* Text content */}
      <View className="items-center">
        <Text className="text-4xl font-extrabold font-manropeBold text-center leading-tight mb-4">
          <Text className="text-white">
            {item.heading},{"\n"}
          </Text>
          <Text className="text-primary">{item.sub}</Text>
        </Text>

        <Text className="text-base font-medium text-slate-600 max-w-[320px] leading-relaxed text-center font-manrope">
          {item.description}
        </Text>
      </View>
    </View>
  );
};

export default OnboardingItem;
