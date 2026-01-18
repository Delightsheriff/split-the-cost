// import BalanceCard from "@/src/components/ui/BalanceCard";
// import { ExpenseIcon } from "@/src/components/ui/ExpenseIcon";
// import { useAuth } from "@/src/contexts/AuthContext";
// import { useGroupExpenses } from "@/src/services/expense.service";
// import { useGroup } from "@/src/services/group.service";
// import {
//   useGroupBalances,
//   usePairBalances,
// } from "@/src/services/settlement.service";
// import { Stack, useLocalSearchParams, useRouter } from "expo-router";
// import { Plus } from "lucide-react-native";
// import React, { useState } from "react";
// import {
//   ActivityIndicator,
//   FlatList,
//   Modal,
//   Pressable,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// export default function GroupDetails() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const router = useRouter();
//   const { user } = useAuth();

//   const [showBalancesModal, setShowBalancesModal] = useState(false);

//   const { data: group, isLoading: groupLoading } = useGroup(id);
//   const { data: expenses, isLoading: expensesLoading } = useGroupExpenses(id);
//   const { data: balances } = useGroupBalances(id);
//   const { data: pairBalances } = usePairBalances(id, user?._id || "");

//   if (groupLoading || expensesLoading) {
//     return (
//       <View className="flex-1 bg-background-dark items-center justify-center">
//         <ActivityIndicator size="large" color="#13ec5b" />
//       </View>
//     );
//   }

//   if (!group) return null;

//   const userBalance =
//     balances?.find((b) => b.userId === user?._id)?.balance || 0;
//   const isOwed = userBalance > 0;
//   const balanceAmount = Math.abs(userBalance).toFixed(2);

//   // Use pairwise balances to correctly identify who owes me vs who I owe
//   // Positive balance = they owe me, Negative balance = I owe them
//   const membersWhoOweMe = pairBalances?.filter((b) => b.balance > 0) || [];
//   const membersIOwe = pairBalances?.filter((b) => b.balance < 0) || [];

//   const renderExpenseItem = ({ item }: { item: any }) => {
//     const splitAmount = item.amount / item.splitBetween.length;
//     const userPaid = item.paidBy._id === user?._id;
//     const userIsInSplit = item.splitBetween.some(
//       (m: any) => m._id === user?._id,
//     );

//     // Check pairwise balance with payer to see if user actually owes them
//     const payerId = item.paidBy._id;
//     const pairBalanceWithPayer = pairBalances?.find(
//       (b) => b.userId === payerId,
//     );
//     const actuallyOwePayer =
//       pairBalanceWithPayer && pairBalanceWithPayer.balance < 0;

//     // Only show "You owe" if user is in split, didn't pay, and still owes the payer overall
//     const youOwe =
//       !userPaid && userIsInSplit && actuallyOwePayer ? splitAmount : 0;

//     // For "You get", check if anyone still owes the user
//     let youGet = 0;
//     if (userPaid) {
//       const totalOwed = item.splitBetween
//         .filter((m: any) => m._id !== user?._id)
//         .reduce((sum: number, member: any) => {
//           const pairBalance = pairBalances?.find(
//             (b) => b.userId === member._id,
//           );
//           // If they still owe the user (positive balance), include their split
//           if (pairBalance && pairBalance.balance > 0) {
//             return sum + splitAmount;
//           }
//           return sum;
//         }, 0);
//       youGet = totalOwed;
//     }

//     return (
//       <TouchableOpacity
//         onPress={() =>
//           router.push({
//             pathname: "/(app)/expense/[id]",
//             params: { id: item._id, groupId: id },
//           })
//         }
//         className="bg-surface-dark rounded-xl p-4 border border-white/5 mx-6 mb-3 active:border-white/20"
//       >
//         <View className="flex-row items-center gap-3">
//           <ExpenseIcon type={item.type} />
//           <View className="flex-1">
//             <Text className="text-white text-base font-semibold font-manrope mb-1">
//               {item.description}
//             </Text>
//             <Text className="text-slate-400 text-xs font-medium font-manrope">
//               Paid by {userPaid ? "You" : item.paidBy.name} •{" "}
//               {new Date(item.date).toLocaleDateString("en-US", {
//                 month: "short",
//                 day: "numeric",
//               })}
//             </Text>
//           </View>
//           <View className="items-end">
//             <Text className="text-white text-lg font-bold font-manropeBold mb-1">
//               ${item.amount.toFixed(2)}
//             </Text>
//             {youOwe > 0 && (
//               <Text className="text-red-400 text-xs font-bold font-manrope">
//                 You still owe ${youOwe.toFixed(2)}
//               </Text>
//             )}
//             {youGet > 0 && (
//               <Text className="text-primary text-xs font-bold font-manrope">
//                 You&apos;re owed ${youGet.toFixed(2)}
//               </Text>
//             )}
//             {!userPaid && userIsInSplit && !actuallyOwePayer && (
//               <Text className="text-slate-500 text-xs font-bold font-manrope">
//                 Settled
//               </Text>
//             )}
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View className="flex-1 bg-background-dark">
//       <Stack.Screen options={{ title: group.name }} />

