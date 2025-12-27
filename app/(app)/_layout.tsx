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
    </Stack>
  );
}
