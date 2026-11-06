import { useAuth } from "@/src/contexts/AuthContext";
import { evaluate, hasOperator, press } from "@/src/domain/expression";
import { centsToInput, formatMoney, parseCents, type Cents } from "@/src/domain/money";
import { checkPayers, computeShares, evenValues, SplitError, type Share, type Split, type SplitType } from "@/src/domain/splits";
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
import { SheetHeader } from "@/src/ui/SheetHeader";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SPLIT_TYPES: { type: SplitType; label: string }[] = [
  { type: "equal", label: "Equally" },
  { type: "exact", label: "Amounts" },
  { type: "percent", label: "%" },
  { type: "shares", label: "Shares" },
];

const CATEGORIES = Object.keys(categoryColors) as Category[];
const RECENT_DAYS = 14;

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

/** The reverse of buildSplit: values as the text each person's field shows. */
function toInputs(type: SplitType, values: Record<string, number>): Record<string, string> {
  const inputs: Record<string, string> = {};
  for (const [id, value] of Object.entries(values)) {
    inputs[id] = type === "exact" ? centsToInput(value) : type === "percent" ? String(value / 100) : String(value);
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

/** Midnight of each of the last two weeks, newest first, plus the expense's own day if it's older. */
function recentDays(now: Date, keep?: Date) {
  const days = Array.from({ length: RECENT_DAYS }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
  if (keep && keep < days.at(-1)!) days.push(new Date(keep.getFullYear(), keep.getMonth(), keep.getDate()));
  return days;
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** "Today", "Yesterday", "Wed 4" within the strip, and "Oct 28" for an older day. */
function chipLabel(d: Date, now: Date) {
  const daysAgo = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - d.getTime()) / 86_400_000);
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", daysAgo < RECENT_DAYS ? { weekday: "short", day: "numeric" } : { month: "short", day: "numeric" });
}

export default function ExpenseSheet() {
  const { groupId, expenseId } = useLocalSearchParams<{
    groupId: string;
    expenseId?: string;
  }>();
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
  const [now] = useState(() => new Date());

  const [step, setStep] = useState<"amount" | "split">("amount");
  const [expression, setExpression] = useState(expense ? centsToInput(expense.amountCents) : "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [category, setCategory] = useState<ExpenseType>(expense?.type ?? "food");
  const [day, setDay] = useState(() => (expense ? new Date(expense.date) : now));
  const dateStrip = useRef<ScrollViewInstance>(null);

  const [manyPayers, setManyPayers] = useState((expense?.payers.length ?? 1) > 1);
  const [paidBy, setPaidBy] = useState(expense?.paidBy._id ?? user?._id ?? "");
  const [payerInputs, setPayerInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries((expense?.payers ?? []).map((p) => [p.user._id, centsToInput(p.cents)])),
  );
  const [payersOpen, setPayersOpen] = useState(false);

  const [splitType, setSplitType] = useState<SplitType>(expense?.split.type ?? "equal");
  const [picked, setPicked] = useState<string[]>(expense?.split.type === "equal" ? expense.split.members : allMembers);
  const [inputs, setInputs] = useState<Record<string, string>>(expense ? toInputs(expense.split.type, expense.split.values ?? {}) : {});

  const amountCents = evaluate(expression);
  const validAmount = amountCents !== null && amountCents > 0 ? amountCents : null;
  const dividedByZero = /÷0(?![.\d])/.test(expression) && amountCents === null;

  const split = buildSplit(splitType, picked, inputs);
  const payersIn: Share[] = manyPayers
    ? Object.entries(payerInputs).map(([userId, raw]) => ({
        userId,
        cents: parseCents(raw) ?? 0,
      }))
    : [{ userId: paidBy, cents: validAmount ?? 0 }];

  let problem: string | null = null;
  try {
    if (validAmount) {
      checkPayers(validAmount, payersIn);
      computeShares(validAmount, split);
    }
  } catch (e) {
    problem = e instanceof SplitError ? e.message : "This split doesn't work";
  }

  const money = (cents: number) => formatMoney(cents, group.currency);
  const member = (id: string) => group.members.find((m) => m._id === id);
  const nameOf = (id: string) => (id === user?._id ? "You" : (member(id)?.name.split(" ")[0] ?? "Someone"));
  const isSubmitting = createExpense.isPending || updateExpense.isPending;
  const canSave = !!validAmount && !!description.trim() && !problem && !isSubmitting;

  const shares = validAmount ? ringShares(validAmount, split) : new Map<string, Cents>();
  const assigned = [...shares.values()].reduce((a, b) => a + b, 0);
  const segments: RingSegment[] = group.members.map((m) => ({
    key: m._id,
    value: shares.get(m._id) ?? 0,
    color: memberColor(m._id),
    user: m,
  }));
  const paidSoFar = payersIn.reduce((a, p) => a + p.cents, 0);

  const close = () => router.back();

  /** Switching type keeps the same people and starts them from an even split. */
  const switchSplit = (type: SplitType) => {
    if (type === splitType) return;
    const people = splitType === "equal" ? picked : split.members.length ? split.members : allMembers;
    setSplitType(type);
    if (type === "equal") setPicked(people);
    else setInputs(toInputs(type, evenValues(type, people, validAmount ?? 0)));
  };

  const toggleManyPayers = () => {
    if (!manyPayers) setPayerInputs({ [paidBy]: centsToInput(validAmount ?? 0) });
    else setPaidBy(payersIn.reduce((a, b) => (b.cents > a.cents ? b : a), payersIn[0]).userId);
    setManyPayers(!manyPayers);
  };

  const handleSubmit = async () => {
    if (!canSave || !validAmount) return;
    // Today keeps the current time so it sorts above earlier entries; past days sit at midday.
    const date = sameDay(day, now) ? new Date() : new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12);
    const input = {
      description: description.trim(),
      amountCents: validAmount,
      type: category,
      split,
      date: date.toISOString(),
      ...(manyPayers ? { payers: checkPayers(validAmount, payersIn) } : { paidBy }),
    };
    try {
      if (expense) await updateExpense.mutateAsync({ id: expense._id, ...input });
      else await createExpense.mutateAsync({ groupId: group._id, ...input });
      close();
    } catch (error) {
      Alert.alert("Couldn't save", error instanceof Error ? error.message : "Failed to save expense");
    }
  };

  const symbol = currencySymbol(group.currency);
  const shownExpression = expression === "" ? "0" : expression.replace(/([+−×÷])/g, " $1 ");

  if (step === "amount") {
    return (
      <View className="flex-1 bg-bg" style={{ paddingBottom: insets.bottom + 8 }}>
        <SheetHeader title={expense ? "Edit expense" : `New expense · ${group.name}`} onClose={close} />

        <View className="flex-1 items-center justify-center px-6">
          <Text
            className={`font-manropeHeavy text-6xl ${expression === "" ? "text-ink-faint" : "text-ink"}`}
            style={{
              fontVariant: ["tabular-nums"],
              lineHeight: 76,
              paddingTop: 6,
            }}
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
          {/* A form sheet lifts its first scroll view to the top; a fixed-height box keeps this row in place.
              collapsable={false} stops the box being flattened away, which would expose the scroll view again. */}
          <View style={{ height: 40 }} collapsable={false}>
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
          </View>

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
  const payersLeft = (validAmount ?? 0) - paidSoFar;
  const named = payersIn.filter((p) => p.cents > 0);

  return (
    <View className="flex-1 bg-bg">
      <SheetHeader title={description.trim()} onClose={close} onBack={() => setStep("amount")} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="on-drag"
      >
        <Animated.View entering={FadeInDown.duration(300)} className="items-center pt-2">
          <DonutRing segments={segments} total={validAmount ?? 0}>
            <Text
              className="text-ink font-manropeHeavy text-3xl"
              style={{ fontVariant: ["tabular-nums"] }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
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
          <ScrollView ref={dateStrip} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {recentDays(now, expense ? new Date(expense.date) : undefined).map((d) => {
              const on = sameDay(d, day);
              const label = chipLabel(d, now);
              return (
                <PressableScale
                  key={d.toDateString()}
                  onPress={() => setDay(d)}
                  // Bring the saved day into view when editing an older expense.
                  onLayout={(e) => on && dateStrip.current?.scrollTo({ x: Math.max(0, e.nativeEvent.layout.x - 40), animated: false })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={d.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                  className={`rounded-full px-3.5 py-2 ${on ? "bg-ink" : "bg-surface"}`}
                >
                  <Text className={`font-manropeBold text-sm ${on ? "text-bg" : "text-ink-muted"}`}>{label}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>

          <Animated.View layout={LinearTransition.duration(200)} className="bg-surface rounded-2xl overflow-hidden">
            <PressableScale static onPress={() => setPayersOpen((o) => !o)} className="flex-row items-center gap-3 p-3.5">
              {manyPayers ? (
                <View className="flex-row">
                  {named.slice(0, 3).map((p, i) => (
                    <View key={p.userId} style={{ marginLeft: i ? -10 : 0 }}>
                      <Avatar user={member(p.userId) ?? { _id: p.userId, name: "?" }} size="sm" ring />
                    </View>
                  ))}
                </View>
              ) : (
                <Avatar user={member(paidBy) ?? { _id: paidBy, name: "?" }} size="sm" />
              )}
              <Text className="flex-1 text-ink font-manropeSemi text-base" numberOfLines={1}>
                <Text className="text-ink-muted">Paid by </Text>
                {manyPayers ? named.map((p) => nameOf(p.userId)).join(", ") || "…" : nameOf(paidBy)}
              </Text>
              {payersOpen ? <ChevronUp size={18} color={colors.inkMuted} /> : <ChevronDown size={18} color={colors.inkMuted} />}
            </PressableScale>

            {payersOpen && (
              <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)} className="px-3.5 pb-3">
                {group.members.map((m) =>
                  manyPayers ? (
                    <View key={m._id} className="flex-row items-center gap-3 py-2">
                      <Avatar user={m} size="sm" />
                      <Text className="flex-1 text-ink font-manropeSemi text-base">{nameOf(m._id)}</Text>
                      <MoneyField
                        symbol={symbol}
                        value={payerInputs[m._id] ?? ""}
                        onChange={(text) => setPayerInputs((p) => ({ ...p, [m._id]: text }))}
                        label={`${nameOf(m._id)} paid`}
                      />
                    </View>
                  ) : (
                    <Pressable
                      key={m._id}
                      onPress={() => {
                        setPaidBy(m._id);
                        setPayersOpen(false);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: m._id === paidBy }}
                      className="flex-row items-center gap-3 py-2"
                    >
                      <Avatar user={m} size="sm" />
                      <Text className="flex-1 text-ink font-manropeSemi text-base">{nameOf(m._id)}</Text>
                      {m._id === paidBy && <Check size={18} color={colors.ink} strokeWidth={3} />}
                    </Pressable>
                  ),
                )}
                {manyPayers && payersLeft !== 0 && (
                  <Text className="text-neg font-manropeSemi text-[13px] mt-1">
                    {payersLeft > 0 ? `${money(payersLeft)} still to cover` : `${money(-payersLeft)} more than the total`}
                  </Text>
                )}
                <Pressable onPress={toggleManyPayers} hitSlop={6} className="mt-2 self-start">
                  <Text className="text-ink font-manropeBold text-sm underline">
                    {manyPayers ? "Just one person paid" : "Several people paid"}
                  </Text>
                </Pressable>
              </Animated.View>
            )}
          </Animated.View>

          <View className="flex-row bg-surface rounded-2xl p-1">
            {SPLIT_TYPES.map(({ type, label }) => (
              <Pressable
                key={type}
                onPress={() => switchSplit(type)}
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
                {splitType === "exact" ? (
                  <MoneyField
                    symbol={symbol}
                    value={inputs[m._id] ?? ""}
                    onChange={(text) => setInputs((i) => ({ ...i, [m._id]: text }))}
                    label={`${nameOf(m._id)}'s amount`}
                  />
                ) : (
                  <View className="flex-row items-center bg-surface rounded-xl px-3 min-w-[96px]">
                    <TextInput
                      className="flex-1 text-ink font-manropeBold text-base text-right py-2.5"
                      placeholder="0"
                      placeholderTextColor={colors.inkFaint}
                      keyboardType={splitType === "shares" ? "number-pad" : "decimal-pad"}
                      value={inputs[m._id] ?? ""}
                      onChangeText={(text) => setInputs((i) => ({ ...i, [m._id]: text }))}
                      accessibilityLabel={`${nameOf(m._id)}'s ${splitType}`}
                    />
                    <Text className="text-ink-faint font-manropeBold ml-0.5">{splitType === "percent" ? "%" : "×"}</Text>
                  </View>
                )}
              </View>
            ),
          )}
        </Animated.View>
      </ScrollView>

      <View className="absolute left-0 right-0 bottom-0 px-5 pt-3 bg-bg" style={{ paddingBottom: insets.bottom + 8 }}>
        {!!problem && <Text className="text-neg font-manropeSemi text-[13px] text-center mb-2">{problem}</Text>}
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

function MoneyField({
  symbol,
  value,
  onChange,
  label,
}: {
  symbol: string;
  value: string;
  onChange: (text: string) => void;
  label: string;
}) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center bg-surface-muted rounded-xl px-3 min-w-[104px]">
      <Text className="text-ink-faint font-manropeBold">{symbol}</Text>
      <TextInput
        className="flex-1 text-ink font-manropeBold text-base text-right py-2.5"
        placeholder="0.00"
        placeholderTextColor={colors.inkFaint}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChange}
        accessibilityLabel={label}
      />
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
