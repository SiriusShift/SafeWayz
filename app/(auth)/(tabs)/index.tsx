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
import MapView, { PROVIDER_GOOGLE, Heatmap } from "react-native-maps";
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
import { useSocket } from "@/context/socketContext";
import ReportInfo from "@/components/map/ReportInfo";
import moment from "moment";
import AccidentIndicator from "@/components/map/AccidentIndicator";
import { set } from "react-hook-form";

const Index = () => {
  const theme = useTheme();
  const router = useRouter();
  const type = SecureStore.getItem("vehicleType");
  const { showSnackbar } = useSnackbar();
  const { allReports } = useSocket();

  console.log("all reports", allReports);
  const snapPoints = ["18%", "45%", "85%"];
  const mapStyle = theme.dark ? nightMode : [];

  const [vehicleType, setVehicleType] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [roadModalVisible, setRoadModalVisible] = useState(false);
  const [accidentModalVisible, setAccidentModalVisible] = useState(false);
  const [pastAccidentModalVisible, setPastAccidentModalVisible] =
    useState(false);
  const [location, setLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [routesCoordinates, setRoutesCoordinates] = useState([]);
  const [chosenRouteIndex, setChosenRouteIndex] = useState(null);
  const [startNavigation, setStartNavigation] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [trackedRoute, setTrackedRoute] = useState([]);
  const [accidentCount, setAccidentCount] = useState(false);
  const [remainingRoute, setRemainingRoute] = useState([]);

  console.log(searchLocation);

  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const searchRef = useRef(null);

  const checkForAccidentsOnRoute = () => {
    if (!routesCoordinates?.length || !allReports) return 0;
    if (chosenRouteIndex == null && !startNavigation) return 0;

    let selectedRoute;
    if (startNavigation) {
      selectedRoute = remainingRoute;
    } else {
      selectedRoute = routesCoordinates[chosenRouteIndex];
    }

    const routeLine = turf.lineString(
      selectedRoute.coordinates?.map(({ longitude, latitude }) => [
        longitude,
        latitude,
      ])
    );
    const buffered = turf.buffer(routeLine, 0.05, { units: "kilometers" });

    const latestCount = allReports?.latestReports.filter((r) =>
      turf.booleanPointInPolygon(
        turf.point([r.longitude, r.latitude]),
        buffered
      )
    ).length;

    const pastCount = allReports?.pastReports.filter((r) =>
      turf.booleanPointInPolygon(
        turf.point([r.longitude, r.latitude]),
        buffered
      )
    ).length;

    if (latestCount > 0 && startNavigation) {
      setAccidentModalVisible(true);
    }

    return {
      latest: latestCount,
      past: pastCount,
    };
  };

  const startNavigationHandler = () => {
    const hasAccident = checkForAccidentsOnRoute();
    if (hasAccident?.latest > 0) {
      setAccidentModalVisible(true);
      setAccidentCount(hasAccident?.latest + hasAccident?.past);
      return;
    } else if (hasAccident?.past > 0) {
      setPastAccidentModalVisible(true);
      setAccidentCount(hasAccident?.latest + hasAccident?.past);
      return;
    }
    proceedWithNavigation();
  };

  const proceedWithNavigation = () => {
    setStartNavigation(true);
    // setRoutesCoordinates([routesCoordinates[chosenRouteIndex]]);
    setAccidentModalVisible(false);
    setPastAccidentModalVisible(false);
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
      setRoadModalVisible(true);
    }
  };

  const handleClose = () => {
    bottomSheetRef.current?.close();
    searchRef.current?.clear();
    setSearchLocation(null);
    setRoutesCoordinates([]);
    setStartNavigation(false);
    setAccidentCount(0);
  };
  const handleModalClose = () => {
    setRoadModalVisible(false);
    setAccidentModalVisible(false);
    setPastAccidentModalVisible(false);
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

  const zoomOutToFitRoute = () => {
    if (mapRef.current && location && searchLocation) {
      mapRef.current.fitToCoordinates([location, searchLocation.location], {
        edgePadding: { top: 50, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  };

  const { fetchRoutes } = useRouteNavigation({
    mapRef,
    searchLocation,
    chosenRouteIndex,
    setChosenRouteIndex,
    routesCoordinates,
    trackedRoute,
    setTrackedRoute,
    setRoutesCoordinates,
    startNavigation,
    setRemainingRoute,
    showSnackbar,
    location,
    vehicleType,
    zoomOutToFitRoute,
    checkForAccidentsOnRoute,
    setAccidentCount,
  });

  const { startLocationUpdates, stopLocationUpdates } = useTrackLocation({
    setLocation,
    showSnackbar: (msg) => console.log("Snackbar:", msg),
    mapRef,
    mapReady,
    setSpeed,
    startNavigation,
  });

  const reRouteNavigation = () => {
    fetchRoutes();
    setStartNavigation(false);
    setRoadModalVisible(false);
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

  useEffect(() => {
    if (allReports && startNavigation) {
      startNavigationHandler();
    }
  }, [allReports]);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.dark ? "#333" : "#fff",
            position: "relative",
          },
        ]}
      >
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles?.map}
          showsTraffic={!startNavigation && true}
          showsCompass={false}
          customMapStyle={mapStyle}
          // zoomControlEnabled
          loadingEnabled
          toolbarEnabled={false}
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
            setIsInfoOpen={setIsInfoOpen}
            trackedRoute={trackedRoute}
            // startNavigation={startNavigation}
            data={allReports?.latestReports}
            remainingRoute={remainingRoute}
            chosenRouteIndex={chosenRouteIndex}
            setChosenRouteIndex={setChosenRouteIndex}
            // startLocation={startLocation}
          />
          {allReports?.pastReports.length > 0 && (
            <Heatmap
              points={allReports?.pastReports}
              radius={10}
              opacity={0.8}
              gradient={{
                colors: [
                  "rgba(0, 0, 255, 0)", // transparent blue
                  "blue",
                  "cyan",
                  "lime",
                  "yellow",
                  "red",
                ],
                startPoints: [0, 0.1, 0.3, 0.5, 0.7, 1],
                colorMapSize: 256,
              }}
            />
          )}
        </MapView>

        <SearchBar
          mapRef={mapRef}
          bottomSheetRef={bottomSheetRef}
          searchRef={searchRef}
          setSearchLocation={setSearchLocation}
          handleClose={handleClose}
          searchLocation={searchLocation}
          location={location}
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

        {(accidentCount > 0 && startNavigation) && <AccidentIndicator count={accidentCount} />}

        <ReportInfo isInfoOpen={isInfoOpen} setIsInfoOpen={setIsInfoOpen} />

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
          zoomOutToFitRoute={zoomOutToFitRoute}
        />

        <Portal>
          <Modal
            visible={roadModalVisible}
            onDismiss={() => setRoadModalVisible(false)}
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
              <Button
                mode="contained"
                onPress={() => setRoadModalVisible(false)}
              >
                <Text>Close</Text>
              </Button>
            </View>
          </Modal>
        </Portal>
        <Portal>
          <Modal
            visible={accidentModalVisible}
            onDismiss={() => setAccidentModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text className="text-2xl font-bold mb-4">Accident Detected</Text>
              <Text className="text-base mb-4">
                We detected an accident on your route. Do you want to{" "}
                {startNavigation ? "re-route" : "continue"}?
              </Text>
              <View className="flex flex-row gap-5">
                <Button mode="outlined" onPress={() => handleModalClose()}>
                  <Text>Close</Text>
                </Button>
                <Button
                  mode="contained"
                  onPress={() =>
                    startNavigation
                      ? reRouteNavigation()
                      : proceedWithNavigation()
                  }
                >
                  <Text>{startNavigation ? "Re-route" : "Continue"}</Text>
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>
        <Portal>
          <Modal
            visible={pastAccidentModalVisible}
            onDismiss={() => setPastAccidentModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text className="text-2xl font-bold mb-4">
                Accident Prone Area
              </Text>
              <Text className="text-base mb-4">
                System detected multiple accidents in the past. Do you want to{" "}
                {startNavigation ? "re-route" : "continue"}?
              </Text>
              <View className="flex flex-row gap-5">
                <Button mode="outlined" onPress={() => handleModalClose()}>
                  <Text>Close</Text>
                </Button>
                <Button
                  mode="contained"
                  onPress={() =>
                    startNavigation
                      ? reRouteNavigation()
                      : proceedWithNavigation()
                  }
                >
                  <Text>{startNavigation ? "Re-route" : "Continue"}</Text>
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
    bottom: 30,
    right: 20,
  },

  center: {
    position: "absolute",
    bottom: 30,
    left: 20,
  },
});

export default Index;
