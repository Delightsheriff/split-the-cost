import { useAuth } from "@/src/contexts/AuthContext";
import { useCreateExpense } from "@/src/services/expense.service";
import { useGroup } from "@/src/services/group.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Check, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const EXPENSE_TYPES = [
  { type: "food", icon: "🍽️", label: "Food" },
  { type: "transport", icon: "🚕", label: "Transport" },
  { type: "supplies", icon: "🛒", label: "Supplies" },
  { type: "fuel", icon: "⛽", label: "Fuel" },
  { type: "other", icon: "💰", label: "Other" },
] as const;

const CreateExpense = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data: group, isLoading: groupLoading } = useGroup(groupId);
  const createExpense = useCreateExpense();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState(user?._id || "");
  const [expenseType, setExpenseType] = useState<
    "food" | "transport" | "supplies" | "fuel" | "other"
  >("other");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showTypeModal, setShowTypeModal] = useState(false);

  // Initialize selectedMembers when group loads
  React.useEffect(() => {
    if (group && user && selectedMembers.length === 0) {
      // Auto-select all members including current user
      const allMemberIds = group.members.map((m) => m._id);
      setSelectedMembers(allMemberIds);
      setPaidBy(user._id);
    }
  }, [group, user, selectedMembers.length]);

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const handleSubmit = async () => {
    if (!amount || !description || selectedMembers.length === 0) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await createExpense.mutateAsync({
        groupId,
        description,
        amount: parseFloat(amount),
        type: expenseType,
        paidBy,
        splitBetween: selectedMembers,
      });

      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to create expense");
      console.error("Failed to create expense:", error);
    }
  };

  if (groupLoading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  if (!group) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <Text className="text-white text-lg font-manrope">Group not found</Text>
      </View>
    );
  }

  const selectedType = EXPENSE_TYPES.find((t) => t.type === expenseType);
  const paidByMember = group.members.find((m) => m._id === paidBy);
  const isSubmitting = createExpense.isPending;

  return (
    <View className="flex-1 bg-background-dark">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Input */}
        <View className="px-6 py-8 items-center border-b border-white/5">
          <View className="flex-row items-center justify-center">
            <Text className="text-slate-400 text-5xl font-bold font-manropeBold mr-2 p-4">
              $
            </Text>
            <TextInput
              className="text-white text-6xl font-bold font-manropeBold min-w-[120px]"
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

        {/* Form Fields */}
        <View className="px-6 py-4 gap-3">
          {/* Description */}
          <TouchableOpacity
            onPress={() => !isSubmitting && setShowTypeModal(true)}
            disabled={isSubmitting}
            className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5"
          >
            <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10 mr-3">
              <Text className="text-xl">{selectedType?.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider font-manrope mb-1">
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

          {/* Paid By */}
          <View className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5">
            <View className="w-10 h-10 rounded-full items-center justify-center bg-blue-500/20 mr-3">
              <User size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider font-manrope mb-1">
                Paid by
              </Text>
              <Text className="text-white text-base font-manrope">
                {paidByMember?._id === user?._id ? "You" : paidByMember?.name}
              </Text>
            </View>
          </View>

          {/* Date */}
          <View className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5">
            <View className="w-10 h-10 rounded-full items-center justify-center bg-orange-500/20 mr-3">
              <Calendar size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider font-manrope mb-1">
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

        {/* Split Between */}
        <View className="px-6 py-4">
          <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider font-manrope mb-3">
            Split Between
          </Text>

          <View className="gap-2">
            {group.members.map((member) => {
              const isCurrentUser = member._id === user?._id;
              const initials = member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();
              const colors = ["#f97316", "#8b5cf6", "#06b6d4", "#10b981"];
              const colorIndex =
                parseInt(member._id.slice(-2), 16) % colors.length;

              return (
                <TouchableOpacity
                  key={member._id}
                  onPress={() => !isSubmitting && toggleMember(member._id)}
                  disabled={isSubmitting}
                  className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5"
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors[colorIndex] }}
                  >
                    <Text className="text-white text-sm font-bold font-manropeBold">
                      {initials}
                    </Text>
                  </View>
                  <Text className="flex-1 text-white text-base font-manrope">
                    {isCurrentUser ? "You" : member.name}
                  </Text>
                  {selectedMembers.includes(member._id) && (
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Check size={16} color="#0d1a0f" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
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
          className={`w-full rounded-xl py-4 items-center ${
            !amount ||
            !description ||
            selectedMembers.length === 0 ||
            isSubmitting
              ? "bg-slate-700"
              : "bg-primary"
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0d1a0f" />
          ) : (
            <Text className="text-[#0d1a0f] text-lg font-bold font-manropeBold">
              Save Expense
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Expense Type Modal */}
      <Modal
        visible={showTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowTypeModal(false)}
        >
          <View className="bg-surface-dark rounded-2xl p-6 mx-6 w-80 border border-white/10">
            <Text className="text-white text-lg font-bold font-manropeBold mb-4">
              Select Type
            </Text>
            {EXPENSE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.type}
                onPress={() => {
                  setExpenseType(type.type);
                  setShowTypeModal(false);
                }}
                className="flex-row items-center py-3 border-b border-white/5"
              >
                <Text className="text-2xl mr-3">{type.icon}</Text>
                <Text className="flex-1 text-white text-base font-manrope">
                  {type.label}
                </Text>
                {expenseType === type.type && (
                  <Check size={20} color="#13ec5b" strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default CreateExpense;
