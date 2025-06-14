import { BASE_URL } from "@/api/url";
import { usePostContext } from "@/contexts/PostContext";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import SuccessErrorModal from "./SuccessErrorModal";

export default function EditPostModal({ post, visible, setShow }: any) {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [postId, setPostId] = useState('')
    const [loading, setLoading] = useState<boolean>(false);
    const { triggerRefresh } = usePostContext();
    const [showSuccessErrorModal, setShowSuccessErrorModal] = useState(false);
    const [successErrorModalMessage, setSuccessErrorModalMessage] = useState('');

    useEffect(() => {
        if (post) {
            setTitle(post.title || '');
            setBody(post.body || '');
            setPostId(post.id || '');
        }
    }, [post]);

    const handleCancel = () => setShow(false);


    if (!post) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator className="flex-1 justify-center items-center" size="large" color="white" />
                <Text className="text-white text-center">Loading...</Text>
            </View>
        );
    }

    const handleUpdatePost = async (postId: string) => {
        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/api/update-post/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    body: body,
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                setLoading(false);
                setShow(false);
                triggerRefresh();
            } else {
                setLoading(false);
                setSuccessErrorModalMessage(data.message);
                setShowSuccessErrorModal(true)
            }

        } catch (error) {
            console.error("Failed to updated post", error)
        }
    }

    return (
        <>
            <SuccessErrorModal show={showSuccessErrorModal} setShow={setShowSuccessErrorModal} message={successErrorModalMessage} />
            <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={() => setShow(false)}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View className="flex-1 bg-black/50 justify-center items-center px-4">
                                <View className="bg-[#0c1021] rounded-2xl w-full py-5 px-5 max-h-[100%] overflow-hidden">
                                    <View className="flex-row justify-between">
                                        <Text className="text-white text-2xl font-bold mb-4">
                                            Edit Post
                                        </Text>
                                        <TouchableOpacity onPress={handleCancel}>
                                            <Feather name="x" size={24} color={"#ffff"} />
                                        </TouchableOpacity>
                                    </View>
                                    <View className="mb-6">
                                        <Image source={{ uri: `${BASE_URL}/images/Posts/${post.image}` }} className="w-full h-72 rounded-lg" />
                                    </View>
                                    <TextInput
                                        placeholder="Title (optional)"
                                        placeholderTextColor="#888"
                                        value={title}
                                        onChangeText={setTitle}
                                        className="bg-[#2a2e3e] text-white text-base rounded-xl px-4 py-3 mb-4"
                                    />

                                    <TextInput
                                        placeholder="What's on your mind?"
                                        placeholderTextColor="#888"
                                        value={body}
                                        onChangeText={setBody}
                                        multiline
                                        numberOfLines={3}
                                        className="bg-[#2a2e3e] text-white text-base rounded-xl px-4 py-6 mb-6"
                                        style={{ textAlignVertical: "top" }}
                                    />

                                    <View className="flex-row items-center justify-between">
                                        <TouchableOpacity
                                            onPress={handleCancel}
                                            className="bg-red-500 rounded-xl py-3 px-3"
                                        >
                                            <Text className="text-white font-poppins text-sm">
                                                Cancel
                                            </Text>
                                        </TouchableOpacity>

                                        {loading ? (
                                            <View className="bg-purple-300 rounded-xl py-3 px-3 flex-row gap-2">
                                                <ActivityIndicator size="small" color="#fff" />
                                                <Text className="text-white font-poppins text-sm">
                                                    Updating...
                                                </Text>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                disabled={loading}
                                                onPress={() => handleUpdatePost(postId)}
                                                className={`${loading ? 'bg-purple-300' : 'bg-purple-500'} rounded-xl py-3 px-3`}
                                            >
                                                <Text className="text-white font-poppins text-sm">
                                                    Update post
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}