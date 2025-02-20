import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../context/authContext";
import * as SplashScreen from "expo-splash-screen";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleNavigation = async () => {
      if (loading) return;

      await SplashScreen.hideAsync();

      if (user) {
        router.replace("/(auth)/(tabs)/"); 
      } else {
        router.replace("/sign-in"); 
      }
    };

    handleNavigation();
  }, [user, loading]);

  return null;
}
