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

            // Check settlement status for each member (not just current user)
            let memberOwes = false;
            let memberSettled = false;

            if (!isPayer) {
              if (isCurrentUser) {
                // For current user, check if they owe the payer
                const pairBalanceWithPayer = pairBalances?.find(
                  (b) => b.userId === paidById,
                );
                memberOwes = pairBalanceWithPayer
                  ? pairBalanceWithPayer.balance < 0
                  : true;
                memberSettled = pairBalanceWithPayer
                  ? pairBalanceWithPayer.balance >= 0
                  : false;
              } else if (user?._id === paidById) {
                // If current user is the payer, check if this member still owes them
                const pairBalanceWithMember = pairBalances?.find(
                  (b) => b.userId === memberId,
                );
                memberOwes = pairBalanceWithMember
                  ? pairBalanceWithMember.balance > 0
                  : true;
                memberSettled = pairBalanceWithMember
                  ? pairBalanceWithMember.balance <= 0
                  : false;
              } else {
                // Neither current user nor payer - cannot determine settlement status
                memberOwes = false;
                memberSettled = false;
              }
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
                        ? memberSettled
                          ? `Split settled ($${splitAmount.toFixed(2)})`
                          : memberOwes
                            ? `Still owes overall`
                            : `Split: $${splitAmount.toFixed(2)} (part of total debt)`
                        : memberSettled
                          ? `Settled ($${splitAmount.toFixed(2)})`
                          : `Owes $${splitAmount.toFixed(2)}`}
                  </Text>
                </View>
                <View className="items-end">
                  {isPayer ? (
                    <Text className="text-primary text-base font-bold font-manropeBold">
                      +${splitAmount.toFixed(2)}
                    </Text>
                  ) : memberSettled ? (
                    <Text className="text-slate-500 text-base font-bold font-manropeBold">
                      $0.00
                    </Text>
                  ) : isCurrentUser && memberOwes ? (
                    <View className="items-end">
                      <Text className="text-red-400 text-base font-bold font-manropeBold">
                        -${splitAmount.toFixed(2)}
                      </Text>
                      {(() => {
                        const pairBalance = pairBalances?.find(
                          (b) => b.userId === paidById,
                        );
                        const totalOwed = pairBalance
                          ? Math.abs(pairBalance.balance)
                          : 0;
                        if (totalOwed !== splitAmount) {
                          return (
                            <Text className="text-slate-400 text-xs font-manrope">
                              (${totalOwed.toFixed(2)} total)
                            </Text>
                          );
                        }
                        return null;
                      })()}
                    </View>
                  ) : (
                    <Text className="text-red-400 text-base font-bold font-manropeBold">
                      -${splitAmount.toFixed(2)}
                    </Text>
                  )}
                  {isCurrentUser && memberOwes && (
                    <TouchableOpacity
                      onPress={() => {
                        // Get the actual amount owed to this payer from pair balances
                        const pairBalance = pairBalances?.find(
                          (b) => b.userId === paidById,
                        );
                        const actualAmountOwed = pairBalance
                          ? Math.abs(pairBalance.balance).toFixed(2)
                          : splitAmount.toFixed(2);

                        router.push({
                          pathname: "/(app)/expense/SettlementCreate",
                          params: {
                            groupId: groupId,
                            paidTo: paidById,
                            amount: actualAmountOwed,
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
