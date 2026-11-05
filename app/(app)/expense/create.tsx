import ExpenseTypeModal, {
  EXPENSE_TYPES,
} from "@/src/components/ui/ExpenseTypeModal";
import MemberSelectRow from "@/src/components/ui/MemberSelectRow";
import { useAuth } from "@/src/contexts/AuthContext";
import { useCreateExpense } from "@/src/services/expense.service";
import { useGroupDetails } from "@/src/services/group.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, User } from "lucide-react-native";
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

const CreateExpense = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: group, isLoading: groupLoading } = useGroupDetails(groupId);
  const createExpense = useCreateExpense();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseType, setExpenseType] = useState<any>("other");
  // null until the user changes it, which means everyone in the group.
  const [pickedMembers, setPickedMembers] = useState<string[] | null>(null);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const allMembers = group?.group.members.map((m) => m._id) ?? [];
  const selectedMembers = pickedMembers ?? allMembers;

  const toggleMember = (id: string) => {
    setPickedMembers((picked) => {
      const prev = picked ?? allMembers;
      return prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (!amount || !description || selectedMembers.length === 0) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      await createExpense.mutateAsync(
        {
          groupId,
          description,
          amount: parseFloat(amount),
          type: expenseType,
          paidBy: user?._id || "",
          splitBetween: selectedMembers,
        },
        {
          onSuccess: () => {
            router.back();
          },
        },
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create expense");
      console.error(error);
    }
  };

  if (groupLoading || !group)
    return (
      <ActivityIndicator
        className="flex-1 bg-background-dark"
        color="#13ec5b"
      />
    );

  const selectedType = EXPENSE_TYPES.find((t) => t.type === expenseType);
  const isSubmitting = createExpense.isPending;

  return (
    <View className="flex-1 bg-background-dark">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Section */}
        <View className="px-6 py-8 items-center border-b border-white/5">
          <View className="flex-row items-center p-2">
            <Text className="text-slate-400 text-5xl font-manropeBold mr-2">
              $
            </Text>
            <TextInput
              className="text-white text-6xl font-manropeBold min-w-[120px] "
              placeholder="0.00"
              placeholderTextColor="#334155"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              editable={!isSubmitting}
              autoFocus
            />
          </View>
        </View>

        {/* Inputs Section */}
        <View className="px-6 py-4 gap-3">
          <TouchableOpacity
            onPress={() => !isSubmitting && setShowTypeModal(true)}
            className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5"
          >
            <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10 mr-3">
              <Text className="text-xl">{selectedType?.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs uppercase font-manrope mb-1">
                Description
              </Text>
              <TextInput
                className="text-white text-base font-manrope"
                placeholder="What is this for?"
                placeholderTextColor="#64748b"
                value={description}
                onChangeText={setDescription}
                editable={!isSubmitting}
              />
            </View>
          </TouchableOpacity>

          <View className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5">
            <View className="w-10 h-10 rounded-full items-center justify-center bg-blue-500/20 mr-3">
              <User size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs uppercase font-manrope mb-1">
                Paid by
              </Text>
              <Text className="text-white text-base font-manrope">You</Text>
            </View>
          </View>

          <View className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5">
            <View className="w-10 h-10 rounded-full items-center justify-center bg-orange-500/20 mr-3">
              <Calendar size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs uppercase font-manrope mb-1">
                Date
              </Text>
              <Text className="text-white text-base font-manrope">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Members List Section */}
        <View className="px-6 py-4">
          <Text className="text-slate-400 text-xs uppercase font-manrope mb-3">
            Split Between
          </Text>
          {group.group.members.map((member) => (
            <MemberSelectRow
              key={member._id}
              member={member}
              isCurrentUser={member._id === user?._id}
              isSelected={selectedMembers.includes(member._id)}
              onToggle={() => toggleMember(member._id)}
              disabled={isSubmitting}
            />
          ))}
        </View>
        <View className="h-32" />
      </ScrollView>

      {/* Save Button */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-background-dark border-t border-white/5">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={
            !amount ||
            !description ||
            selectedMembers.length === 0 ||
            isSubmitting
          }
          className={`w-full rounded-xl py-4 items-center ${!amount || !description || selectedMembers.length === 0 || isSubmitting ? "bg-slate-700" : "bg-primary"}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0d1a0f" />
          ) : (
            <Text className="text-[#0d1a0f] text-lg font-manropeBold">
              Save Expense
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ExpenseTypeModal
        visible={showTypeModal}
        selectedType={expenseType}
        onClose={() => setShowTypeModal(false)}
        onSelect={(t) => {
          setExpenseType(t);
          setShowTypeModal(false);
        }}
      />
    </View>
  );
};

export default CreateExpense;
