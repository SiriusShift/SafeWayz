import React, { useCallback, useState } from "react";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import StyledText from "../StyledText";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

const BottomDrawer = ({
  bottomSheetRef,
  routesCoordinates,
  chosenRouteIndex,
  setChosenRouteIndex,
  startNavigation,
  setStartNavigation,
  theme,
  searchLocation,
  handleClose,
  snapPoints,
}) => {
  console.log(routesCoordinates);
  const renderItem = useCallback(
    (item, index) => {
      const isSelected = chosenRouteIndex === index;
      const hours = Math.floor(item.duration / 3600);
      const minutes = Math.floor((item.duration % 3600) / 60);

      return (
        <TouchableOpacity
          onPress={() => setChosenRouteIndex(index)}
          key={index}
          style={[
            styles.itemContainer,
            {
              borderLeftColor: isSelected
                ? theme.colors.primary
                : theme.dark
                ? "#ffffff"
                : "#000000",
            },
          ]}
        >
          <View className="flex-row justify-between">
            <StyledText className="text-2xl font-bold">
              {hours ? `${hours} hr ` : ""} {minutes} min
            </StyledText>
            <StyledText className="text-xl font-semibold">
              {(item.distance / 1000).toFixed(2)} km
            </StyledText>
          </View>
        </TouchableOpacity>
      );
    },
    [chosenRouteIndex, theme]
  );

  return (
    <>
      <BottomSheet
        onClose={() => handleClose}
        ref={bottomSheetRef}
        index={-1}
        backgroundStyle={{
          backgroundColor: theme.dark ? "#333" : "#fff",
        }}
        handleIndicatorStyle={{
          backgroundColor: theme.dark ? "#fff" : "#000",
        }}
        snapPoints={snapPoints}
      >
        <BottomSheetView className="px-5">
          <StyledText className="text-2xl font-bold">
            {searchLocation?.details.header}
          </StyledText>
          <StyledText>{searchLocation?.details.address}</StyledText>
          <View className="flex-row mt-3">
            {!startNavigation && (
              <Button
                mode="contained"
                onPress={() => setStartNavigation()}
                className="bg-red-400"
              >
                Start
              </Button>
            )}
          </View>
          <BottomSheetScrollView style={{ marginVertical: 10 }}>
            {routesCoordinates.map(renderItem)}
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  modalContent: {
    alignItems: "center",
  },
  itemContainer: {
    borderLeftWidth: 4,
    height: 50,
    marginVertical: 5,
    paddingHorizontal: 20,
  },
});
export default BottomDrawer;
