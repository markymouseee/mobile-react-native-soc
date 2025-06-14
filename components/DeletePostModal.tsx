import { BASE_URL } from '@/api/url';
import { RootStackParamList } from '@/app/TypeScript/types';
import { usePostContext } from '@/contexts/PostContext';
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import SuccessErrorModal from './SuccessErrorModal';

export default function DeletePostModal({ show, setShow, postId }: any) {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [showSuccessError, setShowSuccessError] = useState(false);
    const [message, setMessage] = useState('');
    const { triggerRefresh } = usePostContext();

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/delete-post/${postId}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })

            const data = await response.json();

            if (data.status === 'success') {
                await fetch(`${BASE_URL}/api/show-posts`)
                setShow(false);
                setMessage(data.message);
                setShowSuccessError(true);
                 triggerRefresh();
            }else{
                setShow(false);
                setMessage(data.message);
                setShowSuccessError(true);
            }
        } catch (error) {
            console.error("Failed to delete post: ", error)
        }
    }

    return (
        <>
            <SuccessErrorModal show={showSuccessError} setShow={setShowSuccessError} message={message} />
            <Modal
                transparent
                animationType="fade"
                visible={show}
                onRequestClose={() => setShow(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-[#0c1021] p-6 rounded-2xl w-11/12 max-w-md shadow-xl">
                        <Text className="text-xl font-bold text-purple-400 text-center mb-2">
                            Delete post
                        </Text>
                        <Text className="text-gray-300 font-poppins text-center mb-6">
                            Are you sure you want to delete this post?
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
                                    handleSubmit();
                                }}
                            >
                                <Text className="text-center font-poppins text-white">Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}