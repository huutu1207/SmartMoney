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
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../services/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useTheme } from 'react-native-paper';
import LoadingOverlay from '../components/LoadingOverlay';

const ForgotPasswordScreen = ({ navigation }) => {
    const theme = useTheme();
    const [email, setEmail] = useState('');
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert("Lỗi", "Vui lòng nhập địa chỉ email");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Lỗi", "Địa chỉ email không hợp lệ");
            return;
        }

        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setEmailSent(true);
            Alert.alert(
                "Thành công", 
                "Email khôi phục mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.",
                [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]
            );
        } catch (error) {
            let errorMessage = "Đã có lỗi xảy ra";
            if (error.code === 'auth/user-not-found') {
                errorMessage = "Email này chưa được đăng ký";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Địa chỉ email không hợp lệ";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Quá nhiều yêu cầu. Vui lòng thử lại sau";
            }
            Alert.alert("Lỗi", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
                            colors={[theme.colors.primary + '20', theme.colors.outline + '20']}
                            style={styles.bgCircle3}
                        />
                    </View>

                    {/* Back Button */}
                    <TouchableOpacity 
                        style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons 
                            name="arrow-left" 
                            size={24} 
                            color={theme.colors.onSurface} 
                        />
                    </TouchableOpacity>

                    {/* Top Section - Icon & Title */}
                    <View style={styles.topSection}>
                        <View style={styles.iconWrapper}>
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.tertiary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.iconOuter}
                            >
                                <View style={[styles.iconInner, { backgroundColor: theme.colors.surface }]}>
                                    <MaterialCommunityIcons
                                        name="lock-reset"
                                        size={48}
                                        color={theme.colors.primary}
                                    />
                                </View>
                            </LinearGradient>
                        </View>

                        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                            Quên mật khẩu?
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                            Đừng lo! Nhập email của bạn và chúng tôi sẽ gửi link khôi phục mật khẩu
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
                                Địa chỉ Email
                            </Text>
                            <View style={[
                                styles.inputWrapper,
                                {
                                    backgroundColor: theme.colors.surfaceVariant,
                                    borderColor: theme.colors.outlineVariant
                                },
                                isEmailFocused && { 
                                    borderColor: theme.colors.primary,
                                    backgroundColor: theme.colors.surface 
                                }
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
                                        <MaterialCommunityIcons
                                            name="close-circle"
                                            size={20}
                                            color={theme.colors.outline}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Info Tips */}
                        <View style={[styles.infoCard, { 
                            backgroundColor: theme.colors.primaryContainer,
                            borderColor: theme.colors.primary + '30'
                        }]}>
                            <MaterialCommunityIcons 
                                name="information" 
                                size={20} 
                                color={theme.colors.primary} 
                            />
                            <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                                Link khôi phục sẽ được gửi đến email này. Vui lòng kiểm tra cả thư mục Spam.
                            </Text>
                        </View>

                        {/* Reset Button */}
                        <TouchableOpacity
                            style={[styles.resetButton, { shadowColor: theme.colors.primary }]}
                            activeOpacity={0.85}
                            onPress={handleResetPassword}
                        >
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.tertiary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.resetGradient}
                            >
                                <MaterialCommunityIcons 
                                    name="send" 
                                    size={20} 
                                    color={theme.colors.onPrimary} 
                                />
                                <Text style={[styles.resetText, { color: theme.colors.onPrimary }]}>
                                    Gửi link khôi phục
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
                            <Text style={[styles.dividerText, { color: theme.colors.outline }]}>
                                hoặc
                            </Text>
                            <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
                        </View>

                        {/* Additional Options */}
                        <View style={styles.optionsContainer}>
                            <TouchableOpacity 
                                style={[styles.optionButton, { 
                                    backgroundColor: theme.colors.surfaceVariant,
                                    borderColor: theme.colors.outlineVariant
                                }]}
                                onPress={() => navigation.navigate('Login')}
                            >
                                <MaterialCommunityIcons 
                                    name="login" 
                                    size={20} 
                                    color={theme.colors.primary} 
                                />
                                <Text style={[styles.optionText, { color: theme.colors.onSurface }]}>
                                    Quay lại đăng nhập
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.optionButton, { 
                                    backgroundColor: theme.colors.surfaceVariant,
                                    borderColor: theme.colors.outlineVariant
                                }]}
                                onPress={() => navigation.navigate('Register')}
                            >
                                <MaterialCommunityIcons 
                                    name="account-plus" 
                                    size={20} 
                                    color={theme.colors.primary} 
                                />
                                <Text style={[styles.optionText, { color: theme.colors.onSurface }]}>
                                    Tạo tài khoản mới
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Help Section */}
                    <View style={styles.helpSection}>
                        <MaterialCommunityIcons 
                            name="help-circle-outline" 
                            size={20} 
                            color={theme.colors.onSurfaceVariant} 
                        />
                        <Text style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>
                            Vẫn gặp vấn đề?{' '}
                            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                                Liên hệ hỗ trợ
                            </Text>
                        </Text>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <LoadingOverlay visible={isLoading} message="Đang gửi email..." />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        zIndex: 0,
    },
    bgCircle1: {
        position: 'absolute',
        width: 350,
        height: 350,
        borderRadius: 175,
        top: -120,
        right: -100,
    },
    bgCircle2: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        bottom: 50,
        right: -60,
    },
    bgCircle3: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        top: '30%',
        left: -40,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        zIndex: 2,
    },
    topSection: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40,
        zIndex: 1,
    },
    iconWrapper: {
        marginBottom: 24,
    },
    iconOuter: {
        width: 100,
        height: 100,
        borderRadius: 32,
        padding: 3,
        elevation: 12,
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    iconInner: {
        flex: 1,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    formCard: {
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
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 2,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIconContainer: {
        width: 24,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: 15,
        paddingHorizontal: 12,
        fontWeight: '500',
    },
    infoCard: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        gap: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
    },
    resetButton: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        marginBottom: 24,
    },
    resetGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    resetText: {
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 13,
        paddingHorizontal: 14,
        fontWeight: '500',
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 2,
        gap: 8,
    },
    optionText: {
        fontSize: 15,
        fontWeight: '600',
    },
    helpSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 28,
        zIndex: 1,
    },
    helpText: {
        fontSize: 14,
    },
});

export default ForgotPasswordScreen;