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

const RegisterScreen = ({ navigation }) => {
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAFBFF" />
            
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
                            colors={['#667EEA20', '#764BA220']}
                            style={styles.bgCircle1}
                        />
                        <LinearGradient
                            colors={['#A855F720', '#C084FC20']}
                            style={styles.bgCircle2}
                        />
                        <LinearGradient
                            colors={['#4C6EF520', '#667EEA20']}
                            style={styles.bgCircle3}
                        />
                    </View>

                    {/* Back Button */}
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    {/* Top Section - Logo & Welcome */}
                    <View style={styles.topSection}>
                        <View style={styles.logoWrapper}>
                            <LinearGradient
                                colors={['#667EEA', '#764BA2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.logoOuter}
                            >
                                <View style={styles.logoInner}>
                                    <MaterialCommunityIcons name="account-plus-outline" size={42} color="#667EEA" />
                                </View>
                            </LinearGradient>
                        </View>

                        <Text style={styles.welcomeTitle}>Tạo tài khoản mới</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Bắt đầu hành trình quản lý tài chính thông minh
                        </Text>
                    </View>

                    {/* Register Form Card */}
                    <View style={styles.formCard}>
                        {/* Full Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Họ và tên</Text>
                            <View style={[
                                styles.inputWrapper,
                                isNameFocused && styles.inputWrapperFocused
                            ]}>
                                <View style={styles.inputIconContainer}>
                                    <MaterialCommunityIcons 
                                        name="account-outline" 
                                        size={20} 
                                        color={isNameFocused ? '#667EEA' : '#9CA3AF'} 
                                    />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nguyễn Văn A"
                                    placeholderTextColor="#CBD5E0"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    onFocus={() => setIsNameFocused(true)}
                                    onBlur={() => setIsNameFocused(false)}
                                />
                                {fullName.length > 0 && (
                                    <TouchableOpacity onPress={() => setFullName('')}>
                                        <MaterialCommunityIcons name="close-circle" size={20} color="#D1D5DB" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Địa chỉ Email</Text>
                            <View style={[
                                styles.inputWrapper,
                                isEmailFocused && styles.inputWrapperFocused
                            ]}>
                                <View style={styles.inputIconContainer}>
                                    <MaterialCommunityIcons 
                                        name="email-outline" 
                                        size={20} 
                                        color={isEmailFocused ? '#667EEA' : '#9CA3AF'} 
                                    />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="yourname@example.com"
                                    placeholderTextColor="#CBD5E0"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    onFocus={() => setIsEmailFocused(true)}
                                    onBlur={() => setIsEmailFocused(false)}
                                />
                                {email.length > 0 && (
                                    <TouchableOpacity onPress={() => setEmail('')}>
                                        <MaterialCommunityIcons name="close-circle" size={20} color="#D1D5DB" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Mật khẩu</Text>
                            <View style={[
                                styles.inputWrapper,
                                isPasswordFocused && styles.inputWrapperFocused
                            ]}>
                                <View style={styles.inputIconContainer}>
                                    <MaterialCommunityIcons 
                                        name="lock-outline" 
                                        size={20} 
                                        color={isPasswordFocused ? '#667EEA' : '#9CA3AF'} 
                                    />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tối thiểu 6 ký tự"
                                    placeholderTextColor="#CBD5E0"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                >
                                    <MaterialCommunityIcons 
                                        name={showPassword ? "eye-outline" : "eye-off-outline"} 
                                        size={20} 
                                        color="#9CA3AF" 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                            <View style={[
                                styles.inputWrapper,
                                isConfirmFocused && styles.inputWrapperFocused
                            ]}>
                                <View style={styles.inputIconContainer}>
                                    <MaterialCommunityIcons 
                                        name="lock-check-outline" 
                                        size={20} 
                                        color={isConfirmFocused ? '#667EEA' : '#9CA3AF'} 
                                    />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập lại mật khẩu"
                                    placeholderTextColor="#CBD5E0"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    onFocus={() => setIsConfirmFocused(true)}
                                    onBlur={() => setIsConfirmFocused(false)}
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeButton}
                                >
                                    <MaterialCommunityIcons 
                                        name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                                        size={20} 
                                        color="#9CA3AF" 
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
                                agreedToTerms && styles.checkboxActive
                            ]}>
                                {agreedToTerms && (
                                    <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                                )}
                            </View>
                            <Text style={styles.termsText}>
                                Tôi đồng ý với{' '}
                                <Text style={styles.termsLink}>Điều khoản</Text>
                                {' '}và{' '}
                                <Text style={styles.termsLink}>Chính sách</Text>
                            </Text>
                        </TouchableOpacity>

                        {/* Register Button */}
                        <TouchableOpacity 
                            style={styles.registerButton}
                            activeOpacity={0.85}
                            onPress={handleRegister}
                        >
                            <LinearGradient
                                colors={['#667EEA', '#764BA2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.registerGradient}
                            >
                                <Text style={styles.registerText}>Tạo tài khoản</Text>
                                {/* <View style={styles.arrowCircle}>
                                    <MaterialCommunityIcons name="check" size={18} color="#667EEA" />
                                </View> */}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Hoặc đăng ký với</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Buttons */}
                        <View style={styles.socialRow}>
                            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['#FFFFFF', '#F9FAFB']}
                                    style={styles.socialGradient}
                                >
                                    <View style={styles.socialIconWrapper}>
                                        <MaterialCommunityIcons name="google" size={22} color="#DB4437" />
                                    </View>
                                    <Text style={styles.socialText}>Google</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['#FFFFFF', '#F9FAFB']}
                                    style={styles.socialGradient}
                                >
                                    <View style={styles.socialIconWrapper}>
                                        <MaterialCommunityIcons name="facebook" size={22} color="#1877F2" />
                                    </View>
                                    <Text style={styles.socialText}>Facebook</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['#FFFFFF', '#F9FAFB']}
                                    style={styles.socialGradient}
                                >
                                    <View style={styles.socialIconWrapper}>
                                        <MaterialCommunityIcons name="apple" size={22} color="#000000" />
                                    </View>
                                    <Text style={styles.socialText}>Apple</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Login Link */}
                    <View style={styles.loginSection}>
                        <Text style={styles.loginQuestion}>Đã có tài khoản? </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <LinearGradient
                                colors={['#667EEA', '#764BA2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.loginGradient}
                            >
                                <Text style={styles.loginText}>Đăng nhập ngay</Text>
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
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    bgCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        top: -100,
        right: -80,
    },
    bgCircle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        bottom: 100,
        left: -60,
    },
    bgCircle3: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        top: 250,
        left: 30,
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
        paddingBottom: 30,
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
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 28,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
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