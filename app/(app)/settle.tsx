import { useAuth } from "@/src/contexts/AuthContext";
import { evaluate, hasOperator, press } from "@/src/domain/expression";
import { centsToInput, formatMoney } from "@/src/domain/money";
import { useGroupDetails } from "@/src/services/group.service";
import { useCreateSettlement } from "@/src/services/settlement.service";
import { useTheme } from "@/src/theme/theme";
import { Avatar } from "@/src/ui/Avatar";
import { Keypad } from "@/src/ui/Keypad";
import { SuccessScreen } from "@/src/ui/SuccessScreen";
import { SheetHeader } from "@/src/ui/SheetHeader";
import { SwipeToConfirm } from "@/src/ui/SwipeToConfirm";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Records a payment either way: you paying someone, or someone paying you (`paidBy` set to them). */
export default function SettleSheet() {
  const params = useLocalSearchParams<{ groupId: string; paidBy?: string; paidTo: string; amountCents: string }>();
  const { groupId, paidTo, amountCents: owedParam } = params;

  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useGroupDetails(groupId);
  const createSettlement = useCreateSettlement();

  const owedCents = owedParam ? Number(owedParam) : null;
  // Starts at the full amount owed; it can be lowered to record a partial payment.
  const [expression, setExpression] = useState(owedCents ? centsToInput(owedCents) : "");
  const [paid, setPaid] = useState<number | null>(null);

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  const payerId = params.paidBy ?? user?._id;
  const received = payerId !== user?._id;
  const payer = data?.group.members.find((m) => m._id === payerId);
  const recipient = data?.group.members.find((m) => m._id === paidTo);
  if (!data || !recipient || !payer || !user) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <Text className="text-ink font-manrope text-base">That person isn&apos;t in this group any more</Text>
      </View>
    );
  }

  const money = (cents: number) => formatMoney(cents, data.group.currency);
  const amountCents = evaluate(expression);
  const valid = amountCents !== null && amountCents > 0;
  const tooMuch = valid && owedCents !== null && amountCents > owedCents;
  // The other person in the payment, whichever side you're on.
  const firstName = (received ? payer : recipient).name.split(" ")[0];
  const close = () => router.back();

  const pay = async () => {
    if (!valid) return false;
    try {
      await createSettlement.mutateAsync({ groupId, paidBy: payerId, paidTo, amountCents });
      setPaid(amountCents);
      return true;
    } catch (error) {
      Alert.alert("Couldn't record payment", error instanceof Error ? error.message : "Failed to record payment");
      return false;
    }
  };

  return (
    <View className="flex-1 bg-bg" style={{ paddingBottom: insets.bottom + 8 }}>
      <SheetHeader title={received ? "Record a payment" : "Settle up"} onClose={close} />
      <View className="flex-row items-center justify-center gap-3 pt-2">
        <Avatar user={payer} size="lg" />
        <ArrowRight size={22} color={colors.inkFaint} />
        <Animated.View entering={FadeInRight.duration(300).delay(150)}>
          <Avatar user={recipient} size="lg" />
        </Animated.View>
      </View>
      <Text className="text-ink-muted font-manropeSemi text-base text-center mt-3">
        {received ? (
          <>
            <Text className="text-ink font-manropeBold">{firstName}</Text> paid you
          </>
        ) : (
          <>
            Paying <Text className="text-ink font-manropeBold">{firstName}</Text>
          </>
        )}
      </Text>

      <View className="flex-1 items-center justify-center px-6">
        <Text
          className={`font-manropeHeavy text-6xl ${expression === "" ? "text-ink-faint" : "text-ink"}`}
          style={{ fontVariant: ["tabular-nums"], lineHeight: 76, paddingTop: 6 }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatMoney(0, data.group.currency).replace(/[\d.,\s]/g, "")}
          {expression === "" ? "0" : expression.replace(/([+−×÷])/g, " $1 ")}
        </Text>
        {hasOperator(expression) && amountCents !== null && (
          <Animated.Text
            entering={FadeIn.duration(150)}
            className="text-ink-muted font-manropeBold text-2xl"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            = {money(amountCents)}
          </Animated.Text>
        )}
        {owedCents !== null && (
          <Text className={`font-manropeSemi text-[15px] mt-2 ${tooMuch ? "text-neg" : "text-ink-muted"}`}>
            {received
              ? tooMuch
                ? `That's more than the ${money(owedCents)} ${firstName} owes`
                : `${firstName} owes you ${money(owedCents)}`
              : tooMuch
                ? `That's more than the ${money(owedCents)} you owe`
                : `You owe ${firstName} ${money(owedCents)}`}
          </Text>
        )}
      </View>

      <View className="px-4 gap-3">
        <Keypad onKey={(k) => setExpression((e) => press(e, k))} onClear={() => setExpression("")} />
        <SwipeToConfirm
          label={valid ? (received ? `Swipe to record ${money(amountCents)}` : `Swipe to pay ${money(amountCents)}`) : "Type an amount"}
          disabled={!valid || tooMuch}
          onConfirm={pay}
        />
      </View>

      <SuccessScreen
        visible={paid !== null}
        title={received ? "Got it!" : "Paid!"}
        line={paid !== null ? (received ? `${firstName} paid you ${money(paid)}` : `You paid ${firstName} ${money(paid)}`) : ""}
        onDone={() => {
          setPaid(null);
          close();
        }}
      />
    </View>
  );
}
