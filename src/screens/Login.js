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
    Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../services/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';


const LoginScreen = ({ navigation }) => {
    const onGoogleButtonPress = async () => {
        try {
            // Kiểm tra dịch vụ Google Play (chỉ Android)
            await GoogleSignin.hasPlayServices();

            // Bắt đầu đăng nhập
            const response = await GoogleSignin.signIn();

            // Lấy ID Token từ kết quả trả về
            const idToken = response.data.idToken;

            // Tạo credential cho Firebase
            const googleCredential = GoogleAuthProvider.credential(idToken);

            // Đăng nhập vào Firebase
            const userCredential = await signInWithCredential(auth, googleCredential);

            console.log('Đăng nhập thành công:', userCredential.user.email);
        } catch (error) {
            console.log('Lỗi Google Login:', error);
            Alert.alert('Lỗi', 'Không thể đăng nhập bằng Google. Vui lòng thử lại.');
        }
    };
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    
    React.useEffect(() => {
        GoogleSignin.configure({
            webClientId: '201189817902-9mo5uip3752nfc4lcq6jv26drrd5pq48.apps.googleusercontent.com',
            offlineAccess: true,
        });
    }, []);
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Đăng nhập thành công!");
        } catch (error) {
            let errorMessage = "Đã có lỗi xảy ra";
            if (error.code === 'auth/user-not-found') errorMessage = "Tài khoản không tồn tại";
            if (error.code === 'auth/wrong-password') errorMessage = "Mật khẩu không chính xác";
            Alert.alert("Đăng nhập thất bại", errorMessage);
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
                                    <MaterialCommunityIcons name="wallet-outline" size={42} color="#667EEA" />
                                </View>
                            </LinearGradient>
                        </View>

                        <Text style={styles.welcomeTitle}>Welcome to Smart Money</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Đăng nhập để quản lý tài chính thông minh hơn
                        </Text>
                    </View>

                    {/* Login Form Card */}
                    <View style={styles.formCard}>
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
                            <View style={styles.labelRow}>
                                <Text style={styles.inputLabel}>Mật khẩu</Text>
                                <TouchableOpacity>
                                    <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                                </TouchableOpacity>
                            </View>
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
                                    placeholder="Nhập mật khẩu của bạn"
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

                        {/* Remember Me */}
                        <TouchableOpacity style={styles.rememberRow}>
                            <View style={styles.checkbox}>
                                <MaterialCommunityIcons name="check" size={14} color="#667EEA" />
                            </View>
                            <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={styles.loginButton}
                            activeOpacity={0.85}
                            onPress={handleLogin}
                        >
                            <LinearGradient
                                colors={['#667EEA', '#764BA2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.loginGradient}
                            >
                                <Text style={styles.loginText}>Đăng nhập</Text>
                                <View style={styles.arrowCircle}>
                                    <MaterialCommunityIcons name="arrow-right" size={18} color="#667EEA" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Buttons */}
                        <View style={styles.socialRow}>
                            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}
                                onPress={onGoogleButtonPress}
                            >
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


                        </View>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signUpSection}>
                        <Text style={styles.signUpQuestion}>Chưa có tài khoản? </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Register')}
                        >
                            <LinearGradient
                                colors={['#667EEA', '#764BA2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.signUpGradient}
                            >
                                <Text style={styles.signUpText}

                                >Đăng ký ngay</Text>
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
        top: 200,
        left: 30,
    },
    topSection: {
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 40,
        zIndex: 1,
    },
    logoWrapper: {
        marginBottom: 24,
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
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    forgotText: {
        fontSize: 13,
        color: '#667EEA',
        fontWeight: '600',
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
        transition: 'all 0.3s',
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
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#667EEA',
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    rememberText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    loginButton: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        marginBottom: 28,
    },
    loginGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    loginText: {
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
    signUpSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 28,
        zIndex: 1,
    },
    signUpQuestion: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
    signUpGradient: {
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 6,
    },
    signUpText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
});

export default LoginScreen;