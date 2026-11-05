import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/theme/theme";
import { memberColor } from "@/src/theme/tokens";
import { Avatar } from "@/src/ui/Avatar";
import { DonutRing } from "@/src/ui/DonutRing";
import { Moodling, useLookAtTouch } from "@/src/ui/Moodling";
import { PressableScale } from "@/src/ui/PressableScale";
import { Wordmark } from "@/src/ui/Wordmark";
import { useRouter } from "expo-router";
import { ArrowRight, Check } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { FlatList, Text, useWindowDimensions, View } from "react-native";
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, type SharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Sample people for the illustrations; nobody real.
const PEOPLE = [
  { _id: "u_demo", name: "You" },
  { _id: "u_tari", name: "Tari" },
  { _id: "u_ada", name: "Ada" },
  { _id: "u_kemi", name: "Kemi" },
];

function RingArt() {
  return (
    <DonutRing size={250} total={28600} segments={PEOPLE.map((p) => ({ key: p._id, value: 7150, color: memberColor(p._id), user: p }))}>
      <Text className="text-ink font-manropeHeavy text-3xl">$286</Text>
      <Text className="text-ink-muted font-manropeSemi text-xs mt-1">$71.50 each</Text>
    </DonutRing>
  );
}

function KeypadArt() {
  return (
    <View className="items-center">
      <Text className="text-ink font-manropeHeavy text-5xl" style={{ fontVariant: ["tabular-nums"], lineHeight: 60 }}>
        $143 × 2
      </Text>
      <Text className="text-ink-muted font-manropeBold text-2xl mt-1">= $286.00</Text>
      <View className="flex-row gap-2 mt-8">
        {["7", "8", "9", "×"].map((k) => (
          <View key={k} className={`w-16 h-14 rounded-2xl items-center justify-center ${k === "×" ? "bg-surface-muted" : "bg-surface"}`}>
            <Text className={`font-manropeBold ${k === "×" ? "text-ink-muted text-[30px]" : "text-ink text-2xl"}`}>{k}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SettleArt() {
  const { colors } = useTheme();
  return (
    <View className="items-center">
      <View className="flex-row items-center gap-4">
        <Avatar user={PEOPLE[0]} size="xl" />
        <ArrowRight size={28} color={colors.inkFaint} />
        <Avatar user={PEOPLE[1]} size="xl" />
      </View>
      <View className="h-16 w-72 rounded-full bg-lime mt-10 flex-row items-center px-1">
        <Text className="flex-1 text-onfill font-manropeBold text-base text-center">Paid $46.50</Text>
        <View className="w-14 h-14 rounded-full bg-onfill items-center justify-center">
          <Check size={24} color="#13EC5B" strokeWidth={3} />
        </View>
      </View>
    </View>
  );
}

function MoodArt() {
  const { look, handlers } = useLookAtTouch();
  return (
    <View className="flex-row items-end gap-3" {...handlers}>
      <Moodling balanceCents={-1} size={84} look={look} />
      <Moodling balanceCents={1} size={130} look={look} />
      <Moodling balanceCents={0} size={84} look={look} />
    </View>
  );
}

const SLIDES = [
  { key: "track", title: "Every shared bill,\none place", line: "Trips, flats, Friday lunch. Everyone sees the same numbers.", Art: RingArt },
  { key: "add", title: "Type it like\na calculator", line: "Add an expense in seconds. The maths happens as you go.", Art: KeypadArt },
  { key: "settle", title: "Settle with\na swipe", line: "See who owes who, then swipe to pay them back.", Art: SettleArt },
  { key: "mood", title: "Meet your\nMoodling", line: "It cheers when you're owed and sweats when you owe. Give it a poke.", Art: MoodArt },
];

function Dot({ index, x, width }: { index: number; x: SharedValue<number>; width: number }) {
  const style = useAnimatedStyle(() => {
    const t = interpolate(x.value / width, [index - 1, index, index + 1], [0, 1, 0], "clamp");
    return { width: 8 + t * 16, opacity: 0.3 + t * 0.7 };
  });
  return <Animated.View style={style} className="h-2 rounded-full bg-ink" />;
}

export default function Onboarding() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  const list = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });

  // A programmatic scroll doesn't end in momentum, so track the page here too.
  const next = () => {
    list.current?.scrollToIndex({ index: index + 1 });
    setIndex(index + 1);
  };

  const finish = async (to: "/(public)/auth/login" | "/(public)/auth/register") => {
    await completeOnboarding();
    router.replace(to);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-5 flex-row items-center justify-between pt-2">
        <Wordmark />
        <PressableScale onPress={() => finish("/(public)/auth/login")} hitSlop={10} className="px-2 py-2">
          <Text className="text-ink-muted font-manropeBold text-sm">Skip</Text>
        </PressableScale>
      </View>

      <Animated.FlatList
        ref={list}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item: { Art, title, line } }) => (
          <View style={{ width }} className="flex-1 px-8 justify-center">
            <View className="h-80 items-center justify-center">
              <Art />
            </View>
            <Text className="text-ink font-manropeHeavy text-4xl tracking-tight mt-8">{title}</Text>
            <Text className="text-ink-muted font-manrope text-base mt-3 leading-6">{line}</Text>
          </View>
        )}
      />

      <View className="px-5 pb-4">
        <View className="flex-row gap-2 mb-6 px-3">
          {SLIDES.map((s, i) => (
            <Dot key={s.key} index={i} x={x} width={width} />
          ))}
        </View>
        <PressableScale
          haptic
          onPress={() => (last ? finish("/(public)/auth/register") : next())}
          className="bg-lime rounded-full h-14 items-center justify-center"
        >
          <Text className="text-onfill font-manropeBold text-base">{last ? "Get started" : "Next"}</Text>
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}
