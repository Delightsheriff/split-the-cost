import InputField from "@/src/components/ui/InputField";
import { useLogin } from "@/src/services/auth.service";
import { LoginForm, loginSchema } from "@/src/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Mail, Wallet } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  const router = useRouter();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await loginMutation.mutateAsync(data);
      router.replace("/(app)/(tabs)");
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Unable to log in.",
      );
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 bg-background-dark"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 p-6 justify-center">
            <View className="flex justify-center items-center gap-2 mt-4">
              <View className="w-16 h-16 rounded-xl bg-primary/20 items-center justify-center shadow-lg shadow-primary/20">
                <Wallet size={24} color="#13ec5b" />
              </View>
            </View>

            <View className="px-2 mt-4">
              <Text className="text-white tracking-tight text-[32px] font-extrabold text-center mb-3 font-manropeBold">
                Welcome back.
              </Text>
              <Text className="text-gray-300 text-base text-center font-manrope">
                Log in to continue managing your shared expenses.
              </Text>

              <View className="mt-10">
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField
                      label="Email"
                      placeholder="Enter your email"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.email?.message}
                      editable={!isSubmitting}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      rightIcon={<Mail size={20} color="#9db9a6" />}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField
                      label="Password"
                      placeholder="Enter your password"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.password?.message}
                      editable={!isSubmitting}
                      secureTextEntry={!showPassword}
                      rightIcon={
                        <Pressable
                          onPress={() => setShowPassword(!showPassword)}
                          hitSlop={8}
                        >
                          {showPassword ? (
                            <EyeOff size={20} color="#9db9a6" />
                          ) : (
                            <Eye size={20} color="#9db9a6" />
                          )}
                        </Pressable>
                      }
                    />
                  )}
                />

                <Pressable onPress={() => {}} className="items-end px-1 py-2">
                  <Text className="text-primary font-manropeBold text-sm">
                    Forgot Password?
                  </Text>
                </Pressable>

                <View className="w-full mt-6">
                  <Pressable
                    onPress={handleSubmit(onSubmit)}
                    className={`py-5 rounded-2xl items-center flex-row justify-center gap-2 ${isSubmitting ? "bg-primary/50" : "bg-primary"}`}
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
                    onPress={() => router.push("/(public)/auth/register")}
                    className="items-center mt-4"
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
