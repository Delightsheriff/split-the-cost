import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight, Wallet } from "lucide-react-native";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

const Welcome = () => {
  const router = useRouter();

  function handleSkip() {
    router.push("/(public)/auth/login");
  }

  function handleGetStarted() {
    router.push("/(public)/onboarding");
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-background-dark p-6">
        {/* Top bar */}
        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center gap-2">
            <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center shadow-lg shadow-primary/20">
              <Wallet size={24} color="#102216" />
            </View>

            <View className="flex-row items-center">
              <Text className="text-xl font-extrabold tracking-tight text-white font-manropeBold">
                Split
              </Text>
              <Text className="text-xl font-extrabold tracking-tight text-primary font-manropeBold">
                It
              </Text>
            </View>
          </View>

          <Pressable onPress={handleSkip} className="px-2 py-1">
            <Text className="text-sm text-slate-500 font-manropeBold">
              Skip
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-between px-5 mt-10">
          {/* Image with gradient overlays */}
          <View style={{ width: "100%", height: "50%", position: "relative" }}>
            <Image
              source={require("../../assets/bg1.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />

            {/* Top fade */}
            <LinearGradient
              colors={["rgba(16,34,22,0.95)", "transparent"]}
              locations={[0, 0.5]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 120,
              }}
            />

            {/* Bottom fade */}
            <LinearGradient
              colors={["transparent", "rgba(16,34,22,1)"]}
              locations={[0.4, 1]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 160,
              }}
            />

            {/* Side edge blend */}
            <LinearGradient
              colors={[
                "rgba(16,34,22,0.8)",
                "transparent",
                "rgba(16,34,22,0.8)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              locations={[0, 0.25, 1]}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
              pointerEvents="none"
            />
          </View>

          {/* Text */}
          <View className="items-center mt-6">
            <Text className="text-4xl font-extrabold font-manropeBold text-center">
              <Text className="text-white">Split bills,{"\n"}</Text>
              <Text className="text-primary">not friendships</Text>
            </Text>

            <Text className="text-base font-medium text-slate-600 max-w-[280px] leading-relaxed text-center font-manrope mt-3">
              Track shared expenses and settle up instantly with roommates,
              trips, and friends.
            </Text>
          </View>

          {/* Actions */}
          <View className="w-full">
            <Pressable
              className="bg-primary py-5 rounded-2xl items-center flex-row justify-center gap-2 shadow-lg shadow-primary/30 my-6"
              onPress={handleGetStarted}
            >
              <Text className="text-background-dark font-manropeBold text-lg font-bold">
                Get Started
              </Text>
              <ArrowRight />
            </Pressable>

            <Pressable className="items-center" onPress={handleSkip}>
              <Text className="text-background-light font-manropeBold font-bold text-lg">
                I have an account
              </Text>
            </Pressable>

            <View className="mt-8">
              <Text className="text-xs text-slate-400 font-medium text-center font-manrope">
                By continuing, you agree to our{" "}
                <Text className="underline">Terms</Text>
                {" & "}
                <Text className="underline">Privacy</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
