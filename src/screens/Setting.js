import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, List, Switch, Divider, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

import DateTimePicker from '@react-native-community/datetimepicker';
const handleLogout = () => {
    signOut(auth)
        .then(() => console.log('User signed out!'))
        .catch(error => console.log(error));
};
const Settings = ({ navigation }) => {
    // Trạng thái bật/tắt thông báo
    const [reminderTime, setReminderTime] = useState('20:00');
    const [currency, setCurrency] = useState('VND'); // Thêm đơn vị tiền tệ theo Tuần 3
    const [loading, setLoading] = useState(true);
    const [isReminderEnabled, setIsReminderEnabled] = useState(true);
    const user = auth.currentUser;
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const onChange = (event, selectedDate) => {
        // Android yêu cầu đóng thủ công ngay sau khi chọn
        setShowPicker(false);

        if (event.type === 'set' && selectedDate) {
            setDate(selectedDate);

            // Định dạng lại thành HH:mm để lưu vào Firestore
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;

            setReminderTime(timeString);
            updateSetting('reminderTime', timeString); // Lưu backend
        }
    };
    useEffect(() => {
        const fetchSettings = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Nếu đã có cấu hình trong DB thì set vào State
                    if (data.isReminderEnabled !== undefined) setIsReminderEnabled(data.isReminderEnabled);
                    if (data.reminderTime) setReminderTime(data.reminderTime);
                    if (data.currency) setCurrency(data.currency);
                }
            } catch (error) {
                console.error("Lỗi tải cấu hình:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const updateSetting = async (key, value) => {
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                [key]: value
            });
            console.log(`Đã cập nhật ${key} thành công`);
        } catch (error) {
            // Nếu document chưa tồn tại, dùng setDoc
            console.log("Cập nhật thất bại, đang thử khởi tạo lại...");
            await setDoc(doc(db, "users", user.uid), { [key]: value }, { merge: true });
        }
    };
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
                                    onValueChange={(value) => {
                                        setIsReminderEnabled(value);
                                        updateSetting('isReminderEnabled', value);
                                    }}
                                    color="#5856D6"
                                />
                            )}
                        />

                        <Divider />
                        <List.Item
                            title="Thời gian nhắc"
                            description={reminderTime + " mỗi ngày"}
                            // ... các props khác
                            onPress={() => {
                                // Ở đây bạn có thể dùng DateTimePicker
                                // Tạm thời ví dụ đổi sang 21:00
                                // const newTime = "21:00";
                                // setReminderTime(newTime);
                                // updateSetting('reminderTime', newTime);
                                console.log("aaa" + isReminderEnabled)
                                setShowPicker(true)
                            }}
                            disabled={!isReminderEnabled}
                        />

                    </Surface>
                </List.Section>

                <List.Section>
                    <List.Subheader>Tài khoản</List.Subheader>
                    <Surface style={styles.surface} elevation={0}>
                        <List.Item
                            title="Thông tin cá nhân"
                            left={props => <List.Icon {...props} icon="account-outline" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => { navigation.navigate('UserProfile') }}
                        />
                        <List.Item
                            title="Đơn vị tiền tệ"
                            description={currency}
                            left={props => <List.Icon {...props} icon="currency-usd" color="#34C759" />}
                            onPress={() => {
                                // Ví dụ: Đổi nhanh hoặc mở Menu chọn
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
                            onPress={() => handleLogout()}
                        />
                    </Surface>
                </List.Section>
            </ScrollView>
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="time" // Chỉ chọn giờ/phút
                    is24Hour={true}
                    // display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    display='spinner'
                    onChange={onChange}
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