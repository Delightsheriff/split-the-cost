import { useAuth } from "@/src/contexts/AuthContext";
import { byDay } from "@/src/domain/dates";
import { formatMoney, type Cents } from "@/src/domain/money";
import { useAddMembers, useDeleteGroup, useGroupDetails, useLeaveGroup, useUpdateGroup } from "@/src/services/group.service";
import { useDeleteSettlement } from "@/src/services/settlement.service";
import { useTheme } from "@/src/theme/theme";
import type { Expense, GroupMember, Payment, Settlement } from "@/src/types";
import { Avatar } from "@/src/ui/Avatar";
import { CategoryBadge } from "@/src/ui/CategoryBadge";
import { Money } from "@/src/ui/Money";
import { Moodling, moodFor } from "@/src/ui/Moodling";
import { PressableScale } from "@/src/ui/PressableScale";
import { SpendBar } from "@/src/ui/SpendBar";
import * as Linking from "expo-linking";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight, Ellipsis, HandCoins, Plus } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActionSheetIOS, ActivityIndicator, Alert, Modal, Pressable, ScrollView, Share, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TimelineItem = { kind: "expense"; date: string; expense: Expense } | { kind: "settlement"; date: string; settlement: Settlement };

const HEADLINE = { owed: "You're owed", settled: "All square", owes: "You owe" };

