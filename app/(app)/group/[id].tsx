// import { useAuth } from "@/src/contexts/AuthContext";
// import { useGroupExpenses } from "@/src/services/expense.service";
// import { useGroup } from "@/src/services/group.service";
// import { Stack, useLocalSearchParams, useRouter } from "expo-router";
// import { Plus } from "lucide-react-native";
// import {
//   ActivityIndicator,
//   FlatList,
//   Pressable,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const ExpenseIcon = ({ type }: { type: string }) => {
//   const icons = {
//     food: "🍽️",
//     transport: "🚕",
//     supplies: "🛒",
//     fuel: "⛽",
//     other: "💰",
//   };
//   return (
//     <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
//       <Text className="text-xl">
//         {icons[type as keyof typeof icons] || "💰"}
//       </Text>
//     </View>
//   );
// };

// export default function GroupDetails() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const router = useRouter();
//   const { user } = useAuth();

//   const {
//     data: group,
//     isLoading: groupLoading,
//     error: groupError,
//   } = useGroup(id);

//   const {
//     data: expenses,
//     isLoading: expensesLoading,
//     // error: expensesError,
//   } = useGroupExpenses(id);

//   if (groupLoading || expensesLoading) {
//     return (
//       <View className="flex-1 bg-background-dark items-center justify-center">
//         <ActivityIndicator size="large" color="#13ec5b" />
//       </View>
//     );
//   }

//   if (groupError || !group) {
//     return (
//       <View className="flex-1 bg-background-dark items-center justify-center px-6">
//         <Text className="text-red-500 text-center mb-4">
//           Failed to load group
//         </Text>
//         <Pressable
//           onPress={() => router.back()}
//           className="bg-primary px-6 py-3 rounded-full"
//         >
//           <Text className="text-background-dark font-manropeBold">Go Back</Text>
//         </Pressable>
//       </View>
//     );
//   }

//   // Calculate user's balance for this group
//   const calculateUserBalance = () => {
//     if (!expenses || !user) return 0;

//     let balance = 0;

//     expenses.forEach((expense) => {
//       const splitAmount = expense.amount / expense.splitBetween.length;

//       // User paid
//       if (expense.paidBy._id === user._id) {
//         balance += expense.amount - splitAmount; // They paid full, owe their share
//       }

//       // User is in split
//       if (expense.splitBetween.some((m) => m._id === user._id)) {
//         if (expense.paidBy._id !== user._id) {
//           balance -= splitAmount; // They owe their share
//         }
//       }
//     });

//     return balance;
//   };

//   const userBalance = calculateUserBalance();
//   const isOwed = userBalance > 0;
//   const balanceAmount = Math.abs(userBalance).toFixed(2);

//   const renderExpenseItem = ({ item }: { item: any }) => {
//     const splitAmount = item.amount / item.splitBetween.length;
//     const userIsInSplit = item.splitBetween.some(
//       (m: any) => m._id === user?._id,
//     );
//     const userPaid = item.paidBy._id === user?._id;

//     let youOwe = 0;
//     let youGet = 0;

//     if (userPaid && userIsInSplit) {
//       youGet = item.amount - splitAmount;
//     } else if (userPaid) {
//       youGet = item.amount;
//     } else if (userIsInSplit) {
//       youOwe = splitAmount;
//     }

//     const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//     });

//     return (
//       <View className="bg-surface-dark rounded-xl p-4 border border-white/5 mx-6 mb-3">
//         <View className="flex-row items-center gap-3">
//           <ExpenseIcon type={item.type} />

//           <View className="flex-1">
//             <Text className="text-white text-base font-semibold font-manrope mb-1">
//               {item.description}
//             </Text>
//             <Text className="text-slate-400 text-xs font-medium font-manrope">
//               Paid by {item.paidBy._id === user?._id ? "You" : item.paidBy.name}{" "}
//               • {formattedDate}
//             </Text>
//           </View>

//           <View className="items-end">
//             <Text className="text-white text-lg font-bold font-manropeBold mb-1">
//               ${item.amount.toFixed(2)}
//             </Text>
//             {youOwe > 0 && (
//               <Text className="text-red-400 text-xs font-bold font-manrope">
//                 You owe ${youOwe.toFixed(2)}
//               </Text>
//             )}
//             {youGet > 0 && (
//               <Text className="text-primary text-xs font-bold font-manrope">
//                 You get ${youGet.toFixed(2)}
//               </Text>
//             )}
//           </View>
//         </View>
//       </View>
//     );
//   };

