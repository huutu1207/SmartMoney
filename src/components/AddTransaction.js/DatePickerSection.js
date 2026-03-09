import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const DatePickerSection = ({ date, onDateChange }) => {
    const [show, setShow] = useState(false);

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
                <MaterialCommunityIcons name="calendar-edit" size={20} color="#667EEA" />
                <Text style={styles.sectionTitle}>Thời gian giao dịch</Text>
            </View>

            <TouchableOpacity
                style={styles.datePickerCard}
                onPress={() => setShow(true)}
                activeOpacity={0.7}
            >
                <View style={styles.dateInfo}>
                    <Text style={styles.dateText}>
                        {date.toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}
                    </Text>
                    {isToday(date) && (
                        <View style={styles.todayBadge}>
                            <Text style={styles.todayText}>Hôm nay</Text>
                        </View>
                    )}
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {show && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleChange}
                    maximumDate={new Date()}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 28 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1F2937' },
    datePickerCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 16,
        paddingVertical: 14, borderWidth: 2, borderColor: '#F1F5F9', elevation: 1,
    },
    dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dateText: { fontSize: 15, color: '#1F2937', fontWeight: '600', textTransform: 'capitalize' },
    todayBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    todayText: { fontSize: 11, color: '#667EEA', fontWeight: 'bold' },
});

export default DatePickerSection;