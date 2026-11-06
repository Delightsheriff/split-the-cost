import { useAuth } from "@/src/contexts/AuthContext";
import { useDeleteAccount } from "@/src/services/auth.service";
import { useGroups } from "@/src/services/group.service";
import { useTheme } from "@/src/theme/theme";
import { Avatar } from "@/src/ui/Avatar";
import { Moodling } from "@/src/ui/Moodling";
import { PressableScale } from "@/src/ui/PressableScale";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ChevronRight, HelpCircle, Info, SunMoon, type LucideIcon } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

const VERSION_TAPS = 5;

function SettingRow({
  icon: Icon,
  title,
  value,
  right,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  value?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale static onPress={onPress} className="flex-row items-center gap-3 px-4 h-14">
      <Icon size={20} color={colors.inkMuted} strokeWidth={2} />
      <Text className="flex-1 text-ink font-manropeSemi text-base">{title}</Text>
      <View className="flex-row items-center gap-1">
        {right}
        {value && <Text className="text-ink-muted font-manrope text-[15px]">{value}</Text>}
        {onPress && <ChevronRight size={18} color={colors.inkFaint} />}
      </View>
    </PressableScale>
  );
}

export default function Profile() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const deleteAccount = useDeleteAccount();
  const { data: loaded } = useGroups();
  const groups = loaded ?? [];
  const reduceMotion = useReducedMotion();

  const [secret, setSecret] = useState(false);
  const taps = useRef(0);

  // Long-press the avatar for a spin.
  const spin = useSharedValue(0);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));

  if (!user) return null;

  const people = new Set(groups.flatMap((g) => g.members.map((m) => m._id)).filter((id) => id !== user._id)).size;
  // The mood follows the currency you have the most riding on.
  const balance = groups.reduce((best, g) => (Math.abs(g.myBalanceCents) > Math.abs(best) ? g.myBalanceCents : best), 0);

  const logOut = async () => {
    await signOut();
    router.replace("/(public)/auth/login");
  };

  const confirmDelete = () =>
    Alert.alert(
      "Delete your account?",
      "You'll leave every group and can't sign back in. Expenses you were part of stay in the groups so everyone else's balances still add up.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteAccount.mutateAsync().then(
              () => router.replace("/(public)"),
              (error) => Alert.alert("Couldn't delete", error instanceof Error ? error.message : ""),
            ),
        },
      ],
    );

  const tapVersion = () => {
    taps.current += 1;
    if (taps.current < VERSION_TAPS) return;
    taps.current = 0;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSecret((s) => !s);
  };

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View className="items-center pt-8">
        <PressableScale
          onLongPress={() => {
            if (reduceMotion) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            spin.set(withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 0 })));
          }}
          accessibilityLabel={`${user.name}'s photo`}
        >
          <Animated.View style={spinStyle}>
            <Avatar user={user} size="xl" />
          </Animated.View>
        </PressableScale>
        <Text className="text-ink font-manropeHeavy text-2xl mt-4">{user.name}</Text>
        <Text className="text-ink-muted font-manrope text-[15px] mt-1">{user.email}</Text>
      </View>

      <View className="flex-row gap-3 mt-8">
        <View className="flex-1 bg-surface rounded-3xl p-4">
          <Text className="text-ink font-manropeHeavy text-3xl" style={{ fontVariant: ["tabular-nums"] }}>
            {loaded ? groups.length : "–"}
          </Text>
          <Text className="text-ink-muted font-manropeSemi text-[13px] mt-1">{groups.length === 1 ? "group" : "groups"}</Text>
        </View>
        <View className="flex-1 bg-surface rounded-3xl p-4">
          <Text className="text-ink font-manropeHeavy text-3xl" style={{ fontVariant: ["tabular-nums"] }}>
            {loaded ? people : "–"}
          </Text>
          <Text className="text-ink-muted font-manropeSemi text-[13px] mt-1">{people === 1 ? "person" : "people"}</Text>
        </View>
        <View className="flex-1 bg-surface rounded-3xl items-center justify-center">
          {/* Held back until balances arrive, so it never flashes the settled mood first. */}
          {loaded ? <Moodling balanceCents={balance} size={64} /> : <View style={{ width: 64, height: 64 }} />}
        </View>
      </View>

      <View className="bg-surface rounded-3xl mt-6 overflow-hidden">
        <SettingRow icon={SunMoon} title="Appearance" value="Matches your phone" />
        <View className="h-px bg-line ml-12" />
        <SettingRow icon={HelpCircle} title="Help & support" onPress={() => router.push("/(app)/help")} />
        <View className="h-px bg-line ml-12" />
        <SettingRow icon={Info} title="About" onPress={() => router.push("/(app)/about")} />
      </View>

      <PressableScale haptic onPress={logOut} className="bg-surface rounded-full py-4 items-center mt-6">
        <Text className="text-neg font-manropeBold text-base">Log out</Text>
      </PressableScale>

      <PressableScale static onPress={confirmDelete} disabled={deleteAccount.isPending} className="items-center py-3 mt-3">
        <Text className="text-ink-muted font-manropeSemi text-sm">{deleteAccount.isPending ? "Deleting…" : "Delete account"}</Text>
      </PressableScale>

      <PressableScale static onPress={tapVersion} accessibilityLabel="App version" className="items-center py-3 mt-4">
        <Text className="text-ink-faint font-manrope text-xs">Version {Constants.expoConfig?.version ?? "1.0.0"}</Text>
        {secret && (
          <Animated.Text entering={FadeInDown.duration(300)} className="text-ink-muted font-manropeSemi text-xs mt-1">
            No cents were harmed in the making of this app.
          </Animated.Text>
        )}
      </PressableScale>
    </ScrollView>
  );
}