//   const ListHeaderComponent = () => (
//     <>
//       <View className="px-6 pt-6 pb-4">
//         <View className="bg-surface-dark rounded-2xl p-6 border border-white/5 items-center">
//           <Text className="text-slate-400 text-sm font-medium uppercase tracking-wider font-manrope mb-2">
//             {isOwed
//               ? "You Are Owed"
//               : userBalance < 0
//                 ? "You Owe"
//                 : "Settled Up"}
//           </Text>
//           <Text
//             className={`text-5xl font-extrabold font-manropeBold mb-4 p-3 ${
//               isOwed
//                 ? "text-primary"
//                 : userBalance < 0
//                   ? "text-red-400"
//                   : "text-slate-400"
//             }`}
//           >
//             ${balanceAmount}
//           </Text>
//           {userBalance !== 0 && (
//             <TouchableOpacity className="w-full bg-[#13ec5b] rounded-xl py-4 items-center">
//               <Text className="text-[#0d1a0f] text-lg font-bold font-manropeBold">
//                 Settle Up
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       <View className="px-6 py-4">
//         <Text className="text-white text-xl font-bold font-manropeBold mb-1">
//           Expenses
//         </Text>
//       </View>
//     </>
//   );

//   const ListEmptyComponent = () => (
//     <View className="px-6 py-12 items-center">
//       <Text className="text-slate-400 text-base font-manrope text-center">
//         No expenses yet. Add your first expense!
//       </Text>
//     </View>
//   );

//   return (
//     <View className="flex-1 bg-background-dark">
//       <Stack.Screen options={{ title: group.name }} />

//       <FlatList
//         data={expenses}
//         keyExtractor={(item) => item._id}
//         renderItem={renderExpenseItem}
//         ListHeaderComponent={ListHeaderComponent}
//         ListEmptyComponent={ListEmptyComponent}
//         contentContainerStyle={{ paddingBottom: 100 }}
//         showsVerticalScrollIndicator={false}
//         refreshing={expensesLoading}
//         onRefresh={() => {}}
//       />

//       <Pressable
//         onPress={() =>
//           router.push({
//             pathname: "/(app)/expense/create",
//             params: { groupId: id },
//           })
//         }
//         className="absolute bottom-6 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/50"
//         style={{ elevation: 8 }}
//       >
//         <Plus size={28} color="#0d1a0f" strokeWidth={2.5} />
//       </Pressable>
//     </View>
//   );
// }

import { useAuth } from "@/src/contexts/AuthContext";
import { useGroupExpenses } from "@/src/services/expense.service";
import { useGroup } from "@/src/services/group.service";
import { useGroupBalances } from "@/src/services/settlement.service";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ExpenseIcon = ({ type }: { type: string }) => {
  const icons = {
    food: "🍽️",
    transport: "🚕",
    supplies: "🛒",
    fuel: "⛽",
    other: "💰",
  };
  return (
    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
      <Text className="text-xl">
        {icons[type as keyof typeof icons] || "💰"}
      </Text>
    </View>
  );
};

