import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
// 1. Import useTheme
import { useTheme } from 'react-native-paper'; 

const DatePickerSection = ({ date, onDateChange }) => {
    const [show, setShow] = useState(false);
    // 2. Khai báo theme
    const theme = useTheme(); 

    const handleChange = (event, selectedDate) => {
        setShow(Platform.OS === 'ios');
        if (selectedDate) {
            onDateChange(selectedDate);
        }
    };

    const isToday = (someDate) => {
        const today = new Date();
        return someDate.getDate() === today.getDate() &&
            someDate.getMonth() === today.getMonth() &&
            someDate.getFullYear() === today.getFullYear();
    };

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                {/* 3. Dùng màu primary cho icon */}
                <MaterialCommunityIcons name="calendar-edit" size={20} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    Thời gian giao dịch
                </Text>
            </View>

            <TouchableOpacity
                style={[
                    styles.datePickerCard, 
                    { 
                        backgroundColor: theme.colors.surface, 
                        borderColor: theme.colors.outlineVariant 
                    }
                ]}
                onPress={() => setShow(true)}
                activeOpacity={0.7}
            >
                <View style={styles.dateInfo}>
                    <Text style={[styles.dateText, { color: theme.colors.onSurface }]}>
                        {date.toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}
                    </Text>
                    
                    {isToday(date) && (
                        <View style={[styles.todayBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                            <Text style={[styles.todayText, { color: theme.colors.onPrimaryContainer }]}>
                                Hôm nay
                            </Text>
                        </View>
                    )}
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            {show && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleChange}
                    maximumDate={new Date()}
                    // Lưu ý: DateTimePicker của hệ thống sẽ tự đổi màu theo mode của máy (Android/iOS)
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 28 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold' },
    datePickerCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: 18, paddingHorizontal: 16,
        paddingVertical: 14, borderWidth: 2, elevation: 1,
    },
    dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dateText: { fontSize: 15, fontWeight: '600', textTransform: 'capitalize' },
    todayBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    todayText: { fontSize: 11, fontWeight: 'bold' },
});

export default DatePickerSection;