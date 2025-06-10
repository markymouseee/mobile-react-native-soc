import { BASE_URL } from '@/api/url';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { RootStackParamList } from '../TypeScript/types';

type Form = {
    username: string,
}

export const ProfileSetup = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [form, setForm] = useState<Form>({
        username: ''
    })
    const [errors, setErrors] = useState<any>(null);
    const errorOpacity = useRef(new Animated.Value(0)).current;
    const errorTranslateY = useRef(new Animated.Value(-10)).current;
    const [image, setImage] = useState<string | null>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [dots, setDots] = useState('');
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState<string>('');

    const { checkLogin } = useAuth();

    useEffect(() => {
        const dotCycle = ['.', '..', '...'];
        let index = 0;

        const interval = setInterval(() => {
            setDots(dotCycle[index]);
            index = (index + 1) % dotCycle.length;
        }, 500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loadUserData = async () => {
            const userDataString = await SecureStore.getItemAsync("userData");
            if (userDataString) {
                const parsed = JSON.parse(userDataString);
                setUser(parsed);
                if (parsed?.name) {
                    setName(parsed.name);
                }
            }
        };
        loadUserData();
    }, []);

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera roll access is required!');
            }
        })();
    }, []);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
            console.error(error);
        }
    };

    const onPressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const triggerErrorAnimation = () => {
        errorOpacity.setValue(0);
        errorTranslateY.setValue(-10);

        Animated.parallel([
            Animated.timing(errorOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(errorTranslateY, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        if (form.username === '') {
            setIsLoading(false);
            setErrors('Username is required')
            triggerErrorAnimation();
            return;
        }
        const formData = new FormData();

        formData.append('user_id', user.id.toString());
        formData.append('username', form.username);

        if (image) {
            const filename = image.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : 'image';

            formData.append('profile_picture', {
                uri: image,
                name: filename,
                type,
            } as any)
        }

        try {
            const response = await fetch(`${BASE_URL}/api/profile-setup`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const data = await response.json();

            if (data.status === 'success') {
                setIsLoading(false)
                await SecureStore.setItemAsync('token', data.token);
                await checkLogin();
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'NewsFeed' }],
                })
            } else {
                if (data.errors) {
                    setIsLoading(false)
                    setErrors(data.errors);
                } else {
                    setIsLoading(false)
                    setErrors(data.message)
                }
            }
        } catch (error) {
            setIsLoading(false)
            console.error("Something went wrong!", error)
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#0c1021" }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="px-5 pt-6">
                        <Text className="text-4xl text-center text-purple-500 mb-2 tracking-wide" style={{ fontFamily: "Pacifico-Regular" }}>
                            Welcome to Vibio
                        </Text>

                        <Text className="text-sm text-green-300 font-poppins text-center mb-8">
                            Hey there! <Text className='text-purple-500'>{name}</Text>. Let&#39;s get your profile ready personalize your experience to make the most of Vibio.
                        </Text>

                        <TouchableOpacity
                            onPress={pickImage}
                            className="self-center mb-2 w-32 h-32 rounded-full bg-purple-100 border-4 border-purple-400 items-center justify-center overflow-hidden shadow-md active:opacity-80"
                        >
                            {image ? (
                                <Image source={{ uri: image }} className="w-full h-full" />
                            ) : (
                                <View className="flex-col items-center justify-center">
                                    <FontAwesome name="camera" size={26} color="#7C3AED" />
                                    <Text className="text-sm text-purple-600 font-medium mt-1">
                                        Choose Photo
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text className="text-gray-500 mb-2 text-xs text-center">
                            Click the photo to upload a profile picture.
                        </Text>

                        <View className="relative mb-5">
                            <View className="absolute top-4 left-4 flex-row items-center z-10">
                                <Ionicons name="at-circle-outline" size={20} color="#a7f3d0" />
                                <View className="mx-2 h-8 w-px bg-purple-600" />
                            </View>

                            <TextInput
                                placeholder="Enter your username"
                                value={form.username}
                                onChangeText={(e) => {
                                    setForm({ ...form, username: e })
                                    if (errors) setErrors('');
                                }}
                                autoCapitalize="none"
                                keyboardType='default'
                                className="bg-darkblue-light text-green-300 font-mono border border-purple-600 rounded-lg pl-20 pr-20 px-5 py-4 text-base shadow-md"
                                placeholderTextColor="#a7f3d0"
                            />
                        </View>

                        {errors ? (
                            <Animated.Text
                                style={{
                                    opacity: errorOpacity,
                                    transform: [{ translateY: errorTranslateY }],
                                }}
                                className="text-red-400 text-sm mb-4 text-center font-medium"
                            >
                                {errors}
                            </Animated.Text>
                        ) : null}

                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <Pressable
                                onPress={handleSubmit}
                                onPressIn={onPressIn}
                                onPressOut={onPressOut}
                                className={`bg-purple-600 rounded-lg py-2 items-center shadow-lg ${isLoading ? 'opacity-50' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (

                                    <View className="flex-row items-center justify-center">
                                        <ActivityIndicator color="#a7f3d0" />
                                        <Text className="text-green-200 font-poppins text-lg ml-1">Signing in {dots}</Text>
                                    </View>
                                ) : (
                                    <View className="flex-row items-center justify-center">
                                        <Ionicons name="arrow-forward-circle-outline" size={24} color="#a7f3d0" />
                                        <Text className="text-green-200 font-poppins text-lg ml-1">Continue</Text>
                                    </View>
                                )}
                            </Pressable>
                        </Animated.View>

                        <Pressable className='flex-row items-center justify-center mt-4'>
                            <FontAwesome name='arrow-right' size={20} color="#a7f3d0" />
                            <Text className="text-green-300 font-poppins text-lg ml-1">Skip</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

export default ProfileSetup;