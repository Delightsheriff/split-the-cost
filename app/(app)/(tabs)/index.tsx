import EmptyState from "@/src/components/ui/EmptyState";
import GroupCard from "@/src/components/ui/GroupCard";
import { useGroups } from "@/src/services/group.service";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

const Index = () => {
  const router = useRouter();
  const { data: groups, isLoading, error, refetch } = useGroups();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center px-6">
        <Text className="text-red-500 text-center mb-4">
          Failed to load groups
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-background-dark font-manropeBold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-dark">
      {/* Header Bit */}
      <View className="px-6 py-6 border-b border-white/5">
        <Text className="text-4xl font-extrabold tracking-tight text-white font-manropeBold">
          My Groups
        </Text>
        <Text className="text-base font-medium text-slate-400 font-manrope mt-1">
          {groups?.length || 0} groups
        </Text>
      </View>

      <View className="flex-1 px-6">
        <FlatList
          data={groups}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onPress={() => router.push(`/(app)/group/${item._id}` as any)}
            />
          )}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyState}
          refreshing={isLoading}
          onRefresh={refetch}
        />

        {/* FAB Bit */}
        <Pressable
          onPress={() => router.push("/(app)/group/create")}
          className="absolute bottom-6 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/50"
          style={{ elevation: 8 }}
        >
          <Plus size={28} color="#0d1a0f" strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
};

export default Index;
