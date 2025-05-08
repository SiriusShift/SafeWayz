import React, { useCallback } from "react";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import StyledText from "../StyledText";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets(); // 👈 Safe area for tab bar
  const hours = Math.floor(
    routesCoordinates[chosenRouteIndex]?.duration / 3600
  );
  const minutes = Math.floor(
    (routesCoordinates[chosenRouteIndex]?.duration % 3600) / 60
  );
  const distance = (
    routesCoordinates[chosenRouteIndex]?.distance / 1000
  ).toFixed(2);

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
    <BottomSheet
      onClose={handleClose}
      ref={bottomSheetRef}
      index={-1}
      backgroundStyle={{
        backgroundColor: theme.dark ? "#333" : "#fff",
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.dark ? "#fff" : "#000",
      }}
      snapPoints={startNavigation ? ["20%"] : snapPoints}
      enablePanDownToClose={false}
    >
      <BottomSheetView
        style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}
      >
        {startNavigation ? (
          <View className="flex-row flex items-center justify-between">
            <TouchableOpacity>
              <Button mode="text" className="border-r">
                <AntDesign
                  name="close"
                  size={24}
                  color={theme.colors.onPrimary}
                />
              </Button>
            </TouchableOpacity>
            <View>
              <StyledText className="text-2xl font-bold">
                {hours ? `${hours} hr ` : ""} {minutes} min
              </StyledText>
              <StyledText>{distance} km</StyledText>
            </View>
            <TouchableOpacity>
              <Button mode="text" className="border-r">
                <MaterialIcons
                  name="alt-route"
                  size={24}
                  color={theme.colors.onPrimary}
                />
              </Button>
            </TouchableOpacity>
          </View>
        ) : (
          <>
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
            <BottomSheetScrollView
              contentContainerStyle={{
                paddingBottom: insets.bottom + 20,
              }}
              style={{ marginVertical: 10 }}
            >
              {routesCoordinates.map(renderItem)}
            </BottomSheetScrollView>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    borderLeftWidth: 4,
    height: 50,
    marginVertical: 5,
    paddingHorizontal: 20,
  },
});

export default BottomDrawer;
