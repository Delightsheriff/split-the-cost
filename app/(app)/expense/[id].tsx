// import { ExpenseIcon } from "@/src/components/ui/ExpenseIcon";
// import { useAuth } from "@/src/contexts/AuthContext";
// import { useGroupExpenses } from "@/src/services/expense.service";
// import { useGroup } from "@/src/services/group.service";
// import { usePairBalances } from "@/src/services/settlement.service";
// import { Stack, useLocalSearchParams, useRouter } from "expo-router";
// import React from "react";
// import {
//   ActivityIndicator,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// export default function ExpenseDetails() {
//   const { id, groupId } = useLocalSearchParams<{
//     id: string;
//     groupId: string;
//   }>();
//   const router = useRouter();
//   const { user } = useAuth();

//   const { data: group, isLoading: groupLoading } = useGroup(groupId);
//   const { data: expenses, isLoading: expensesLoading } =
//     useGroupExpenses(groupId);
//   const { data: pairBalances } = usePairBalances(groupId, user?._id || "");

//   const expense = expenses?.find((e) => e._id === id);

//   if (groupLoading || expensesLoading) {
//     return (
//       <View className="flex-1 bg-background-dark items-center justify-center">
//         <ActivityIndicator size="large" color="#13ec5b" />
//       </View>
//     );
//   }

//   if (!expense || !group) {
//     return (
//       <View className="flex-1 bg-background-dark items-center justify-center">
//         <Text className="text-white text-base font-manrope">
//           Expense not found
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-background-dark">
//       <Stack.Screen
//         options={{
//           title: "Expense Details",
//           headerBackTitle: "Back",
//         }}
//       />

//       <ScrollView className="flex-1 px-6 py-8">
//         <View className="items-center mb-8">
//           <ExpenseIcon type={expense.type} />
//           <Text className="text-5xl font-extrabold text-white mt-4 font-manropeBold">
//             ${expense.amount.toFixed(2)}
//           </Text>
//           <Text className="text-slate-400 text-lg font-manrope mt-1">
//             {expense.description}
//           </Text>
//         </View>

//         <View className="py-4 border-b border-white/5 flex-row justify-between">
//           <Text className="text-slate-400 font-manrope">Paid by</Text>
//           <Text className="text-white font-manropeBold">
//             {expense.paidBy._id === user?._id ? "You" : expense.paidBy.name}
//           </Text>
//         </View>

//         <View className="py-4 border-b border-white/5">
//           <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-3">
//             Split Between
//           </Text>
//           {expense.splitBetween.map((member: any) => {
//             const splitAmount = expense.amount / expense.splitBetween.length;
//             const paidById = expense.paidBy._id;
//             const memberId = member._id;
//             const isPayer = paidById === memberId;
//             const isCurrentUser = memberId === user?._id;

//             // Check settlement status for each member (not just current user)
//             let memberOwes = false;
//             let memberSettled = false;

//             if (!isPayer) {
//               if (isCurrentUser) {
//                 // For current user, check if they owe the payer
//                 const pairBalanceWithPayer = pairBalances?.find(
//                   (b) => b.userId === paidById,
//                 );
//                 memberOwes = pairBalanceWithPayer
//                   ? pairBalanceWithPayer.balance < 0
//                   : true;
//                 memberSettled = pairBalanceWithPayer
//                   ? pairBalanceWithPayer.balance >= 0
//                   : false;
//               } else if (user?._id === paidById) {
//                 // If current user is the payer, check if this member still owes them
//                 const pairBalanceWithMember = pairBalances?.find(
//                   (b) => b.userId === memberId,
//                 );
//                 memberOwes = pairBalanceWithMember
//                   ? pairBalanceWithMember.balance > 0
//                   : true;
//                 memberSettled = pairBalanceWithMember
//                   ? pairBalanceWithMember.balance <= 0
//                   : false;
//               } else {
//                 // Neither current user nor payer - cannot determine settlement status
//                 memberOwes = false;
//                 memberSettled = false;
//               }
//             }

