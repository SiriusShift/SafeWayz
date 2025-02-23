import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar } from "react-native-paper";
import { Text } from "react-native";

// Define the type for SnackbarContext
type SnackbarContextType = {
  showSnackbar: (msg: string, time?: number, type?: keyof typeof VARIANT_COLORS) => void;
};

// Create context with an explicit default value
const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

// Define colors for each variant
const VARIANT_COLORS = {
  success: "#388E3C", // Green
  warning: "#FFA000", // Yellow
  danger: "#D32F2F", // Red
  info: "#1976D2", // Blue
};

// Snackbar Provider Component
export const SnackbarProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState(3000);
  const [variant, setVariant] = useState("success"); // Default is success

  // Function to show the snackbar
  const showSnackbar = useCallback((msg, time = 3000, type = "success") => {
    setMessage(msg);
    setDuration(time);
    setVariant(type);
    setVisible(true);
  }, []);

  // Function to hide the snackbar
  const hideSnackbar = () => setVisible(false);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackbar}
        duration={duration}
        style={{
          backgroundColor: VARIANT_COLORS[variant] || "#333", // Default fallback color
        }}
        action={{
          label: "✖", // Close button
          onPress: hideSnackbar,
          textColor: "#FFFFFF",
        }}
      >
        <Text style={{ color: "#FFFFFF" }}>{message}</Text>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

// Custom Hook to use Snackbar
export const useSnackbar = () => {
  return useContext(SnackbarContext);
};
