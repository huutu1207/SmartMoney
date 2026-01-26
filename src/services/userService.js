import { db, auth } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const getUserProfile = async () => {
    const user = auth.currentUser;
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return {
            fullName: user.displayName,
            email: user.email,
            avatarUrl: user.photoURL,
        };
    }
};

export const updateUserProfile = async (data) => {
    const user = auth.currentUser;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, data, { merge: true });
};