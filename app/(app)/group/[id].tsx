// import { DUMMY_GROUPS } from "@/src/services/data";
// import { Stack, useLocalSearchParams, useRouter } from "expo-router";
// import { Plus } from "lucide-react-native";
// import { useState } from "react";
// import {
//   FlatList,
//   Pressable,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// // Icon components for expense types
// const ExpenseIcon = ({ type }: { type: string }) => {
//   const icons = {
//     food: "🍽️",
//     transport: "🚕",
//     supplies: "🛒",
//     fuel: "⛽",
//   };
//   return (
//     <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
//       <Text className="text-xl">
//         {icons[type as keyof typeof icons] || "💰"}
//       </Text>
//     </View>
//   );
// };

// interface Expense {
//   id: string;
//   description: string;
//   amount: number;
//   paidBy: string;
//   date: string;
//   youOwe?: number;
//   youGet?: number;
//   type: string;
// }

// export default function GroupDetails() {
//   const { id } = useLocalSearchParams();
//   const [pressed, setPressed] = useState(false);
//   const router = useRouter();

//   const handleCreateExpense = () => {
//     router.push({
//       pathname: "/(app)/expense/create",
//       params: { groupId: id }, // Pass the current group ID
//     });
//   };

//   const group = DUMMY_GROUPS.find((g) => g.id === id);

//   if (!group) {
//     return (
//       <View className="flex-1 bg-background-dark items-center justify-center">
//         <Text className="text-white text-lg font-manrope">Group not found</Text>
//       </View>
//     );
//   }

//   // Mock expenses data - replace with group.expenses once added to interface
//   const expenses: Expense[] = [
//     {
//       id: "1",
//       description: "Dinner at Mario's",
//       amount: 80.0,
//       paidBy: "You",
//       date: "Oct 24",
//       youOwe: 26.67,
//       type: "food",
//     },
//     {
//       id: "2",
//       description: "Uber to Hotel",
//       amount: 24.5,
//       paidBy: "You",
//       date: "Oct 23",
//       youGet: 12.25,
//       type: "transport",
//     },
//     {
//       id: "3",
//       description: "Supplies",
//       amount: 56.0,
//       paidBy: "Bob",
//       date: "Oct 22",
//       youOwe: 18.67,
//       type: "supplies",
//     },
//     {
//       id: "4",
//       description: "Fuel Stop",
//       amount: 40.0,
//       paidBy: "Alice",
//       date: "Oct 20",
//       youOwe: 13.33,
//       type: "fuel",
//     },
//   ];

//   const balance = group.balance;
//   const isOwed = balance < 0;
//   const balanceAmount = Math.abs(balance).toFixed(2);

//   const renderExpenseItem = ({ item }: { item: Expense }) => (
//     <View className="bg-surface-dark rounded-xl p-4 border border-white/5 mx-6 mb-3">
//       <View className="flex-row items-center gap-3">
//         <ExpenseIcon type={item.type} />

//         <View className="flex-1">
//           <Text className="text-white text-base font-semibold font-manrope mb-1">
//             {item.description}
//           </Text>
//           <Text className="text-slate-400 text-xs font-medium font-manrope">
//             Paid by {item.paidBy} • {item.date}
//           </Text>
//         </View>

//         <View className="items-end">
//           <Text className="text-white text-lg font-bold font-manropeBold mb-1">
//             ${item.amount.toFixed(2)}
//           </Text>
//           {item.youOwe && (
//             <Text className="text-red-400 text-xs font-bold font-manrope">
//               You owe ${item.youOwe.toFixed(2)}
//             </Text>
//           )}
//           {item.youGet && (
//             <Text className="text-primary text-xs font-bold font-manrope">
//               You get ${item.youGet.toFixed(2)}
//             </Text>
//           )}
//         </View>
//       </View>
//     </View>
//   );

