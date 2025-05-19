import { io } from "socket.io-client";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SOCKET;
console.log(BASE_URL)

export const socket = io("https://safewayz-backend.onrender.com", {
    transports: ['websocket'],
});