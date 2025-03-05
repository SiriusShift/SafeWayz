import {
  View,
  StyleSheet,
  Alert,
  Linking,
  Image,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { FAB, useTheme } from "react-native-paper";
import MapView, { Callout, Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import nightMode from "@/utils/nightMap.json";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Ionicons } from "@expo/vector-icons";
import { useSnackbar } from "@/hooks/useSnackbar";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import StyledText from "@/components/StyledText";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

// Helper function to calculate distance between two points
const calculateDistance = (point1, point2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of the earth in km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) *
      Math.cos(toRad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Convert to meters
};

// Function to find the closest point on the route
const findClosestPointOnRoute = (userLocation, routeCoordinates) => {
  let minDistance = Infinity;
  let closestIndex = 0;

  routeCoordinates.forEach((point, index) => {
    const distance = calculateDistance(userLocation, point);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return { closestIndex, minDistance };
};

const images = {
  car: require("@/assets/images/car.png"),
  motor: require("@/assets/images/motorbike.png"),
};

const Index = () => {
  const theme = useTheme();
  const router = useRouter()
  const type = SecureStore.getItem("vehicleType");
  const [vehicleType, setVehicleType] = useState(null);
  const { showSnackbar } = useSnackbar();
  const snapPoints = ["35%", "50%", "100%"];
  const [location, setLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [routesCoordinates, setRoutesCoordinates] = useState([]);
  const [chosenRouteIndex, setChosenRouteIndex] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  
  // New state for route tracking
  const [trackedRoute, setTrackedRoute] = useState([]);
  const [remainingRoute, setRemainingRoute] = useState([]);

  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const locationSubscription = useRef(null);
  const bottomSheetRef = useRef(null);
  const googleApi = process.env.EXPO_PUBLIC_GOOGLE_API ?? "";
  
  // Define mapStyle outside of render and keep it consistent
  const mapStyle = theme.dark ? nightMode : [];

  useEffect(() => {
    startLocationUpdates();
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
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
    if (searchLocation) {
      fetchRoutes();
    }
  }, [searchLocation]);

  // Update route tracking when route or location changes
  useEffect(() => {
    if (chosenRouteIndex !== null && 
        routesCoordinates.length > 0 && 
        location && 
        routesCoordinates[chosenRouteIndex]?.coordinates) {
      
      const currentRoute = routesCoordinates[chosenRouteIndex];
      
      // Find the closest point on the route
      const { closestIndex } = findClosestPointOnRoute(location, currentRoute.coordinates);
      
      // Split the route into tracked and remaining segments
      const newTrackedRoute = currentRoute.coordinates.slice(0, closestIndex + 1);
      const newRemainingRoute = currentRoute.coordinates.slice(closestIndex + 1);
      
      setTrackedRoute(newTrackedRoute);
      setRemainingRoute(newRemainingRoute);
    }
  }, [location, chosenRouteIndex, routesCoordinates]);

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

          if (mapReady && mapRef.current) {
            mapRef.current.animateToRegion(
              {
                ...userLocation,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              },
              1000
            );
          }
        }
      );
    } catch (error) {
      console.error("Error starting location updates:", error);
    }
  };

  const zoomOutToFitRoute = () => {
    if (mapRef.current && location && searchLocation) {
      mapRef.current.fitToCoordinates(
        [location, searchLocation.location],
        {
          edgePadding: { top: 50, right: 50, bottom: 200, left: 50 },
          animated: true,
        }
      );
    }
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
      const departureTime = new Date(Date.now() + 60 * 1000).toISOString();

      const apiUrl =
        "https://routes.googleapis.com/directions/v2:computeRoutes";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": googleApi,
          "X-Goog-FieldMask":
            "routes.duration,routes.distanceMeters,routes.polyline,routes.legs,routes.routeLabels,routes.travelAdvisory,routes.travelAdvisory.tollInfo,routes.routeToken",
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: location.latitude,
                longitude: location.longitude,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: searchLocation.location.latitude,
                longitude: searchLocation.location.longitude,
              },
            },
          },
          travelMode: vehicleType?.mode || "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
          computeAlternativeRoutes: true,
          departureTime,
          units: "METRIC",
        }),
      });

      const data = await response.json();

      if (data.routes) {
        const routesWithDetails = data.routes.map((route, index) => {
          const coordinates = decodePolyline(route.polyline.encodedPolyline);
          const duration =
            parseInt(route.duration.replace("s", ""), 10) ?? Infinity;
          const distance = route.distanceMeters ?? Infinity;
          const midIndex = Math.floor(coordinates.length / 2);
          const midPoint = coordinates[midIndex];

          return { coordinates, duration, midPoint, index, distance };
        });

        const shortestRouteIndex = routesWithDetails.reduce(
          (prev, curr) => (prev.duration < curr.duration ? prev : curr),
          routesWithDetails[0]
        ).index;

        setChosenRouteIndex(shortestRouteIndex);
        setRoutesCoordinates(routesWithDetails);
        zoomOutToFitRoute();
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

  const handleClose = () => {
    bottomSheetRef.current?.close();
  };
  
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

  // Container background style to match map theme
  const containerBackgroundStyle = {
    backgroundColor: theme.dark ? "#333" : "#fff"
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={[styles.container, containerBackgroundStyle]}>
      <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          showsTraffic={true}
          showsCompass={false}
          customMapStyle={mapStyle}
          onMapReady={() => setMapReady(true)}
          // Apply initial map style immediately
          initialRegion={{
            latitude: location?.latitude || 14.5995,
            longitude: location?.longitude || 120.9842,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {mapReady && location && (
            <Marker coordinate={location} title="Your Location">
              <Image
                source={images[vehicleType?.activeImg || "car"]}
                style={{ width: 30, height: 30, resizeMode: "contain" }}
              />
            </Marker>
          )}
          {mapReady && searchLocation && <Marker coordinate={searchLocation.location} />}
          {mapReady && routesCoordinates.map((route, index) => {
            const zIndex = isChosen
            ? routesCoordinates.length + 1
            : routesCoordinates.length - index;
          const isChosen = index === chosenRouteIndex;
            
            return (
              <React.Fragment key={index}>
                {/* Tracked portion of the route */}
                <Polyline
                  coordinates={trackedRoute}
                  strokeColor="green"
                  strokeWidth={6}
                  zIndex={zIndex + 1}
                  strokeLinecap="round"
                  lineJoin="round"
                />
                
                {/* Remaining portion of the route */}
                <Polyline
                  coordinates={remainingRoute}
                  strokeColor="gray"
                  strokeWidth={4}
                  zIndex={zIndex}
                  strokeLinecap="round"
                  lineJoin="round"
                />
                
                {/* Original route selection logic */}
                <Polyline
                  coordinates={route.coordinates}
                  tappable={true}
                  onPress={(e) => {
                    e.stopPropagation && e.stopPropagation();
                    setChosenRouteIndex(index);
                    if (route.onSelect) {
                      route.onSelect(index);
                    }
                  }}
                  strokeColor={isChosen ? "red" : "blue"}
                  strokeWidth={isChosen ? 6 : 4}
                  zIndex={zIndex}
                  strokeLinecap="round"
                  lineJoin="round"
                />
              </React.Fragment>
            );
          })}
        </MapView>

        <GooglePlacesAutocomplete
          placeholder="Search"
          textInputProps={{
            placeholderTextColor: theme.dark ? "#fff" : "#000",
          }}
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

            setSearchLocation({
              location: newLocation,
              details: {
                header: details.name,
                type: details.types[0],
                rating: details.rating,
                totalRating: details.user_ratings_total,
                address: data.structured_formatting.secondary_text,
                openingHours: details.current_opening_hours,
              },
            });

            setTimeout(() => {
              searchRef.current?.setAddressText(data.description);
            }, 0);

            if (mapReady && mapRef.current) {
              mapRef.current.animateToRegion({
                ...newLocation,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              });
            }

            bottomSheetRef.current?.snapToIndex(1);
            Keyboard.dismiss();
          }}
          renderRightButton={() => {
            return searchLocation ? (
              <Ionicons
                onPress={() => {
                  setSearchLocation(null);
                  searchRef.current?.clear();
                  setRoutesCoordinates([]);
                  handleClose();
                }}
                name="close"
                size={24}
                color={theme.dark ? "white" : "black"}
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
              source={require("../../../assets/images/adaptive-icon.png")}
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
              backgroundColor: theme.dark ? "#333" : "#fff",
              borderRadius: 8,
              paddingHorizontal: 10,
              elevation: 5,
            },
            textInput: {
              height: 50,
              flex: 1,
              backgroundColor: "transparent",
              color: theme.dark ? "#fff" : "#000",
              fontSize: 18,
            },
            listView: {
              backgroundColor: theme.dark ? "#333" : "#fff",
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
              backgroundColor: theme.dark ? "#333" : "#fff",
            },
            separator: {
              height: 1,
              backgroundColor: theme.dark ? "#555" : "#ddd",
            },
            description: {
              fontSize: 15,
              color: theme.dark ? "#fff" : "#000",
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
          onPress={() => router.push("/(auth)/(tabs)/(reports)")}
        />

        <BottomSheet
          onClose={() => handleClose}
          enablePanDownToClose
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
            <BottomSheetScrollView style={{ marginVertical: 10 }}>
              {routesCoordinates.map(renderItem)}
            </BottomSheetScrollView>
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
  itemContainer: {
    borderLeftWidth: 4,
    height: 50,
    marginVertical: 5,
    paddingHorizontal: 20,
  },
});

export default Index;