//       <FlatList
//         data={expenses}
//         keyExtractor={(item) => item._id}
//         renderItem={renderExpenseItem}
//         ListHeaderComponent={
//           <>
//             <BalanceCard
//               amount={balanceAmount}
//               isOwed={isOwed}
//               userBalance={userBalance}
//               onPress={() => setShowBalancesModal(true)}
//             />
//             <View className="px-6 py-4">
//               <Text className="text-white text-xl font-bold font-manropeBold">
//                 Expenses
//               </Text>
//             </View>
//           </>
//         }
//         ListEmptyComponent={
//           <View className="px-6 py-12 items-center">
//             <Text className="text-slate-400 text-base font-manrope">
//               No expenses yet.
//             </Text>
//           </View>
//         }
//         contentContainerStyle={{ paddingBottom: 120 }}
//         showsVerticalScrollIndicator={false}
//       />

//       {/* FAB */}
//       <Pressable
//         onPress={() =>
//           router.push({
//             pathname: "/(app)/expense/create",
//             params: { groupId: id },
//           })
//         }
//         className="absolute bottom-8 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-2xl shadow-primary/50"
//         style={{ elevation: 10 }}
//       >
//         <Plus size={28} color="#0d1a0f" strokeWidth={2.5} />
//       </Pressable>

//       {/* Balances Modal */}
//       <Modal
//         visible={showBalancesModal}
//         animationType="slide"
//         presentationStyle="pageSheet"
//         onRequestClose={() => setShowBalancesModal(false)}
//       >
//         <View className="flex-1 bg-background-dark">
//           <View className="px-6 py-6 border-b border-white/5 flex-row items-center justify-between">
//             <TouchableOpacity onPress={() => setShowBalancesModal(false)}>
//               <Text className="text-primary text-lg font-manropeBold">
//                 Close
//               </Text>
//             </TouchableOpacity>
//             <Text className="text-white text-xl font-manropeBold">
//               Balances
//             </Text>
//             <View style={{ width: 60 }} />
//           </View>

//           <ScrollView className="flex-1">
//             <View className="px-6 py-10 items-center border-b border-white/5">
//               <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-2">
//                 Total Balance
//               </Text>
//               <Text
//                 className={`text-5xl font-extrabold font-manropeBold ${userBalance === 0 ? "text-slate-400" : isOwed ? "text-primary" : "text-red-400"}`}
//               >
//                 ${balanceAmount}
//               </Text>
//               {userBalance === 0 && (
//                 <Text className="text-slate-400 text-sm font-manrope mt-2">
//                   All settled up! 🎉
//                 </Text>
//               )}
//             </View>

//             {/* Show message when no debts exist */}
//             {membersIOwe.length === 0 && membersWhoOweMe.length === 0 && (
//               <View className="px-6 py-12 items-center">
//                 <Text className="text-slate-400 text-base font-manrope text-center">
//                   No outstanding balances.{"\n"}Everyone is settled up!
//                 </Text>
//               </View>
//             )}

//             {/* Members I Owe */}
//             {membersIOwe.length > 0 && (
//               <View className="px-6 py-4">
//                 <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
//                   You Owe
//                 </Text>
//                 {membersIOwe.map((member) => (
//                   <View
//                     key={member.userId}
//                     className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
//                   >
//                     <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-3">
//                       <Text className="text-primary text-lg font-manropeBold">
//                         {member.name.charAt(0).toUpperCase()}
//                       </Text>
//                     </View>
//                     <View className="flex-1">
//                       <Text className="text-white text-base font-semibold font-manrope">
//                         {member.name}
//                       </Text>
//                       <Text className="text-slate-400 text-xs font-manrope">
//                         You owe
//                       </Text>
//                     </View>
//                     <View className="items-end">
//                       <Text className="text-red-400 text-lg font-bold font-manropeBold">
//                         ${Math.abs(member.balance).toFixed(2)}
//                       </Text>
//                       <TouchableOpacity
//                         onPress={() => {
//                           setShowBalancesModal(false);
//                           router.push({
//                             pathname: "/(app)/expense/SettlementCreate",
//                             params: {
//                               groupId: id,
//                               paidTo: member.userId,
//                               amount: Math.abs(member.balance).toFixed(2),
//                             },
//                           });
//                         }}
//                         className="bg-primary px-4 py-1 rounded-lg mt-1"
//                       >
//                         <Text className="text-background-dark text-xs font-manropeBold">
//                           Settle Up
//                         </Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             )}

