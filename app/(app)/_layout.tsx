import { Stack } from "expo-router";

export default function AppStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0d1a0f" },
        headerTintColor: "white",
        headerTitleStyle: { fontFamily: "Manrope-Bold" },
        headerBackVisible: true, // Cleaner iOS look
        headerShadowVisible: false,
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
