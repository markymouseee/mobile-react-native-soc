import { BASE_URL } from '@/api/url';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Checkbox } from 'expo-checkbox';
import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../TypeScript/types';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const errorTranslateY = useRef(new Animated.Value(-10)).current;
  const [dots, setDots] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const checkboxScale = useSharedValue(1);
  const checkboxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }));

  const linkOpacity = useSharedValue(1);
  const linkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: linkOpacity.value,
  }));

  const handleCheckboxToggle = () => {
    checkboxScale.value = withSpring(1.2, {}, () => {
      checkboxScale.value = withSpring(1);
    });
    setRememberMe((prev) => !prev);
  };

  const handleForgotPassword = () => {
    linkOpacity.value = withSpring(0.5, {}, () => {
      linkOpacity.value = withSpring(1);
    });
    router.push('/screens/_profile_setup');
  };

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

  const handleLogin = async () => {
    setErrorMessage('');
    setIsLoading(true);

    if (!email) {
      setErrorMessage('Username or email is required');
      triggerErrorAnimation();
      setIsLoading(false);
      return;
    }

    if (!password) {
      setErrorMessage('Password is required');
      triggerErrorAnimation();
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username_or_email: email,
          password: password,
        }),
      });

      const response = await res.json();


      if (response.status === 'success') {
        const token = response.token;
        const user = response.user;
        await SecureStore.setItemAsync('userData', JSON.stringify(response.user));
        setIsLoading(false);
        if (user.username === null) {
          setIsLoading(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'ProfileSetup' }],
          })
        } else {
          await login(token, user);
          setIsLoading(false);
          navigation.navigate('NewsFeed')
        }
      } else {
        if (response.errors) {
          triggerErrorAnimation();
          setErrorMessage(response.errors[0].message);
        } else {
          setIsLoading(false);
          setErrorMessage(response.message || 'Login failed. Try again.');
          triggerErrorAnimation();
          if (response.message === 'Please verify your email first.') {
            await SecureStore.setItemAsync('userData', JSON.stringify(response.user));

            try {
              const confirmEmailResponse = await fetch(`${BASE_URL}/api/request-confirm-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
                body: JSON.stringify({
                  user: response.user
                })
              })

              const dataRes = await confirmEmailResponse.json();

              if (confirmEmailResponse.ok) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'ConfirmEmail' }],
                })
              } else {
                console.error(dataRes);
              }
            } catch (error) {
              console.error(error);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
      triggerErrorAnimation();
    }
  };

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
          <View className="items-center mb-10">
            <Image
              source={require('../../assets/images/icon.png')}
              className="w-32 h-32"
              resizeMode="contain"
            />
          </View>

          <Text className="text-4xl font-poppins text-center text-purple-500 mb-2 tracking-wide">
            Welcome to Vibio
          </Text>

          <Text className="text-center text-green-400 mb-12 text-lg font-poppins px-8 leading-relaxed">
            Your coding social hub.
          </Text>

          <View className="relative mb-5">
            <View className="absolute top-4 left-4 flex-row items-center z-10">
              <Ionicons name="at-circle-outline" size={20} color="#a7f3d0" />
              <View className="mx-2 h-8 w-px bg-purple-600" />
            </View>

            <TextInput
              placeholder="Username or email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage('');
              }}
              autoCapitalize="none"
              keyboardType='default'
              className="bg-darkblue-light text-green-300 font-mono border border-purple-600 rounded-lg pl-20 pr-20 px-5 py-4 text-base shadow-md"
              placeholderTextColor="#a7f3d0"
            />
          </View>

          <View className='relative mb-4'>
            <View className='absolute top-4 left-5 flex-row items-center z-10'>
              <FontAwesome name="lock" size={21} color="#a7f3d0" />
              <View className='mx-3 h-8 w-px bg-purple-600' />
            </View>

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
              autoCapitalize='none'
              secureTextEntry={!showPassword}
              className="bg-darkblue-light text-green-300 font-mono border border-purple-600 rounded-lg pl-20 pr-20 px-5 py-4 text-base shadow-md"
              placeholderTextColor="#a7f3d0"
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

          <View className="flex-row items-center justify-between mb-4 px-1">
            <Animated.View className="flex-row items-center" style={checkboxAnimatedStyle}>
              <Checkbox
                value={rememberMe}
                onValueChange={handleCheckboxToggle}
                color={rememberMe ? '#8d03f2' : undefined}
                className="bg-darkblue-light border border-purple-600 rounded-lg"
              />
              <Text className="text-green-400 font-poppins text-sm ml-2">Remember me</Text>
            </Animated.View>

            <Animated.View style={linkAnimatedStyle}>
              <Pressable onPress={handleForgotPassword}>
                <Text className="text-purple-500 underline font-poppins text-sm">Forgot Password?</Text>
              </Pressable>
            </Animated.View>
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
              onPress={handleLogin}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              className={`bg-purple-600 rounded-lg py-4 items-center shadow-lg ${isLoading ? 'opacity-50' : ''}`}
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
                  <Text className="text-green-200 font-poppins text-lg ml-1">Sign In</Text>
                </View>
              )}
            </Pressable>
          </Animated.View>



          <Pressable
            onPress={() => router.push('/(auth)/register')}
            className="mt-6 items-center"
          >
            <Text className="text-green-400 font-poppins text-sm">
              Don’t have an account? <Text className="text-purple-500 underline">Sign up</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
