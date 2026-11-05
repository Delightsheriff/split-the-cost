import { useTheme } from "@/src/theme/theme";
import { Stack } from "expo-router";

export default function AppStackLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: "Manrope-Bold" },
        headerBackVisible: true,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="group/create"
        options={{
          title: "New Group",
          headerShown: true, // Turn it on for this specific screen
          // presentation: "card",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="group/[id]"
        options={{
          title: "Group Details", // Default title
          headerShown: true,
          presentation: "card", // Standard slide-in from right
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="expense/create"
        options={{
          title: "Add Expense",
          headerShown: true,
          presentation: "modal", // Modal presentation
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="expense/[id]"
        options={{
          title: "Expense Details",
          headerShown: true,
          presentation: "card",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="expense/SettlementCreate"
        options={{
          title: "Settle Up",
          headerShown: true,
          presentation: "card",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
