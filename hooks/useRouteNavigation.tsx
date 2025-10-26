import { socket } from "@/socket";
import { findClosestPointOnRoute } from "@/utils/map/mapHelpers";
import { decodePolyline } from "@/utils/map/routeDecoder";
import React, { useEffect, useRef } from "react";
import { processGoogleRoutes } from "@/utils/map/routeProcessor";
import * as turf from "@turf/turf";

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
  zoomOutToFitRoute,
  checkForAccidentsOnRoute,
  setAccidentCount
}) => {
  const lastClosestIndexRef = useRef(0);

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

      console.log("data of route", data);

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

  const refreshRouteEta = async (routeToken) => {
    try {
      const response = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
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
        }
      );

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
      routesCoordinates?.map(async (route, index) => {
        const update = await refreshRouteEta(route.routeToken);
        console.log("update", update);
        return {
          ...route,
          eta:
            parseInt(update?.eta.split("s")[0]) ||
            parseInt(route.eta.split("s")[0]),
          distance: update?.distance || route?.distance,
          travelAdvisory: update?.advisory || route.travelAdvisory,
        };
      })
    );
    setRoutesCoordinates(updated);
  };

  const checkInRoute = () => {
    if (!routesCoordinates?.length) return false;
    if (chosenRouteIndex == null && !startNavigation) return false;

    const selectedRoute = routesCoordinates[chosenRouteIndex];

    const routeLine = turf.lineString(
      selectedRoute.coordinates?.map(({ longitude, latitude }) => [
        longitude,
        latitude,
      ])
    );
    const buffered = turf.buffer(routeLine, 25, { units: "meters" });

    return turf.booleanPointInPolygon(
      turf.point([location.longitude, location.latitude]),
      buffered
    );
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
      routesCoordinates[chosenRouteIndex]?.coordinates &&
      location
    ) {
      const currentRoute = routesCoordinates[chosenRouteIndex];
      const startIndex = lastClosestIndexRef.current || 0;
  
      const { closestIndex } = findClosestPointOnRoute(
        location,
        currentRoute.coordinates,
        startIndex
      );
  
      // Update last closest index for next run
      lastClosestIndexRef.current = closestIndex;
  
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
      refreshAllRouteMetrics();
      const userInRoute = checkInRoute();
      console.log("user in route",userInRoute);

      if(!userInRoute){
        console.log("route change")
        fetchRoutes();
      }

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

      const accident = checkForAccidentsOnRoute();
      if(accident.past > 0 || accident.latest > 0){
        setAccidentCount(accident?.past + accident?.latest);
      }
      setTrackedRoute(newTrackedRoute);
      setRemainingRoute(newRemainingRoute);
    }
  }, [location]);

  return { fetchRoutes };
};

export default useRouteNavigation;
