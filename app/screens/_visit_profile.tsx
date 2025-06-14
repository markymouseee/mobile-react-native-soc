import { BASE_URL } from "@/api/url";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { RootStackParamList } from "../TypeScript/types";

const { width } = Dimensions.get("window");
const imageSize = width / 3;

export default function VisitProfile() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { users } = route.params as { users: any };

    const [loggedInUser, setLoggedInUser] = useState<any>(null);
    const [visitedUser, setVisitedUser] = useState<any>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchVisitedUser = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/show-profile/${users.id}`);
            const data = await response.json();
            setVisitedUser(data);
        } catch (error) {
            console.error("Error fetching visited user:", error);
        }
    };

    const checkIfFollowing = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/followers-of/${users.id}`);
            const followers = await res.json();
            const isFollowed = followers.some((f: any) => f.follower_id === loggedInUser.id);
            setIsFollowing(isFollowed);
        } catch (err) {
            console.error("Error checking followers:", err);
        }
    };

    useEffect(() => {
        const getLoggedInUser = async () => {
            const storedUser = await SecureStore.getItemAsync("userData");
            if (storedUser) setLoggedInUser(JSON.parse(storedUser));
        };
        getLoggedInUser();
    }, []);

    useEffect(() => {
        if (loggedInUser && users?.id) {
            fetchVisitedUser();
            checkIfFollowing();
        }
    }, [loggedInUser, users?.id]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchVisitedUser();
        await checkIfFollowing();
        setRefreshing(false);
    }, [users?.id, loggedInUser]);

    const handleFollow = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/followers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    follower_id: loggedInUser.id,
                    followed_user_id: visitedUser.id,
                }),
            });
            if (response.ok) {
                await checkIfFollowing();
                await fetchVisitedUser();
            } else {
                const error = await response.json();
                console.warn("Follow failed:", error.message);
            }
        } catch (err) {
            console.error("Follow error:", err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (users?.id) {
                fetchVisitedUser();
            } // 👈 Refetch posts every time Home tab is focused
        }, [users?.id])
    );

    const handleUnfollow = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/followers`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    follower_id: loggedInUser.id,
                    followed_user_id: visitedUser.id,
                }),
            });
            if (response.ok) {
                await checkIfFollowing();
                fetchVisitedUser();
            } else {
                const error = await response.json();
                console.warn("Unfollow failed:", error.message);
            }
        } catch (err) {
            console.error("Unfollow error:", err);
        }
    };

    if (!visitedUser) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator />
                <Text className="text-white text-lg">Loading</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#0c1021" }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    <View className="flex-row items-center justify-between px-4 py-3 bg-[#0c1021] border-b border-gray-700">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <FontAwesome name="arrow-left" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-4xl" style={{ fontFamily: 'Pacifico-Regular' }}>Vibio</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <View className="px-5 pt-6">
                        <View className="flex-row items-center justify-between">
                            <Image
                                source={{
                                    uri: visitedUser.profile_picture
                                        ? `${BASE_URL}/images/Profile/${visitedUser.profile_picture}`
                                        : "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?w=360",
                                }}
                                className="w-20 h-20 rounded-full"
                            />

                            <View className="flex-row space-x-6 gap-8 px-2">
                                <View className="items-center">
                                    <Text className="text-white font-bold text-lg">{visitedUser.posts?.length ?? 0}</Text>
                                    <Text className="text-gray-400 text-sm">Posts</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-white font-bold text-lg">
                                        {visitedUser.followers?.filter((f: any) => f.followed_user_id === visitedUser.id).length ?? 0}
                                    </Text>
                                    <Text className="text-gray-400 text-sm">Followers</Text>
                                </View>

                                <View className="items-center">
                                    <Text className="text-white font-bold text-lg">
                                        {visitedUser.following.length}
                                    </Text>
                                    <Text className="text-gray-400 text-sm">Following</Text>
                                </View>

                            </View>
                        </View>

                        <View className="mt-4">
                            <Text className="text-white font-poppins text-base">{visitedUser.name}</Text>
                            <Text className="text-white font-semibold text-base">@{visitedUser.username}</Text>
                            {visitedUser.bio && <Text className="text-gray-400 text-sm mt-1">{visitedUser.bio}</Text>}
                        </View>

                        <TouchableOpacity
                            onPress={isFollowing ? handleUnfollow : handleFollow}
                            className={`mt-4 py-2 rounded-md items-center ${isFollowing ? "bg-red-500" : "bg-purple-500"}`}
                        >
                            <Text className="text-white font-semibold">
                                {isFollowing ? "Unfollow" : "Follow"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="border-t border-[#1a1d2e] mt-6 mb-2" />

                    {visitedUser.posts?.some((post: any) => post.image) ? (
                        <FlatList
                            data={visitedUser.posts.filter((p: any) => p.image)}
                            numColumns={3}
                            keyExtractor={(item) => item.id.toString()}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: `${BASE_URL}/images/Posts/${item.image}` }}
                                    style={{
                                        width: imageSize,
                                        height: imageSize,
                                        borderWidth: 0.5,
                                        borderColor: "#1a1d2e",
                                    }}
                                />
                            )}
                        />
                    ) : (
                        <View className="flex-col justify-center items-center mt-5">
                            <Text className="text-gray-400 font-poppins text-2xl">No posts yet</Text>
                            <Ionicons name="camera-outline" size={40} color="gray" />
                        </View>
                    )}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
