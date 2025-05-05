import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Button, Modal, Portal } from "react-native-paper";
import { FAB, useTheme } from "react-native-paper";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import nightMode from "@/utils/nightMap.json";
import { useSnackbar } from "@/hooks/useSnackbar";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useGetReportsQuery } from "@/features/reports/api/reportsApi";
import MapMarkers from "@/components/map/MapMarkers";
import SearchBar from "@/components/map/SearchBar";
import useRouteNavigation from "@/hooks/useRouteNavigation";
import BottomDrawer from "@/components/map/BottomSheet";
import StyledText from "@/components/StyledText";
import useTrackLocation from "@/hooks/useTrackLocation";
import * as turf from "@turf/turf";

const Index = () => {
  const theme = useTheme();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const type = SecureStore.getItem("vehicleType");
  const snapPoints = ["35%", "50%", "85%"];
  const mapStyle = theme.dark ? nightMode : [];

  const [vehicleType, setVehicleType] = useState(null);
  const [visible, setVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [routesCoordinates, setRoutesCoordinates] = useState([]);
  const [chosenRouteIndex, setChosenRouteIndex] = useState(null);
  const [startNavigation, setStartNavigation] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [trackedRoute, setTrackedRoute] = useState([]);
  const [remainingRoute, setRemainingRoute] = useState([]);

  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);

  const { data, isLoading, refetch } = useGetReportsQuery();

  console.log(routesCoordinates);

  const { fetchRoutes } = useRouteNavigation({
    mapRef,
    searchLocation,
    chosenRouteIndex,
    setChosenRouteIndex,
    routesCoordinates,
    trackedRoute,
    setTrackedRoute,
    setRoutesCoordinates,
    setRemainingRoute,
    showSnackbar,
    location,
    vehicleType,
    refetch,
  });

  const { startLocationUpdates, stopLocationUpdates } = useTrackLocation({
    setLocation,
    showSnackbar: (msg) => console.log("Snackbar:", msg),
    mapRef,
    mapReady,
  });

  const handleClose = () => {
    bottomSheetRef.current?.close();
  };

  const centerMap = () => {
    if (location && mapRef.current && mapReady) {
      mapRef.current.animateToRegion(
        {
          ...location,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
    } else {
      startLocationUpdates();
    }
  };

  useEffect(() => {
    startLocationUpdates();

    return () => {
      stopLocationUpdates();
    };
  }, []);

  useEffect(() => {
    const fetchVehicleType = async () => {
      const storedVehicleType = await SecureStore.getItemAsync("vehicleType");
      if (storedVehicleType) {
        setVehicleType(JSON.parse(storedVehicleType)); // Parse if it's stored as JSON
      }
    };
    fetchVehicleType();
  }, [type]);

  const startNavigationHandler = () => {
    if (!routesCoordinates[chosenRouteIndex] || !data) return;

    const selectedRoute = routesCoordinates[chosenRouteIndex];
    console.log(selectedRoute);

    // Convert route coordinates to a LineString
    const routeLine = turf.lineString(
      selectedRoute.coordinates.map((point) => [
        point.longitude,
        point.latitude,
      ])
    );

    // Optional: create a buffer zone around the route (e.g., 50 meters)
    const bufferedRoute = turf.buffer(routeLine, 0.05, { units: "kilometers" });

    // Extract accident points from API response (adjust as needed)
    const accidentPoints = data?.data?.map((report) =>
      turf.point([report.longitude, report.latitude])
    );

    // Check if any accidents fall within the buffered route
    const accidentsOnRoute = accidentPoints.filter((point) =>
      turf.booleanPointInPolygon(point, bufferedRoute)
    );

    if (accidentsOnRoute.length > 0) {
      console.warn("⚠️ Accident detected on route");
      setVisible(true);
      return;
    }

    // Continue with navigation
    setChosenRoute();
  };

  const setChosenRoute = () => {
    setStartNavigation(true);
    setRoutesCoordinates([routesCoordinates[chosenRouteIndex]]);
    setVisible(false);
    return;
  };

  const snapToRoad = async () => {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API;
    const url = `https://roads.googleapis.com/v1/nearestRoads?points=${location.lat},${location.lng}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.snappedPoints) {
      router.push("/(auth)/(reports)");
    } else {
      console.log("Not on a road");
      setVisible(true);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.dark ? "#333" : "#fff" },
        ]}
      >
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          showsTraffic={!startNavigation && true}
          showsCompass={false}
          customMapStyle={mapStyle}
          onMapReady={() => setMapReady(true)}
          initialRegion={{
            latitude: 15.16, // Angeles City latitude
            longitude: 120.586, // Angeles City longitude
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
        >
          <MapMarkers
            location={location}
            mapReady={mapReady}
            vehicleType={vehicleType}
            routesCoordinates={routesCoordinates}
            searchLocation={searchLocation}
            trackedRoute={trackedRoute}
            startNavigation={startNavigation}
            data={data}
            remainingRoute={remainingRoute}
            chosenRouteIndex={chosenRouteIndex}
            setChosenRouteIndex={setChosenRouteIndex}
          />
        </MapView>

        <SearchBar
          mapRef={mapRef}
          bottomSheetRef={bottomSheetRef}
          setSearchLocation={setSearchLocation}
          handleClose={handleClose}
          setRoutesCoordinates={setRoutesCoordinates}
          setStartNavigation={setStartNavigation}
          searchLocation={searchLocation}
          mapReady={mapReady}
          theme={theme}
        />

        <FAB
          style={[styles.add, { backgroundColor: "red" }]}
          icon="alert"
          color="white"
          onPress={() => router.push("/(auth)/(reports)")}
        />

        <FAB
          style={[styles.center, { backgroundColor: theme.colors.background }]}
          icon="crosshairs-gps"
          onPress={centerMap}
        />

        <BottomDrawer
          bottomSheetRef={bottomSheetRef}
          routesCoordinates={routesCoordinates}
          chosenRouteIndex={chosenRouteIndex}
          setChosenRouteIndex={setChosenRouteIndex}
          theme={theme}
          setStartNavigation={startNavigationHandler}
          startNavigation={startNavigation}
          searchLocation={searchLocation}
          handleClose={handleClose}
          snapPoints={snapPoints}
        />

        <Portal>
          <Modal
            visible={visible}
            onDismiss={() => setVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <StyledText className="text-2xl font-bold mb-4">
                No Road Found
              </StyledText>
              <StyledText className="text-base mb-4">
                We couldn't detect a nearby road. Please check your location or
                try again.
              </StyledText>
              <Button mode="contained" onPress={() => setVisible(false)}>
                <Text>Close</Text>
              </Button>
            </View>
          </Modal>
        </Portal>
        <Portal>
          <Modal
            visible={visible}
            onDismiss={() => setVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text className="text-2xl font-bold mb-4">Accident Detected</Text>
              <Text className="text-base mb-4">
                We detected an accident on your route. Do you want to continue?
              </Text>
              <View className="flex flex-row gap-5">
                <Button mode="outlined" onPress={() => setVisible(false)}>
                  <Text>Close</Text>
                </Button>
                <Button mode="contained" onPress={() => setChosenRoute()}>
                  <Text>Continue</Text>
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>
      </View>
    </TouchableWithoutFeedback>
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
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  add: {
    position: "absolute",
    bottom: 85,
    right: 20,
  },

  center: {
    position: "absolute",
    bottom: 85,
    left: 20,
  },
});

export default Index;
