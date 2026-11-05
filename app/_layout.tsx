import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";
import { ThemeRoot } from "@/src/theme/theme";
import { RiveScenesProvider } from "@/src/ui/RiveScenes";
import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./global.css";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 0,
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Manrope-Regular": Manrope_400Regular,
    "Manrope-SemiBold": Manrope_600SemiBold,
    "Manrope-Bold": Manrope_700Bold,
    "Manrope-ExtraBold": Manrope_800ExtraBold,
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeRoot>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RiveScenesProvider>
              <RootNavigator />
            </RiveScenesProvider>
            <StatusBar barStyle="default" />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeRoot>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { token, isLoading } = useAuth();

  // Wait for auth to initialize
  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>

      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
