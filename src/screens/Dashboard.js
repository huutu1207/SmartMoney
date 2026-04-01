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
import * as ImagePicker from 'expo-image-picker'
//5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25 SHA1
const { width } = Dimensions.get('window');


const getPeriodRange = (period, anchorDate) => {
    const year = anchorDate.getFullYear();
    const month = anchorDate.getMonth();
    const date = anchorDate.getDate();

    switch (period) {
        case 'week':
            const day = anchorDate.getDay();
            const diffToMonday = date - (day === 0 ? 6 : day - 1);
            const monday = new Date(anchorDate);
            monday.setDate(diffToMonday);
            monday.setHours(0, 0, 0, 0);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);
            return { start: monday, end: sunday };

        case 'month':
            const startMonth = new Date(year, month, 1, 0, 0, 0, 0);
            const endMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
            return { start: startMonth, end: endMonth };

        case 'year':
            const startYear = new Date(year, 0, 1, 0, 0, 0, 0);
            const endYear = new Date(year, 11, 31, 23, 59, 59, 999);
            return { start: startYear, end: endYear };

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
    const [currentDate, setCurrentDate] = useState(new Date());
    const formatCurrency = (amount) => {
        const safeAmount = Number(amount) || 0
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            signDisplay: 'auto'
        }).format(safeAmount);
    };

    const handleScanPress = () => {
        Alert.alert(
            "Quét hóa đơn",
            "Bạn muốn chọn ảnh từ đâu?",
            [
                { text: "Chụp ảnh mới", onPress: takePhoto },
                { text: "Chọn từ Thư viện", onPress: pickImage },
                { text: "Hủy", style: "cancel" }
            ]
        );
    };
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return Alert.alert("Lỗi", "Cần quyền camera!");

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, // Cho phép cắt ảnh hóa đơn cho gọn
            quality: 1, // Độ phân giải cao nhất để AI Tuần 8 dễ đọc
        });

        if (!result.canceled) {
            // Chuyển sang màn hình xem trước (mình sẽ làm ở bước sau)
            navigation.navigate('ScanPreview', { imageUri: result.assets[0].uri });
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            navigation.navigate('ScanPreview', { imageUri: result.assets[0].uri });
        }
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
    const changePeriod = (direction) => {
        const newDate = new Date(currentDate);
        const step = direction === 'next' ? 1 : -1;

        if (selectedPeriod === 'month') {
            newDate.setMonth(newDate.getMonth() + step);
        } else if (selectedPeriod === 'week') {
            newDate.setDate(newDate.getDate() + (step * 7));
        } else if (selectedPeriod === 'year') {
            newDate.setFullYear(newDate.getFullYear() + step);
        }
        setCurrentDate(newDate);
    };
    const formatPeriodLabel = () => {
        if (selectedPeriod === 'month') {
            return `Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`;
        }
        if (selectedPeriod === 'year') {
            return `Năm ${currentDate.getFullYear()}`;
        }
    };
    // Lắng nghe dữ liệu thời gian thực từ Firestore
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const userId = user.uid;
        const { start, end } = getPeriodRange(selectedPeriod, currentDate);

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
    }, [selectedPeriod, currentDate]);

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
                <View style={styles.dateNavigation}>

                    <TouchableOpacity onPress={() => changePeriod('prev')} style={styles.navBtn}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#3B82F6" />
                    </TouchableOpacity>

                    <View style={styles.dateLabelContainer}>
                        <MaterialCommunityIcons name="calendar-month-outline" size={18} color="rgba(27, 142, 187, 0.7)" />
                        <Text style={styles.dateLabel}>{formatPeriodLabel(currentDate, selectedPeriod)}</Text>
                    </View>

                    <TouchableOpacity onPress={() => changePeriod('next')} style={styles.navBtn}>
                        <MaterialCommunityIcons name="chevron-right" size={28} color="#3B82F6" />
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.scanBtn} activeOpacity={0.8} onPress={handleScanPress}>
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

    dateNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        marginTop: -10, // Kéo sát lên SummaryCard cho đẹp
        marginBottom: 10,
    },
    navBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF', // Nút trắng nổi bật
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    dateLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EFF6FF', // Xanh nhạt tinh tế
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3B82F6',
    },

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