export default function GroupDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [showBalancesModal, setShowBalancesModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const { data: group, isLoading: groupLoading } = useGroup(id);
  const { data: expenses, isLoading: expensesLoading } = useGroupExpenses(id);
  const { data: balances, isLoading: balancesLoading } = useGroupBalances(id);

  if (groupLoading || expensesLoading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  if (!group) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center px-6">
        <Text className="text-red-500 text-center mb-4">
          Failed to load group
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-background-dark font-manropeBold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const userBalance =
    balances?.find((b) => b.userId === user?._id)?.balance || 0;
  const isOwed = userBalance > 0;
  const balanceAmount = Math.abs(userBalance).toFixed(2);

  // Get members who owe current user money
  const membersWhoOweMe =
    balances?.filter((b) => b.userId !== user?._id && b.balance < 0) || [];

  // Get members current user owes money to
  const membersIOwe =
    balances?.filter((b) => b.userId !== user?._id && b.balance > 0) || [];

  const renderExpenseItem = ({ item }: { item: any }) => {
    const splitAmount = item.amount / item.splitBetween.length;
    const userIsInSplit = item.splitBetween.some(
      (m: any) => m._id === user?._id,
    );
    const userPaid = item.paidBy._id === user?._id;

    let youOwe = 0;
    let youGet = 0;

    if (userPaid && userIsInSplit) {
      youGet = item.amount - splitAmount;
    } else if (userPaid) {
      youGet = item.amount;
    } else if (userIsInSplit) {
      youOwe = splitAmount;
    }

    const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return (
      <TouchableOpacity
        onPress={() => setSelectedExpense(item)}
        className="bg-surface-dark rounded-xl p-4 border border-white/5 mx-6 mb-3"
      >
        <View className="flex-row items-center gap-3">
          <ExpenseIcon type={item.type} />

          <View className="flex-1">
            <Text className="text-white text-base font-semibold font-manrope mb-1">
              {item.description}
            </Text>
            <Text className="text-slate-400 text-xs font-medium font-manrope">
              Paid by {item.paidBy._id === user?._id ? "You" : item.paidBy.name}{" "}
              • {formattedDate}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-white text-lg font-bold font-manropeBold mb-1">
              ${item.amount.toFixed(2)}
            </Text>
            {youOwe > 0 && (
              <Text className="text-red-400 text-xs font-bold font-manrope">
                You owe ${youOwe.toFixed(2)}
              </Text>
            )}
            {youGet > 0 && (
              <Text className="text-primary text-xs font-bold font-manrope">
                You get ${youGet.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeaderComponent = () => (
    <>
      <TouchableOpacity
        onPress={() => setShowBalancesModal(true)}
        className="px-6 pt-6 pb-4"
      >
        <View className="bg-surface-dark rounded-2xl p-6 border border-white/5 items-center">
          <Text className="text-slate-400 text-sm font-medium uppercase tracking-wider font-manrope mb-2">
            Total Balance
          </Text>
          <Text
            className={`text-5xl font-extrabold font-manropeBold mb-2 ${
              userBalance === 0
                ? "text-slate-400"
                : isOwed
                  ? "text-primary"
                  : "text-red-400"
            }`}
          >
            ${balanceAmount}
          </Text>
          <Text className="text-slate-400 text-sm font-manrope">
            {userBalance === 0
              ? "All settled up!"
              : isOwed
                ? "You are owed overall"
                : "You owe overall"}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="px-6 py-4">
        <Text className="text-white text-xl font-bold font-manropeBold mb-1">
          Expenses
        </Text>
      </View>
    </>
  );

  return (
    <View className="flex-1 bg-background-dark">
      <Stack.Screen options={{ title: group.name }} />

      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        renderItem={renderExpenseItem}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          <View className="px-6 py-12 items-center">
            <Text className="text-slate-400 text-base font-manrope text-center">
              No expenses yet. Add your first expense!
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(app)/expense/create",
            params: { groupId: id },
          })
        }
        className="absolute bottom-6 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/50"
        style={{ elevation: 8 }}
      >
        <Plus size={28} color="#0d1a0f" strokeWidth={2.5} />
      </Pressable>

      {/* Balances Modal */}
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
            {/* Total Balance */}
            <View className="px-6 py-6 items-center border-b border-white/5">
              <Text className="text-slate-400 text-sm uppercase tracking-wider font-manrope mb-2">
                Total Balance
              </Text>
              <Text
                className={`text-5xl font-extrabold font-manropeBold ${
                  userBalance === 0
                    ? "text-slate-400"
                    : isOwed
                      ? "text-primary"
                      : "text-red-400"
                }`}
              >
                ${balanceAmount}
              </Text>
              <Text className="text-slate-400 text-sm font-manrope mt-2">
                {userBalance === 0
                  ? "You're all settled up!"
                  : isOwed
                    ? "You are owed overall"
                    : "You owe overall"}
              </Text>
            </View>

            {/* Members I Owe */}
            {membersIOwe.length > 0 && (
              <View className="px-6 py-4">
                <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
                  You Owe
                </Text>
                {membersIOwe.map((member) => (
                  <View
                    key={member.userId}
                    className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
                  >
                    {member.avatar ? (
                      <Image
                        source={{ uri: member.avatar }}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                    ) : (
                      <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-3">
                        <Text className="text-primary text-lg font-manropeBold">
                          {member.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View className="flex-1">
                      <Text className="text-white text-base font-semibold font-manrope">
                        {member.name}
                      </Text>
                      <Text className="text-slate-400 text-xs font-manrope">
                        You owe
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-red-400 text-lg font-bold font-manropeBold">
                        ${Math.abs(member.balance).toFixed(2)}
                      </Text>
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
                        className="bg-primary px-4 py-1 rounded-lg mt-1"
                      >
                        <Text className="text-background-dark text-xs font-manropeBold">
                          Settle Up
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Members Who Owe Me */}
            {membersWhoOweMe.length > 0 && (
              <View className="px-6 py-4">
                <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
                  Owes You
                </Text>
                {membersWhoOweMe.map((member) => (
                  <View
                    key={member.userId}
                    className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
                  >
                    {member.avatar ? (
                      <Image
                        source={{ uri: member.avatar }}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                    ) : (
                      <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-3">
                        <Text className="text-primary text-lg font-manropeBold">
                          {member.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View className="flex-1">
                      <Text className="text-white text-base font-semibold font-manrope">
                        {member.name}
                      </Text>
                      <Text className="text-slate-400 text-xs font-manrope">
                        Owes you
                      </Text>
                    </View>

                    <Text className="text-primary text-lg font-bold font-manropeBold">
                      ${Math.abs(member.balance).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {balancesLoading && (
              <View className="py-12">
                <ActivityIndicator size="large" color="#13ec5b" />
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Expense Detail Modal */}
      <Modal
        visible={!!selectedExpense}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedExpense(null)}
      >
        {selectedExpense && (
          <View className="flex-1 bg-background-dark">
            <View className="px-6 py-6 border-b border-white/5 flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setSelectedExpense(null)}>
                <Text className="text-primary text-lg font-manropeBold">
                  Close
                </Text>
              </TouchableOpacity>
              <Text className="text-white text-xl font-manropeBold">
                Expense Details
              </Text>
              <View style={{ width: 60 }} />
            </View>

            <ScrollView className="flex-1 px-6 py-6">
              {/* Amount */}
              <View className="items-center py-6 border-b border-white/5">
                <ExpenseIcon type={selectedExpense.type} />
                <Text className="text-6xl font-extrabold font-manropeBold text-white mt-4">
                  ${selectedExpense.amount.toFixed(2)}
                </Text>
                <Text className="text-slate-400 text-lg font-manrope mt-2">
                  {selectedExpense.description}
                </Text>
              </View>

              {/* Paid By */}
              <View className="py-6 border-b border-white/5">
                <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
                  Paid By
                </Text>
                <View className="flex-row items-center">
                  {selectedExpense.paidBy.avatar ? (
                    <Image
                      source={{ uri: selectedExpense.paidBy.avatar }}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center mrContinue10:36 AM-3">
                      <Text className="text-blue-500 text-lg font-manropeBold">
                        {selectedExpense.paidBy.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text className="text-white text-lg font-manrope">
                    {selectedExpense.paidBy._id === user?._id
                      ? "You"
                      : selectedExpense.paidBy.name}
                  </Text>
                </View>
              </View>
              {/* Split Between */}
              <View className="py-6">
                <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
                  Split Between {selectedExpense.splitBetween.length} people
                </Text>
                {selectedExpense.splitBetween.map((member: any) => {
                  const splitAmount =
                    selectedExpense.amount /
                    selectedExpense.splitBetween.length;
                  return (
                    <View
                      key={member._id}
                      className="flex-row items-center justify-between py-3"
                    >
                      <View className="flex-row items-center flex-1">
                        {member.avatar ? (
                          <Image
                            source={{ uri: member.avatar }}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                            <Text className="text-primary text-sm font-manropeBold">
                              {member.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <Text className="text-white text-base font-manrope">
                          {member._id === user?._id ? "You" : member.name}
                        </Text>
                      </View>
                      <Text className="text-slate-400 text-base font-manrope">
                        ${splitAmount.toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Date */}
              <View className="py-4 border-t border-white/5">
                <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-2">
                  Date
                </Text>
                <Text className="text-white text-base font-manrope">
                  {new Date(selectedExpense.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}
