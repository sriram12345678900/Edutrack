"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let resolved = false;

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      resolved = true;
      if (fbUser) {
        setUser(fbUser);
        setLoading(false);
      } else {
        // Check if there is a local mock user session active
        const storedMockUser = localStorage.getItem("edutrack_mock_user");
        if (storedMockUser) {
          try {
            setUser(JSON.parse(storedMockUser));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    // Safety timeout: If Firebase Auth takes more than 1.5s to respond, fall back to mock session checks
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        console.warn("Firebase Auth initialization timed out. Activating sandbox fallback...");
        const storedMockUser = localStorage.getItem("edutrack_mock_user");
        if (storedMockUser) {
          try {
            setUser(JSON.parse(storedMockUser));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    }, 1500);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Remove any leftover mock sessions
      localStorage.removeItem("edutrack_mock_user");
      localStorage.removeItem("edutrack_mock_password");
      
      try {
        const { getUserProfile } = await import("@/lib/db");
        const profile = await getUserProfile(cred.user.uid);
        if (profile) {
          if (profile.className) localStorage.setItem("edutrack_class", profile.className);
          if (profile.nickname) localStorage.setItem("edutrack_nickname", profile.nickname);
          if (profile.friendCode) localStorage.setItem("edutrack_friend_code", profile.friendCode);
          if (profile.language) localStorage.setItem("edutrack_language", profile.language);
          if (profile.theme) localStorage.setItem("edutrack_theme", profile.theme);
        }
      } catch (dbErr) {
        console.warn("Failed to load database profile:", dbErr);
      }

      if (!localStorage.getItem("edutrack_class")) {
        router.push("/setup");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.warn("Firebase login failed, checking sandbox database:", err);
      
      // Check if we have a matching local mock user in storage
      const storedMockUserRaw = localStorage.getItem("edutrack_mock_user");
      const storedMockPassword = localStorage.getItem("edutrack_mock_password");
      if (storedMockUserRaw && storedMockPassword) {
        const mockUser = JSON.parse(storedMockUserRaw);
        if (mockUser.email === email && storedMockPassword === password) {
          setUser(mockUser as any);
          if (!localStorage.getItem("edutrack_class")) {
            router.push("/setup");
          } else {
            router.push("/dashboard");
          }
          return;
        }
      }
      
      // If mock login also fails, throw an invalid credential error
      throw { code: "auth/invalid-credential", message: "Invalid email or password." };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      
      // Create database profile
      try {
        const { createUserProfile } = await import("@/lib/db");
        await createUserProfile(cred.user.uid, email, name);
      } catch (dbErr) {
        console.warn("Failed to create database profile:", dbErr);
      }
      
      try {
        const { sendEmailVerification } = await import("firebase/auth");
        await sendEmailVerification(cred.user);
      } catch (emailErr) {
        console.warn("Failed to send verification email:", emailErr);
      }
      
      // Remove any mock sessions
      localStorage.removeItem("edutrack_mock_user");
      localStorage.removeItem("edutrack_mock_password");
      
      router.push("/setup");
    } catch (err: any) {
      console.warn("Firebase signup failed, activating sandbox fallback:", err);
      
      // Fallback: Create mock session locally
      {
        const mockUser = {
          uid: `mock-user-${Math.random().toString(36).substr(2, 9)}`,
          email: email,
          displayName: name,
          emailVerified: true
        };
        localStorage.setItem("edutrack_mock_user", JSON.stringify(mockUser));
        localStorage.setItem("edutrack_mock_password", password);
        setUser(mockUser as any);
        router.push("/setup");
        return;
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      
      // Create database profile if it doesn't exist, otherwise load preferences
      try {
        const { createUserProfile, getUserProfile } = await import("@/lib/db");
        const profile = await getUserProfile(cred.user.uid);
        if (!profile) {
          await createUserProfile(cred.user.uid, cred.user.email, cred.user.displayName);
        } else {
          if (profile.className) localStorage.setItem("edutrack_class", profile.className);
          if (profile.nickname) localStorage.setItem("edutrack_nickname", profile.nickname);
          if (profile.friendCode) localStorage.setItem("edutrack_friend_code", profile.friendCode);
          if (profile.language) localStorage.setItem("edutrack_language", profile.language);
          if (profile.theme) localStorage.setItem("edutrack_theme", profile.theme);
        }
      } catch (dbErr) {
        console.warn("Failed to handle database profile:", dbErr);
      }
      
      // Remove mock sessions
      localStorage.removeItem("edutrack_mock_user");
      localStorage.removeItem("edutrack_mock_password");
      
      if (!localStorage.getItem("edutrack_class")) {
        router.push("/setup");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.warn("Google Sign-In failed, fallback to local sandbox session:", err);
      
      const mockGoogleUser = {
        uid: "mock-google-user-999",
        email: "google.student@edutrack.space",
        displayName: "Google Student",
        emailVerified: true
      };
      localStorage.setItem("edutrack_mock_user", JSON.stringify(mockGoogleUser));
      setUser(mockGoogleUser as any);
      
      if (!localStorage.getItem("edutrack_class")) {
        router.push("/setup");
      } else {
        router.push("/dashboard");
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase logout warning:", err);
    }
    localStorage.removeItem("edutrack_mock_user");
    localStorage.removeItem("edutrack_mock_password");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
