import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// Import các hàm từ service mới
import { scanTextLocally, extractInfoWithGemini } from '../services/ocrService';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { CATEGORY_CONFIG } from '../constants/categories';
const ScanPreviewScreen = ({ route, navigation }) => {
    const { imageUri } = route.params;
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState(""); // Hiển thị tiến trình cho người dùng

    const handleOCR = async () => {
        setLoading(true);
        try {
            // Bước 1: Quét chữ ngoại tuyến bằng ML Kit (Rất nhanh)
            setStatusText("Đang nhận diện chữ...");
            const rawText = await scanTextLocally(imageUri);
            const defaultExpenseNames = Object.keys(CATEGORY_CONFIG).filter(
                key => CATEGORY_CONFIG[key].type === 'expense' && key !== 'default'
            );
            const user = auth.currentUser;
            const q = query(collection(db, "categories"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const customCats = querySnapshot.docs.map(doc => doc.data().name);

            const allAvailableCategories = [...defaultExpenseNames, ...customCats];
            if (rawText && rawText.trim().length > 0) {
                // Bước 2: Gửi văn bản cho Gemini để phân tích logic (Cực thông minh)
                setStatusText("AI đang phân tích hóa đơn...");
                const data = await extractInfoWithGemini(rawText, allAvailableCategories);

                if (data) {
                    // Bước 3: Đẩy dữ liệu sang màn hình AddTransaction
                    navigation.replace('AddTransaction', {
                        autoFill: {
                            amount: data.amount.toString(),
                            date: data.date,
                            note: `${data.shop || 'Cửa hàng'}`,
                            category: data.category
                        }
                    });
                } else {
                    throw new Error("AI không thể phân tích dữ liệu");
                }
            } else {
                Alert.alert("Lỗi", "Không tìm thấy chữ trên ảnh. Bạn hãy chụp lại rõ nét hơn nhé!");
            }
        } catch (error) {
            console.log("Lỗi Hybrid OCR:", error);
            Alert.alert("Thông báo", "AI đang bận một chút, em hãy thử lại sau nhé!");
        } finally {
            setLoading(false);
            setStatusText("");
        }
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />

            {/* Hiển thị dòng trạng thái khi đang quét */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>{statusText}</Text>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.retakeBtn}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={styles.retakeText}>Chụp lại</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={handleOCR}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={['#3B82F6', '#4F46E5']}
                        style={styles.gradientBtn}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="magnify-scan" size={24} color="white" />
                                <Text style={styles.confirmText}>Phân tích bằng AI</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    previewImage: { flex: 1, width: '100%' },
    loadingOverlay: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 20,
    },
    loadingText: { color: 'white', marginTop: 10, fontSize: 16, fontWeight: '500' },
    buttonContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 15,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    retakeBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    retakeText: { color: 'white', fontSize: 16, fontWeight: '600' },
    confirmBtn: { flex: 2, borderRadius: 12, overflow: 'hidden' },
    gradientBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 10 },
    confirmText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default ScanPreviewScreen;