import React from "react";
import { Image, Text, View } from "react-native";

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
}

const UserAvatar = ({ name, avatar, size = "md" }: UserAvatarProps) => {
  const dimensions =
    size === "lg" ? "w-24 h-24" : size === "md" ? "w-12 h-12" : "w-8 h-8";
  const fontSize = size === "lg" ? "text-4xl" : "text-lg";

  return avatar ? (
    <Image source={{ uri: avatar }} className={`${dimensions} rounded-full`} />
  ) : (
    <View
      className={`${dimensions} rounded-full bg-primary/20 items-center justify-center`}
    >
      <Text className={`text-primary font-manropeBold ${fontSize}`}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
};

export default UserAvatar;
