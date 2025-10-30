import { useTheme } from "react-native-paper";
import { decodePolyline } from "./routeDecoder";

export const processGoogleRoutes = (rawRoutes) => {
  return rawRoutes.map((route, index) => {
    console.log("raw routes",rawRoutes)
    const coordinates = decodePolyline(route.polyline.encodedPolyline);
    const duration = parseInt(route.duration.replace("s", ""), 10) ?? Infinity;
    const distance = route.distanceMeters ?? Infinity;
    const midIndex = Math.floor(coordinates?.length / 2);
    const midPoint = coordinates[midIndex];
    const routeToken = route.routeToken;

    const segments = [];
    const intervals =
      route.legs?.[0]?.travelAdvisory?.speedReadingIntervals || [];

    intervals.forEach((interval) => {
      const { startPolylinePointIndex, endPolylinePointIndex, speed } =
        interval;

      let color = "#00B050"; // default to green (normal speed)
      if (speed === "SLOW") color = "#FF9900";
      else if (speed === "TRAFFIC_JAM") color = "#FF0000";

      const segmentCoords = coordinates.slice(
        startPolylinePointIndex,
        endPolylinePointIndex + 1
      );

      segments.push({ coordinates: segmentCoords, color });
    });

    return { coordinates, duration, midPoint, routeToken, index, distance, segments };
  });
};
