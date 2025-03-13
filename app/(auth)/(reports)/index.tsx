import { clearCamera, setBackCamera, setFrontCamera } from "@/features/reports/reducers/reportsSlice";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  FlashMode,
} from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Animated,
  Dimensions,
} from "react-native";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import { ActivityIndicator, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function App() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const reportImages = useSelector((state: any) => state.reports);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [torch, setTorch] = useState(false);
  const [backImage, setBackImage] = useState<any>(null);
  const [zoom, setZoom] =useState<number>(0);
  const [frontImage, setFrontImage] = useState<any>(null);
  // Define flashMode with the correct type
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [opacity] = useState(new Animated.Value(0));
  const [imageOrientation, setImageOrientation] = useState("portrait");

  const cameraRef = useRef<CameraView>(null);
  const animatedZoom = useRef(new Animated.Value(zoom)).current;


  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (permission?.granted) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [permission]);

  useEffect(() => {
    if (reportImages.backCamera) {
      setBackImage(reportImages.backCamera);
    }
    if (reportImages.frontCamera) {
      setFrontImage(reportImages.frontCamera);
    }

    // Automatically show preview if images are present
    if (reportImages.backCamera) {
      setFacing("front");
      setPreviewVisible(true);
    }else if(reportImages.frontCamera){
      setFacing("back");
      setPreviewVisible(true);
    }
  }, [reportImages]);

  const handlePinch = Animated.event(
    [{ nativeEvent: { scale: animatedZoom } }],
    { useNativeDriver: false } // Set to false since zoom affects the camera, not a UI element
  );
  
  useEffect(() => {
    animatedZoom.addListener(({ value }) => {
      const clampedZoom = Math.min(Math.max(value, 0), 1); // Ensure zoom is between 0 and 1
      setZoom(clampedZoom);
    });
  
    return () => animatedZoom.removeAllListeners();
  }, []);
  
  

  if (!permission) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <ActivityIndicator
          animating={true}
          size="large"
          color={theme.colors.primary}
        />
      </View>
    );
  }


  const takePicture = async () => {
    if (!cameraRef?.current) return;

    try {
      const options = {
        quality: 0.5,
        base64: true,
        exif: true,
        skipProcessing: false, // ensure image processing happens
      };
      const photo = await cameraRef.current.takePictureAsync(options);
      console.log(photo);

      // Determine image orientation
      const isLandscape = photo.width > photo.height;
      setImageOrientation(isLandscape ? "landscape" : "portrait");

      if (facing === "back") {
        setPreviewVisible(true);
        setBackImage(photo);
      } else if (facing === "front") {
        setPreviewVisible(true);
        setFrontImage(photo);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      alert("Failed to take picture. Please try again.");
    }
  };

  const nextPage = () => {
    console.log("next!");
    if (facing === "back") {
      dispatch(setBackCamera(backImage));
      setPreviewVisible(false);
      setFacing("front");
    } else if (facing === "front") {
      dispatch(setFrontCamera(frontImage));
      router.push("/(auth)/(reports)/form");
    }
  };

  const previousPage = () => {
    setPreviewVisible(true);
    if (facing === "front") {
      setFacing("back");
    }
    if(facing==="back"){
      router.push("/(auth)/(tabs)")
      dispatch(clearCamera())
    }
  };

  const retakePicture = () => {
    facing === "back" ? setBackImage(null) : setFrontImage(null);
    setPreviewVisible(false);
  };

  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      {previewVisible && (facing === "back" ? backImage : frontImage) ? (
        <CameraPreview
          photo={facing === "back" ? backImage : frontImage}
          retakePicture={retakePicture}
          nextPage={nextPage}
          imageOrientation={imageOrientation}
        />
      ) : (
        <PinchGestureHandler onGestureEvent={handlePinch}>

        <Animated.View style={{ flex: 1, opacity }}>
          {permission?.granted && (
            <CameraView
              style={styles.camera}
              ref={cameraRef}
              enableTorch={torch}
              flash={flashMode}
              zoom={facing === "back" ? zoom : 0}
              responsiveOrientationWhenOrientationLocked
              facing={facing}
            >
              <View
                style={{
                  flexDirection: "column",
                  top: 10,
                  gap: 10,
                  right: 10,
                  position: "absolute",
                }}
              >
                <TouchableOpacity
                  style={{
                    padding: 10,
                    borderRadius: 50,
                    backgroundColor: "rgba(0,0,0,0.5)",
                  }}
                  onPress={() => setTorch((current) => !current)}
                >
                  <MaterialCommunityIcons
                    name={torch ? "flashlight" : "flashlight-off"}
                    size={30}
                    color="white"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    padding: 10,
                    borderRadius: 50,
                    backgroundColor: "rgba(0,0,0,0.5)",
                  }}
                  onPress={() =>
                    setFlashMode((current) =>
                      current === "off" ? "on" : "off"
                    )
                  }
                >
                  <Ionicons
                    name={flashMode === "on" ? "flash" : "flash-off"}
                    size={30}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
              {/* {facing === "front" && ( */}
                <TouchableOpacity
                  onPress={previousPage}
                  style={styles.backButton}
                >
                  <Feather name="chevron-left" size={30} color="white" />
                </TouchableOpacity>
              {/* )} */}
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <Ionicons name="camera" size={30} color="black" />
              </TouchableOpacity>
            </CameraView>
          )}
        </Animated.View>
        </PinchGestureHandler>
      )}
    </SafeAreaView>
  );
}

const CameraPreview = ({
  photo,
  retakePicture,
  nextPage,
  imageOrientation,
}: any) => {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Calculate container styles based on orientation
  const containerStyle = {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  };

  // Calculate image styles based on orientation
  const imageStyle =
    imageOrientation === "landscape"
      ? {
          width: screenWidth,
          height: screenWidth * (photo.height / photo.width),
          alignSelf: "center",
        }
      : {
          width: screenWidth,
          height: screenHeight,
        };

  return (
    <View style={containerStyle}>
      <ImageBackground
        source={{ uri: photo?.uri }}
        style={imageStyle}
        resizeMode="contain"
      />
      <View style={styles.previewControls}>
        <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
          <Text>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.retakeButton} onPress={nextPage}>
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  previewControls: {
    position: "absolute",
    bottom: 30,
    paddingHorizontal: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  retakeButton: {
    width: 100,
    height: 40,
    borderRadius: 10,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    borderRadius: 50,
    padding: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