//             return (
//               <View
//                 key={member._id}
//                 className="flex-row items-center justify-between py-3 border-b border-white/5 last:border-b-0"
//               >
//                 <View className="flex-1">
//                   <View className="flex-row items-center gap-2">
//                     <Text className="text-white font-manropeBold">
//                       {member.name}
//                       {isCurrentUser && " (You)"}
//                     </Text>
//                   </View>
//                   <Text className="text-slate-400 text-xs font-manrope mt-1">
//                     {isPayer
//                       ? "Paid their share"
//                       : isCurrentUser
//                         ? memberSettled
//                           ? `Split settled ($${splitAmount.toFixed(2)})`
//                           : memberOwes
//                             ? `Still owes overall`
//                             : `Split: $${splitAmount.toFixed(2)} (part of total debt)`
//                         : memberSettled
//                           ? `Settled ($${splitAmount.toFixed(2)})`
//                           : `Owes $${splitAmount.toFixed(2)}`}
//                   </Text>
//                 </View>
//                 <View className="items-end">
//                   {isPayer ? (
//                     <Text className="text-primary text-base font-bold font-manropeBold">
//                       +${splitAmount.toFixed(2)}
//                     </Text>
//                   ) : memberSettled ? (
//                     <Text className="text-slate-500 text-base font-bold font-manropeBold">
//                       $0.00
//                     </Text>
//                   ) : isCurrentUser && memberOwes ? (
//                     <View className="items-end">
//                       <Text className="text-red-400 text-base font-bold font-manropeBold">
//                         -${splitAmount.toFixed(2)}
//                       </Text>
//                       {(() => {
//                         const pairBalance = pairBalances?.find(
//                           (b) => b.userId === paidById,
//                         );
//                         const totalOwed = pairBalance
//                           ? Math.abs(pairBalance.balance)
//                           : 0;
//                         if (totalOwed !== splitAmount) {
//                           return (
//                             <Text className="text-slate-400 text-xs font-manrope">
//                               (${totalOwed.toFixed(2)} total)
//                             </Text>
//                           );
//                         }
//                         return null;
//                       })()}
//                     </View>
//                   ) : (
//                     <Text className="text-red-400 text-base font-bold font-manropeBold">
//                       -${splitAmount.toFixed(2)}
//                     </Text>
//                   )}
//                   {isCurrentUser && memberOwes && (
//                     <TouchableOpacity
//                       onPress={() => {
//                         // Get the actual amount owed to this payer from pair balances
//                         const pairBalance = pairBalances?.find(
//                           (b) => b.userId === paidById,
//                         );
//                         const actualAmountOwed = pairBalance
//                           ? Math.abs(pairBalance.balance).toFixed(2)
//                           : splitAmount.toFixed(2);

//                         router.push({
//                           pathname: "/(app)/expense/SettlementCreate",
//                           params: {
//                             groupId: groupId,
//                             paidTo: paidById,
//                             amount: actualAmountOwed,
//                           },
//                         });
//                       }}
//                       className="bg-primary px-4 py-2 rounded-lg mt-2"
//                     >
//                       <Text className="text-background-dark text-xs font-manropeBold">
//                         Settle Up
//                       </Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               </View>
//             );
//           })}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// import { ExpenseIcon } from "@/src/components/ui/ExpenseIcon";
// import { useAuth } from "@/src/contexts/AuthContext";
// import { useGroupExpenses } from "@/src/services/expense.service";
// import { useGroup } from "@/src/services/group.service";
// import { usePairBalances } from "@/src/services/settlement.service";
// import { Stack, useLocalSearchParams, useRouter } from "expo-router";
// import React from "react";
// import {
//   ActivityIndicator,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// export default function ExpenseDetails() {
//   const { id, groupId } = useLocalSearchParams<{
//     id: string;
//     groupId: string;
//   }>();
//   const router = useRouter();
//   const { user } = useAuth();

