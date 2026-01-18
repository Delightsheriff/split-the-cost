import UserAvatar from "@/src/components/ui/UserAvatar";
import { useGroup } from "@/src/services/group.service";
import { useCreateSettlement } from "@/src/services/settlement.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettlementCreate() {
  const {
    groupId,
    paidTo,
    amount: initialAmount,
  } = useLocalSearchParams<{
    groupId: string;
    paidTo: string;
    amount: string;
  }>();

  const router = useRouter();
  const { data: group, isLoading: groupLoading } = useGroup(groupId);
  const createSettlement = useCreateSettlement();

  const [amount, setAmount] = useState(initialAmount || "");
  const [note, setNote] = useState("");

  const paidToMember = group?.members.find((m) => m._id === paidTo);
  const isSubmitting = createSettlement.isPending;

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      await createSettlement.mutateAsync({
        groupId,
        paidTo,
        amount: parseFloat(amount),
        note: note.trim() || undefined,
      });

      Alert.alert("Success", "Payment recorded!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to record payment");
      console.error(error);
    }
  };

  if (groupLoading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  if (!group || !paidToMember) return null;

  return (
    <View className="flex-1 bg-background-dark">
      {/* Header Bit */}
      <View className="px-6 py-6 border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary text-lg font-manropeBold">Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-6 py-8">
          {/* Recipient Bit */}
          <View className="items-center mb-8">
            <Text className="text-slate-400 text-sm font-manrope mb-4">
              You&apos;re settling with
            </Text>
            <UserAvatar
              name={paidToMember.name}
              avatar={paidToMember.avatar}
              size="lg"
            />
            <Text className="text-white text-2xl font-bold font-manropeBold mt-4">
              {paidToMember.name}
            </Text>
          </View>

          {/* Amount Input Bit */}
          <View className="items-center mb-8 py-8 border-y border-white/5">
            <View className="flex-row items-center">
              <Text className="text-slate-400 text-6xl font-bold font-manropeBold mr-2">
                $
              </Text>
              <TextInput
                className="text-white text-7xl font-bold font-manropeBold min-w-[150px]"
                placeholder="0.00"
                placeholderTextColor="#334155"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                editable={!isSubmitting}
                autoFocus
              />
            </View>
          </View>

          {/* Note Bit */}
          <View className="mb-8">
            <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
              Note (Optional)
            </Text>
            <TextInput
              className="bg-surface-dark rounded-xl p-4 text-white text-base font-manrope border border-white/5"
              placeholder="Add a note about this payment..."
              placeholderTextColor="#64748b"
              value={note}
              onChangeText={setNote}
              editable={!isSubmitting}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Date Bit */}
          <View className="mb-8">
            <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-2">
              Date
            </Text>
            <Text className="text-white text-base font-manrope">
              Today,{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Bit */}
      <View className="px-6 pb-8 pt-4 border-t border-white/5">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
          className={`w-full rounded-xl py-4 items-center ${
            !amount || parseFloat(amount) <= 0 || isSubmitting
              ? "bg-slate-700"
              : "bg-primary"
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0d1a0f" />
          ) : (
            <Text className="text-[#0d1a0f] text-lg font-bold font-manropeBold">
              Mark as Paid
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
