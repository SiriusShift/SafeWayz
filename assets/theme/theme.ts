import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#c22727",
    background: "#FFFFFF",
    secondary: "#c22727",
    // onSurface: "#000000", // Text color for light mode
    // onPrimary: "#FFFFFF", // Text color for primary-colored buttons
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#FA2E2E",
    background: "#000000",
    secondary: "#c22727",
    // onSurface: "#FFFFFF", // Text color for dark mode
    onPrimary: "#FFFFFF",
  },
};

export { lightTheme, darkTheme };
