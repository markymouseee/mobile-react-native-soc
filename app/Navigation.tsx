// Navigation.tsx
import { useAuth } from '@/contexts/AuthContext';
import { PostProvider } from '@/contexts/PostContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ConfirmEmail from './(auth)/ConfirmEmail';
import Login from './(auth)/login';
import Register from './(auth)/register';
import NewsFeedScreen from './(tabs)/AppNavigator';
import EditProfile from './screens/_edit_profile';
import ExploreScreen from './screens/_explore_screen';
import Profile from './screens/_profile';
import { ProfileSetup } from './screens/_profile_setup';
import Settings from './screens/_settings';
import VisitProfile from './screens/_visit_profile';
import type { RootStackParamList } from './TypeScript/types';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
    const { isLoggedIn } = useAuth();

    return (
        <PostProvider>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isLoggedIn ? (
                    <>
                        <Stack.Screen name="NewsFeed" component={NewsFeedScreen} />
                        <Stack.Screen name="Profile" component={Profile} />
                        <Stack.Screen name="EditProfile" component={EditProfile} />
                        <Stack.Screen name="Settings" component={Settings} />
                        <Stack.Screen name="VisitProfile" component={VisitProfile} />
                        <Stack.Screen name='ExploreScreen' component={ExploreScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="ConfirmEmail" component={ConfirmEmail} />
                        <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
                        <Stack.Screen name="Register" component={Register} />
                    </>
                )}
            </Stack.Navigator>
        </PostProvider>
    );
}