//   const { data: group, isLoading: groupLoading } = useGroup(groupId || "");
//   const { data: expenses, isLoading: expensesLoading } = useGroupExpenses(
//     groupId || "",
//   );
//   const { data: pairBalances } = usePairBalances(
//     groupId || "",
//     user?._id || "",
//   );

//   const expense = expenses?.find((e) => e._id === id);

//   if (groupLoading || expensesLoading || !expense || !group) {
//     return (
//       <View className="flex-1 bg-background-dark items-center justify-center">
//         <ActivityIndicator size="large" color="#13ec5b" />
//       </View>
//     );
//   }

//   const splitAmount = expense.amount / expense.splitBetween.length;
//   const paidById = expense.paidBy?._id;
//   const isUserPayer = paidById === user?._id;

//   return (
//     <View className="flex-1 bg-background-dark">
//       <Stack.Screen
//         options={{
//           title: "Expense Details",
//           headerBackTitle: "Back",
//         }}
//       />

//       <ScrollView
//         className="flex-1 px-6 py-8"
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header Section */}
//         <View className="items-center mb-10">
//           <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-4">
//             <ExpenseIcon type={expense.type} />
//           </View>
//           <Text className="text-5xl font-extrabold text-white font-manropeBold">
//             ${expense.amount.toFixed(2)}
//           </Text>
//           <Text className="text-slate-400 text-lg font-manrope mt-1">
//             {expense.description}
//           </Text>
//           <View className="mt-4 bg-white/5 px-4 py-1.5 rounded-full">
//             <Text className="text-slate-400 text-xs font-manrope">
//               Paid by {isUserPayer ? "You" : expense.paidBy?.name} •{" "}
//               {new Date(expense.date).toLocaleDateString("en-US", {
//                 month: "short",
//                 day: "numeric",
//                 year: "numeric",
//               })}
//             </Text>
//           </View>
//         </View>

//         {/* Split Breakdown Section */}
//         <View className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
//           <View className="px-5 py-4 border-b border-white/5 bg-white/5">
//             <Text className="text-white text-xs uppercase tracking-widest font-manropeBold">
//               Split Breakdown
//             </Text>
//           </View>

//           {expense.splitBetween.map((member: any) => {
//             const memberId = member._id;
//             const isMemberPayer = memberId === paidById;
//             const isMemberUser = memberId === user?._id;

//             // Logic: How much is owed BETWEEN this member and the payer?
//             // Since usePairBalances is scoped to the current user, we only have absolute truth
//             // for rows involving the current user.
//             const pairInfo = pairBalances?.find(
//               (p) => p.userId === (isMemberUser ? paidById : memberId),
//             );

//             // Settlement Check: Use a 0.01 threshold for floating point safety
//             const isSettled =
//               isMemberPayer ||
//               (isMemberUser &&
//                 (!pairInfo || Math.abs(pairInfo.balance) < 0.01));

//             return (
//               <View
//                 key={memberId}
//                 className="flex-row items-center justify-between px-5 py-5 border-b border-white/5 last:border-b-0"
//               >
//                 <View className="flex-1">
//                   <Text className="text-white text-base font-manropeBold">
//                     {member.name} {isMemberUser && "(You)"}
//                   </Text>
//                   <Text
//                     className={`text-xs font-manrope mt-1 ${isSettled ? "text-slate-500" : isMemberUser ? "text-red-400" : "text-slate-400"}`}
//                   >
//                     {isMemberPayer
//                       ? "Paid the bill"
//                       : isSettled
//                         ? "Portion settled"
//                         : isMemberUser
//                           ? `You still owe $${Math.abs(pairInfo?.balance || 0).toFixed(2)} total`
//                           : `Owes $${splitAmount.toFixed(2)}`}
//                   </Text>
//                 </View>

