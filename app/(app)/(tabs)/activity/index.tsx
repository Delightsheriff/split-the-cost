import { byDay } from "@/src/domain/dates";
import { Activity, useActivities } from "@/src/services/activity.service";
import { useTheme } from "@/src/theme/theme";
import { Avatar } from "@/src/ui/Avatar";
import { CategoryBadge } from "@/src/ui/CategoryBadge";
import { Money } from "@/src/ui/Money";
import { Moodling } from "@/src/ui/Moodling";
import { PressableScale } from "@/src/ui/PressableScale";
import { useFocusEffect, useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

const FILTERS = ["All", "This Week", "This Month"];

const first = (name: string) => name.split(" ")[0];

function subtitle(activity: Activity) {
  if (activity.type === "expense") {
    return `${activity.paidByCurrentUser ? "You" : first(activity.paidBy.name)} paid · ${activity.groupName}`;
  }
  const from = activity.paidByCurrentUser ? "You" : first(activity.paidBy.name);
  const to = activity.paidToCurrentUser ? "you" : first(activity.paidTo.name);
  return `${from} paid ${to} · ${activity.groupName}`;
}

function Row({ activity, onPress }: { activity: Activity; onPress?: () => void }) {
  const { colors } = useTheme();
  const settlement = activity.type === "settlement";
  return (
    <PressableScale static onPress={onPress} accessibilityRole={onPress ? "button" : undefined} className="flex-row items-center gap-3 py-3">
      {settlement ? (
        <View className="flex-row items-center" style={{ width: 44 }}>
          <Avatar user={{ _id: activity.paidBy.id, name: activity.paidBy.name }} size="xs" />
          <View style={{ marginLeft: -6, marginTop: 14 }}>
            <Avatar user={{ _id: activity.paidTo.id, name: activity.paidTo.name }} size="xs" ring />
          </View>
        </View>
      ) : (
        <CategoryBadge type={activity.expenseType} />
      )}
      <View className="flex-1">
        <Text className="text-ink font-manropeBold text-base" numberOfLines={1}>
          {settlement ? activity.note || "Payment" : activity.description}
        </Text>
        <Text className="text-ink-muted font-manrope text-[13px] mt-0.5" numberOfLines={1}>
          {subtitle(activity)}
        </Text>
      </View>
      {settlement ? (
        <View className="flex-row items-center gap-1">
          <ArrowRight size={14} color={colors.inkFaint} />
          <Money cents={activity.amountCents} currency={activity.currency} tone="muted" className="text-base" />
        </View>
      ) : (
        <Money cents={activity.amountCents} currency={activity.currency} className="text-base" />
      )}
    </PressableScale>
  );
}

export default function ActivityScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const { data: activities = [], isLoading, refetch } = useActivities(filter);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const days = useMemo(() => byDay(activities, (a) => a.date, new Date()), [activities]);

  return (
    <View className="flex-1 bg-bg">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-ink font-manropeHeavy text-4xl tracking-tight">Activity</Text>
        <View className="flex-row gap-2 mt-4">
          {FILTERS.map((f) => (
            <PressableScale
              key={f}
              onPress={() => setFilter(f)}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f }}
              className={`px-4 py-2 rounded-full ${filter === f ? "bg-ink" : "bg-surface"}`}
            >
              <Text className={`font-manropeBold text-sm ${filter === f ? "text-bg" : "text-ink"}`}>{f}</Text>
            </PressableScale>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : activities.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Moodling balanceCents={0} size={96} />
          <Text className="text-ink font-manropeBold text-lg mt-5">Quiet in here</Text>
          <Text className="text-ink-muted font-manrope text-[15px] text-center mt-1">
            {filter === "All" ? "Expenses and payments from all your groups land here." : "Nothing in this stretch. Try a wider filter."}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {days.map((day) => (
            <View key={day.label} className="mt-4">
              <Text className="text-ink-faint font-manropeBold text-xs uppercase tracking-widest">{day.label}</Text>
              {day.items.map((a) => (
                <Row
                  key={a.id}
                  activity={a}
                  onPress={
                    a.type === "expense"
                      ? () => router.push({ pathname: "/(app)/expense/[id]", params: { id: a.id, groupId: a.groupId } })
                      : undefined
                  }
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
