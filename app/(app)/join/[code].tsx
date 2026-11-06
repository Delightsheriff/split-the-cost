import { useAcceptInvite, useInvite } from "@/src/services/group.service";
import { memberColor } from "@/src/theme/tokens";
import { PressableScale } from "@/src/ui/PressableScale";
import { SheetHeader } from "@/src/ui/SheetHeader";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

// Opened from an invite link: splitthecostapp://join/<code>.
export default function JoinGroup() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const inviteCode = (code ?? "").toUpperCase();
  const { data, isLoading, error } = useInvite(inviteCode);
  const accept = useAcceptInvite();

  const openGroup = (groupId: string) => router.replace({ pathname: "/(app)/group/[id]", params: { id: groupId } });

  const join = () =>
    accept.mutateAsync(inviteCode).then(
      (group) => openGroup(group._id),
      (e) => Alert.alert("Couldn't join", e instanceof Error ? e.message : ""),
    );

  return (
    <View className="flex-1 bg-bg">
      <SheetHeader title="Invite" onClose={() => router.back()} />
      <View className="flex-1 items-center justify-center px-8">
        {isLoading ? (
          <ActivityIndicator />
        ) : !data ? (
          <>
            <Text className="text-ink font-manropeBold text-lg">That link didn&apos;t work</Text>
            <Text className="text-ink-muted font-manrope text-[15px] text-center mt-1">
              {error instanceof Error ? error.message : "Ask whoever sent it for a fresh one."}
            </Text>
          </>
        ) : (
          <>
            <Animated.View
              entering={ZoomIn.springify().damping(14)}
              style={{ backgroundColor: memberColor(data.group._id) }}
              className="w-24 h-24 rounded-[30px] items-center justify-center"
            >
              <Text className="text-onfill font-manropeHeavy text-4xl">{Array.from(data.group.name)[0]?.toUpperCase()}</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(300).delay(100)} className="items-center mt-6">
              <Text className="text-ink-muted font-manropeSemi text-[15px]">You&apos;re invited to</Text>
              <Text className="text-ink font-manropeHeavy text-4xl text-center mt-1">{data.group.name}</Text>
              <Text className="text-ink-muted font-manrope text-[15px] mt-2">
                {data.group.memberCount} {data.group.memberCount === 1 ? "person" : "people"} · {data.group.currency}
              </Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(300).delay(200)} className="self-stretch mt-10">
              <PressableScale
                haptic
                onPress={() => (data.alreadyMember ? openGroup(data.group._id) : join())}
                disabled={accept.isPending}
                className="bg-lime rounded-full h-14 items-center justify-center"
              >
                {accept.isPending ? (
                  <ActivityIndicator color="#0E0E10" />
                ) : (
                  <Text className="text-onfill font-manropeBold text-base">{data.alreadyMember ? "Open group" : "Join group"}</Text>
                )}
              </PressableScale>
            </Animated.View>
          </>
        )}
      </View>
    </View>
  );
}
