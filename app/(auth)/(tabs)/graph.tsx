import StyledText from "@/components/StyledText";
import { View, Text } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const Graph = () => {
  const theme = useTheme();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background, gap: 10 }}
      className="flex flex-col pt-0 pb-10"
    >
      <StyledText>Test</StyledText>
    </SafeAreaView>
  );
};

export default Graph;
