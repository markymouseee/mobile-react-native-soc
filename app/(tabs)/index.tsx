import { Feather, FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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
  View,
} from "react-native";

const posts = [
  {
    id: "1",
    user: "John Doe",
    profile:
      "https://images.pexels.com/photos/14653174/pexels-photo-14653174.jpeg",
    title: "Workout Complete 💪",
    body: "Feeling great after a morning session!",
    image:
      "https://images.theconversation.com/files/638815/original/file-20241216-15-zor5sz.jpg?ixlib=rb-4.1.0&rect=7%2C0%2C5141%2C3149&q=20&auto=format&w=320&fit=clip&dpr=2&usm=12&cs=strip",
    likes: 20,
    comments: 20,
  },
  {
    id: "2",
    user: "Jane Smith",
    profile:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6Hb5xzFZJCTW4cMqmPwsgfw-gILUV7QevvQ&s",
    title: "Nature Walk 🌳",
    body: "Peaceful moments on today’s walk.",
    image:
      "https://www.plt.org/wp-content/uploads/2018/03/nature-walk-activities.jpg",
    likes: 20,
    comments: {
      1: "Wow, that looks amazing!",
      2: "I love nature walks too!",
    },
  },
];

export default function HomeScreen() {
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [commentModal, setCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [comment, setComment] = useState("");

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

  const renderPost = ({ item }: { item: (typeof posts)[0] }) => (
    <View className="bg-[#1a1d2e] rounded-xl py-4 px-4 mb-5">
      {/* Header */}
      <View className="flex-row items-center">
        <Image
          source={{ uri: item.profile }}
          className="w-10 h-10 rounded-full mr-2"
        />
        <Text className="text-white font-semibold text-base">{item.user}</Text>
        <View className="ms-auto">
          <FontAwesome name="ellipsis-h" size={18} color="#9ca3af" />
        </View>
      </View>

      {/* Caption */}
      <Text className="text-white mb-2 font-medium text-base">
        {item.title}
      </Text>
      <Text className="text-gray-400 text-sm mb-2 leading-5">{item.body}</Text>

      {/* Image */}
      {item.image && (
        <View className="rounded-xl overflow-hidden border border-[#2e2f45] my-3">
          <Image
            source={{ uri: item.image }}
            className="w-full h-72"
            resizeMode="cover"
          />
        </View>
      )}

      <View className="flex-row items-center mt-3 space-x-6">
        <Pressable onPress={() => toggleLike(item.id)}>
          <View className="flex-row items-center space-x-2 gap-1 mr-2">
            <FontAwesome
              name="heart"
              size={22}
              color={likedPosts.includes(item.id) ? "#e11d48" : "#9ca3af"}
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
              keyExtractor={(item) => item.id}
              renderItem={renderPost}
              showsVerticalScrollIndicator={false}
            />

            {/* Comment Modal */}
            <Modal visible={commentModal} animationType="slide" transparent>
              <View className="flex-1 justify-end bg-black/40">
                <View className="bg-[#1a1d2e] p-5 rounded-t-2xl">
                  <Text className="text-white text-base mb-3 font-semibold">
                    Comment on {selectedPost?.user}s post
                  </Text>
                  <TextInput
                    placeholder="Write a comment..."
                    placeholderTextColor="#888"
                    className="bg-[#2a2e3e] text-white p-3 rounded-lg mb-4"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                  />
                  <View className="flex-row justify-between">
                    <Pressable onPress={() => setCommentModal(false)}>
                      <Text className="text-red-400 font-semibold">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        // Simulate sending comment
                        setComment("");
                        setCommentModal(false);
                      }}
                    >
                      <Text className="text-purple-400 font-semibold">
                        Send
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
