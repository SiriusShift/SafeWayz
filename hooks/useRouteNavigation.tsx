import { socket } from "@/socket";
import { findClosestPointOnRoute } from "@/utils/map/mapHelpers";
import { decodePolyline } from "@/utils/map/routeDecoder";
import React, { useEffect } from "react";

const useRouteNavigation = ({
  mapRef,
  searchLocation,
  chosenRouteIndex,
  setChosenRouteIndex,
  trackedRoute,
  routesCoordinates,
  setTrackedRoute,
  setRoutesCoordinates,
  setRemainingRoute,
  showSnackbar,
  location,
  vehicleType,
  refetch
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
    if (!location || !searchLocation) return;

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

  useEffect(() => {
    if (searchLocation) {
      fetchRoutes();
    }
  }, [searchLocation]);

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
      routesCoordinates[chosenRouteIndex]?.coordinates &&
      trackedRoute.length > 0 // Only update if we already have a tracked route
    ) {
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

  useEffect(() => {
    socket.on("test_event", (newReport) => {
      console.log("New report received: ", newReport);
    //   showSnackbar("New accident report", 3000, "success");
    });
    return () => {
      socket.off("new_report");
    };
  }, [refetch]);

  return null;
};

export default useRouteNavigation;
