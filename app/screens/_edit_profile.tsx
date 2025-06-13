import { BASE_URL } from '@/api/url';
import DeleteProfileModal from '@/components/DeleteProfileModal';
import SuccessErrorModal from '@/components/SuccessErrorModal';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { RootStackParamList } from '../TypeScript/types';

interface Post {
    id: number;
    title: string;
    body: string;
    image: string;
}

interface Followers {
    id: number;
    user_id: number;
    follower_id: number;
    following_id: number;
}

interface userProps {
    id: number;
    name: string;
    email: string;
    username: string;
    profile_picture: string;
    bio: string;
    posts: Post[]; // ← array of posts
    followers: Followers[]; // ← array of followers
}

export default function EditProfile() {
    const [form, setForm] = useState({
        name: '',
        username: '',
        bio: '',
    });

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const errorOpacity = useRef(new Animated.Value(0)).current;
    const errorTranslateY = useRef(new Animated.Value(-10)).current;
    const [user, setUser] = useState<userProps>({
        id: 0,
        name: "",
        email: "",
        username: "",
        profile_picture: "",
        bio: "",
        posts: [],
        followers: []
    });
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');
    const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            const userDataString = await SecureStore.getItemAsync("userData");
            if (userDataString) {
                const parsed = JSON.parse(userDataString);
                setUser(parsed);
                setForm(parsed);
            }
        };
        loadUserData();
    }, []);


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

    const handleSave = async () => {
        setLoading(true);
        setErrorMessage('')

        if(!form.name){
            setLoading(false);
            setErrorMessage('Name is required');
            triggerErrorAnimation();
            return;
        }

        if(!form.username){
            setLoading(false);
            setErrorMessage('Username is required');
            triggerErrorAnimation();
            return;
        }

        if (!/^[a-z0-9_]+$/.test(form.username)) {
            setLoading(false);
            setErrorMessage('Username should only contain lowercase letters, numbers, and underscores');
            triggerErrorAnimation();
            return;
        }

        const formData = new FormData();
        formData.append('name', form.name)
        formData.append('username', form.username);
        formData.append('bio', form.bio);
        formData.append('_method', 'PUT');

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
            const response = await fetch(`${BASE_URL}/api/update-profile/${user.id}`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })

            const data = await response.json();

            if (data.status === 'success') {
                setLoading(false)
                await SecureStore.deleteItemAsync('userData')
                await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
                setUser(data.user)
                navigation.navigate('EditProfile');
                setMessage(data.message)
                setShowModal(true)
            } else {
                setLoading(false);
                setMessage(data.message)
                setShowModal(true)
            }
        } catch (error) {
            console.error("Something went wrong: ", error)
        }

        // setTimeout(() => {
        //     setLoading(false);
        //     alert('Profile updated successfully!');
        // }, 1000);
    };

    const handleDeleteProfile = async () => {
        setShowDeleteProfileModal(true);
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#0c1021' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="absolute top-10 left-4 z-10 p-2"
                    >
                        <FontAwesome name="arrow-left" size={24} color="#a7f3d0" />
                    </TouchableOpacity>

                    <Text className="text-2xl font-bold text-center text-white mb-8">
                        Edit Profile
                    </Text>

                    <View className="self-center mb-6 relative">
                        <TouchableOpacity
                            onPress={pickImage}
                            className="w-32 h-32 rounded-full bg-gray-800 items-center justify-center overflow-hidden"
                        >
                            {image ? (
                                <Image source={{ uri: image }} className="w-full h-full" />
                            ) : (
                                <Image source={{ uri: user.profile_picture ? `${BASE_URL}/images/Profile/${user.profile_picture}` : "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?w=360" }} className="w-full h-full" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={pickImage}
                            className="absolute bottom-0 right-0 bg-purple-600 w-9 h-9 rounded-full items-center justify-center border-2 border-white"
                        >
                            <FontAwesome name="camera" size={16} color="white" />
                        </TouchableOpacity>


                    </View>
                    <Text className=' flex-row text-gray-400 text-center text-sm mb-3 -mt-4'>
                        {user.email}
                    </Text>
                    <View className="relative mb-6">

                        <TextInput
                            placeholder={form.name === null ? "Name" : ''}
                            placeholderTextColor="#a7f3d0"
                            keyboardType="default"
                            className="bg-darkblue-light text-white font-mono border border-purple-600 rounded-lg   px-5 pt-6 pb-3 text-base shadow-md"
                            onChangeText={(text) => {
                                setForm({ ...form, name: text });
                                if (errorMessage) setErrorMessage('');
                            }}
                            value={form.name}
                        />
                        {form.name !== null && (
                            <Text className="absolute left-5 top-1 text-sm text-green-300 font-mono">
                                Name
                            </Text>
                        )}
                    </View>

                    <View className="relative mb-6">

                        <TextInput
                            placeholder={form.username === null ? "Username" : ''}
                            autoCapitalize="none"
                            keyboardType="default"
                            placeholderTextColor="#a7f3d0"
                            className="bg-darkblue-light text-white font-mono border border-purple-600 rounded-lg  px-5 pt-6 pb-3 text-base shadow-md"
                            onChangeText={(text) => {
                                setForm({ ...form, username: text });
                                if (errorMessage) setErrorMessage('');
                            }}
                            value={form.username}
                        />
                        {form.username !== null && (
                            <Text className="absolute left-5 top-1 text-sm text-green-300 font-mono">
                                Username
                            </Text>
                        )}
                    </View>

                    <View className="relative mb-6">

                        <TextInput
                            placeholder={form.bio === null ? "Bio" : ''}
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#a7f3d0"
                            className={`bg-darkblue-light border-purple-600 border text-white rounded-lg text-base ${form.bio !== null ? 'px-5 pt-6 pb-3' : 'px-5 py-5'}`}
                            onChangeText={(text) => setForm({ ...form, bio: text })}
                            value={form.bio}
                        />
                        {form.bio !== null && (
                            <Text className="absolute left-5 top-1 text-sm text-green-300 font-mono">
                                Bio
                            </Text>
                        )}
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

                    <SuccessErrorModal show={showModal} setShow={setShowModal} message={message} />

                    <DeleteProfileModal show={showDeleteProfileModal} setShow={setShowDeleteProfileModal}/>
                    
                    <TouchableOpacity
                        disabled={loading}
                        onPress={handleSave}
                        className="bg-purple-600 py-3 rounded-xl"
                    >
                        <Text className="text-center text-white font-bold text-base">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleDeleteProfile}>
                        <Text className="text-center text-red-500 mt-4 font-bold text-base">Delete profile picture</Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
