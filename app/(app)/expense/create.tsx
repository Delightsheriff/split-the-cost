import ExpenseTypeModal, {
  EXPENSE_TYPES,
} from "@/src/components/ui/ExpenseTypeModal";
import MemberSelectRow from "@/src/components/ui/MemberSelectRow";
import { useAuth } from "@/src/contexts/AuthContext";
import { centsToInput, formatMoney, parseCents } from "@/src/domain/money";
import { computeShares, SplitError, type Split, type SplitType } from "@/src/domain/splits";
import { useCreateExpense, useUpdateExpense } from "@/src/services/expense.service";
import { useGroupDetails } from "@/src/services/group.service";
import type { Expense, ExpenseType, GroupDetails } from "@/src/types";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, ChevronDown, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SPLIT_TYPES: { type: SplitType; label: string }[] = [
  { type: "equal", label: "Equal" },
  { type: "exact", label: "Amounts" },
  { type: "percent", label: "%" },
  { type: "shares", label: "Shares" },
];

/** Turns what's typed per person into the split the API takes. Inputs are cents, percent or whole shares. */
function buildSplit(type: SplitType, picked: string[], inputs: Record<string, string>): Split {
  if (type === "equal") return { type, members: picked };
  const values: Record<string, number> = {};
  for (const [id, raw] of Object.entries(inputs)) {
    const value =
      type === "exact"
        ? parseCents(raw)
        : type === "percent"
          ? Math.round(Number(raw) * 100)
          : Number(raw);
    if (value && Number.isFinite(value)) values[id] = value;
  }
  return { type, members: Object.keys(values), values };
}

/** The reverse of buildSplit, for editing an existing expense. */
function splitInputs(split: Split): Record<string, string> {
  const inputs: Record<string, string> = {};
  for (const [id, value] of Object.entries(split.values ?? {})) {
    inputs[id] =
      split.type === "exact" ? centsToInput(value) : split.type === "percent" ? String(value / 100) : String(value);
  }
  return inputs;
}

export default function ExpenseScreen() {
  const { groupId, expenseId } = useLocalSearchParams<{ groupId: string; expenseId?: string }>();
  const { data, isLoading } = useGroupDetails(groupId);
  const expense = data?.expenses.find((e) => e._id === expenseId);

  if (isLoading || !data || (expenseId && !expense)) {
    return <ActivityIndicator className="flex-1 bg-background-dark" color="#13ec5b" />;
  }
  // The form mounts once the data is here, so editing can start from the saved values.
  return <ExpenseForm details={data} expense={expense} />;
}

