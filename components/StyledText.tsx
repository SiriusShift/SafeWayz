import React from "react";
import { Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

const StyledText = ({ children, style, ...props }) => {
  const theme = useTheme();
  
  return (
    <Text
      style={[
        { color: theme.colors.onSurface }, // Theme-based text color
        style, // Custom styles
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

// Default styles
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 12,
    color: "gray",
  },
});

export default StyledText;