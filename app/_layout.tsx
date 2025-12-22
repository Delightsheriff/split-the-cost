import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "./global.css";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(public)" />
        {/* <Stack.Screen name="(protected)" /> */}
      </Stack>
      <StatusBar barStyle="default" />
    </>
  );
}
