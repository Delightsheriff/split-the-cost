import React, { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface Activity {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  type: string;
  icon: string;
  groupName: string;
}

const FILTER_OPTIONS = ["All", "This Week", "This Month", "Unsettled"];

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "1",
    title: "Friday Pizza Night",
    subtitle: "Alice paid in Flatmates",
    amount: 54.0,
    date: "TODAY",
    type: "food",
    icon: "🍕",
    groupName: "Flatmates",
  },
  {
    id: "2",
    title: "Flight Tickets",
    subtitle: "You paid in Bali Trip",
    amount: 200.0,
    date: "TODAY",
    type: "transport",
    icon: "✈️",
    groupName: "Bali Trip",
  },
  {
    id: "3",
    title: "Drinks at the Pub",
    subtitle: "Bob added to Office Party",
    amount: 32.5,
    date: "YESTERDAY",
    type: "food",
    icon: "🍺",
    groupName: "Office Party",
  },
  {
    id: "4",
    title: "Weekly Groceries",
    subtitle: "Sarah paid in Flatmates",
    amount: 89.2,
    date: "YESTERDAY",
    type: "supplies",
    icon: "🛒",
    groupName: "Flatmates",
  },
  {
    id: "5",
    title: "Cinema Tickets",
    subtitle: "You paid in Dates",
    amount: 45.0,
    date: "YESTERDAY",
    type: "other",
    icon: "🎬",
    groupName: "Dates",
  },
  {
    id: "6",
    title: "Internet Bill",
    subtitle: "Mike paid in Flatmates",
    amount: 60.0,
    date: "THIS WEEK",
    type: "other",
    icon: "📡",
    groupName: "Flatmates",
  },
];

const Index = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const groupedActivities = MOCK_ACTIVITIES.reduce(
    (acc, activity) => {
      if (!acc[activity.date]) {
        acc[activity.date] = [];
      }
      acc[activity.date].push(activity);
      return acc;
    },
    {} as Record<string, Activity[]>
  );

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <View className="bg-surface-dark rounded-xl p-4 mb-3 mx-6 border border-white/5">
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-full items-center justify-center bg-white/10">
          <Text className="text-2xl">{item.icon}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-white text-base font-semibold font-manrope mb-1">
            {item.title}
          </Text>
          <Text className="text-slate-400 text-sm font-medium font-manrope">
            {item.subtitle}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-primary text-lg font-bold font-manropeBold mb-1">
            ${item.amount.toFixed(2)}
          </Text>
          <Text className="text-slate-500 text-xs font-medium font-manrope">
            {item.groupName}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSectionHeader = (section: string) => (
    <View className="px-6 py-3">
      <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider font-manrope">
        {section}
      </Text>
    </View>
  );

  const flattenedData = Object.entries(groupedActivities).flatMap(
    ([date, activities]) => [
      { id: `header-${date}`, type: "header", date },
      ...activities.map((activity) => ({ ...activity, type: "item" })),
    ]
  );

  return (
    <View className="flex-1 bg-background-dark">
      {/* Header */}
      <View className="px-6 py-6 border-b border-white/5">
        <Text className="text-4xl font-extrabold tracking-tight text-white font-manropeBold">
          Activity
        </Text>
      </View>

      {/* Filter Tabs */}
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

      {/* Activity List */}
      <FlatList
        data={flattenedData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return renderSectionHeader(item.date);
          }
          return renderActivityItem({ item: item as Activity });
        }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Index;
