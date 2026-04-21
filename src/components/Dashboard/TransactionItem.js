import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CATEGORY_CONFIG } from '../../constants/categories';
// 1. Import useTheme
import { useTheme } from 'react-native-paper';

const TransactionItem = ({ item, onPress, onLongPress, formatCurrency }) => {
    // 2. Lấy theme hệ thống
    const theme = useTheme();
    const category = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.default;

    return (
        <TouchableOpacity
            style={[
                styles.transactionItem,
                // Có thể thêm màu nền surface nhẹ nếu muốn mỗi item là một cái card
                { borderBottomColor: theme.colors.outlineVariant, borderBottomWidth: 0.5 }
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={300}
        >
            {/* Icon Box - Giữ màu icon nhưng cho nền mờ đi một chút */}
            <View style={[styles.itemIconBox, { backgroundColor: category.color + '20' }]}>
                <MaterialCommunityIcons name={category.icon} size={24} color={category.color} />
            </View>

            <View style={styles.itemInfo}>
                {/* 3. Tiêu đề - Tự động đổi Trắng <-> Đen */}
                <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>
                    {item.note || category.label}
                </Text>
                {/* 4. Ngày tháng - Dùng màu variant (xám nhạt) */}
                <Text style={[styles.itemDate, { color: theme.colors.onSurfaceVariant }]}>
                    {item.formattedDate}
                </Text>
            </View>

            {/* 5. Số tiền - Thu nhập giữ màu xanh, Chi tiêu đổi theo theme */}
            <Text style={[
                styles.itemAmount,
                {
                    color: item.type === 'income'
                        ? '#10B981' // Màu xanh emerald (giữ nguyên cho nổi)
                        : theme.colors.onSurface // Tự đổi theo mode
                }
            ]}>
                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingVertical: 16 // Tăng padding một chút nhìn cho thoáng
    },
    itemIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemInfo: { flex: 1, marginLeft: 15 },
    itemTitle: { fontSize: 15, fontWeight: '700' },
    itemDate: { fontSize: 12, marginTop: 2 },
    itemAmount: { fontSize: 16, fontWeight: 'bold' }
});

export default TransactionItem;