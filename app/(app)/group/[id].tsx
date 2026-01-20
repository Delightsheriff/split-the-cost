import BalanceCard from "@/src/components/ui/BalanceCard";
import { ExpenseIcon } from "@/src/components/ui/ExpenseIcon";
import { useAuth } from "@/src/contexts/AuthContext";
import { useGroupDetails } from "@/src/services/group.service";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SETTLEMENT_THRESHOLD = 0.01;

export default function GroupDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [showBalancesModal, setShowBalancesModal] = useState(false);

  const { data, isLoading } = useGroupDetails(id || "");

  if (isLoading || !data) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  const { group, expenses, currentUserBalance, pairBalances } = data;

  const balanceAmount = Math.abs(currentUserBalance.balance).toFixed(2);

  const membersWhoOweMe = pairBalances.filter(
    (b) => b.balance > SETTLEMENT_THRESHOLD,
  );
  const membersIOwe = pairBalances.filter(
    (b) => b.balance < -SETTLEMENT_THRESHOLD,
  );

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
              ${item.amount.toFixed(2)}
            </Text>
            {userPaid ? (
              <Text className="text-primary text-xs font-bold font-manrope">
                You paid
              </Text>
            ) : (
              <Text className="text-slate-400 text-xs font-bold font-manrope">
                Split
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background-dark">
      <Stack.Screen options={{ title: group.name }} />
      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        renderItem={renderExpenseItem}
        ListHeaderComponent={
          <BalanceCard
            amount={balanceAmount}
            isOwed={currentUserBalance.isOwed}
            userBalance={currentUserBalance.balance}
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
                  currentUserBalance.isSettled
                    ? "text-slate-400"
                    : currentUserBalance.isOwed
                      ? "text-primary"
                      : "text-red-400"
                }`}
              >
                ${balanceAmount}
              </Text>
            </View>
            <View className="px-6 py-4">
              {membersIOwe.length > 0 && (
                <View className="mb-6">
                  <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
                    You Owe
                  </Text>
                  {membersIOwe.map((member) => (
                    <View
                      key={member.userId}
                      className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
                    >
                      <View className="flex-1">
                        <Text className="text-white text-base font-semibold">
                          {member.name}
                        </Text>
                        <Text className="text-slate-400 text-xs">You owe</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setShowBalancesModal(false);
                          router.push({
                            pathname: "/(app)/expense/SettlementCreate",
                            params: {
                              groupId: id,
                              paidTo: member.userId,
                              amount: Math.abs(member.balance).toFixed(2),
                            },
                          });
                        }}
                        className="bg-primary px-4 py-2 rounded-lg"
                      >
                        <Text className="text-background-dark text-xs font-manropeBold">
                          Settle ${Math.abs(member.balance).toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              {membersWhoOweMe.length > 0 && (
                <View>
                  <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
                    Owes You
                  </Text>
                  {membersWhoOweMe.map((member) => (
                    <View
                      key={member.userId}
                      className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
                    >
                      <View className="flex-1">
                        <Text className="text-white text-base font-semibold">
                          {member.name}
                        </Text>
                        <Text className="text-slate-400 text-xs">Owes you</Text>
                      </View>
                      <Text className="text-primary text-lg font-bold font-manropeBold">
                        ${member.balance.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {membersIOwe.length === 0 && membersWhoOweMe.length === 0 && (
                <View className="items-center py-12">
                  <Text className="text-slate-500 text-base font-manrope">
                    All settled up! 🎉
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
