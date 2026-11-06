import { useTheme } from "@/src/theme/theme";
import { Stack } from "expo-router";

// A deep link straight to an invite still gets the tabs underneath it.
export const unstable_settings = { anchor: "(tabs)" };

/** Creation flows open as sheets over the screen they came from, with their own header. */
const sheet = (detents: number[]) =>
  ({
    presentation: "formSheet",
    headerShown: false,
    sheetAllowedDetents: detents,
    sheetGrabberVisible: true,
    sheetCornerRadius: 32,
  }) as const;

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
      <Stack.Screen name="group/create" options={sheet([0.75, 1])} />
      <Stack.Screen
        name="group/[id]"
        options={{
          title: "", // The screen sets the group's name once it loads.
          headerShown: true,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen name="expense/create" options={sheet([1])} />
      <Stack.Screen name="expense/[id]" options={{ title: "Expense", headerShown: true, headerBackTitle: "Back" }} />
      <Stack.Screen name="settle" options={sheet([1])} />
      <Stack.Screen name="help" options={{ title: "Help & support", headerShown: true, headerBackTitle: "Back" }} />
      <Stack.Screen name="about" options={{ title: "About", headerShown: true, headerBackTitle: "Back" }} />
      <Stack.Screen name="join/[code]" options={sheet([0.6])} />
    </Stack>
  );
}
