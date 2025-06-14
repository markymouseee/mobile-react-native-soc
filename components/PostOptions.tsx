import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const PostOptions = ({ post, currentUserId, onEdit, onDelete }: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const isOwner = post?.users?.id === currentUserId;

  return (
    <>
      {isOwner && (
        <TouchableOpacity
          className="ms-auto px-2"
          onPress={() => setModalVisible(true)}
        >
          <Feather name="more-horizontal" size={22} color="#9ca3af" />
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          onPress={() => setModalVisible(false)}
          className="flex-1 justify-end bg-black/40"
        >
          <View className="bg-[#0c1021] rounded-t-3xl pb-8 pt-3 px-4">
            <View className="w-12 h-1 rounded-full bg-gray-600 self-center mb-4" />

            <TouchableOpacity
              onPress={() => {
                onEdit(post);
                setModalVisible(false);
              }}
              className="py-4 border-b border-gray-700"
            >
              <Text className="text-white text-center text-base font-semibold">
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onDelete();
                setModalVisible(false);
              }}
              className="py-4 border-b border-gray-700"
            >
              <Text className="text-red-500 text-center text-base font-semibold">
                Delete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="py-4"
            >
              <Text className="text-gray-400 text-center text-base font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default PostOptions;
