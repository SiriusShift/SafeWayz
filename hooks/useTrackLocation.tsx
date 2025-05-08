import { useRef } from "react";
import * as Location from "expo-location";
import { Alert, Linking } from "react-native";
import { useDispatch } from "react-redux";
import { setUserLocation } from "@/features/authentication/reducers/loginSlice";

const useTrackLocation = ({ setLocation, showSnackbar, mapRef, mapReady, setSpeed, startNavigation }) => {
  const locationSubscription = useRef(null);
  const dispatch = useDispatch();

  const showSettingsAlert = () => {
    Alert.alert(
      "Location Permission Required",
      "Please enable location permissions in settings to use this feature.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => showSnackbar?.("Location Disabled", 3000, "danger"),
        },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
  };

  const checkLocationSettings = async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) showSettingsAlert();
    else console.log("Location services are enabled");
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
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (newLocation) => {
          console.log(newLocation);
          setSpeed(newLocation.coords.speed);
          const userLocation = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };

          setLocation(userLocation);
          dispatch(setUserLocation(userLocation));

          if (mapReady && mapRef?.current && startNavigation) {
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

  const stopLocationUpdates = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  return {
    startLocationUpdates,
    stopLocationUpdates,
  };
};

export default useTrackLocation;
