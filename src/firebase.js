import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4syP6lOeg5JZCnTct4X_NoAhZN4TiDH4",
  authDomain: "oiltrade-3.firebaseapp.com",
  projectId: "oiltrade-3",
  storageBucket: "oiltrade-3.firebasestorage.app",
  messagingSenderId: "800520087079",
  appId: "1:800520087079:web:da137622548dfd275bd002",
  measurementId: "G-RHSTCY9L92",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
