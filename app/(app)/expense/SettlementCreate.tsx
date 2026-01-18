// import UserAvatar from "@/src/components/ui/UserAvatar";
// import { useGroup } from "@/src/services/group.service";
// import { useCreateSettlement } from "@/src/services/settlement.service";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { Calendar, Check } from "lucide-react-native";
// import React, { useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// export default function SettlementCreate() {
//   const {
//     groupId,
//     paidTo,
//     amount: initialAmount,
//   } = useLocalSearchParams<{
//     groupId: string;
//     paidTo: string;
//     amount: string;
//   }>();

//   const router = useRouter();
//   const { data: group, isLoading: groupLoading } = useGroup(groupId);
//   const createSettlement = useCreateSettlement();

//   const [amount, setAmount] = useState(initialAmount || "");

//   const paidToMember = group?.members.find((m) => m._id === paidTo);
//   const isSubmitting = createSettlement.isPending;

//   const handleSubmit = async () => {
//     if (!amount || parseFloat(amount) <= 0) {
//       Alert.alert("Error", "Please enter a valid amount");
//       return;
//     }

//     try {
//       await createSettlement.mutateAsync({
//         groupId,
//         paidTo,
//         amount: parseFloat(amount),
//         note: note.trim() || undefined,
//       });

//       Alert.alert("Success", "Payment recorded!", [
//         { text: "OK", onPress: () => router.back() },
//       ]);
//     } catch (error) {
//       Alert.alert("Error", "Failed to record payment");
//       console.error(error);
//     }
//   };

//   if (groupLoading) {
//     return (
//       <View className="flex-1 bg-background-dark items-center justify-center">
//         <ActivityIndicator size="large" color="#13ec5b" />
//       </View>
//     );
//   }

//   if (!group || !paidToMember) return null;

//   const formattedDate = new Date().toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//   });

//   return (
//     <View className="flex-1 bg-background-dark">
//       <ScrollView
//         className="flex-1"
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         <View className="px-6 py-8">
//           {/* Recipient Section */}
//           <View className="items-center mb-10">
//             <View className="relative mb-4">
//               <UserAvatar
//                 name={paidToMember.name}
//                 avatar={paidToMember.avatar}
//                 size="lg"
//               />
//               {/* Checkmark Overlay */}
//               <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary items-center justify-center border-2 border-background-dark">
//                 <Check size={14} color="#0d1a0f" strokeWidth={3} />
//               </View>
//             </View>
//             <Text className="text-slate-400 text-sm font-manrope mb-1">
//               You&apos;re settling with{" "}
//               <Text className="text-white font-manropeBold">
//                 {paidToMember.name}
//               </Text>
//             </Text>
//           </View>

//           {/* Amount Section */}
//           <View className="items-center mb-10">
//             <View className="flex-row items-center">
//               <Text className="text-slate-400 text-5xl font-manropeBold mr-2">
//                 $
//               </Text>
//               <TextInput
//                 className="text-white text-6xl font-manropeBold min-w-[150px]"
//                 placeholder="0.00"
//                 placeholderTextColor="#334155"
//                 keyboardType="decimal-pad"
//                 value={amount}
//                 onChangeText={setAmount}
//                 editable={!isSubmitting}
//                 autoFocus
//               />
//             </View>
//           </View>

//           {/* Date Field */}
//           <View className="mb-6">
//             <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-2">
//               Date
//             </Text>
//             <View className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5">
//               <Text className="flex-1 text-white text-base font-manrope">
//                 Today, {formattedDate}
//               </Text>
//               <Calendar size={20} color="#64748b" />
//             </View>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Action Buttons */}
//       <View className="px-6 pb-8 pt-4 border-t border-white/5 bg-background-dark">
//         <View className="flex-row gap-3">
//           {/* Cancel Button */}
//           <TouchableOpacity
//             onPress={() => router.back()}
//             disabled={isSubmitting}
//             className="flex-1 rounded-xl py-4 items-center bg-surface-dark border border-white/5"
//           >
//             <Text className="text-white text-base font-manropeBold">
//               Cancel
//             </Text>
//           </TouchableOpacity>

