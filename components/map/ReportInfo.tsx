import React from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { Chip, Portal } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import moment from "moment";

const ReportInfo = ({ isInfoOpen, setIsInfoOpen }) => {
  const activeReport = useSelector((state: any) => state.active.activeReport);

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
      <View
        className="absolute top-0 w-full bg-white rounded-b-2xl p-4 py-10 shadow-lg"
        style={{ zIndex: 9999 }}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-2xl font-bold capitalize">
            {activeReport.type}
          </Text>
          <TouchableOpacity onPress={() => setIsInfoOpen(false)}>
            <AntDesign name="close" size={20} color="gray" />
          </TouchableOpacity>
        </View>

        <Text className="text-gray-600">
          {activeReport.street}, {activeReport.barangay}, {activeReport.city}
        </Text>

        <Text className="text-xs text-gray-400 mt-2">
          {minutesAgo} • Reported by {activeReport.user?.name || "Unknown"}
        </Text>
        <View className="flex mt-5 flex-row gap-2">
          <Chip mode="outlined" onPress={() => console.log("Pressed")}>
            {activeReport.status}
          </Chip>
          <Chip mode="outlined" onPress={() => console.log("Pressed")}>
            {activeReport?.severity}
          </Chip>
          <Chip mode="outlined" onPress={() => console.log("Pressed")}>
            {activeReport?.casualty}
          </Chip>
        </View>
      </View>
    </Portal>
  );
};

export default ReportInfo;
