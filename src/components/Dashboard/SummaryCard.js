import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// 1. Import useTheme
import { useTheme } from 'react-native-paper'; 

const SummaryCard = ({ totalBalance, income, expense, selectedPeriod, onPeriodChange, formatCurrency }) => {
    // 2. Khai báo theme
    const theme = useTheme(); 

    return (
        <LinearGradient
            colors={['#3B82F6', '#4F46E5', '#7C3AED']}
            style={[
                styles.balanceCard, 
                // 3. Tăng shadowColor để card "phát sáng" trong tối
                { shadowColor: theme.dark ? '#4F46E5' : '#000' }
            ]}
        >
            <View style={styles.balanceHeader}>
                <View>
                    <Text style={styles.balanceLabel}>Tổng số dư</Text>
                    <Text style={[
                        styles.balanceValue,
                        { 
                            // 4. Nếu số dư âm, dùng màu error của theme thay vì đỏ cứng
                            color: totalBalance < 0 ? theme.colors.error : '#FFFFFF' 
                        }
                    ]}>
                        {formatCurrency(totalBalance)}
                    </Text>
                </View>
                
                {/* Selector cho thời gian */}
                <View style={styles.periodSelector}>
                    {['week', 'month', 'year'].map((p) => (
                        <TouchableOpacity
                            key={p}
                            onPress={() => onPeriodChange(p)}
                            style={[
                                styles.periodTab, 
                                selectedPeriod === p && styles.periodTabActive
                            ]}
                        >
                            <Text style={[
                                styles.periodText, 
                                selectedPeriod === p && styles.periodTextActive
                            ]}>
                                {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.statsRow}>
                {/* Thu nhập */}
                <View style={styles.statBox}>
                    <View style={styles.statIconBadgeGreen}>
                        <MaterialCommunityIcons name="arrow-down-left" size={16} color="#86EFAC" />
                    </View>
                    <View>
                        <Text style={styles.statLabel}>Thu nhập</Text>
                        <Text style={styles.statAmount}>{formatCurrency(income)}</Text>
                    </View>
                </View>

                {/* Chi tiêu */}
                <View style={styles.statBox}>
                    <View style={styles.statIconBadgeRed}>
                        <MaterialCommunityIcons name="arrow-up-right" size={16} color="#FCA5A5" />
                    </View>
                    <View>
                        <Text style={styles.statLabel}>Chi tiêu</Text>
                        <Text style={styles.statAmount}>{formatCurrency(expense)}</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};
const styles = StyleSheet.create({
    balanceCard: { borderRadius: 24, padding: 20, elevation: 8, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
    balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
    balanceLabel: { color: '#E0E7FF', fontSize: 14, fontWeight: '500' },
    balanceValue: { color: 'white', fontSize: 30, fontWeight: 'bold', marginTop: 4 },

    periodSelector: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 3 },
    periodTab: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    periodTabActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
    periodText: { color: '#E0E7FF', fontSize: 12 },
    periodTextActive: { color: 'white', fontWeight: 'bold' },

    statsRow: { flexDirection: 'row', gap: 12 },
    statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    statIconBadgeGreen: { width: 30, height: 30, backgroundColor: 'rgba(74, 222, 128, 0.2)', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    statIconBadgeRed: { width: 30, height: 30, backgroundColor: 'rgba(248, 113, 113, 0.2)', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    statLabel: { color: '#E0E7FF', fontSize: 11 },
    statAmount: { color: 'white', fontSize: 15, fontWeight: 'bold' },
})
export default SummaryCard;