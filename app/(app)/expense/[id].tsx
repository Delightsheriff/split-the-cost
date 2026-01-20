import { ExpenseIcon } from "@/src/components/ui/ExpenseIcon";
import { useAuth } from "@/src/contexts/AuthContext";
import { useGroupDetails } from "@/src/services/group.service";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SETTLEMENT_THRESHOLD = 0.01;

export default function ExpenseDetails() {
  const { id, groupId } = useLocalSearchParams<{
    id: string;
    groupId: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data, isLoading } = useGroupDetails(groupId || "");

  const expense = data?.expenses.find((e) => e._id === id);

  if (isLoading || !expense || !data) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  const { pairBalances } = data;
  const splitAmount = expense.amount / expense.splitBetween.length;
  const paidById = expense.paidBy._id;
  const isUserPayer = paidById === user?._id;

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
            ${expense.amount.toFixed(2)}
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
              Split Breakdown
            </Text>
          </View>

          {expense.splitBetween.map((member) => {
            const memberId = member._id;
            const isMemberPayer = memberId === paidById;
            const isMemberUser = memberId === user?._id;

            // Check pair balance if this member owes current user
            let showSettleButton = false;
            let totalOwed = splitAmount;

            if (!isMemberPayer && isMemberUser) {
              // Current user is in the split and didn't pay
              // Check if they still owe the payer
              const pairBalance = pairBalances.find(
                (p) => p.userId === paidById,
              );

              if (pairBalance && pairBalance.balance < -SETTLEMENT_THRESHOLD) {
                // User owes the payer (negative balance)
                showSettleButton = true;
                totalOwed = Math.abs(pairBalance.balance);
              }
            }

            return (
              <View
                key={memberId}
                className="flex-row items-center justify-between px-5 py-5 border-b border-white/5 last:border-b-0"
              >
                <View className="flex-1">
                  <Text className="text-white text-base font-manropeBold">
                    {member.name} {isMemberUser && "(You)"}
                  </Text>
                  <Text className="text-slate-400 text-xs font-manrope mt-1">
                    {isMemberPayer
                      ? "Paid the bill"
                      : `Share: $${splitAmount.toFixed(2)}`}
                  </Text>
                </View>

                <View className="items-end">
                  <Text
                    className={`text-lg font-manropeBold ${
                      isMemberPayer ? "text-primary" : "text-white"
                    }`}
                  >
                    {isMemberPayer ? "+" : "-"}${splitAmount.toFixed(2)}
                  </Text>

                  {showSettleButton && (
                    <TouchableOpacity
                      onPress={() => {
                        router.push({
                          pathname: "/(app)/expense/SettlementCreate",
                          params: {
                            groupId: groupId,
                            paidTo: paidById,
                            amount: totalOwed.toFixed(2),
                          },
                        });
                      }}
                      className="bg-primary px-3 py-1 rounded-md mt-2"
                    >
                      <Text className="text-background-dark text-[10px] font-manropeBold uppercase">
                        Settle ${totalOwed.toFixed(2)}
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
