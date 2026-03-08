import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ICON_LIST, COLOR_LIST } from '../constants/icon';

const AddCategoryScreen = ({ navigation, route }) => {
    const [type, setType] = useState(route.params?.type || 'expense');
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('tag-outline');
    const [selectedColor, setSelectedColor] = useState('#667EEA');
    const [isNameFocused, setIsNameFocused] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tên danh mục");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Lỗi", "Bạn cần đăng nhập để thực hiện tính năng này");
            return;
        }

        try {
            await addDoc(collection(db, "categories"), {
                userId: user.uid,           
                name: name.trim(),          
                icon: selectedIcon,         
                color: selectedColor,      
                type: type,                
                createdAt: serverTimestamp() 
            });

            Alert.alert("Thành công", "Danh mục đã được tạo!");
            navigation.goBack();

        } catch (error) {
            console.error("Lỗi khi lưu danh mục:", error);
            Alert.alert("Lỗi", "Không thể lưu danh mục. Vui lòng thử lại sau.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo danh mục mới</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Preview Section với Gradient */}
                <LinearGradient
                    colors={type === 'expense' ? ['#FF6B6B', '#EE5A6F'] : ['#51CF66', '#47C95E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.previewSection}
                >
                    <View style={styles.previewDecor1} />
                    <View style={styles.previewDecor2} />

                    <View style={styles.previewContent}>
                        <Text style={styles.previewLabel}>Xem trước</Text>
                        <View style={styles.previewCard}>
                            <View style={[styles.categoryIconWrapper, { backgroundColor: selectedColor }]}>
                                <MaterialCommunityIcons name={selectedIcon} size={36} color="#FFFFFF" />
                            </View>
                            <Text style={styles.previewName}>
                                {name || "Tên danh mục"}
                            </Text>
                            <View style={styles.previewBadge}>
                                <Text style={styles.previewType}>
                                    {type === 'expense' ? 'Khoản chi' : 'Khoản thu'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Form Card */}
                <View style={styles.formCard}>
                    {/* Type Switcher */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="format-list-bulleted-type" size={20} color="#667EEA" />
                            <Text style={styles.sectionTitle}>Loại danh mục</Text>
                        </View>

                        <View style={styles.typeSwitcher}>
                            <TouchableOpacity
                                style={[styles.typeOption, type === 'expense' && styles.typeOptionActive]}
                                onPress={() => setType('expense')}
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
                                onPress={() => setType('income')}
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
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="format-title" size={20} color="#667EEA" />
                            <Text style={styles.sectionTitle}>Tên danh mục</Text>
                        </View>

                        <View style={[
                            styles.inputWrapper,
                            isNameFocused && styles.inputWrapperFocused
                        ]}>
                            <MaterialCommunityIcons name="text" size={20} color="#9CA3AF" />
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập tên danh mục..."
                                placeholderTextColor="#CBD5E0"
                                value={name}
                                onChangeText={setName}
                                maxLength={20}
                                onFocus={() => setIsNameFocused(true)}
                                onBlur={() => setIsNameFocused(false)}
                            />
                            <Text style={styles.charCount}>{name.length}/20</Text>
                        </View>
                    </View>

                    {/* Icon Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="emoticon-outline" size={20} color="#667EEA" />
                            <Text style={styles.sectionTitle}>Chọn biểu tượng</Text>
                        </View>

                        <View style={styles.iconGrid}>
                            {ICON_LIST.map(icon => {
                                const isSelected = selectedIcon === icon;
                                return (
                                    <TouchableOpacity
                                        key={icon}
                                        onPress={() => setSelectedIcon(icon)}
                                        style={[
                                            styles.iconBox,
                                            isSelected && {
                                                borderColor: selectedColor,
                                                backgroundColor: selectedColor + '15',
                                                elevation: 3,
                                            }
                                        ]}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialCommunityIcons
                                            name={icon}
                                            size={24}
                                            color={isSelected ? selectedColor : '#9CA3AF'}
                                        />
                                        {isSelected && (
                                            <View style={[styles.iconCheck, { backgroundColor: selectedColor }]}>
                                                <MaterialCommunityIcons name="check" size={10} color="#FFF" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Color Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="palette-outline" size={20} color="#667EEA" />
                            <Text style={styles.sectionTitle}>Chọn màu sắc</Text>
                        </View>

                        <View style={styles.colorGrid}>
                            {COLOR_LIST.map(color => {
                                const isSelected = selectedColor === color;
                                return (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => setSelectedColor(color)}
                                        style={styles.colorWrapper}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[
                                            styles.colorCircle,
                                            { backgroundColor: color },
                                            isSelected && styles.colorSelected
                                        ]}>
                                            {isSelected && (
                                                <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={[selectedColor, selectedColor + 'DD']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.saveGradient}
                        >
                            <MaterialCommunityIcons name="check-circle" size={24} color="#FFFFFF" />
                            <Text style={styles.saveText}>Tạo danh mục</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFF',
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
        paddingBottom: 20,
    },
    previewSection: {
        paddingTop: 40,
        paddingBottom: 50,
        position: 'relative',
        overflow: 'hidden',
    },
    previewDecor1: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -30,
        right: -30,
    },
    previewDecor2: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        bottom: -20,
        left: -20,
    },
    previewContent: {
        alignItems: 'center',
        zIndex: 1,
    },
    previewLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '600',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    previewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        minWidth: 180,
    },
    categoryIconWrapper: {
        width: 70,
        height: 70,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    previewName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    previewBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    previewType: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: -30,
        borderRadius: 28,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        zIndex: 2,
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    typeSwitcher: {
        flexDirection: 'row',
        gap: 12,
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        minHeight: 56,
    },
    inputWrapperFocused: {
        backgroundColor: '#FFFFFF',
        borderColor: '#667EEA',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
        marginLeft: 12,
    },
    charCount: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        // QUAN TRỌNG: Căn giữa toàn bộ các hàng icon
        justifyContent: 'center',
        gap: 10,
    },
    iconBox: {
        width: '17%', // Tăng nhẹ để lấp đầy khoảng trống tốt hơn
        height: '17%',
        aspectRatio: 1,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        // Tương tự icon, căn giữa các ô màu
        justifyContent: 'center',
        gap: 12,
    },
    iconCheck: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    colorWrapper: {
        padding: 4,
    },
    colorCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'transparent',

        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    colorSelected: {
        borderColor: '#FFFFFF',
        elevation: 6,
        shadowOpacity: 0.3,
        shadowRadius: 6,
        transform: [{ scale: 1.1 }],
    },
    saveButton: {
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        marginTop: 12,
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

export default AddCategoryScreen;