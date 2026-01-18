import InputField from "@/src/components/ui/InputField";
import { useRegister } from "@/src/services/auth.service";
import { RegisterForm, registerSchema } from "@/src/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Mail, User } from "lucide-react-native";
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

const Register = () => {
  const router = useRouter();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await registerMutation.mutateAsync(data);
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error instanceof Error ? error.message : "Unable to create account.",
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
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 p-6 justify-center">
            <View className="px-2 mt-4">
              <View className="mt-2">
                <Text className="text-white tracking-tight text-[32px] font-extrabold text-left mb-3 font-manropeBold">
                  Let&apos;s split it right.
                </Text>
                <Text className="text-gray-300 text-base font-manrope">
                  Create an account to start tracking shared expenses
                  effortlessly.
                </Text>
              </View>

              <View className="mt-10">
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField
                      label="Full Name"
                      placeholder="Enter your Full Name"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.name?.message}
                      editable={!isSubmitting}
                      autoCapitalize="words"
                      rightIcon={<User size={20} color="#9db9a6" />}
                    />
                  )}
                />

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
                      autoComplete="password-new"
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

                <View className="w-full mt-6">
                  <Pressable
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className={`py-5 rounded-2xl items-center flex-row justify-center gap-2 shadow-lg shadow-primary/30 ${isSubmitting ? "bg-primary/50" : "bg-primary"}`}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#0d1a0f" />
                    ) : (
                      <Text className="text-background-dark font-manropeBold text-lg font-bold">
                        Create Account
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="items-center mt-4"
                    onPress={() => router.push("/(public)/auth/login")}
                    disabled={isSubmitting}
                  >
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;