//             {/* Members Who Owe Me */}
//             {membersWhoOweMe.length > 0 && (
//               <View className="px-6 py-4">
//                 <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
//                   Owes You
//                 </Text>
//                 {membersWhoOweMe.map((member) => (
//                   <View
//                     key={member.userId}
//                     className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
//                   >
//                     <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-3">
//                       <Text className="text-primary text-lg font-manropeBold">
//                         {member.name.charAt(0).toUpperCase()}
//                       </Text>
//                     </View>
//                     <View className="flex-1">
//                       <Text className="text-white text-base font-semibold font-manrope">
//                         {member.name}
//                       </Text>
//                       <Text className="text-slate-400 text-xs font-manrope">
//                         Owes you
//                       </Text>
//                     </View>
//                     <Text className="text-primary text-lg font-bold font-manropeBold">
//                       ${member.balance.toFixed(2)}
//                     </Text>
//                   </View>
//                 ))}
//               </View>
//             )}
//           </ScrollView>
//         </View>
//       </Modal>
//     </View>
//   );
// }

import BalanceCard from "@/src/components/ui/BalanceCard";
import { ExpenseIcon } from "@/src/components/ui/ExpenseIcon";
import { useAuth } from "@/src/contexts/AuthContext";
import { useGroupExpenses } from "@/src/services/expense.service";
import { useGroup } from "@/src/services/group.service";
import {
  useGroupBalances,
  usePairBalances,
} from "@/src/services/settlement.service";
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

export default function GroupDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [showBalancesModal, setShowBalancesModal] = useState(false);

  const { data: group, isLoading: groupLoading } = useGroup(id);
  const { data: expenses, isLoading: expensesLoading } = useGroupExpenses(id);
  const { data: balances } = useGroupBalances(id);
  const { data: pairBalances } = usePairBalances(id, user?._id || "");

  if (groupLoading || expensesLoading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  if (!group) return null;

  const userBalance =
    balances?.find((b) => b.userId === user?._id)?.balance || 0;
  const isOwed = userBalance > 0;
  const balanceAmount = Math.abs(userBalance).toFixed(2);

  const membersWhoOweMe = pairBalances?.filter((b) => b.balance > 0) || [];
  const membersIOwe = pairBalances?.filter((b) => b.balance < 0) || [];

  const renderExpenseItem = ({ item }: { item: any }) => {
    const userPaid = item.paidBy._id === user?._id;
    // const splitAmount = item.amount / item.splitBetween.length;

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
            <Text className="text-white text-base font-semibold font-manrope mb-1">
              {item.description}
            </Text>
            <Text className="text-slate-400 text-xs font-medium font-manrope">
              Paid by {userPaid ? "You" : item.paidBy.name} •{" "}
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-white text-lg font-bold font-manropeBold mb-1">
              ${item.amount.toFixed(2)}
            </Text>
            {userPaid ? (
              <Text className="text-primary text-xs font-bold font-manrope">
                You lent money
              </Text>
            ) : (
              <Text className="text-red-400 text-xs font-bold font-manrope">
                You borrowed
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
          <>
            <BalanceCard
              amount={balanceAmount}
              isOwed={isOwed}
              userBalance={userBalance}
              onPress={() => setShowBalancesModal(true)}
            />
            <View className="px-6 py-4">
              <Text className="text-white text-xl font-bold font-manropeBold">
                Expenses
              </Text>
            </View>
          </>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(app)/expense/create",
            params: { groupId: id },
          })
        }
        className="absolute bottom-8 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-2xl shadow-primary/50"
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
                Total Balance
              </Text>
              <Text
                className={`text-5xl font-extrabold font-manropeBold ${userBalance === 0 ? "text-slate-400" : isOwed ? "text-primary" : "text-red-400"}`}
              >
                ${balanceAmount}
              </Text>
              {userBalance === 0 && (
                <Text className="text-slate-400 text-sm font-manrope mt-2">
                  All settled up! 🎉
                </Text>
              )}
            </View>
            <View className="px-6 py-4">
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
                    className="bg-primary px-4 py-1 rounded-lg"
                  >
                    <Text className="text-background-dark text-xs font-bold">
                      ${Math.abs(member.balance).toFixed(2)} Settle
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
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
                  <Text className="text-primary text-lg font-bold">
                    ${member.balance.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
