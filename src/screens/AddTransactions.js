import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, Alert, Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addTransaction } from '../services/transactionService';

const AddTransactionScreen = ({ navigation }) => {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('Ăn uống');
    const [note, setNote] = useState('');
    const [isAmountFocused, setIsAmountFocused] = useState(false);

    const categories = {
        expense: [
            { name: 'Ăn uống', icon: 'food-fork-drink', color: '#FF9500' },
            { name: 'Di chuyển', icon: 'car', color: '#007AFF' },
            { name: 'Mua sắm', icon: 'cart', color: '#5856D6' },
            { name: 'Giải trí', icon: 'controller-classic', color: '#FF2D55' },
            { name: 'Sức khỏe', icon: 'medical-bag', color: '#34C759' },
            { name: 'Hóa đơn', icon: 'receipt', color: '#FF9500' },
            { name: 'Giáo dục', icon: 'school', color: '#5AC8FA' },
            { name: 'Khác', icon: 'dots-horizontal-circle', color: '#8E8E93' },
        ],
        income: [
            { name: 'Lương', icon: 'cash-multiple', color: '#34C759' },
            { name: 'Thưởng', icon: 'gift', color: '#FF9500' },
            { name: 'Đầu tư', icon: 'chart-line', color: '#5AC8FA' },
            { name: 'Bán hàng', icon: 'storefront', color: '#5856D6' },
            { name: 'Khác', icon: 'wallet-plus', color: '#8E8E93' },
        ]
    };

    const handleSave = async () => {
        if (!amount || amount === '0') {
            Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
            return;
        }
        const success = await addTransaction(amount, type, category, note);
        if (success) {
            Alert.alert("Thành công", "Giao dịch đã được lưu!");
            navigation.goBack();
        }
    };

    const formatAmount = (value) => {
        const number = value.replace(/[^0-9]/g, '');
        if (!number) return '';
        return new Intl.NumberFormat('vi-VN').format(parseInt(number));
    };

    const getCurrentCategories = () => categories[type];
    const selectedCategoryData = getCurrentCategories().find(c => c.name === category);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Giao dịch mới</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <LinearGradient
                    colors={type === 'expense' ? ['#FF6B6B', '#EE5A6F'] : ['#51CF66', '#47C95E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.amountCard}
                >
                    <View style={styles.amountCardDecor1} />
                    <View style={styles.amountCardDecor2} />
                    
                    <View style={styles.amountCardContent}>
                        <View style={styles.typeIconWrapper}>
                            <MaterialCommunityIcons 
                                name={type === 'expense' ? 'arrow-up-circle' : 'arrow-down-circle'} 
                                size={32} 
                                color="#FFFFFF" 
                            />
                        </View>
                        <Text style={styles.amountLabel}>
                            {type === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
                        </Text>
                        
                        <View style={styles.amountInputWrapper}>
                            <Text style={styles.currencySymbol}>₫</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0"
                                keyboardType="numeric"
                                value={formatAmount(amount)}
                                onChangeText={(text) => setAmount(text.replace(/\D/g, ''))}
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                onFocus={() => setIsAmountFocused(true)}
                                onBlur={() => setIsAmountFocused(false)}
                            />
                        </View>
                    </View>
                </LinearGradient>

                {/* Type Switcher */}
                <View style={styles.typeSwitcher}>
                    <TouchableOpacity
                        style={[styles.typeOption, type === 'expense' && styles.typeOptionActive]}
                        onPress={() => {
                            setType('expense');
                            setCategory('Ăn uống');
                        }}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={type === 'expense' ? ['#FF6B6B', '#EE5A6F'] : ['#F1F5F9', '#F1F5F9']}
                            style={styles.typeGradient}
                        >
                            <MaterialCommunityIcons 
                                name="arrow-up-circle-outline" 
                                size={22} 
                                color={type === 'expense' ? '#FFFFFF' : '#64748B'} 
                            />
                            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
                                Chi tiêu
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.typeOption, type === 'income' && styles.typeOptionActive]}
                        onPress={() => {
                            setType('income');
                            setCategory('Lương');
                        }}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={type === 'income' ? ['#51CF66', '#47C95E'] : ['#F1F5F9', '#F1F5F9']}
                            style={styles.typeGradient}
                        >
                            <MaterialCommunityIcons 
                                name="arrow-down-circle-outline" 
                                size={22} 
                                color={type === 'income' ? '#FFFFFF' : '#64748B'} 
                            />
                            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
                                Thu nhập
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Category Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="shape" size={20} color="#667EEA" />
                        <Text style={styles.sectionTitle}>Chọn danh mục</Text>
                    </View>

                    <View style={styles.categoryGrid}>
                        {getCurrentCategories().map((item) => {
                            const isSelected = category === item.name;
                            return (
                                <TouchableOpacity
                                    key={item.name}
                                    style={[
                                        styles.categoryItem,
                                        isSelected && styles.categoryItemSelected
                                    ]}
                                    onPress={() => setCategory(item.name)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.categoryIconWrapper,
                                        { backgroundColor: item.color + '15' },
                                        isSelected && { backgroundColor: item.color }
                                    ]}>
                                        <MaterialCommunityIcons
                                            name={item.icon}
                                            size={24}
                                            color={isSelected ? '#FFFFFF' : item.color}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.categoryName,
                                        isSelected && styles.categoryNameSelected
                                    ]}>
                                        {item.name}
                                    </Text>
                                    {isSelected && (
                                        <View style={styles.checkMark}>
                                            <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Note Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="note-text" size={20} color="#667EEA" />
                        <Text style={styles.sectionTitle}>Ghi chú</Text>
                    </View>

                    <View style={styles.noteCard}>
                        <MaterialCommunityIcons name="pencil-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.noteInput}
                            placeholder="Thêm ghi chú cho giao dịch này..."
                            placeholderTextColor="#CBD5E0"
                            value={note}
                            onChangeText={setNote}
                            multiline
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity 
                    activeOpacity={0.85} 
                    style={styles.saveButton}
                    onPress={handleSave}
                >
                    <LinearGradient 
                        colors={['#667EEA', '#764BA2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.saveGradient}
                    >
                        <MaterialCommunityIcons name="check-circle" size={24} color="#FFFFFF" />
                        <Text style={styles.saveText}>Lưu giao dịch</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FAFBFF' 
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    placeholder: {
        width: 40,
    },
    scrollContent: { 
        padding: 20,
        paddingTop: 24,
    },
    amountCard: {
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 8,
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        position: 'relative',
    },
    amountCardDecor1: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -30,
        right: -30,
    },
    amountCardDecor2: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        bottom: -20,
        left: -20,
    },
    amountCardContent: {
        padding: 28,
        alignItems: 'center',
    },
    typeIconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    amountLabel: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    amountInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    currencySymbol: {
        fontSize: 32,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '700',
        marginRight: 8,
    },
    amountInput: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
        minWidth: 100,
        textAlign: 'center',
    },
    typeSwitcher: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 28,
    },
    typeOption: {
        flex: 1,
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    typeOptionActive: {
        elevation: 4,
        shadowOpacity: 0.15,
    },
    typeGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    typeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748B',
    },
    typeTextActive: {
        color: '#FFFFFF',
    },
    section: {
        marginBottom: 28,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryItem: {
        width: '31%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F1F5F9',
        position: 'relative',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
    },
    categoryItemSelected: {
        borderColor: '#667EEA',
        backgroundColor: '#F5F7FF',
        elevation: 3,
        shadowOpacity: 0.1,
    },
    categoryIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        textAlign: 'center',
    },
    categoryNameSelected: {
        color: '#667EEA',
    },
    checkMark: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#667EEA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noteCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: '#F1F5F9',
        alignItems: 'flex-start',
        minHeight: 80,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
    },
    noteInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
        textAlignVertical: 'top',
    },
    saveButton: {
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        marginTop: 8,
    },
    saveGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    saveText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});

export default AddTransactionScreen;