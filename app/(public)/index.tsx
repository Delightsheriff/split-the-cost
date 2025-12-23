import { useRouter } from "expo-router";
import { Wallet } from "lucide-react-native";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

const Welcome = () => {
  const router = useRouter();

  function handleSkip() {
    router.push("/(public)/auth/login");
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-background-dark p-5">
        {/* Top bar */}
        <View className="flex-row items-center justify-between mt-4">
          {/* Brand */}
          <View className="flex-row items-center gap-2">
            <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center shadow-lg shadow-primary/20">
              <Wallet size={24} color="#102216" />
            </View>

            <View className="flex-row items-center">
              <Text className="text-xl font-extrabold tracking-tight text-white font-manropeBold">
                Split
              </Text>
              <Text className="text-xl font-extrabold tracking-tight text-primary font-manropeBold ">
                It
              </Text>
            </View>
          </View>

          {/* Skip */}
          <Pressable onPress={handleSkip} className="px-2 py-1">
            <Text className="text-sm text-background-light font-manrope">
              Skip
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-between px-4 mt-10">
          {/* Image */}
          {/* <View className="w-full flex items-center"> */}
          <View className="w-full flex items-center h-1/2">
            <Image
              source={require("../../assets/bg1.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>

          {/* Text */}
          <View className="items-center mt-6 space-y-3">
            <Text className="text-3xl font-manropeBold text-white text-center">
              Split bills,
            </Text>
            <Text className="text-3xl font-manropeBold text-primary text-center">
              not friendships
            </Text>

            <Text className="text-sm text-background-light text-center max-w-xs leading-5 mt-2">
              Track shared expenses and settle up instantly with roommates,
              trips, and friends.
            </Text>
          </View>

          {/* Actions */}
          <View className="w-full mt-10 space-y-4">
            <Pressable className="bg-primary py-4 rounded-2xl items-center">
              <Text className="text-background-dark font-manropeBold text-base">
                Get Started
              </Text>
            </Pressable>

            <Pressable className="items-center">
              <Text className="text-sm text-background-light font-manrope">
                I have an account
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
