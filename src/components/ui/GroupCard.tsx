import { Group } from "@/src/services/group.service";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import MemberAvatars from "./MemberAvatars";

interface GroupCardProps {
  group: Group;
  onPress?: () => void;
}

const GroupCard = ({ group, onPress }: GroupCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl bg-surface-dark p-5 mb-4 border border-white/5 active:border-white/10"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-bold text-white font-manropeBold mb-2">
            {group.name}
          </Text>
          <MemberAvatars members={group.members} />
        </View>
        <ChevronRight size={20} color="#94a3b8" />
      </View>
    </Pressable>
  );
};

export default GroupCard;
