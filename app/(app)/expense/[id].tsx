import { ExpenseIcon } from "@/src/components/ui/ExpenseIcon";
import { useAuth } from "@/src/contexts/AuthContext";
import { formatMoney } from "@/src/domain/money";
import { useDeleteExpense } from "@/src/services/expense.service";
import { useGroupDetails } from "@/src/services/group.service";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SPLIT_LABELS = {
  equal: "Split equally",
  exact: "Split by exact amounts",
  percent: "Split by percentage",
  shares: "Split by shares",
};

export default function ExpenseDetails() {
  const { id, groupId } = useLocalSearchParams<{
    id: string;
    groupId: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data, isLoading } = useGroupDetails(groupId || "");
  const deleteExpense = useDeleteExpense();

  const expense = data?.expenses.find((e) => e._id === id);

  if (isLoading || !expense || !data) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  const money = (cents: number) => formatMoney(cents, data.group.currency);
  const paidById = expense.paidBy._id;
  const isUserPayer = paidById === user?._id;
  // Debts are simplified across the group, so only offer to settle if the plan has you paying this payer.
  const payToPayer = data.suggestedPayments.find((p) => p.from._id === user?._id && p.to._id === paidById);

  const confirmDelete = () =>
    Alert.alert("Delete this expense?", "Everyone's balances will be recalculated without it.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteExpense.mutateAsync({ id: expense._id, groupId: expense.groupId }).then(
            () => router.back(),
            (error) => Alert.alert("Couldn't delete", error instanceof Error ? error.message : ""),
          ),
      },
    ]);

  return (
    <View className="flex-1 bg-background-dark">
      <Stack.Screen
        options={{
          title: "Expense Details",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        className="flex-1 px-6 py-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-4">
            <ExpenseIcon type={expense.type} />
          </View>
          <Text className="text-5xl font-extrabold text-white font-manropeBold">
            {money(expense.amountCents)}
          </Text>
          <Text className="text-slate-400 text-lg font-manrope mt-1">
            {expense.description}
          </Text>
          <View className="mt-4 bg-white/5 px-4 py-1.5 rounded-full">
            <Text className="text-slate-400 text-xs font-manrope">
              Paid by {isUserPayer ? "You" : expense.paidBy.name} •{" "}
              {new Date(expense.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
          <View className="px-5 py-4 border-b border-white/5 bg-white/5">
            <Text className="text-white text-xs uppercase tracking-widest font-manropeBold">
              {SPLIT_LABELS[expense.split.type]}
            </Text>
          </View>

          {expense.shares.map(({ user: member, cents }) => {
            const isMemberPayer = member._id === paidById;
            const isMemberUser = member._id === user?._id;
            const settleCents = isMemberUser && !isMemberPayer ? (payToPayer?.cents ?? 0) : 0;

            return (
              <View
                key={member._id}
                className="flex-row items-center justify-between px-5 py-5 border-b border-white/5 last:border-b-0"
              >
                <View className="flex-1">
                  <Text className="text-white text-base font-manropeBold">
                    {member.name} {isMemberUser && "(You)"}
                  </Text>
                  <Text className="text-slate-400 text-xs font-manrope mt-1">
                    {isMemberPayer ? "Paid the bill" : `Share: ${money(cents)}`}
                  </Text>
                </View>

                <View className="items-end">
                  <Text
                    className={`text-lg font-manropeBold ${
                      isMemberPayer ? "text-primary" : "text-white"
                    }`}
                  >
                    {isMemberPayer ? "+" : "-"}
                    {money(isMemberPayer ? expense.amountCents - cents : cents)}
                  </Text>

                  {settleCents > 0 && (
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/(app)/expense/SettlementCreate",
                          params: { groupId, paidTo: paidById, amountCents: String(settleCents) },
                        })
                      }
                      className="bg-primary px-3 py-1 rounded-md mt-2"
                    >
                      <Text className="text-background-dark text-[10px] font-manropeBold uppercase">
                        Settle {money(settleCents)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View className="flex-row gap-3 mt-8 mb-16">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(app)/expense/create",
                params: { groupId, expenseId: expense._id },
              })
            }
            className="flex-1 rounded-xl py-4 items-center bg-surface-dark border border-white/5"
          >
            <Text className="text-white text-base font-manropeBold">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmDelete}
            disabled={deleteExpense.isPending}
            className="flex-1 rounded-xl py-4 items-center bg-red-500/10 border border-red-500/30"
          >
            <Text className="text-red-400 text-base font-manropeBold">Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
