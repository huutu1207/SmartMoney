import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// 1. Import useTheme
import { useTheme } from 'react-native-paper';

// THÊM: categoryStyle vào danh sách props nhận từ Dashboard
const TransactionItem = ({ item, onPress, onLongPress, formatCurrency, categoryStyle }) => {
    const theme = useTheme();

    // XÓA: Dòng const category cũ vì mình sẽ dùng categoryStyle do Dashboard truyền sang
    // Dữ liệu này đã bao gồm icon và màu sắc chính xác từ Firestore
    const displayStyle = categoryStyle;

    return (
        <TouchableOpacity
            style={[
                styles.transactionItem,
                { borderBottomColor: theme.colors.outlineVariant, borderBottomWidth: 0.5 }
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={300}
        >
            {/* Dùng icon và màu từ displayStyle (đã tính toán ở Dashboard) */}
            <View style={[styles.itemIconBox, { backgroundColor: displayStyle.color + '20' }]}>
                <MaterialCommunityIcons name={displayStyle.icon} size={24} color={displayStyle.color} />
            </View>

            <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>
                    {/* Ưu tiên hiển thị ghi chú, nếu không có mới hiện nhãn danh mục */}
                    {item.note || displayStyle.label}
                </Text>
                <Text style={[styles.itemDate, { color: theme.colors.onSurfaceVariant }]}>
                    {item.formattedDate}
                </Text>
            </View>

            <Text style={[
                styles.itemAmount,
                {
                    color: item.type === 'income'
                        ? '#10B981' 
                        : theme.colors.onSurface 
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
        paddingVertical: 16 
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