import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CATEGORY_CONFIG } from '../../constants/categories';

const CategoryPicker = ({ selectedCategory, onSelect, type }) => {
    const categories = Object.values(CATEGORY_CONFIG).filter(cat => cat.type === type);

    return (
        <View style={styles.categoryGrid}>
            {categories.map((item) => {
                const isSelected = selectedCategory === item.label;
                return (
                    <TouchableOpacity
                        key={item.label}
                        style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
                        onPress={() => onSelect(item.label)}
                    >
                        <View style={[styles.categoryIconWrapper, { backgroundColor: item.color + (isSelected ? '' : '15') }, isSelected && { backgroundColor: item.color }]}>
                            <MaterialCommunityIcons name={item.icon} size={24} color={isSelected ? '#FFFFFF' : item.color} />
                        </View>
                        <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>{item.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
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
    }
})