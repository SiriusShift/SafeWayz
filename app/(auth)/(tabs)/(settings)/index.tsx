import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import defaultImage from "@/assets/images/default.png";
import { useAuth } from "@/context/authContext";
import { Appbar, Button, Divider, List, useTheme } from "react-native-paper";
import StyledText from "@/components/StyledText";
import { useRouter } from "expo-router";
import { usePostLogoutMutation } from "@/features/authentication/api/authApi";
import { Ionicons } from "@expo/vector-icons";

const Index = () => {
  const { user } = useAuth();
  console.log("user: ", user);
  const theme = useTheme();
  const router = useRouter();

  return (
    <>
      <View
        style={{ flex: 1, backgroundColor: theme.colors.background, gap: 10 }}
        className="flex flex-col pt-0 pb-10"
      >
        <View style={{ paddingHorizontal: 20, paddingBottom: 0 }}>
          <View className="flex flex-col items-center p-4 rounded-lg w-full">
            <Image
              source={
                user?.profileImg ? { uri: user.profileImg } : defaultImage
              }
              className="w-20 h-20 rounded-full"
            />
            <View className="flex-col items-center mt-3 mb-5">
              <StyledText className="text-2xl font-bold">
                {user?.name}
              </StyledText>
              <Text className="font-medium text-sm text-gray-400">
                {user?.email}
              </Text>
            </View>
            <Button
              onPress={() => router.push("/(auth)/(tabs)/(settings)/profile")}
              mode="contained"
              labelStyle={{ fontSize: 12 }}
            >
              <Text className="text-white">Edit Profile</Text>
            </Button>
          </View>
        </View>
        <List.Section>
          <List.Subheader style={{ paddingHorizontal: 20 }}>
            Driving Preferences
          </List.Subheader>
          <List.Item
            title="Vehicle Type"
            style={{ paddingHorizontal: 20 }}
            onPress={() => router.push("/(auth)/(tabs)/(settings)/vehicle")}
            left={() => (
              <List.Icon
                icon="car"
                color="#fff"
                style={{
                  padding: 10,
                  backgroundColor: "red",
                  borderRadius: 10,
                }}
              />
            )}
          />
        </List.Section>
      </View>
    </>
  );
};

export default Index;
