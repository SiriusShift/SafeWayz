import { Link } from "expo-router";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import Logo from "@/assets/images/landing-icon1.png";
import { Button } from "react-native-paper";

export default function Index() {
  const colorScheme = useColorScheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View>
        <Image source={Logo} className="h-72 w-72" />
      </View>
      <Text
        className={`font-bold text-3xl`}
      >
        Welcome to SafeWayz
      </Text>
      <Text
        className={`text-lg mb-10`}
      >
        Safely Navigating Angeles City
      </Text>

      <View className="px-10 w-full">
        <Button mode="contained">
          <Link href="/sign-in" asChild>
            <Text className="text-white font-semibold text-center">
              Let's Start
            </Text>
          </Link>
        </Button>
        {/* <TouchableOpacity className="bg-blue-500  py-4 mt-5 w-full rounded-full">
          <Link href="/sign-up" asChild>
          <Text className="text-white font-semibold text-center">
          Sign Up</Text>
          </Link>
        </TouchableOpacity> */}
      </View>

      {/* <Link href="/profile">Profile</Link> */}
      {/* <Link href="/properties/1">Property</Link> */}
    </View>
  );
}
