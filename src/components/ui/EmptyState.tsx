import { Users } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

const EmptyState = () => {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-6">
        <Users size={40} color="#13ec5b" />
      </View>
      <Text className="text-white text-2xl font-manropeBold text-center mb-3">
        No Groups Yet
      </Text>
      <Text className="text-gray-400 text-base font-manrope text-center leading-relaxed">
        Create your first group to start tracking shared expenses with friends
        and family.
      </Text>
    </View>
  );
};

export default EmptyState;
