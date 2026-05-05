import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

const RegisterScreen = ({ navigation }) => {
    const theme = useTheme();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isNameFocused, setIsNameFocused] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isConfirmFocused, setIsConfirmFocused] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
            return;
        }
        if (!agreedToTerms) {
            Alert.alert("Lỗi", "Vui lòng đồng ý với điều khoản sử dụng");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert("Thành công", "Tài khoản của bạn đã được tạo!");
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert("Đăng ký thất bại", error.message);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* StatusBar: Tự động đổi màu icon pin/sóng */}
            <StatusBar
                barStyle={theme.dark ? "light-content" : "dark-content"}
                backgroundColor={theme.colors.background}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    bounces={false}
                >
                    {/* Decorative Background Elements */}
                    <View style={styles.bgDecoration}>
                        <LinearGradient
                            colors={[theme.colors.primary + '20', theme.colors.tertiary + '20']}
                            style={styles.bgCircle1}
                        />
                        <LinearGradient
                            colors={[theme.colors.secondary + '20', theme.colors.primary + '20']}
                            style={styles.bgCircle2}
                        />
                        <LinearGradient
                            colors={[theme.colors.primary + '20', theme.colors.outlineVariant + '20']}
                            style={styles.bgCircle3}
                        />
                    </View>

                    {/* Back Button */}
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: theme.colors.surfaceVariant }]}
                        onPress={() => navigation.goBack()}
                    >
                        {/* Màu onSurface tự động đổi Đen/Trắng để Tú dễ nhìn */}
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
                    </TouchableOpacity>

                    {/* Top Section - Logo & Welcome */}
                    <View style={styles.topSection}>
                        <View style={styles.logoWrapper}>
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.tertiary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.logoOuter}
                            >
                                <View style={[styles.logoInner, { backgroundColor: theme.colors.surface }]}>
                                    <MaterialCommunityIcons
                                        name="account-plus-outline"
                                        size={42}
                                        color={theme.colors.primary}
                                    />
                                </View>
                            </LinearGradient>
                        </View>

                        <Text style={[styles.welcomeTitle, { color: theme.colors.onSurface }]}>
                            Tạo tài khoản mới
                        </Text>
                        <Text style={[styles.welcomeSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                            Bắt đầu hành trình quản lý tài chính thông minh
                        </Text>
                    </View>

                    {/* Register Form Card */}
                    <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
                        {/* Full Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>Họ và tên</Text>
                            <View style={[
                                styles.inputWrapper,
                                {
                                    backgroundColor: theme.colors.surfaceVariant,
                                    borderColor: theme.colors.outlineVariant
                                },
                                isNameFocused && { borderColor: theme.colors.primary }
                            ]}>
                                <View style={styles.inputIconContainer}>
                                    <MaterialCommunityIcons
                                        name="account-outline"
                                        size={20}
                                        // Màu icon đổi theo trạng thái Focus
                                        color={isNameFocused ? theme.colors.primary : theme.colors.onSurfaceVariant}
                                    />
                                </View>
                                <TextInput
                                    style={[styles.input, { color: theme.colors.onSurface }]}
                                    placeholder="Nguyễn Văn A"
                                    placeholderTextColor={theme.colors.outline}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    onFocus={() => setIsNameFocused(true)}
                                    onBlur={() => setIsNameFocused(false)}
                                />
                                {fullName.length > 0 && (
                                    <TouchableOpacity onPress={() => setFullName('')}>
                                        <MaterialCommunityIcons
                                            name="close-circle"
                                            size={20}
                                            color={theme.colors.outline}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>Địa chỉ Email</Text>
                            <View style={[
                                styles.inputWrapper,
                                { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant },
                                isEmailFocused && { borderColor: theme.colors.primary }
                            ]}>
                                <View style={styles.inputIconContainer}>
                                    <MaterialCommunityIcons
                                        name="email-outline"
                                        size={20}
                                        color={isEmailFocused ? theme.colors.primary : theme.colors.onSurfaceVariant}
                                    />
                                </View>
                                <TextInput
                                    style={[styles.input, { color: theme.colors.onSurface }]}
                                    placeholder="yourname@example.com"
                                    placeholderTextColor={theme.colors.outline}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    onFocus={() => setIsEmailFocused(true)}
                                    onBlur={() => setIsEmailFocused(false)}
                                />
                                {email.length > 0 && (
                                    <TouchableOpacity onPress={() => setEmail('')}>
                                        <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.outline} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>Mật khẩu</Text>
                            <View style={[
                                styles.inputWrapper,
                                { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant },
                                isPasswordFocused && { borderColor: theme.colors.primary }
                            ]}>
                                <View style={styles.inputIconContainer}>
                                    <MaterialCommunityIcons
                                        name="lock-outline"
                                        size={20}
                                        color={isPasswordFocused ? theme.colors.primary : theme.colors.onSurfaceVariant}
                                    />
                                </View>
                                <TextInput
                                    style={[styles.input, { color: theme.colors.onSurface }]}
                                    placeholder="Tối thiểu 6 ký tự"
                                    placeholderTextColor={theme.colors.outline}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                                    <MaterialCommunityIcons
                                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                                        size={20}
                                        color={theme.colors.onSurfaceVariant}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>Xác nhận mật khẩu</Text>
                            <View style={[
                                styles.inputWrapper,
                                { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant },
                                isConfirmFocused && { borderColor: theme.colors.primary }
                            ]}>
                                <View style={styles.inputIconContainer}>
                                    <MaterialCommunityIcons
                                        name="lock-check-outline"
                                        size={20}
                                        color={isConfirmFocused ? theme.colors.primary : theme.colors.onSurfaceVariant}
                                    />
                                </View>
                                <TextInput
                                    style={[styles.input, { color: theme.colors.onSurface }]}
                                    placeholder="Nhập lại mật khẩu"
                                    placeholderTextColor={theme.colors.outline}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    onFocus={() => setIsConfirmFocused(true)}
                                    onBlur={() => setIsConfirmFocused(false)}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                                    <MaterialCommunityIcons
                                        name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                        size={20}
                                        color={theme.colors.onSurfaceVariant}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Terms & Conditions */}
                        <TouchableOpacity
                            style={styles.termsRow}
                            onPress={() => setAgreedToTerms(!agreedToTerms)}
                        >
                            <View style={[
                                styles.checkbox,
                                {
                                    backgroundColor: agreedToTerms ? theme.colors.primary : theme.colors.surfaceVariant,
                                    borderColor: agreedToTerms ? theme.colors.primary : theme.colors.outlineVariant
                                }
                            ]}>
                                {agreedToTerms && (
                                    <MaterialCommunityIcons name="check" size={14} color={theme.colors.onPrimary} />
                                )}
                            </View>
                            <Text style={[styles.termsText, { color: theme.colors.onSurfaceVariant }]}>
                                Tôi đồng ý với{' '}
                                <Text style={[styles.termsLink, { color: theme.colors.primary, fontWeight: 'bold' }]}>Điều khoản</Text>
                                {' '}và{' '}
                                <Text style={[styles.termsLink, { color: theme.colors.primary, fontWeight: 'bold' }]}>Chính sách</Text>
                            </Text>
                        </TouchableOpacity>

                        {/* Register Button */}
                        <TouchableOpacity
                            style={[styles.registerButton, { shadowColor: theme.colors.primary }]}
                            activeOpacity={0.85}
                            onPress={handleRegister}
                        >
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.tertiary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.registerGradient}
                            >
                                <Text style={[styles.registerText, { color: theme.colors.onPrimary }]}>Tạo tài khoản</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
                            <Text style={[styles.dividerText, { color: theme.colors.outline }]}>Hoặc đăng ký với</Text>
                            <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
                        </View>

                        {/* Social Buttons */}
                        <View style={styles.socialRow}>
                            {[
                                { name: 'google', color: '#DB4437', label: 'Google' },
                                { name: 'facebook', color: '#1877F2', label: 'Facebook' },
                            ].map((platform, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.socialBtn, { borderColor: theme.colors.outlineVariant, borderWidth: 1 }]}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        // Dùng surface và surfaceVariant để tạo độ khối nhẹ
                                        colors={[theme.colors.surface, theme.colors.surfaceVariant]}
                                        style={styles.socialGradient}
                                    >
                                        <View style={styles.socialIconWrapper}>
                                            <MaterialCommunityIcons
                                                name={platform.name}
                                                size={22}
                                                color={platform.color}
                                            />
                                        </View>
                                        <Text style={[styles.socialText, { color: theme.colors.onSurface }]}>
                                            {platform.label}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Login Link */}
                    <View style={styles.loginSection}>
                        <Text style={[styles.loginQuestion, { color: theme.colors.onSurfaceVariant }]}>
                            Đã có tài khoản?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.tertiary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.loginGradient}
                            >
                                <Text style={[styles.loginText, { color: theme.colors.onPrimary }]}>
                                    Đăng nhập ngay
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#FAFBFF',
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    bgDecoration: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0, // Đảm bảo nằm dưới cùng
    },
    bgCircle1: {
        position: 'absolute',
        width: 350,
        height: 350,
        borderRadius: 175,
        top: -120,
        right: -100, // Dùng RIGHT và số âm để đẩy nó ra ngoài mép phải
    },
    bgCircle2: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        bottom: 50,
        right: -60, // ĐỔI TỪ LEFT SANG RIGHT để nó nằm bên phải màn hình
    },
    bgCircle3: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        top: '30%',
        left: -40, // Giữ một cái bên trái để tạo sự so le
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        zIndex: 2,
    },
    topSection: {
        alignItems: 'center',
        paddingTop: 30,
        paddingBottom: 40,
        zIndex: 1,
    },
    logoWrapper: {
        marginBottom: 20,
    },
    logoOuter: {
        width: 90,
        height: 90,
        borderRadius: 28,
        padding: 3,
        elevation: 12,
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    logoInner: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    welcomeSubtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    formCard: {
        borderRadius: 32,
        padding: 28,
        marginHorizontal: 20,
        marginTop: -40,
        elevation: 8,
        zIndex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        height: 56,
    },
    inputWrapperFocused: {
        backgroundColor: '#FFFFFF',
        borderColor: '#667EEA',

    },
    inputIconContainer: {
        width: 24,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
        paddingHorizontal: 12,
        fontWeight: '500',
    },
    eyeButton: {
        padding: 4,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 4,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxActive: {
        borderColor: '#667EEA',
        backgroundColor: '#667EEA',
    },
    termsText: {
        fontSize: 13,
        color: '#4B5563',
        flex: 1,
        lineHeight: 20,
    },
    termsLink: {
        color: '#667EEA',
        fontWeight: '600',
    },
    registerButton: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        marginBottom: 24,
    },
    registerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    registerText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    arrowCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        fontSize: 13,
        color: '#9CA3AF',
        paddingHorizontal: 14,
        fontWeight: '500',
    },
    socialRow: {
        flexDirection: 'row',
        gap: 12,
    },
    socialBtn: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    socialGradient: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
    },
    socialIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    loginSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        zIndex: 1,
    },
    loginQuestion: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
    loginGradient: {
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 6,
    },
    loginText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
});

export default RegisterScreen;