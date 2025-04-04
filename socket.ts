import { io } from "socket.io-client";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BASE_URL;

export const socket = io(BASE_URL, {
    transports: ['websocket'],
});