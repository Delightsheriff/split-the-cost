import { ExpenseIcon } from "@/src/components/ui/ExpenseIcon";
import { useAuth } from "@/src/contexts/AuthContext";
import { useGroupExpenses } from "@/src/services/expense.service";
import { useGroup } from "@/src/services/group.service";
import { usePairBalances } from "@/src/services/settlement.service";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExpenseDetails() {
  const { id, groupId } = useLocalSearchParams<{
    id: string;
    groupId: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data: group, isLoading: groupLoading } = useGroup(groupId);
  const { data: expenses, isLoading: expensesLoading } =
    useGroupExpenses(groupId);
  const { data: pairBalances } = usePairBalances(groupId, user?._id || "");

  const expense = expenses?.find((e) => e._id === id);

  if (groupLoading || expensesLoading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  if (!expense || !group) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <Text className="text-white text-base font-manrope">
          Expense not found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-dark">
      <Stack.Screen
        options={{
          title: "Expense Details",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView className="flex-1 px-6 py-8">
        <View className="items-center mb-8">
          <ExpenseIcon type={expense.type} />
          <Text className="text-5xl font-extrabold text-white mt-4 font-manropeBold">
            ${expense.amount.toFixed(2)}
          </Text>
          <Text className="text-slate-400 text-lg font-manrope mt-1">
            {expense.description}
          </Text>
        </View>

        <View className="py-4 border-b border-white/5 flex-row justify-between">
          <Text className="text-slate-400 font-manrope">Paid by</Text>
          <Text className="text-white font-manropeBold">
            {expense.paidBy._id === user?._id ? "You" : expense.paidBy.name}
          </Text>
        </View>

        <View className="py-4 border-b border-white/5">
          <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
            Split Between
          </Text>
          {expense.splitBetween.map((member: any) => {
            const splitAmount = expense.amount / expense.splitBetween.length;
            const paidById = expense.paidBy._id;
            const memberId = member._id;
            const isPayer = paidById === memberId;
            const isCurrentUser = memberId === user?._id;

            // For current user: check if they still owe the payer using pairwise balance
            let userOwes = false;
            let userSettled = false;
            if (isCurrentUser && !isPayer) {
              const pairBalanceWithPayer = pairBalances?.find(
                (b) => b.userId === paidById
              );
              // Negative balance means user owes the payer
              userOwes = pairBalanceWithPayer
                ? pairBalanceWithPayer.balance < 0
                : true; // If no balance data, assume they owe
              userSettled = pairBalanceWithPayer
                ? pairBalanceWithPayer.balance >= 0
                : false;
            }

            return (
              <View
                key={member._id}
                className="flex-row items-center justify-between py-3 border-b border-white/5 last:border-b-0"
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-white font-manropeBold">
                      {member.name}
                      {isCurrentUser && " (You)"}
                    </Text>
                  </View>
                  <Text className="text-slate-400 text-xs font-manrope mt-1">
                    {isPayer
                      ? "Paid their share"
                      : isCurrentUser
                        ? userSettled
                          ? `Settled $${splitAmount.toFixed(2)}`
                          : `Owes $${splitAmount.toFixed(2)}`
                        : `Owes $${splitAmount.toFixed(2)}`}
                  </Text>
                </View>
                <View className="items-end">
                  {isPayer ? (
                    <Text className="text-primary text-base font-bold font-manropeBold">
                      +${splitAmount.toFixed(2)}
                    </Text>
                  ) : isCurrentUser && userSettled ? (
                    <Text className="text-slate-500 text-base font-bold font-manropeBold">
                      $0.00
                    </Text>
                  ) : (
                    <Text className="text-red-400 text-base font-bold font-manropeBold">
                      -${splitAmount.toFixed(2)}
                    </Text>
                  )}
                  {userOwes && (
                    <TouchableOpacity
                      onPress={() => {
                        router.push({
                          pathname: "/(app)/expense/SettlementCreate",
                          params: {
                            groupId: groupId,
                            paidTo: paidById,
                            amount: splitAmount.toFixed(2),
                          },
                        });
                      }}
                      className="bg-primary px-4 py-2 rounded-lg mt-2"
                    >
                      <Text className="text-background-dark text-xs font-manropeBold">
                        Settle Up
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
