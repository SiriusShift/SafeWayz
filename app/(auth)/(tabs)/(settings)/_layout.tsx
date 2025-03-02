import { View, Text } from "react-native";
import React from "react";
import { Appbar } from "react-native-paper";
import { useRouter } from "expo-router";

const SettingsLayout = () => {
  const router = useRouter();
  return (
    <Appbar.Header className="flex justify-between">
      <Appbar.BackAction onPress={() => router.replace("/(auth)/(tabs)")} />
      {/* <Appbar.Action icon="logout" onPress={() => handleLogout()} /> */}
    </Appbar.Header>
  );
};

export default SettingsLayout;