export default function GroupDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [showBalances, setShowBalances] = useState(false);
  const [now] = useState(() => new Date());

  const { data, isLoading, refetch } = useGroupDetails(id || "");
  const updateGroup = useUpdateGroup();
  const leaveGroup = useLeaveGroup();
  const addMembers = useAddMembers();
  const deleteGroup = useDeleteGroup();
  const deleteSettlement = useDeleteSettlement();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (isLoading || !data) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  const { group, expenses, settlements, myBalanceCents, suggestedPayments } = data;
  const money = (cents: Cents) => formatMoney(cents, group.currency);
  const me = user?._id;
  const isCreator = group.createdBy === me;
  const name = (m: GroupMember) => (m._id === me ? "You" : m.name.split(" ")[0]);

  const timeline = byDay<TimelineItem>(
    [
      ...expenses.map((expense) => ({ kind: "expense" as const, date: expense.date, expense })),
      ...settlements.map((settlement) => ({ kind: "settlement" as const, date: settlement.date, settlement })),
    ],
    (item) => item.date,
    now,
  );

  /** Opens settle up for a payment in the plan: yours to make, or someone's to you. */
  const settle = (p: Payment) => {
    setShowBalances(false);
    router.push({
      pathname: "/(app)/settle",
      params: { groupId: id, paidBy: p.from._id, paidTo: p.to._id, amountCents: String(p.cents) },
    });
  };

  const fail = (title: string) => (error: unknown) => Alert.alert(title, error instanceof Error ? error.message : "Something went wrong");

  const shareInvite = () =>
    Share.share({
      message: `Join "${group.name}" on Split the Cost: ${Linking.createURL(`join/${group.inviteCode}`)}`,
    });

  const addPeople = () =>
    Alert.prompt(
      "Add people",
      "Their email. Anyone without an account joins when they sign up.",
      (email) => email?.trim() && addMembers.mutateAsync({ id: group._id, emails: [email.trim()] }).catch(fail("Couldn't add them")),
      "plain-text",
      "",
      "email-address",
    );

  const rename = () =>
    Alert.prompt(
      "Rename group",
      undefined,
      (name) => name && updateGroup.mutateAsync({ id: group._id, name }).catch(fail("Couldn't rename")),
      "plain-text",
      group.name,
    );

  const leave = () =>
    Alert.alert("Leave this group?", "You'll stop seeing its expenses.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => leaveGroup.mutateAsync(group._id).then(() => router.back(), fail("Couldn't leave")),
      },
    ]);

  const remove = () =>
    Alert.alert("Delete this group?", "Every expense and payment in it is deleted for everyone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteGroup.mutateAsync(group._id).then(() => router.back(), fail("Couldn't delete")),
      },
    ]);

  const openMenu = () => {
    const actions = [
      { label: "Add people", run: addPeople },
      { label: "Share invite link", run: shareInvite },
      { label: "Rename group", run: rename },
      { label: "Leave group", run: leave, destructive: true },
      ...(isCreator ? [{ label: "Delete group", run: remove, destructive: true }] : []),
    ];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...actions.map((a) => a.label), "Cancel"],
        cancelButtonIndex: actions.length,
        destructiveButtonIndex: actions.flatMap((a, i) => (a.destructive ? [i] : [])),
      },
      (index) => actions[index]?.run(),
    );
  };

  const undoPayment = (settlementId: string) =>
    Alert.alert("Undo this payment?", "The balances go back to how they were before it.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Undo",
        style: "destructive",
        onPress: () => deleteSettlement.mutateAsync({ id: settlementId, groupId: group._id }).catch(fail("Couldn't undo")),
      },
    ]);

  /** What this expense did to your balance: what you paid minus your share. */
  const yourPart = (e: Expense) => {
    const share = e.shares.find((s) => s.user._id === me)?.cents ?? 0;
    const paid = e.payers.find((p) => p.user._id === me)?.cents ?? 0;
    if (!share && !paid) return null;
    const net = paid - share;
    return { label: net > 0 ? "you lent" : net < 0 ? "you borrowed" : "you're even", cents: net };
  };

  const renderItem = (item: TimelineItem) => {
    if (item.kind === "settlement") {
      const s = item.settlement;
      const mine = s.paidBy._id === me || s.paidTo._id === me;
      return (
        <Pressable
          key={s._id}
          disabled={!mine}
          onLongPress={() => undoPayment(s._id)}
          accessibilityHint={mine ? "Long press to undo this payment" : undefined}
          className="flex-row items-center gap-3 py-3"
        >
          <View className="w-11 h-11 rounded-full bg-surface-muted items-center justify-center">
            <HandCoins size={20} color={colors.ink} strokeWidth={2} />
          </View>
          <Text className="flex-1 text-ink-muted font-manropeSemi text-[15px]">
            {name(s.paidBy)} paid {s.paidTo._id === me ? "you" : name(s.paidTo)}
          </Text>
          <Money cents={s.amountCents} currency={group.currency} tone="muted" className="text-[15px]" />
        </Pressable>
      );
    }
    const e = item.expense;
    const part = yourPart(e);
    return (
      <PressableScale
        key={e._id}
        static
        onPress={() => router.push({ pathname: "/(app)/expense/[id]", params: { id: e._id, groupId: id } })}
        className="flex-row items-center gap-3 py-3"
      >
        <CategoryBadge type={e.type} />
        <View className="flex-1">
          <Text className="text-ink font-manropeBold text-base" numberOfLines={1}>
            {e.description}
          </Text>
          <Text className="text-ink-muted font-manrope text-[13px]" numberOfLines={1}>
            {name(e.paidBy)}
            {e.payers.length > 1 ? ` + ${e.payers.length - 1}` : ""} paid {money(e.amountCents)}
          </Text>
        </View>
        <View className="items-end">
          {part ? (
            <>
              <Text className="text-ink-muted font-manrope text-xs">{part.label}</Text>
              <Money cents={part.cents} currency={group.currency} tone="signed" className="text-[15px]" />
            </>
          ) : (
            <Text className="text-ink-faint font-manrope text-xs">not involved</Text>
          )}
        </View>
      </PressableScale>
    );
  };

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen
        options={{
          title: group.name,
          headerRight: () => (
            <Pressable onPress={openMenu} hitSlop={12} accessibilityLabel="Group options">
              <Ellipsis size={22} color={colors.ink} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 96 }} showsVerticalScrollIndicator={false}>
        <View className="mx-5 mt-2 rounded-3xl bg-surface p-5">
          <View className="flex-row items-center gap-4">
            <Moodling balanceCents={myBalanceCents} size={76} />
            <View className="flex-1">
              <Text className="text-ink-muted font-manropeSemi text-[15px]">{HEADLINE[moodFor(myBalanceCents)]}</Text>
              {myBalanceCents !== 0 ? (
                <Money cents={myBalanceCents} currency={group.currency} tone="signed" className="text-3xl font-manropeHeavy" />
              ) : (
                <Text className="text-ink font-manropeHeavy text-3xl">{money(0)}</Text>
              )}
            </View>
          </View>
          <PressableScale
            haptic
            onPress={() => setShowBalances(true)}
            className={`mt-4 rounded-2xl py-3.5 items-center ${myBalanceCents < 0 ? "bg-ink" : "bg-surface-muted"}`}
          >
            <Text className={`font-manropeBold text-base ${myBalanceCents < 0 ? "text-bg" : "text-ink"}`}>
              {myBalanceCents < 0 ? "Settle up" : "Balances"}
            </Text>
          </PressableScale>

          {expenses.length > 0 && (
            <View className="mt-5 pt-5 border-t border-line">
              <Text className="text-ink-muted font-manropeSemi text-[13px] mb-3">
                Spent together · <Text className="text-ink font-manropeBold">{money(expenses.reduce((s, e) => s + e.amountCents, 0))}</Text>
              </Text>
              <SpendBar expenses={expenses} currency={group.currency} />
            </View>
          )}
        </View>

        {timeline.length === 0 ? (
          <View className="items-center px-10 pt-14">
            <Text className="text-ink font-manropeBold text-lg">Nothing here yet</Text>
            <Text className="text-ink-muted font-manrope text-center mt-1">
              {group.members.length > 1
                ? "Add the first expense and it's split between everyone straight away."
                : "It's just you so far. Invite the others, then add the first expense."}
            </Text>
            {group.members.length === 1 && (
              <PressableScale haptic onPress={shareInvite} className="bg-surface rounded-full px-5 py-3 mt-5">
                <Text className="text-ink font-manropeBold">Share invite link</Text>
              </PressableScale>
            )}
          </View>
        ) : (
          timeline.map((day) => (
            <View key={day.label} className="px-5 mt-6">
              <Text className="text-ink-muted font-manropeBold text-[13px] uppercase tracking-wider mb-1">{day.label}</Text>
              {day.items.map(renderItem)}
            </View>
          ))
        )}
      </ScrollView>

      <View pointerEvents="box-none" className="absolute left-0 right-0 items-center" style={{ bottom: insets.bottom + 12 }}>
        <PressableScale
          haptic
          onPress={() => router.push({ pathname: "/(app)/expense/create", params: { groupId: id } })}
          className="flex-row items-center gap-2 bg-lime rounded-full pl-5 pr-6 py-4"
          style={{ boxShadow: "0 8px 24px rgba(19, 236, 91, 0.35)" }}
        >
          <Plus size={20} color="#0E0E10" strokeWidth={2.75} />
          <Text className="text-onfill font-manropeBold text-base">Add expense</Text>
        </PressableScale>
      </View>

      <BalancesSheet
        visible={showBalances}
        onClose={() => setShowBalances(false)}
        payments={suggestedPayments}
        me={me}
        currency={group.currency}
        onSettle={settle}
        myPayments={settlements.filter((s) => s.paidBy._id === me || s.paidTo._id === me)}
        onUndo={undoPayment}
      />
    </View>
  );
}

