import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#c22727",
    background: "#FFFFFF",
    secondary: "#8E8E8E",
    warning: "#FFA000",
    chart1: "#ff988f",
    chart2: "#ff8179",
    chart3: "#fa6863",
    chart4: "#f14d4c",
    chart5: "#e62b34",
    chart6: "#db0017",
    chart7: "#d00000",
    chart8: "#c30000",
    chart9: "#b60000",
    chart10: "#a80000",

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
    secondary: "#9E9E9E", // grey secondary
    warning: "#FFA000",
    chart1: "#f3625d",
    chart2: "#de3b3d",
    chart3: "#c90019",
    chart4: "#b60000",
    chart5: "#aa0000",
    chart6: "#a10000",
    chart7: "#9b0000",
    chart8: "#950000",
    chart9: "#8e0000",
    chart10: "#860000",
    // onSurface: "#FFFFFF", // Text color for dark mode
    onPrimary: "#FFFFFF",
  },
};

export { lightTheme, darkTheme };
