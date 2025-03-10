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
} from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const theme = useTheme();
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [torch, setTorch] = useState(false);
  const [backImage, setBackImage] = useState<any>(null);
  const [frontImage, setFrontImage] = useState<any>(null);
  // Define flashMode with the correct type
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [opacity] = useState(new Animated.Value(0));

  const cameraRef = useRef<CameraView>(null);

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
    setPreviewVisible(false);
    setFacing("front");
  };

  const previousPage = () => {
    setPreviewVisible(true);
    if (facing === "front") {
      setFacing("back");
    }
  };

  const retakePicture = () => {
    facing === "back" ? setBackImage(null) : setFrontImage(null);
    setPreviewVisible(false);
  };

  // const savePhoto = () => {
  //   console.log("Photo saved:", capturedImage.uri);
  //   alert("Photo saved successfully!");
  // };

  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      {previewVisible && (facing === "back" ? backImage : frontImage) ? (
        <CameraPreview
          photo={facing === "back" ? backImage : frontImage}
          retakePicture={retakePicture}
          nextPage={nextPage}
          // savePhoto={savePhoto}
        />
      ) : (
        <Animated.View style={{ flex: 1, opacity }}>
          {permission?.granted && (
            <CameraView
              style={styles.camera}
              ref={cameraRef}
              enableTorch={torch}
              mirror={true}
              flash={flashMode}
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
              {facing === "front" && (
                <TouchableOpacity
                  onPress={previousPage}
                  style={styles.backButton}
                >
                  <Feather name="chevron-left" size={30} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <Ionicons name="camera" size={30} color="black" />
              </TouchableOpacity>
            </CameraView>
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const CameraPreview = ({ photo, retakePicture, savePhoto, nextPage }: any) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: photo?.uri }}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
        }}
        resizeMode="cover"
      >
        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
            <Text>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retakeButton} onPress={nextPage}>
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
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
    bottom: 80,
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
    bottom: 80,
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
