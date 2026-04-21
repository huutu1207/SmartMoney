import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../services/firebaseConfig';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useTheme } from 'react-native-paper';
import LoadingOverlay from '../components/LoadingOverlay';
const ChangePasswordScreen = ({ navigation }) => {
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [focusedField, setFocusedField] = useState('');

    // Kiểm tra độ mạnh mật khẩu
    const checkPasswordStrength = (password) => {
        if (password.length === 0) return { strength: 0, text: '', color: '#E5E7EB' };
        if (password.length < 6) return { strength: 1, text: 'Yếu', color: '#FF3B30' };
        if (password.length < 8) return { strength: 2, text: 'Trung bình', color: '#FF9500' };

        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);

        const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

        if (score >= 3) return { strength: 3, text: 'Mạnh', color: '#34C759' };
        return { strength: 2, text: 'Trung bình', color: '#FF9500' };
    };

    const passwordStrength = checkPasswordStrength(newPassword);

    const handleChangePassword = async () => {
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
            return;
        }

        if (currentPassword === newPassword) {
            Alert.alert("Lỗi", "Mật khẩu mới phải khác mật khẩu hiện tại");
            return;
        }
        setIsLoading(true);
        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, currentPassword);

            // Re-authenticate
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            Alert.alert("Thành công", "Mật khẩu đã được thay đổi!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                Alert.alert("Lỗi", "Mật khẩu hiện tại không đúng");
            } else {
                Alert.alert("Lỗi", error.message);
            }
        }
        finally {
            setIsLoading(false);
            console.log("--- ĐÃ TẮT LOADING ---");
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* 1. Header: Đồng bộ với màu nền hoặc màu Surface */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outlineVariant }]}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.colors.surfaceVariant }]}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Đổi mật khẩu</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 2. Info Banner: Giữ Gradient nhưng dùng biến Primary/Tertiary */}
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.tertiary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.infoBanner}
                >
                    <View style={[styles.bannerDecor, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />

                    <View style={styles.bannerContent}>
                        <View style={[styles.lockIconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                            <MaterialCommunityIcons name="shield-lock" size={32} color="#FFFFFF" />
                        </View>
                        <Text style={styles.bannerTitle}>Bảo mật tài khoản</Text>
                        <Text style={styles.bannerSubtitle}>
                            Tạo mật khẩu mạnh để bảo vệ tài khoản của bạn
                        </Text>
                    </View>
                </LinearGradient>

                {/* 3. Form Card: Sử dụng màu Surface */}
                <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>

                    {/* Mật khẩu hiện tại */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabel}>
                            <MaterialCommunityIcons name="lock-outline" size={20} color={theme.colors.primary} />
                            <Text style={[styles.labelText, { color: theme.colors.onSurface }]}>Mật khẩu hiện tại</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <View style={[
                            styles.inputWrapper,
                            { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant },
                            focusedField === 'current' && { borderColor: theme.colors.primary }
                        ]}>
                            <MaterialCommunityIcons name="key-variant" size={20} color={theme.colors.onSurfaceVariant} />
                            <TextInput
                                style={[styles.input, { color: theme.colors.onSurface }]}
                                placeholder="Nhập mật khẩu hiện tại"
                                placeholderTextColor={theme.colors.outline}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showCurrentPassword}
                                onFocus={() => setFocusedField('current')}
                                onBlur={() => setFocusedField('')}
                            />
                            <TouchableOpacity
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                style={styles.eyeButton}
                            >
                                <MaterialCommunityIcons
                                    name={showCurrentPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color={theme.colors.onSurfaceVariant}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Mật khẩu mới */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabel}>
                            <MaterialCommunityIcons name="lock-plus" size={20} color={theme.colors.primary} />
                            <Text style={[styles.labelText, { color: theme.colors.onSurface }]}>Mật khẩu mới</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <View style={[
                            styles.inputWrapper,
                            { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant },
                            focusedField === 'new' && { borderColor: theme.colors.primary }
                        ]}>
                            <MaterialCommunityIcons name="key-plus" size={20} color={theme.colors.onSurfaceVariant} />
                            <TextInput
                                style={[styles.input, { color: theme.colors.onSurface }]}
                                placeholder="Tối thiểu 6 ký tự"
                                placeholderTextColor={theme.colors.outline}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                                onFocus={() => setFocusedField('new')}
                                onBlur={() => setFocusedField('')}
                            />
                            {/* Nút con mắt tương tự như trên */}
                        </View>

                        {/* Password Strength Indicator */}
                        {newPassword.length > 0 && (
                            <View style={styles.strengthContainer}>
                                <View style={styles.strengthBars}>
                                    {[1, 2, 3].map((level) => (
                                        <View
                                            key={level}
                                            style={[
                                                styles.strengthBar,
                                                { backgroundColor: theme.colors.outlineVariant }, // Thanh chưa đạt
                                                level <= passwordStrength.strength && {
                                                    backgroundColor: passwordStrength.color // Thanh đã đạt (Đỏ/Cam/Xanh)
                                                }
                                            ]}
                                        />
                                    ))}
                                </View>
                                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                                    {passwordStrength.text}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabel}>
                            <MaterialCommunityIcons name="lock-check" size={20} color={theme.colors.primary} />
                            <Text style={[styles.labelText, { color: theme.colors.onSurface }]}>Xác nhận mật khẩu</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <View style={[
                            styles.inputWrapper,
                            {
                                backgroundColor: theme.colors.surfaceVariant,
                                borderColor: theme.colors.outlineVariant
                            },
                            focusedField === 'confirm' && { borderColor: theme.colors.primary },
                            confirmPassword && newPassword !== confirmPassword && { borderColor: theme.colors.error }
                        ]}>
                            <MaterialCommunityIcons name="key-chain" size={20} color={theme.colors.onSurfaceVariant} />
                            <TextInput
                                style={[styles.input, { color: theme.colors.onSurface }]}
                                placeholder="Nhập lại mật khẩu mới"
                                placeholderTextColor={theme.colors.outline}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                onFocus={() => setFocusedField('confirm')}
                                onBlur={() => setFocusedField('')}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeButton}
                            >
                                <MaterialCommunityIcons
                                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color={theme.colors.onSurfaceVariant}
                                />
                            </TouchableOpacity>
                        </View>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <View style={styles.errorContainer}>
                                <MaterialCommunityIcons name="alert-circle" size={14} color={theme.colors.error} />
                                <Text style={[styles.errorText, { color: theme.colors.error }]}>Mật khẩu không khớp</Text>
                            </View>
                        )}
                    </View>

                    {/* Password Tips */}
                    <View style={[
                        styles.tipsCard,
                        {
                            backgroundColor: theme.dark ? theme.colors.secondaryContainer : '#FFF9F5',
                            borderColor: theme.dark ? 'transparent' : '#FFE4CC'
                        }
                    ]}>
                        <View style={styles.tipsHeader}>
                            <MaterialCommunityIcons
                                name="lightbulb-on"
                                size={20}
                                color={theme.dark ? theme.colors.secondary : "#FF9500"}
                            />
                            <Text style={[styles.tipsTitle, { color: theme.colors.onSecondaryContainer }]}>
                                Mẹo tạo mật khẩu mạnh
                            </Text>
                        </View>
                        <View style={styles.tipsList}>
                            {[
                                'Tối thiểu 8 ký tự',
                                'Kết hợp chữ hoa và chữ thường',
                                'Có ít nhất 1 số',
                                'Có ký tự đặc biệt (!@#$%^&*)'
                            ].map((tip, i) => (
                                <View key={i} style={styles.tipItem}>
                                    <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.primary} />
                                    <Text style={[styles.tipText, { color: theme.colors.onSecondaryContainer }]}>{tip}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: theme.colors.surfaceVariant }]}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.cancelText, { color: theme.colors.onSurfaceVariant }]}>Hủy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleChangePassword}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.tertiary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.saveGradient}
                            >
                                <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.onPrimary} />
                                <Text style={[styles.saveText, { color: theme.colors.onPrimary }]}>Đổi mật khẩu</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
            <LoadingOverlay visible={isLoading} message="Đang đổi mật khẩu..." />
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
    placeholder: {
        width: 40,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    infoBanner: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        elevation: 6,
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    bannerDecor: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -30,
        right: -30,
    },
    bannerContent: {
        padding: 28,
        alignItems: 'center',
    },
    lockIconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    bannerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    bannerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
        lineHeight: 20,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 24,
        borderRadius: 24,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    fieldGroup: {
        marginBottom: 24,
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
        elevation: 2,
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    inputWrapperError: {
        borderColor: '#FF3B30',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
        marginLeft: 12,
    },
    eyeButton: {
        padding: 4,
    },
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 12,
    },
    strengthBars: {
        flexDirection: 'row',
        gap: 4,
        flex: 1,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E5E7EB',
    },
    strengthText: {
        fontSize: 12,
        fontWeight: '600',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    errorText: {
        fontSize: 13,
        color: '#FF3B30',
        fontWeight: '500',
    },
    tipsCard: {
        backgroundColor: '#FFF9F5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FFE4CC',
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
    },
    tipsList: {
        gap: 8,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tipText: {
        fontSize: 13,
        color: '#4B5563',
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
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
        elevation: 6,
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
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
});

export default ChangePasswordScreen;