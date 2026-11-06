import InputField from "@/src/components/ui/InputField";
import { useRegister } from "@/src/services/auth.service";
import { useTheme } from "@/src/theme/theme";
import { RegisterForm, registerSchema } from "@/src/types/schema";
import { Moodling } from "@/src/ui/Moodling";
import { PressableScale } from "@/src/ui/PressableScale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Register() {
  const router = useRouter();
  const { colors } = useTheme();
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await register.mutateAsync(data);
    } catch (error) {
      Alert.alert("Couldn't create your account", error instanceof Error ? error.message : "Try again in a moment.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
          <Moodling balanceCents={0} size={84} />
          <Text className="text-ink font-manropeHeavy text-4xl tracking-tight mt-6">Let&apos;s split it right</Text>
          <Text className="text-ink-muted font-manrope text-base mt-2">One account, every group you&apos;re in.</Text>

          <View className="mt-8">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Name"
                  placeholder="What your friends call you"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  editable={!register.isPending}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Email"
                  placeholder="you@example.com"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  editable={!register.isPending}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Password"
                  placeholder="At least 6 characters"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  editable={!register.isPending}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  rightIcon={
                    <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={10} accessibilityLabel={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={20} color={colors.inkMuted} /> : <Eye size={20} color={colors.inkMuted} />}
                    </Pressable>
                  }
                />
              )}
            />
          </View>

          <PressableScale haptic onPress={() => handleSubmit(onSubmit)()} disabled={register.isPending} className="bg-lime rounded-full h-14 items-center justify-center mt-4">
            {register.isPending ? <ActivityIndicator color="#0E0E10" /> : <Text className="text-onfill font-manropeBold text-base">Create account</Text>}
          </PressableScale>

          <PressableScale static onPress={() => router.push("/(public)/auth/login")} disabled={register.isPending} className="items-center py-4 mt-2">
            <Text className="text-ink-muted font-manrope text-[15px]">
              Already in? <Text className="text-ink font-manropeBold">Log in</Text>
            </Text>
          </PressableScale>

          <PressableScale static onPress={() => router.push("/privacy")} className="items-center py-2">
            <Text className="text-ink-faint font-manrope text-xs">
              How we look after your data: <Text className="font-manropeBold">privacy policy</Text>
            </Text>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
