import { View, Image, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import StyledView from "@/components/StyledView";
import StyledText from "@/components/StyledText";
import { useTheme } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

const images = {
  car: require("@/assets/images/private.png"),
  carInactive: require("@/assets/images/private-inactive.png"),
  motor: require("@/assets/images/motor.png"),
  motorInactive: require("@/assets/images/motor-inactive.png"),
};

const vehicleType = [
  {
    id: 1,
    name: "Vehicle",
    activeImg: "car",
    notActive: "carInactive",
    mode: "DRIVE",
    description: "For cars with no special restrictions",
  },
  {
    id: 2,
    name: "Motorcycle",
    activeImg: "motor",
    notActive: "motorInactive",
    mode: "TWO_WHEELER",
    description: "Get great routes for motorcycles",
  },
];

const Vehicle = () => {
  const theme = useTheme();
  const router = useRouter();
  const [activeVehicle, setActiveVehicle] = useState(vehicleType[0]);

  useEffect(() => {
    const fetchActiveVehicle = async () => {
      const storedVehicle = await SecureStore.getItemAsync("vehicleType");
      if (storedVehicle) {
        setActiveVehicle(JSON.parse(storedVehicle));
      }
    };
    fetchActiveVehicle();
  }, []);

  const setVehicle = async (item) => {
    await SecureStore.setItemAsync("vehicleType", JSON.stringify(item));
    setActiveVehicle(item);
    router.replace("/(auth)/(tabs)/(settings)");
  };

  return (
    <StyledView className="flex-1 gap-5 p-10">
      {vehicleType.map((item) => (
        <View
          key={item.id}
          onTouchEnd={() => setVehicle(item)}
          style={[
            styles.card,
            {
              backgroundColor: theme.dark ? "#222" : "#fff",
              borderWidth: activeVehicle?.name === item.name ? 2 : 0,
              borderColor: theme.colors.onSurface,
            },
          ]}
          className="rounded-xl flex-row h-24"
        >
          <View
            style={{ backgroundColor: theme.dark ? "#444" : "#999" }}
            className="w-24 justify-center items-center rounded-l-lg"
          >
            <Image
              source={
                activeVehicle?.name === item?.name
                  ? images[item?.activeImg]
                  : images[item?.notActive]
              }
              style={{ width: 48, height: 48 }}
            />
          </View>
          <View className="flex-1 justify-center p-4">
            <StyledText className="text-lg font-bold">{item.name}</StyledText>
            <StyledText>{item.description}</StyledText>
          </View>
        </View>
      ))}
    </StyledView>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Vehicle;
