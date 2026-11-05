import { formatMoney, type Cents } from "@/src/domain/money";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface BalanceCardProps {
  /** Positive when you're owed, negative when you owe. */
  balanceCents: Cents;
  currency: string;
  onPress: () => void;
}

const BalanceCard = ({ balanceCents, currency, onPress }: BalanceCardProps) => (
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
          balanceCents === 0
            ? "text-slate-400"
            : balanceCents > 0
              ? "text-primary"
              : "text-red-400"
        }`}
      >
        {formatMoney(Math.abs(balanceCents), currency)}
      </Text>
      <Text className="text-slate-400 text-sm font-manrope">
        {balanceCents === 0
          ? "All settled up!"
          : balanceCents > 0
            ? "You are owed overall"
            : "You owe overall"}
      </Text>
    </View>
  </TouchableOpacity>
);

export default BalanceCard;
