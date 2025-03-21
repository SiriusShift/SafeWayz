import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { SplashScreen, useRouter, useSegments } from "expo-router";
import {
  useGetUserDetailsQuery,
  useLazyGetUserDetailsQuery,
} from "@/features/user/api/userApi";

function useProtectedRoute(user) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log(segments);
    const inAuthGroup = segments[0] === "(auth)";
    console.log("user: !", user, inAuthGroup);

    const handleSplashScreen = async () => {
      if (!user && inAuthGroup) {
        router.replace("/sign-in");
      } else if (user && !inAuthGroup) {
        router.replace("/(auth)/(tabs)/");
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await SplashScreen.hideAsync();
    };
    handleSplashScreen();
  });
}

export const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => null,
  logout: () => null,
  register: () => null,
  updateUser: () => null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a <AuthProvider />");
  }
  return context;
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [triggerGetUserDetails] = useLazyGetUserDetailsQuery();

  const login = async (values) => {
    console.log("values", values);
    await SecureStore.setItemAsync("user", JSON.stringify(values.user));
    await SecureStore.setItemAsync("accessToken", values.accessToken);
    setUser(values.user);
    return true;
  };

  const register = async (values) => {
    await SecureStore.setItemAsync("accessToken", values.accessToken);
    await SecureStore.setItemAsync("user", JSON.stringify(values.user));
    setUser(values.user);
    return true;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("user");
    await SecureStore.deleteItemAsync("accessToken");
    setUser(null);
  };

  const updateUser = async (values) => {
    await SecureStore.setItemAsync("user", JSON.stringify(values.user));
    setUser(values.user);
    return true;
  };

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync("user");
        const storedToken = await SecureStore.getItemAsync("accessToken");

        if (storedUser && storedToken) {
          const response = await triggerGetUserDetails().unwrap();
          setUser(response.user);
          await SecureStore.setItemAsync("user", JSON.stringify(response.user));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log("Error loading user from storage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []); // ✅ Removed fetchUserData from dependencies

  useProtectedRoute(user);

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
