import {
  View,
  StyleSheet,
  Alert,
  Linking,
  Image,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { FAB, useTheme } from "react-native-paper";
import MapView, { Callout, Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import nightMode from "@/utils/nightMap.json";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Ionicons } from "@expo/vector-icons";
import { useSnackbar } from "@/hooks/useSnackbar";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const RouteCallout = ({ duration, isSelected }) => {
  const theme = useTheme();
  const minutes = Math.round(duration / 60);

  return (
    <View style={styles.calloutContainer}>
      <View
        style={[
          styles.routeCallout,
          {
            backgroundColor: isSelected
              ? "#ff4444"
              : theme.dark
              ? "#333"
              : "#fff",
          },
        ]}
      >
        <Text
          style={[
            styles.routeCalloutText,
            { color: isSelected ? "#fff" : theme.dark ? "#fff" : "#000" },
          ]}
        >
          {minutes} min
        </Text>
      </View>
    </View>
  );
};

const Index = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const snapPoints = ["25%", "50%", "100%"];
  const [location, setLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [routesCoordinates, setRoutesCoordinates] = useState([]);
  const [chosenRouteIndex, setChosenRouteIndex] = useState(null);

  console.log(searchLocation);

  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const locationSubscription = useRef(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const googleApi = process.env.EXPO_PUBLIC_GOOGLE_API ?? "";

  console.log("api: ", googleApi);

  useEffect(() => {
    startLocationUpdates();
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (searchLocation) {
      fetchRoutes();
    }
  }, [searchLocation]);

  console.log(routesCoordinates);

  const showSettingsAlert = () => {
    Alert.alert(
      "Location Permission Required",
      "Please enable location permissions in settings to use this feature.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => showSnackbar("Location Disabled", 3000, "danger"),
        },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
  };

  const startLocationUpdates = async () => {
    try {
      await checkLocationSettings();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showSettingsAlert();
        return;
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (newLocation) => {
          const userLocation = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };

          setLocation(userLocation);

          mapRef.current?.animateToRegion(
            {
              ...userLocation,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            1000
          );
        }
      );
    } catch (error) {
      console.error("Error starting location updates:", error);
    }
  };

  const centerMap = () => {
    if (location && mapRef.current) {
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

  const checkLocationSettings = async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      showSettingsAlert();
    } else {
      showSnackbar("Location Enabled", 3000, "success");
    }
  };

  const fetchRoutes = async () => {
    if (!location || !searchLocation) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&departure_time=now&destination=${searchLocation.location.latitude},${searchLocation.location.longitude}&alternatives=true&traffic_model=best_guess&key=${googleApi}`
      );
      const data = await response.json();
      console.log(data);
      if (data.routes) {
        const routesWithDetails = data.routes.map((route, index) => {
          const coordinates = decodePolyline(route.overview_polyline.points);
          const duration = route.legs[0]?.duration ?? Infinity;
          const distance = route.legs[0]?.distance ?? Infinity;
          // Calculate middle point for callout
          const midIndex = Math.floor(coordinates.length / 2);
          const midPoint = coordinates[midIndex];

          return { coordinates, duration, midPoint, index, distance };
        });

        const shortestRouteIndex = routesWithDetails.reduce((prev, curr) =>
          prev.duration < curr.duration ? prev : curr
        ).index;

        setChosenRouteIndex(shortestRouteIndex);
        setRoutesCoordinates(routesWithDetails);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsTraffic={true}
          customMapStyle={theme.dark ? nightMode : []}
          initialRegion={{
            latitude: location?.latitude || 14.5995,
            longitude: location?.longitude || 120.9842,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {location && (
            <Marker coordinate={location} title="Your Location">
              <Image
                source={require("../../../assets/images/car.png")}
                style={{ width: 30, height: 30, resizeMode: "contain" }}
              />
            </Marker>
          )}
          {searchLocation && <Marker coordinate={searchLocation.location} />}
          {routesCoordinates.map((route, index) => (
            <React.Fragment key={index}>
              <Polyline
                coordinates={route.coordinates}
                tappable={true}
                onPress={() => setChosenRouteIndex(index)}
                strokeColor={index === chosenRouteIndex ? "red" : "gray"}
                strokeWidth={index === chosenRouteIndex ? 6 : 4}
                zIndex={index === chosenRouteIndex ? 2 : 1}
              />
              <Marker coordinate={route.midPoint} anchor={{ x: 0.5, y: 0 }}>
                <RouteCallout
                  duration={route.duration}
                  isSelected={index === chosenRouteIndex}
                />
              </Marker>
            </React.Fragment>
          ))}
        </MapView>

        <GooglePlacesAutocomplete
          placeholder="Search"
          ref={searchRef}
          currentLocation={true}
          currentLocationLabel="Current Location"
          fetchDetails={true}
          placeholderTextColor="#fff"
          onPress={async (data, details = null) => {
            if (!details) return;

            const newLocation = {
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
            };
            console.log(data, details);

            setSearchLocation({
              location: newLocation,
              details: {
                header: details.name,
                type: details.types[0],
                rating: details.rating,
                totalRating: details.user_ratings_total,
                address: details.formatted_address,
                openingHours: details.current_opening_hours,
              },
            });
            searchRef.current?.setAddressText(data.description);

            mapRef.current?.animateToRegion({
              ...newLocation,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            });
            console.log(searchLocation);
            bottomSheetRef.current?.snapToIndex(1);
            Keyboard.dismiss();
          }}
          renderRightButton={() => {
            return searchLocation ? (
              <Ionicons
                onPress={() => {
                  setSearchLocation(null);
                  searchRef.current?.clear(); // Use optional chaining to avoid errors
                  console.log("clear");
                  setRoutesCoordinates([]);
                }}
                name="close"
                size={24}
                color="black"
              />
            ) : null;
          }}
          enablePoweredByContainer={false}
          query={{
            key: googleApi,
            language: "en",
          }}
          renderLeftButton={() => (
            <Image
              style={{ width: 30, height: 30 }}
              source={require("../../../assets/images/icon.png")}
            />
          )}
          styles={{
            container: {
              position: "absolute",
              top: 40,
              width: "90%",
              alignSelf: "center",
              zIndex: 1,
            },
            textInputContainer: {
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.dark ? "#808080" : "#fff",
              borderRadius: 8,
              paddingHorizontal: 10,
              elevation: 5, // Add slight elevation for better shadow effect
            },
            textInput: {
              height: 50,
              flex: 1,
              backgroundColor: "transparent",
              color: theme.dark ? "#fff" : "#000",
              fontSize: 18,
            },
            listView: {
              backgroundColor: "#fff",
              borderRadius: 8,
              marginTop: 5,
              elevation: 5,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
            },
            row: {
              padding: 15,
              height: 50,
              flexDirection: "row",
              alignItems: "center",
            },
          }}
        />

        <FAB
          style={[styles.center, { backgroundColor: theme.colors.background }]}
          icon="crosshairs-gps"
          onPress={centerMap}
        />
        <FAB
          style={[styles.add, { backgroundColor: "red" }]}
          icon="alert"
          color="white"
          onPress={centerMap}
        />

        
        <BottomSheet enablePanDownToClose ref={bottomSheetRef} snapPoints={snapPoints}>
          <BottomSheetView className="px-5">
              <Text className="text-2xl font-bold">
                {searchLocation?.details.header}
              </Text>
          </BottomSheetView>
        </BottomSheet>
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
  center: {
    position: "absolute",
    bottom: 85,
    left: 20,
  },
  add: {
    position: "absolute",
    bottom: 85,
    right: 20,
  },
  routeCallout: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  routeCalloutText: {
    fontSize: 9,
    fontWeight: "bold",
  },
});

export default Index;
