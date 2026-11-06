import { useAuth } from "@/src/contexts/AuthContext";
import { formatMoney } from "@/src/domain/money";
import { useDeleteExpense } from "@/src/services/expense.service";
import { useGroupDetails } from "@/src/services/group.service";
import { memberColor } from "@/src/theme/tokens";
import { Avatar } from "@/src/ui/Avatar";
import { CATEGORY_LABELS, CategoryBadge, asCategory } from "@/src/ui/CategoryBadge";
import { DonutRing } from "@/src/ui/DonutRing";
import { Money } from "@/src/ui/Money";
import { PressableScale } from "@/src/ui/PressableScale";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

const SPLIT_LABELS = {
  equal: "Split equally",
  exact: "Exact amounts",
  percent: "By percentage",
  shares: "By shares",
};

export default function ExpenseDetails() {
  const { id, groupId } = useLocalSearchParams<{ id: string; groupId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useGroupDetails(groupId || "");
  const deleteExpense = useDeleteExpense();

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  const expense = data?.expenses.find((e) => e._id === id);
  if (!data || !expense) {
    return (
      <View className="flex-1 bg-bg items-center justify-center px-10">
        <Text className="text-ink font-manropeBold text-lg">This expense is gone</Text>
        <Text className="text-ink-muted font-manrope text-[15px] text-center mt-1">Someone may have deleted it.</Text>
      </View>
    );
  }

  const money = (cents: number) => formatMoney(cents, data.group.currency);
  const payerId = expense.paidBy._id;
  const paidBy = new Map(expense.payers.map((p) => [p.user._id, p.cents]));
  const first = (name: string) => name.split(" ")[0];
  const payerNames = expense.payers.map((p) => (p.user._id === user?._id ? "you" : first(p.user.name))).join(" & ");
  // Debts are simplified across the group, so only offer to settle if the plan has you paying this payer.
  const payToPayer = data.suggestedPayments.find((p) => p.from._id === user?._id && p.to._id === payerId);
  const date = new Date(expense.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

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
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      <View className="items-center pt-6">
        <CategoryBadge type={expense.type} size={56} />
        <Text className="text-ink font-manropeBold text-xl mt-4 text-center">{expense.description}</Text>
        <Text className="text-ink-muted font-manropeSemi text-[13px] mt-1">
          {CATEGORY_LABELS[asCategory(expense.type)]} · {date}
        </Text>
      </View>

      <View className="items-center mt-6">
        <DonutRing
          size={260}
          total={expense.amountCents}
          segments={expense.shares.map((s) => ({ key: s.user._id, value: s.cents, color: memberColor(s.user._id), user: s.user }))}
        >
          <Money cents={expense.amountCents} currency={data.group.currency} className="text-3xl font-manropeHeavy" numberOfLines={1} adjustsFontSizeToFit />
          <Text className="text-ink-muted font-manropeSemi text-xs mt-1">{SPLIT_LABELS[expense.split.type]}</Text>
        </DonutRing>
      </View>

      <View className="bg-surface rounded-3xl px-4 mt-6">
        {expense.payers.map(({ user: payer, cents }, i) => (
          <View key={payer._id} className={`flex-row items-center gap-3 py-3.5 ${i > 0 ? "border-t border-line" : ""}`}>
            <Avatar user={payer} size="md" />
            <View className="flex-1">
              {i === 0 && <Text className="text-ink-muted font-manropeSemi text-[13px]">Paid by</Text>}
              <Text className="text-ink font-manropeBold text-base">{payer._id === user?._id ? "You" : payer.name}</Text>
            </View>
            <Money cents={cents} currency={data.group.currency} className="text-base" />
          </View>
        ))}
      </View>

      <View className="bg-surface rounded-3xl mt-3 px-4">
        {expense.shares.map(({ user: member, cents }, i) => {
          const paid = paidBy.get(member._id) ?? 0;
          const isPayer = paid > 0;
          const isYou = member._id === user?._id;
          const settleCents = isYou && !isPayer ? (payToPayer?.cents ?? 0) : 0;
          return (
            <View key={member._id} className={`flex-row items-center gap-3 py-3.5 ${i > 0 ? "border-t border-line" : ""}`}>
              <Avatar user={member} size="sm" />
              <View className="flex-1">
                <Text className="text-ink font-manropeBold text-[15px]">{isYou ? "You" : member.name}</Text>
                <Text className="text-ink-muted font-manrope text-[13px]">
                  {isPayer
                    ? paid > cents
                      ? `Paid ${money(paid)}, lent ${money(paid - cents)}`
                      : paid < cents
                        ? `Paid ${money(paid)}, owes ${money(cents - paid)}`
                        : "Paid their share"
                    : `Owes ${payerNames}`}
                </Text>
              </View>
              <Money cents={cents} currency={data.group.currency} tone="muted" className="text-[15px]" />
              {settleCents > 0 && (
                <PressableScale
                  haptic
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/expense/SettlementCreate",
                      params: { groupId, paidTo: payerId, amountCents: String(settleCents) },
                    })
                  }
                  accessibilityLabel={`Pay ${expense.paidBy.name} ${money(settleCents)}`}
                  className="bg-lime rounded-full px-3.5 py-2"
                >
                  <Text className="text-onfill font-manropeBold text-[13px]">Pay</Text>
                </PressableScale>
              )}
            </View>
          );
        })}
      </View>

      <View className="flex-row gap-3 mt-6">
        <PressableScale
          onPress={() => router.push({ pathname: "/(app)/expense/create", params: { groupId, expenseId: expense._id } })}
          className="flex-1 rounded-full py-4 items-center bg-ink"
        >
          <Text className="text-bg font-manropeBold text-base">Edit</Text>
        </PressableScale>
        <PressableScale onPress={confirmDelete} disabled={deleteExpense.isPending} className="flex-1 rounded-full py-4 items-center bg-surface">
          <Text className="text-neg font-manropeBold text-base">Delete</Text>
        </PressableScale>
      </View>
    </ScrollView>
  );
}
