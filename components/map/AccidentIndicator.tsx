import { View, Text } from "react-native";
import React from "react";

const AccidentIndicator = ({count}) => {
    console.log(count)
  return (
    <View
      style={{
        position: "absolute",
        height: "100%",
        width: "100%",
        borderLeftWidth: 5,
        borderRightWidth: 5,
        // opacity: 0.5,
        borderRadius: 0,
        borderColor: count > 0 && count <= 5 ? "orange" : "red",
      }}
      className="animate-pulse"
    />
  );
};

export default AccidentIndicator;
