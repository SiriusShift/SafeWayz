import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import defaultImage from "@/assets/images/default.png";
import { useAuth } from "@/context/authContext";
import { Appbar, Button, Divider, List, useTheme } from "react-native-paper";
import StyledText from "@/components/StyledText";
import { useRouter } from "expo-router";
import { usePostLogoutMutation } from "@/features/authentication/api/authApi";

const Index = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const [logoutTrigger, { isLoading }] = usePostLogoutMutation();
  const handleLogout = async () => {
    try {
      await logoutTrigger().unwrap();
      logout();
    } catch (error) {
      if (error?.data?.message === "Token has expired") {
        logout();
      }
    }
  };
  return (
    <>
      <Appbar.Header className="flex justify-between">
        <Appbar.BackAction onPress={() => router.replace("/(auth)/(tabs)")} />
        {/* <Appbar.Action icon="logout" onPress={() => handleLogout()} /> */}
      </Appbar.Header>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <View className="flex flex-col pt-0 py-10">
          <View className="flex items-center w-full mb-5 gap-5">
            <Image source={defaultImage} className="w-20 h-20 rounded-full" />
            <View className="flex-col items-center">
              <StyledText className="text-xl text-center font-bold">
                {user?.name}
              </StyledText>
              <Text className="text-gray-500 text-center font">
                {user?.role}
              </Text>
              <Button
                mode="contained"
                compact
                icon={"pencil"}
                className="mt-5 w-36"
              >
                Edit Profile
              </Button>
            </View>
          </View>
          <List.Section>
            <List.Subheader style={{ paddingHorizontal: 20 }}>
              Settings
            </List.Subheader>
            <List.Item
              title="Vehicle Type"
              style={{ paddingHorizontal: 20 }}
              onPress={() => router.push("/(auth)/(tabs)/(settings)/vehicle")}
              left={() => (
                <List.Icon
                  icon="car"
                  color="#808080"
                  style={{
                    padding: 10,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 10,
                  }}
                />
              )}
            />
          </List.Section>
        </View>
      </SafeAreaView>
    </>
  );
};

export default Index;
