import { View, Text, Image, TouchableWithoutFeedback, Keyboard } from "react-native";
import React from "react";
import StyledView from "./StyledView";
import Logo from "@/assets/images/location.png";
import StyledText from "./StyledText";


const AuthLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <StyledView className="flex-1 justify-center items-center w-full gap-y-5">
        {children}
      </StyledView>
    </TouchableWithoutFeedback>
  );
};

export default AuthLayout;