//           {/* Mark as Paid Button */}
//           <TouchableOpacity
//             onPress={handleSubmit}
//             disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
//             className={`flex-1 rounded-xl py-4 items-center flex-row justify-center ${
//               !amount || parseFloat(amount) <= 0 || isSubmitting
//                 ? "bg-slate-700"
//                 : "bg-primary"
//             }`}
//           >
//             {isSubmitting ? (
//               <ActivityIndicator color="#0d1a0f" />
//             ) : (
//               <>
//                 <Check size={20} color="#0d1a0f" strokeWidth={3} />
//                 <Text className="text-[#0d1a0f] text-base font-manropeBold ml-2">
//                   Mark as Paid
//                 </Text>
//               </>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// }

import UserAvatar from "@/src/components/ui/UserAvatar";
import { useGroup } from "@/src/services/group.service";
import { useCreateSettlement } from "@/src/services/settlement.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Check } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettlementCreate() {
  const {
    groupId,
    paidTo,
    amount: initialAmount,
  } = useLocalSearchParams<{
    groupId: string;
    paidTo: string;
    amount: string;
  }>();

  const router = useRouter();
  const { data: group, isLoading: groupLoading } = useGroup(groupId);
  const createSettlement = useCreateSettlement();

  // amount is initialized and kept static as per your requirement
  const [amount] = useState(initialAmount || "");
  const [note] = useState("");

  const paidToMember = group?.members.find((m) => m._id === paidTo);
  const isSubmitting = createSettlement.isPending;

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      // Execution waits for backend resolution
      await createSettlement.mutateAsync({
        groupId,
        paidTo,
        amount: parseFloat(amount),
        note: note.trim() || undefined,
      });

      // Navigate back only after successful resolution
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to record payment. Please try again.");
    }
  };

  if (groupLoading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  if (!group || !paidToMember) return null;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <View className="flex-1 bg-background-dark">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-8">
          <View className="items-center mb-10">
            <View className="relative mb-4">
              <UserAvatar
                name={paidToMember.name}
                avatar={paidToMember.avatar}
                size="lg"
              />
              <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary items-center justify-center border-2 border-background-dark">
                <Check size={14} color="#0d1a0f" strokeWidth={3} />
              </View>
            </View>
            <Text className="text-slate-400 text-sm font-manrope mb-1">
              You&apos;re settling with{" "}
              <Text className="text-white font-manropeBold">
                {paidToMember.name}
              </Text>
            </Text>
          </View>

          <View className="items-center mb-10">
            <View className="flex-row items-center">
              <Text className="text-slate-400 text-5xl font-manropeBold mr-2">
                $
              </Text>
              <TextInput
                className="text-white text-6xl font-manropeBold min-w-[150px]"
                value={amount}
                editable={false} // Amount locked as requested
                pointerEvents="none"
              />
            </View>
            <Text className="text-slate-500 text-xs font-manrope mt-2">
              Fixed total debt amount
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-slate-400 text-xs uppercase tracking-wider font-manrope mb-2">
              Date
            </Text>
            <View className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5">
              <Text className="flex-1 text-white text-base font-manrope">
                Today, {formattedDate}
              </Text>
              <Calendar size={20} color="#64748b" />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-8 pt-4 border-t border-white/5 bg-background-dark">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={isSubmitting}
            className="flex-1 rounded-xl py-4 items-center bg-surface-dark border border-white/5"
          >
            <Text className="text-white text-base font-manropeBold">
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 rounded-xl py-4 items-center flex-row justify-center ${
              isSubmitting ? "bg-slate-700" : "bg-primary"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#0d1a0f" />
            ) : (
              <>
                <Check size={20} color="#0d1a0f" strokeWidth={3} />
                <Text className="text-[#0d1a0f] text-base font-manropeBold ml-2">
                  Confirm Payment
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
