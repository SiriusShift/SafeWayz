import { Link, useNavigation } from "expo-router";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import Logo from "@/assets/images/landing-icon1.png";
import { Button, useTheme } from "react-native-paper";
import { useState } from "react";

export default function Index() {
  // const colorScheme = useColorScheme();
  const theme = useTheme();
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View>
        <Image source={Logo} className="h-72 w-72" />
      </View>
      <Text
        className={`font-bold text-3xl`}
        style={{ color: theme.colors.onSurface }}
      >
        Welcome to SafeWayz
      </Text>
      <Text
        className={`text-lg mb-10`}
        style={{ color: theme.colors.onSurface }}
      >
        Safely Navigating Angeles City
      </Text>

      <View className="px-10 w-full">
        <Link href="/sign-in" asChild>
          <Button mode="contained">Let's Start</Button>
        </Link>

        {/* <TouchableOpacity className="bg-blue-500  py-4 mt-5 w-full rounded-full">
          <Link href="/sign-up" asChild>
          <Text className="text-white font-semibold text-center">
          Sign Up</Text>
          </Link>
        </TouchableOpacity> */}
      </View>

      {/* <Link href="/profile">Profile</Link> */}
      {/* <Link href="/properties/1">Property</Link> */}
    </View>
  );
}
