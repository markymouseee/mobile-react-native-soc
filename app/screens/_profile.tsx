import { BASE_URL } from "@/api/url";
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
                                source={{ uri: currentUserProfile.profile_picture || "https://scontent.fcgy1-1.fna.fbcdn.net/v/t39.30808-6/499154638_703361578724799_6308952919668520827_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeH2S_Be7dpVyFLSOpmy3A_tw0UrV9H3N0fDRStX0fc3RwIbLyHR9-5sCsuDUHycTffKCbiM11gk0zEFyBADMvr2&_nc_ohc=FoDgx9xoFwsQ7kNvwHSjYnk&_nc_oc=AdkhpGUpXHd9Z0Tc0Ue34_REAwKI4DOSC_EPUTZJwmw7wCvVPWPbmDE7L3ZrNnWAPfHO_UOdulUKrZRnn_X6QqHY&_nc_zt=23&_nc_ht=scontent.fcgy1-1.fna&_nc_gid=WXMAX7lpv2gL-2t9GQ1cKg&oh=00_AfMFeNhE1VjY3DGqZD9qt_yBrSt5dH7G_Hijs13RGYSKOw&oe=684B85A2" }}
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
                            onPress={() => console.log("Edit Profile")}
                        >
                            <Text className="text-white font-semibold">Edit Profile</Text>
                        </Pressable>
                    </View>

                    <View className="border-t border-[#1a1d2e] mt-6 mb-2" />

                    <FlatList
                        data={currentUserProfile.posts}
                        numColumns={3}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                        contentContainerStyle={{ marginBottom: 30 }}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        renderItem={({ item }) => (
                            <Image
                                source={{ uri: `${BASE_URL}/images/Posts/` + item.image }}
                                style={{
                                    width: imageSize,
                                    height: imageSize,
                                    borderWidth: 0.5,
                                    borderColor: "#1a1d2e",
                                }}
                            />
                        )}
                    />
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
