import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const posts = [
  {
    id: '1',
    user: 'John Doe',
    title: 'Workout Complete 💪',
    body: 'Feeling great after a morning session!',
    image: 'https://via.placeholder.com/350x200.png?text=Workout+Selfie',
  },
  {
    id: '2',
    user: 'Jane Smith',
    title: 'Nature Walk 🌳',
    body: 'Peaceful moments on today’s walk.',
    image: 'https://www.plt.org/wp-content/uploads/2018/03/nature-walk-activities.jpg',
  },
];

export default function HomeScreen() {
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [commentModal, setCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [comment, setComment] = useState('');

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const openCommentModal = (post: any) => {
    setSelectedPost(post);
    setCommentModal(true);
  };

  const renderPost = ({ item }: { item: typeof posts[0] }) => (
    <View className="bg-[#1a1d2e] rounded-xl p-4 mb-5">
      <Text className="text-white font-bold text-lg mb-1">{item.user}</Text>
      <Text className="text-gray-300 mb-2">{item.title}</Text>
      <Text className="text-gray-400">{item.body}</Text>
      {item.image && (
        <View className="my-3 rounded-xl overflow-hidden border border-[#2e2f45]">
          <Image source={{ uri: item.image }} className="w-full h-44" resizeMode="cover" />
        </View>
      )}
      <View className="flex-row items-center justify-start space-x-6 mt-2">
        <Pressable onPress={() => toggleLike(item.id)}>
          <FontAwesome
            name="heart"
            size={22}
            color={likedPosts.includes(item.id) ? '#e11d48' : '#9ca3af'}
          />
        </Pressable>
        <Pressable onPress={() => openCommentModal(item)}>
          <FontAwesome name="comment" size={20} color="#9ca3af" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0c1021' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                      setComment('');
                      setCommentModal(false);
                    }}
                  >
                    <Text className="text-purple-400 font-semibold">Send</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
