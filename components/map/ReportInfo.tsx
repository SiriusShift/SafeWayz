import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { Chip, Portal, useTheme } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import moment from "moment";
import StyledView from "../StyledView";
import StyledText from "../StyledText";

const ReportInfo = ({ isInfoOpen, setIsInfoOpen }) => {
  const activeReport = useSelector((state: any) => state.active.activeReport);
  const theme = useTheme();

  console.log(activeReport);

  if (!isInfoOpen || !activeReport) return null;

  const minutesAgo = moment(activeReport.createdAt).fromNow();

  return (
    <Portal>
      {/* Full screen overlay */}
      <Pressable
        onPress={() => setIsInfoOpen(false)}
        className="absolute top-0 left-0 right-0 bottom-0"
        style={{ backgroundColor: "rgba(0,0,0,0.3)", zIndex: 9998 }}
      />

      {/* Actual info card */}
      <StyledView
        className="absolute top-0 w-full bg-white rounded-b-2xl p-4 py-10 shadow-lg"
        style={{ zIndex: 9999 }}
      >
        <View className="flex-row justify-between items-center mb-2">
          <StyledText className="text-2xl font-bold capitalize">
            {activeReport.type}
          </StyledText>
          <TouchableOpacity onPress={() => setIsInfoOpen(false)}>
            <AntDesign name="close" size={20} color="gray" />
          </TouchableOpacity>
        </View>

        <Text style={{ color: theme.colors.secondary }}>
          {activeReport.street}, {activeReport.barangay}, {activeReport.city}
        </Text>

        <Text
          style={{ color: theme.colors.secondary }}
          className="text-xs mt-2"
        >
          {minutesAgo} • Reported by {activeReport.user?.name || "Unknown"}
        </Text>
        <View className="flex mt-5 flex-row gap-2">
          <StyledText>Status: {activeReport.status} |</StyledText>
          {activeReport.severity && (
            <StyledText>Severity: {activeReport?.severity} |</StyledText>
          )}
          {activeReport.casualty && (
            <StyledText>Casualties: {activeReport?.casualty}</StyledText>
          )}
        </View>
      </StyledView>
    </Portal>
  );
};

const styles = StyleSheet.create({
  openBadge: {
    borderRadius: 5,
    borderWidth: 1,
    fontSize: 3,
    height: 30,
    borderColor: "red",
    color: "red",
  },
  reportedBadge: {
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    height: 30,
    borderColor: "orange",
    color: "orange",
  },
  closedBadge: {
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "green",
    height: 30,

    color: "green",
  },
});

export default ReportInfo;
