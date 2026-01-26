import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator,
    ScrollView, Alert, Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db, auth } from '../services/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const UserProfileScreen = ({ navigation }) => {
    // 1. Khai báo các State để lưu trữ thông tin
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [focusedField, setFocusedField] = useState('');

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [job, setJob] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('https://via.placeholder.com/150');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    // Lấy từ Auth (thông tin đăng nhập Google)
                    setFullName(user.displayName || '');
                    setEmail(user.email || '');
                    setAvatarUrl(user.photoURL || 'https://via.placeholder.com/150');

                    // Lấy từ Firestore (thông tin bổ sung)
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setPhoneNumber(data.phoneNumber || '');
                        setJob(data.job || '');
                        setBirthDate(data.birthDate || '');
                    }
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleSave = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                fullName: fullName,
                phoneNumber: phoneNumber,
                job: job,
                birthDate: birthDate,
                updatedAt: new Date()
            }, { merge: true });

            setIsEditing(false);
            Alert.alert("Thành công", "Thông tin cá nhân đã được cập nhật!");
        } catch (error) {
            Alert.alert("Lỗi", "Không thể cập nhật thông tin.");
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#667EEA" />
            </View>
        );
    }

    const handleChangeAvatar = () => {
        Alert.alert("Chọn ảnh", "Tính năng chọn ảnh đại diện", [
            { text: "Chụp ảnh", onPress: () => console.log("Camera") },
            { text: "Chọn từ thư viện", onPress: () => console.log("Gallery") },
            { text: "Hủy", style: "cancel" }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(!isEditing)}
                >
                    <MaterialCommunityIcons
                        name={isEditing ? "close" : "pencil"}
                        size={22}
                        color={isEditing ? "#FF6B6B" : "#667EEA"}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Avatar Section */}
                <LinearGradient
                    colors={['#667EEA', '#764BA2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarSection}
                >
                    <View style={styles.avatarDecor1} />
                    <View style={styles.avatarDecor2} />

                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: avatarUrl }}
                                style={styles.avatar}
                            />
                            {isEditing && (
                                <TouchableOpacity
                                    style={styles.cameraButton}
                                    onPress={handleChangeAvatar}
                                >
                                    <LinearGradient
                                        colors={['#667EEA', '#764BA2']}
                                        style={styles.cameraGradient}
                                    >
                                        <MaterialCommunityIcons name="camera" size={18} color="#FFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.avatarName}>{fullName}</Text>
                        <Text style={styles.avatarEmail}>{email}</Text>
                    </View>
                </LinearGradient>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    {/* Full Name */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabel}>
                            <MaterialCommunityIcons name="account" size={20} color="#667EEA" />
                            <Text style={styles.labelText}>Họ và tên</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <View style={[
                            styles.inputWrapper,
                            focusedField === 'fullName' && styles.inputWrapperFocused,
                            !isEditing && styles.inputDisabled
                        ]}>
                            <TextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Nhập họ và tên"
                                placeholderTextColor="#CBD5E0"
                                editable={isEditing}
                                onFocus={() => setFocusedField('fullName')}
                                onBlur={() => setFocusedField('')}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabel}>
                            <MaterialCommunityIcons name="email" size={20} color="#667EEA" />
                            <Text style={styles.labelText}>Email</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <View style={[
                            styles.inputWrapper,
                            focusedField === 'email' && styles.inputWrapperFocused,
                            !isEditing && styles.inputDisabled
                        ]}>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="email@example.com"
                                placeholderTextColor="#CBD5E0"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={isEditing}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField('')}
                            />
                        </View>
                    </View>

                    {/* Phone Number */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabel}>
                            <MaterialCommunityIcons name="phone" size={20} color="#667EEA" />
                            <Text style={styles.labelText}>Số điện thoại</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <View style={[
                            styles.inputWrapper,
                            focusedField === 'phone' && styles.inputWrapperFocused,
                            !isEditing && styles.inputDisabled
                        ]}>
                            <TextInput
                                style={styles.input}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Nhập số điện thoại"
                                placeholderTextColor="#CBD5E0"
                                keyboardType="phone-pad"
                                editable={isEditing}
                                onFocus={() => setFocusedField('phone')}
                                onBlur={() => setFocusedField('')}
                            />
                        </View>
                    </View>

                    {/* Job */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabel}>
                            <MaterialCommunityIcons name="briefcase" size={20} color="#667EEA" />
                            <Text style={styles.labelText}>Nghề nghiệp</Text>
                        </View>
                        <View style={[
                            styles.inputWrapper,
                            focusedField === 'job' && styles.inputWrapperFocused,
                            !isEditing && styles.inputDisabled
                        ]}>
                            <TextInput
                                style={styles.input}
                                value={job}
                                onChangeText={setJob}
                                placeholder="Nhập nghề nghiệp"
                                placeholderTextColor="#CBD5E0"
                                editable={isEditing}
                                onFocus={() => setFocusedField('job')}
                                onBlur={() => setFocusedField('')}
                            />
                        </View>
                    </View>
                </View>
                {/* Action Buttons */}
                {isEditing && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setIsEditing(false)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cancelText}>Hủy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#667EEA', '#764BA2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.saveGradient}
                            >
                                <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                                <Text style={styles.saveText}>Lưu thay đổi</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Settings Options */}
                {!isEditing && (
                    <View style={styles.settingsCard}>
                        <Text style={styles.settingsTitle}>Cài đặt tài khoản</Text>

                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <View style={styles.settingIconWrapper}>
                                    <MaterialCommunityIcons name="lock-reset" size={22} color="#667EEA" />
                                </View>
                                <Text style={styles.settingText}>Đổi mật khẩu</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <View style={styles.settingIconWrapper}>
                                    <MaterialCommunityIcons name="shield-check" size={22} color="#34C759" />
                                </View>
                                <Text style={styles.settingText}>Bảo mật</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <View style={styles.settingIconWrapper}>
                                    <MaterialCommunityIcons name="bell" size={22} color="#FF9500" />
                                </View>
                                <Text style={styles.settingText}>Thông báo</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.settingItem, styles.settingItemLast]}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.settingIconWrapper, { backgroundColor: '#FEE2E2' }]}>
                                    <MaterialCommunityIcons name="logout" size={22} color="#FF3B30" />
                                </View>
                                <Text style={[styles.settingText, { color: '#FF3B30' }]}>Đăng xuất</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    avatarSection: {
        paddingTop: 40,
        paddingBottom: 50,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    avatarDecor1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -50,
        right: -50,
    },
    avatarDecor2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        bottom: -30,
        left: -30,
    },
    avatarWrapper: {
        alignItems: 'center',
        zIndex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 5,
        borderColor: '#FFFFFF',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderRadius: 18,
        overflow: 'hidden',
    },
    cameraGradient: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    avatarEmail: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.85)',
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: -30,
        borderRadius: 24,
        padding: 24,
        zIndex: 2,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    fieldLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 6,
    },
    labelText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        letterSpacing: 0.2,
    },
    required: {
        color: '#FF3B30',
        fontSize: 14,
        fontWeight: 'bold',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        height: 52,
    },
    inputWrapperFocused: {
        backgroundColor: '#FFFFFF',
        borderColor: '#667EEA',
    },
    inputDisabled: {
        backgroundColor: '#F9FAFB',
        borderColor: '#E5E7EB',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 24,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 54,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
    },
    saveButton: {
        flex: 2,
        borderRadius: 16,
        overflow: 'hidden',
    },
    saveGradient: {
        flexDirection: 'row',
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    saveText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    settingsCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 24,
        borderRadius: 24,
        padding: 20,
    },
    settingsTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    settingItemLast: {
        borderBottomWidth: 0,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
});

export default UserProfileScreen;