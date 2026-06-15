import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Hardcoded Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABAdgIdr8x9ykkBsDp3IdDNoK0BrBI-h0",
  authDomain: "edutrack-1aa8f.firebaseapp.com",
  projectId: "edutrack-1aa8f",
  storageBucket: "edutrack-1aa8f.firebasestorage.app",
  messagingSenderId: "185929104909",
  appId: "1:185929104909:web:a495a6c4b08ab2c2789f44",
  measurementId: "G-Y9Q7CRX279"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Only initialize analytics on the client side
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app);
  });
}

export { analytics };
export default app;
