import { FontAwesome } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import HomeScreen from "./index";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: "#0c1021", borderTopColor: "#1a1d2e" },
          tabBarActiveTintColor: "#8d03f2",
          tabBarInactiveTintColor: "#64748b",
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => <FontAwesome name="home" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Explore"
          component={() => <></>}
          options={{
            tabBarIcon: ({ color, size }) => <FontAwesome name="search" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={() => <></>}
          options={{
            tabBarIcon: ({ color, size }) => <FontAwesome name="user" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    
  );
}
