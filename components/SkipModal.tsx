import { BASE_URL } from "@/api/url";
import { RootStackParamList } from '@/app/TypeScript/types';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";

export default function SkipModal({ setShowSkipModal, showSkipModal }: any) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [user, setUser] = useState<any>(null);
    const { checkLogin } = useAuth();

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
    const handleSubmit = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/skip-profile-setup`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id.toString()
                })
            })

            const data = await response.json();

            if (data.status === 'success') {
                await SecureStore.setItemAsync('token', data.token);
                await checkLogin();
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'NewsFeed' }]
                })
            } else {
                if (data.errors) {
                    Alert.alert("Error", data.errors[0].message);
                } else {
                    Alert.alert("Error", data.message);
                }
            }
        } catch (error) {
            console.error("Something went wrong", error);
        }
    }
    return (
        <Modal
            transparent
            animationType="fade"
            visible={showSkipModal}
            onRequestClose={() => setShowSkipModal(false)}
        >
            <View className="flex-1 justify-center items-center bg-black/50 px-4">
                <View className="bg-[#0c1021] px-5 py-6 rounded-2xl w-11/12 max-w-md shadow-xl">
                    <Text className="text-xl font-bold text-purple-400 text-center mb-2">
                        Skip Profile Setup?
                    </Text>
                    <Text className="text-gray-300 text-center mb-6">
                        Are you sure you want to skip this step? You can complete your profile later.
                    </Text>

                    <View className="flex-row justify-between">
                        <TouchableOpacity
                            className="flex-1 mr-2 py-2 rounded-xl bg-gray-700"
                            onPress={() => setShowSkipModal(false)}
                        >
                            <Text className="text-center text-gray-300">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 ml-2 py-2 rounded-xl bg-purple-500"
                            onPress={() => {
                                setShowSkipModal(false);
                                handleSubmit();
                            }}
                        >
                            <Text className="text-center text-white">Skip</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}