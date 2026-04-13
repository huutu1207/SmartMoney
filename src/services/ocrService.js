import { GoogleGenerativeAI } from "@google/generative-ai";
import * as FileSystem from 'expo-file-system/legacy';
import TextRecognition from '@react-native-ml-kit/text-recognition';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Hàm chuẩn hóa ngày tháng
const parseDateString = (dateStr) => {
    try {
        if (!dateStr) return new Date();
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    } catch (e) {
        return new Date();
    }
};

export const extractWithRegex = (text) => {
    if (!text) return { amount: 0, date: new Date().toISOString(), shop: "Cửa hàng" };

    let amount = 0;
    const lines = text.split('\n');
    const shop = lines[0] || "Cửa hàng";

    // 1. Tìm số tiền
    const amountMatches = text.match(/([\d.,]{5,})/g);
    if (amountMatches) {
        const numbers = amountMatches.map(m =>
            parseInt(m.replace(/[.,d]/g, ''))
        ).filter(n => n >= 1000 && n < 10000000);
        if (numbers.length > 0) amount = Math.max(...numbers);
    }

    // 2. Tìm ngày tháng
    const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    const dateStr = dateMatch ? dateMatch[0] : "20/03/2026";

    return {
        amount,
        date: parseDateString(dateStr).toISOString(), // Luôn trả về ISO String
        shop
    };
};

export const extractInfoWithGemini = async (rawText, userCategories) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        
        const categoryListString = userCategories.join(", ");

        const prompt = `Đây là nội dung hóa đơn: "${rawText}". 
        Hãy trích xuất thông tin và CHỈ ĐƯỢC CHỌN 1 danh mục từ danh sách: [${categoryListString}].
        Nếu không khớp, chọn "Khác".

        Trả về duy nhất định dạng JSON: 
        {"amount": 143640, "date": "20/03/2026", "shop": "Lẩu gà lá é", "category": "Ăn uống"}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const data = JSON.parse(text.replace(/```json|```/g, "").trim());

        return {
            ...data,
            date: parseDateString(data.date).toISOString() // Đồng bộ chuẩn ISO
        };
    } catch (error) {
        console.log("Lỗi Gemini:", error.message);
        const fallback = extractWithRegex(rawText);
        return { ...fallback, category: "Khác" };
    }
};

export const scanTextLocally = async (imageUri) => {
    try {
        const result = await TextRecognition.recognize(imageUri);
        return result.text;
    } catch (error) {
        return null;
    }
};