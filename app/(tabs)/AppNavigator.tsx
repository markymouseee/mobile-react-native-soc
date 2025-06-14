import UploadModal from "@/components/UploadModal";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Profile from "../screens/_profile";
import { RootStackParamList } from '../TypeScript/types';
import HomeScreen from "./index";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ExploreScreen from "../screens/_explore_screen";

const Tab = createBottomTabNavigator();


const UploadTabBarButton = (props: any) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  return (
    <>
      <TouchableOpacity
        {...props}
        onPress={() => setModalVisible((prev) => !prev)}
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: [{ translateX: -30 }],
          width: 60,
          height: 60,
          backgroundColor: '#8d03f2',
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Feather name={modalVisible ? "x" : "plus"} size={26} color="#fff" />
      </TouchableOpacity>

      <UploadModal modalVisible={modalVisible} setModalVisible={setModalVisible} />
    </>
  );
};

export default function AppNavigator() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const CustomHeader = () => (
    <View className="bg-[#0c1021] pt-5 px-4 pb-2 border-b border-[#1a1d2e] flex-row items-center justify-between">
      <View className="flex-row items-center space-x-2">
        <Text
          className="text-white text-4xl tracking-wide ml-2"
          style={{ fontFamily: "Pacifico-Regular" }}
        >
          Vibio
        </Text>
      </View>

      {/* Top Bar */}
      <View className="ms-auto mt-3 flex-row gap-2">
        <FontAwesome name="send" size={25} color="white" />
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={25} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <Tab.Navigator
      screenOptions={{
        header: () => <CustomHeader />,
        tabBarStyle: {
          backgroundColor: "#0c1021",
          borderTopColor: "#1a1d2e",
        },
        tabBarActiveTintColor: "#8d03f2",
        tabBarInactiveTintColor: "#64748b",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="search" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Upload"
        component={() => null}
        options={{
          tabBarLabel: "",
          tabBarIcon: () => null,
          tabBarButton: () => <UploadTabBarButton />
        }}
      />


      <Tab.Screen
        name="Notifications"
        component={() => (
          <View className="flex-1 justify-center items-center bg-[#0c1021]">
            <Text className="text-white text-lg">Notifications</Text>
          </View>
        )}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="heart" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
