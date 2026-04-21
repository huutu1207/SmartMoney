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
import { useTheme } from 'react-native-paper';

const LoginScreen = ({ navigation }) => {
    const theme = useTheme();
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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* StatusBar: Tự động đổi màu icon Pin/Sóng sang trắng khi nền tối */}
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
                    {/* Tú giữ nguyên opacity 20 (hex) để các vòng tròn này mờ ảo trên nền tối nhé */}
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
                            colors={[theme.colors.primary + '20', theme.colors.outline + '20']}
                            style={styles.bgCircle3}
                        />
                    </View>

                    {/* Top Section - Logo & Welcome */}
                    <View style={styles.topSection}>
                        <View style={styles.logoWrapper}>
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.tertiary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.logoOuter}
                            >
                                {/* Phần nền trắng bên trong logo nên chuyển sang màu surface */}
                                <View style={[styles.logoInner, { backgroundColor: theme.colors.surface }]}>
                                    <MaterialCommunityIcons
                                        name="wallet-outline"
                                        size={42}
                                        color={theme.colors.primary}
                                    />
                                </View>
                            </LinearGradient>
                        </View>

                        {/* Chữ Welcome tự động đổi Trắng/Đen */}
                        <Text style={[styles.welcomeTitle, { color: theme.colors.onSurface }]}>
                            Welcome to Smart Money
                        </Text>
                        <Text style={[styles.welcomeSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                            Đăng nhập để quản lý tài chính thông minh hơn
                        </Text>
                    </View>

                    {/* Login Form Card */}
                    <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
                        {/* Email Input Group */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>Địa chỉ Email</Text>
                            <View style={[
                                styles.inputWrapper,
                                {
                                    backgroundColor: theme.colors.surfaceVariant, // Nền ô nhập mờ hơn card
                                    borderColor: theme.colors.outlineVariant
                                },
                                isEmailFocused && { borderColor: theme.colors.primary } // Sáng lên khi chọn
                            ]}>
                                <View style={styles.inputIconContainer}>
                                    <MaterialCommunityIcons
                                        name="email-outline"
                                        size={20}
                                        // Đổi màu icon linh hoạt theo theme
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
                                        <MaterialCommunityIcons
                                            name="close-circle"
                                            size={20}
                                            color={theme.colors.outline}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Password Input Group */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>Mật khẩu</Text>
                                <TouchableOpacity>
                                    <Text style={[styles.forgotText, { color: theme.colors.primary }]}>Quên mật khẩu?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[
                                styles.inputWrapper,
                                {
                                    backgroundColor: theme.colors.surfaceVariant,
                                    borderColor: theme.colors.outlineVariant
                                },
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
                                    placeholder="Nhập mật khẩu của bạn"
                                    placeholderTextColor={theme.colors.outline}
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
                                        color={theme.colors.onSurfaceVariant}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Remember Me */}
                        <TouchableOpacity style={styles.rememberRow}>
                            <View style={[
                                styles.checkbox,
                                { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant }
                            ]}>
                                {/* Hiện check icon nếu được chọn, dùng màu primary của theme */}
                                <MaterialCommunityIcons name="check" size={14} color={theme.colors.primary} />
                            </View>
                            <Text style={[styles.rememberText, { color: theme.colors.onSurfaceVariant }]}>
                                Ghi nhớ đăng nhập
                            </Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, { shadowColor: theme.colors.primary }]}
                            activeOpacity={0.85}
                            onPress={handleLogin}
                        >
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.tertiary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.loginGradient}
                            >
                                <Text style={[styles.loginText, { color: theme.colors.onPrimary }]}>Đăng nhập</Text>
                                <View style={[styles.arrowCircle, { backgroundColor: theme.colors.surface }]}>
                                    <MaterialCommunityIcons name="arrow-right" size={18} color={theme.colors.primary} />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
                            <Text style={[styles.dividerText, { color: theme.colors.outline }]}>Hoặc tiếp tục với</Text>
                            <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
                        </View>

                        {/* Social Buttons */}
                        <View style={styles.socialRow}>
                            {['google', 'facebook'].map((platform) => (
                                <TouchableOpacity
                                    key={platform}
                                    style={[styles.socialBtn, { borderColor: theme.colors.outlineVariant, borderWidth: 1 }]}
                                    activeOpacity={0.8}
                                    onPress={platform === 'google' ? onGoogleButtonPress : undefined}
                                >
                                    <LinearGradient
                                        // Thay vì trắng tinh, dùng surface để đồng bộ với dark mode
                                        colors={[theme.colors.surface, theme.colors.surfaceVariant]}
                                        style={styles.socialGradient}
                                    >
                                        <View style={styles.socialIconWrapper}>
                                            <MaterialCommunityIcons
                                                name={platform}
                                                size={22}
                                                color={platform === 'google' ? '#DB4437' : '#1877F2'}
                                            />
                                        </View>
                                        <Text style={[styles.socialText, { color: theme.colors.onSurface }]}>
                                            {platform === 'google' ? 'Google' : 'Facebook'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.signUpSection}>
                        <Text style={[styles.signUpQuestion, { color: theme.colors.onSurfaceVariant }]}>
                            Chưa có tài khoản?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.tertiary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.signUpGradient}
                            >
                                <Text style={[styles.signUpText, { color: theme.colors.onPrimary }]}>Đăng ký ngay</Text>
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