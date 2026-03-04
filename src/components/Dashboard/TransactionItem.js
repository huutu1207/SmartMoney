import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CATEGORY_CONFIG } from '../../constants/categories';


const TransactionItem = ({ item, onPress, onLongPress, formatCurrency }) => {
    const category = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.default;
    
    return (
        <TouchableOpacity 
            style={styles.transactionItem} 
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={300}
        >
            <View style={[styles.itemIconBox, { backgroundColor: category.color + '15' }]}>
                <MaterialCommunityIcons name={category.icon} size={24} color={category.color} />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.note || category.label}</Text>
                <Text style={styles.itemDate}>{item.formattedDate}</Text>
            </View>
            <Text style={[styles.itemAmount, { color: item.type === 'income' ? '#059669' : '#111827' }]}>
                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create ({
    transactionList: { backgroundColor: 'white', borderRadius: 24, padding: 8, elevation: 1 },
    transactionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16 },
    itemIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    itemInfo: { flex: 1, marginLeft: 15 },
    itemTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    itemDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    itemAmount: { fontSize: 16, fontWeight: 'bold' }
});

export default TransactionItem;