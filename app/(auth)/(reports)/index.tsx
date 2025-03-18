import {
  clearCamera,
  setBackCamera,
  setFrontCamera,
} from "@/features/reports/reducers/reportsSlice";
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
  AntDesign,
} from "@expo/vector-icons";
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
  Platform,
} from "react-native";
import { PinchGestureHandler } from "react-native-gesture-handler";
import {
  ActivityIndicator,
  Button,
  Modal,
  Portal,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import * as ImageManipulator from "expo-image-manipulator";
import { StatusBar } from "expo-status-bar";
import StyledText from "@/components/StyledText";
import { useCreateReportMutation } from "@/features/reports/api/reportsApi";

export default function App() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const reportImages = useSelector((state: any) => state.reports);
  const location = useSelector((state: any) => state.user.location);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [torch, setTorch] = useState(false);
  const [backImage, setBackImage] = useState<any>(null);
  const [zoom, setZoom] = useState<number>(0);
  const [frontImage, setFrontImage] = useState<any>(null);
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [opacity] = useState(new Animated.Value(0));
  const [visible, setVisible] = useState(false);
  const [imageOrientation, setImageOrientation] = useState("portrait");

  const cameraRef = useRef<CameraView>(null);
  const animatedZoom = useRef(new Animated.Value(zoom)).current;

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const [triggerReport, { isLoading }] = useCreateReportMutation();

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
    animatedZoom.addListener(({ value }) => {
      // Start zoom at minimum 0 for a better experience
      const calculatedZoom = Math.max(value - 1, 0);
      const clampedZoom = Math.min(calculatedZoom, 1);
      setZoom(clampedZoom);
    });

    return () => animatedZoom.removeAllListeners();
  }, []);

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
    } else if (reportImages.frontCamera) {
      setFacing("back");
      setPreviewVisible(true);
    }
  }, [reportImages]);

  const handlePinch = Animated.event(
    [{ nativeEvent: { scale: animatedZoom } }],
    { useNativeDriver: false }
  );

  const submitReport = async () => {
    const transformImage = {
      backImage: reportImages.backCamera.base64,
      frontImage: reportImages.frontCamera.base64,
      lat: location.latitude,
      lng: location.longitude,
      date: new Date(),
    }
    console.log("submit report",transformImage)
    try {
      await triggerReport(transformImage).unwrap();
      dispatch(clearCamera());
      router.push("/(auth)/(tabs)");
      setVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          animating={true}
          size="large"
          color={theme.colors.primary}
        />
      </View>
    );
  }

  const handleSubmit = () => {
    if (frontImage && backImage) {
      dispatch(clearCamera());
      router.push("/(auth)/(reports)/form");
    }
  };

  const takePicture = async () => {
    if (!cameraRef?.current) return;

    try {
      const options = {
        quality: 0.5,
        base64: true,
        exif: true,
        skipProcessing: false,
      };
      let photo = await cameraRef.current.takePictureAsync(options);

      const isLandscape = photo.width > photo.height;
      setImageOrientation(isLandscape ? "landscape" : "portrait");

      // Mirror the image if using front camera
      if (facing === "front") {
        photo = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ flip: ImageManipulator.FlipType.Horizontal }],
          { base64: true }
        );
      }

      if (facing === "back") {
        setPreviewVisible(true);
        setBackImage(photo);
      } else {
        setPreviewVisible(true);
        setFrontImage(photo);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      alert("Failed to take picture. Please try again.");
    }
  };

  const nextPage = () => {
    if (facing === "back") {
      dispatch(setBackCamera(backImage));
      setPreviewVisible(false);
      setFacing("front");
    } else if (facing === "front") {
      dispatch(setFrontCamera(frontImage));
      setVisible(true);
      // router.push("/(auth)/(reports)/form");
    }
  };

  const previousPage = () => {
    if (facing === "front") {
      setPreviewVisible(false);
      setFacing("back");
      dispatch(setFrontCamera(null));
      // If there's already a back image, show its preview
      if (backImage) {
        setPreviewVisible(true);
      }
    } else if (facing === "back") {
      router.push("/(auth)/(tabs)");
      dispatch(clearCamera());
    }
  };

  const retakePicture = () => {
    facing === "back" ? setBackImage(null) : setFrontImage(null);
    setPreviewVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <>
        {previewVisible && (facing === "back" ? backImage : frontImage) ? (
          <CameraPreview
            photo={facing === "back" ? backImage : frontImage}
            retakePicture={retakePicture}
            nextPage={nextPage}
            imageOrientation={imageOrientation}
          />
        ) : (
          <PinchGestureHandler onGestureEvent={handlePinch}>
            <Animated.View style={[styles.cameraWrapper, { opacity }]}>
              {permission?.granted && (
                <>
                  <CameraView
                    style={styles.camera}
                    ref={cameraRef}
                    enableTorch={torch}
                    flash={flashMode}
                    ratio="16:9"
                    zoom={facing === "back" ? zoom : 0}
                    responsiveOrientationWhenOrientationLocked
                    facing={facing}
                  >
                    <View style={styles.topControlsContainer}>
                      <TouchableOpacity
                        onPress={previousPage}
                        style={styles.backButton}
                      >
                        <Feather name="chevron-left" size={30} color="white" />
                      </TouchableOpacity>

                      <View style={styles.rightControls}>
                        <TouchableOpacity
                          style={styles.controlButton}
                          onPress={() => setTorch((current) => !current)}
                        >
                          <MaterialCommunityIcons
                            name={torch ? "flashlight" : "flashlight-off"}
                            size={30}
                            color="white"
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.controlButton}
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
                    </View>
                  </CameraView>

                  <View style={styles.bottomControls}>
                    <TouchableOpacity
                      style={styles.captureButton}
                      onPress={takePicture}
                    >
                      <Ionicons name="camera" size={30} color="black" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Animated.View>
          </PinchGestureHandler>
        )}
        <Portal>
          <Modal
            visible={visible}
            onDismiss={() => setVisible(false)}
            contentContainerStyle={styles.modalContainer}
            dismissable={false}
          >
            <View style={styles.modalContent}>
              <StyledText className="text-2xl font-bold mb-4 text-center">
                Submit Report
              </StyledText>
              <StyledText className="text-base mb-6 text-center">
                Would you like to submit the report or continue filling out the
                form?
              </StyledText>
              <View className="flex flex-row justify-center gap-4 px-4">
                <Button
                  mode="outlined"
                  loading={isLoading}
                  disabled={isLoading}
                  onPress={submitReport}
                >
                  <StyledText>{isLoading ? "" : "Submit"}</StyledText>
                </Button>
                <Button
                  mode="contained"
                  disabled={isLoading}
                  onPress={() => {
                    setVisible(false);
                    router.push("/(auth)/(reports)/form");
                  }}
                >
                  <Text className="text-white">Continue</Text>
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>
      </>
    </SafeAreaView>
  );
}

