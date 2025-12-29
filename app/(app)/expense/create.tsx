import { DUMMY_GROUPS } from "@/src/services/data";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Check, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Expense type options
const EXPENSE_TYPES = [
  { type: "food", icon: "🍽️", label: "Food" },
  { type: "transport", icon: "🚕", label: "Transport" },
  { type: "supplies", icon: "🛒", label: "Supplies" },
  { type: "fuel", icon: "⛽", label: "Fuel" },
  { type: "other", icon: "💰", label: "Other" },
];

const CreateExpense = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();

  const group = DUMMY_GROUPS.find((g) => g.id === groupId);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("You");
  const [date, setDate] = useState("Today, Oct 24");
  const [expenseType, setExpenseType] = useState("other");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    group ? ["You", ...group.members.map((m) => m.id)] : ["You"]
  );

  const [showTypeModal, setShowTypeModal] = useState(false);

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = () => {
    const expenseData = {
      groupId,
      amount: parseFloat(amount),
      description,
      paidBy,
      date,
      type: expenseType,
      splitBetween: selectedMembers,
      splitAmount: parseFloat(amount) / selectedMembers.length,
    };

    console.log("Expense Data:", expenseData);
    // TODO: Submit to API
    router.back();
  };

  if (!group) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <Text className="text-white text-lg font-manrope">Group not found</Text>
      </View>
    );
  }

  const selectedType = EXPENSE_TYPES.find((t) => t.type === expenseType);

  return (
    <View className="flex-1 bg-background-dark">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Input */}
        <View className="px-6 py-8 items-center border-b border-white/5">
          <View className="flex-row items-center">
            <Text className="text-slate-400 text-5xl font-bold font-manropeBold mr-2">
              $
            </Text>
            <TextInput
              className="text-white text-6xl font-bold font-manropeBold min-w-[120px]"
              placeholder="0.00"
              placeholderTextColor="#334155"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>
        </View>

        {/* Form Fields */}
        <View className="px-6 py-4 gap-3">
          {/* Description */}
          <TouchableOpacity
            onPress={() => setShowTypeModal(true)}
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
              />
            </View>
          </TouchableOpacity>

          {/* Paid By */}
          <TouchableOpacity className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5">
            <View className="w-10 h-10 rounded-full items-center justify-center bg-blue-500/20 mr-3">
              <User size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider font-manrope mb-1">
                Paid by
              </Text>
              <Text className="text-white text-base font-manrope">
                {paidBy}
              </Text>
            </View>
            <Text className="text-slate-400">›</Text>
          </TouchableOpacity>

          {/* Date */}
          <TouchableOpacity className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5">
            <View className="w-10 h-10 rounded-full items-center justify-center bg-orange-500/20 mr-3">
              <Calendar size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider font-manrope mb-1">
                Date
              </Text>
              <Text className="text-white text-base font-manrope">{date}</Text>
            </View>
            <Text className="text-slate-400">›</Text>
          </TouchableOpacity>
        </View>

        {/* Split Between */}
        <View className="px-6 py-4">
          <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider font-manrope mb-3">
            Split Between
          </Text>

          <View className="gap-2">
            {/* You */}
            <TouchableOpacity
              onPress={() => toggleMember("You")}
              className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5"
            >
              <View className="w-10 h-10 rounded-full bg-orange-500 items-center justify-center mr-3">
                <Text className="text-white text-sm font-bold font-manropeBold">
                  Y
                </Text>
              </View>
              <Text className="flex-1 text-white text-base font-manrope">
                You
              </Text>
              {selectedMembers.includes("You") && (
                <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                  <Check size={16} color="#0d1a0f" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>

            {/* Group Members */}
            {group.members.map((member) => {
              const initials = member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();
              const colors = ["#8b5cf6", "#06b6d4", "#10b981"];
              const colorIndex =
                parseInt(member.id) % colors.length ||
                Math.floor(Math.random() * colors.length);

              return (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => toggleMember(member.id)}
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
                    {member.name}
                  </Text>
                  {selectedMembers.includes(member.id) && (
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
          disabled={!amount || !description || selectedMembers.length === 0}
          className={`w-full rounded-xl py-4 items-center ${
            !amount || !description || selectedMembers.length === 0
              ? "bg-slate-700"
              : "bg-primary"
          }`}
        >
          <Text className="text-[#0d1a0f] text-lg font-bold font-manropeBold">
            Save Expense
          </Text>
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
