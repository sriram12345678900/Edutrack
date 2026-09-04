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
  loginAsGuest: (role?: "student" | "teacher" | "admin") => Promise<void>;
  logout: () => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Check if we have a Guest Demo session
    const guestUserRaw = localStorage.getItem("edutrack_guest_user");
    if (guestUserRaw) {
      try {
        const guestUser = JSON.parse(guestUserRaw);
        setUser(guestUser);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem("edutrack_guest_user");
      }
    }

    // 2. Check if we have an Org user session stored
    const orgUserRaw = localStorage.getItem("edutrack_org_user");
    if (orgUserRaw) {
      try {
        const orgUser: OrgUser = JSON.parse(orgUserRaw);
        setUser({ ...orgUser, isOrg: true, emailVerified: true, displayName: orgUser.name, email: orgUser.username + "@org.local", uid: orgUser.username });
        setLoading(false);
        return; // Don't rely on Firebase if logged in as an Org user
      } catch (e) {
        localStorage.removeItem("edutrack_org_user");
      }
    }

    // Safety timeout: never hang loading for more than 1.5 seconds
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 1500);

    // 3. Otherwise, check Firebase standard auth
    try {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        clearTimeout(safetyTimeout);
        if (fbUser) {
          setUser({ ...fbUser, isOrg: false, emailVerified: true, role: "student" });
        } else {
          setUser(null);
        }
        setLoading(false);
      }, (err) => {
        clearTimeout(safetyTimeout);
        console.warn("Firebase auth state error:", err);
        setLoading(false);
      });

      return () => {
        clearTimeout(safetyTimeout);
        unsubscribe();
      };
    } catch (e) {
      clearTimeout(safetyTimeout);
      setLoading(false);
    }
  }, []);

  const loginAsGuest = async (role: "student" | "teacher" | "admin" = "student") => {
    localStorage.removeItem("edutrack_org_user");
    const demoUser = {
      uid: `demo-${role}-${Date.now()}`,
      displayName: role === "teacher" ? "Prof. Sharma (Demo)" : role === "admin" ? "Admin Demo" : "Scholar Student",
      email: `${role}@edutrack.space`,
      emailVerified: true,
      isOrg: false,
      isGuest: true,
      role: role
    };

    localStorage.setItem("edutrack_guest_user", JSON.stringify(demoUser));
    setUser(demoUser);
    setLoading(false);

    if (role === "admin") router.push(ADMIN_PORTAL_ROUTE);
    else if (role === "teacher") router.push("/teacher");
    else router.push("/dashboard");
  };

  const loginWithOrg = async (username: string, password: string) => {
    const orgUser = verifyOrgCredentials(username, password);
    if (!orgUser) {
      throw new Error("Invalid organization credentials");
    }
    
    localStorage.removeItem("edutrack_guest_user");

    // Sign out of Firebase if needed
    if (auth.currentUser) {
      try { await signOut(auth); } catch (_) {}
    }

    localStorage.setItem("edutrack_org_user", JSON.stringify(orgUser));
    setUser({ ...orgUser, isOrg: true, emailVerified: true, displayName: orgUser.name, email: orgUser.username + "@org.local", uid: orgUser.username });
    
    if (orgUser.role === "admin") router.push(ADMIN_PORTAL_ROUTE);
    else if (orgUser.role === "teacher") router.push("/teacher");
    else router.push("/classroom");
  };

  const login = async (email: string, password: string) => {
    localStorage.removeItem("edutrack_org_user");
    localStorage.removeItem("edutrack_guest_user");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      // Fallback: If offline or invalid test credentials, allow seamless demo fallback
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/network-request-failed") {
        console.warn("Standard login fallback to local scholar session");
      }
      throw err;
    }
    router.push("/dashboard");
  };

  const signup = async (email: string, password: string, name: string) => {
    localStorage.removeItem("edutrack_org_user");
    localStorage.removeItem("edutrack_guest_user");
    await createUserWithEmailAndPassword(auth, email, password);
    router.push("/dashboard");
  };

  const loginWithGoogle = async () => {
    localStorage.removeItem("edutrack_org_user");
    localStorage.removeItem("edutrack_guest_user");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push("/dashboard");
  };

  const logout = async () => {
    localStorage.removeItem("edutrack_org_user");
    localStorage.removeItem("edutrack_guest_user");
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (_) {}
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
    } else if (user) {
       const updated = { ...user, displayName: finalNick, name: finalNick };
       setUser(updated as any);
       if (user.isOrg) {
         localStorage.setItem("edutrack_org_user", JSON.stringify(updated));
       } else if (user.isGuest) {
         localStorage.setItem("edutrack_guest_user", JSON.stringify(updated));
       }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("edutrack_profile_updated", { detail: { nickname: finalNick } }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, loginWithOrg, loginAsGuest, logout, updateNickname }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
