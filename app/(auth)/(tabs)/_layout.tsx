import React from "react";
import { View } from "react-native";
import { Tabs, useSegments } from "expo-router";
import { Text, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
const TabsLayout = () => {
  const theme = useTheme();
  const segments = useSegments();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            position: "absolute",
            alignContent: "center",
            // borderTopWidth: 1,
            // borderTopColor: theme.colors.background,
            height: 60,
            // borderTopWidth: 0, // Removes the white line (border)
            elevation: 0, // Removes shadow on Android
            shadowOpacity: 0, // Removes shadow on iOS
          },

          tabBarItemStyle: {
            justifyContent: "center",
            alignItems: "center",
          },
          tabBarIconStyle: {
            flex: 1,
            alignItems: "center",
          },
        }}
      >
        {/* Home Screen Tab */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={focused ? "home" : "home-outline"} // Dynamic icon change
                  size={22}
                  color={focused ? theme.colors.onSurface : "gray"}
                />
                <Text
                  style={{
                    color: focused ? theme.colors.onSurface : "gray",
                    fontSize: 10,
                  }}
                >
                  Home
                </Text>
              </View>
            ),
            //   tabBarLabel: ({ focused }) => (
            //     <StyledText
            //       style={{
            //         color: focused ? "white" : "gray",
            //         fontSize: 12,
            //       }}
            //     >
            //       Home
            //     </StyledText>
            //   ),
          }}
        />

        {/* Profile Screen Tab */}
        {/* <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={focused ? "person" : "person-outline"} // Dynamic icon change
                  size={22}
                  className="flex items-center"
                  color={focused ? theme.colors.onSurface : "gray"}
                />
                <Text
                  style={{
                    color: focused ? theme.colors.onSurface : "gray",
                    fontSize: 10,
                  }}
                >
                  Profile
                </Text>
              </View>
            ),
          }}
        /> */}

        <Tabs.Screen
          name="graph"
          options={{
            title: "Graphs",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 50,
                  gap: 2,
                }}
              >
                <Ionicons
                  name={focused ? "stats-chart" : "stats-chart-outline"}
                  size={22}
                  className="flex items-center"
                  color={focused ? theme.colors.onSurface : "gray"}
                />

                <Text
                  style={{
                    color: focused ? theme.colors.onSurface : "gray",
                    fontSize: 10,
                  }}
                >
                  Graphs
                </Text>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="(settings)"
          options={{
            title: "Settings",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 50,
                  gap: 2,
                }}
              >
                <Ionicons
                  name={focused ? "settings" : "settings-outline"} // Dynamic icon change
                  size={22}
                  className="flex items-center"
                  color={focused ? theme.colors.onSurface : "gray"}
                />
                <Text
                  style={{
                    color: focused ? theme.colors.onSurface : "gray",
                    fontSize: 10,
                  }}
                >
                  Settings
                </Text>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="(settings)/vehicle"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="(reports)"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="(reports)/form"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
