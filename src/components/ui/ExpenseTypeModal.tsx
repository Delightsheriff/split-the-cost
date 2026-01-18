import { Check } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

export const EXPENSE_TYPES = [
  { type: "food", icon: "🍽️", label: "Food" },
  { type: "transport", icon: "🚕", label: "Transport" },
  { type: "supplies", icon: "🛒", label: "Supplies" },
  { type: "fuel", icon: "⛽", label: "Fuel" },
  { type: "other", icon: "💰", label: "Other" },
] as const;

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedType: string;
  onSelect: (type: any) => void;
}

const ExpenseTypeModal = ({
  visible,
  onClose,
  selectedType,
  onSelect,
}: Props) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <Pressable
      className="flex-1 bg-black/50 justify-center items-center"
      onPress={onClose}
    >
      <View className="bg-surface-dark rounded-2xl p-6 mx-6 w-80 border border-white/10">
        <Text className="text-white text-lg font-bold font-manropeBold mb-4">
          Select Type
        </Text>
        {EXPENSE_TYPES.map((type) => (
          <TouchableOpacity
            key={type.type}
            onPress={() => onSelect(type.type)}
            className="flex-row items-center py-3 border-b border-white/5"
          >
            <Text className="text-2xl mr-3">{type.icon}</Text>
            <Text className="flex-1 text-white text-base font-manrope">
              {type.label}
            </Text>
            {selectedType === type.type && (
              <Check size={20} color="#13ec5b" strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Pressable>
  </Modal>
);

export default ExpenseTypeModal;
