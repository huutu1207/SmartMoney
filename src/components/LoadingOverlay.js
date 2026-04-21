import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const LoadingOverlay = ({ visible, message }) => {
    const theme = useTheme();
    const rotateValue = useRef(new Animated.Value(0)).current;

    const scaleValue = rotateValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.2, 1],
    });

    useEffect(() => {
        if (visible) {
            Animated.loop(
                Animated.timing(rotateValue, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            rotateValue.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={styles.fullScreen}>
            <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                    <MaterialCommunityIcons
                        name="piggy-bank"
                        size={50}
                        color={theme.colors.primary}
                    />
                </Animated.View>
                <Text style={[styles.text, { color: theme.colors.onSurface }]}>
                    {message}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        elevation: 10,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: 160,
        padding: 25,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default LoadingOverlay;