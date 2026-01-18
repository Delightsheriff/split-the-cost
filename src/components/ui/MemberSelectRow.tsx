import { Check } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MemberSelectRowProps {
  member: { _id: string; name: string };
  isCurrentUser: boolean;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const MemberSelectRow = ({
  member,
  isCurrentUser,
  isSelected,
  onToggle,
  disabled,
}: MemberSelectRowProps) => {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const colors = ["#f97316", "#8b5cf6", "#06b6d4", "#10b981"];
  const colorIndex = parseInt(member._id.slice(-2), 16) % colors.length;

  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={disabled}
      className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-2 border border-white/5"
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: colors[colorIndex] }}
      >
        <Text className="text-white text-sm font-bold font-manropeBold">
          {initials}
        </Text>
      </View>
      <Text className="flex-1 text-white text-base font-manrope">
        {isCurrentUser ? "You" : member.name}
      </Text>
      {isSelected && (
        <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
          <Check size={16} color="#0d1a0f" strokeWidth={3} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default MemberSelectRow;
