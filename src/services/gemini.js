import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_CHATBOT_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const getFinancialAdvice = async (userData) => {
    console.log("Bắt đầu gọi Gemini với dữ liệu:", userData);
    try {
        console.log("Dữ liệu gửi đến Gemini:");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Cập nhật sang model mới hơn
        console.log("Đang gọi Gemini với dữ liệu:", userData);
        const prompt = `
            Bạn là chuyên gia tài chính của SmartMoney. 
            Người dùng: ${userData.name}.
            Dữ liệu tháng này: Thu nhập ${userData.income}đ, Chi tiêu ${userData.expense}đ.
            Cảnh báo: Danh mục "${userData.topCategory}" đang chiếm nhiều nhất với ${userData.topAmount}đ.
    
            Nhiệm vụ:
            1. Nhận xét ngắn gọn về tỷ lệ thu chi (ổn hay đang báo động).
            2. Đưa ra 1 hành động CỤ THỂ để tiết kiệm cho danh mục "${userData.topCategory}".
            3. Trả lời bằng văn bản thuần túy (Plain Text), KHÔNG sử dụng định dạng Markdown (như dấu * hoặc _).
            4. Không nói sáo rỗng, dùng ngôn ngữ Gen Z thân thiện. Trả lời dưới 60 từ.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return null;
    }
};