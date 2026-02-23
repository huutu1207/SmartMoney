import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { deleteTransaction } from '../services/transactionService';
//import component
import SummaryCard from '../components/Dashboard/SummaryCard';
import TransactionItem from '../components/Dashboard/TransactionItem';
import { CATEGORY_CONFIG } from '../constants/categories';
//5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25 SHA1
const { width } = Dimensions.get('window');



const mockTransactions = [
    { id: 't1', title: 'Cơm trưa văn phòng', date: 'Hôm nay, 12:30', amount: -55000, type: 'expense', category: 'food' },
    { id: 't2', title: 'Lương tháng 8', date: 'Hôm qua, 09:00', amount: 15000000, type: 'income', category: 'salary' },
    { id: 't3', title: 'Đổ xăng xe máy', date: '25/08, 17:45', amount: -80000, type: 'expense', category: 'transport' },
    { id: 't4', title: 'Cafe với bạn', date: '24/08, 20:00', amount: -65000, type: 'expense', category: 'food' },
    { id: 't5', title: 'Mua sắm siêu thị', date: '23/08, 10:15', amount: -1200000, type: 'expense', category: 'shopping' },
];



const Dashboard = ({ navigation }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [transactions, setTransactions] = useState([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(Math.abs(amount));
    };
    const confirmDelete = (id) => {
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không thể hoàn tác.",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        const success = await deleteTransaction(id);
                        if (success) {
                            // console dẻ kiem tra
                            console.log("Xóa thành công");
                        }
                    }
                }
            ]
        );
    };
    // Lắng nghe dữ liệu thời gian thực từ Firestore
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const userId = user.uid;
        const q = query(
            collection(db, "transactions"),
            where("userId", "==", userId),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let transList = [];
            let tempIncome = 0;
            let tempExpense = 0;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const dateObj = data.date?.toDate() || new Date();
                const displayDate = dateObj.toLocaleDateString('vi-VN') + ', ' + dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                transList.push({
                    id: doc.id,
                    ...data,
                    formattedDate: displayDate
                });

                if (data.type === 'income') tempIncome += data.amount;
                else tempExpense += data.amount;
            });

            setTransactions(transList);
            setIncome(tempIncome);
            setExpense(tempExpense);
            setTotalBalance(tempIncome - tempExpense);
        }, (error) => {
            console.error("Firestore Error:", error);
        });

        return () => unsubscribe();
    }, []);

    return (

        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerInfo}>
                    <LinearGradient
                        colors={['#3B82F6', '#4F46E5']}
                        style={styles.logoIcon}
                    >
                        <MaterialCommunityIcons name="wallet" size={24} color="white" />
                    </LinearGradient>
                    <View>
                        <Text style={styles.headerTitle}>Money Manager</Text>
                        <Text style={styles.headerSub}>Chào buổi sáng! 👋</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.chartButton}>
                    <MaterialCommunityIcons name="chart-pie" size={22} color="#4B5563" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>

                {/* Balance Card với Linear Gradient */}
                {/* <LinearGradient
                    colors={['#3B82F6', '#4F46E5', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.balanceCard}
                >
                    <View style={styles.balanceHeader}>
                        <View>
                            <Text style={styles.balanceLabel}>Tổng số dư</Text>
                            <Text style={styles.balanceValue}>{formatCurrency(totalBalance)}</Text>
                        </View>
                        <View style={styles.periodSelector}>
                            {['week', 'month', 'year'].map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    onPress={() => setSelectedPeriod(p)}
                                    style={[styles.periodTab, selectedPeriod === p && styles.periodTabActive]}
                                >
                                    <Text style={[styles.periodText, selectedPeriod === p && styles.periodTextActive]}>
                                        {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <View style={styles.statIconBadgeGreen}>
                                <MaterialCommunityIcons name="arrow-down-left" size={16} color="#86EFAC" />
                            </View>
                            <View>
                                <Text style={styles.statLabel}>Thu nhập</Text>
                                <Text style={styles.statAmount}>{formatCurrency(income)}</Text>
                            </View>
                        </View>
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
                </LinearGradient> */}
                <SummaryCard totalBalance={totalBalance}
                    income={income}
                    expense={expense}
                    selectedPeriod={selectedPeriod}
                    onPeriodChange={setSelectedPeriod}
                    formatCurrency={formatCurrency} />


                {/* Quick Actions */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.scanBtn} activeOpacity={0.8}>
                        <LinearGradient colors={['#3B82F6', '#4F46E5']} style={styles.actionIcon}>
                            <MaterialCommunityIcons name="camera" size={28} color="white" />
                        </LinearGradient>
                        <View style={styles.actionTextContent}>
                            <Text style={styles.actionTitle}>Quét hóa đơn</Text>
                            <Text style={styles.actionSub}>AI tự động nhận diện</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}
                        onPress={() => navigation.navigate('AddTransaction')}
                    >
                        <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.actionIconSmall}>
                            <MaterialCommunityIcons name="plus" size={28} color="white" />
                        </LinearGradient>
                        <Text style={styles.addBtnText}>Nhập tay</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.listContainer}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>Giao dịch gần đây</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Xem tất cả →</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.transactionList}>
                        {transactions.length === 0 ? (
                            <Text style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>
                                Chưa có giao dịch nào
                            </Text>
                        ) : (
                            transactions.map((item) => (
                                <TransactionItem
                                    key={item.id}
                                    item={item}
                                    formatCurrency={formatCurrency}
                                    onPress={() => navigation.navigate('AddTransaction', { transaction: item })}
                                    onLongPress={() => confirmDelete(item.id)}
                                />
                            ))
                        )}
                    </View>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
    },
    headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    logoIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    headerSub: { fontSize: 13, color: '#6B7280' },
    chartButton: { width: 40, height: 40, backgroundColor: '#F3F4F6', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

    scrollBody: { padding: 20 },

    // balanceCard: { borderRadius: 24, padding: 20, elevation: 8, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
    // balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
    // balanceLabel: { color: '#E0E7FF', fontSize: 14, fontWeight: '500' },
    // balanceValue: { color: 'white', fontSize: 30, fontWeight: 'bold', marginTop: 4 },

    // periodSelector: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 3 },
    // periodTab: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    // periodTabActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
    // periodText: { color: '#E0E7FF', fontSize: 12 },
    // periodTextActive: { color: 'white', fontWeight: 'bold' },

    // statsRow: { flexDirection: 'row', gap: 12 },
    // statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    // statIconBadgeGreen: { width: 30, height: 30, backgroundColor: 'rgba(74, 222, 128, 0.2)', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    // statIconBadgeRed: { width: 30, height: 30, backgroundColor: 'rgba(248, 113, 113, 0.2)', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    // statLabel: { color: '#E0E7FF', fontSize: 11 },
    // statAmount: { color: 'white', fontSize: 15, fontWeight: 'bold' },

    actionRow: { flexDirection: 'row', gap: 12, marginTop: 25 },
    scanBtn: { flex: 2, backgroundColor: 'white', borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12, borderWeight: 1, borderColor: '#F1F5F9', elevation: 2 },
    actionIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    actionTextContent: { flex: 1 },
    actionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    actionSub: { fontSize: 12, color: '#64748B' },

    addBtn: { flex: 1, backgroundColor: 'white', borderRadius: 20, padding: 15, alignItems: 'center', justifyContent: 'center', borderWeight: 1, borderColor: '#F1F5F9', elevation: 2 },
    actionIconSmall: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    addBtnText: { fontSize: 12, fontWeight: '700', color: '#475569' },

    listContainer: { marginTop: 25 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    listTitle: { fontSize: 19, fontWeight: 'bold', color: '#1E293B' },
    seeAllText: { color: '#3B82F6', fontSize: 14, fontWeight: '600' },

    // transactionList: { backgroundColor: 'white', borderRadius: 24, padding: 8, elevation: 1 },
    // transactionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16 },
    // itemIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    // itemInfo: { flex: 1, marginLeft: 15 },
    // itemTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    // itemDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    // itemAmount: { fontSize: 16, fontWeight: 'bold' }
});

export default Dashboard;