import React from "react";
import { Image } from "react-native";
import { Marker, Polyline } from "react-native-maps";
import DefaultAccident from "@/assets/images/accident_mark.png";
import StartMarker from "@/assets/images/start_marker.png";
import { useDispatch } from "react-redux";
import { setActiveReport } from "@/features/active";
const images = {
  car: require("@/assets/images/car.png"),
  motor: require("@/assets/images/motorbike.png"),
};

const reports = {
  "Vehicle Collision": require("@/assets/images/collision_mark.png"),
  "Motorcycle Accident": require("@/assets/images/motorcycle_mark.png"),
  "Pedestrian Involved": require("@/assets/images/hitnrun_mark.png"),
  "Weather Related": require("@/assets/images/weather_mark.png"),
  "Mechanical Failure": require("@/assets/images/mechanical_mark.png"),
  "Obstruction/Hazard": require("@/assets/images/obstruction_mark.png"),
  "Reckless Driving": require("@/assets/images/reckless_mark.png"),
};

const reports_closed = {
  "Vehicle Collision": require("@/assets/images/collision_mark_closed.png"),
  "Motorcycle Accident": require("@/assets/images/motorcycle_mark_closed.png"),
  "Pedestrian Involved": require("@/assets/images/hitrun_mark_closed.png"),
  "Weather Related": require("@/assets/images/weather_mark_closed.png"),
  "Mechanical Failure": require("@/assets/images/mechanical_mark_closed.png"),
  "Obstruction/Hazard": require("@/assets/images/obstruction_mark_closed.png"),
  "Reckless Driving": require("@/assets/images/reckless_mark_closed.png"),
};

const reports_reported = {
  "Vehicle Collision": require("@/assets/images/collision_mark_reported.png"),
  "Motorcycle Accident": require("@/assets/images/motorcycle_mark_reported.png"),
  "Pedestrian Involved": require("@/assets/images/hitrun_mark_reported.png"),
  "Weather Related": require("@/assets/images/weather_mark_reported.png"),
  "Mechanical Failure": require("@/assets/images/mechanical_mark_reported.png"),
  "Obstruction/Hazard": require("@/assets/images/obstruction_mark_reported.png"),
  "Reckless Driving": require("@/assets/images/reckless_mark_reported.png"),
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
  setIsInfoOpen
  // startLocation,
}) => {
  const dispatch = useDispatch()

  const onMarkerPress = (item) => {
    console.log(item)
    dispatch(setActiveReport(item));
    setIsInfoOpen(true);
  };

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
        <>
          <Marker coordinate={searchLocation.location} />
          <Marker coordinate={searchLocation.start}>
            <Image
              source={StartMarker}
              style={{ width: 35, height: 35, resizeMode: "contain" }}
            />
          </Marker>
        </>
      )}
      {mapReady &&
        routesCoordinates?.map((route, index) => {
          console.log(route);
          const isChosen = index === chosenRouteIndex;
          const zIndex = isChosen ? routesCoordinates?.length + 1 : index;

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
              {isChosen && route?.segments?.length > 0 ? (
                route?.segments?.map((segment, segIndex) => (
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
                  strokeColor={isChosen ? "red" : "#98F5F9"}
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
        data?.map((item, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            // title={item.name}
            // description={item.vicinity}
            onPress={() => onMarkerPress(item)}
          >
            <Image
              source={
                item.type
                  ? item.status === "Closed"
                    ? reports_closed[item.type]
                    : item.status === "Reported"
                    ? reports_reported[item.type]
                    : reports[item.type]
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
