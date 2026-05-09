import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, GoogleAuthProvider, signInWithCredential, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

const AuthContext = createContext(null);

const isNative = () => {
  return typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.();
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNative()) {
      GoogleAuth.initialize({
        clientId: "851289814310-8rtgnue15cr0d7364vqln7iabijtqnlj.apps.googleusercontent.com",
        scopes: ["profile", "email"],
        grantOfflineAccess: true,
      });
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photo: firebaseUser.photoURL,
            role: "member",
            createdAt: new Date(),
          });
        }
        const data = snap.exists() ? snap.data() : { role: "member" };
        setUser({ ...firebaseUser, role: data.role || "member" });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithGoogle = async () => {
    if (isNative()) {
      const googleUser = await GoogleAuth.signIn();
      const credential = GoogleAuthProvider.credential(
        googleUser.authentication.idToken
      );
      return signInWithCredential(auth, credential);
    } else {
      const { signInWithPopup } = await import("firebase/auth");
      const { googleProvider } = await import("../firebase");
      return signInWithPopup(auth, googleProvider);
    }
  };

  const logout = async () => {
    if (isNative()) {
      try { await GoogleAuth.signOut(); } catch {}
    }
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
