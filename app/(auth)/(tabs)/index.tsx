import { View, StyleSheet, Alert, Linking } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useTheme, FAB, Text } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
  const theme = useTheme();
  const [location, setLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const mapRef = useRef(null); // Ref for MapView

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    console.log("test")
    let { status } = await Location.getForegroundPermissionsAsync();
    setPermissionStatus(status);

    if (status !== "granted") {
      let { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(newStatus);

      if (newStatus !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location permissions in settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    const userLocation = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };

    setLocation(userLocation);
    return userLocation;
  };

  // Function to move camera to user's location
  const centerMap = async () => {
    const userLocation = await requestLocationPermission();
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 14.5995,
          longitude: location?.longitude || 120.9842,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {location && <Marker coordinate={location} title="Your Location" />}
      </MapView>

      {/* Show permission status */}
      {/* <View style={styles.permissionContainer}>
        <Text style={{ color: "white" }}>
          Location Permission: {permissionStatus || "Checking..."}
        </Text>
      </View> */}

      {/* Floating Action Button (FAB) to Center the Map */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.background }]}
        icon="crosshairs-gps"
        onPress={centerMap}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  fab: {
    position: "absolute",
    bottom: 85,
    right: 20,
  },
  permissionContainer: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "black",
    padding: 10,
    borderRadius: 5,
  },
});

export default Index;
