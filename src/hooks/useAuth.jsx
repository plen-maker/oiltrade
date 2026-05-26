import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebase";
import { getOrCreateUser } from "./useFirestore";
import { ADMIN_EMAIL } from "../data/constants";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const p = await getOrCreateUser(u, ADMIN_EMAIL);
        setProfile({ ...p, id: u.uid });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
  const loginWithGoogle = async () => {
    try {
      const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
      const result = await GoogleAuth.signIn();
      const credential = GoogleAuthProvider.credential(result.authentication.idToken);
      return signInWithCredential(auth, credential);
    } catch(e) {
      throw new Error("Google bejelentkezés sikertelen: " + e.message);
    }
  };
  const logout = () => signOut(auth);
  const patchProfile = (d) => setProfile(p => ({ ...p, ...d }));

  return <Ctx.Provider value={{ profile, loading, login, loginWithGoogle, logout, patchProfile }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
