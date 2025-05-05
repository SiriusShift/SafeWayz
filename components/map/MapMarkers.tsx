import React from "react";
import { Image } from "react-native";
import { Marker, Polyline } from "react-native-maps";
import DefaultAccident from "@/assets/images/accident_mark.png";
import DefaultNotified from "@/assets/images/accident_mark_notified.png";

const images = {
  car: require("@/assets/images/car.png"),
  motor: require("@/assets/images/motorbike.png"),
};

const reports = {
  Collision: require("@/assets/images/collision_mark.png"),
  "Hit and run": require("@/assets/images/hitnrun_mark.png"),
};

const reports_notified = {
  Collision: require("@/assets/images/collision_mark_notified.png"),
  "Hit and run": require("@/assets/images/hitrun_mark_notified.png"),
};

const MapMarkers = ({
  location,
  mapReady,
  vehicleType,
  routesCoordinates,
  searchLocation,
  data,
  trackedRoute,
  remainingRoute,
  chosenRouteIndex,
  setChosenRouteIndex,
  startNavigation,
}) => {
  return (
    <>
      {mapReady && location && (
        <Marker coordinate={location} title="Your Location">
          <Image
            source={images[vehicleType?.activeImg || "car"]}
            style={{ width: 30, height: 30, resizeMode: "contain" }}
          />
        </Marker>
      )}
      {mapReady && searchLocation && (
        <Marker coordinate={searchLocation.location} />
      )}
      {mapReady &&
        routesCoordinates.map((route, index) => {
          console.log(route);
          const isChosen = index === chosenRouteIndex;
          const zIndex = isChosen ? routesCoordinates.length + 1 : index;

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
                strokeColor={isChosen ? "blue" : "gray"}
                strokeWidth={4}
                zIndex={zIndex}
                strokeLinecap="round"
                lineJoin="round"
              />

              {/* Original route selection logic */}
              {isChosen && startNavigation && route.segments?.length > 0 ? (
                route.segments.map((segment, segIndex) => (
                  <Polyline
                    key={`segment-${index}-${segIndex}`}
                    coordinates={segment.coordinates}
                    strokeColor={segment.color}
                    strokeWidth={6}
                    zIndex={zIndex}
                    strokeLinecap="round"
                    lineJoin="round"
                    tappable={true}
                    onPress={(e) => {
                      e.stopPropagation && e.stopPropagation();
                      setChosenRouteIndex(index);
                    }}
                  />
                ))
              ) : (
                // Fallback: draw full polyline if no segments
                <Polyline
                  coordinates={route.coordinates}
                  strokeColor={isChosen ? "white" : "blue"}
                  strokeWidth={isChosen ? 6 : 4}
                  zIndex={zIndex}
                  strokeLinecap="round"
                  lineJoin="round"
                  tappable={true}
                  onPress={(e) => {
                    e.stopPropagation && e.stopPropagation();
                    setChosenRouteIndex(index);
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      {data &&
        location &&
        mapReady &&
        data?.data?.map((item, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            title={item.name}
            description={item.vicinity}
          >
            <Image
              source={
                item.type
                  ? item.notified
                    ? reports_notified[item.type]
                    : reports[item.type]
                  : item.notified
                  ? DefaultNotified
                  : DefaultAccident
              }
              style={{ width: 35, height: 35, resizeMode: "contain" }}
            />
          </Marker>
        ))}
    </>
  );
};

export default MapMarkers;
