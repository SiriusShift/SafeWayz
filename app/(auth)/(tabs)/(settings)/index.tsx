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
  console.log("user: ",user);
  const theme = useTheme();
  const router = useRouter();

  return (
    <>
      <View
        style={{ flex: 1, backgroundColor: theme.colors.background, gap: 10 }}
        className="flex flex-col pt-0 pb-10"
      >
        <View style={{ padding: 20, paddingBottom: 0 }}>
          <View
            style={[
              {
                backgroundColor: theme?.dark ? "#222" : "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,
                elevation: 3,
                borderRadius: 10,
              },
            ]}
            className="flex flex-row p-4 rounded-lg w-full gap-5"
          >
            <Image source={defaultImage} className="w-14 h-14 rounded-full" />
            <View className="flex-col justify-center">
              <StyledText className="text-xl text-center font-bold">
                {user?.name}
              </StyledText>
              <Text className="text-gray-500 text-xs">{user?.email}</Text>
            </View>
          </View>
        </View>
        <List.Section>
          <List.Subheader style={{ paddingHorizontal: 20, paddingVertical: 5 }}>
            Settings
          </List.Subheader>
          <List.Item
            title="Vehicle Type"
            style={{ paddingHorizontal: 20, paddingVertical: 10 }}
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
