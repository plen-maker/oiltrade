import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNijRPwCpzoNFYPGmZfvvBSuaHSzAVtcU",
  authDomain: "oiltrade-3.firebaseapp.com",
  projectId: "oiltrade-3",
  storageBucket: "oiltrade-3.firebasestorage.app",
  messagingSenderId: "800520087079",
  appId: "1:800520087079:android:654abff0e3c23c365bd002",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });
