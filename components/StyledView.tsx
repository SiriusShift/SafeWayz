import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

const StyledView = ({ children, style, ...props }) => {
  const theme = useTheme();

  return (
    <View
      style={[
        { backgroundColor: theme.colors.background }, // Theme-based background
        style, // Custom styles
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

export default StyledView;
