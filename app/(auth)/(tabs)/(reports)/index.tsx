import { Ionicons } from "@expo/vector-icons";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
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
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [flashMode, setFlashMode] = useState("off");
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
      </View>
    );
    
  }

  // function toggleCameraFacing() {
  //   setFacing((current) => (current === "back" ? "front" : "back"));
  // }

  // function returnToHome() {
  //   router.push("/(auth)/(tabs)");
  // }

  const takePicture = async () => {
    const options = { quality: 0.5, base64: true, exif: true };
    const photo: any = await cameraRef?.current.takePictureAsync(options);
    setPreviewVisible(true);
    setCapturedImage(photo);
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setPreviewVisible(false);
  };

  const savePhoto = () => {
    console.log("Photo saved:", capturedImage.uri);
    alert("Photo saved successfully!");
  };

  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      {previewVisible && capturedImage ? (
        <CameraPreview
          photo={capturedImage}
          retakePicture={retakePicture}
          savePhoto={savePhoto}
        />
      ) : (
        <Animated.View style={{ flex: 1, opacity }}>
          {permission?.granted && (
            <CameraView
              style={styles.camera}
              ref={cameraRef}
              responsiveOrientationWhenOrientationLocked
              facing={facing}
            >
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <Ionicons name="camera" size={30} color="white" />
              </TouchableOpacity>
            </CameraView>
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const CameraPreview = ({ photo, retakePicture, savePhoto }: any) => {
  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: photo?.uri }} style={{ flex: 1 }}>
        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
            <Text>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retakeButton} onPress={savePhoto}>
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
    backgroundColor: "red",
    justifyContent: "center",
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    alignItems: "center",
  },
});
