import { Stack } from "expo-router";
import { TransitionPresets } from "@react-navigation/stack";

export default function ReportsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        cardStyle: { backgroundColor: "transparent" }, // removes the white flash
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="form" />
    </Stack>
  );
}