//                 <View className="items-end">
//                   <Text
//                     className={`text-lg font-manropeBold ${isMemberPayer ? "text-primary" : isSettled ? "text-slate-500" : "text-white"}`}
//                   >
//                     {isMemberPayer ? "+" : "-"}${splitAmount.toFixed(2)}
//                   </Text>

//                   {/* Settle Up Action for the current user if they still owe */}
//                   {!isSettled && isMemberUser && (
//                     <TouchableOpacity
//                       onPress={() => {
//                         router.push({
//                           pathname: "/(app)/expense/SettlementCreate",
//                           params: {
//                             groupId: groupId,
//                             paidTo: paidById,
//                             amount: Math.abs(pairInfo?.balance || 0).toFixed(2),
//                           },
//                         });
//                       }}
//                       className="bg-primary px-3 py-1 rounded-md mt-2"
//                     >
//                       <Text className="text-background-dark text-[10px] font-manropeBold uppercase">
//                         Settle Now
//                       </Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               </View>
//             );
//           })}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

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

// Floating point safe comparison
const SETTLEMENT_THRESHOLD = 0.01;

export default function ExpenseDetails() {
  const { id, groupId } = useLocalSearchParams<{
    id: string;
    groupId: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data: group, isLoading: groupLoading } = useGroup(groupId || "");
  const { data: expenses, isLoading: expensesLoading } = useGroupExpenses(
    groupId || "",
  );
  const { data: pairBalances } = usePairBalances(
    groupId || "",
    user?._id || "",
  );

  const expense = expenses?.find((e) => e._id === id);

  if (groupLoading || expensesLoading || !expense || !group) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  const splitAmount = expense.amount / expense.splitBetween.length;
  const paidById = expense.paidBy?._id;
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
        {/* Header Section */}
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
              Paid by {isUserPayer ? "You" : expense.paidBy?.name} •{" "}
              {new Date(expense.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Split Breakdown Section */}
        <View className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
          <View className="px-5 py-4 border-b border-white/5 bg-white/5">
            <Text className="text-white text-xs uppercase tracking-widest font-manropeBold">
              Split Breakdown
            </Text>
          </View>

          {expense.splitBetween.map((member: any) => {
            const memberId = member._id;
            const isMemberPayer = memberId === paidById;
            const isMemberUser = memberId === user?._id;

            // Get the pair balance between current user and this member
            // pairBalances is from the perspective of the current user
            let isSettled = isMemberPayer; // Payer is always "settled" for their own expense
            let showSettleButton = false;
            let totalOwed = splitAmount;

            if (!isMemberPayer && isMemberUser) {
              // Current user is this member (and not the payer)
              // Check if current user still owes the payer
              const pairBalance = pairBalances?.find(
                (p) => p.userId === paidById,
              );

              if (pairBalance) {
                // Negative balance means user owes money
                isSettled =
                  Math.abs(pairBalance.balance) < SETTLEMENT_THRESHOLD;
                showSettleButton = !isSettled && pairBalance.balance < 0;
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
                  <Text
                    className={`text-xs font-manrope mt-1 ${
                      isSettled
                        ? "text-slate-500"
                        : isMemberUser
                          ? "text-red-400"
                          : "text-slate-400"
                    }`}
                  >
                    {isMemberPayer
                      ? "Paid the bill"
                      : isSettled
                        ? "Portion settled"
                        : isMemberUser
                          ? `You still owe $${totalOwed.toFixed(2)} total`
                          : `Owes $${splitAmount.toFixed(2)}`}
                  </Text>
                </View>

                <View className="items-end">
                  <Text
                    className={`text-lg font-manropeBold ${
                      isMemberPayer
                        ? "text-primary"
                        : isSettled
                          ? "text-slate-500"
                          : "text-white"
                    }`}
                  >
                    {isMemberPayer ? "+" : "-"}${splitAmount.toFixed(2)}
                  </Text>

                  {/* Settle Up Action for the current user if they still owe */}
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
                        Settle Now
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
