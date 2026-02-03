import { db, auth } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, deleteDoc} from 'firebase/firestore';

export const addTransaction = async (amount, type, category, note) => {
    try {
        const userId = auth.currentUser.uid;

        await addDoc(collection(db, "transactions"), {
            userId: userId,
            amount: Number(amount),
            type: type,
            category: category,
            note: note,
            date: serverTimestamp(),
        });

        console.log("Giao dịch đã được lưu!");
        return true;
    } catch (error) {
        console.error("Lỗi khi lưu giao dịch: ", error);
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