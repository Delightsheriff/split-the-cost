import { Group } from "@/src/services/group.service";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

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

          {/* Member Avatars */}
          <View className="flex-row items-center">
            {group.members.slice(0, 3).map((member, index) => (
              <View key={member._id} style={{ marginLeft: index > 0 ? -8 : 0 }}>
                {member.avatar ? (
                  <Image
                    source={{ uri: member.avatar }}
                    className="h-8 w-8 rounded-full border-2 border-surface-dark"
                  />
                ) : (
                  <View className="h-8 w-8 rounded-full border-2 border-surface-dark bg-primary/20 items-center justify-center">
                    <Text className="text-primary text-xs font-manropeBold">
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            {group.members.length > 3 && (
              <View
                className="h-8 w-8 items-center justify-center rounded-full border-2 border-surface-dark bg-[#253d30]"
                style={{ marginLeft: -8 }}
              >
                <Text className="text-white text-xs font-manropeBold">
                  +{group.members.length - 3}
                </Text>
              </View>
            )}
            <Text className="text-slate-400 text-sm font-manrope ml-2">
              {group.members.length} member
              {group.members.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <ChevronRight size={20} color="#94a3b8" />
      </View>
    </Pressable>
  );
};

export default GroupCard;
