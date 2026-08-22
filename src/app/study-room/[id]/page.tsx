"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  db 
} from "@/lib/firebase";
// @ts-ignore
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { useProfileStore } from "@/store/useProfileStore";
import { Play, Pause, Copy, Check, Users, MessageSquare, Send, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

interface RoomState {
  hostName: string;
  participants: string[];
  mode: "study" | "shortBreak" | "longBreak";
  timeLeft: number;
  isRunning: boolean;
  lastUpdated: any; // Timestamp
}

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  createdAt: any;
}

export default function StudyRoom({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const router = useRouter();
  const { nickname } = useProfileStore();
  const displayName = nickname || "Anonymous Student";

  const [room, setRoom] = useState<RoomState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Join Room & Setup Listeners
  useEffect(() => {
    const roomRef = doc(db, "study_rooms", roomId);
    
    // Add self to participants
    updateDoc(roomRef, {
      participants: arrayUnion(displayName)
    }).catch(() => {
      alert("Room not found or you don't have access.");
      router.push("/study-room");
    });

    // Listen to Room State
    const unsubscribeRoom = onSnapshot(roomRef, (docSnap: any) => {
      if (docSnap.exists()) {
        setRoom(docSnap.data() as RoomState);
      } else {
        alert("This room has been closed.");
        router.push("/study-room");
      }
    });

    // Listen to Chat
    const chatRef = collection(db, "study_rooms", roomId, "chat");
    const q = query(chatRef, orderBy("createdAt", "asc"), limit(50));
    const unsubscribeChat = onSnapshot(q, (snapshot: any) => {
      const msgs = snapshot.docs.map((d: any) => ({
        id: d.id,
        ...d.data()
      })) as ChatMessage[];
      setMessages(msgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    // Cleanup on unmount (leave room)
    return () => {
      unsubscribeRoom();
      unsubscribeChat();
      updateDoc(roomRef, {
        participants: arrayRemove(displayName)
      }).catch(() => {});
    };
  }, [roomId, displayName, router]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    try {
      await addDoc(collection(db, "study_rooms", roomId, "chat"), {
        text: chatInput,
        sender: displayName,
        createdAt: serverTimestamp()
      });
      setChatInput("");
    } catch (err) {
      console.error(err);
    }
  };

  // Timer Control Sync
  const updateRoomState = async (updates: Partial<RoomState>) => {
    try {
      await updateDoc(doc(db, "study_rooms", roomId), {
        ...updates,
        lastUpdated: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to sync timer", e);
    }
  };

  const toggleTimer = () => {
    if (!room) return;
    updateRoomState({ isRunning: !room.isRunning });
  };

  const changeMode = (newMode: "study" | "shortBreak" | "longBreak") => {
    const duration = newMode === "study" ? 25 * 60 : (newMode === "shortBreak" ? 5 * 60 : 15 * 60);
    updateRoomState({ mode: newMode, timeLeft: duration, isRunning: false });
  };

  // Local Timer Tick logic for smooth rendering based on synced state
  useEffect(() => {
    if (!room) return;
    
    // We only decrement locally if the room says it's running
    // The "host" or everyone could update the db every minute, but doing it every second is bad for Firebase quota.
    // So we just rely on the local tick and occasional syncs, or just let clients run it locally as long as isRunning is true.
    let interval: any;
    if (room.isRunning && room.timeLeft > 0) {
      interval = setInterval(() => {
        setRoom(prev => prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : prev);
      }, 1000);
    } else if (room.timeLeft <= 0 && room.isRunning) {
      // Auto complete
      updateRoomState({ isRunning: false });
      alert("Session completed!");
    }

    return () => clearInterval(interval);
  }, [room?.isRunning, room?.timeLeft]);


  if (!room) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white animate-pulse font-bold text-xl">Joining Room...</div>;
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isHost = room.hostName === displayName;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040614] flex flex-col md:flex-row h-screen overflow-hidden">
      
      {/* ── LEFT: TIMER & ROOM INFO ── */}
      <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center relative overflow-y-auto">
        <Link href="/study-room" className="absolute top-8 left-8 p-2 rounded-xl bg-slate-200/50 dark:bg-white/10 hover:bg-slate-300/50 dark:hover:bg-white/20 transition-colors text-slate-700 dark:text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm text-sm font-bold text-slate-700 dark:text-slate-300">
          <span>Code: <span className="font-mono text-indigo-500 uppercase tracking-wider">{roomId}</span></span>
          <button onClick={handleCopyCode} className="ml-2 p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md transition-colors">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Sync Timer */}
        <div className="text-center w-full max-w-md space-y-10">
          
          <div className="flex bg-slate-200 dark:bg-white/5 p-1.5 rounded-2xl w-full">
            {(["study", "shortBreak", "longBreak"] as const).map(m => (
              <button
                key={m}
                onClick={() => changeMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all capitalize ${room.mode === m ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {m.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>

          <div className="relative w-72 h-72 mx-auto rounded-full border-[12px] border-slate-100 dark:border-white/5 flex flex-col items-center justify-center shadow-inner">
            {room.isRunning && (
              <div className="absolute inset-0 rounded-full border-[12px] border-indigo-500 border-t-transparent animate-spin" style={{ animationDuration: "3s" }} />
            )}
            <span className="text-6xl font-black font-mono tracking-tighter text-slate-900 dark:text-white drop-shadow-sm">
              {formatTime(room.timeLeft)}
            </span>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
              {room.mode.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${room.isRunning ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-indigo-600 text-white shadow-indigo-500/30'}`}
            >
              {room.isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            <button
              onClick={() => changeMode(room.mode)} // resets time
              className="w-16 h-16 rounded-3xl bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all active:scale-95 hover:bg-slate-300 dark:hover:bg-white/20"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>

          {!isHost && (
            <p className="text-xs font-bold text-slate-500">Anyone can control the synced timer.</p>
          )}
        </div>
      </div>

      {/* ── RIGHT: SIDEBAR (PARTICIPANTS & CHAT) ── */}
      <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-[#0c1020] border-l border-slate-200 dark:border-white/10 flex flex-col shadow-xl z-10 shrink-0 h-1/2 md:h-full">
        
        {/* Participants */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Live Study Group ({room.participants.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {room.participants.map((p, i) => (
              <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-full ${p === displayName ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'}`}>
                {p} {p === room.hostName && "👑"}
              </span>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-2 opacity-60">
              <MessageSquare className="w-8 h-8" />
              <p className="text-xs font-bold">Say hi to the group!</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender === displayName;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <span className="text-[10px] font-bold text-slate-400 ml-1 mb-0.5">{msg.sender}</span>}
                <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm font-medium ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-bl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-white/10">
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Message..."
              className="flex-1 px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
