import React from "react";
import { Image, Text, View } from "react-native";

interface Member {
  _id: string;
  name: string;
  avatar?: string;
}

interface MemberAvatarsProps {
  members: Member[];
}

const MemberAvatars = ({ members }: MemberAvatarsProps) => {
  const displayMembers = members.slice(0, 3);
  const remainingCount = members.length - 3;

  return (
    <View className="flex-row items-center">
      {displayMembers.map((member, index) => (
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

      {remainingCount > 0 && (
        <View
          className="h-8 w-8 items-center justify-center rounded-full border-2 border-surface-dark bg-[#253d30]"
          style={{ marginLeft: -8 }}
        >
          <Text className="text-white text-xs font-manropeBold">
            +{remainingCount}
          </Text>
        </View>
      )}

      <Text className="text-slate-400 text-sm font-manrope ml-2">
        {members.length} {members.length === 1 ? "member" : "members"}
      </Text>
    </View>
  );
};

export default MemberAvatars;
