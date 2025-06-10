// Navigation.tsx
import { useAuth } from '@/contexts/AuthContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ConfirmEmail from './(auth)/ConfirmEmail';
import LoginScreen from './(auth)/login';
import Register from './(auth)/register';
import NewsFeedScreen from './(tabs)/AppNavigator';
import Profile from './screens/_profile';
import { ProfileSetup } from './screens/_profile_setup';
import type { RootStackParamList } from './TypeScript/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
    const { isLoggedIn } = useAuth();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
                <>
                    <Stack.Screen name="NewsFeed" component={NewsFeedScreen} />
                    <Stack.Screen name="Profile" component={Profile} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="ConfirmEmail" component={ConfirmEmail} />
                    <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
                    <Stack.Screen name="Register" component={Register} />
                </>
            )}
        </Stack.Navigator>
    );
}
