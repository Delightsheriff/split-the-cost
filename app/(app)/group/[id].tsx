// import BalanceCard from "@/src/components/ui/BalanceCard";
// import { ExpenseIcon } from "@/src/components/ui/ExpenseIcon";
// import { useAuth } from "@/src/contexts/AuthContext";
// import { useGroupExpenses } from "@/src/services/expense.service";
// import { useGroup } from "@/src/services/group.service";
// import { usePairBalances } from "@/src/services/settlement.service";
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
//   const { data: pairBalances } = usePairBalances(id, user?._id || "");

//   if (groupLoading || expensesLoading) {
//     return (
//       <View className="flex-1 bg-background-dark items-center justify-center">
//         <ActivityIndicator size="large" color="#13ec5b" />
//       </View>
//     );
//   }

//   if (!group) return null;

//   const { balance, isOwed, isSettled } = group.currentUserState;
//   const balanceAmount = Math.abs(balance).toFixed(2);

//   const membersWhoOweMe = pairBalances?.filter((b) => b.balance > 0) || [];
//   const membersIOwe = pairBalances?.filter((b) => b.balance < 0) || [];

//   const renderExpenseItem = ({ item }: { item: any }) => {
//     const userPaid = item.paidBy._id === user?._id;
//     const payerId = item.paidBy._id;

//     // Check if user still has a debt/credit with THIS specific payer
//     const pairInfo = pairBalances?.find((p) => p.userId === payerId);
//     const hasActivePairBalance = pairInfo && Math.abs(pairInfo.balance) > 0.01;

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

