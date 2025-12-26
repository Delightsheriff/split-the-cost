import { Group } from "@/src/types/groups";
import { clsx } from "clsx";
import { ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

interface GroupCardProps {
  group: Group;
  onPress?: () => void;
}

const GroupCard = ({ group, onPress }: GroupCardProps) => {
  const [pressed, setPressed] = useState(false);
  const isOwed = group.balance < 0;
  const balanceText = isOwed
    ? `You are owed $${Math.abs(group.balance).toFixed(2)}`
    : `You owe $${group.balance.toFixed(2)}`;
  const balanceColor = isOwed
    ? "text-xs font-bold text-primary"
    : "text-xs font-bold text-red-400";
  const balanceContainerStyle = isOwed
    ? "flex items-center gap-1 rounded-full bg-[#13ec5b]/10 px-3 py-1"
    : "flex items-center gap-1 rounded-full  px-3 py-1 bg-red-500/10";

  // group relative flex cursor-pointer flex-col gap-4 rounded-2xl bg-surface-light p-5 shadow-subtle transition-transform active:scale-[0.98] dark:bg-surface-dark dark:shadow-none border border-transparent dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      className={clsx(
        "rounded-2xl bg-surface-dark p-5 mb-4 border",
        pressed ? "border-white/10" : "border-white/5"
      )}
      style={{
        transform: [{ scale: pressed ? 0.98 : 1 }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 borders">
          <Text className="text-lg font-bold leading-tight text-white font-manropeBold mb-1">
            {group.name}
          </Text>
          <Text className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400 font-manrope mb-1">
            {group.category}
          </Text>

          {/* Member Avatars */}
          <View className="flex-row">
            {group.members.slice(0, 3).map((member, index) => (
              <Image
                key={member.id}
                source={{ uri: member.avatar }}
                className="h-10 w-10 rounded-full border-2 border-surface-dark"
                style={{ marginLeft: index > 0 ? -8 : 0 }}
              />
            ))}
            {group.members.length > 3 && (
              <View
                className="flex h-10 w-10 items-center justify-center rounded-full    border-surface-dark bg-[#253d30]"
                style={{ marginLeft: -8 }}
              >
                <Text className="text-white text-xs font-manropeBold">
                  +{group.members.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Balance */}
        <View className="items-end gap-5">
          <View className={balanceContainerStyle}>
            <Text className={`text-base font-manropeBold ${balanceColor}`}>
              {balanceText}
            </Text>
          </View>
          <View>
            <ChevronRight size={16} color="gray" />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default GroupCard;
