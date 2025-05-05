import { io } from "socket.io-client";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SOCKET;
console.log(BASE_URL)

export const socket = io("http://10.10.13.15:5000", {
    transports: ['websocket'],
});