import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Image } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const SearchBar = ({
  mapRef,
  bottomSheetRef,
  theme,
  handleClose,
  setSearchLocation,
  setRoutesCoordinates,
  searchLocation,
  mapReady,
}) => {
  const searchRef = useRef(null);

  return (
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
        key: process.env.EXPO_PUBLIC_GOOGLE_API,
        language: "en",
      }}
      renderLeftButton={() => (
        <Image
          style={{ width: 30, height: 30 }}
          source={require("../../assets/images/adaptive-icon.png")}
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
  );
};

export default SearchBar;
