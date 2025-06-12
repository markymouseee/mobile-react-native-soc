import { BASE_URL } from "@/api/url";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  UIManager,
  View
} from "react-native";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const getFormattedTime = (timestamp: any) => {
  const now = dayjs();
  const created = dayjs(timestamp);

  const diffInHours = now.diff(created, 'hour');

  if (diffInHours < 1) {
    const diffInMinutes = now.diff(created, 'minute');
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    return `${diffInMinutes} minutes ago`;
  }

  if (diffInHours < 24) {
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  }

  if (diffInHours < 48) return 'Yesterday';
  return created.format('MMMM DD, YYYY [at] h:mm a');
};

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type PostProps = {
  id: number;
  users: {
    id: number
    name: string;
    profile_picture: string;
  }
  title: string;
  body: string;
  image: string;
  likes: string;
  comments: { id: number; user: string; text: string }[];
  created_at: string;
}

export default function HomeScreen() {
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [commentModal, setCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [posts, setPosts] = useState<PostProps[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
  const [comments, setComments] = useState<any>(null);

  const flatListRef = useRef<FlatList<any>>(null);

  setTimeout(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, 100);

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const openCommentModal = (post: any) => {
    setSelectedPost(post);
    setCommentModal(true);
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/show-posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();

      const counts: { [key: string]: number } = {};
      data.forEach((post: any) => {
        counts[post.id.toString()] = post.likes.length;
      });
      setLikeCounts(counts);
      const shuffled = data.sort(() => Math.random() - 0.5);

      setPosts(shuffled);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const getCurrentUserId = async () => {
    const user = await SecureStore.getItem('userData'); // or SecureStore.getItemAsync
    return user ? JSON.parse(user).id : null;
  };


  const handlelikePost = async (postId: number) => {
    const alreadyLiked = likedPosts.includes(postId.toString());
    const currentUserId = await getCurrentUserId();
    try {
      const response = await fetch(`${BASE_URL}/api/${alreadyLiked ? 'delete-like' : 'store-like'}`, {
        method: alreadyLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: currentUserId,
          post_id: postId
        })
      })
      const data = await response.json();

      if (data.status === 'success') {
        setLikedPosts((prevLikedPosts) => [...prevLikedPosts, postId.toString()]);
        await getLikesForPosts();
        setLikeCounts((prev) => ({
          ...prev,
          [postId]: alreadyLiked ? prev[postId] - 1 : prev[postId] + 1,
        }));
      } else {
        console.error(data.message)
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  const getLikesForPosts = async () => {
    const currentUserId = await getCurrentUserId();
    try {
      const response = await fetch(`${BASE_URL}/api/get-likes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      })
      const data = await response.json();
      setLikedPosts(data
        .filter((like: any) => like.user_id === currentUserId)
        .map((like: any) => like.post_id.toString())
      );
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/show-comments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      setComments(data)
    } catch (error) {
      console.error('Fetch error: ', error)
    }
  }

  useEffect(() => {
    fetchComments();
  }, [])

  const handleCommentSubmit = async (postId: number) => {
    const currentUserId = await getCurrentUserId();
    try {
      const response = await fetch(`${BASE_URL}/api/store-comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: currentUserId,
          post_id: postId,
          content: comment,
        })
      })

      const data = await response.json();

      if (data.status === 'success') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        fetchComments();
        setComment('');
      }

    } catch (error) {
      console.error("Something went wrong!", error)
    }
  }

  useEffect(() => {
    getLikesForPosts();
  }, [])

  const onRefresh = useCallback(async () => {
    await fetchPosts();
    await getLikesForPosts();
    await fetchComments();
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000)
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (commentModal) {
        setCommentModal(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [commentModal]);


  const renderPost = ({ item }: { item: PostProps }) => (
    <View className="bg-[#1a1d2e] rounded-xl py-4 px-4 mb-5">
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: `${BASE_URL}/images/Profile/` + item.users.profile_picture || "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?w=360" }}
          className="w-10 h-10 rounded-full mr-2"
        />
        <View>
          <Text className="text-white font-semibold text-base">{item.users.name}</Text>
          <Text className="text-[#9ca3af] text-xs">
            {getFormattedTime(item.created_at)}
          </Text>
        </View>
        <View className="ms-auto">
          <FontAwesome name="ellipsis-h" size={18} color="#9ca3af" />
        </View>
      </View>

      {item.title && (
        <Text className="text-white mb-2 font-medium text-base">
          {item.title}
        </Text>
      )}
      <Text className="text-gray-300 text-sm mb-2 leading-5">{item.body}</Text>

      {item.image && (
        <View className="rounded-xl overflow-hidden border border-[#2e2f45] my-3">
          <Image
            source={{ uri: `${BASE_URL}/images/Posts/` + item.image }}
            className="w-full h-72"
            resizeMode="cover"
          />
        </View>
      )}

      <View className="flex-row items-center mt-3 space-x-6">
        <Pressable onPress={() => {
          toggleLike(item.id.toString());
          handlelikePost(item.id);
        }}>
          <View className="flex-row items-center space-x-2 gap-1 mr-2">
            <FontAwesome
              name="heart"
              size={22}
              color={
                likedPosts.includes(item.id.toString()) ? "#e11d48" : "#9ca3af"
              }
            />
            <Text className="text-white text-sm font-poppinss">
              <Text className="text-white text-sm font-poppinss">
                {likeCounts[item.id.toString()] ?? 0}
              </Text>
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={() => openCommentModal(item)}>
          <Feather name="message-circle" size={22} color="#9ca3af" />
        </Pressable>
      </View>

      <View className="mt-2">
        <Text
          onPress={() => openCommentModal(item)}
          className="text-gray-400 text-sm"
        >
          View all {item.comments?.length ?? 0}{" "}
          {item.comments?.length === 1 ? "comment" : "comments"}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0c1021" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
        >
          <View className="flex-1 px-5 pt-10">
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPost}
              contentContainerStyle={{ paddingBottom: 100 }}
            />

            <Modal visible={commentModal} animationType="slide" transparent>
              <TouchableWithoutFeedback onPress={() => setCommentModal(false)}>
                <View className="flex-1 bg-black/40 justify-end">
                  <TouchableWithoutFeedback onPress={() => { }}>
                    <View className="bg-[#1a1d2e] p-5 rounded-t-2xl max-h-[80%]">

                      <View className="items-center py-2">
                        <View className="w-12 h-1.5 bg-gray-600 rounded-full" />
                      </View>

                      <Text className="text-white text-base mb-3 font-semibold">
                        Comments on {selectedPost?.users?.name}&#39;s post
                      </Text>

                      <View className="mb-4 max-h-60">
                          {comments?.length > 0 ? (
                            <FlatList
                              scrollEnabled={true}
                              ref={flatListRef}
                              data={comments}
                              keyExtractor={(item) => item.id}
                              renderItem={({ item }) => (
                                <Animated.View style={{ opacity: 1 }}>
                                  <View className="flex-row items-start mb-5 space-x-3">
                                    <View className="w-10 h-10 rounded-full items-center justify-center mr-2 ml-2">
                                      <Image
                                        source={{
                                          uri: item.users.profile_picture
                                            ? `${BASE_URL}/images/Profile/${item.users.profile_picture}`
                                            : "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?w=360"
                                        }}
                                        className="w-10 h-10 rounded-full mr-2"
                                      />
                                    </View>
                                    <View className="flex-1">
                                      <View className="bg-[#2a2e3e] rounded-xl px-4 py-3">
                                        <Text className="text-white font-semibold text-sm">
                                          {item.users?.name ?? 'Unknown'}
                                        </Text>
                                        <Text className="text-gray-300 text-sm mt-1">
                                          {item.content}
                                        </Text>
                                      </View>
                                      <View className="flex-row mt-1 space-x-4 px-1 gap-2">
                                        <Text className="text-gray-400 text-xs">
                                          {getFormattedTime(item.created_at)}
                                        </Text>
                                        <Pressable>
                                          <Text className="text-gray-400 text-xs font-semibold">Like</Text>
                                        </Pressable>
                                        <Pressable>
                                          <Text className="text-gray-400 text-xs font-semibold">Reply</Text>
                                        </Pressable>
                                      </View>
                                    </View>
                                  </View>
                                </Animated.View>
                              )}
                              contentContainerStyle={{ paddingBottom: 20 }}
                              showsVerticalScrollIndicator={false}
                            />

                          ) : (
                            <Text className="text-gray-400 italic">No comments yet.</Text>
                          )}
                      </View>


                      <View className="flex-row items-center space-x-3 gap-2">
                        <TextInput
                          placeholder="Add a comment..."
                          placeholderTextColor="#aaa"
                          className="flex-1 bg-[#2a2e3e] text-white px-4 py-3 rounded-full"
                          value={comment}
                          onChangeText={setComment}
                          multiline
                        />
                        <Pressable
                          onPress={() => {
                            handleCommentSubmit(selectedPost.id)
                          }}
                        >
                          <Ionicons name="send" size={22} color="#8f00ff" />
                        </Pressable>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
