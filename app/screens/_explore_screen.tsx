import { BASE_URL } from "@/api/url";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import * as SecureStore from "expo-secure-store";

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { RootStackParamList } from '../TypeScript/types';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const getFormattedTime = (timestamp: any) => {
    const now = dayjs();
    const created = dayjs(timestamp);

    const diffInHours = now.diff(created, 'hour');

    if (diffInHours < 1) {
        const diffInMinutes = now.diff(created, 'minute');
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes === 1) return '1 minute ago';
        return `${diffInMinutes} minutes ago`;
    }

    if (diffInHours < 24) {
        if (diffInHours === 1) return '1 hour ago';
        return `${diffInHours} hours ago`;
    }

    if (diffInHours < 48) return 'Yesterday';
    return created.format('MMMM DD, YYYY [at] h:mm a');
};


const screenWidth = Dimensions.get("window").width;
const numColumns = 3;
const imageSize = screenWidth / numColumns;

type Post = {
    id: string;
    title: string;
    image: string;
    body?: string;
    users: {
        id: number;
        name: string;
        username: string;
        profile_picture?: string;
    };
    comments: any[];
    likes: any[];
    created_at: string;
};

export default function ExploreScreen() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [search, setSearch] = useState('');
    const [accounts, setAccounts] = useState<typeof posts[0]["users"][]>([]);
    const [showResults, setShowResults] = useState(false);

    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/show-posts`);
            const json = await res.json();
            setPosts(json);
            setFilteredPosts(json);
        } catch (err) {
            console.error("Failed to fetch posts", err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPosts();
        }, [])
    );

    const getCurrentUserId = async () => {
        const user = await SecureStore.getItem('userData');
        return user ? JSON.parse(user).id : null;
    };


    useEffect(() => {
        const fetchCurrentUser = async () => {
            const id = await getCurrentUserId();
            setCurrentUserId(id);
        };
        fetchCurrentUser();
    }, []);

    const handleSearch = (text: string) => {
        setSearch(text);
        setShowResults(true);

        if (!text.trim()) {
            setAccounts([]);
            return;
        }

        const lower = text.toLowerCase();

        const matchedUsers = posts
            .map((post) => post.users)
            .filter(
                (user, index, self) =>
                    (user.username.toLowerCase().includes(lower) ||
                        user.name?.toLowerCase().includes(lower)) &&
                    index === self.findIndex((u) => u.username === user.username)
            );

        setAccounts(matchedUsers);
    };



    const openModal = (post: Post) => {
        setSelectedPost(post);
        setModalVisible(true);
    };

    const renderItem = ({ item }: { item: Post }) => (
        <TouchableOpacity
            key={item.id}
            className="p-[0.5px]"
            onPress={() => openModal(item)}
        >
            <Image
                source={{ uri: `${BASE_URL}/images/Posts/` + item.image }}
                style={{ width: imageSize, height: imageSize }}
                className="rounded-sm"
                resizeMode="cover"
            />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#0c1021]">
                <ActivityIndicator size="large" color="#888" />
                <Text className="text-white text-lg font-poppins mt-4">Loading data</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#0c1021] px-2">
            <View className="relative py-2">
                <TextInput
                    value={search}
                    onChangeText={handleSearch}
                    placeholder="Search"
                    className="border border-gray-500 text-white px-4 py-2 rounded-xl"
                    placeholderTextColor="#a7f3d0"
                    onFocus={() => setShowResults(true)}
                />

                {showResults && accounts.length > 0 && (
                    <View className="absolute top-14 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-xl shadow-xl max-h-72">
                        <ScrollView className="p-2">
                            {accounts.map((user, idx) => {
                                if (user.id === currentUserId) return null;

                                return (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => {
                                            navigation.navigate('VisitProfile', { users: user });
                                            setShowResults(false);
                                        }}
                                        className="flex-row items-center space-x-3 px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <View className="flex-row gap-2 items-center rounded-md">
                                            <Image
                                                source={{
                                                    uri: user.profile_picture
                                                        ? `${BASE_URL}/images/Profile/${user.profile_picture}`
                                                        : "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?w=360"
                                                }}
                                                className="w-10 h-10 rounded-full"
                                            />

                                            <View>
                                                <Text className="text-black dark:text-white font-semibold">
                                                    {user.username}
                                                </Text>
                                                {user.name && (
                                                    <Text className="text-gray-500 font-poppins dark:text-gray-400 text-sm">
                                                        {user.name}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}

                        </ScrollView>
                    </View>
                )}
            </View>

            {
                filteredPosts.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-gray-400 text-base">No posts found.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredPosts}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        numColumns={numColumns}
                        showsVerticalScrollIndicator={false}
                    />
                )
            }

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 bg-black opacity-80 justify-center items-center px-4">
                    <View className="bg-[#0c1021] rounded-2xl w-full max-h-[90%] overflow-hidden">
                        <ScrollView>
                            <Image
                                source={{ uri: `${BASE_URL}/images/Posts/${selectedPost?.image}` }}
                                className="w-full h-80"
                                resizeMode="cover"
                            />
                            <View className="p-4 space-y-2">
                                <TouchableOpacity
                                    disabled={selectedPost?.users.id === currentUserId}
                                    onPress={() => {
                                        navigation.navigate('VisitProfile', { users: selectedPost?.users })
                                        setModalVisible(false)
                                    }}

                                    className="flex-row mb-3"
                                >
                                    <Image
                                        source={{
                                            uri: selectedPost?.users.profile_picture
                                                ? `${BASE_URL}/images/Profile/` + selectedPost.users.profile_picture
                                                : "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?w=360",
                                        }}
                                        className="w-10 h-10 rounded-full mr-2"
                                    />

                                    <View>
                                        <Text className={`${selectedPost?.users.id === currentUserId ? "text-white" : "text-green-300"} font-semibold text-base`}>{selectedPost?.users.name}</Text>
                                        <Text className="text-[#9ca3af] text-xs">
                                            {getFormattedTime(selectedPost?.created_at)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                {selectedPost?.title && (
                                    <Text className="text-xl font-bold text-black dark:text-white">
                                        {selectedPost.title}
                                    </Text>
                                )}

                                {selectedPost?.body && (
                                    <Text className="text-base text-gray-700 dark:text-gray-300">
                                        {selectedPost.body}
                                    </Text>
                                )}

                                <View className="flex-row justify-between mt-2">
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                                        ❤️ {selectedPost?.likes.length} Likes
                                    </Text>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                                        💬 {selectedPost?.comments.length} Comments
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="absolute top-3 right-4"
                        >
                            <FontAwesome name="close" size={24} color={"white"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View >
    );
}
