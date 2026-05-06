import { db, auth } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, deleteDoc} from 'firebase/firestore';

export const addTransaction = async (amount, type, category, note, date, icon, color) => {
    try {
        const userId = auth.currentUser.uid;
        await addDoc(collection(db, "transactions"), {
            userId: userId,
            amount: Number(amount),
            type: type,
            category: category,
            note: note,
            icon: icon,   // Dùng tham số vừa nhận được
            color: color, // Dùng tham số vừa nhận được
            // Lưu ý: Chỉ để 1 dòng date thôi Tú nhé, xóa cái serverTimestamp() ở date đi
            date: date || new Date(), 
            createdAt: serverTimestamp()
        });
        return true;
    } catch (e) {
        console.error("Lỗi khi thêm giao dịch: ", e);
        return false;
    }
};
export const updateTransaction = async (id, data) => {
    try {
        const transactionRef = doc(db, "transactions", id);
        await updateDoc(transactionRef, {
            ...data,
            updatedAt: new Date() 
        });
        return true;
    } catch (error) {
        console.error("Lỗi cập nhật giao dịch: ", error);
        return false;
    }
};

export const deleteTransaction = async (id) => {
    try {
        const transactionRef = doc(db, "transactions", id);
        await deleteDoc(transactionRef);
        return true;
    } catch (error) {
        console.error("Lỗi khi xóa giao dịch: ", error);
        return false;
    }
};