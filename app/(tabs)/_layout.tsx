import React from 'react';

import { Redirect, Slot } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import '../../global.css';

export default function TabLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Slot />
  );

  // return (
  //   <Tabs
  //     screenOptions={{
  //       tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
  //       headerShown: false,
  //       tabBarButton: HapticTab,
  //       tabBarBackground: TabBarBackground,
  //       tabBarStyle: Platform.select({
  //         ios: {
  //           // Use a transparent background on iOS to show the blur effect
  //           position: 'absolute',
  //         },
  //         default: {},
  //       }),
  //     }}>



  //      <Tabs.Screen
  //       name="index"
  //       options={{
  //         title: 'Home',
  //         tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
  //       }}
  //     />
  //     <Tabs.Screen
  //       name="explore"
  //       options={{
  //         title: 'Explore',
  //         tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
  //       }}
  //     /> 
  //   </Tabs>
  // );
}