const CameraPreview = ({
  photo,
  retakePicture,
  nextPage,
  imageOrientation,
}: any) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // Calculate image display dimensions based on photo aspect ratio and screen size
  let imageStyle = {};

  if (photo && photo.width && photo.height) {
    const photoRatio = photo.width / photo.height;

    if (imageOrientation === "landscape") {
      // For landscape photos
      const displayHeight = screenWidth / photoRatio;
      imageStyle = {
        width: screenWidth,
        height: displayHeight,
      };
    } else {
      // For portrait photos
      // Use screen height as base but ensure it's not wider than screen
      const potentialWidth = screenHeight * photoRatio;

      if (potentialWidth <= screenWidth) {
        imageStyle = {
          width: potentialWidth,
          height: screenHeight,
        };
      } else {
        // If width would exceed screen, constrain to screen width
        imageStyle = {
          width: screenWidth,
          height: screenWidth / photoRatio,
        };
      }
    }
  }

  return (
    <View style={styles.previewContainer}>
      <ImageBackground
        source={{ uri: photo?.uri }}
        style={[styles.previewImage, imageStyle]}
        resizeMode="contain"
      />

      <View style={styles.previewControls}>
        <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
          <Text style={styles.buttonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={nextPage}>
          <AntDesign name="right" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  cameraWrapper: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  topControlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 0 : 10,
    paddingHorizontal: 10,
  },
  rightControls: {
    flexDirection: "row",
    gap: 20,
  },
  controlButton: {
    padding: 5,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backButton: {
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomControls: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  previewImage: {
    alignSelf: "center",
  },
  previewControls: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  retakeButton: {
    width: 250,
    height: 40,
    borderRadius: 10,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontWeight: "500",
    color: "black",
  },
  nextButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  modalContent: {
    alignItems: "center",
  },
  modalButton: {
    marginTop: 10,
    backgroundColor: "black",
    padding: 10,
    borderRadius: 5,
  },
});
