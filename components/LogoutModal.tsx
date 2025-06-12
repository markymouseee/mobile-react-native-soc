import { RootStackParamList } from '@/app/TypeScript/types';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

export default function LogoutModal({ show, setShow }: any) {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }]
        })
    }

    return (
        <Modal
            transparent
            animationType="fade"
            visible={show}
            onRequestClose={() => setShow(false)}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-[#0c1021] p-6 rounded-2xl w-11/12 max-w-md shadow-xl">
                    <Text className="text-xl font-bold text-purple-400 text-center mb-2">
                        Logout
                    </Text>
                    <Text className="text-gray-300 font-poppins text-center mb-6">
                        Are you sure you want to logout?
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
                                handleLogout();
                            }}
                        >
                            <Text className="text-center font-poppins text-white">Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}