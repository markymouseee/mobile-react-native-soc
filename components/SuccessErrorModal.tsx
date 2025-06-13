import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

export default function SuccessErrorModal({ setShow, show, message }: any) {
    return (
        <Modal
            transparent
            animationType="fade"
            visible={show}
            onRequestClose={() => setShow(false)}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-[#0c1021] p-6 rounded-2xl w-11/12 max-w-md shadow-xl">
                    <Text className="text-lg text-red-500 text-center mb-2" style={{ fontFamily: "Pacifico-Regular" }}>
                        Vibio System
                    </Text>
                    <Text className="text-gray-300 font-poppins text-center mb-6">
                       {message}
                    </Text>

                    <View className="flex-row justify-center">
                        <TouchableOpacity
                            className="flex-1 ml-2 py-2 rounded-xl bg-purple-500"
                            onPress={() => setShow(false)}
                        >
                            <Text className="text-center font-poppins text-gray-300">OK</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        </Modal>
    );
}