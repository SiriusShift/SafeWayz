import { Ionicons } from "@expo/vector-icons";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";

export default function App() {
  const theme = useTheme();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [flashMode, setFlashMode] = useState("off");

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  if (!permission) {
    return (
      <ActivityIndicator
        animating={true}
        size="large"
        color={theme.colors.primary}
      />
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const takePicture = async () => {
    const options = { quality: 0.5, base64: true, exif: true };
    const photo: any = await cameraRef?.current.takePictureAsync(options);
    console.log(photo);
    setPreviewVisible(true);
    //setStartCamera(false)
    setCapturedImage(photo);
  };

  return (
    <View style={styles.container}>
      {previewVisible && capturedImage ? (
        <CameraPreview photo={capturedImage} />
      ) : (
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          responsiveOrientationWhenOrientationLocked
          facing={facing}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <Ionicons name="camera" size={30} color="black" />
            </TouchableOpacity>
            {/* <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={30} color="white" />
          </TouchableOpacity> */}
          </View>
        </CameraView>
      )}
    </View>
  );
}

const CameraPreview = ({ photo, retakePicture, savePhoto }: any) => {
  console.log("sdsfds", photo);
  return (
    <View
      style={{
        backgroundColor: "transparent",
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    >
      <ImageBackground
        source={{ uri: photo && photo.uri }}
        style={{
          flex: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            padding: 15,
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={retakePicture}
              style={{
                width: 130,
                height: 40,

                alignItems: "center",
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                }}
              >
                Re-take
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={savePhoto}
              style={{
                width: 130,
                height: 40,

                alignItems: "center",
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                }}
              >
                save photo
              </Text>
            </TouchableOpacity>
          </View>
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
  buttonContainer: {
    position: "absolute",
    bottom: 80,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: 30,
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
