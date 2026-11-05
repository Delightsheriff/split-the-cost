import { useAuth } from "@/src/contexts/AuthContext";
import { Moodling, useLookAtTouch } from "@/src/ui/Moodling";
import { PressableScale } from "@/src/ui/PressableScale";
import { Wordmark } from "@/src/ui/Wordmark";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function Welcome() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const { look, handlers } = useLookAtTouch();

  const signIn = async () => {
    await completeOnboarding();
    router.push("/(public)/auth/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-5 pt-2">
        <Wordmark />
      </View>

      {/* The three moods, huddled. Each one squishes when poked, and they all watch your finger. */}
      <View className="flex-1 items-center justify-center" {...handlers}>
        <View className="flex-row items-end">
          <Animated.View entering={ZoomIn.springify().damping(12).delay(250)} style={{ marginRight: -18, marginBottom: 8 }}>
            <Moodling balanceCents={-1} size={110} look={look} />
          </Animated.View>
          <Animated.View entering={ZoomIn.springify().damping(12).delay(100)} style={{ zIndex: 1 }}>
            <Moodling balanceCents={1} size={170} look={look} />
          </Animated.View>
          <Animated.View entering={ZoomIn.springify().damping(12).delay(400)} style={{ marginLeft: -18, marginBottom: 8 }}>
            <Moodling balanceCents={0} size={110} look={look} />
          </Animated.View>
        </View>
      </View>

      <View className="px-5 pb-4">
        <Animated.Text entering={FadeInDown.duration(300).delay(300)} className="text-ink font-manropeHeavy text-[44px] leading-[48px] tracking-tight">
          Split bills,{"\n"}
          <Text className="text-pos">not friendships.</Text>
        </Animated.Text>
        <Animated.Text entering={FadeInDown.duration(300).delay(400)} className="text-ink-muted font-manrope text-base mt-3 leading-6">
          Track what you share with flatmates, trips and friends, and settle up in a swipe.
        </Animated.Text>

        <Animated.View entering={FadeInDown.duration(300).delay(500)} className="mt-8 gap-3">
          <PressableScale haptic onPress={() => router.push("/(public)/onboarding")} className="bg-lime rounded-full h-14 items-center justify-center">
            <Text className="text-onfill font-manropeBold text-base">Get started</Text>
          </PressableScale>
          <PressableScale onPress={signIn} className="bg-surface rounded-full h-14 items-center justify-center">
            <Text className="text-ink font-manropeBold text-base">I have an account</Text>
          </PressableScale>
        </Animated.View>

        <Text className="text-ink-faint font-manrope text-xs text-center mt-5">
          By continuing you agree to the Terms and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}
