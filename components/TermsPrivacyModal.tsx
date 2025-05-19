import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface TermsPrivacyModalProps {
    visible: boolean;
    onClose: () => void;
    contentType: 'terms' | 'privacy';
}

const TermsPrivacyModal: React.FC<TermsPrivacyModalProps> = ({
    visible,
    onClose,
    contentType,
}) => {
    const isTerms = contentType === 'terms';

    const termsContent = `
1. Acceptance of Terms

By accessing this app, you agree to be bound by these Terms and Conditions...

2. User Responsibilities

You agree not to misuse the app, share unauthorized content...

3. Limitation of Liability

We are not liable for any damages arising from the use of this app...
`;

    const privacyContent = `
1. Information We Collect

We may collect your name, email address, and other info...

2. How We Use Information

We use your information to improve our services...

3. Data Security

We take reasonable measures to protect your data...
`;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View className="bg-darkblue-light rounded-xl w-full max-h-[80%] p-5">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-green-200">
                            {isTerms ? 'Terms and Conditions' : 'Privacy Policy'}
                        </Text>
                        <Pressable onPress={onClose}>
                            <Ionicons name="close" size={24} color="#a7f3d0" />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text className="text-green-300 text-sm leading-relaxed whitespace-pre-line">
                            {isTerms ? termsContent : privacyContent}
                        </Text>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default TermsPrivacyModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
});
