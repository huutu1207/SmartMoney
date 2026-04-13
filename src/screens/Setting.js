import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Text, List, Switch, Divider, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { registerForPushNotificationsAsync, scheduleDailyReminder } from '../services/notificationService';
import * as Notifications from 'expo-notifications';
const Settings = ({ navigation }) => {
    const theme = useTheme();
    const [reminderTime, setReminderTime] = useState('20:00');
    const [currency, setCurrency] = useState('VND');
    const [isReminderEnabled, setIsReminderEnabled] = useState(true);
    const [loading, setLoading] = useState(true);

    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const user = auth.currentUser;

    // Hàm chuyển đổi string "HH:mm" thành đối tượng Date để Picker hiển thị đúng
    const parseTimeStringToDate = (timeStr) => {
        const [hours, minutes] = timeStr.split(':');
        const d = new Date();
        d.setHours(parseInt(hours), parseInt(minutes), 0);
        return d;
    };

    useEffect(() => {
        const initSettings = async () => {
            // Xin quyền thông báo ngay khi màn hình Settings được load
            await registerForPushNotificationsAsync();

            if (!user) return;
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.isReminderEnabled !== undefined) setIsReminderEnabled(data.isReminderEnabled);
                    if (data.reminderTime) {
                        setReminderTime(data.reminderTime);
                        setDate(parseTimeStringToDate(data.reminderTime));
                    }
                    if (data.currency) setCurrency(data.currency);
                }
            } catch (error) {
                console.error("Lỗi tải cấu hình:", error);
            } finally {
                setLoading(false);
            }
        };

        initSettings();
    }, [user]);

    const updateSetting = async (key, value) => {
        try {
            const userRef = doc(db, "users", user.uid);
            // Dùng setDoc với merge: true sẽ tạo mới nếu chưa có, hoặc cập nhật nếu đã có
            await setDoc(userRef, { [key]: value }, { merge: true });
        } catch (error) {
            console.error("Cập nhật thất bại:", error);
        }
    };

    const onChangeTime = async (event, selectedDate) => {
        setShowPicker(false);
        if (event.type === 'set' && selectedDate) {
            setDate(selectedDate);
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;

            setReminderTime(timeString);
            updateSetting('reminderTime', timeString);

            // Cập nhật lại lịch nhắc nhở ngay lập tức nếu đang bật
            if (isReminderEnabled) {
                try {
                    await scheduleDailyReminder(selectedDate.getHours(), selectedDate.getMinutes());
                    console.log("Đã cập nhật giờ nhắc nhở mới");
                } catch (err) {
                    console.log("Lỗi đặt lịch thông báo:", err);
                }
            }
        }
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

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#5856D6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cài đặt</Text>
            </View>

            <ScrollView>
                <List.Section>
                    <List.Subheader>Thông báo & Nhắc nhở</List.Subheader>
                    <Surface style={styles.surface} elevation={0}>
                        <List.Item
                            title="Nhắc nhở hằng ngày"
                            description="Nhắc tôi nhập chi tiêu vào cuối ngày"
                            left={props => <List.Icon {...props} icon="bell-ring-outline" color="#5856D6" />}
                            right={() => (
                                <Switch
                                    value={isReminderEnabled}
                                    onValueChange={async (value) => {
                                        setIsReminderEnabled(value);
                                        updateSetting('isReminderEnabled', value);

                                        if (value) {
                                            // Lấy giờ từ state để đặt lịch
                                            const [h, m] = reminderTime.split(':').map(Number);
                                            await scheduleDailyReminder(h, m);
                                            Alert.alert("Thông báo", `Đã bật nhắc nhở lúc ${reminderTime}`);
                                        } else {
                                            // Hủy tất cả nếu tắt
                                            await Notifications.cancelAllScheduledNotificationsAsync();
                                            console.log("Đã hủy tất cả nhắc nhở");
                                        }
                                        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
                                        console.log("Danh sách thông báo đã đặt lịch:", scheduled.length);
                                    }}

                                    color="#5856D6"
                                />
                            )}
                        />
                        <Divider />
                        <List.Item
                            title="Thời gian nhắc"
                            description={`${reminderTime} mỗi ngày`}
                            left={props => <List.Icon {...props} icon="clock-outline" color="#5856D6" />}
                            onPress={() => setShowPicker(true)}
                            disabled={!isReminderEnabled}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                        />
                    </Surface>
                </List.Section>

                <List.Section>
                    <List.Subheader>Tài khoản</List.Subheader>
                    <Surface style={styles.surface} elevation={0}>
                        <List.Item
                            title="Thông tin cá nhân"
                            left={props => <List.Icon {...props} icon="account-outline" color="#007AFF" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('UserProfile')}
                        />
                        <Divider />
                        <List.Item
                            title="Đơn vị tiền tệ"
                            description={currency}
                            left={props => <List.Icon {...props} icon="currency-usd" color="#34C759" />}
                            onPress={() => {
                                const newCurrency = currency === 'VND' ? 'USD' : 'VND';
                                setCurrency(newCurrency);
                                updateSetting('currency', newCurrency);
                            }}
                        />
                        <Divider />
                        <List.Item
                            title="Đăng xuất"
                            titleStyle={{ color: '#FF3B30' }}
                            left={props => <List.Icon {...props} icon="logout" color="#FF3B30" />}
                            onPress={handleLogout}
                        />
                    </Surface>
                </List.Section>
            </ScrollView>

            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeTime}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    surface: { marginHorizontal: 16, borderRadius: 12, backgroundColor: '#FFF', overflow: 'hidden' },
});

export default Settings;