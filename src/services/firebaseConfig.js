import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey:process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: "smartmoney-fc077.firebaseapp.com",
    projectId: "smartmoney-fc077",
    storageBucket: "smartmoney-fc077.firebasestorage.app",
    messagingSenderId: "201189817902",
    appId: "1:201189817902:web:2cdd498a4aef52f65e29bf",
    measurementId: "G-NJ1QBK2JKF"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const storage = getStorage(app);

// export const auth = getAuth(app);
const db = getFirestore(app);

export { db, storage };
