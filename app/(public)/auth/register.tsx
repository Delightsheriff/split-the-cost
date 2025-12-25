import { useRouter } from "expo-router";
import { ArrowLeft, Lock, Mail, User } from "lucide-react-native";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Register = () => {
  const router = useRouter();

  function handleGOBack() {
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1 bg-background-dark"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 p-6">
            {/* Top bar */}
            <View className="flex-row items-center justify-between mt-4">
              <Pressable onPress={handleGOBack} className="px-2 py-1">
                <View className="w-10 h-10 rounded-full items-center justify-center">
                  <ArrowLeft size={24} color="#f6f8f6" />
                </View>
              </Pressable>
            </View>

            {/* Content */}
            <View className="px-2 mt-4 flex-1">
              {/* Text Heading */}
              <View className="mt-2">
                <Text className="text-white tracking-tight text-[32px] font-extrabold leading-tight text-left mb-3 font-manropeBold">
                  Let&apos;s split it right.
                </Text>
                <Text className="text-gray-300 text-base font-normal leading-relaxed font-manrope">
                  Create an account to start tracking shared expenses
                  effortlessly.
                </Text>
              </View>

              {/* FORM */}
              <View className="mt-10 flex-1">
                {/* Full Name */}
                <View className="mb-4">
                  <Text className="text-white text-lg font-semibold font-manropeBold leading-normal pb-2 ml-1">
                    Full Name
                  </Text>
                  <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4">
                    <TextInput
                      className="flex-1 text-white h-14 text-base font-manrope"
                      placeholder="Enter your Full Name"
                      placeholderTextColor="#9db9a6"
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                    <User size={20} color="#9db9a6" />
                  </View>
                </View>

                {/* Email */}
                <View className="mb-4">
                  <Text className="text-white text-lg font-semibold font-manropeBold leading-normal pb-2 ml-1">
                    Email
                  </Text>
                  <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4">
                    <TextInput
                      className="flex-1 text-white h-14 text-base font-manrope"
                      placeholder="Enter your email"
                      placeholderTextColor="#9db9a6"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="next"
                    />
                    <Mail size={20} color="#9db9a6" />
                  </View>
                </View>

                {/* Password */}
                <View className="mb-6">
                  <Text className="text-white text-lg font-semibold font-manropeBold leading-normal pb-2 ml-1">
                    Password
                  </Text>
                  <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4">
                    <TextInput
                      className="flex-1 text-white h-14 text-base font-manrope"
                      placeholder="Enter your password"
                      placeholderTextColor="#9db9a6"
                      secureTextEntry
                      autoComplete="password-new"
                      returnKeyType="done"
                    />
                    <Lock size={20} color="#9db9a6" />
                  </View>
                </View>
              </View>

              {/* Submit Button - Pushed to bottom */}
              <View className="w-full pb-4">
                <Pressable className="bg-primary py-5 rounded-2xl items-center flex-row justify-center gap-2 shadow-lg shadow-primary/30">
                  <Text className="text-background-dark font-manropeBold text-lg font-bold">
                    Create Account
                  </Text>
                </Pressable>

                <Pressable className="items-center mt-4">
                  <Text className="text-background-light font-manrope text-base">
                    Already have an account?{" "}
                    <Text className="text-primary font-manropeBold font-bold">
                      Log In
                    </Text>
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;
