import { BASE_URL } from "@/api/url";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
} from "react-native";

// const posts = [
//   {
//     id: "1",
//     user: "John Doe",
//     profile:
//       "https://images.pexels.com/photos/14653174/pexels-photo-14653174.jpeg",
//     title: "Workout Complete 💪",
//     body: "Feeling great after a morning session!",
//     image:
//       "https://images.theconversation.com/files/638815/original/file-20241216-15-zor5sz.jpg?ixlib=rb-4.1.0&rect=7%2C0%2C5141%2C3149&q=20&auto=format&w=320&fit=clip&dpr=2&usm=12&cs=strip",
//     likes: 20,
//     comments: [
//       { id: 1, user: "John", text: "Nice post!" },
//       { id: 2, user: "Anna", text: "Awesome 🎉" },
//     ],
//   },
//   {
//     id: "2",
//     user: "Jane Smith",
//     profile:
//       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6Hb5xzFZJCTW4cMqmPwsgfw-gILUV7QevvQ&s",
//     title: "Nature Walk 🌳",
//     body: "Peaceful moments on today’s walk.",
//     image:
//       "https://www.plt.org/wp-content/uploads/2018/03/nature-walk-activities.jpg",
//     likes: 20,
//     comments: [
//       { id: 1, user: "John", text: "Nice post!" },
//       { id: 2, user: "Anna", text: "Awesome 🎉" },
//     ],
//   },
// ];

type PostProps = {
  id: number;
  users: {
    name: string;
    profile_picture: string;
  }
  title: string;
  body: string;
  image: string;
  likes: number;
  comments: { id: number; user: string; text: string }[];
}

export default function HomeScreen() {
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [commentModal, setCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [posts, setPosts] = useState<PostProps[]>([])

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

  useEffect(() => {

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
        setPosts(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
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
      <View className="flex-row items-center">
        <Image
          source={{ uri: item.users.profile_picture || "https://scontent.fcgy1-1.fna.fbcdn.net/v/t39.30808-6/499154638_703361578724799_6308952919668520827_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeH2S_Be7dpVyFLSOpmy3A_tw0UrV9H3N0fDRStX0fc3RwIbLyHR9-5sCsuDUHycTffKCbiM11gk0zEFyBADMvr2&_nc_ohc=FoDgx9xoFwsQ7kNvwHSjYnk&_nc_oc=AdkhpGUpXHd9Z0Tc0Ue34_REAwKI4DOSC_EPUTZJwmw7wCvVPWPbmDE7L3ZrNnWAPfHO_UOdulUKrZRnn_X6QqHY&_nc_zt=23&_nc_ht=scontent.fcgy1-1.fna&_nc_gid=WXMAX7lpv2gL-2t9GQ1cKg&oh=00_AfMFeNhE1VjY3DGqZD9qt_yBrSt5dH7G_Hijs13RGYSKOw&oe=684B85A2" }}
          className="w-10 h-10 rounded-full mr-2"
        />
        <Text className="text-white font-semibold text-base">{item.users.name}</Text>
        <View className="ms-auto">
          <FontAwesome name="ellipsis-h" size={18} color="#9ca3af" />
        </View>
      </View>

      <Text className="text-white mb-2 font-medium text-base">
        {item.title}
      </Text>
      <Text className="text-gray-400 text-sm mb-2 leading-5">{item.body}</Text>

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
        <Pressable onPress={() => toggleLike(item.id.toString())}>
          <View className="flex-row items-center space-x-2 gap-1 mr-2">
            <FontAwesome
              name="heart"
              size={22}
              color={
                likedPosts.includes(item.id.toString()) ? "#e11d48" : "#9ca3af"
              }
            />
            <Text className="text-white text-sm font-poppinss">
              {item.likes ?? 0} {item.likes === 1 ? "like" : "likes"}
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
                        Comments on {selectedPost?.user}&#39;s post
                      </Text>

                      <View className="mb-4 max-h-60">
                        {selectedPost?.comments?.length > 0 ? (
                          <FlatList
                            data={selectedPost.comments}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                              <View className="flex-row items-start mb-5 space-x-3">
                                <View className="w-10 h-10 rounded-full bg-purple-500 items-center justify-center mr-2">
                                  <Text className="text-white font-bold text-base">
                                    {item.user?.charAt(0).toUpperCase()}
                                  </Text>
                                </View>
                                <View className="flex-1">
                                  <View className="bg-[#2a2e3e] rounded-xl px-4 py-3">
                                    <Text className="text-white font-semibold text-sm">
                                      {item.user}
                                    </Text>
                                    <Text className="text-gray-300 text-sm mt-1">
                                      {item.text}
                                    </Text>
                                  </View>
                                  <View className="flex-row mt-1 space-x-4 px-1 gap-2">
                                    <Text className="text-gray-400 text-xs">2h</Text>
                                    <Pressable>
                                      <Text className="text-gray-400 text-xs font-semibold">Like</Text>
                                    </Pressable>
                                    <Pressable>
                                      <Text className="text-gray-400 text-xs font-semibold">Reply</Text>
                                    </Pressable>
                                  </View>
                                </View>
                              </View>
                            )}
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
                            setComment("");
                            setCommentModal(false);
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
