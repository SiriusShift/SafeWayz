export default {
  expo: {
    name: "PathAlert",
    slug: "path-alert",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "pathalert",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      runtimeVersion: {
        policy: "appVersion",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.pathalert",
      runtimeVersion: "1.0.0",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_API || "",
        },
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          resizeMode: "cover",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-secure-store",
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsImpl": "mapbox",
          "mapboxAccessToken": process.env.EXPO_PUBLIC_MAPBOX_SECRET
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "00995566-e432-43bc-9f33-dbae9115e4aa",
      },
    },
    updates: {
      url: "https://u.expo.dev/e6a7a504-7312-4b04-957b-1abed85dd023",
    },
    owner: "charlesamiel01",
  },
};
