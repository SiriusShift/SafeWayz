import { Stack } from "expo-router";
import "./global.css";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { lightTheme, darkTheme } from "@/assets/theme/theme";
import { Provider } from "react-redux";
import store from "./store";
import AuthProvider, { useAuth } from "@/context/authContext";
import { StatusBar } from "expo-status-bar";
import { SnackbarProvider } from "@/hooks/useSnackbar";
import "react-native-get-random-values";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalProvider } from "@gorhom/portal";
<<<<<<< Updated upstream
// import {AutocompleteDropdownContextProvider} from 'react-native-autocomplete-dropdown';
=======
>>>>>>> Stashed changes

SplashScreen.preventAutoHideAsync(); // Prevent splash screen from hiding automatically

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    async function prepareApp() {
      try {
        if (fontsLoaded) {
          setAppReady(true); // Mark app as ready once fonts are loaded
        }
      } catch (error) {
        console.error("Error preparing app:", error);
      }
    }

    prepareApp();
  }, [fontsLoaded]);

  if (!appReady) {
    return null; // ✅ Keeps splash screen visible until fonts load
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AuthProviderWrapper />
      </SafeAreaProvider>
    </Provider>
  );
}

// 🔹 Ensures Auth Context is ready before rendering UI
function AuthProviderWrapper() {
  return (
    <AuthProvider>
      <AuthGuard />
    </AuthProvider>
  );
}

// 🔹 Handles authentication loading and splash screen hiding
function AuthGuard() {
  const { loading } = useAuth();
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function hideSplash() {
      if (!loading) {
        await SplashScreen.hideAsync(); // ✅ Hide splash only when authentication is ready
      }
    }
    hideSplash();
  }, [loading]);

  if (loading) {
    return null; // ✅ Prevents UI from rendering until authentication is done
  }

  return (
    <PaperProvider theme={colorScheme === "dark" ? darkTheme : lightTheme}>
      <SnackbarProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar
            networkActivityIndicatorVisible={true}
            style={colorScheme === "dark" ? "dark" : "light"}
          />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(public)/sign-in" />
            <Stack.Screen name="(public)/forgot-password" />
            <Stack.Screen name="(public)/sign-up" />
            <Stack.Screen name="(auth)/(tabs)" />
            <Stack.Screen name="(reports)" />
            {/* <Stack.Screen name="(reports)/forms" /> */}
          </Stack>
        </GestureHandlerRootView>
      </SnackbarProvider>
    </PaperProvider>
  );
}
