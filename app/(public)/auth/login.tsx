import { LoginForm, loginSchema } from "@/src/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Mail, Wallet } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      console.log(data);
      // TODO: Add your API call here
      // await loginUser(data);
      router.replace("/(app)/(tabs)");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  function handleGoBack() {
    router.back();
  }

  function handleForgotPassword() {
    // TODO: Navigate to forgot password
  }

  function handleSignUp() {
    router.push("/(public)/auth/register");
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
              <Pressable
                onPress={handleGoBack}
                className="px-2 py-1"
                disabled={isSubmitting}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center">
                  <ArrowLeft size={24} color="#f6f8f6" />
                </View>
              </Pressable>
            </View>

            <View className="flex justify-center items-center gap-2 mt-4">
              <View className="w-16 h-16 rounded-xl bg-primary/20 items-center justify-center shadow-lg shadow-primary/20">
                <Wallet size={24} color="#13ec5b" />
              </View>
            </View>

            {/* Content */}
            <View className="px-2 mt-4">
              {/* Text Heading */}
              <View className="mt-2">
                <Text className="text-white tracking-tight text-[32px] font-extrabold leading-tight text-center mb-3 font-manropeBold">
                  Welcome back.
                </Text>
                <Text className="text-gray-300 text-base text-center font-normal leading-relaxed font-manrope">
                  Log in to continue managing your shared expenses.
                </Text>
              </View>

              {/* FORM */}
              <View className="mt-10">
                {/* Email */}
                <View className="mb-4">
                  <Text className="text-white text-lg font-semibold font-manropeBold leading-normal pb-2 ml-1">
                    Email
                  </Text>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4">
                        <TextInput
                          className="flex-1 text-white h-14 text-base font-manrope"
                          placeholder="Enter your email"
                          placeholderTextColor="#9db9a6"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          returnKeyType="next"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          editable={!isSubmitting}
                        />
                        <Mail size={20} color="#9db9a6" />
                      </View>
                    )}
                  />
                  {errors.email && (
                    <Text className="text-red-500 text-sm mt-1 ml-1">
                      {errors.email.message}
                    </Text>
                  )}
                </View>

                {/* Password */}
                <View className="mb-2">
                  <Text className="text-white text-lg font-semibold font-manropeBold leading-normal pb-2 ml-1">
                    Password
                  </Text>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4">
                        <TextInput
                          className="flex-1 text-white h-14 text-base font-manrope"
                          placeholder="Enter your password"
                          placeholderTextColor="#9db9a6"
                          secureTextEntry={!showPassword}
                          autoComplete="password"
                          returnKeyType="done"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          editable={!isSubmitting}
                        />
                        <Pressable
                          onPress={() => setShowPassword(!showPassword)}
                          hitSlop={8}
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeOff size={20} color="#9db9a6" />
                          ) : (
                            <Eye size={20} color="#9db9a6" />
                          )}
                        </Pressable>
                      </View>
                    )}
                  />
                  {errors.password && (
                    <Text className="text-red-500 text-sm mt-1 ml-1">
                      {errors.password.message}
                    </Text>
                  )}
                </View>

                {/* Forgot Password */}
                <Pressable
                  onPress={handleForgotPassword}
                  className="items-end px-1 py-2"
                  disabled={isSubmitting}
                >
                  <Text className="text-primary font-manropeBold text-sm">
                    Forgot Password?
                  </Text>
                </Pressable>

                {/* Submit Button */}
                <View className="w-full mt-6">
                  <Pressable
                    onPress={handleSubmit(onSubmit)}
                    className={`py-5 rounded-2xl items-center flex-row justify-center gap-2 shadow-lg shadow-primary/30 ${
                      isSubmitting ? "bg-primary/50" : "bg-primary"
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#0d1a0f" />
                    ) : (
                      <Text className="text-background-dark font-manropeBold text-lg font-bold">
                        Log In
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={handleSignUp}
                    className="items-center mt-4"
                    disabled={isSubmitting}
                  >
                    <Text className="text-background-light font-manrope text-base">
                      Don&apos;t have an account?{" "}
                      <Text className="text-primary font-manropeBold font-bold">
                        Sign Up
                      </Text>
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
