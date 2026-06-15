"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserProfile } from "@/lib/db";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    if (user.uid.startsWith("mock-")) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore onSnapshot subscription failed:", error);
        setProfile(null);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  return { profile, loading };
}
