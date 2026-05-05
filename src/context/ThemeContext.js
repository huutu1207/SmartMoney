import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Load theme ngay khi mở app
    useEffect(() => {
        loadSavedTheme();
    }, []);

    const loadSavedTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('user_theme');
            console.log("Dữ liệu lấy từ kho:", savedTheme); // Kiểm tra log ở terminal
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            }
        } catch (error) {
            console.log("Lỗi load theme:", error);
        }
    };

    const toggleTheme = async () => {
        try {
            const newMode = !isDarkMode;
            setIsDarkMode(newMode); // Cập nhật giao diện ngay lập tức
            
            const themeString = newMode ? 'dark' : 'light';
            await AsyncStorage.setItem('user_theme', themeString); // Lưu vào bộ nhớ
            console.log("Đã lưu vào kho:", themeString); // Kiểm tra log
        } catch (error) {
            console.log("Lỗi lưu theme:", error);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};