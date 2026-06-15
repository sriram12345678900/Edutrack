"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Users, Sparkles, Send, ArrowLeft, Plus, Copy, CheckCheck, Check,
  MessageSquare, BookOpen, AlertCircle, Loader2, LogOut, MessageCircle, UserPlus, Search, Trophy, Video, X, PenTool, Download, Paperclip, Mic, StopCircle, Volume2, Moon, Sun, Clock
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { db, storage } from "@/lib/firebase";
// @ts-ignore
import { collection, addDoc, onSnapshot, query, where, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';

interface Friend {
  name: string;
  friendCode: string;
  online: boolean;
  avatar: string;
  color: string;
  lastMsg: string;
  time: string;
}

interface Group {
  name: string;
  groupCode: string;
  avatar: string;
  color: string;
  members: string[]; // friend codes
  lastMsg: string;
  time: string;
  isGroup: boolean;
}

interface DirectMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderCode: string;
  text: string;
  timestamp: Date;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  read?: boolean;
}

interface QuizDuelQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizDuelState {
  status: 'waiting' | 'playing' | 'podium';
  currentQuestionIndex: number;
  timer: number;
  myScore: number;
  buddyScore: number;
  myAnswered: string | null;
  buddyAnswered: string | null;
  questions: QuizDuelQuestion[];
}

interface CallSession {
  id?: string;
  callerId: string;
  callerName: string;
  recipientId: string;
  room: string;
  status: 'ringing' | 'accepted' | 'declined' | 'ended';
  timestamp?: any;
}

const DUEL_QUESTIONS: QuizDuelQuestion[] = [
  {
    question: "Which of the following is a balanced exothermic chemical reaction representing respiration?",
    options: [
      "~C_6H_12O_6 + 6O_2 ──> 6CO_2 + 6H_2O + Energy~",
      "~6CO_2 + 6H_2O + Energy ──> C_6H_12O_6 + 6O_2~",
      "~CaCO_3 ──> CaO + CO_2~",
      "~2H_2O ──> 2H_2 + O_2~"
    ],
    correctAnswer: "~C_6H_12O_6 + 6O_2 ──> 6CO_2 + 6H_2O + Energy~"
  },
  {
    question: "When iron nails are placed in a blue copper sulphate (~CuSO_4~) solution, what chemical change occurs?",
    options: [
      "No reaction takes place",
      "Displacement reaction forming green ~FeSO_4~",
      "Combination reaction forming brown copper rust",
      "Double displacement reaction forming black copper sulphide"
    ],
    correctAnswer: "Displacement reaction forming green ~FeSO_4~"
  },
  {
    question: "What is the correct chemical formula and common name of Rust?",
    options: [
      "~Fe_3O_4~ (Magnetite)",
      "~Fe_2O_3 · xH_2O~ (Hydrated Ferric Oxide)",
      "~FeCO_3~ (Siderite)",
      "~Fe(OH)_2~ (Ferrous Hydroxide)"
    ],
    correctAnswer: "~Fe_2O_3 · xH_2O~ (Hydrated Ferric Oxide)"
  }
];

const WhiteboardPanel = ({ chatId, nickname, db }: { chatId: string, nickname: string, db: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#4f46e5");
  
  const syncCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !db) return;
    const dataUrl = canvas.toDataURL("image/png");
    try {
      await setDoc(doc(db, "edutrack_messages", `wb_${chatId}`), {
        image: dataUrl,
        lastUpdatedBy: nickname,
        timestamp: new Date(),
        type: "whiteboard_state"
      });
    } catch (e) {
      console.error("Whiteboard sync error:", e);
    }
  };

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "edutrack_messages", `wb_${chatId}`), (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lastUpdatedBy !== nickname) {
           const img = new Image();
           img.onload = () => {
             const canvas = canvasRef.current;
             if (canvas) {
               const ctx = canvas.getContext("2d");
               ctx?.clearRect(0, 0, canvas.width, canvas.height);
               ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
             }
           };
           img.src = data.image;
        }
      }
    });
    return () => unsub();
  }, [chatId, db, nickname]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    
    // Set initial size
    canvas.width = parent.clientWidth || 800;
    canvas.height = parent.clientHeight || 600;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          // Save existing image data before resize
          const ctx = canvas.getContext('2d');
          let imgData = null;
          if (canvas.width > 0 && canvas.height > 0) {
             try {
                imgData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
             } catch(e) {}
          }
          
          canvas.width = entry.contentRect.width;
          canvas.height = entry.contentRect.height;
          
          // Restore image data
          if (imgData && ctx) {
            ctx.putImageData(imgData, 0, 0);
          }
        }
      }
    });
    
    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, []);

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      syncCanvas(); 
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whiteboard-${chatId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
        <h3 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
          <PenTool className="w-4 h-4 text-indigo-500" /> Co-Op Board
        </h3>
        <div className="flex items-center gap-2">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 p-0 border-0 rounded cursor-pointer" />
          <button onClick={downloadCanvas} className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>
      <div className="flex-1 relative w-full h-full overflow-hidden touch-none" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair"
        />
      </div>
    </div>
  );
};

