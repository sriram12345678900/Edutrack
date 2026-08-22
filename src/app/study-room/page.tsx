"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, ArrowRight, Sparkles } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useProfileStore } from "@/store/useProfileStore";

export default function StudyRoomLobby() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { nickname } = useProfileStore();
  const displayName = nickname || "Anonymous Student";

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const roomRef = await addDoc(collection(db, "study_rooms"), {
        createdAt: serverTimestamp(),
        hostName: displayName,
        participants: [displayName],
        mode: "study",
        timeLeft: 25 * 60,
        isRunning: false,
        lastUpdated: serverTimestamp()
      });
      router.push(`/study-room/${roomRef.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create room.");
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    router.push(`/study-room/${joinCode.trim()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040614] flex flex-col items-center justify-center p-6">
      <Link href="/dashboard" className="absolute top-8 left-8 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
        ← Back to Dashboard
      </Link>
      
      <div className="text-center space-y-4 mb-12">
        <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/10">
          <Users className="w-10 h-10 text-indigo-500" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Multiplayer Study Rooms</h1>
        <p className="text-slate-500 font-medium max-w-sm mx-auto">Sync pomodoro timers and chat with friends to stay accountable.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Create Room */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 flex flex-col items-center text-center space-y-6 shadow-sm">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Host a Session</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Create a new synced room and invite your study group.</p>
          </div>
          <button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
          >
            {isCreating ? "Creating..." : <><Plus className="w-5 h-5" /> Create Room</>}
          </button>
        </div>

        {/* Join Room */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 flex flex-col items-center text-center space-y-6 shadow-sm">
          <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <Users className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Join a Room</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Enter a room code provided by your host to jump in.</p>
          </div>
          <form onSubmit={handleJoinRoom} className="w-full flex gap-2">
            <input
              type="text"
              required
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="e.g. abc123xyz"
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-900 dark:text-white text-center uppercase"
            />
            <button
              type="submit"
              className="w-12 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 flex items-center justify-center transition-colors shrink-0"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
