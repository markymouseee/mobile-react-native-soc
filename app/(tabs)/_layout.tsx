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
}
