import { BASE_URL } from "@/api/url";
import { useAuth } from "@/contexts/AuthContext";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../TypeScript/types';

const { width } = Dimensions.get("window");
const imageSize = width / 3;

interface Post {
    id: number;
    title: string;
    body: string;
    image: string;
}

interface Followers {
    id: number;
    user_id: number;
    follower_id: number;
    following_id: number;
}

interface userProps {
    id: number;
    name: string;
    email: string;
    username: string;
    profile_picture: string;
    bio: string;
    posts: Post[]; // ← array of posts
    followers: Followers[]; // ← array of followers
}
export default function Profile() {
    const [user, setUser] = useState<userProps>({
        id: 0,
        name: "",
        email: "",
        username: "",
        profile_picture: "",
        bio: "",
        posts: [],
        followers: []
    });
    const [refreshing, setRefreshing] = useState(false);

    const [currentUserProfile, setCurrentUserProfile] = useState<userProps>({
        id: 0,
        name: "",
        email: "",
        username: "",
        profile_picture: "",
        bio: "",
        posts: [],
        followers: []
    });


    const { logout } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


    useEffect(() => {
        const loadUserData = async () => {
            const userDataString = await SecureStore.getItemAsync("userData");
            if (userDataString) {
                const parsed = JSON.parse(userDataString);
                setUser(parsed);
            }
        };
        loadUserData();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/show-profile/${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setCurrentUserProfile(data);

        } catch (error) {
            console.error("Failed to load profile:", error);
        }
    };

    useEffect(() => {
        if (user?.id) {
            loadProfile();
        }
    }, [user?.id]);


    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadProfile();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, [user?.id]);


    if (!user) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <Text className="text-white">Loading profile...</Text>
            </View>
        );
    }

    const handleEditProfile = async () => {
        await logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        })
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#0c1021" }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                    <View className="px-5 pt-6">
                        <View className="flex-row items-center justify-between">

                            <Image
                                source={{
                                    uri: currentUserProfile.profile_picture
                                        ? `${BASE_URL}/images/Profile/${currentUserProfile.profile_picture}`
                                        : "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?w=360"
                                }}
                                className="w-20 h-20 rounded-full"
                            />

                            <View className="flex-row space-x-6 gap-8 px-2">
                                <View className="items-center">
                                    <Text className="text-white font-bold text-lg">{currentUserProfile.posts.length}</Text>
                                    <Text className="text-gray-400 text-sm">Posts</Text>
                                </View>
                                <Pressable onPress={() => console.log("Followers Modal")}>
                                    <View className="items-center">
                                        <Text className="text-white font-bold text-lg">{currentUserProfile.followers.length}</Text>
                                        <Text className="text-gray-400 text-sm">Followers</Text>
                                    </View>
                                </Pressable>
                                <Pressable onPress={() => console.log("Following Modal")}>
                                    <View className="items-center">
                                        <Text className="text-white font-bold text-lg">
                                            {currentUserProfile.followers.filter(f => f.follower_id === currentUserProfile.id).length}
                                        </Text>
                                        <Text className="text-gray-400 text-sm">Following</Text>
                                    </View>
                                </Pressable>
                            </View>
                        </View>

                        {/* Bio */}
                        <View className="mt-4">
                            <Text className="text-white font-poppins text-base">{currentUserProfile.name}</Text>
                            <Text className="text-white font-semibold text-base">@{currentUserProfile.username}</Text>
                            {currentUserProfile.bio && <Text className="text-gray-400 text-sm mt-1">{currentUserProfile.bio}</Text>}
                        </View>

                        <Pressable
                            className="bg-[#1a1d2e] mt-4 py-2 rounded-md items-center"
                            onPress={handleEditProfile}
                        >
                            <Text className="text-white font-semibold">Edit Profile</Text>
                        </Pressable>
                    </View>

                    <View className="border-t border-[#1a1d2e] mt-6 mb-2" />

                    {currentUserProfile.posts.length > 0 ? (
                        <FlatList
                            data={currentUserProfile.posts}
                            numColumns={3}
                            keyExtractor={(item) => item.id.toString()}
                            scrollEnabled={false}
                            contentContainerStyle={{ marginBottom: 30 }}
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            renderItem={({ item }: any) => (
                                item.image && (
                                    <Image
                                        source={{ uri: `${BASE_URL}/images/Posts/` + item.image }}
                                        style={{
                                            width: imageSize,
                                            height: imageSize,
                                            borderWidth: 0.5,
                                            borderColor: "#1a1d2e",
                                        }}
                                    />
                                )
                            )}
                        />
                    ) : (
                        <View className="flex-col justify-center items-center mt-5">
                            <Text className="text-gray-400 font-poppins text-2xl">
                                No posts yet
                            </Text>
                            <Ionicons name="camera-outline" size={40} color={"gray"} />
                        </View>
                    )}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
