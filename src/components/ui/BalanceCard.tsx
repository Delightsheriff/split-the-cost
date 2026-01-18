import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface BalanceCardProps {
  amount: string;
  isOwed: boolean;
  userBalance: number;
  onPress: () => void;
}

const BalanceCard = ({
  amount,
  isOwed,
  userBalance,
  onPress,
}: BalanceCardProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    className="px-6 pt-6 pb-2"
  >
    <View className="bg-surface-dark rounded-2xl p-6 border border-white/5 items-center shadow-xl">
      <Text className="text-slate-400 text-sm font-medium uppercase tracking-wider font-manrope mb-2">
        Total Balance
      </Text>
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        className={`text-5xl font-extrabold font-manropeBold mb-2 p-2 ${
          userBalance === 0
            ? "text-slate-400"
            : isOwed
              ? "text-primary"
              : "text-red-400"
        }`}
      >
        ${amount}
      </Text>
      <Text className="text-slate-400 text-sm font-manrope">
        {userBalance === 0
          ? "All settled up!"
          : isOwed
            ? "You are owed overall"
            : "You owe overall"}
      </Text>
    </View>
  </TouchableOpacity>
);

export default BalanceCard;
