import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  className: string;
  weakSubjects: string[];
  createdAt: number;
}

export async function createUserProfile(uid: string, email: string | null, displayName: string | null) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    const defaultProfile: UserProfile = {
      uid,
      email,
      displayName,
      className: "Class 10",
      weakSubjects: [],
      createdAt: Date.now(),
    };
    await setDoc(userRef, defaultProfile);
    return defaultProfile;
  }
  return snap.data() as UserProfile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
}
