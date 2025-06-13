import { BASE_URL } from '@/api/url';
import { RootStackParamList } from '@/app/TypeScript/types';
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import SuccessErrorModal from './SuccessErrorModal';

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

export default function DeleteProfileModal({ show, setShow }: any) {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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

    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

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


    const handleDelete = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/delete-profile/${user.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": 'application/json',
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (data.status === 'success') {
                await SecureStore.deleteItemAsync('userData')
                await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
                setUser(data.user);
                setMessage(data.message)
                setShowSuccess(true);
                navigation.navigate('EditProfile');
            } else {
                setMessage(data.message)
                setShowSuccess(false);
            }

        } catch (error) {
            console.error("Failed to delete profile: ", error)
        }
    }

    return (
        <>
            <Modal
                transparent
                animationType="fade"
                visible={show}
                onRequestClose={() => setShow(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-[#0c1021] p-6 rounded-2xl w-11/12 max-w-md shadow-xl">
                        <Text className="text-xl font-bold text-purple-400 text-center mb-2">
                            Delete profile
                        </Text>
                        <Text className="text-gray-300 font-poppins text-center mb-6">
                            Are you sure you want to delete your profile picture?
                        </Text>

                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                className="flex-1 mr-2 py-2 rounded-xl bg-gray-700"
                                onPress={() => setShow(false)}
                            >
                                <Text className="text-center font-poppins text-gray-300">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 ml-2 py-2 rounded-xl bg-purple-500"
                                onPress={async () => {
                                    setShow(false);
                                    handleDelete();
                                }}
                            >
                                <Text className="text-center font-poppins text-white">Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <SuccessErrorModal show={showSuccess} setShow={setShowSuccess} message={message} />
        </>
    );
}