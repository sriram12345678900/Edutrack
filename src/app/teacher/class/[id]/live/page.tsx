"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Video, VideoOff, Mic, MicOff, ScreenShare, PhoneOff, 
  Users, MessageSquare, Hand, Palette, Sparkles, CheckCircle2, 
  Send, MoreVertical, ShieldAlert, Award, ArrowLeft, VolumeX, BarChart2, Eraser, PenTool
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  Classroom, 
  getClassroomById, 
  recordMeetingAttendance, 
  endLiveClassMeeting 
} from "@/lib/classroom";
import { cn } from "@/lib/utils";

export default function TeacherLiveMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const classId = params?.id as string;

  const [cls, setCls] = useState<Classroom | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isWhiteboardActive, setIsWhiteboardActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "people" | "polls">("chat");
  const [handRaisedStudents, setHandRaisedStudents] = useState<string[]>(["Aarav Patel"]);
  const [allMuted, setAllMuted] = useState(false);

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
      text: "🔴 Live Class started. Whiteboard and audio active.",
      time: "Just now"
    },
    {
      id: "m2",
      sender: "Diya Sharma",
      role: "student",
      text: "Good morning Sir! Ready for Trigonometry.",
      time: "1m ago"
    },
    {
      id: "m3",
      sender: "Aarav Patel",
      role: "student",
      text: "Sir, can you please explain Theorem 8.1 once more?",
      time: "Just now"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Live Poll State
  const [activePoll, setActivePoll] = useState<{
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
  } | null>({
    question: "Do you understand the proof of sin²θ + cos²θ = 1?",
    options: [
      { text: "Yes, fully clear!", votes: 3 },
      { text: "Need one more example", votes: 1 },
      { text: "Please repeat proof", votes: 0 }
    ],
    totalVotes: 4
  });
  const [pollQuestion, setPollQuestion] = useState("");
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);

  // Canvas Whiteboard Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#6366f1");
  const [brushSize, setBrushSize] = useState(3);

  // Local Video Stream
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!classId) return;
    const found = getClassroomById(classId);
    setCls(found);

    // Record Teacher Attendance
    const teacherName = user?.displayName || found?.teacherName || "Teacher";
    recordMeetingAttendance(classId, {
      uid: user?.uid || "teacher-1",
      name: `${teacherName} (Host)`
    });

    // Start local camera stream if permitted
    navigator.mediaDevices?.getUserMedia?.({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.log("Webcam not available or permitted, using studio fallback avatar:", err);
      });

    return () => {
      // Cleanup media tracks on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [classId, user]);

  // Whiteboard Canvas Handlers
  useEffect(() => {
    if (isWhiteboardActive && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 500;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0c1020";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isWhiteboardActive]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0c1020";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const teacherName = user?.displayName || cls?.teacherName || "Teacher";
    setChatMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: `${teacherName} (Host)`,
        role: "teacher",
        text: inputMessage.trim(),
        time: "Just now"
      }
    ]);
    setInputMessage("");
  };

  const handleEndClass = () => {
    if (confirm("Are you sure you want to end this live class for all participants?")) {
      endLiveClassMeeting(classId);
      router.push(`/teacher/class/${classId}`);
    }
  };

  const handleMuteAll = () => {
    setAllMuted(prev => !prev);
    setChatMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: "Host",
        role: "teacher",
        text: allMuted ? "📢 Host has unmuted all student microphones." : "🔇 Host has muted all student microphones.",
        time: "Just now"
      }
    ]);
  };

  const handleDismissHand = (name: string) => {
    setHandRaisedStudents(prev => prev.filter(s => s !== name));
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion.trim()) return;

    setActivePoll({
      question: pollQuestion.trim(),
      options: [
        { text: "Option A: Yes / Understood", votes: 0 },
        { text: "Option B: Needs Clarification", votes: 0 },
        { text: "Option C: No / Repeat", votes: 0 }
      ],
      totalVotes: 0
    });
    setPollQuestion("");
    setIsCreatingPoll(false);
  };

  if (!cls) return null;

  const connectedStudents = [
    { name: "Aarav Patel", video: true, audio: false, raisedHand: handRaisedStudents.includes("Aarav Patel") },
    { name: "Diya Sharma", video: false, audio: true, raisedHand: false },
    { name: "Rohan Verma", video: true, audio: true, raisedHand: false }
  ];

  return (
    <div className="h-screen max-h-screen bg-[#060814] text-white flex flex-col overflow-hidden -m-4 sm:-m-6 md:-m-10">
      {/* ── TOP LIVE CLASSROOM HEADER ── */}
      <header className="px-6 py-3 bg-[#0a0e22] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/teacher/class/${cls.id}`}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                Live Broadcast
              </span>
              <h1 className="text-sm md:text-base font-black tracking-tight">{cls.name}</h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Host: {cls.teacherName} • Room: {cls.room}</p>
          </div>
        </div>

        {/* Hand Raised Alerts Banner */}
        {handRaisedStudents.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-2xl text-amber-300 text-xs font-bold animate-pulse">
            <Hand className="w-4 h-4 text-amber-400" />
            <span>{handRaisedStudents.join(", ")} raised hand!</span>
            <button
              onClick={() => handleDismissHand(handRaisedStudents[0])}
              className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-lg text-white font-black"
            >
              Spotlight
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleMuteAll}
            className={cn(
              "px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all",
              allMuted ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/10 hover:bg-white/20 text-slate-200"
            )}
          >
            <VolumeX className="w-3.5 h-3.5" />
            {allMuted ? "Unmute All" : "Mute All"}
          </button>

          <button
            onClick={handleEndClass}
            className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            End Class
          </button>
        </div>
      </header>

      {/* ── MAIN VIDEO & STUDIO STAGE ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Video Stage / Whiteboard Canvas */}
        <div className="flex-1 flex flex-col min-w-0 p-4 relative bg-[#040612] overflow-hidden">
          {isWhiteboardActive ? (
            /* Interactive Whiteboard Canvas */
            <div className="flex-1 flex flex-col bg-[#0c1020] rounded-3xl border border-indigo-500/30 overflow-hidden relative shadow-2xl">
              {/* Whiteboard Controls Bar */}
              <div className="p-3 bg-[#0f142c] border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-indigo-400" />
                    Live Whiteboard
                  </span>

                  {/* Colors */}
                  <div className="flex items-center gap-1.5">
                    {["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#ffffff"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setBrushColor(color)}
                        style={{ backgroundColor: color }}
                        className={cn(
                          "w-5 h-5 rounded-full border-2 transition-transform",
                          brushColor === color ? "border-white scale-110" : "border-transparent"
                        )}
                      />
                    ))}
                  </div>

                  {/* Size */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>Size:</span>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-16 accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearCanvas}
                    className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold flex items-center gap-1"
                  >
                    <Eraser className="w-3.5 h-3.5" /> Clear
                  </button>
                  <button
                    onClick={() => setIsWhiteboardActive(false)}
                    className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                  >
                    Exit Whiteboard
                  </button>
                </div>
              </div>

              {/* Canvas View */}
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="flex-1 w-full h-full cursor-crosshair"
              />
            </div>
          ) : (
            /* Multi-grid Video Room */
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr overflow-y-auto custom-scrollbar p-2">
              {/* Teacher Main Feed */}
              <div className="relative rounded-3xl bg-slate-900/90 border border-indigo-500/40 overflow-hidden flex items-center justify-center shadow-xl group min-h-[220px]">
                {isVideoOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-black shadow-2xl mx-auto border-2 border-white/20">
                      {cls.teacherName.charAt(0)}
                    </div>
                    <span className="text-xs font-black text-slate-300 block">{cls.teacherName}</span>
                    <span className="text-[10px] text-indigo-400 font-bold">Camera Off</span>
                  </div>
                )}

                {/* Teacher Badge */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                  <span className="text-xs font-black text-white">{cls.teacherName} (You - Host)</span>
                  {isAudioOn ? (
                    <Mic className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <MicOff className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>

              {/* Student Video Feeds */}
              {connectedStudents.map((std, idx) => (
                <div
                  key={idx}
                  className="relative rounded-3xl bg-slate-900/80 border border-white/10 overflow-hidden flex items-center justify-center shadow-lg min-h-[220px]"
                >
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center text-lg font-black mx-auto border border-white/10">
                      {std.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-200 block">{std.name}</span>
                  </div>

                  {/* Hand Raised Pill */}
                  {std.raisedHand && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-black px-2.5 py-1 rounded-full font-black text-[10px] uppercase flex items-center gap-1 shadow-lg animate-bounce">
                      <Hand className="w-3 h-3" /> Hand Raised
                    </div>
                  )}

                  {/* Student Name Pill */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{std.name}</span>
                    {std.audio && !allMuted ? (
                      <Mic className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <MicOff className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Chat, Participants, Live Polls */}
        <aside className="w-80 md:w-96 bg-[#0a0e22] border-l border-white/10 flex flex-col shrink-0">
          {/* Tabs Navigation */}
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
              Roster ({connectedStudents.length + 1})
            </button>
            <button
              onClick={() => setActiveTab("polls")}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all",
                activeTab === "polls" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Polls
            </button>
          </div>

          {/* Tab 1: Chat Feed */}
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
                  placeholder="Ask or reply in class chat..."
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

          {/* Tab 2: Participants Roster */}
          {activeTab === "people" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Host</span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {cls.teacherName.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-white">{cls.teacherName} (Host)</span>
                </div>
                <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                  Teacher
                </span>
              </div>

              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block pt-2">
                Students in Room ({connectedStudents.length})
              </span>
              <div className="space-y-2">
                {connectedStudents.map((std, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                        {std.name.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-slate-200">{std.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {std.raisedHand && (
                        <button
                          onClick={() => handleDismissHand(std.name)}
                          className="p-1 rounded bg-amber-500 text-black text-[10px] font-bold"
                          title="Lower hand"
                        >
                          Lower Hand
                        </button>
                      )}
                      <span className="text-[10px] font-bold text-emerald-400">Connected</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Live Polls */}
          {activeTab === "polls" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white">Live Comprehension Check</span>
                <button
                  onClick={() => setIsCreatingPoll(!isCreatingPoll)}
                  className="text-xs font-bold text-indigo-400 hover:underline"
                >
                  {isCreatingPoll ? "Cancel" : "+ New Poll"}
                </button>
              </div>

              {isCreatingPoll ? (
                <form onSubmit={handleCreatePoll} className="space-y-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <label className="text-[10px] font-bold text-slate-300 block">Question for Students</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Which formula is used for convex mirrors?"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs"
                  >
                    Launch Live Poll
                  </button>
                </form>
              ) : activePoll ? (
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="text-xs font-black text-white">{activePoll.question}</h4>
                  <div className="space-y-2">
                    {activePoll.options.map((opt, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-300">{opt.text}</span>
                          <span className="text-indigo-400">{opt.votes} votes</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${activePoll.totalVotes ? (opt.votes / activePoll.totalVotes) * 100 : 0}%` }}
                            className="h-full bg-indigo-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 block text-right font-medium">
                    Total: {activePoll.totalVotes} student responses
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </aside>
      </div>

      {/* ── BOTTOM HOST MEDIA CONTROLS ── */}
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
          onClick={() => setIsWhiteboardActive(prev => !prev)}
          className={cn(
            "px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-md",
            isWhiteboardActive ? "bg-indigo-600 text-white" : "bg-white/10 hover:bg-white/20 text-slate-200"
          )}
        >
          <Palette className="w-5 h-5 text-indigo-400" />
          <span>{isWhiteboardActive ? "Hide Whiteboard" : "Live Whiteboard"}</span>
        </button>

        <button
          onClick={() => setIsScreenSharing(prev => !prev)}
          className={cn(
            "p-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md",
            isScreenSharing ? "bg-emerald-600 text-white" : "bg-white/10 hover:bg-white/20 text-slate-200"
          )}
          title="Share Screen"
        >
          <ScreenShare className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
