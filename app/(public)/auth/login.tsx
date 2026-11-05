import InputField from "@/src/components/ui/InputField";
import { useLogin } from "@/src/services/auth.service";
import { USE_MOCK_API } from "@/src/services/client";
import { useTheme } from "@/src/theme/theme";
import { LoginForm, loginSchema } from "@/src/types/schema";
import { Moodling } from "@/src/ui/Moodling";
import { PressableScale } from "@/src/ui/PressableScale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    // Sign-in is simulated against the mock API, so start with the demo account filled in.
    defaultValues: USE_MOCK_API ? { email: "you@example.com", password: "password" } : undefined,
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login.mutateAsync(data);
      router.replace("/(app)/(tabs)");
    } catch (error) {
      Alert.alert("Couldn't log in", error instanceof Error ? error.message : "Check your email and password.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
          <Moodling balanceCents={1} size={84} />
          <Text className="text-ink font-manropeHeavy text-4xl tracking-tight mt-6">Welcome back</Text>
          <Text className="text-ink-muted font-manrope text-base mt-2">Your groups missed you. Probably.</Text>

          <View className="mt-8">
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
                  editable={!login.isPending}
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
                  placeholder="Your password"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  editable={!login.isPending}
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
                  rightIcon={
                    <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={10} accessibilityLabel={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={20} color={colors.inkMuted} /> : <Eye size={20} color={colors.inkMuted} />}
                    </Pressable>
                  }
                />
              )}
            />
          </View>

          <PressableScale haptic onPress={() => handleSubmit(onSubmit)()} disabled={login.isPending} className="bg-lime rounded-full h-14 items-center justify-center mt-4">
            {login.isPending ? <ActivityIndicator color="#0E0E10" /> : <Text className="text-onfill font-manropeBold text-base">Log in</Text>}
          </PressableScale>

          <PressableScale static onPress={() => router.push("/(public)/auth/register")} className="items-center py-4 mt-2">
            <Text className="text-ink-muted font-manrope text-[15px]">
              New here? <Text className="text-ink font-manropeBold">Create an account</Text>
            </Text>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
