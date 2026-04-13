import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Cấu hình cách thông báo hiển thị khi app đang mở
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const registerForPushNotificationsAsync = async () => {
    // Kiểm tra xem có phải máy thật không
    if (!Device.isDevice) {
        console.log('Thông báo chỉ hoạt động trên thiết bị thật!');
        return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        alert('Bạn cần cấp quyền thông báo để nhận nhắc nhở hằng ngày!');
        return;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Mặc định',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
};

export const scheduleDailyReminder = async (hour, minute) => {
    try {
        // 1. Xóa hết lịch cũ
        await Notifications.cancelAllScheduledNotificationsAsync();

        // 2. Ép kiểu Number để chắc chắn trigger nhận đúng định dạng
        const h = Number(hour);
        const m = Number(minute);

        // 3. Lập lịch mới với Trigger Input chuẩn
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "SmartMoney Nhắc Bạn 💰",
                body: 'Đừng quên nhập chi tiêu hôm nay để quản lý tiền tốt hơn nhé!',
                data: { screen: 'AddTransaction' },
                android: {
                    channelId: 'default', // Phải khớp với ID lúc register
                    importance: Notifications.AndroidImportance.MAX,
                    pressAction: { id: 'default' },
                },
            },
            trigger: {
                // Thêm type rõ ràng để tránh lỗi "invalid trigger"
                type: Notifications.SchedulableTriggerInputTypes.DAILY, 
                hour: h,
                minute: m,
            },
        });

        console.log(`✅ Đã đặt lịch: ${h}:${m}`);
    } catch (error) {
        console.error("❌ Lỗi lập lịch thông báo:", error);
    }
};