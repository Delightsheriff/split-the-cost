import { memberColor } from "@/src/theme/tokens";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

type Person = { _id: string; name: string; avatar?: string };

const SIZES = { xs: 24, sm: 32, md: 44, lg: 64, xl: 96 } as const;
export type AvatarSize = keyof typeof SIZES;

/** A person's photo, or their initial on their own colour. */
export function Avatar({ user, size = "md", ring }: { user: Person; size?: AvatarSize; ring?: boolean }) {
  const d = SIZES[size];
  const frame = {
    width: d,
    height: d,
    borderRadius: d / 2,
    // A ring in the background colour separates overlapping avatars.
    ...(ring && { borderWidth: Math.max(2, d / 16) }),
  };
  return user.avatar ? (
    <Image source={{ uri: user.avatar }} style={frame} className={ring ? "border-bg" : ""} />
  ) : (
    <View style={[frame, { backgroundColor: memberColor(user._id) }]} className={`items-center justify-center ${ring ? "border-bg" : ""}`}>
      <Text style={{ fontSize: d * 0.42, color: "#0E0E10", fontFamily: "Manrope-ExtraBold" }}>
        {user.name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

/** Overlapping avatars with a "+N" when there are more than `max`. */
export function AvatarStack({ users, size = "sm", max = 4 }: { users: Person[]; size?: AvatarSize; max?: number }) {
  const d = SIZES[size];
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <View className="flex-row items-center">
      {shown.map((u, i) => (
        <View key={u._id} style={{ marginLeft: i === 0 ? 0 : -d / 3 }}>
          <Avatar user={u} size={size} ring />
        </View>
      ))}
      {extra > 0 && (
        <View
          style={{ width: d, height: d, borderRadius: d / 2, marginLeft: -d / 3, borderWidth: Math.max(2, d / 16) }}
          className="bg-surface-muted border-bg items-center justify-center"
        >
          <Text className="text-ink font-manropeBold" style={{ fontSize: d * 0.34 }}>
            +{extra}
          </Text>
        </View>
      )}
    </View>
  );
}
