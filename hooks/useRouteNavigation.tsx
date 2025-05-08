import { socket } from "@/socket";
import { findClosestPointOnRoute } from "@/utils/map/mapHelpers";
import { decodePolyline } from "@/utils/map/routeDecoder";
import React, { useEffect } from "react";
import { processGoogleRoutes } from "@/utils/map/routeProcessor";
const useRouteNavigation = ({
  mapRef,
  searchLocation,
  chosenRouteIndex,
  setChosenRouteIndex,
  trackedRoute,
  routesCoordinates,
  setTrackedRoute,
  setRoutesCoordinates,
  startNavigation,
  setRemainingRoute,
  showSnackbar,
  location,
  vehicleType,
  refetch,
}) => {
  const zoomOutToFitRoute = () => {
    if (mapRef.current && location && searchLocation) {
      mapRef.current.fitToCoordinates([location, searchLocation.location], {
        edgePadding: { top: 50, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  };

  const fetchRoutes = async () => {
    if (!location || !searchLocation) {
      console.warn(
        "Invalid location or search location. Skipping fetchRoutes."
      );
      return;
    }

    try {
      const departureTime = new Date(Date.now() + 60 * 1000).toISOString();

      const apiUrl =
        "https://routes.googleapis.com/directions/v2:computeRoutes";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.EXPO_PUBLIC_GOOGLE_API,
          "X-Goog-FieldMask":
            "routes.duration,routes.distanceMeters,routes.polyline,routes.legs,routes.routeLabels,routes.travelAdvisory,routes.travelAdvisory.tollInfo,routes.routeToken,routes.legs.travelAdvisory,routes.legs.travelAdvisory.speedReadingIntervals",
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
          extraComputations: ["TRAFFIC_ON_POLYLINE"],
          routingPreference: "TRAFFIC_AWARE_OPTIMAL",
          travelMode: vehicleType?.mode || "DRIVE",
          computeAlternativeRoutes: true,
          departureTime,
          polylineQuality: "HIGH_QUALITY",
          units: "METRIC",
        }),
      });

      const data = await response.json();
      
      console.log("data of route", data)

      if (data.routes) {
        const routesWithDetails = processGoogleRoutes(data.routes);
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

  const refreshRouteEta = async (routeToken, index) => {
    try {
      const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.EXPO_PUBLIC_GOOGLE_API,
          "X-Goog-FieldMask":
            "routes.duration,routes.distanceMeters,routes.travelAdvisory",
        },
        body: JSON.stringify({
          routeToken,
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
        }),
      });
  
      const data = await response.json();
  
      if (data.routes?.[0]) {
        return {
          eta: data.routes[0].duration,
          distance: data.routes[0].distanceMeters,
          advisory: data.routes[0].travelAdvisory,
        };
      }
    } catch (error) {
      console.error("Error refreshing route ETA:", error);
    }
  };


  const refreshAllRouteMetrics = async () => {
    const updated = await Promise.all(
      routesCoordinates.map(async (route, index) => {
        const update = await refreshRouteEta(route.routeToken);
        console.log("update",update)
        return {
          ...route,
          eta: update?.eta || route.eta,
          distance: update?.distance || route?.distance,
          travelAdvisory: update?.advisory || route.travelAdvisory,
        };
      })
    );
    setRoutesCoordinates(updated);
  };
  

  useEffect(() => {
    if (searchLocation) {
      fetchRoutes();
    }
  }, [searchLocation, vehicleType]);

  // Add a new effect that specifically watches for chosen route changes
  useEffect(() => {
    if (
      chosenRouteIndex !== null &&
      routesCoordinates.length > 0 &&
      routesCoordinates[chosenRouteIndex]?.coordinates
    ) {
      // When route changes, update the tracking based on current location
      const currentRoute = routesCoordinates[chosenRouteIndex];

      if (location) {
        const { closestIndex } = findClosestPointOnRoute(
          location,
          currentRoute.coordinates
        );

        // Split the route into tracked and remaining segments
        const newTrackedRoute = currentRoute.coordinates.slice(
          0,
          closestIndex + 1
        );
        const newRemainingRoute = currentRoute.coordinates.slice(
          closestIndex + 1
        );

        setTrackedRoute(newTrackedRoute);
        setRemainingRoute(newRemainingRoute);
      } else {
        // If no location yet, reset tracking
        setTrackedRoute([]);
        setRemainingRoute(currentRoute.coordinates);
      }
    }
  }, [chosenRouteIndex, routesCoordinates]);

  // Keep the existing effect for updating tracking during movement
  useEffect(() => {
    if (
      chosenRouteIndex !== null &&
      routesCoordinates.length > 0 &&
      location &&
      startNavigation &&
      routesCoordinates[chosenRouteIndex]?.coordinates &&
      trackedRoute.length > 0 // Only update if we already have a tracked route
    ) {
      //Update Route
      refreshAllRouteMetrics()

      const currentRoute = routesCoordinates[chosenRouteIndex];

      // Find the closest point on the route
      const { closestIndex } = findClosestPointOnRoute(
        location,
        currentRoute.coordinates
      );

      // Split the route into tracked and remaining segments
      const newTrackedRoute = currentRoute.coordinates.slice(
        0,
        closestIndex + 1
      );
      const newRemainingRoute = currentRoute.coordinates.slice(
        closestIndex + 1
      );

      setTrackedRoute(newTrackedRoute);
      setRemainingRoute(newRemainingRoute);
    }
  }, [location]);

  return {fetchRoutes};
};

export default useRouteNavigation;
