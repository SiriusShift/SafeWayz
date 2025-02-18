import { Stack } from "expo-router";
import "./global.css";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { lightTheme, darkTheme } from "@/assets/theme/theme";
import { Provider } from "react-redux";
import store from "./store";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Show splash screen until fonts are loaded
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync(); // Hide splash screen once fonts are loaded
    } else {
      SplashScreen.preventAutoHideAsync(); // Prevent auto hide until fonts are loaded
    }
  }, [loaded]);

  const appTheme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <Provider store={store}>
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <ThemeProvider
          value={colorScheme === "dark" ? NavigationDarkTheme : NavigationDefaultTheme}
        >
          {/* Stack from expo-router */}
          <Stack
            screenOptions={{
              headerShown: false, // Hide header by default
            }}
          >
            {/* Define screens as you normally would */}
            <Stack.Screen name="sign-in" options={{ title: "Welcome" }} />
            <Stack.Screen name="sign-up" options={{ title: "Sign Up Now" }} />
          </Stack>
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
    </Provider>
  );
}
