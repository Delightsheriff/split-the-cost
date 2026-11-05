import BalanceCard from "@/src/components/ui/BalanceCard";
import { ExpenseIcon } from "@/src/components/ui/ExpenseIcon";
import { useAuth } from "@/src/contexts/AuthContext";
import { formatMoney, type Cents } from "@/src/domain/money";
import {
  useDeleteGroup,
  useGroupDetails,
  useLeaveGroup,
  useUpdateGroup,
} from "@/src/services/group.service";
import { useDeleteSettlement } from "@/src/services/settlement.service";
import * as Linking from "expo-linking";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { Ellipsis, Plus } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function GroupDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [showBalancesModal, setShowBalancesModal] = useState(false);

  const { data, isLoading, refetch } = useGroupDetails(id || "");
  const updateGroup = useUpdateGroup();
  const leaveGroup = useLeaveGroup();
  const deleteGroup = useDeleteGroup();
  const deleteSettlement = useDeleteSettlement();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (isLoading || !data) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  const { group, expenses, settlements, myBalanceCents, suggestedPayments } = data;
  const money = (cents: Cents) => formatMoney(cents, group.currency);
  const isCreator = group.createdBy === user?._id;

  const iPay = suggestedPayments.filter((p) => p.from._id === user?._id);
  const iGet = suggestedPayments.filter((p) => p.to._id === user?._id);
  const between = suggestedPayments.filter((p) => p.from._id !== user?._id && p.to._id !== user?._id);
  const myPayments = settlements.filter(
    (s) => s.paidBy._id === user?._id || s.paidTo._id === user?._id,
  );

  const settleWith = (paidTo: string, amountCents: Cents) => {
    setShowBalancesModal(false);
    router.push({
      pathname: "/(app)/expense/SettlementCreate",
      params: { groupId: id, paidTo, amountCents: String(amountCents) },
    });
  };

  const fail = (title: string) => (error: unknown) =>
    Alert.alert(title, error instanceof Error ? error.message : "Something went wrong");

  const shareInvite = () =>
    Share.share({
      message: `Join "${group.name}" on Split the Cost: ${Linking.createURL(`join/${group.inviteCode}`)}`,
    });

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
        onPress: () =>
          leaveGroup.mutateAsync(group._id).then(() => router.back(), fail("Couldn't leave")),
      },
    ]);

  const remove = () =>
    Alert.alert("Delete this group?", "Every expense and payment in it is deleted for everyone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteGroup.mutateAsync(group._id).then(() => router.back(), fail("Couldn't delete")),
      },
    ]);

  const openMenu = () => {
    const actions = [
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
        onPress: () =>
          deleteSettlement
            .mutateAsync({ id: settlementId, groupId: group._id })
            .catch(fail("Couldn't undo")),
      },
    ]);

  const renderExpenseItem = ({ item }: { item: (typeof expenses)[0] }) => {
    const userPaid = item.paidBy._id === user?._id;

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(app)/expense/[id]",
            params: { id: item._id, groupId: id },
          })
        }
        className="bg-surface-dark rounded-xl p-4 border border-white/5 mx-6 mb-3 active:border-white/20"
      >
        <View className="flex-row items-center gap-3">
          <ExpenseIcon type={item.type} />
          <View className="flex-1">
            <Text className="text-white text-base font-semibold font-manrope">
              {item.description}
            </Text>
            <Text className="text-slate-400 text-xs font-manrope">
              Paid by {userPaid ? "You" : item.paidBy.name}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-white text-lg font-bold font-manropeBold">
              {money(item.amountCents)}
            </Text>
            {userPaid ? (
              <Text className="text-primary text-xs font-bold font-manrope">
                You paid
              </Text>
            ) : (
              <Text className="text-slate-400 text-xs font-bold font-manrope">
                {item.split.type === "equal" ? "Split" : `Split by ${item.split.type}`}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background-dark">
      <Stack.Screen
        options={{
          title: group.name,
          headerRight: () => (
            <Pressable onPress={openMenu} hitSlop={12} accessibilityLabel="Group options">
              <Ellipsis size={22} color="#ffffff" />
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        renderItem={renderExpenseItem}
        ListHeaderComponent={
          <BalanceCard
            balanceCents={myBalanceCents}
            currency={group.currency}
            onPress={() => setShowBalancesModal(true)}
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(app)/expense/create",
            params: { groupId: id },
          })
        }
        className="absolute bottom-8 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-2xl"
      >
        <Plus size={28} color="#0d1a0f" strokeWidth={2.5} />
      </Pressable>

      <Modal
        visible={showBalancesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBalancesModal(false)}
      >
        <View className="flex-1 bg-background-dark">
          <View className="px-6 py-6 border-b border-white/5 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => setShowBalancesModal(false)}>
              <Text className="text-primary text-lg font-manropeBold">
                Close
              </Text>
            </TouchableOpacity>
            <Text className="text-white text-xl font-manropeBold">
              Balances
            </Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView className="flex-1">
            <View className="px-6 py-10 items-center border-b border-white/5">
              <Text className="text-slate-400 text-xs uppercase font-manrope mb-2">
                Net Balance
              </Text>
              <Text
                className={`text-5xl font-extrabold font-manropeBold ${
                  myBalanceCents === 0
                    ? "text-slate-400"
                    : myBalanceCents > 0
                      ? "text-primary"
                      : "text-red-400"
                }`}
              >
                {money(Math.abs(myBalanceCents))}
              </Text>
            </View>
            <View className="px-6 py-4">
              {iPay.length > 0 && (
                <View className="mb-6">
                  <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
                    You Owe
                  </Text>
                  {iPay.map((p) => (
                    <View
                      key={p.to._id}
                      className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
                    >
                      <Text className="flex-1 text-white text-base font-semibold">{p.to.name}</Text>
                      <TouchableOpacity
                        onPress={() => settleWith(p.to._id, p.cents)}
                        className="bg-primary px-4 py-2 rounded-lg"
                      >
                        <Text className="text-background-dark text-xs font-manropeBold">
                          Pay {money(p.cents)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {iGet.length > 0 && (
                <View className="mb-6">
                  <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
                    Owes You
                  </Text>
                  {iGet.map((p) => (
                    <View
                      key={p.from._id}
                      className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
                    >
                      <Text className="flex-1 text-white text-base font-semibold">{p.from.name}</Text>
                      <Text className="text-primary text-lg font-bold font-manropeBold">
                        {money(p.cents)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {iPay.length === 0 && iGet.length === 0 && (
                <View className="items-center py-12">
                  <Text className="text-slate-500 text-base font-manrope">
                    All settled up! 🎉
                  </Text>
                </View>
              )}

              {between.length > 0 && (
                <View className="mb-6">
                  <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
                    Everyone Else
                  </Text>
                  {between.map((p) => (
                    <View
                      key={`${p.from._id}-${p.to._id}`}
                      className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
                    >
                      <Text className="flex-1 text-white text-base font-manrope">
                        {p.from.name} → {p.to.name}
                      </Text>
                      <Text className="text-white text-base font-manropeBold">{money(p.cents)}</Text>
                    </View>
                  ))}
                  <Text className="text-slate-500 text-xs font-manrope">
                    Debts are simplified, so everyone is even after these payments.
                  </Text>
                </View>
              )}

              {myPayments.length > 0 && (
                <View className="mb-6">
                  <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
                    Your Payments
                  </Text>
                  {myPayments.map((s) => (
                    <View
                      key={s._id}
                      className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
                    >
                      <View className="flex-1">
                        <Text className="text-white text-base font-semibold">
                          {s.paidBy._id === user?._id ? `You paid ${s.paidTo.name}` : `${s.paidBy.name} paid you`}
                        </Text>
                        <Text className="text-slate-400 text-xs">
                          {money(s.amountCents)} ·{" "}
                          {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => undoPayment(s._id)} hitSlop={8}>
                        <Text className="text-red-400 text-xs font-manropeBold">Undo</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