function ExpenseForm({ details, expense }: { details: GroupDetails; expense?: Expense }) {
  const router = useRouter();
  const { user } = useAuth();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const { group } = details;
  const allMembers = group.members.map((m) => m._id);

  const [amount, setAmount] = useState(expense ? centsToInput(expense.amountCents) : "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [expenseType, setExpenseType] = useState<ExpenseType>(expense?.type ?? "other");
  const [paidBy, setPaidBy] = useState(expense?.paidBy._id ?? user?._id ?? "");
  const [splitType, setSplitType] = useState<SplitType>(expense?.split.type ?? "equal");
  const [picked, setPicked] = useState<string[]>(expense?.split.type === "equal" ? expense.split.members : allMembers);
  const [inputs, setInputs] = useState<Record<string, string>>(expense ? splitInputs(expense.split) : {});
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [openedAt] = useState(() => new Date());

  const amountCents = parseCents(amount);
  const split = buildSplit(splitType, picked, inputs);
  let splitProblem: string | null = null;
  try {
    if (amountCents) computeShares(amountCents, split);
  } catch (e) {
    splitProblem = e instanceof SplitError ? e.message : "This split doesn't work";
  }

  const money = (cents: number) => formatMoney(cents, group.currency);
  const nameOf = (id: string) => (id === user?._id ? "You" : group.members.find((m) => m._id === id)?.name ?? "Someone");
  const isSubmitting = createExpense.isPending || updateExpense.isPending;
  const canSave = !!amountCents && !!description.trim() && !splitProblem && !isSubmitting;

  // What's still unassigned, so people can see why a split won't save yet.
  const assigned =
    splitType === "exact"
      ? `${money(Object.values(split.values ?? {}).reduce((a, b) => a + b, 0))} of ${money(amountCents ?? 0)}`
      : splitType === "percent"
        ? `${Object.values(split.values ?? {}).reduce((a, b) => a + b, 0) / 100}% of 100%`
        : null;

  const pickPayer = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      { title: "Who paid?", options: [...allMembers.map(nameOf), "Cancel"], cancelButtonIndex: allMembers.length },
      (i) => i < allMembers.length && setPaidBy(allMembers[i]),
    );

  const handleSubmit = async () => {
    if (!canSave || !amountCents) return;
    const input = { description: description.trim(), amountCents, type: expenseType, paidBy, split };
    try {
      if (expense) await updateExpense.mutateAsync({ id: expense._id, ...input });
      else await createExpense.mutateAsync({ groupId: group._id, ...input });
      router.back();
    } catch (error) {
      Alert.alert("Couldn't save", error instanceof Error ? error.message : "Failed to save expense");
    }
  };

  const selectedType = EXPENSE_TYPES.find((t) => t.type === expenseType);

  return (
    <View className="flex-1 bg-background-dark">
      <Stack.Screen options={{ title: expense ? "Edit Expense" : "Add Expense" }} />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Section */}
        <View className="px-6 py-8 items-center border-b border-white/5">
          <TextInput
            className="text-white text-6xl font-manropeBold min-w-[120px] text-center"
            placeholder="0.00"
            placeholderTextColor="#334155"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            editable={!isSubmitting}
            autoFocus={!expense}
          />
          <Text className="text-slate-500 text-xs font-manrope mt-1">{group.currency}</Text>
        </View>

        {/* Inputs Section */}
        <View className="px-6 py-4 gap-3">
          <View className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5">
            <TouchableOpacity
              onPress={() => !isSubmitting && setShowTypeModal(true)}
              className="w-10 h-10 rounded-full items-center justify-center bg-white/10 mr-3"
              accessibilityLabel="Change category"
            >
              <Text className="text-xl">{selectedType?.icon}</Text>
            </TouchableOpacity>
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
          </View>

          <TouchableOpacity
            onPress={pickPayer}
            disabled={isSubmitting}
            className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5"
          >
            <View className="w-10 h-10 rounded-full items-center justify-center bg-blue-500/20 mr-3">
              <User size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs uppercase font-manrope mb-1">
                Paid by
              </Text>
              <Text className="text-white text-base font-manrope">{nameOf(paidBy)}</Text>
            </View>
            <ChevronDown size={18} color="#64748b" />
          </TouchableOpacity>

          <View className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5">
            <View className="w-10 h-10 rounded-full items-center justify-center bg-orange-500/20 mr-3">
              <Calendar size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs uppercase font-manrope mb-1">
                Date
              </Text>
              <Text className="text-white text-base font-manrope">
                {(expense ? new Date(expense.date) : openedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Split Section */}
        <View className="px-6 py-4">
          <Text className="text-slate-400 text-xs uppercase font-manrope mb-3">
            Split
          </Text>
          <View className="flex-row bg-surface-dark rounded-xl p-1 mb-4 border border-white/5">
            {SPLIT_TYPES.map(({ type, label }) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  setSplitType(type);
                  setInputs({});
                }}
                disabled={isSubmitting}
                className={`flex-1 py-2 rounded-lg items-center ${splitType === type ? "bg-primary" : ""}`}
                accessibilityState={{ selected: splitType === type }}
              >
                <Text
                  className={`text-sm font-manropeBold ${splitType === type ? "text-background-dark" : "text-slate-300"}`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {splitType === "equal"
            ? group.members.map((member) => (
                <MemberSelectRow
                  key={member._id}
                  member={member}
                  isCurrentUser={member._id === user?._id}
                  isSelected={picked.includes(member._id)}
                  onToggle={() =>
                    setPicked((p) =>
                      p.includes(member._id) ? p.filter((m) => m !== member._id) : [...p, member._id],
                    )
                  }
                  disabled={isSubmitting}
                />
              ))
            : group.members.map((member) => (
                <View
                  key={member._id}
                  className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-2 border border-white/5"
                >
                  <Text className="flex-1 text-white text-base font-manrope">{nameOf(member._id)}</Text>
                  <TextInput
                    className="text-white text-base font-manropeBold text-right min-w-[80px]"
                    placeholder={splitType === "exact" ? "0.00" : "0"}
                    placeholderTextColor="#475569"
                    keyboardType={splitType === "shares" ? "number-pad" : "decimal-pad"}
                    value={inputs[member._id] ?? ""}
                    onChangeText={(text) => setInputs((i) => ({ ...i, [member._id]: text }))}
                    editable={!isSubmitting}
                    accessibilityLabel={`${nameOf(member._id)}'s ${splitType === "exact" ? "amount" : splitType}`}
                  />
                  {splitType === "percent" && <Text className="text-slate-400 ml-1">%</Text>}
                </View>
              ))}

          {!!amountCents && (assigned || splitProblem) && (
            <Text className={`text-xs font-manrope mt-2 ${splitProblem ? "text-amber-400" : "text-slate-400"}`}>
              {assigned ? `${assigned} assigned` : splitProblem}
            </Text>
          )}
        </View>
        <View className="h-32" />
      </ScrollView>

      {/* Save Button */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-background-dark border-t border-white/5">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSave}
          className={`w-full rounded-xl py-4 items-center ${canSave ? "bg-primary" : "bg-slate-700"}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0d1a0f" />
          ) : (
            <Text className="text-[#0d1a0f] text-lg font-manropeBold">
              {expense ? "Save Changes" : "Save Expense"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ExpenseTypeModal
        visible={showTypeModal}
        selectedType={expenseType}
        onClose={() => setShowTypeModal(false)}
        onSelect={(t) => {
          setExpenseType(t as ExpenseType);
          setShowTypeModal(false);
        }}
      />
    </View>
  );
}
