import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, Slot, Redirect, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function AuthGate() {
  const { isLoggedIn } = useAuth();
  const segments = useSegments();

  const inAuthGroup = segments[0] === "(auth)";

  if (!isLoggedIn && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isLoggedIn && inAuthGroup) {
    //return <Redirect href="/(tabs)/meals" />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthGate />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
