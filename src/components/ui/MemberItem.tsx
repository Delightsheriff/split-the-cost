import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MemberItemProps {
  email: string;
  isUser?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
}

const MemberItem = ({ email, isUser, onRemove, disabled }: MemberItemProps) => (
  <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4 h-14 mb-3">
    <Text className="flex-1 text-white text-base font-manrope">{email}</Text>
    {isUser ? (
      <Text className="text-gray-500 text-sm">You</Text>
    ) : (
      <TouchableOpacity
        onPress={onRemove}
        disabled={disabled}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text className="text-gray-400 text-xl font-bold">×</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default MemberItem;
