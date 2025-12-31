import { useAuth } from "@/src/contexts/AuthContext";
import { Stack } from "expo-router";
import "../global.css";

export default function PublicLayout() {
  const { token, hasFinishedOnboarding } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. Only show onboarding if not finished AND not logged in */}
      <Stack.Protected guard={!hasFinishedOnboarding && !token}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      {/* 2. Only show auth screens if finished onboarding AND not logged in */}
      <Stack.Protected guard={hasFinishedOnboarding && !token}>
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
      </Stack.Protected>
    </Stack>
  );
}
