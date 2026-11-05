import { useAuth } from "@/src/contexts/AuthContext";
import { evaluate, hasOperator, press } from "@/src/domain/expression";
import { centsToInput, formatMoney, parseCents, type Cents } from "@/src/domain/money";
import { computeShares, SplitError, type Split, type SplitType } from "@/src/domain/splits";
import { useCreateExpense, useUpdateExpense } from "@/src/services/expense.service";
import { useGroupDetails } from "@/src/services/group.service";
import { useTheme } from "@/src/theme/theme";
import { categoryColors, memberColor, type Category } from "@/src/theme/tokens";
import type { Expense, ExpenseType, GroupDetails, GroupMember } from "@/src/types";
import { Avatar } from "@/src/ui/Avatar";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/src/ui/CategoryBadge";
import { DonutRing, type RingSegment } from "@/src/ui/DonutRing";
import { Keypad } from "@/src/ui/Keypad";
import { PressableScale } from "@/src/ui/PressableScale";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Check, ChevronDown, ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { ActionSheetIOS, ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SPLIT_TYPES: { type: SplitType; label: string }[] = [
  { type: "equal", label: "Equally" },
  { type: "exact", label: "Amounts" },
  { type: "percent", label: "%" },
  { type: "shares", label: "Shares" },
];

const CATEGORIES = Object.keys(categoryColors) as Category[];

/** Turns what's typed per person into the split the API takes. Inputs are cents, percent or whole shares. */
function buildSplit(type: SplitType, picked: string[], inputs: Record<string, string>): Split {
  if (type === "equal") return { type, members: picked };
  const values: Record<string, number> = {};
  for (const [id, raw] of Object.entries(inputs)) {
    const value = type === "exact" ? parseCents(raw) : type === "percent" ? Math.round(Number(raw) * 100) : Number(raw);
    if (value && Number.isFinite(value)) values[id] = value;
  }
  return { type, members: Object.keys(values), values };
}

/** The reverse of buildSplit, for editing an existing expense. */
function splitInputs(split: Split): Record<string, string> {
  const inputs: Record<string, string> = {};
  for (const [id, value] of Object.entries(split.values ?? {})) {
    inputs[id] = split.type === "exact" ? centsToInput(value) : split.type === "percent" ? String(value / 100) : String(value);
  }
  return inputs;
}

/** Each person's part in cents for the ring: the real shares when the split works, else what's been assigned so far. */
function ringShares(amountCents: Cents, split: Split): Map<string, Cents> {
  try {
    return new Map(computeShares(amountCents, split).map((s) => [s.userId, s.cents]));
  } catch {
    const values = Object.entries(split.values ?? {});
    if (split.type === "exact") return new Map(values);
    if (split.type === "percent") return new Map(values.map(([id, bp]) => [id, Math.round((amountCents * bp) / 10000)]));
    return new Map();
  }
}

const currencySymbol = (currency: string) => formatMoney(0, currency).replace(/[\d.,\s]/g, "");

export default function ExpenseScreen() {
  const { groupId, expenseId } = useLocalSearchParams<{ groupId: string; expenseId?: string }>();
  const { data, isLoading } = useGroupDetails(groupId);
  const expense = data?.expenses.find((e) => e._id === expenseId);

  if (isLoading || !data || (expenseId && !expense)) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }
  // The form mounts once the data is here, so editing can start from the saved values.
  return <ExpenseForm details={data} expense={expense} />;
}