function BalancesSheet({
  visible,
  onClose,
  payments,
  me,
  currency,
  onSettle,
  myPayments,
  onUndo,
}: {
  visible: boolean;
  onClose: () => void;
  payments: Payment[];
  me?: string;
  currency: string;
  onSettle: (payment: Payment) => void;
  myPayments: Settlement[];
  onUndo: (settlementId: string) => void;
}) {
  const { colors } = useTheme();
  const mine = payments.filter((p) => p.from._id === me || p.to._id === me);
  const others = payments.filter((p) => p.from._id !== me && p.to._id !== me);
  const name = (m: GroupMember) => (m._id === me ? "You" : m.name.split(" ")[0]);

  const row = (p: Payment) => (
    <View key={`${p.from._id}-${p.to._id}`} className="flex-row items-center gap-3 bg-surface rounded-3xl p-4 mb-3">
      <View className="flex-row items-center gap-1.5">
        <Avatar user={p.from} size="sm" />
        <ArrowRight size={16} color={colors.inkFaint} />
        <Avatar user={p.to} size="sm" />
      </View>
      <View className="flex-1">
        <Text className="text-ink font-manropeSemi text-[15px]" numberOfLines={1}>
          {name(p.from)} → {name(p.to)}
        </Text>
        <Money cents={p.cents} currency={currency} className="text-base" />
      </View>
      {p.from._id === me && (
        <PressableScale haptic onPress={() => onSettle(p)} className="bg-ink rounded-full px-4 py-2.5">
          <Text className="text-bg font-manropeBold">Pay</Text>
        </PressableScale>
      )}
      {p.to._id === me && (
        <PressableScale haptic onPress={() => onSettle(p)} className="bg-surface-muted rounded-full px-4 py-2.5">
          <Text className="text-ink font-manropeBold">Got it</Text>
        </PressableScale>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-bg">
        <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
          <Text className="text-ink font-manropeHeavy text-2xl">Who pays who</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text className="text-ink-muted font-manropeBold text-base">Done</Text>
          </Pressable>
        </View>
        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
          {payments.length === 0 ? (
            <View className="items-center pt-16 gap-4">
              <Moodling balanceCents={0} size={96} />
              <Text className="text-ink font-manropeBold text-lg">Everyone&apos;s square</Text>
            </View>
          ) : (
            <>
              {mine.length > 0 && mine.map(row)}
              {others.length > 0 && (
                <>
                  <Text className="text-ink-muted font-manropeBold text-[13px] uppercase tracking-wider mt-4 mb-3">Between others</Text>
                  {others.map(row)}
                </>
              )}
              <Text className="text-ink-faint font-manrope text-[13px] mt-2">
                Debts are simplified across the group, so these payments leave everyone even.
              </Text>
            </>
          )}

          {myPayments.length > 0 && (
            <>
              <Text className="text-ink-muted font-manropeBold text-[13px] uppercase tracking-wider mt-8 mb-3">Your payments</Text>
              {myPayments.map((s) => (
                <View key={s._id} className="flex-row items-center gap-3 py-2.5">
                  <View className="flex-1">
                    <Text className="text-ink font-manropeSemi text-[15px]">
                      {s.paidBy._id === me ? `You paid ${s.paidTo.name.split(" ")[0]}` : `${s.paidBy.name.split(" ")[0]} paid you`}
                    </Text>
                    <Text className="text-ink-muted font-manrope text-[13px]">
                      {formatMoney(s.amountCents, currency)} ·{" "}
                      {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Text>
                  </View>
                  <Pressable onPress={() => onUndo(s._id)} hitSlop={10}>
                    <Text className="text-neg font-manropeBold">Undo</Text>
                  </Pressable>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
