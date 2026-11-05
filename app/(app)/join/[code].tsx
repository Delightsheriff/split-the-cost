import { useAcceptInvite, useInvite } from "@/src/services/group.service";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";

// Opened from an invite link: splitthecostapp://join/<code>.
export default function JoinGroup() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const inviteCode = (code ?? "").toUpperCase();
  const { data, isLoading, error } = useInvite(inviteCode);
  const accept = useAcceptInvite();

  const openGroup = (groupId: string) =>
    router.replace({ pathname: "/(app)/group/[id]", params: { id: groupId } });

  const join = () =>
    accept.mutateAsync(inviteCode).then(
      (group) => openGroup(group._id),
      (e) => Alert.alert("Couldn't join", e instanceof Error ? e.message : ""),
    );

  return (
    <View className="flex-1 bg-background-dark items-center justify-center px-8">
      <Stack.Screen options={{ title: "Join Group", headerShown: true, presentation: "modal" }} />
      {isLoading ? (
        <ActivityIndicator size="large" color="#13ec5b" />
      ) : !data ? (
        <Text className="text-slate-400 text-base font-manrope text-center">
          {error instanceof Error ? error.message : "This invite link isn't valid"}
        </Text>
      ) : (
        <>
          <Text className="text-slate-400 text-sm font-manrope mb-2">You&apos;re invited to</Text>
          <Text className="text-white text-4xl font-manropeBold text-center mb-2">{data.group.name}</Text>
          <Text className="text-slate-400 text-sm font-manrope mb-10">
            {data.group.memberCount} {data.group.memberCount === 1 ? "member" : "members"} · {data.group.currency}
          </Text>
          <TouchableOpacity
            onPress={() => (data.alreadyMember ? openGroup(data.group._id) : join())}
            disabled={accept.isPending}
            className="w-full rounded-xl py-4 items-center bg-primary"
          >
            {accept.isPending ? (
              <ActivityIndicator color="#0d1a0f" />
            ) : (
              <Text className="text-[#0d1a0f] text-lg font-manropeBold">
                {data.alreadyMember ? "Open group" : "Join group"}
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
