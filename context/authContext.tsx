import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { SplashScreen, useRouter, useSegments } from "expo-router";

function useProtectedRoute(user) {
  const segments = useSegments();
  const router = useRouter()

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    const handleSplashScreen = async () => {
      if (!user && inAuthGroup) {
        router.replace("/sign-in");
      } else if (user && inAuthGroup) {
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
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if(!context){
    throw new Error("useAuth must be used within a <AuthProvider />")
  }
  return context
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (values) => {
    const userData = { username: values.username, password: values.password };
    await SecureStore.setItemAsync("user", JSON.stringify(userData));
    setUser(userData);
    return true;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("user");
    setUser(null);
  };

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedUser = await SecureStore.getItemAsync("user"); // ✅ Use getItemAsync
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
  
    loadUserFromStorage();
  }, []);

  useProtectedRoute(user)

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
