import { Activity, useActivities } from "@/src/services/activity.service";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const FILTER_OPTIONS = ["All", "This Week", "This Month"];

const EXPENSE_ICONS: Record<string, string> = {
  food: "🍕",
  transport: "✈️",
  supplies: "🛒",
  fuel: "⛽",
  other: "💰",
};

function getExpenseIcon(type: string): string {
  return EXPENSE_ICONS[type] || "💰";
}

function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "YESTERDAY";
  if (diffDays <= 7) return "THIS WEEK";
  if (diffDays <= 30) return "THIS MONTH";
  return "OLDER";
}

function formatActivityTitle(activity: Activity): string {
  if (activity.type === "expense") {
    return activity.description;
  }
  return activity.note || "Settlement";
}

function formatActivitySubtitle(activity: Activity): string {
  if (activity.type === "expense") {
    const { paidBy, paidByCurrentUser, groupName } = activity;
    return paidByCurrentUser
      ? `You paid in ${groupName}`
      : `${paidBy.name} paid in ${groupName}`;
  }

  const { paidBy, paidTo, paidByCurrentUser, paidToCurrentUser, groupName } =
    activity;

  if (paidByCurrentUser) {
    return `You settled with ${paidTo.name} in ${groupName}`;
  }

  if (paidToCurrentUser) {
    return `${paidBy.name} settled with you in ${groupName}`;
  }

  return `${paidBy.name} settled with ${paidTo.name} in ${groupName}`;
}

function getActivityIcon(activity: Activity): string {
  if (activity.type === "expense") {
    return getExpenseIcon(activity.expenseType);
  }
  return "✅";
}

type FlatListItem =
  | { id: string; type: "header"; dateLabel: string }
  | (Activity & { type: "expense" | "settlement" });

export default function ActivityScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("All");

  const {
    data: activities = [],
    isLoading,
    refetch,
  } = useActivities(selectedFilter);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const flattenedData = useMemo(() => {
    const grouped = activities.reduce(
      (acc, activity) => {
        const dateLabel = formatDateLabel(activity.date);
        if (!acc[dateLabel]) {
          acc[dateLabel] = [];
        }
        acc[dateLabel].push(activity);
        return acc;
      },
      {} as Record<string, Activity[]>,
    );

    const items: FlatListItem[] = [];

    Object.entries(grouped).forEach(([dateLabel, groupActivities]) => {
      items.push({ id: `header-${dateLabel}`, type: "header", dateLabel });
      items.push(...groupActivities);
    });

    return items;
  }, [activities]);

  const handleActivityPress = (activity: Activity) => {
    if (activity.type === "expense") {
      router.push({
        pathname: "/(app)/expense/[id]",
        params: { id: activity.id, groupId: activity.groupId },
      });
    }
  };

  const renderActivityItem = (activity: Activity) => {
    return (
      <TouchableOpacity
        onPress={() => handleActivityPress(activity)}
        className="bg-surface-dark rounded-xl p-4 mb-3 mx-6 border border-white/5 active:border-white/20"
      >
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full items-center justify-center bg-white/10">
            <Text className="text-2xl">{getActivityIcon(activity)}</Text>
          </View>

          <View className="flex-1">
            <Text className="text-white text-base font-semibold font-manrope mb-1">
              {formatActivityTitle(activity)}
            </Text>
            <Text className="text-slate-400 text-sm font-medium font-manrope">
              {formatActivitySubtitle(activity)}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-primary text-lg font-bold font-manropeBold mb-1">
              ${activity.amount.toFixed(2)}
            </Text>
            <Text className="text-slate-500 text-xs font-medium font-manrope">
              {activity.groupName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (dateLabel: string) => (
    <View className="px-6 py-3">
      <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider font-manrope">
        {dateLabel}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: FlatListItem }) => {
    if (item.type === "header") {
      return renderSectionHeader(item.dateLabel);
    }
    return renderActivityItem(item);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-dark">
      <View className="px-6 py-6 border-b border-white/5">
        <Text className="text-4xl font-extrabold tracking-tight text-white font-manropeBold">
          Activity
        </Text>
      </View>

      <View className="px-6 py-4">
        <View className="flex-row gap-2">
          {FILTER_OPTIONS.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full ${
                selectedFilter === filter
                  ? "bg-primary"
                  : "bg-surface-dark border border-white/10"
              }`}
            >
              <Text
                className={`text-sm font-semibold font-manrope ${
                  selectedFilter === filter ? "text-[#0d1a0f]" : "text-white"
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activities.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-slate-500 text-base font-manrope text-center">
            No activities yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={flattenedData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
