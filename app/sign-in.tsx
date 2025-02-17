import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React from "react";
import Logo from "@/assets/images/location.png";
import { Button, TextInput } from "react-native-paper";
import { Link } from "expo-router";

const signIn = () => {
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 justify-center items-center w-full gap-y-5 bg-white">
        {/* Logo */}
        <Image source={Logo} style={{ height: 70, width: 70 }} />

        {/* Welcome Text */}
        <Text className="text-3xl font-bold">Welcome back!</Text>

        {/* Input Fields */}
        <View className="w-5/6 gap-y-3">
          <TextInput mode="outlined" label="Email" />
          <TextInput mode="outlined" label="Password" secureTextEntry />
        </View>

        {/* Sign In Button */}
        <Button
          mode="contained"
          className="w-5/6 mt-4"
          onPress={() => console.log("Sign In Pressed")}
        >
          Sign In
        </Button>
        <Text>Don't have an account? <Link className="font-bold" href="/sign-up">Sign Up</Link></Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default signIn;
