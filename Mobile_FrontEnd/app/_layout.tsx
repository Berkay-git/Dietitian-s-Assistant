import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, Slot, Redirect, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MealsProvider } from "@/context/MealsContext";
import { ItemProvider } from "@/context/ItemContext";

function AuthGate() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();

  const inAuthGroup = segments[0] === "(auth)";

  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  // if (isLoggedIn && inAuthGroup) {
  //   return <Redirect href="/(tabs)/meals" />;
  // }

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <MealsProvider>
        <ItemProvider>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <AuthGate />
            <StatusBar style="auto" />
          </ThemeProvider>
        </ItemProvider>
      </MealsProvider>
    </AuthProvider>
  );
}


MealsProvider