//   const ListHeaderComponent = () => (
//     <>
//       {/* Balance Card */}
//       <View className="px-6 pt-6 pb-4">
//         <View className="bg-surface-dark rounded-2xl p-6 border border-white/5 items-center">
//           <Text className="text-slate-400 text-sm font-medium uppercase tracking-wider font-manrope mb-2">
//             {isOwed ? "You Are Owed" : "Your Balance"}
//           </Text>
//           <Text
//             className={`text-5xl font-extrabold font-manropeBold mb-4 p-3 ${
//               isOwed ? "text-primary" : "text-red-400"
//             }`}
//           >
//             ${balanceAmount}
//           </Text>
//           <TouchableOpacity className="w-full bg-[#13ec5b] rounded-xl py-4 items-center">
//             <Text className="text-[#0d1a0f] text-lg font-bold font-manropeBold">
//               Settle Up
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Expenses Section Header */}
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
//         keyExtractor={(item) => item.id}
//         renderItem={renderExpenseItem}
//         ListHeaderComponent={ListHeaderComponent}
//         ListEmptyComponent={ListEmptyComponent}
//         contentContainerStyle={{ paddingBottom: 100 }}
//         showsVerticalScrollIndicator={false}
//       />

//       {/* Add Expense FAB */}
//       <Pressable
//         onPress={handleCreateExpense}
//         onPressIn={() => setPressed(true)}
//         onPressOut={() => setPressed(false)}
//         className="absolute bottom-6 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/50"
//         style={{
//           elevation: 8,
//           transform: [{ scale: pressed ? 0.98 : 1 }],
//         }}
//       >
//         <Plus size={28} color="#0d1a0f" strokeWidth={2.5} />
//       </Pressable>
//     </View>
//   );
// }

// src/screens/GroupDetails.tsx

import { useAuth } from "@/src/contexts/AuthContext";
import { useGroupExpenses } from "@/src/services/expense.service";
import { useGroup } from "@/src/services/group.service";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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

  const {
    data: group,
    isLoading: groupLoading,
    error: groupError,
  } = useGroup(id);

  const {
    data: expenses,
    isLoading: expensesLoading,
    // error: expensesError,
  } = useGroupExpenses(id);

  if (groupLoading || expensesLoading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  if (groupError || !group) {
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

  // Calculate user's balance for this group
  const calculateUserBalance = () => {
    if (!expenses || !user) return 0;

    let balance = 0;

    expenses.forEach((expense) => {
      const splitAmount = expense.amount / expense.splitBetween.length;

      // User paid
      if (expense.paidBy._id === user._id) {
        balance += expense.amount - splitAmount; // They paid full, owe their share
      }

      // User is in split
      if (expense.splitBetween.some((m) => m._id === user._id)) {
        if (expense.paidBy._id !== user._id) {
          balance -= splitAmount; // They owe their share
        }
      }
    });

    return balance;
  };

  const userBalance = calculateUserBalance();
  const isOwed = userBalance > 0;
  const balanceAmount = Math.abs(userBalance).toFixed(2);

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
      <View className="bg-surface-dark rounded-xl p-4 border border-white/5 mx-6 mb-3">
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
      </View>
    );
  };

  const ListHeaderComponent = () => (
    <>
      <View className="px-6 pt-6 pb-4">
        <View className="bg-surface-dark rounded-2xl p-6 border border-white/5 items-center">
          <Text className="text-slate-400 text-sm font-medium uppercase tracking-wider font-manrope mb-2">
            {isOwed
              ? "You Are Owed"
              : userBalance < 0
                ? "You Owe"
                : "Settled Up"}
          </Text>
          <Text
            className={`text-5xl font-extrabold font-manropeBold mb-4 p-3 ${
              isOwed
                ? "text-primary"
                : userBalance < 0
                  ? "text-red-400"
                  : "text-slate-400"
            }`}
          >
            ${balanceAmount}
          </Text>
          {userBalance !== 0 && (
            <TouchableOpacity className="w-full bg-[#13ec5b] rounded-xl py-4 items-center">
              <Text className="text-[#0d1a0f] text-lg font-bold font-manropeBold">
                Settle Up
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="px-6 py-4">
        <Text className="text-white text-xl font-bold font-manropeBold mb-1">
          Expenses
        </Text>
      </View>
    </>
  );

  const ListEmptyComponent = () => (
    <View className="px-6 py-12 items-center">
      <Text className="text-slate-400 text-base font-manrope text-center">
        No expenses yet. Add your first expense!
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background-dark">
      <Stack.Screen options={{ title: group.name }} />

      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        renderItem={renderExpenseItem}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshing={expensesLoading}
        onRefresh={() => {}}
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
    </View>
  );
}
