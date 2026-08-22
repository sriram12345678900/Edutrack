"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { OrgUser, verifyOrgCredentials, ADMIN_PORTAL_ROUTE } from "@/lib/admin";

export type CombinedUser = any;

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithOrg: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. First, check if we have an Org user session stored
    const orgUserRaw = localStorage.getItem("edutrack_org_user");
    if (orgUserRaw) {
      try {
        const orgUser: OrgUser = JSON.parse(orgUserRaw);
        setUser({ ...orgUser, isOrg: true, displayName: orgUser.name, email: orgUser.username + "@org.local", uid: orgUser.username });
        setLoading(false);
        return; // Don't rely on Firebase if logged in as an Org user
      } catch (e) {
        localStorage.removeItem("edutrack_org_user");
      }
    }

    // 2. Otherwise, check Firebase standard auth
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({ ...fbUser, isOrg: false, role: "student" });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithOrg = async (username: string, password: string) => {
    const orgUser = verifyOrgCredentials(username, password);
    if (!orgUser) {
      throw new Error("Invalid organization credentials");
    }
    
    // Sign out of Firebase if needed
    if (auth.currentUser) {
      await signOut(auth);
    }

    localStorage.setItem("edutrack_org_user", JSON.stringify(orgUser));
    setUser({ ...orgUser, isOrg: true, displayName: orgUser.name, email: orgUser.username + "@org.local", uid: orgUser.username });
    
    if (orgUser.role === "admin") router.push(ADMIN_PORTAL_ROUTE);
    else if (orgUser.role === "teacher") router.push("/teacher");
    else router.push("/classroom");
  };

  const login = async (email: string, password: string) => {
    localStorage.removeItem("edutrack_org_user");
    await signInWithEmailAndPassword(auth, email, password);
    router.push("/dashboard");
  };

  const signup = async (email: string, password: string, name: string) => {
    localStorage.removeItem("edutrack_org_user");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Standard users default to students in this implementation
    router.push("/dashboard");
  };

  const loginWithGoogle = async () => {
    localStorage.removeItem("edutrack_org_user");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push("/dashboard");
  };

  const logout = async () => {
    if (user && user.isOrg) {
      localStorage.removeItem("edutrack_org_user");
    } else {
      await signOut(auth);
    }
    setUser(null);
    router.push("/login");
  };

  const updateNickname = async (nickname: string) => {
    const finalNick = nickname.trim();
    if (!finalNick) return;

    localStorage.setItem("edutrack_nickname", finalNick);

    if (user && !user.isOrg && "providerData" in user) {
      try {
        await (user as any).updateProfile({ displayName: finalNick });
      } catch (err) { }
    } else if (user && user.isOrg) {
       // Update OrgUser local name
       const updated = { ...user, name: finalNick };
       setUser(updated as any);
       localStorage.setItem("edutrack_org_user", JSON.stringify(updated));
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("edutrack_profile_updated", { detail: { nickname: finalNick } }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, loginWithOrg, logout, updateNickname }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