//             {/* Logic: If pairwise balance is 0, it is settled even if you were in the split */}
//             {!hasActivePairBalance ? (
//               <Text className="text-slate-500 text-xs font-bold font-manrope">
//                 Settled
//               </Text>
//             ) : userPaid ? (
//               <Text className="text-primary text-xs font-bold font-manrope">
//                 You lent
//               </Text>
//             ) : (
//               <Text className="text-red-400 text-xs font-bold font-manrope">
//                 You borrow
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
//               userBalance={balance}
//               onPress={() => setShowBalancesModal(true)}
//             />
//             <View className="px-6 py-4">
//               <Text className="text-white text-xl font-bold font-manropeBold">
//                 Expenses
//               </Text>
//             </View>
//           </>
//         }
//         contentContainerStyle={{ paddingBottom: 120 }}
//         showsVerticalScrollIndicator={false}
//       />
//       <Pressable
//         onPress={() =>
//           router.push({
//             pathname: "/(app)/expense/create",
//             params: { groupId: id },
//           })
//         }
//         className="absolute bottom-8 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-2xl"
//       >
//         <Plus size={28} color="#0d1a0f" strokeWidth={2.5} />
//       </Pressable>

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
//               <Text className="text-slate-400 text-xs uppercase font-manrope mb-2">
//                 Total Net Balance
//               </Text>
//               <Text
//                 className={`text-5xl font-extrabold font-manropeBold ${isSettled ? "text-slate-400" : isOwed ? "text-primary" : "text-red-400"}`}
//               >
//                 ${balanceAmount}
//               </Text>
//               {isSettled && (
//                 <View className="mt-2 bg-primary/10 px-4 py-1 rounded-full">
//                   <Text className="text-primary text-sm font-manropeBold">
//                     All settled up! 🎉
//                   </Text>
//                 </View>
//               )}
//             </View>
//             <View className="px-6 py-4">
//               {membersIOwe.map((member) => (
//                 <View
//                   key={member.userId}
//                   className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
//                 >
//                   <View className="flex-1">
//                     <Text className="text-white text-base font-semibold font-manrope">
//                       {member.name}
//                     </Text>
//                     <Text className="text-slate-400 text-xs font-manrope">
//                       You owe
//                     </Text>
//                   </View>
//                   <TouchableOpacity
//                     onPress={() => {
//                       setShowBalancesModal(false);
//                       router.push({
//                         pathname: "/(app)/expense/SettlementCreate",
//                         params: {
//                           groupId: id,
//                           paidTo: member.userId,
//                           amount: Math.abs(member.balance).toFixed(2),
//                         },
//                       });
//                     }}
//                     className="bg-primary px-4 py-2 rounded-lg active:opacity-80"
//                   >
//                     <Text className="text-background-dark text-xs font-manropeBold">
//                       Settle ${Math.abs(member.balance).toFixed(2)}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               ))}
//               {membersWhoOweMe.map((member) => (
//                 <View
//                   key={member.userId}
//                   className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
//                 >
//                   <View className="flex-1">
//                     <Text className="text-white text-base font-semibold font-manrope">
//                       {member.name}
//                     </Text>
//                     <Text className="text-slate-400 text-xs font-manrope">
//                       Owes you
//                     </Text>
//                   </View>
//                   <Text className="text-primary text-lg font-bold font-manropeBold">
//                     ${member.balance.toFixed(2)}
//                   </Text>
//                 </View>
//               ))}
//             </View>
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
import { usePairBalances } from "@/src/services/settlement.service";
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

  // Fetching data
  const { data: group, isLoading: groupLoading } = useGroup(id || "");
  const { data: expenses, isLoading: expensesLoading } = useGroupExpenses(
    id || "",
  );
  const { data: pairBalances } = usePairBalances(id || "", user?._id || "");

  // 1. Loading State: Prevents reading properties of undefined
  if (groupLoading || expensesLoading || !group) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  // 2. Safe Data Extraction: Fallbacks prevent the "Cannot read property balance of undefined" error
  const userState = group?.currentUserState || {
    balance: 0,
    isOwed: false,
    isSettled: true,
  };
  const balanceAmount = Math.abs(userState.balance).toFixed(2);

  // Safely filter pair balances
  const membersWhoOweMe = pairBalances?.filter((b) => b && b.balance > 0) || [];
  const membersIOwe = pairBalances?.filter((b) => b && b.balance < 0) || [];

  const renderExpenseItem = ({ item }: { item: any }) => {
    if (!item) return null;

    const userPaid = item.paidBy?._id === user?._id;
    const payerId = item.paidBy?._id;

    // Use pairBalances to determine if the specific debt with this payer is cleared
    const pairInfo = pairBalances?.find((p) => p?.userId === payerId);

    // Check for settlement: if no pair debt exists or it's negligible (floating point safety)
    const isActuallySettled = !pairInfo || Math.abs(pairInfo.balance) < 0.01;

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
              Paid by {userPaid ? "You" : item.paidBy?.name || "Unknown"} •{" "}
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-white text-lg font-bold font-manropeBold mb-1">
              ${(item.amount || 0).toFixed(2)}
            </Text>
            {isActuallySettled ? (
              <Text className="text-slate-500 text-xs font-bold font-manrope">
                Settled
              </Text>
            ) : userPaid ? (
              <Text className="text-primary text-xs font-bold font-manrope">
                You lent
              </Text>
            ) : (
              <Text className="text-red-400 text-xs font-bold font-manrope">
                You borrow
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background-dark">
      <Stack.Screen options={{ title: group.name || "Group Details" }} />
      <FlatList
        data={expenses}
        keyExtractor={(item) => item?._id}
        renderItem={renderExpenseItem}
        ListHeaderComponent={
          <>
            <BalanceCard
              amount={balanceAmount}
              isOwed={userState.isOwed}
              userBalance={userState.balance}
              onPress={() => setShowBalancesModal(true)}
            />
            <View className="px-6 py-4">
              <Text className="text-white text-xl font-bold font-manropeBold">
                Expenses
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="py-20 items-center">
            <Text className="text-slate-500 font-manrope">
              No expenses recorded yet.
            </Text>
          </View>
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
                Total Net Balance
              </Text>
              <Text
                className={`text-5xl font-extrabold font-manropeBold ${userState.isSettled ? "text-slate-400" : userState.isOwed ? "text-primary" : "text-red-400"}`}
              >
                ${balanceAmount}
              </Text>
              {userState.isSettled && (
                <View className="mt-2 bg-primary/10 px-4 py-1 rounded-full">
                  <Text className="text-primary text-sm font-manropeBold">
                    All settled up! 🎉
                  </Text>
                </View>
              )}
            </View>
            <View className="px-6 py-4">
              {membersIOwe.map((member) => (
                <View
                  key={member.userId}
                  className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
                >
                  <View className="flex-1">
                    <Text className="text-white text-base font-semibold font-manrope">
                      {member.name}
                    </Text>
                    <Text className="text-slate-400 text-xs font-manrope">
                      You owe
                    </Text>
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
              {membersWhoOweMe.map((member) => (
                <View
                  key={member.userId}
                  className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-3 border border-white/5"
                >
                  <View className="flex-1">
                    <Text className="text-white text-base font-semibold font-manrope">
                      {member.name}
                    </Text>
                    <Text className="text-slate-400 text-xs font-manrope">
                      Owes you
                    </Text>
                  </View>
                  <Text className="text-primary text-lg font-bold font-manropeBold">
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
