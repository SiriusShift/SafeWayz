import { Stack, useLocalSearchParams, useSegments } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Appbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { usePostLogoutMutation } from "@/features/authentication/api/authApi";
import { useAuth } from "@/context/authContext";

const routeTitles = {
  index: "Settings",
  vehicle: "Vehicle Type",
  profile: "Edit Profile",
  security: "Security",
};

const SettingsLayout = () => {
  const [logoutTrigger, { isLoading }] = usePostLogoutMutation();
  const { logout } = useAuth();

  const router = useRouter();
  const segments = useSegments();
  const theme = useTheme();
  const [title, setTitle] = useState("Settings");

  console.log(segments);
  const handleLogout = async () => {
    try {
      await logoutTrigger().unwrap();
      logout();
    } catch (error) {
      console.log(error);
      if (error?.data?.message === "Token has expired") {
        logout();
      } else {
        logout();
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      router.replace("/(auth)/(tabs)/(settings)");
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const currentRoute = segments?.[segments?.length - 1] || "index";
      setTitle(routeTitles[currentRoute] || "Settings");
    }, [segments])
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header
        style={[
          styles.card,
          { backgroundColor: theme?.dark ? "#000" : "#fff" },
        ]}
        className="flex justify-between"
      >
        {segments[segments?.length - 1] !== "(settings)" && (
          <Appbar.BackAction onPress={() => router.replace("/(auth)/(tabs)")} />
        )}
        <Appbar.Content titleStyle={{ fontSize: 20 }} title={title} />
        {segments[segments?.length - 1] === "(settings)" && (
          <Appbar.Action icon="logout" onPress={() => handleLogout()} />
        )}
      </Appbar.Header>

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Settings" }} />
        <Stack.Screen name="vehicle" options={{ title: "Vehicle Type" }} />
        <Stack.Screen name="profile" options={{ title: "Edit Profile" }} />
        <Stack.Screen name="security" options={{ title: "Change Password" }} />
      </Stack>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
export default SettingsLayout;
