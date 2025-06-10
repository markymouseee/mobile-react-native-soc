import { BASE_URL } from "@/api/url";
import { RootStackParamList } from '@/app/TypeScript/types';
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Image, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

interface userProps {
    id: number;
}

export default function UploadModal({ modalVisible, setModalVisible }: any) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [user, setUser] = useState<userProps>({
        id: 0,
    })

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

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access media library is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user.id.toString());
            formData.append('title', title);
            formData.append('body', body);

            if (imageUri) {
                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename ?? '');
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('image', {
                    uri: imageUri,
                    name: filename,
                    type,
                } as any);
            }

            const response = await fetch(`${BASE_URL}/api/create-post`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                navigation.push('NewsFeed');
            } else {
                console.error("Validation errors:", data.errors || data.message);
            }
        } catch (error) {
            console.error("Error uploading post:", error);
        }
    };


    return (
        <Modal
            animationType="slide"
            transparent
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-[#1a1d2e] pt-3 pb-6 px-5 rounded-t-3xl">

                    <View className="flex-row justify-between items-center mb-3">
                        <View className="w-10" />
                        <Text className="text-white text-lg font-bold">Create Post</Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="w-10 h-10 items-center justify-center"
                        >
                            <Feather name="x" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="h-[1px] bg-[#2c2f46] mb-4" />

                    {imageUri && (
                        <Image
                            source={{ uri: imageUri }}
                            className="w-full h-56 rounded-xl mb-4"
                            style={{
                                shadowColor: "#000",
                                shadowOpacity: 0.4,
                                shadowRadius: 8,
                                shadowOffset: { width: 0, height: 3 },
                            }}
                            resizeMode="cover"
                        />
                    )}

                    <TouchableOpacity
                        onPress={pickImage}
                        className="bg-[#6900af] py-3 rounded-full mb-4 flex-row items-center justify-center gap-2"
                    >
                        <FontAwesome name="camera" color="white" size={20} />
                        <Text className="text-center text-gray-300 font-semibold text-base">
                            {imageUri ? "Change Image" : "Upload Image"}
                        </Text>
                    </TouchableOpacity>


                    <TextInput
                        placeholder="Title"
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

                    <View className="flex-row justify-between px-1">
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text className="text-red-400 font-medium text-base">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleUpload} >
                            <Text
                                className="font-semibold text-base text-purple-500"

                            >
                                Post
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
