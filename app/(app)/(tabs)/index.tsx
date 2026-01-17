import EmptyState from "@/src/components/ui/EmptyState";
import GroupCard from "@/src/components/ui/GroupCard";
import { DUMMY_GROUPS } from "@/src/services/data";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

const Index = () => {
  const [pressed, setPressed] = useState(false);
  const router = useRouter();

  const handleCreateGroup = () => {
    router.push("/(app)/group/create");
  };

  return (
    <View className="flex-1 bg-background-dark">
      {/* Updated Header: Matches Profile Style */}
      <View className="px-6 py-6 border-b border-white/5 bg-background-dark">
        <Text className="text-4xl font-extrabold tracking-tight text-white font-manropeBold">
          My Groups
        </Text>
        <Text className="text-base font-medium text-slate-400 font-manrope mt-1">
          Total Balance: <Text className="text-primary font-bold">$1,250</Text>
        </Text>
      </View>

      {/* Main Content Container */}
      <View className="flex-1 px-6">
        {/* Group Listing */}
        <FlatList
          data={DUMMY_GROUPS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onPress={() => router.push(`/(app)/group/${item.id}` as any)}
            />
          )}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyState}
        />

        {/* Create Group Button */}
        <Pressable
          onPress={handleCreateGroup}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          className="absolute bottom-6 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/50"
          style={{
            elevation: 8,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          }}
        >
          <Plus size={28} color="#0d1a0f" strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
};

export default Index;
