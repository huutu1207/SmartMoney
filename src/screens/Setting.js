import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Switch, Divider, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';

const handleLogout = () => {
    signOut(auth)
        .then(() => console.log('User signed out!'))
        .catch(error => console.log(error));
};
const Settings = () => {
    // Trạng thái bật/tắt thông báo
    const [isReminderEnabled, setIsReminderEnabled] = useState(true);

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
                                    onValueChange={() => setIsReminderEnabled(!isReminderEnabled)}
                                    color="#5856D6"
                                />
                            )}
                        />
                        <Divider />
                        <List.Item
                            title="Thời gian nhắc"
                            description="20:00 mỗi ngày"
                            left={props => <List.Icon {...props} icon="clock-outline" color="#FF9500" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => alert('Chọn giờ nhắc (Sẽ làm ở Epic 4)')}
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