function ExpenseForm({ details, expense }: { details: GroupDetails; expense?: Expense }) {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const { group } = details;
  const allMembers = group.members.map((m) => m._id);

  const [step, setStep] = useState<"amount" | "split">("amount");
  const [expression, setExpression] = useState(expense ? centsToInput(expense.amountCents) : "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [category, setCategory] = useState<ExpenseType>(expense?.type ?? "food");
  const [paidBy, setPaidBy] = useState(expense?.paidBy._id ?? user?._id ?? "");
  const [splitType, setSplitType] = useState<SplitType>(expense?.split.type ?? "equal");
  const [picked, setPicked] = useState<string[]>(expense?.split.type === "equal" ? expense.split.members : allMembers);
  const [inputs, setInputs] = useState<Record<string, string>>(expense ? splitInputs(expense.split) : {});

  const amountCents = evaluate(expression);
  const validAmount = amountCents !== null && amountCents > 0 ? amountCents : null;
  const dividedByZero = /÷0(?![.\d])/.test(expression) && amountCents === null;

  const split = buildSplit(splitType, picked, inputs);
  let splitProblem: string | null = null;
  try {
    if (validAmount) computeShares(validAmount, split);
  } catch (e) {
    splitProblem = e instanceof SplitError ? e.message : "This split doesn't work";
  }

  const money = (cents: number) => formatMoney(cents, group.currency);
  const member = (id: string) => group.members.find((m) => m._id === id);
  const nameOf = (id: string) => (id === user?._id ? "You" : (member(id)?.name.split(" ")[0] ?? "Someone"));
  const isSubmitting = createExpense.isPending || updateExpense.isPending;
  const canSave = !!validAmount && !!description.trim() && !splitProblem && !isSubmitting;

  const shares = validAmount ? ringShares(validAmount, split) : new Map<string, Cents>();
  const assigned = [...shares.values()].reduce((a, b) => a + b, 0);
  const segments: RingSegment[] = group.members.map((m) => ({
    key: m._id,
    value: shares.get(m._id) ?? 0,
    color: memberColor(m._id),
    user: m,
  }));

  const pickPayer = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      { title: "Who paid?", options: [...allMembers.map(nameOf), "Cancel"], cancelButtonIndex: allMembers.length },
      (i) => i < allMembers.length && setPaidBy(allMembers[i]),
    );

  const handleSubmit = async () => {
    if (!canSave || !validAmount) return;
    const input = { description: description.trim(), amountCents: validAmount, type: category, paidBy, split };
    try {
      if (expense) await updateExpense.mutateAsync({ id: expense._id, ...input });
      else await createExpense.mutateAsync({ groupId: group._id, ...input });
      router.back();
    } catch (error) {
      Alert.alert("Couldn't save", error instanceof Error ? error.message : "Failed to save expense");
    }
  };

  const symbol = currencySymbol(group.currency);
  const shownExpression = expression === "" ? "0" : expression.replace(/([+−×÷])/g, " $1 ");

  if (step === "amount") {
    return (
      <View className="flex-1 bg-bg" style={{ paddingBottom: insets.bottom + 8 }}>
        <Stack.Screen options={{ title: expense ? "Edit expense" : "New expense", headerLeft: undefined }} />

        <View className="flex-1 items-center justify-center px-6">
          <Text
            className={`font-manropeHeavy text-6xl ${expression === "" ? "text-ink-faint" : "text-ink"}`}
            style={{ fontVariant: ["tabular-nums"], lineHeight: 76, paddingTop: 6 }}
            numberOfLines={1}
            adjustsFontSizeToFit
            accessibilityLabel={`Amount ${amountCents !== null ? money(amountCents) : "empty"}`}
          >
            {symbol}
            {shownExpression}
          </Text>
          {hasOperator(expression) && (
            <Animated.Text
              entering={FadeIn.duration(150)}
              className={`font-manropeBold text-2xl mt-1 ${dividedByZero || (amountCents ?? 0) < 0 ? "text-neg" : "text-pos"}`}
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {dividedByZero ? "= ∞ … nice try" : `= ${money(amountCents ?? 0)}`}
            </Animated.Text>
          )}
        </View>

        <View className="px-4 gap-3">
          <TextInput
            className="bg-surface rounded-2xl px-4 py-3.5 text-ink font-manropeSemi text-base"
            placeholder="What was it for?"
            placeholderTextColor={colors.inkFaint}
            value={description}
            onChangeText={setDescription}
            returnKeyType="done"
            maxLength={60}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c];
              const on = c === category;
              return (
                <PressableScale
                  key={c}
                  onPress={() => setCategory(c)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  className={`flex-row items-center gap-1.5 rounded-full pl-2.5 pr-3.5 py-2 ${on ? "" : "bg-surface"}`}
                  style={on ? { backgroundColor: categoryColors[c] } : undefined}
                >
                  <Icon size={16} color={on ? "#0E0E10" : categoryColors[c]} strokeWidth={2.25} />
                  <Text className={`font-manropeBold text-sm ${on ? "text-onfill" : "text-ink"}`}>{CATEGORY_LABELS[c]}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>

          <Keypad onKey={(k) => setExpression((e) => press(e, k))} onClear={() => setExpression("")} />

          <PressableScale
            haptic
            disabled={!validAmount || !description.trim()}
            onPress={() => setStep("split")}
            className="bg-ink rounded-2xl py-4 items-center"
          >
            <Text className="text-bg font-manropeBold text-base">
              {!validAmount ? "Type an amount" : !description.trim() ? "Say what it was for" : "Next: who's in?"}
            </Text>
          </PressableScale>
        </View>
      </View>
    );
  }

  const left = (validAmount ?? 0) - assigned;

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen
        options={{
          title: description.trim(),
          headerLeft: () => (
            <Pressable onPress={() => setStep("amount")} hitSlop={12} className="flex-row items-center" accessibilityLabel="Back to amount">
              <ChevronLeft size={24} color={colors.ink} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(300)} className="items-center pt-4">
          <DonutRing segments={segments} total={validAmount ?? 0}>
            <Text className="text-ink font-manropeHeavy text-3xl" style={{ fontVariant: ["tabular-nums"] }} numberOfLines={1} adjustsFontSizeToFit>
              {money(validAmount ?? 0)}
            </Text>
            <Text className={`font-manropeSemi text-[13px] text-center ${left !== 0 ? "text-neg" : "text-ink-muted"}`}>
              {left > 0
                ? `${money(left)} left`
                : left < 0
                  ? `${money(-left)} too much`
                  : `split ${shares.size} ${shares.size === 1 ? "way" : "ways"}`}
            </Text>
          </DonutRing>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(100)} className="px-5 mt-4 gap-3">
          <PressableScale static onPress={pickPayer} className="flex-row items-center gap-3 bg-surface rounded-2xl p-3.5">
            <Avatar user={member(paidBy) ?? { _id: paidBy, name: "?" }} size="sm" />
            <Text className="flex-1 text-ink font-manropeSemi text-base">
              <Text className="text-ink-muted">Paid by </Text>
              {nameOf(paidBy)}
            </Text>
            <ChevronDown size={18} color={colors.inkMuted} />
          </PressableScale>

          <View className="flex-row bg-surface rounded-2xl p-1">
            {SPLIT_TYPES.map(({ type, label }) => (
              <Pressable
                key={type}
                onPress={() => {
                  setSplitType(type);
                  setInputs({});
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: splitType === type }}
                className={`flex-1 py-2.5 rounded-xl items-center ${splitType === type ? "bg-ink" : ""}`}
              >
                <Text className={`text-sm font-manropeBold ${splitType === type ? "text-bg" : "text-ink-muted"}`}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(200)} className="px-5 mt-3">
          {group.members.map((m) =>
            splitType === "equal" ? (
              <EqualRow
                key={m._id}
                member={m}
                name={nameOf(m._id)}
                on={picked.includes(m._id)}
                share={shares.get(m._id)}
                money={money}
                onToggle={() => setPicked((p) => (p.includes(m._id) ? p.filter((id) => id !== m._id) : [...p, m._id]))}
              />
            ) : (
              <View key={m._id} className="flex-row items-center gap-3 py-2.5">
                <Avatar user={m} size="sm" />
                <Text className="flex-1 text-ink font-manropeSemi text-base">{nameOf(m._id)}</Text>
                {splitType !== "exact" && !!shares.get(m._id) && (
                  <Text className="text-ink-muted font-manrope text-sm" style={{ fontVariant: ["tabular-nums"] }}>
                    {money(shares.get(m._id)!)}
                  </Text>
                )}
                <View className="flex-row items-center bg-surface rounded-xl px-3 min-w-[96px]">
                  {splitType === "exact" && <Text className="text-ink-faint font-manropeBold">{symbol}</Text>}
                  <TextInput
                    className="flex-1 text-ink font-manropeBold text-base text-right py-2.5"
                    placeholder={splitType === "exact" ? "0.00" : "0"}
                    placeholderTextColor={colors.inkFaint}
                    keyboardType={splitType === "shares" ? "number-pad" : "decimal-pad"}
                    value={inputs[m._id] ?? ""}
                    onChangeText={(text) => setInputs((i) => ({ ...i, [m._id]: text }))}
                    accessibilityLabel={`${nameOf(m._id)}'s ${splitType === "exact" ? "amount" : splitType}`}
                  />
                  {splitType === "percent" && <Text className="text-ink-faint font-manropeBold ml-0.5">%</Text>}
                  {splitType === "shares" && <Text className="text-ink-faint font-manrope ml-1">×</Text>}
                </View>
              </View>
            ),
          )}
        </Animated.View>
      </ScrollView>

      <View className="absolute left-0 right-0 bottom-0 px-5 pt-3 bg-bg" style={{ paddingBottom: insets.bottom + 8 }}>
        {!!splitProblem && <Text className="text-neg font-manropeSemi text-[13px] text-center mb-2">{splitProblem}</Text>}
        <PressableScale haptic disabled={!canSave} onPress={handleSubmit} className="bg-lime rounded-2xl py-4 items-center">
          {isSubmitting ? (
            <ActivityIndicator color="#0E0E10" />
          ) : (
            <Text className="text-onfill font-manropeBold text-base">{expense ? "Save changes" : `Add ${money(validAmount ?? 0)}`}</Text>
          )}
        </PressableScale>
      </View>
    </View>
  );
}

function EqualRow({
  member,
  name,
  on,
  share,
  money,
  onToggle,
}: {
  member: GroupMember;
  name: string;
  on: boolean;
  share?: Cents;
  money: (c: number) => string;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      className="flex-row items-center gap-3 py-2.5"
    >
      <View style={{ opacity: on ? 1 : 0.35 }}>
        <Avatar user={member} size="sm" />
      </View>
      <Text className={`flex-1 font-manropeSemi text-base ${on ? "text-ink" : "text-ink-faint"}`}>{name}</Text>
      {on && share !== undefined && (
        <Text className="text-ink-muted font-manropeSemi text-[15px]" style={{ fontVariant: ["tabular-nums"] }}>
          {money(share)}
        </Text>
      )}
      <View className={`w-7 h-7 rounded-full items-center justify-center ${on ? "bg-ink" : "border-2 border-line"}`}>
        {on && <Check size={16} color={colors.background} strokeWidth={3} />}
      </View>
    </Pressable>
  );
}
