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

const getPeriodRange = (period) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    switch (period) {
        case 'week':
            // JS: CN = 0, T2 = 1, ..., T7 = 6
            const day = now.getDay();
            // Tính khoảng cách đến Thứ 2 (nếu là CN (0) thì lùi 6 ngày, còn lại lùi day - 1)
            const diffToMonday = currentDate - (day === 0 ? 6 : day - 1);
            const monday = new Date(now.setDate(diffToMonday));
            monday.setHours(0, 0, 0, 0);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);

            return { start: monday, end: sunday };

        case 'month':
            const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
            const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
            return { start: firstDayOfMonth, end: lastDayOfMonth };

        case 'year':
            const firstDayOfYear = new Date(currentYear, 0, 1);
            const lastDayOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
            return { start: firstDayOfYear, end: lastDayOfYear };

        default:
            return { start: null, end: null };
    }
};

const Dashboard = ({ navigation }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [transactions, setTransactions] = useState([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);

    const formatCurrency = (amount) => {
        const safeAmount = Number(amount) || 0
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            signDisplay: 'auto'
        }).format(safeAmount);
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
        const { start, end } = getPeriodRange(selectedPeriod);

        // Xây dựng Query với giới hạn 2 đầu thời gian
        let q = query(
            collection(db, "transactions"),
            where("userId", "==", user.uid),
            where("date", ">=", start),
            where("date", "<=", end),
            orderBy("date", "desc")
        );

        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let tempIncome = 0;
            let tempExpense = 0;

            const transList = querySnapshot.docs.map(doc => {
                const data = doc.data();

                const dateObj = data.date?.toDate() || new Date();

                const displayDate = dateObj.toLocaleDateString('vi-VN') +
                    ', ' +
                    dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                if (data.type === 'income') tempIncome += data.amount;
                else tempExpense += data.amount;

                return {
                    id: doc.id,
                    ...data,
                    formattedDate: displayDate // Cần cái này để TransactionItem hiển thị
                };
            });

            setTransactions(transList);
            setIncome(tempIncome);
            setExpense(tempExpense);
            setTotalBalance(tempIncome - tempExpense);
        });
        return () => unsubscribe();
    }, [selectedPeriod]);

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


});

export default Dashboard;