"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, 
  Users, MessageSquare, Hand, Palette, Sparkles, CheckCircle2, 
  Send, MoreVertical, ShieldAlert, Award, ArrowLeft, BarChart2, Smile
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  Classroom, 
  getClassroomById, 
  recordMeetingAttendance 
} from "@/lib/classroom";
import { cn } from "@/lib/utils";

export default function StudentLiveMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const classId = params?.id as string;

  const [cls, setCls] = useState<Classroom | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isWhiteboardView, setIsWhiteboardView] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "people" | "polls">("chat");

  // Floating Reactions
  const [reactions, setReactions] = useState<{ id: string; emoji: string }[]>([]);

  // Live Chat State
  const [chatMessages, setChatMessages] = useState<{
    id: string;
    sender: string;
    role: "teacher" | "student";
    text: string;
    time: string;
  }[]>([
    {
      id: "m1",
      sender: "System",
      role: "teacher",
      text: "🔴 Connected to live classroom. Please keep your microphone muted unless called upon.",
      time: "Just now"
    },
    {
      id: "m2",
      sender: "Dr. Rajesh Sharma (Host)",
      role: "teacher",
      text: "Welcome everyone! Today we will master the 3 Pythagorean Trigonometric Identities.",
      time: "2m ago"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Live Poll State
  const [activePoll, setActivePoll] = useState<{
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    userVote?: number;
  }>({
    question: "Do you understand the proof of sin²θ + cos²θ = 1?",
    options: [
      { text: "Yes, fully clear!", votes: 3 },
      { text: "Need one more example", votes: 1 },
      { text: "Please repeat proof", votes: 0 }
    ],
    totalVotes: 4
  });

  // Local Student Video
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!classId) return;
    const found = getClassroomById(classId);
    setCls(found);

    // Record Student Attendance Automatically
    const studentName = user?.displayName || "Scholar Student";
    recordMeetingAttendance(classId, {
      uid: user?.uid || "sandbox-student-101",
      name: studentName
    });

    // Start webcam stream if permitted
    navigator.mediaDevices?.getUserMedia?.({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.log("Webcam not available, using student avatar fallback:", err);
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [classId, user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const studentName = user?.displayName || "Scholar Student";
    setChatMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: studentName,
        role: "student",
        text: inputMessage.trim(),
        time: "Just now"
      }
    ]);
    setInputMessage("");
  };

  const handleToggleHand = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    const studentName = user?.displayName || "Scholar Student";
    setChatMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: "System",
        role: "student",
        text: nextState ? `✋ ${studentName} raised their hand.` : `✋ ${studentName} lowered their hand.`,
        time: "Just now"
      }
    ]);
  };

  const handleSendReaction = (emoji: string) => {
    const newId = `rx-${Date.now()}`;
    setReactions(prev => [...prev, { id: newId, emoji }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newId));
    }, 2500);
  };

  const handleVotePoll = (optionIndex: number) => {
    if (activePoll.userVote !== undefined) return;
    setActivePoll(prev => {
      const newOpts = [...prev.options];
      newOpts[optionIndex].votes += 1;
      return {
        ...prev,
        options: newOpts,
        totalVotes: prev.totalVotes + 1,
        userVote: optionIndex
      };
    });
  };

  const handleLeaveClass = () => {
    router.push(`/classroom/${classId}`);
  };

  if (!cls) return null;

  return (
    <div className="h-screen max-h-screen bg-[#060814] text-white flex flex-col overflow-hidden -m-4 sm:-m-6 md:-m-10">
      {/* ── TOP STUDENT LIVE HEADER ── */}
      <header className="px-6 py-3 bg-[#0a0e22] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/classroom/${cls.id}`}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                Live Lecture
              </span>
              <h1 className="text-sm md:text-base font-black tracking-tight">{cls.name}</h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Instructor: {cls.teacherName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reaction Bar */}
          <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl">
            {["👏", "👍", "💡", "❤️", "❓"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="w-7 h-7 rounded-xl hover:bg-white/10 flex items-center justify-center text-sm transition-transform hover:scale-125 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>

          <button
            onClick={handleLeaveClass}
            className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            Leave Class
          </button>
        </div>
      </header>

      {/* ── MAIN STAGE ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Video / Whiteboard Feed */}
        <div className="flex-1 flex flex-col min-w-0 p-4 relative bg-[#040612] overflow-hidden">
          {/* Floating Emoji Reactions Overlay */}
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {reactions.map((rx) => (
              <motion.div
                key={rx.id}
                initial={{ opacity: 1, y: 300, scale: 0.5, x: 200 + Math.random() * 200 }}
                animate={{ opacity: 0, y: 50, scale: 1.5 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute text-4xl"
              >
                {rx.emoji}
              </motion.div>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr overflow-y-auto custom-scrollbar p-2">
            {/* Teacher's Spotlight Video Feed (Span 2 Cols on Desktop) */}
            <div className="md:col-span-2 relative rounded-3xl bg-slate-900 border-2 border-indigo-500/50 overflow-hidden flex items-center justify-center shadow-2xl min-h-[260px]">
              {isWhiteboardView ? (
                /* Synced Whiteboard Stream View */
                <div className="w-full h-full bg-[#0c1020] p-6 flex flex-col justify-between text-indigo-200">
                  <div className="flex justify-between items-center text-xs font-bold text-indigo-400">
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-4 h-4" /> Live Teacher Whiteboard Broadcast
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded-full">Synced</span>
                  </div>

                  <div className="text-center font-mono space-y-3 py-6">
                    <p className="text-lg md:text-xl font-bold text-amber-300">
                      sin²(θ) + cos²(θ) = 1
                    </p>
                    <p className="text-xs md:text-sm text-slate-300">
                      Proof: Let Right Triangle ABC with ∠B = 90°
                    </p>
                    <p className="text-xs text-indigo-300">
                      By Pythagoras: AB² + BC² = AC²
                    </p>
                    <p className="text-xs text-emerald-400 font-bold">
                      Dividing both sides by AC² ⇒ (AB/AC)² + (BC/AC)² = 1
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-500 text-center">Teacher is writing live notes...</span>
                </div>
              ) : (
                /* Teacher Spotlight Video Feed */
                <div className="text-center space-y-3">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl mx-auto border-4 border-white/20 animate-pulse">
                    {cls.teacherName.charAt(0)}
                  </div>
                  <h3 className="text-sm font-black text-white">{cls.teacherName}</h3>
                  <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                    Host • Active Speaker
                  </span>
                </div>
              )}

              {/* Spotlight Pill */}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <span className="text-xs font-black text-white">{cls.teacherName} (Teacher)</span>
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* My Student Video Feed & Peers */}
            <div className="space-y-4 flex flex-col justify-between">
              {/* My Camera Feed */}
              <div className="relative rounded-3xl bg-slate-900/90 border border-white/15 overflow-hidden flex items-center justify-center shadow-lg min-h-[140px] flex-1">
                {isVideoOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center text-base font-black mx-auto border border-white/10">
                      {user?.displayName ? user.displayName.charAt(0) : "S"}
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">Camera Off</span>
                  </div>
                )}

                {/* Hand Raised Pill */}
                {isHandRaised && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-black px-2 py-0.5 rounded-full font-black text-[9px] uppercase flex items-center gap-1 shadow-lg animate-bounce">
                    <Hand className="w-2.5 h-2.5" /> Hand Raised
                  </div>
                )}

                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-white">You</span>
                  {isAudioOn ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-red-400" />}
                </div>
              </div>

              {/* Classmate Feed */}
              <div className="relative rounded-3xl bg-slate-900/80 border border-white/10 overflow-hidden flex items-center justify-center shadow-md min-h-[140px] flex-1">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-base font-black mx-auto border border-white/10">
                    A
                  </div>
                  <span className="text-[11px] font-bold text-slate-300">Aarav Patel</span>
                </div>

                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5 text-[11px]">
                  <span className="font-medium text-slate-300">Aarav Patel</span>
                  <MicOff className="w-3 h-3 text-red-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Chat, Participants, Live Polls */}
        <aside className="w-80 md:w-96 bg-[#0a0e22] border-l border-white/10 flex flex-col shrink-0">
          <div className="flex border-b border-white/10 p-2 gap-1 bg-[#0f142c]">
            <button
              onClick={() => setActiveTab("chat")}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all",
                activeTab === "chat" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab("people")}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all",
                activeTab === "people" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <Users className="w-3.5 h-3.5" />
              Classmates (4)
            </button>
            <button
              onClick={() => setActiveTab("polls")}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all",
                activeTab === "polls" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Live Poll
            </button>
          </div>

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-black text-[11px]",
                        msg.role === "teacher" ? "text-indigo-400" : "text-slate-200"
                      )}>
                        {msg.sender}
                      </span>
                      <span className="text-[9px] text-slate-500">{msg.time}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed bg-white/5 p-2 rounded-xl border border-white/5">
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask a question in class chat..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Participants Tab */}
          {activeTab === "people" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Teacher</span>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <span className="font-bold text-white">{cls.teacherName} (Host)</span>
                <span className="text-[9px] font-black uppercase text-indigo-400">Teacher</span>
              </div>

              <span className="text-[10px] font-black uppercase text-slate-400 block pt-2">Students</span>
              {["You (Scholar)", "Aarav Patel", "Diya Sharma", "Rohan Verma"].map((name, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="font-medium text-slate-200">{name}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Present</span>
                </div>
              ))}
            </div>
          )}

          {/* Polls Tab */}
          {activeTab === "polls" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                <span className="text-[10px] font-black uppercase text-indigo-400">Teacher Question</span>
                <h4 className="text-xs font-black text-white">{activePoll.question}</h4>

                <div className="space-y-2">
                  {activePoll.options.map((opt, idx) => {
                    const isSelected = activePoll.userVote === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleVotePoll(idx)}
                        disabled={activePoll.userVote !== undefined}
                        className={cn(
                          "w-full text-left p-2.5 rounded-xl border text-xs font-bold transition-all",
                          isSelected
                            ? "bg-indigo-600/30 border-indigo-500 text-white"
                            : "bg-white/5 border-white/10 hover:border-indigo-500/40 text-slate-300"
                        )}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span>{opt.text}</span>
                          {activePoll.userVote !== undefined && (
                            <span className="text-[10px] text-indigo-400">{opt.votes} votes</span>
                          )}
                        </div>
                        {activePoll.userVote !== undefined && (
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${(opt.votes / activePoll.totalVotes) * 100}%` }}
                              className="h-full bg-indigo-500 rounded-full"
                            />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {activePoll.userVote !== undefined ? (
                  <p className="text-[10px] text-emerald-400 font-bold text-center">
                    ✓ Your vote has been recorded!
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 text-center">
                    Click an option above to submit your response.
                  </p>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ── BOTTOM STUDENT MEDIA CONTROLS ── */}
      <footer className="p-3 bg-[#0a0e22] border-t border-white/10 flex items-center justify-center gap-3 shrink-0">
        <button
          onClick={() => setIsAudioOn(prev => !prev)}
          className={cn(
            "p-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md",
            isAudioOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500 text-white hover:bg-red-600"
          )}
          title={isAudioOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setIsVideoOn(prev => !prev)}
          className={cn(
            "p-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md",
            isVideoOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500 text-white hover:bg-red-600"
          )}
          title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={handleToggleHand}
          className={cn(
            "px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-md",
            isHandRaised ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-white/10 hover:bg-white/20 text-slate-200"
          )}
        >
          <Hand className="w-5 h-5" />
          <span>{isHandRaised ? "Lower Hand" : "Raise Hand"}</span>
        </button>

        <button
          onClick={() => setIsWhiteboardView(prev => !prev)}
          className={cn(
            "px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-md",
            isWhiteboardView ? "bg-indigo-600 text-white" : "bg-white/10 hover:bg-white/20 text-slate-200"
          )}
        >
          <Palette className="w-5 h-5 text-indigo-400" />
          <span>{isWhiteboardView ? "View Teacher Video" : "View Whiteboard"}</span>
        </button>
      </footer>
    </div>
  );
}
