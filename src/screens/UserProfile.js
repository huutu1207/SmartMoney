import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator,
    ScrollView, Alert, Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { db, auth } from '../services/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut, updateProfile } from 'firebase/auth';
import ChangePasswordScreen from './ChangePassword';
import * as ImagePicker from 'expo-image-picker';
import LoadingOverlay from '../components/LoadingOverlay';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebaseConfig';
const UserProfileScreen = ({ navigation }) => {
    // 1. Khai báo các State để lưu trữ thông tin
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [focusedField, setFocusedField] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [job, setJob] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('https://via.placeholder.com/150');
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [base64Avatar, setBase64Avatar] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const isGoogle = user.providerData.some(p => p.providerId === 'google.com');
                    setIsGoogleUser(isGoogle);
                    setFullName(user.displayName || '');
                    setEmail(user.email || '');
                    setAvatarUrl(user.photoURL || 'https://via.placeholder.com/150');

                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setPhoneNumber(data.phoneNumber || '');
                        setJob(data.job || '');
                        if (data.fullName) setFullName(data.fullName); // Thêm dòng này để ưu tiên tên từ DB[cite: 4]
                        if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
                    }
                }
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY;

    const uploadToImgBB = async (base64Data) => {
        const formData = new FormData();
        formData.append('image', base64Data);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (result.success) return result.data.url;
        throw new Error(result.error.message);
    };

    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn thoát không?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đăng xuất",
                style: "destructive",
                onPress: () => signOut(auth).catch(err => console.log(err))
            }
        ]);
    };


    const handleSave = async () => {
        setIsSaving(true);
        try {
            const user = auth.currentUser;
            let finalAvatarUrl = avatarUrl;

            if (base64Avatar) {
                finalAvatarUrl = await uploadToImgBB(base64Avatar);
            }

            // 1. Cập nhật vào Firebase Auth (Quan trọng để tên không bị nhảy về cũ)
            await updateProfile(user, {
                displayName: fullName,
                photoURL: finalAvatarUrl
            });

            // 2. Cập nhật vào Firestore
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                fullName,
                phoneNumber,
                job,
                avatarUrl: finalAvatarUrl,
                updatedAt: new Date()
            }, { merge: true });

            setIsEditing(false);
            setBase64Avatar(null);
            setAvatarUrl(finalAvatarUrl);
            Alert.alert("Thành công", "Thông tin đã được lưu lên mây!");
        } catch (error) {
            Alert.alert("Lỗi", "Không lưu được thông tin Tú ơi!");
        } finally {
            setIsSaving(false);
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
        Alert.alert("Thay đổi ảnh", "Tú muốn chọn ảnh từ đâu?", [
            { text: "Chụp ảnh", onPress: openCamera },
            { text: "Thư viện", onPress: openLibrary },
            { text: "Hủy", style: "cancel" }
        ]);
    };

    const openLibrary = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return Alert.alert("Lỗi", "Cần quyền truy cập ảnh!");

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true, // ✅ Quan trọng để lấy dữ liệu up ImgBB
        });

        if (!result.canceled) {
            setAvatarUrl(result.assets[0].uri);
            setBase64Avatar(result.assets[0].base64); // Lưu base64 để lát nữa upload
        }
    };

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return Alert.alert("Lỗi", "Cần quyền Camera!");

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setAvatarUrl(result.assets[0].uri);
            setBase64Avatar(result.assets[0].base64);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header: Dùng màu surface để tạo khối nổi nhẹ trên nền background */}
            <View style={[styles.header, {
                backgroundColor: theme.colors.surface,
                borderBottomColor: theme.colors.outlineVariant
            }]}>

                {/* Nút Back: Dùng surfaceVariant (màu xám trầm) làm nền */}
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.colors.surfaceVariant }]}
                    onPress={() => navigation.goBack()}
                >
                    {/* onSurface sẽ tự thành Trắng nếu là Dark Mode, Đen nếu là Light Mode */}
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
                    Thông tin cá nhân
                </Text>

                {/* Nút Edit: Dùng toán tử 3 ngôi cho LOGIC (Trạng thái), nhưng dùng MÀU của Theme */}
                <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: theme.colors.surfaceVariant }]}
                    onPress={() => setIsEditing(!isEditing)}
                >
                    <MaterialCommunityIcons
                        name={isEditing ? "close" : "pencil"}
                        size={22}
                        // Dùng error cho màu đỏ cảnh báo và primary cho màu nhấn chính của Theme
                        color={isEditing ? theme.colors.error : theme.colors.primary}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
            >
                {/* Avatar Section - Tự động thích ứng màu thương hiệu */}
                <LinearGradient
                    // Thay vì dùng mã Hex, mình dùng màu Primary và Tertiary của theme
                    colors={[theme.colors.primary, theme.colors.tertiary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarSection}
                >
                    {/* Các hình tròn trang trí - Dùng màu trắng mờ (onPrimary) để tự động đẹp */}
                    <View style={[styles.avatarDecor1, { backgroundColor: theme.colors.onPrimary + '1A' }]} />
                    <View style={[styles.avatarDecor2, { backgroundColor: theme.colors.onPrimary + '0D' }]} />

                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: avatarUrl }}
                                // Viền ảnh dùng màu surface để tạo cảm giác ảnh nổi lên từ Card bên dưới
                                style={[styles.avatar, { borderColor: theme.colors.surface }]}
                            />
                            {isEditing && (
                                <TouchableOpacity
                                    style={styles.cameraButton}
                                    onPress={handleChangeAvatar}
                                >
                                    <LinearGradient
                                        colors={[theme.colors.primary, theme.colors.secondary]}
                                        style={styles.cameraGradient}
                                    >
                                        {/* Biến onPrimary tự đổi Trắng/Đen để Tú không cần lo */}
                                        <MaterialCommunityIcons name="camera" size={18} color={theme.colors.onPrimary} />
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Tên và Email dùng bộ màu 'on' để luôn đọc được trên nền màu đậm */}
                        <Text style={[styles.avatarName, { color: theme.colors.onPrimary }]}>
                            {fullName}
                        </Text>
                        <Text style={[styles.avatarEmail, { color: theme.colors.onPrimary + 'D9' }]}>
                            {email}
                        </Text>
                    </View>
                </LinearGradient>
                {/* Info Card */}
                <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>

                    {/* Một mẫu Field chung (Họ và tên) - Các field khác áp dụng tương tự */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabel}>
                            {/* Icon dùng màu nhấn chính của App */}
                            <MaterialCommunityIcons name="account" size={20} color={theme.colors.primary} />
                            <Text style={[styles.labelText, { color: theme.colors.onSurface }]}>Họ và tên</Text>
                            {/* Dấu * bắt buộc dùng màu Error hệ thống */}
                            <Text style={[styles.required, { color: theme.colors.error }]}>*</Text>
                        </View>

                        <View style={[
                            styles.inputWrapper,
                            {
                                backgroundColor: theme.colors.surfaceVariant, // Màu nền xám trầm/nhạt
                                borderColor: theme.colors.outlineVariant      // Viền mờ đồng bộ
                            },
                            // Logic Focus: Tự đổi màu khi chạm vào
                            focusedField === 'fullName' && {
                                borderColor: theme.colors.primary,
                                backgroundColor: theme.colors.surface
                            },
                            // Logic Disabled: Làm mờ đi một chút
                            !isEditing && { opacity: 0.6 }
                        ]}>
                            <TextInput
                                style={[styles.input, { color: theme.colors.onSurface }]}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Nhập họ và tên"
                                // Màu placeholder cũng lấy từ theme
                                placeholderTextColor={theme.colors.outline}
                                editable={isEditing}
                                onFocus={() => setFocusedField('fullName')}
                                onBlur={() => setFocusedField('')}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    {/* Email - Luôn khóa để đảm bảo an toàn */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabel}>
                            <MaterialCommunityIcons name="email" size={20} color={theme.colors.primary} />
                            <Text style={[styles.labelText, { color: theme.colors.onSurface }]}>Email</Text>
                            <Text style={[styles.required, { color: theme.colors.error }]}>*</Text>
                        </View>
                        <View style={[
                            styles.inputWrapper,
                            {
                                backgroundColor: theme.colors.surfaceVariant,
                                borderColor: theme.colors.outlineVariant,
                                // Làm mờ hẳn đi để người dùng biết là không thể chạm vào[cite: 1]
                                opacity: 0.6
                            },
                        ]}>
                            <TextInput
                                style={[styles.input, { color: theme.colors.onSurface }]}
                                value={email}
                                editable={false} // KHÓA CỨNG: Không bao giờ cho sửa ở đây[cite: 1]
                                placeholder="email@example.com"
                                placeholderTextColor={theme.colors.outline}
                            />
                            {/* Có thể thêm icon khóa nhỏ ở đây để báo hiệu */}
                            <MaterialCommunityIcons name="lock" size={16} color={theme.colors.outline} />
                        </View>
                    </View>

                    {/* Phone Number */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabel}>
                            <MaterialCommunityIcons name="phone" size={20} color={theme.colors.primary} />
                            <Text style={[styles.labelText, { color: theme.colors.onSurface }]}>Số điện thoại</Text>
                            <Text style={[styles.required, { color: theme.colors.error }]}>*</Text>
                        </View>
                        <View style={[
                            styles.inputWrapper,
                            { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant },
                            focusedField === 'phone' && { borderColor: theme.colors.primary, backgroundColor: theme.colors.surface },
                            !isEditing && { opacity: 0.6 }
                        ]}>
                            <TextInput
                                style={[styles.input, { color: theme.colors.onSurface }]}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Nhập số điện thoại"
                                placeholderTextColor={theme.colors.outline}
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
                            <MaterialCommunityIcons name="briefcase" size={20} color={theme.colors.primary} />
                            <Text style={[styles.labelText, { color: theme.colors.onSurface }]}>Nghề nghiệp</Text>
                        </View>
                        <View style={[
                            styles.inputWrapper,
                            { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant },
                            focusedField === 'job' && { borderColor: theme.colors.primary, backgroundColor: theme.colors.surface },
                            !isEditing && { opacity: 0.6 }
                        ]}>
                            <TextInput
                                style={[styles.input, { color: theme.colors.onSurface }]}
                                value={job}
                                onChangeText={setJob}
                                placeholder="Nhập nghề nghiệp"
                                placeholderTextColor={theme.colors.outline}
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
                            style={[styles.cancelButton, { backgroundColor: theme.colors.surfaceVariant }]}
                            onPress={() => setIsEditing(false)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.cancelText, { color: theme.colors.onSurfaceVariant }]}>Hủy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.saveButton, { shadowColor: theme.colors.primary }]}
                            onPress={handleSave}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.tertiary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.saveGradient}
                            >
                                <MaterialCommunityIcons name="check" size={20} color={theme.colors.onPrimary} />
                                <Text style={[styles.saveText, { color: theme.colors.onPrimary }]}>Lưu thay đổi</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Settings Options */}
                {!isEditing && (
                    <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.settingsTitle, { color: theme.colors.onSurface }]}>Cài đặt tài khoản</Text>

                        {/* Các mục cài đặt thông thường (Đổi mật khẩu, Bảo mật, Thông báo) */}
                        {[
                            {
                                label: isGoogleUser ? 'Đổi mật khẩu (Dùng Google)' : 'Đổi mật khẩu',
                                icon: 'lock-reset',
                                // Nếu là Google User thì dùng màu xám (outline), ngược lại dùng màu Primary của App
                                color: isGoogleUser ? theme.colors.outline : theme.colors.primary,
                                bgColor: isGoogleUser ? theme.colors.surfaceVariant : theme.colors.primaryContainer,
                                onPress: () => navigation.navigate('ChangePassword'),
                                isPassword: true // Đánh dấu đây là mục mật khẩu
                            },
                            { label: 'Bảo mật', icon: 'shield-check', color: '#34C759', bgColor: '#34C75920' },
                            { label: 'Thông báo', icon: 'bell', color: '#FF9500', bgColor: '#FF950020' },
                        ].map((item, index) => {
                            // Kiểm tra xem mục này có bị vô hiệu hóa không
                            const isDisabled = item.isPassword && isGoogleUser;

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.settingItem,
                                        { borderBottomColor: theme.colors.outlineVariant },
                                        // Nếu bị disable thì làm mờ cả dòng đi[cite: 1]
                                        isDisabled && { opacity: 0.5 }
                                    ]}
                                    // Thuộc tính quan trọng nhất để chặn bấm[cite: 1]
                                    disabled={isDisabled}
                                    onPress={() => item.onPress?.()}
                                >
                                    <View style={styles.settingLeft}>
                                        <View style={[styles.settingIconWrapper, { backgroundColor: item.bgColor }]}>
                                            <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
                                        </View>
                                        <Text style={[
                                            styles.settingText,
                                            { color: isDisabled ? theme.colors.outline : theme.colors.onSurface }
                                        ]}>
                                            {item.label}
                                        </Text>
                                    </View>

                                    {/* Nếu không bị disable thì mới hiện mũi tên chevron-right */}
                                    {!isDisabled && (
                                        <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}


                        {/* Nút Đăng xuất - Sử dụng cặp màu Error của hệ thống */}
                        <TouchableOpacity style={[styles.settingItem, styles.settingItemLast]}
                            onPress={handleLogout}
                        >
                            <View style={styles.settingLeft}>
                                <View style={[styles.settingIconWrapper, { backgroundColor: theme.colors.errorContainer }]}>
                                    <MaterialCommunityIcons name="logout" size={22} color={theme.colors.error} />
                                </View>
                                <Text style={[styles.settingText, { color: theme.colors.error }]}>Đăng xuất</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />

            </ScrollView>
            <LoadingOverlay visible={loading || isSaving} message={loading ? "Đang tải..." : "Đang lưu lên mây..."} />

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