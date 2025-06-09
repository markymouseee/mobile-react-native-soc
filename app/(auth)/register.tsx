import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

import { BASE_URL } from "@/api/url";
import TermsPrivacyModal from "@/components/TermsPrivacyModal";
import { router } from "expo-router";

interface RegisterProps {
    fullname: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function Register() {
    const [formData, setFormData] = useState<RegisterProps>({
        fullname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const errorOpacity = useRef(new Animated.Value(0)).current;
    const errorTranslateY = useRef(new Animated.Value(-10)).current;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dots, setDots] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'terms' | 'privacy'>('terms');

    useEffect(() => {
        const dotCycle = ['.', '..', '...'];
        let index = 0;

        const interval = setInterval(() => {
            setDots(dotCycle[index]);
            index = (index + 1) % dotCycle.length;
        }, 500);

        return () => clearInterval(interval);
    }, []);


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

        if (!formData.fullname || !formData.email || !formData.password || !formData.confirmPassword) {
            setIsLoading(false);
            triggerErrorAnimation();
            setErrorMessage('All fields are required');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setIsLoading(false);
            triggerErrorAnimation();
            setErrorMessage('Passwords do not match');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/register-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.fullname,
                    email: formData.email,
                    password: formData.password,
                    password_confirmation: formData.confirmPassword,
                }),
            })

            const data = await response.json();

            if (response.ok) {
                const user = data.user;

                setIsLoading(false);
                try {
                    const confirmEmailResponse = await fetch(`${BASE_URL}/api/request-confirm-email`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify({
                            user: user
                        })
                    })

                    const dataRes = await confirmEmailResponse.json();

                    if (confirmEmailResponse.ok) {
                        router.push('/(auth)/ConfirmEmail');
                    } else {
                        console.error(dataRes);
                    }
                } catch (error) {
                    console.error(error);
                }
            } else {
                if (data.errors) {
                    const errorMessages = Object.values(data.errors);
                    const firstError = Array.isArray(errorMessages[0]) ? errorMessages[0][0] : errorMessages[0];
                    setErrorMessage(firstError);
                    triggerErrorAnimation();
                    setIsLoading(false);
                } else {
                    setErrorMessage(data.message || 'An error occurred');
                    triggerErrorAnimation();
                    setIsLoading(false);
                }
            }
        } catch (error) {
            setErrorMessage('Network error. Please try again.' + error);
            triggerErrorAnimation();
            setIsLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#0c1021' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="items-center mb-5">
                        <Image
                            source={require('../../assets/images/icon.png')}
                            className="w-32 h-20"
                            resizeMode="contain"
                        />
                    </View>

                    <Text className="text-3xl font-poppins text-center text-purple-500 mb-2 tracking-wide">
                        Sign up to <Text className="text-green-400 font-bold">Vibio</Text>
                    </Text>

                    <Text className="text-center text-green-400 mb-12 text-xs font-poppins px-8 leading-relaxed">
                        create your account to start vibing with us.
                    </Text>

                    <View className="relative mb-5">
                        <View className="absolute top-4 left-4 flex-row items-center z-10">
                            <FontAwesome name="user-circle-o" size={20} color="#a7f3d0" />
                            <View className="mx-2 h-8 w-px bg-purple-600" />
                        </View>

                        <TextInput
                            placeholder="Name"
                            placeholderTextColor="#a7f3d0"
                            keyboardType="default"
                            className="bg-darkblue-light text-green-300 font-mono border border-purple-600 rounded-lg pl-20 pr-20 px-5 py-4 text-base shadow-md"
                            onChange={(e) => {
                                setFormData({ ...formData, fullname: e.nativeEvent.text })
                                if (errorMessage) setErrorMessage('');
                            }}
                            value={formData.fullname}
                        />
                    </View>

                    <View className="relative mb-5">
                        <View className="absolute top-4 left-4 flex-row items-center z-10">
                            <Ionicons name="mail" size={20} color="#a7f3d0" />
                            <View className="mx-2 h-8 w-px bg-purple-600" />
                        </View>

                        <TextInput
                            placeholder="Email"
                            placeholderTextColor="#a7f3d0"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="bg-darkblue-light text-green-300 font-mono border border-purple-600 rounded-lg pl-20 pr-20 px-5 py-4 text-base shadow-md"
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.nativeEvent.text })
                                if (errorMessage) setErrorMessage('');
                            }}
                            value={formData.email}
                        />
                    </View>

                    <View className="relative mb-5">
                        <View className="absolute top-4 left-4 flex-row items-center z-10">
                            <Ionicons name="lock-closed-outline" size={20} color="#a7f3d0" />
                            <View className="mx-2 h-8 w-px bg-purple-600" />
                        </View>

                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#a7f3d0"
                            autoCapitalize="none"
                            secureTextEntry={!showPassword}
                            className="bg-darkblue-light text-green-300 font-mono border border-purple-600 rounded-lg pl-20 pr-20 px-5 py-4 text-base shadow-md"
                            onChange={(e) => {
                                setFormData({ ...formData, password: e.nativeEvent.text })
                                if (errorMessage) setErrorMessage('');
                            }}
                            value={formData.password}
                        />

                        <View className='absolute top-4 right-5 flex-row items-center z-10'>
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={21}
                                    color="#a7f3d0"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="relative">
                        <View className="absolute top-4 left-4 flex-row items-center z-10">
                            <Ionicons name="lock-closed-outline" size={20} color="#a7f3d0" />
                            <View className="mx-2 h-8 w-px bg-purple-600" />
                        </View>

                        <TextInput
                            placeholder="Re-type password"
                            placeholderTextColor="#a7f3d0"
                            autoCapitalize="none"
                            secureTextEntry={!showPassword}
                            className="bg-darkblue-light text-green-300 font-mono border border-purple-600 rounded-lg pl-20 pr-20 px-5 py-4 text-base shadow-md"
                            onChange={(e) => {
                                setFormData({ ...formData, confirmPassword: e.nativeEvent.text })
                                if (errorMessage) setErrorMessage('');
                            }}
                            value={formData.confirmPassword}
                        />

                        <View className='absolute top-4 right-5 flex-row items-center z-10'>
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={21}
                                    color="#a7f3d0"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="flex-row justify-center items-center py-4">
                        <Text className="text-green-200 text-center text-sm">
                            By continuing, you agree to our{' '}
                            <Text
                                className="text-purple-400 underline"
                                onPress={() => {
                                    setModalType('terms');
                                    setModalVisible(true);
                                }}
                            >
                                Terms
                            </Text>{' '}
                            and{' '}
                            <Text
                                className="text-purple-400 underline"
                                onPress={() => {
                                    setModalType('privacy');
                                    setModalVisible(true);
                                }}
                            >
                                Privacy Policy
                            </Text>
                            .
                        </Text>

                        <TermsPrivacyModal
                            visible={modalVisible}
                            contentType={modalType}
                            onClose={() => setModalVisible(false)}
                        />
                    </View>

                    {errorMessage ? (
                        <Animated.Text
                            style={{
                                opacity: errorOpacity,
                                transform: [{ translateY: errorTranslateY }],
                            }}
                            className="text-red-400 text-sm text-center font-medium"
                        >
                            {errorMessage}
                        </Animated.Text>
                    ) : null}

                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <Pressable
                            onPress={handleSubmit}
                            onPressIn={onPressIn}
                            onPressOut={onPressOut}
                            className={`bg-purple-600 rounded-lg py-4 items-center shadow-lg ${isLoading ? 'opacity-50' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (

                                <View className="flex-row items-center justify-center">
                                    <ActivityIndicator color="#a7f3d0" />
                                    <Text className="text-green-200 font-poppins text-lg ml-1">Signing up {dots}</Text>
                                </View>
                            ) : (
                                <View className="flex-row items-center justify-center">
                                    <Ionicons name="arrow-up-circle-outline" size={24} color="#a7f3d0" />
                                    <Text className="text-green-200 font-poppins text-lg ml-1">Sign up</Text>
                                </View>
                            )}
                        </Pressable>
                    </Animated.View>

                    <Pressable
                        onPress={() => router.push('/(auth)/login')}
                        className="mt-6 items-center"
                    >
                        <Text className="text-green-400 font-poppins text-sm">
                            Already have an account? <Text className="text-purple-500 underline">Sign in</Text>
                        </Text>
                    </Pressable>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}