import { useAuth } from "@/src/contexts/AuthContext";
import { formatMoney } from "@/src/domain/money";
import { useGroups } from "@/src/services/group.service";
import { useTheme } from "@/src/theme/theme";
import { memberColor } from "@/src/theme/tokens";
import type { Group } from "@/src/types";
import { AvatarStack } from "@/src/ui/Avatar";
import { Money } from "@/src/ui/Money";
import { Moodling, moodFor } from "@/src/ui/Moodling";
import { PressableScale } from "@/src/ui/PressableScale";
import { useFocusEffect, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useCallback } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

const HEADLINE = {
  owed: { title: "You're owed", line: "Nice. Your people are good for it." },
  settled: { title: "All square", line: "Nobody owes anybody. Peace." },
  owes: { title: "You owe", line: "Settle up before it gets awkward." },
};

/** Your balance across groups, one total per currency, biggest first. */
function totals(groups: Group[]) {
  const byCurrency = new Map<string, number>();
  for (const g of groups) byCurrency.set(g.currency, (byCurrency.get(g.currency) ?? 0) + g.myBalanceCents);
  return [...byCurrency].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
}

function Hero({ groups, name }: { groups: Group[]; name?: string }) {
  const [[currency, cents] = ["USD", 0], ...others] = totals(groups);
  const copy = HEADLINE[moodFor(cents)];
  return (
    <View className="px-5 pt-4 pb-6">
      <Text className="text-ink-muted font-manropeSemi text-base">Hey {name?.split(" ")[0] ?? "there"}</Text>
      <View className="flex-row items-center gap-5 mt-4">
        <Moodling balanceCents={cents} size={112} />
        <View className="flex-1">
          <Text className="text-ink font-manropeBold text-lg">{copy.title}</Text>
          {cents !== 0 && (
            <Money cents={cents} currency={currency} tone="signed" className="text-4xl font-manropeHeavy" numberOfLines={1} adjustsFontSizeToFit />
          )}
          {others
            .filter(([, c]) => c !== 0)
            .map(([cur, c]) => (
              <Text key={cur} className="text-ink-muted font-manropeSemi text-sm" style={{ fontVariant: ["tabular-nums"] }}>
                {c > 0 ? "+" : "−"} {formatMoney(Math.abs(c), cur)} in {cur} groups
              </Text>
            ))}
          <Text className="text-ink-muted font-manrope text-sm mt-1">{copy.line}</Text>
        </View>
      </View>
    </View>
  );
}

function GroupRow({ group, onPress }: { group: Group; onPress: () => void }) {
  const cents = group.myBalanceCents;
  return (
    <PressableScale onPress={onPress} className="mx-5 mb-3 rounded-3xl bg-surface p-4 flex-row items-center gap-4">
      <View style={{ backgroundColor: memberColor(group._id) }} className="w-14 h-14 rounded-2xl items-center justify-center">
        <Text className="text-onfill font-manropeHeavy text-2xl">{group.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View className="flex-1 gap-1.5">
        <Text className="text-ink font-manropeBold text-[17px]" numberOfLines={1}>
          {group.name}
        </Text>
        <AvatarStack users={group.members} size="xs" />
      </View>
      <View className="items-end">
        {cents === 0 ? (
          <Text className="text-ink-faint font-manropeSemi text-sm">Settled</Text>
        ) : (
          <>
            <Text className="text-ink-muted font-manrope text-xs">{cents > 0 ? "you're owed" : "you owe"}</Text>
            <Money cents={cents} currency={group.currency} tone="signed" className="text-base" />
          </>
        )}
      </View>
    </PressableScale>
  );
}

function Empty() {
  return (
    <View className="items-center px-10 pt-6">
      <Text className="text-ink font-manropeBold text-xl text-center">No groups yet</Text>
      <Text className="text-ink-muted font-manrope text-base text-center mt-2">
        Make one for the flat, the trip or the Friday lunch crew, then add what everyone spends.
      </Text>
    </View>
  );
}

export default function GroupsHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { data: groups, isLoading, error, refetch, isRefetching } = useGroups();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-bg items-center justify-center px-8">
        <Text className="text-ink font-manropeBold text-lg mb-1">Couldn&apos;t load your groups</Text>
        <Text className="text-ink-muted font-manrope text-center mb-5">{error.message}</Text>
        <PressableScale onPress={() => refetch()} className="bg-ink px-6 py-3 rounded-full">
          <Text className="text-bg font-manropeBold">Try again</Text>
        </PressableScale>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-bg"
      data={groups}
      keyExtractor={(g) => g._id}
      ListHeaderComponent={
        <>
          <Hero groups={groups ?? []} name={user?.name} />
          <View className="flex-row items-center justify-between px-5 mb-3">
            <Text className="text-ink font-manropeHeavy text-2xl">Groups</Text>
            <PressableScale
              haptic
              onPress={() => router.push("/(app)/group/create")}
              accessibilityRole="button"
              accessibilityLabel="New group"
              className="flex-row items-center gap-1.5 bg-ink rounded-full pl-3 pr-4 py-2"
            >
              <Plus size={18} color={colors.background} strokeWidth={2.5} />
              <Text className="text-bg font-manropeBold">New</Text>
            </PressableScale>
          </View>
        </>
      }
      renderItem={({ item }) => <GroupRow group={item} onPress={() => router.push(`/(app)/group/${item._id}`)} />}
      ListEmptyComponent={Empty}
      contentContainerStyle={{ paddingBottom: 40 }}
      contentInsetAdjustmentBehavior="automatic"
      refreshing={isRefetching}
      onRefresh={refetch}
      showsVerticalScrollIndicator={false}
    />
  );
}
