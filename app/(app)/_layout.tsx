import { useTheme } from "@/src/theme/theme";
import { Stack } from "expo-router";

// A deep link straight to an invite still gets the tabs underneath it.
export const unstable_settings = { anchor: "(tabs)" };

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
          title: "New group",
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
          title: "New expense",
          headerShown: true,
          presentation: "modal", // Modal presentation
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="expense/[id]"
        options={{
          title: "Expense",
          headerShown: true,
          presentation: "card",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="expense/SettlementCreate"
        options={{
          title: "Settle up",
          headerShown: true,
          presentation: "card",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen name="join/[code]" options={{ title: "Invite", headerShown: true, presentation: "modal" }} />
    </Stack>
  );
}
