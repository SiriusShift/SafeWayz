import { View, Text, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import defaultImage from "@/assets/images/default.png";
import { useAuth } from "@/context/authContext";
import { Appbar, Button, Divider, useTheme } from "react-native-paper";
import StyledText from "@/components/StyledText";
import { useRouter } from "expo-router";
import { usePostLogoutMutation } from "@/features/authentication/api/authApi";

const settings = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
    const router = useRouter();
  

  const [logoutTrigger, {isLoading}] = usePostLogoutMutation();
  const handleLogout = async () => {
    try {
      await logoutTrigger().unwrap();
      logout();
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <>
      <Appbar.Header className="flex justify-between">
        <Appbar.BackAction onPress={() => router.replace("/(auth)/(tabs)")} />
        <Appbar.Action icon="logout" onPress={() => handleLogout()} />
      </Appbar.Header>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <View className="flex flex-col pt-0  p-10">
          <View className="flex items-center w-full mb-5 gap-5">
            <Image source={defaultImage} className="w-20 h-20 rounded-full" />
            <View className="flex-col items-center">
              <StyledText className="text-xl text-center font-bold">
                {user?.name}
              </StyledText>
              <Text className="text-gray-500 text-center font">
                {user?.role}
              </Text>
              <Button mode="contained" compact icon={"pencil"} className="mt-5 w-36">
                  Edit Profile
              </Button>
            </View>
            <View>
              <Text></Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default settings;
