import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform, Pressable, ScrollView,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View
} from "react-native";

interface Props {
    code: number;
    email: string;
}

export default function ConfirmEmail() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const scaleLogout = useRef(new Animated.Value(1)).current;
    const errorOpacity = useRef(new Animated.Value(0)).current;
    const errorTranslateY = useRef(new Animated.Value(-10)).current;
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [dots, setDots] = useState<string>('');
    const [formData, setFormData] = useState<Props>({
        code: 0,
        email: ''
    });

    useEffect(() => {
        const dotCycle = ['.', '..', '...'];
        let index = 0;

        const interval = setInterval(() => {
            setDots(dotCycle[index]);
            index = (index + 1) % dotCycle.length;
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const onPressLogoutIn = () => {
        Animated.spring(scaleLogout, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    }

    const onPressLogoutOut = () => {
        Animated.spring(scaleLogout, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
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

        if (formData.code === 0 || formData.code === undefined) {
            setErrorMessage('Please enter a valid confirmation code.');
            setIsLoading(false);
            triggerErrorAnimation();
            return;
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
                    <Animated.View className="flex-row items-center justify-end -mt-32 mb-20" style={{ transform: [{ scale: scaleLogout }] }}>
                        <Pressable className="flex-row items-center gap-1"
                            onPressIn={onPressLogoutIn}
                            onPressOut={onPressLogoutOut}
                            onPress={() => { }}
                        >
                            <FontAwesome name="sign-out" size={18} color="#a7f3d0" />
                            <Text className="text-green-300 font-extrabold text-base">
                                Logout
                            </Text>
                        </Pressable>
                    </Animated.View>

                    <View className="items-center mb-5">
                        <Image
                            source={require('../../assets/images/icon.png')}
                            className="w-32 h-32"
                            resizeMode="contain"
                        />
                    </View>

                    <Text className="text-purple-500 text-3xl text-center font-poppins mb-4">
                        Confirm Your Email
                    </Text>

                    <Text className="text-green-300 font-poppins mb-5 text-sm text-center leading-relaxed">
                        We have sent a confirmation code to your registered email address. Please check your inbox and click on the link to verify your account.
                        If you don’t see the email, please check your spam or junk folder.
                        If you still haven’t received it, you can request a new confirmation email.
                    </Text>

                    <View className="relative mb-5">
                        <View className="absolute top-4 left-4 flex-row items-center z-10">
                            <FontAwesome name="hashtag" size={18} color="#a7f3d0" />
                            <View className="mx-2 h-8 w-px bg-purple-600" />
                        </View>

                        <TextInput
                            placeholder="Enter the 6-digit code"
                            placeholderTextColor="#a7f3d0"
                            keyboardType="number-pad"
                            onChange={(e) => {
                                setFormData({ ...formData, code: parseInt(e.nativeEvent.text) })
                                if (errorMessage) setErrorMessage('');
                            }}
                            className="bg-darkblue-light text-green-300 font-mono border border-purple-600 rounded-lg pl-20 pr-20 px-5 py-4 text-base shadow-md"
                        />
                    </View>

                    {errorMessage ? (
                        <Animated.Text
                            style={{
                                opacity: errorOpacity,
                                transform: [{ translateY: errorTranslateY }],
                            }}
                            className="text-red-400 text-sm mb-4 text-center font-medium"
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
                                    <Text className="text-green-200 font-poppins text-lg ml-1">Confirming email {dots}</Text>
                                </View>
                            ) : (
                                <View className="flex-row items-center justify-center">
                                    <Ionicons name="arrow-up-circle-outline" size={24} color="#a7f3d0" />
                                    <Text className="text-green-200 font-poppins text-lg ml-1">Confirm email</Text>
                                </View>
                            )}
                        </Pressable>
                    </Animated.View>

                    <View className="flex-row justify-between mt-3">
                        <Text className="text-green-300 font-poppins text-sm">
                            Didn’t receive the email?
                        </Text>
                        <Text className="text-purple-500 font-poppins text-sm">
                            Resend
                        </Text>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}