export default function StudyCirclesDMs() {
  const { user } = useAuth();
  const router = useRouter();

  // User details
  const [nickname, setNickname] = useState("");
  const [friendCode, setFriendCode] = useState("");
  
  // Friends & Groups
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  
  // Active states
  const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [activeChatId, setActiveChatId] = useState<string>("");
  
  // Add Friend States
  const [searchCode, setSearchCode] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  // Create Group States
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupError, setGroupError] = useState("");

  // Messaging States
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChatIdRef = useRef<string>("");
  const [activeDuel, setActiveDuel] = useState<QuizDuelState | null>(null);
  const [showVideoMeeting, setShowVideoMeeting] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  // File and Voice Recording State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [selectedContextMenuMsg, setSelectedContextMenuMsg] = useState<DirectMessage | null>(null);
  const [deletedMsgIds, setDeletedMsgIds] = useState<string[]>([]);
  const touchTimeoutRef = useRef<any>(null);
  const touchStartedRef = useRef<boolean>(false);

  // Call States
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<CallSession | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize ringtone & lock viewport scrollbars
  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audioRef.current.loop = true;
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    // Let window scroll normally if zoomed in or resized
    return () => {};
  }, []);

  const startQuizDuel = () => {
    setActiveDuel({
      status: 'waiting',
      currentQuestionIndex: 0,
      timer: 10,
      myScore: 0,
      buddyScore: 0,
      myAnswered: null,
      buddyAnswered: null,
      questions: DUEL_QUESTIONS
    });
  };

  const handleQuestionTimeOut = () => {
    setTimeout(() => {
      setActiveDuel(prev => {
        if (!prev) return null;
        const nextIndex = prev.currentQuestionIndex + 1;
        if (nextIndex >= prev.questions.length) {
          const xpToGain = prev.myScore * 15 + 10;
          const storedXp = localStorage.getItem("edutrack_xp");
          if (storedXp) {
            const currentXp = parseInt(storedXp, 10);
            localStorage.setItem("edutrack_xp", (currentXp + xpToGain).toString());
          }
          return { ...prev, status: 'podium', timer: 0 };
        }
        return {
          ...prev,
          currentQuestionIndex: nextIndex,
          timer: 10,
          myAnswered: null,
          buddyAnswered: null
        };
      });
    }, 2000);
  };

  const handleAnswerSelection = (option: string) => {
    if (!activeDuel || activeDuel.myAnswered) return;

    const q = activeDuel.questions[activeDuel.currentQuestionIndex];
    const isCorrect = option === q.correctAnswer;
    const addedScore = isCorrect ? 1 : 0;

    const buddyIsCorrect = Math.random() < 0.7;
    const buddyOption = buddyIsCorrect 
      ? q.correctAnswer 
      : q.options.find(opt => opt !== q.correctAnswer) || q.options[0];
    const buddyAddedScore = buddyIsCorrect ? 1 : 0;

    setActiveDuel(prev => {
      if (!prev) return null;
      return {
        ...prev,
        myScore: prev.myScore + addedScore,
        buddyScore: prev.buddyScore + buddyAddedScore,
        myAnswered: option,
        buddyAnswered: buddyOption
      };
    });

    if (isCorrect) {
      const storedXp = localStorage.getItem("edutrack_xp");
      if (storedXp) {
        const currentXp = parseInt(storedXp, 10);
        localStorage.setItem("edutrack_xp", (currentXp + 15).toString());
      }
    }

    setTimeout(() => {
      setActiveDuel(prev => {
        if (!prev) return null;
        const nextIndex = prev.currentQuestionIndex + 1;
        if (nextIndex >= prev.questions.length) {
          const xpToGain = prev.myScore * 15 + 10;
          const storedXp = localStorage.getItem("edutrack_xp");
          if (storedXp) {
            const currentXp = parseInt(storedXp, 10);
            localStorage.setItem("edutrack_xp", (currentXp + xpToGain).toString());
          }
          return { ...prev, status: 'podium', timer: 0 };
        }
        return {
          ...prev,
          currentQuestionIndex: nextIndex,
          timer: 10,
          myAnswered: null,
          buddyAnswered: null
        };
      });
    }, 2000);
  };

  useEffect(() => {
    if (activeDuel && activeDuel.status === 'waiting') {
      const matchmakingId = setTimeout(() => {
        setActiveDuel(prev => {
          if (!prev) return null;
          return { ...prev, status: 'playing' };
        });
      }, 2000);
      return () => clearTimeout(matchmakingId);
    }
  }, [activeDuel?.status]);

  useEffect(() => {
    if (!activeDuel || activeDuel.status !== 'playing' || activeDuel.myAnswered !== null) return;

    const timerId = setInterval(() => {
      setActiveDuel(prev => {
        if (!prev || prev.status !== 'playing' || prev.myAnswered !== null) return prev;

        if (prev.timer <= 1) {
          clearInterval(timerId);
          handleQuestionTimeOut();
          return { ...prev, myAnswered: "timeout", buddyAnswered: "timeout" };
        }

        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [activeDuel?.status, activeDuel?.currentQuestionIndex, activeDuel?.myAnswered]);

  // Waving Hand & profile setup on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDeleted = localStorage.getItem("edutrack_deleted_messages");
      if (storedDeleted) {
        try { setDeletedMsgIds(JSON.parse(storedDeleted)); } catch(e) {}
      }
      let storedNick = localStorage.getItem("edutrack_nickname");
      let storedCode = localStorage.getItem("edutrack_friend_code");
      
      if (!storedNick) {
        storedNick = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Student";
        localStorage.setItem("edutrack_nickname", storedNick);
      }
      if (!storedCode) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        storedCode = `${storedNick.toUpperCase()}#${randomNum}`;
        localStorage.setItem("edutrack_friend_code", storedCode);
      }
      
      setNickname(storedNick);
      setFriendCode(storedCode);

      // Load or initialize Friends List
      const storedFriends = localStorage.getItem("edutrack_friends");
      if (storedFriends) {
        try {
          setFriends(JSON.parse(storedFriends));
        } catch {
          initializeDefaultFriends();
        }
      } else {
        initializeDefaultFriends();
      }

      // Load or initialize Groups List
      const storedGroups = localStorage.getItem("edutrack_groups");
      if (storedGroups) {
        try {
          setGroups(JSON.parse(storedGroups));
        } catch {
          initializeDefaultGroups();
        }
      } else {
        initializeDefaultGroups();
      }
    }
  }, [user]);

  const initializeDefaultFriends = () => {
    const defaults: Friend[] = [
      { name: "Aditya Sharma", friendCode: "ADITYA#9581", online: true, avatar: "AS", color: "from-amber-500 to-orange-500", lastMsg: "Hey! Let's balance some NCERT chemistry today 🧪", time: "12:04 PM" },
      { name: "Priya Nair", friendCode: "PRIYA#7204", online: true, avatar: "PN", color: "from-emerald-450 to-teal-500", lastMsg: "Did you finish the spaced repetition flashcards?", time: "Yesterday" },
      { name: "Rohan Das", friendCode: "ROHAN#3401", online: false, avatar: "RD", color: "from-blue-400 to-cyan-500", lastMsg: "I will join the StudyCircle tonight!", time: "2 days ago" }
    ];
    setFriends(defaults);
    localStorage.setItem("edutrack_friends", JSON.stringify(defaults));
  };

  const initializeDefaultGroups = () => {
    const defaults: Group[] = [
      {
        name: "Science Avengers",
        groupCode: "GROUP-1010",
        avatar: "SA",
        color: "from-purple-500 to-indigo-650",
        members: ["ADITYA#9581", "PRIYA#7204", "ROHAN#3401"],
        lastMsg: "Let's crack CBSE Class 10 Chemistry together! 💥",
        time: "10:30 AM",
        isGroup: true
      }
    ];
    setGroups(defaults);
    localStorage.setItem("edutrack_groups", JSON.stringify(defaults));
  };

  // Sync active chat id when active friend or group changes
  useEffect(() => {
    if (activeGroup) {
      setActiveChatId(activeGroup.groupCode);
      activeChatIdRef.current = activeGroup.groupCode;
    } else if (friendCode && activeFriend) {
      const id = [friendCode, activeFriend.friendCode].sort().join("_");
      setActiveChatId(id);
      activeChatIdRef.current = id;
    } else {
      setActiveChatId("");
      activeChatIdRef.current = "";
    }
  }, [friendCode, activeFriend, activeGroup]);

  // Listen to Direct & Group Messages in real-time
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setError("");

    let lastStoredJSON = "";
    const loadMessages = () => {
      const stored = localStorage.getItem("edutrack_messages_" + activeChatId);
      if (stored && stored !== lastStoredJSON) {
        lastStoredJSON = stored;
        try {
          const parsed = JSON.parse(stored);
          const msgs = parsed.map((m: any) => ({
             ...m,
             timestamp: new Date(m.timestamp)
          }));
          msgs.sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime());
          setMessages(msgs);
        } catch(e) {}
      } else if (!stored && lastStoredJSON !== "") {
        lastStoredJSON = "";
        setMessages([]);
      }
      setLoadingMessages(false);
    };

    loadMessages();

    // Firebase Cloud Sync (Cross-Device)
    let unsub = () => {};
    try {
      const q = query(collection(db, "edutrack_messages"), where("chatId", "==", activeChatId));
      unsub = onSnapshot(q, (snapshot: any) => {
        snapshot.docChanges().forEach((change: any) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (data.senderId !== user?.uid && data.senderCode !== "BOT") {
              if (document.hidden && "Notification" in window && Notification.permission === "granted") {
                new Notification(`New message from ${data.senderCode}`, { body: data.text || "Attachment received", icon: '/favicon.ico' });
              }
            }
          }
        });

        const cloudMsgs: DirectMessage[] = snapshot.docs.map((docSnap: any) => {
          const data = docSnap.data();
          
          // Auto-mark as read if we are the recipient and it's unread
          if (data.chatId && data.senderCode && data.senderCode !== friendCode && !data.read) {
            try {
              updateDoc(doc(db, "edutrack_messages", docSnap.id), { read: true });
            } catch(e) {}
          }

          return {
            id: data.id || docSnap.id,
            chatId: data.chatId,
            senderId: data.senderId,
            senderCode: data.senderCode,
            text: data.text,
            attachmentUrl: data.attachmentUrl,
            attachmentType: data.attachmentType,
            attachmentName: data.attachmentName,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
            read: data.read || false
          };
        });

        const stored = localStorage.getItem("edutrack_messages_" + activeChatId);
        let localMsgs: DirectMessage[] = [];
        if (stored) {
          try {
            localMsgs = JSON.parse(stored).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
          } catch(e) {}
        }

        // Merge local & cloud to ensure instant optimistic UI isn't lost
        const map = new Map<string, DirectMessage>();
        localMsgs.forEach(m => map.set(m.id, m));
        cloudMsgs.forEach(m => map.set(m.id, m));
        
        const merged = Array.from(map.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        lastStoredJSON = JSON.stringify(merged);
        localStorage.setItem("edutrack_messages_" + activeChatId, lastStoredJSON);
        setMessages(merged);
        setLoadingMessages(false);
      }, (err) => {
        console.warn("Firebase snapshot error (using local fallback):", err);
      });
    } catch (e) {
      console.warn("Firebase init failed:", e);
    }

    // Listen to local storage changes for multi-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "edutrack_messages_" + activeChatId) {
        loadMessages();
      }
    };
    window.addEventListener("storage", handleStorage);

    // Local polling fallback
    const interval = setInterval(loadMessages, 500);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
      unsub();
    };
  }, [activeChatId]);

  // Scroll to bottom of chat when new messages arrive or conclusion is generated
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Call Signaling: Incoming Calls
  useEffect(() => {
    if (!friendCode || !db) return;
    const q = query(collection(db, "edutrack_messages"), where("recipientId", "==", friendCode));
    const unsub = onSnapshot(q, (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        const data = change.doc.data() as CallSession;
        if (change.type === 'added' || change.type === 'modified') {
          if (data.status === 'ringing') {
            setIncomingCall({ ...data, id: change.doc.id });
            if (audioRef.current) audioRef.current.play().catch(e => console.error("Audio block", e));
          } else if (data.status === 'declined' || data.status === 'ended' || data.status === 'accepted') {
            if (incomingCall?.id === change.doc.id) {
              setIncomingCall(null);
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
            }
          }
        }
      });
    });
    return () => unsub();
  }, [friendCode, incomingCall?.id]);

  // Call Signaling: Outgoing Call Status
  useEffect(() => {
    if (!friendCode || !db || !outgoingCall?.id) return;
    const q = query(collection(db, "edutrack_messages"), where("callerId", "==", friendCode));
    const unsub = onSnapshot(q, (snapshot: any) => {
      snapshot.docs.forEach((d: any) => {
        if (d.id === outgoingCall.id) {
          const data = d.data() as CallSession;
          if (data.status === 'accepted') {
            activeChatIdRef.current = outgoingCall.room;
            setOutgoingCall(null);
            setShowVideoMeeting(true); // Jump into the call!
          } else if (data.status === 'declined') {
            setOutgoingCall(null);
            alert("Buddy declined the call.");
          }
        }
      });
    });
    return () => unsub();
  }, [friendCode, outgoingCall?.id]);

  const initiateCall = async () => {
    if (activeGroup) {
      // Group calls are instant drop-in (Voice Channels)
      setShowVideoMeeting(true);
    } else if (activeFriend) {
      // Direct calls ring the buddy!
      const roomStr = `CALL-${Math.floor(1000 + Math.random() * 9000)}`;
      const callData: CallSession = {
        callerId: friendCode,
        callerName: nickname,
        recipientId: activeFriend.friendCode,
        room: roomStr,
        status: 'ringing',
        timestamp: new Date()
      };
      try {
        const docRef = await addDoc(collection(db, "edutrack_messages"), callData);
        setOutgoingCall({ ...callData, id: docRef.id });
      } catch(e: any) {
        console.error("Signaling Error (Firebase Rules):", e);
        // Fallback for hackathon demo: bypass signaling and drop right in!
        activeChatIdRef.current = roomStr;
        setShowVideoMeeting(true);
      }
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall || !incomingCall.id) return;
    try {
      await updateDoc(doc(db, "edutrack_messages", incomingCall.id), { status: 'accepted' });
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Jump into the exact same room
      activeChatIdRef.current = incomingCall.room;
      setIncomingCall(null);
      setShowVideoMeeting(true);
    } catch(e) {
      console.error(e);
    }
  };

  const handleDeclineCall = async () => {
    if (!incomingCall || !incomingCall.id) return;
    try {
      await updateDoc(doc(db, "edutrack_messages", incomingCall.id), { status: 'declined' });
      setIncomingCall(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } catch(e) {
      console.error(e);
    }
  };

  const cancelOutgoingCall = async () => {
    if (!outgoingCall || !outgoingCall.id) return;
    try {
      await updateDoc(doc(db, "edutrack_messages", outgoingCall.id), { status: 'ended' });
      setOutgoingCall(null);
    } catch(e) {
      console.error(e);
    }
  };

  // Real-time listener for incoming friend requests
  useEffect(() => {
    if (!friendCode || !db) return;
    const q = query(
      collection(db, "edutrack_friend_requests"),
      where("recipientCode", "==", friendCode),
      where("status", "==", "pending")
    );
    let isInitial = true;
    const unsub = onSnapshot(q, (snapshot: any) => {
      const reqs = snapshot.docs.map((d: any) => ({
        id: d.id,
        ...d.data()
      }));
      setPendingRequests(reqs);

      // Notify on new request after initial load
      if (!isInitial) {
        snapshot.docChanges().forEach((change: any) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const senderName = data.senderName || data.senderCode.split("#")[0];
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("New Study Buddy Request", {
                body: `${senderName} wants to connect with you on StudyCircles!`,
                icon: '/favicon.ico'
              });
            }
            const alertAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2857/2857-preview.mp3");
            alertAudio.play().catch(() => {});
          }
        });
      }
      isInitial = false;
    });
    return () => unsub();
  }, [friendCode, db]);

  // Real-time listener for outgoing pending friend requests
  useEffect(() => {
    if (!friendCode || !db) return;
    const q = query(
      collection(db, "edutrack_friend_requests"),
      where("senderCode", "==", friendCode),
      where("status", "==", "pending")
    );
    const unsub = onSnapshot(q, (snapshot: any) => {
      const reqs = snapshot.docs.map((d: any) => ({
        id: d.id,
        ...d.data()
      }));
      setSentRequests(reqs);
    });
    return () => unsub();
  }, [friendCode, db]);

  // Real-time listener for accepted outgoing friend requests
  useEffect(() => {
    if (!friendCode || !db) return;
    const q = query(
      collection(db, "edutrack_friend_requests"),
      where("senderCode", "==", friendCode),
      where("status", "==", "accepted")
    );
    const unsub = onSnapshot(q, (snapshot: any) => {
      snapshot.docs.forEach(async (docSnap: any) => {
        const data = docSnap.data();
        const alreadyAdded = friends.some(f => f.friendCode === data.recipientCode);
        if (!alreadyAdded) {
          const parts = data.recipientCode.split("#");
          const name = parts[0];
          const newFriend: Friend = {
            name: name.charAt(0) + name.slice(1).toLowerCase() + " (Classmate)",
            friendCode: data.recipientCode,
            online: true,
            avatar: name.substring(0, 2).toUpperCase(),
            color: "from-fuchsia-500 to-pink-650",
            lastMsg: "We are now connected! Let's study! 📚",
            time: "Just now"
          };
          setFriends(prev => {
            const updated = [newFriend, ...prev.filter(f => f.friendCode !== newFriend.friendCode)];
            localStorage.setItem("edutrack_friends", JSON.stringify(updated));
            return updated;
          });
          try {
            await updateDoc(doc(db, "edutrack_friend_requests", docSnap.id), { status: "archived" });
          } catch(e) {}
        }
      });
    });
    return () => unsub();
  }, [friendCode, db, friends]);

  const handleAcceptRequest = async (req: any) => {
    const parts = req.senderCode.split("#");
    const name = parts[0];
    const newFriend: Friend = {
      name: req.senderName || (name.charAt(0) + name.slice(1).toLowerCase() + " (Classmate)"),
      friendCode: req.senderCode,
      online: true,
      avatar: name.substring(0, 2).toUpperCase(),
      color: "from-indigo-500 to-pink-650",
      lastMsg: "I accepted your study request! Let's study! 📚",
      time: "Just now"
    };
    
    setFriends(prev => {
      const updated = [newFriend, ...prev.filter(f => f.friendCode !== newFriend.friendCode)];
      localStorage.setItem("edutrack_friends", JSON.stringify(updated));
      return updated;
    });

    try {
      await updateDoc(doc(db, "edutrack_friend_requests", req.id), { status: "accepted" });
    } catch (e) {
      console.error("Firestore accept error:", e);
    }
    
    setPendingRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const handleDeclineRequest = async (req: any) => {
    try {
      await updateDoc(doc(db, "edutrack_friend_requests", req.id), { status: "declined" });
    } catch (e) {
      console.error("Firestore decline error:", e);
    }
    setPendingRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const handleCancelRequest = async (req: any) => {
    try {
      await updateDoc(doc(db, "edutrack_friend_requests", req.id), { status: "cancelled" });
    } catch (e) {
      console.error("Firestore cancel error:", e);
    }
    setSentRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const handleTouchStart = (msg: DirectMessage) => {
    touchStartedRef.current = true;
    touchTimeoutRef.current = setTimeout(() => {
      if (touchStartedRef.current) {
        setSelectedContextMenuMsg(msg);
      }
    }, 600);
  };

  const handleTouchEnd = () => {
    touchStartedRef.current = false;
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
  };

  const handleTouchMove = () => {
    touchStartedRef.current = false;
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
  };

  const handleContextMenu = (e: React.MouseEvent, msg: DirectMessage) => {
    e.preventDefault();
    setSelectedContextMenuMsg(msg);
  };

  const handleDeleteForMe = (msg: DirectMessage) => {
    try {
      const stored = localStorage.getItem("edutrack_deleted_messages");
      const deletedIds = stored ? JSON.parse(stored) : [];
      deletedIds.push(msg.id);
      localStorage.setItem("edutrack_deleted_messages", JSON.stringify(deletedIds));
      setDeletedMsgIds(deletedIds);
    } catch (e) {
      console.error(e);
    }
    setSelectedContextMenuMsg(null);
  };

  const handleDeleteForAll = async (msg: DirectMessage) => {
    try {
      await deleteDoc(doc(db, "edutrack_messages", msg.id));
      setMessages(prev => prev.filter(m => m.id !== msg.id));
      const stored = localStorage.getItem("edutrack_messages_" + activeChatId);
      if (stored) {
        const parsed = JSON.parse(stored).filter((m: any) => m.id !== msg.id);
        localStorage.setItem("edutrack_messages_" + activeChatId, JSON.stringify(parsed));
      }
    } catch (e) {
      console.error("Firebase delete error:", e);
      handleDeleteForMe(msg);
    }
    setSelectedContextMenuMsg(null);
  };

const [liveKitToken, setLiveKitToken] = useState("");

  useEffect(() => {
    if (showVideoMeeting) {
      const room = activeGroup ? activeGroup.groupCode : (activeChatIdRef.current || 'edutrack-private-room');
      fetch(`/api/livekit?room=${encodeURIComponent(room)}&username=${encodeURIComponent(nickname || 'Anonymous')}`)
        .then(res => res.json())
        .then(data => {
          if (data.token) setLiveKitToken(data.token);
        })
        .catch(err => console.error("Failed to fetch LiveKit token", err));
    } else {
      setLiveKitToken("");
    }
  }, [showVideoMeeting, activeGroup, nickname]);

  const copyMyCode = () => {
    if (!friendCode) return;
    navigator.clipboard.writeText(friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFriend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAddError("");
    setAddSuccess("");

    const code = searchCode.trim().toUpperCase();
    if (!code) return;

    if (code === friendCode) {
      setAddError("You cannot add yourself!");
      return;
    }

    const exists = friends.some(f => f.friendCode === code);
    if (exists) {
      setAddError("This classmate is already in your friends list!");
      return;
    }

    if (code.startsWith("GROUP-")) {
      const existsGroup = groups.some(g => g.groupCode === code);
      if (existsGroup) {
        setAddError("You are already in this group!");
        return;
      }
      
      const newGroup: Group = {
        name: `Joined Group (${code})`,
        groupCode: code,
        avatar: "JG",
        color: "from-blue-500 to-indigo-600",
        members: [],
        lastMsg: "You joined the group via invite code!",
        time: "Just now",
        isGroup: true
      };
      const updatedGroups = [newGroup, ...groups];
      setGroups(updatedGroups);
      localStorage.setItem("edutrack_groups", JSON.stringify(updatedGroups));
      
      setAddSuccess(`Successfully joined group!`);
      setSearchCode("");
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess("");
      }, 1550);
      return;
    }

    if (!code.includes("#")) {
      setAddError("Invalid format! Friend code must look like NICKNAME#1234, and Group code like GROUP-1234");
      return;
    }

    // Mock peers simulation (instantly accepts request after 2s for easy demo!)
    if (code === "ADITYA#9581" || code === "PRIYA#7204" || code === "ROHAN#3401" || code.includes("CLASSMATE")) {
      setAddSuccess("Friend request sent! Classmate accepted instantly! 🎉");
      setTimeout(() => {
        const parts = code.split("#");
        const name = parts[0];
        const newFriend: Friend = {
          name: name.charAt(0) + name.slice(1).toLowerCase() + (code === "PRIYA#7204" ? " Nair" : code === "ADITYA#9581" ? " Sharma" : code === "ROHAN#3401" ? " Das" : " (Classmate)"),
          friendCode: code,
          online: true,
          avatar: name.substring(0, 2).toUpperCase(),
          color: code === "PRIYA#7204" ? "from-emerald-450 to-teal-500" : "from-amber-500 to-orange-500",
          lastMsg: "Let's connect and study together privately!",
          time: "Just now"
        };
        setFriends(prev => {
          const updated = [newFriend, ...prev.filter(f => f.friendCode !== newFriend.friendCode)];
          localStorage.setItem("edutrack_friends", JSON.stringify(updated));
          return updated;
        });
        setShowAddModal(false);
        setAddSuccess("");
        setSearchCode("");
      }, 2000);
      return;
    }

    // Real peer Firestore friend request write
    try {
      setAddSuccess("Sending friend request...");
      await addDoc(collection(db, "edutrack_friend_requests"), {
        senderCode: friendCode,
        senderName: nickname,
        recipientCode: code,
        status: "pending",
        timestamp: new Date()
      });
      setAddSuccess(`Friend request sent successfully to ${code}!`);
      setSearchCode("");
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess("");
      }, 2000);
    } catch(err) {
      console.error("Firestore friend request error:", err);
      setAddError("Failed to send friend request. Check Firebase connection.");
    }
  };

  const toggleSelectMember = (code: string) => {
    if (selectedMembers.includes(code)) {
      setSelectedMembers(prev => prev.filter(c => c !== code));
    } else {
      setSelectedMembers(prev => [...prev, code]);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    setGroupError("");

    const gName = newGroupName.trim();
    if (!gName) {
      setGroupError("Group name is required!");
      return;
    }

    if (selectedMembers.length === 0) {
      setGroupError("Please select at least one study buddy to add!");
      return;
    }

    const code = `GROUP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newGroup: Group = {
      name: gName,
      groupCode: code,
      avatar: gName.substring(0, 2).toUpperCase(),
      color: "from-purple-500 to-indigo-650",
      members: selectedMembers,
      lastMsg: "Study Circle created! Welcome everyone! 👋",
      time: "Just now",
      isGroup: true
    };

    const updated = [newGroup, ...groups];
    setGroups(updated);
    localStorage.setItem("edutrack_groups", JSON.stringify(updated));

    // Reset State & Close Modal
    setNewGroupName("");
    setSelectedMembers([]);
    setShowGroupModal(false);

    // Select the new group as active
    setActiveFriend(null);
    setActiveGroup(newGroup);
  };


  // Simulated Buddy Responses for Direct Chats & Group Chats
  const triggerAutoResponse = (buddyCode: string, userMsg: string) => {
    setTimeout(async () => {
      let replyText = "That's awesome! Let's review the chemical reactions NCERT chapters together.";
      const lower = userMsg.toLowerCase();
      if (lower.includes("hello") || lower.includes("hi")) {
        replyText = `Hey there study buddy! Ready to balance some CBSE science equations today? 🧪`;
      } else if (lower.includes("help") || lower.includes("question") || lower.includes("doubt")) {
        replyText = `Sure! What problem are you stuck on? Let's check it against the Class 10 board syllabus! 📝`;
      } else if (lower.includes("balanced") || lower.includes("equation")) {
        replyText = `Yes! Balanced equations conform to the Law of Conservation of Mass. For example: ~2H_2 + O_2 ──> 2H_2O~ is perfectly balanced!`;
      } else if (lower.includes("thank")) {
        replyText = `Anytime! We're here to learn together. Let's aim for 100% in our final board exams! 🏆`;
      }

        const botMsg = {
          id: Date.now().toString() + Math.random(),
          chatId: activeChatIdRef.current,
          senderId: "simulated_buddy_" + buddyCode,
          senderCode: buddyCode,
          text: replyText,
          timestamp: new Date()
        };
        const stored = localStorage.getItem("edutrack_messages_" + activeChatIdRef.current);
        let msgs = [];
        if (stored) {
          try { msgs = JSON.parse(stored); } catch(e) {}
        }
        msgs.push(botMsg);
        localStorage.setItem("edutrack_messages_" + activeChatIdRef.current, JSON.stringify(msgs));

        // Update last message in friends list
        setFriends(prev => {
          const updated = prev.map(f => {
            if (f.friendCode === buddyCode) {
              return { ...f, lastMsg: replyText, time: "Just now" };
            }
            return f;
          });
          localStorage.setItem("edutrack_friends", JSON.stringify(updated));
          return updated;
        });
    }, 1500);
  };

  const triggerGroupAutoResponse = (gCode: string, userMsg: string, members: string[]) => {
    const hasAditya = members.includes("ADITYA#9581");
    const hasPriya = members.includes("PRIYA#7204");
    
    if (hasAditya) {
      setTimeout(async () => {
        const replyText = `Hey guys! I just reviewed the NCERT equation balancing section. It's actually super straightforward. Who's ready to solve one?`;
        const botMsg = {
          id: Date.now().toString() + Math.random(),
          chatId: gCode,
          senderId: "simulated_buddy_ADITYA#9581",
          senderCode: "ADITYA#9581",
          text: replyText,
          timestamp: new Date()
        };
        const stored = localStorage.getItem("edutrack_messages_" + gCode);
        let msgs = [];
        if (stored) {
          try { msgs = JSON.parse(stored); } catch(e) {}
        }
        msgs.push(botMsg);
        localStorage.setItem("edutrack_messages_" + gCode, JSON.stringify(msgs));

        // Update groups list last message preview
        setGroups(prev => {
          const updated = prev.map(g => {
            if (g.groupCode === gCode) {
              return { ...g, lastMsg: replyText, time: "Just now" };
            }
            return g;
          });
          localStorage.setItem("edutrack_groups", JSON.stringify(updated));
          return updated;
        });

        if (hasPriya) {
          setTimeout(async () => {
            const replyText2 = `Count me in, Aditya! Murali, what do you think? Let's balance the reaction together! 🧪`;
            const botMsg = {
              id: Date.now().toString() + Math.random(),
              chatId: gCode,
              senderId: "simulated_buddy_PRIYA#7204",
              senderCode: "PRIYA#7204",
              text: replyText2,
              timestamp: new Date()
            };
            const stored = localStorage.getItem("edutrack_messages_" + gCode);
            let msgs = [];
            if (stored) {
              try { msgs = JSON.parse(stored); } catch(e) {}
            }
            msgs.push(botMsg);
            localStorage.setItem("edutrack_messages_" + gCode, JSON.stringify(msgs));
          }, 2000);
        }
      }, 1500);
    }
  };

  const handleRemoveFriend = () => {
    if (!activeFriend) return;
    if (window.confirm(`Are you sure you want to remove ${activeFriend.name}?`)) {
      setFriends(prev => {
        const updated = prev.filter(f => f.friendCode !== activeFriend.friendCode);
        localStorage.setItem("edutrack_friends", JSON.stringify(updated));
        return updated;
      });
      setActiveFriend(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId) return;
    
    const storageRef = ref(storage, `chat_uploads/${activeChatId}/${Date.now()}_${file.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      await handleSend(undefined, url, file.type, file.name);
    } catch(err) {
      console.error(err);
      alert("File upload failed. Check Firebase Storage rules.");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const storageRef = ref(storage, `chat_uploads/${activeChatId}/voice_${Date.now()}.webm`);
        try {
          const snapshot = await uploadBytes(storageRef, audioBlob);
          const url = await getDownloadURL(snapshot.ref);
          await handleSend(undefined, url, 'audio/webm', 'Voice Note');
        } catch(err) {
          console.error(err);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch(err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleReadAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/<[^>]+>/g, '').replace(/🤖 \*\*StudyBot:\*\*/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (e?: React.FormEvent, attachmentUrl?: string, attachmentType?: string, attachmentName?: string) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() && !attachmentUrl) return;

    const messageText = chatInput.trim();
    setChatInput("");

      const newMsg: DirectMessage = {
        id: Date.now().toString(),
        chatId: activeChatId!,
        senderId: user?.uid || "local_user",
        senderCode: friendCode,
        text: messageText,
        timestamp: new Date(),
        attachmentUrl,
        attachmentType,
        attachmentName
      };

      const stored = localStorage.getItem("edutrack_messages_" + activeChatId);
      let msgs = [];
      if (stored) {
        try { msgs = JSON.parse(stored); } catch(e) {}
      }
      msgs.push(newMsg);
      localStorage.setItem("edutrack_messages_" + activeChatId, JSON.stringify(msgs));
      
      // Update state instantly (idempotent array replacement)
      setMessages(msgs);
      
      // Async Firebase Cloud Push (Fire and forget)
      addDoc(collection(db, "edutrack_messages"), {
        id: newMsg.id,
        chatId: newMsg.chatId,
        senderId: newMsg.senderId,
        senderCode: newMsg.senderCode,
        text: newMsg.text,
        timestamp: new Date(),
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentType || null,
        attachmentName: attachmentName || null,
        read: false
      }).catch((e: any) => console.warn("Firebase push failed", e));

      // AI StudyBot Logic
      if (messageText.toLowerCase().includes("@studybot")) {
        const botResponses = [
          "I can help with that! A balanced equation for respiration is C6H12O6 + 6O2 -> 6CO2 + 6H2O + Energy.",
          "According to my notes, mitosis has 4 main phases: Prophase, Metaphase, Anaphase, Telophase.",
          "That's a great question! E=mc^2 means energy equals mass times the speed of light squared.",
          "I'm your StudyBot! I'm still learning, but I'll get better over time. Keep studying!"
        ];
        const randomResp = botResponses[Math.floor(Math.random() * botResponses.length)];
        
        const botMsg: DirectMessage = {
          id: Date.now().toString() + "_bot",
          chatId: activeChatId!,
          senderId: "study_bot",
          senderCode: "BOT",
          text: `🤖 **StudyBot:** ${randomResp}`,
          timestamp: new Date()
        };
        
        setTimeout(() => {
          const s = localStorage.getItem("edutrack_messages_" + activeChatId);
          let bmsgs = [];
          if (s) { try { bmsgs = JSON.parse(s); } catch(e) {} }
          bmsgs.push(botMsg);
          localStorage.setItem("edutrack_messages_" + activeChatId, JSON.stringify(bmsgs));
          setMessages(prev => [...prev, botMsg]);
          
          addDoc(collection(db, "edutrack_messages"), {
            ...botMsg,
            timestamp: new Date()
          }).catch((e: any) => console.warn(e));
        }, 1200);
      }

      if (activeGroup) {
        // Update groups list last message preview
        setGroups(prev => {
          const updated = prev.map(g => {
            if (g.groupCode === activeGroup.groupCode) {
              return { ...g, lastMsg: messageText, time: "Just now" };
            }
            return g;
          });
          localStorage.setItem("edutrack_groups", JSON.stringify(updated));
          return updated;
        });

        // Trigger Group replies
        triggerGroupAutoResponse(activeGroup.groupCode, messageText, activeGroup.members);
      } else if (activeFriend) {
        // Update friends list last message preview
        setFriends(prev => {
          const updated = prev.map(f => {
            if (f.friendCode === activeFriend.friendCode) {
              return { ...f, lastMsg: messageText, time: "Just now" };
            }
            return f;
          });
          localStorage.setItem("edutrack_friends", JSON.stringify(updated));
          return updated;
        });

        // Trigger Direct Chat replies
        if (activeFriend.friendCode.startsWith("ADITYA#") || activeFriend.friendCode.startsWith("PRIYA#") || activeFriend.friendCode.startsWith("ROHAN#") || activeFriend.friendCode.includes("CLASSMATE")) {
          triggerAutoResponse(activeFriend.friendCode, messageText);
        }
      }

      // Award XP for collaborating!
      const storedXp = localStorage.getItem("edutrack_xp");
      if (storedXp) {
        const currentXp = parseInt(storedXp, 10);
        localStorage.setItem("edutrack_xp", (currentXp + 10).toString());
      }
  };

  const selectFriendChat = (friend: Friend) => {
    setActiveGroup(null);
    setActiveFriend(friend);
  };

  const selectGroupChat = (group: Group) => {
    setActiveFriend(null);
    setActiveGroup(group);
  };

  return (
    <div className="h-full max-h-full bg-slate-50 dark:bg-[#070b13] flex flex-col transition-colors duration-300 relative overflow-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
        }
      `}</style>
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Direct Chat Hub Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex h-full border-x border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-[#0d121f]/70 backdrop-blur-2xl shadow-2xl relative z-10 overflow-hidden min-h-0">
        
        {/* LEFT PANEL: WHATSAPP SIDEBAR (Chat list & Add Friend / Create Group) */}
        <aside className="w-80 md:w-96 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col shrink-0 bg-white/40 dark:bg-[#0a0f18]/45 backdrop-blur-xl">
          
          {/* Sidebar Header: Profile Information */}
          <div className="p-5 border-b border-slate-200/40 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none">StudyCircles</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const html = document.documentElement;
                    if (html.classList.contains('dark')) {
                      html.classList.remove('dark');
                      localStorage.setItem('edutrack_theme', 'light');
                    } else {
                      html.classList.add('dark');
                      localStorage.setItem('edutrack_theme', 'dark');
                    }
                  }}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all flex items-center justify-center"
                  title="Toggle Theme"
                >
                  <Moon className="w-4 h-4 hidden dark:block" />
                  <Sun className="w-4 h-4 block dark:hidden" />
                </button>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all flex items-center justify-center"
                  title="Add Classmate by Code"
                >
                  <UserPlus className="w-4 h-4 text-indigo-650 dark:text-indigo-400" />
                </button>
                <button 
                  onClick={() => setShowGroupModal(true)}
                  className="p-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  title="Create Group Chat"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">New Group</span>
                </button>
              </div>
            </div>

            {/* My Friend Code Banner */}
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 px-4 py-3 rounded-2xl flex items-center justify-between">
              <div className="overflow-hidden">
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none">My Friend Code</p>
                <p className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400 mt-1 select-all truncate">{friendCode || "Generating..."}</p>
              </div>
              <button 
                onClick={copyMyCode} 
                className="p-2 hover:bg-indigo-150 dark:hover:bg-indigo-900/60 rounded-xl text-indigo-550 transition-colors"
                title="Copy Friend Code"
              >
                {copied ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Chat List Sections (Groups and Direct Chats) */}
          <div className="flex-1 overflow-y-auto p-2 space-y-5 custom-scrollbar">
            
            {/* 1. STUDY GROUPS SECTION */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-555 px-3 block mb-1">
                Group Study Circles
              </span>
              <div className="space-y-0.5">
                {groups.length === 0 ? (
                  <p className="text-[10px] text-slate-400 font-semibold px-3 py-2 italic">No group chats created yet.</p>
                ) : (
                  groups.map((group) => {
                    const isActive = activeGroup?.groupCode === group.groupCode;
                    return (
                      <div
                        key={group.groupCode}
                        onClick={() => selectGroupChat(group)}
                        className={cn(
                          "flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer transition-all select-none border border-transparent",
                          isActive 
                            ? "bg-indigo-500/10 dark:bg-indigo-500/10 border-indigo-200/50 dark:border-indigo-500/20 shadow-md backdrop-blur-md" 
                            : "hover:bg-slate-50/50 dark:hover:bg-slate-900/20 border-transparent hover:border-slate-200/30 dark:hover:border-slate-800/30"
                        )}
                      >
                        <div className={cn(
                          "w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-sm shadow-sm border border-white/10 shrink-0",
                          group.color
                        )}>
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <p className="font-extrabold text-sm text-slate-850 dark:text-slate-100 truncate flex items-center gap-1.5">
                              {group.name}
                              <span className="text-[8px] font-black uppercase text-indigo-550 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md shrink-0">Group</span>
                            </p>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight shrink-0">{group.time}</span>
                          </div>
                          <p className="text-xs text-slate-505 dark:text-slate-450 truncate leading-snug">{group.lastMsg}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 1.5. PENDING FRIEND REQUESTS SECTION */}
            {pendingRequests.length > 0 && (
              <div className="space-y-1.5 mb-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 dark:text-amber-400 px-3 block mb-1">
                  Friend Requests ({pendingRequests.length})
                </span>
                <div className="space-y-1.5 p-2 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-xs text-slate-850 dark:text-slate-200 truncate">{req.senderName}</p>
                        <p className="text-[9px] font-mono text-slate-450 truncate mt-0.5">{req.senderCode}</p>
                      </div>
                      <div className="flex gap-1.5 ml-2">
                        <button onClick={() => handleAcceptRequest(req)} className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                          Accept
                        </button>
                        <button onClick={() => handleDeclineRequest(req)} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 text-[10px] font-black uppercase tracking-wider rounded-lg">
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1.7. SENT INVITES SECTION */}
            {sentRequests.length > 0 && (
              <div className="space-y-1.5 mb-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-555 px-3 block mb-1">
                  Sent Requests ({sentRequests.length})
                </span>
                <div className="space-y-1.5 p-2 bg-slate-500/5 rounded-2xl border border-slate-500/10">
                  {sentRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-xs text-slate-855 dark:text-slate-200 truncate">{req.recipientCode}</p>
                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5 animate-pulse">Pending accept...</p>
                      </div>
                      <button 
                        onClick={() => handleCancelRequest(req)} 
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-700 text-slate-600 dark:text-slate-350 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors"
                        title="Cancel Request"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. DIRECT CHATS SECTION */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-555 px-3 block mb-1">
                Direct Chats
              </span>
              <div className="space-y-0.5">
                {friends.length === 0 ? (
                  <p className="text-[10px] text-slate-400 font-semibold px-3 py-2 italic">Add a classmate by code to start direct chats!</p>
                ) : (
                  friends.map((friend) => {
                    const isActive = activeFriend?.friendCode === friend.friendCode;
                    return (
                      <div
                        key={friend.friendCode}
                        onClick={() => selectFriendChat(friend)}
                        className={cn(
                          "flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer transition-all select-none border border-transparent",
                          isActive 
                            ? "bg-indigo-500/10 dark:bg-indigo-500/10 border-indigo-200/50 dark:border-indigo-500/20 shadow-md backdrop-blur-md" 
                            : "hover:bg-slate-50/50 dark:hover:bg-slate-900/20 border-transparent hover:border-slate-200/30 dark:hover:border-slate-800/30"
                        )}
                      >
                        <div className="relative shrink-0">
                          <div className={cn(
                            "w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-sm shadow-sm border border-white/10",
                            friend.color
                          )}>
                            {friend.avatar}
                          </div>
                          {friend.online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <p className="font-extrabold text-sm text-slate-850 dark:text-slate-100 truncate">{friend.name}</p>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight shrink-0">{friend.time}</span>
                          </div>
                          <p className="text-xs text-slate-505 dark:text-slate-450 truncate leading-snug">{friend.lastMsg}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </aside>

        {/* RIGHT PANEL: CHAT WINDOW & CONVERSATION CANVAS */}
        <main className="flex-1 flex flex-col h-full bg-slate-50/20 dark:bg-slate-950/10 backdrop-blur-md min-w-0 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            
            {(!activeFriend && !activeGroup) ? (
              // WHATSAPP WEB STYLE EMPTY STATE
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto"
              >
                <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 rounded-3xl border border-indigo-500/20 mb-6 shadow-lg shadow-indigo-500/5 relative group">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-650 opacity-0 group-hover:opacity-10 transition-opacity blur-md" />
                  <MessageCircle className="w-12 h-12 text-indigo-650 dark:text-indigo-400 relative z-10 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">StudyCircles Direct Chat</h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 max-w-sm leading-relaxed mb-8">
                  Add friends using their unique codes to message privately in real-time, or create group study circles to collaborate with classmates just like WhatsApp!
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8">
                  <div className="p-4 bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 rounded-2xl flex flex-col items-center text-center backdrop-blur-sm shadow-sm hover:scale-[1.03] transition-all duration-300">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-[11px] text-slate-800 dark:text-slate-250 uppercase tracking-wider mb-1">Co-Op Board</h3>
                    <p className="text-[10px] text-slate-400 leading-normal">Real-time canvas sharing to sketch answers together.</p>
                  </div>
                  <div className="p-4 bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 rounded-2xl flex flex-col items-center text-center backdrop-blur-sm shadow-sm hover:scale-[1.03] transition-all duration-300">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                      <Video className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-[11px] text-slate-800 dark:text-slate-250 uppercase tracking-wider mb-1">Video Calls</h3>
                    <p className="text-[10px] text-slate-400 leading-normal">Join voice & video rooms instantly with one click.</p>
                  </div>
                  <div className="p-4 bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 rounded-2xl flex flex-col items-center text-center backdrop-blur-sm shadow-sm hover:scale-[1.03] transition-all duration-300">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-[11px] text-slate-800 dark:text-slate-250 uppercase tracking-wider mb-1">Quiz Duels</h3>
                    <p className="text-[10px] text-slate-400 leading-normal">Challenge peers to CBSE syllabus question games.</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/40 dark:to-slate-900/20 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 text-xs font-bold text-slate-650 dark:text-slate-300 max-w-sm w-full flex flex-col gap-2 shadow-inner">
                  <div className="flex justify-between items-center">
                    <span>Your Code: <strong className="font-mono text-indigo-500 tracking-wider uppercase select-all ml-1">{friendCode}</strong></span>
                    <button 
                      onClick={copyMyCode} 
                      className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-450 font-normal leading-normal text-left">Share this code with your classmates so they can add and message you directly!</span>
                </div>
              </motion.div>
            ) : (
              // ACTIVE CHAT VIEW (DIRECT DM OR GROUP STUDY CIRCLE)
              <motion.div
                key={activeChatId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex h-full overflow-hidden min-w-0 min-h-0 relative"
              >
                {/* Main Content Column */}
                <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 min-h-0 relative">
                  {/* Chat Header */}
                  <div className="p-4 sm:p-5 border-b border-slate-200/50 dark:border-slate-800/55 bg-white/60 dark:bg-[#0c101b]/40 backdrop-blur-xl flex items-center justify-between shrink-0 relative z-20">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-sm",
                        activeGroup ? activeGroup.color : activeFriend?.color
                      )}>
                        {activeGroup ? <Users className="w-5 h-5" /> : activeFriend?.avatar}
                      </div>
                      {!activeGroup && activeFriend?.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
                      )}
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                        {activeGroup ? activeGroup.name : activeFriend?.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-450 font-semibold mt-1">
                        {activeGroup 
                          ? `${activeGroup.members.length + 1} Members • Active Study Circle` 
                          : activeFriend?.online ? "Online Now • Study Buddy" : "Offline • Roster Code: " + activeFriend?.friendCode
                        }
                      </p>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowWhiteboard(!showWhiteboard)}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-md border hover:scale-[1.03] active:scale-[0.97]",
                        showWhiteboard
                          ? "bg-amber-500 text-white border-amber-400 shadow-amber-500/20" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                      )}
                    >
                      <PenTool className="w-4 h-4" />
                      <span className="hidden sm:inline">Board</span>
                    </button>
                    <button 
                      onClick={initiateCall}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-md border hover:scale-[1.03] active:scale-[0.97]",
                        showVideoMeeting 
                          ? "bg-rose-500 text-white border-rose-400 shadow-rose-500/20" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-emerald-650 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                      )}
                    >
                      <Video className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline">{showVideoMeeting ? "End Call" : "Video"}</span>
                    </button>
                    <button 
                      onClick={startQuizDuel}
                      className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-650 text-white rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-orange-500/20 hover:scale-[1.03] active:scale-[0.97]"
                    >
                      ⚔ <span className="hidden sm:inline">Duel</span>
                    </button>

                    {/* Invite button removed as it is for nothing */}
                    {!activeGroup && (
                      <button 
                        onClick={handleRemoveFriend}
                        className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 text-rose-600 dark:text-rose-400 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all hover:scale-[1.03] active:scale-[0.97]"
                        title="Remove Friend"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Video Meeting Interface */}
                <AnimatePresence>
                  {showVideoMeeting && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "45vh", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="w-full bg-[#0a0f1d] border-b border-white/10 relative z-20 shrink-0 overflow-hidden flex flex-col shadow-[0_10px_40px_rgb(0,0,0,0.5)] ring-1 ring-white/5"
                    >
                      <button 
                        onClick={() => setShowVideoMeeting(false)}
                        className="absolute top-4 right-4 z-50 p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full transition-colors backdrop-blur-sm shadow-md border border-white/10"
                        title="Close Video Meeting"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      {liveKitToken ? (
                        <div className="w-full h-full flex-1">
                          <LiveKitRoom
                            video={true}
                            audio={true}
                            token={liveKitToken}
                            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://edutrack-6bc3sb5o.livekit.cloud"}
                            data-lk-theme="default"
                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                          >
                            <VideoConference />
                            <RoomAudioRenderer />
                          </LiveKitRoom>
                        </div>
                      ) : (
                        <div className="flex-1 p-4 flex items-center justify-center h-full w-full">
                          <div className="flex flex-col items-center justify-center text-center">
                            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4 mx-auto drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                            <p className="text-slate-200 font-black text-sm tracking-wide uppercase">Securing video bridge...</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {activeDuel ? (
                  /* Quiz Duel Arena Canvas */
                  <div className="flex-1 flex flex-col h-full bg-[#0a0f1d] text-white overflow-y-auto p-6 relative">
                    {/* Matchmaking Lobby Screen */}
                    {activeDuel.status === 'waiting' && (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none animate-in fade-in duration-300">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping duration-1000" />
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-650 flex items-center justify-center border border-white/20 shadow-2xl">
                            <Sparkles className="w-10 h-10 text-white animate-pulse" />
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-white tracking-wide">StudyCircle Quiz Lobby</h3>
                        <p className="text-xs text-slate-400 font-semibold mt-2 max-w-xs leading-relaxed">
                          Classmate <strong>{activeGroup ? activeGroup.name : activeFriend?.name}</strong> is entering the StudyCircle Quiz Arena...
                        </p>
                        {/* Animated loading */}
                        <div className="mt-8 flex gap-1.5 items-center justify-center">
                          <div className="w-2 h-8 bg-indigo-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-8 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-2 h-8 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                      </div>
                    )}

                    {/* Playing Screen */}
                    {activeDuel.status === 'playing' && (() => {
                      const q = activeDuel.questions[activeDuel.currentQuestionIndex];
                      return (
                        <div className="flex-1 flex flex-col h-full justify-between gap-6">
                          {/* Top stats HUD */}
                          <div className="flex justify-between items-center bg-[#111930] p-4 rounded-2xl border border-white/5 shadow-inner shrink-0">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-extrabold text-[10px] text-white">
                                {nickname.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block leading-none">Score</span>
                                <span className="text-xs font-black text-white mt-0.5 block">{activeDuel.myScore} pts</span>
                              </div>
                            </div>

                            {/* Circular Timer in Center */}
                            <div className="relative flex items-center justify-center">
                              <svg className="w-14 h-14">
                                <circle cx="28" cy="28" r="22" stroke="#1e293b" strokeWidth="4" fill="none" />
                                <circle 
                                  cx="28" cy="28" r="22" stroke="#6366f1" strokeWidth="4" fill="none"
                                  strokeDasharray="138"
                                  strokeDashoffset={138 - (138 * activeDuel.timer) / 10}
                                  className="transition-all duration-1000 ease-linear origin-center -rotate-90"
                                />
                              </svg>
                              <span className="absolute text-sm font-black text-white">{activeDuel.timer}s</span>
                            </div>

                            <div className="flex items-center gap-2 text-right">
                              <div>
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block leading-none">Buddy</span>
                                <span className="text-xs font-black text-white mt-0.5 block">{activeDuel.buddyScore} pts</span>
                              </div>
                              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-extrabold text-[10px] text-white">
                                {activeFriend ? activeFriend.avatar : "CB"}
                              </div>
                            </div>
                          </div>

                          {/* Board question Card */}
                          <div className="bg-[#111930] border border-white/5 p-6 rounded-3xl text-center shadow-lg relative overflow-hidden flex-1 flex flex-col justify-center">
                            <span className="absolute top-4 left-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                              CBSE BOARD QUESTION {activeDuel.currentQuestionIndex + 1} of 3
                            </span>
                            <h4 className="text-base sm:text-lg font-bold leading-relaxed text-slate-100 mt-4">
                              <span dangerouslySetInnerHTML={{
                                __html: q.question
                                  .replace(/_([a-zA-Z0-9\+\-]+)/g, '<sub>$1</sub>')
                                  .replace(/\^([a-zA-Z0-9\+\-]+)/g, '<sup>$1</sup>')
                              }} />
                            </h4>
                          </div>

                          {/* 4 Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 shrink-0">
                            {q.options.map((option, idx) => {
                              const isMyAnswer = activeDuel.myAnswered === option;
                              const isCorrectAnswer = option === q.correctAnswer;
                              const hasAnswered = activeDuel.myAnswered !== null;
                              
                              let btnClass = "bg-[#111930] hover:bg-[#15203d] border-white/5 text-slate-200 hover:border-indigo-500/40";
                              if (hasAnswered) {
                                if (isCorrectAnswer) {
                                  btnClass = "bg-emerald-700/80 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 pointer-events-none";
                                } else if (isMyAnswer) {
                                  btnClass = "bg-rose-700/80 border-rose-500 text-white shadow-lg shadow-rose-500/10 pointer-events-none";
                                } else {
                                  btnClass = "opacity-40 border-white/5 pointer-events-none";
                                }
                              }

                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleAnswerSelection(option)}
                                  disabled={hasAnswered}
                                  className={cn(
                                    "w-full text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm font-semibold flex items-center gap-3 relative overflow-hidden active:scale-98",
                                    btnClass
                                  )}
                                >
                                  <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs shrink-0 select-none text-slate-400">
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                  <span className="flex-1 break-words">
                                    <span dangerouslySetInnerHTML={{
                                      __html: option
                                        .replace(/_([a-zA-Z0-9\+\-]+)/g, '<sub>$1</sub>')
                                        .replace(/\^([a-zA-Z0-9\+\-]+)/g, '<sup>$1</sup>')
                                    }} />
                                  </span>

                                  {/* opponent dot choice tag indicator */}
                                  {hasAnswered && activeDuel.buddyAnswered === option && (
                                    <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md animate-pulse">
                                      {activeFriend ? activeFriend.name.split(" ")[0] : "Buddy"}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Podium Victory Screen */}
                    {activeDuel.status === 'podium' && (
                      <div className="flex-1 flex flex-col justify-between items-center text-center p-4 select-none animate-in zoom-in-95 duration-200">
                        <div className="my-auto flex flex-col items-center gap-6">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping duration-2000" />
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center border border-white/20 shadow-2xl">
                              <Trophy className="w-10 h-10 text-white animate-bounce" />
                            </div>
                          </div>

                          <div>
                            <h3 className="text-2xl font-black text-white tracking-wide">Classroom Podium</h3>
                            <p className="text-xs text-slate-400 font-semibold mt-1">
                              You completed the Chemistry board preparation duel!
                            </p>
                          </div>

                          {/* Podium Pedestal Stand Render */}
                          <div className="flex items-end justify-center gap-4 mt-8 h-40 w-full max-w-xs px-4">
                            {/* Rank 2 (Opponent) */}
                            <div className="flex flex-col items-center flex-1">
                              <span className="text-[10px] font-black text-slate-300 uppercase truncate max-w-[80px] mb-1.5">
                                {activeFriend ? activeFriend.name.split(" ")[0] : "Buddy"}
                              </span>
                              <div className="bg-slate-700 border border-slate-600 rounded-t-2xl w-full h-16 flex items-center justify-center relative shadow-inner">
                                <span className="font-mono font-black text-2xl text-slate-200">2</span>
                                <span className="absolute -bottom-6 text-[10px] font-black text-slate-400 tracking-tight">{activeDuel.buddyScore} pts</span>
                              </div>
                            </div>

                            {/* Rank 1 (User or Winner) */}
                            <div className="flex flex-col items-center flex-1">
                              <span className="text-[10px] font-black text-amber-400 uppercase truncate max-w-[80px] mb-1.5 animate-pulse">
                                You
                              </span>
                              <div className="bg-amber-650 border border-amber-500 rounded-t-2xl w-full h-24 flex items-center justify-center relative shadow-inner">
                                <div className="absolute top-2 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <Sparkles className="w-2.5 h-2.5 text-slate-900" />
                                </div>
                                <span className="font-mono font-black text-3xl text-amber-200">1</span>
                                <span className="absolute -bottom-6 text-[10px] font-black text-amber-400 tracking-tight">{activeDuel.myScore} pts</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl max-w-xs mt-8 shrink-0">
                            <p className="text-xs text-emerald-400 font-extrabold m-0 leading-normal">
                              🎉 Double Reward Added! You have gained up to <strong>+{activeDuel.myScore * 15 + 10} XP</strong> for board exam practice!
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            setActiveDuel(null);
                            const triggerConfetti = (window as any).triggerConfettiPop;
                            if (triggerConfetti) triggerConfetti();
                          }}
                          className="w-full max-w-xs bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-700 hover:to-purple-750 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-98 shrink-0 mb-4"
                        >
                          Claim Rewards &amp; Exit
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Direct & Group Message Feed */}
                    <div ref={messagesEndRef} className="flex-1 h-0 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/10 dark:bg-[#090d16]/30 backdrop-blur-md custom-scrollbar">
                      {error && (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl px-4 py-3 mb-4 text-xs font-semibold">
                          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </div>
                      )}

                      {loadingMessages && messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider animate-pulse">Syncing chat room...</span>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-6 select-none">
                          <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-full border border-indigo-150/40 dark:border-indigo-900/30">
                            <Sparkles className="w-6 h-6 text-indigo-500" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-800 dark:text-white">This Chat is Empty</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 max-w-xs mx-auto leading-relaxed">
                              Type a private study message below to start your real-time chat with <strong>{activeGroup ? activeGroup.name : activeFriend?.name}</strong>!
                            </p>
                          </div>
                        </div>
                      ) : (
                        messages.filter(m => !deletedMsgIds.includes(m.id)).map((msg, index, arr) => {
                          const isOwn = msg.senderCode === friendCode;
                          const senderBuddy = friends.find(f => f.friendCode === msg.senderCode);
                          const displaySenderName = isOwn 
                            ? "You" 
                            : senderBuddy 
                              ? senderBuddy.name 
                              : msg.senderCode.split("#")[0];

                          const isSelected = selectedContextMenuMsg?.id === msg.id;

                          // Grouping logic: check if consecutive message from same sender within 5 mins
                          const prevMsg = index > 0 ? arr[index - 1] : null;
                          const isConsecutive = prevMsg && prevMsg.senderCode === msg.senderCode && 
                            (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 5 * 60 * 1000);

                          return (
                            <div 
                              key={msg.id} 
                              className={cn(
                                "flex gap-3 max-w-[80%] cursor-pointer",
                                isOwn ? "ml-auto flex-row-reverse" : "mr-auto",
                                isConsecutive ? "mt-1" : "mt-4"
                              )}
                              onContextMenu={(e) => handleContextMenu(e, msg)}
                              onTouchStart={() => handleTouchStart(msg)}
                              onTouchEnd={handleTouchEnd}
                              onTouchMove={handleTouchMove}
                            >
                              {isConsecutive ? (
                                <div className="w-8 shrink-0" />
                              ) : (
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black select-none",
                                  isOwn 
                                    ? "bg-indigo-100 text-indigo-650 dark:bg-indigo-900/50 dark:text-indigo-400" 
                                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20"
                                )}>
                                  {isOwn ? nickname.substring(0, 2).toUpperCase() : (senderBuddy?.avatar || msg.senderCode.substring(0, 2).toUpperCase())}
                                </div>
                              )}
                              
                              <div className="flex flex-col gap-0.5">
                                {!isConsecutive && (
                                  <span className={`text-[9px] font-black uppercase tracking-wider ${isOwn ? "text-indigo-500 text-right pr-1" : "text-slate-500 pl-1"}`}>
                                    {displaySenderName}
                                  </span>
                                )}
                                
                                <div className={cn(
                                  "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md break-words transition-all duration-200 hover:-translate-y-0.5 border",
                                  isOwn 
                                    ? "bg-gradient-to-br from-indigo-600 via-indigo-555 to-purple-650 text-white border-indigo-400/20 shadow-[0_4px_20px_rgba(99,102,241,0.25)]" 
                                    : "bg-white/60 dark:bg-slate-900/60 border-slate-200/40 dark:border-white/5 backdrop-blur-md text-slate-800 dark:text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]",
                                  isOwn && !isConsecutive && "rounded-tr-none",
                                  !isOwn && !isConsecutive && "rounded-tl-none",
                                  isSelected && "ring-4 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-[1.02]"
                                )}>
                                  {msg.attachmentUrl && (
                                    <div className="mb-2">
                                      {msg.attachmentType?.startsWith('image/') ? (
                                        <img src={msg.attachmentUrl} alt="Attachment" className="max-w-full rounded-xl" />
                                      ) : msg.attachmentType?.startsWith('audio/') ? (
                                        <audio src={msg.attachmentUrl} controls className="w-full h-10" />
                                      ) : (
                                        <a href={msg.attachmentUrl} target="_blank" className="flex items-center gap-2 underline text-sm break-all">
                                          <Paperclip className="w-4 h-4 shrink-0" />
                                          {msg.attachmentName || "Download File"}
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  {msg.text && <span dangerouslySetInnerHTML={{
                                    __html: msg.text
                                      .replace(/~([^~]+)~/g, (match, p1) => {
                                        return p1.replace(/_([a-zA-Z0-9\+\-]+)/g, '<sub>$1</sub>').replace(/\^([a-zA-Z0-9\+\-]+)/g, '<sup>$1</sup>');
                                      })
                                      .replace(/<sub>/g, '<sub class="select-none font-bold text-indigo-300 dark:text-indigo-400">')
                                      .replace(/<sup>/g, '<sup class="select-none font-bold text-indigo-300 dark:text-indigo-400">')
                                  }} />}
                                </div>
                                <div className={`flex items-center gap-2 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                                  {msg.text && (
                                    <button 
                                      onClick={() => handleReadAloud(msg.text)} 
                                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 opacity-60 hover:opacity-100"
                                      title="Read Aloud"
                                    >
                                      <Volume2 className="w-3 h-3" />
                                    </button>
                                  )}
                                  <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {isOwn && (
                                    msg.read ? (
                                      <CheckCheck className="w-3 h-3 text-indigo-400 shrink-0" />
                                    ) : (
                                      <Check className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Private / Group Message Input Bar */}
                    <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/55 bg-white/60 dark:bg-[#0c101b]/40 backdrop-blur-xl shrink-0">
                      <form 
                        onSubmit={(e) => handleSend(e)}
                        className="flex gap-2.5 relative max-w-4xl mx-auto w-full items-center"
                      >
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={activeGroup ? `Message ${activeGroup.name}...` : `Message ${activeFriend?.name}...`}
                          maxLength={500}
                          className="flex-1 rounded-full pl-5 pr-14 py-3.5 bg-slate-50/30 dark:bg-[#111625]/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner text-sm sm:text-base text-slate-855 dark:text-white transition-all focus:border-indigo-500"
                        />
                        {chatInput.trim() ? (
                          <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-indigo-650 hover:bg-indigo-700 text-white rounded-full transition-all flex items-center justify-center shadow-md">
                            <Send className="w-4 h-4 ml-0.5" />
                          </button>
                        ) : (
                          <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={cn("absolute right-1.5 top-1.5 bottom-1.5 aspect-square rounded-full transition-all flex items-center justify-center shadow-md", isRecording ? "bg-red-500 text-white animate-pulse scale-110" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300")}>
                            <Mic className="w-4 h-4" />
                          </button>
                        )}
                      </form>
                    </div>
                  </>
                )}
                  </div>

                  {/* Right Side: Whiteboard Panel */}
                  <AnimatePresence>
                    {showWhiteboard && (
                      <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "400px", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="hidden md:flex flex-col h-full shrink-0 border-l border-slate-200 dark:border-slate-800 relative z-30 bg-white dark:bg-slate-950"
                      >
                        <WhiteboardPanel chatId={activeChatId} nickname={nickname} db={db} />
                      </motion.div>
                    )}
                  </AnimatePresence>

              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* MODAL 1: ADD FRIEND BY CODE */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6"
            >
              <div className="text-center">
                <div className="flex items-center gap-4 text-slate-800 dark:text-white mb-2">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                    <UserPlus className="w-6 h-6 text-indigo-650 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Add or Join</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Enter a friend code or group code</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddFriend} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase ml-1 block">Friend/Group Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={searchCode}
                      onChange={(e) => { setSearchCode(e.target.value.toUpperCase()); setAddError(""); }}
                      maxLength={20}
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono font-bold tracking-widest text-sm uppercase transition-all"
                      placeholder="e.g. ADITYA#9581 or GROUP-1234"
                    />
                  </div>
                </div>

                {addError && (
                  <div className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/50 p-3 rounded-xl">
                    {addError}
                  </div>
                )}

                {addSuccess && (
                  <div className="text-emerald-500 text-xs font-bold text-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/50 p-3 rounded-xl">
                    {addSuccess}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setAddError(""); }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold py-3.5 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!searchCode.trim()}
                    className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md shadow-indigo-500/10 disabled:opacity-50"
                  >
                    Add Friend
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CREATE GROUP CHAT */}
      <AnimatePresence>
        {showGroupModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/35 border border-indigo-150 dark:border-indigo-850 text-indigo-600 dark:text-indigo-400 mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Create Group Study Circle</h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Assemble a study group with your classmates to message each other together.
                </p>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-5">
                {/* Group Name input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase ml-1 block">Group Name</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Maths Study Squad or Science Stars"
                    maxLength={25}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-855 dark:text-white transition-all"
                  />
                </div>

                {/* Buddy checklist selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase ml-1 block">Select Members</label>
                  <div className="max-h-40 overflow-y-auto space-y-2 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-900/40">
                    {friends.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-semibold italic text-center py-4">Add some friends by code first before creating a group!</p>
                    ) : (
                      friends.map((friend) => {
                        const isChecked = selectedMembers.includes(friend.friendCode);
                        return (
                          <div 
                            key={friend.friendCode}
                            onClick={() => toggleSelectMember(friend.friendCode)}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-150/50 dark:border-slate-850 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center text-white font-extrabold text-[10px]",
                                friend.color
                              )}>
                                {friend.avatar}
                              </div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{friend.name}</span>
                            </div>
                            {/* Checkbox circle indicator */}
                            <div className={cn(
                              "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                              isChecked 
                                ? "bg-indigo-650 border-indigo-650 text-white" 
                                : "border-slate-300 dark:border-slate-700"
                            )}>
                              {isChecked && (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {groupError && (
                  <div className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/50 p-3 rounded-xl">
                    {groupError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowGroupModal(false); setNewGroupName(""); setSelectedMembers([]); setGroupError(""); }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold py-3.5 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newGroupName.trim() || selectedMembers.length === 0}
                    className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md shadow-indigo-500/10 disabled:opacity-50"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INCOMING CALL OVERLAY */}
      <AnimatePresence>
        {incomingCall && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white/80 dark:bg-[#0c0f1d]/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2rem] p-8 shadow-[0_20px_50px_rgb(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(99,102,241,0.15)] ring-1 ring-slate-900/5 space-y-6 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-indigo-500/20 blur-[50px] -z-10 pointer-events-none"></div>
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-500/40 relative"
              >
                {incomingCall.callerName.substring(0, 2).toUpperCase()}
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 animate-ping opacity-75"></div>
              </motion.div>
              
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{incomingCall.callerName}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Incoming Video Call...</p>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <button 
                  onClick={handleDeclineCall}
                  className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                  title="Decline"
                >
                  <X className="w-8 h-8" />
                </button>
                <button 
                  onClick={handleAcceptCall}
                  className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                  title="Accept"
                >
                  <Video className="w-8 h-8" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OUTGOING CALL OVERLAY */}
      <AnimatePresence>
        {outgoingCall && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-[#0c0f1d]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(99,102,241,0.15)] space-y-6 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-indigo-500/20 blur-[50px] -z-10 pointer-events-none"></div>
              <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto flex items-center justify-center text-slate-400 text-3xl font-black relative overflow-hidden">
                <div className="absolute w-full h-full bg-indigo-500/20 animate-pulse"></div>
                <UserPlus className="w-8 h-8 relative z-10" />
              </div>
              
              <div>
                <h3 className="text-2xl font-black text-white">Calling Buddy...</h3>
                <p className="text-slate-400 font-bold mt-1">Waiting for them to answer</p>
              </div>

              <div className="flex justify-center mt-8">
                <button 
                  onClick={cancelOutgoingCall}
                  className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-500 font-bold rounded-full transition-colors flex items-center gap-2"
                >
                  <X className="w-5 h-5" /> Cancel Call
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MESSAGE CONTEXT MENU MODAL */}
      <AnimatePresence>
        {selectedContextMenuMsg && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-850 dark:text-white"
            >
              {/* Header / Preview */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[10px] font-black text-indigo-550 dark:text-indigo-400 uppercase tracking-widest block mb-2">Message Options</span>
                <p className="text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-xl font-mono truncate text-slate-505 dark:text-slate-400">
                  "{selectedContextMenuMsg.text || "[Attachment]"}"
                </p>
              </div>

              {/* Info section */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sent Time</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {new Date(selectedContextMenuMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Read Status</span>
                  {selectedContextMenuMsg.senderCode === friendCode ? (
                    selectedContextMenuMsg.read ? (
                      <span className="font-black text-indigo-500 flex items-center gap-1">Read by classmate <CheckCheck className="w-3.5 h-3.5 text-indigo-400" /></span>
                    ) : (
                      <span className="font-black text-slate-455 dark:text-slate-400 flex items-center gap-1">Delivered <Check className="w-3.5 h-3.5" /></span>
                    )
                  ) : (
                    <span className="font-black text-slate-700 dark:text-slate-350">Received message</span>
                  )}
                </div>
              </div>

              {/* Action Buttons List */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedContextMenuMsg.text || "");
                    alert("Message copied to clipboard!");
                    setSelectedContextMenuMsg(null);
                  }}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 rounded-xl text-xs font-extrabold tracking-wide uppercase transition-colors flex items-center gap-2.5 text-slate-700 dark:text-slate-300"
                >
                  <Copy className="w-4 h-4 text-indigo-500" /> Copy Text
                </button>

                <button
                  onClick={() => handleDeleteForMe(selectedContextMenuMsg)}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 rounded-xl text-xs font-extrabold tracking-wide uppercase transition-colors flex items-center gap-2.5 text-slate-700 dark:text-slate-300"
                >
                  <Clock className="w-4 h-4 text-amber-500" /> Delete for Me
                </button>

                {selectedContextMenuMsg.senderCode === friendCode && (
                  <button
                    onClick={() => handleDeleteForAll(selectedContextMenuMsg)}
                    className="w-full text-left px-4 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 dark:hover:bg-rose-955/40 rounded-xl text-xs font-extrabold tracking-wide uppercase transition-colors flex items-center gap-2.5 text-rose-600 dark:text-rose-450"
                  >
                    <X className="w-4 h-4 text-rose-500" /> Delete for Everyone
                  </button>
                )}

                <button
                  onClick={() => setSelectedContextMenuMsg(null)}
                  className="w-full text-center py-3.5 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-500 mt-2 block"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
