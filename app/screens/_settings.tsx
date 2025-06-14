import LogoutModal from "@/components/LogoutModal";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
    const navigation = useNavigation();

    const [showModal, setShowModal] = useState(false);

    const handleLogout = () => {
       setShowModal(true);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0c1021]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700 bg-[#111827]">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <FontAwesome name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Settings</Text>

                {/* ✅ This was the issue — moved comment above the tag */}
                <View style={{ width: 24 }} />
            </View>

            <LogoutModal show={showModal} setShow={setShowModal}/>
            <View className="px-4 py-6">
                {/* Change Password */}
                <TouchableOpacity
                    className="mb-6 p-4 rounded-md bg-[#1f2937]"
                >
                    <Text className="text-white text-base font-semibold">Change Password</Text>
                    <Text className="text-gray-400 text-sm">Update your current password</Text>
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="p-4 rounded-md bg-red-600"
                >
                    <Text className="text-white text-base font-semibold text-center">Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
