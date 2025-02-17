import { MD3LightTheme as DefaultTheme } from "react-native-paper";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#c22727",   // Primary color (affects input focus, buttons, etc.)
    background: "#FFFFFF", // Background color
    text: "#000000",       // Text color
    placeholder: "#888888", // Placeholder color
    outline: "#c22727",    // Border color for outlined inputs
  },
};

export default theme;