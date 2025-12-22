import {
  Manrope_400Regular,
  Manrope_700Bold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import "./global.css";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Manrope-Regular": Manrope_400Regular,
    "Manrope-Bold": Manrope_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
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
