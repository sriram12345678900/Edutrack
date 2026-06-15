"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, MessageSquare, ArrowRight, Bot, User, Check, Loader2, 
  Mic, Volume2, VolumeX, FileText, Copy, Plus, Trash2, Paperclip, X,
  Compass, Zap, GraduationCap, ChevronLeft, Menu
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Chat Session interface
interface ChatSession {
  id: string;
  title: string;
  messages: { role: "user" | "ai"; content: string; imagePreview?: string }[];
  conclusion?: string | null;
  timestamp: number;
}

export default function TutorPage() {
  // Conversational Chat States
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatInputValue, setChatInputValue] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Mobile/desktop sidebar toggle

  // Common UI States
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingMsg, setActiveSpeakingMsg] = useState<string | null>(null); // formatted as "chat-index"
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Refs
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat sessions on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("edutrack_tutor_sessions");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as ChatSession[];
          setSessions(parsed);
          if (parsed.length > 0) {
            setCurrentSessionId(parsed[0].id);
          }
        } catch (e) {
          console.error("Error loading sessions:", e);
        }
      }
    }
  }, []);

  // Save sessions to localStorage when updated
  const saveSessions = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem("edutrack_tutor_sessions", JSON.stringify(updatedSessions));
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSessionId, sessions, loading]);

  // Convert uploaded image file to Base64 data URL
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // ── SPEECH TO TEXT ──
  const startSpeechToText = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser. Try Chrome or Edge!");
        return;
      }
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-IN"; // Hinglish support

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatInputValue(prev => (prev ? prev + " " + transcript : transcript));
      };

      rec.start();
    }
  };

  // ── TEXT TO SPEECH ──
  const speakText = (text: string, identifier: string) => {
    if (typeof window !== "undefined") {
      if (activeSpeakingMsg === identifier) {
        window.speechSynthesis.cancel();
        setActiveSpeakingMsg(null);
        return;
      }
      
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("en-US"));
      if (voice) utterance.voice = voice;
      
      utterance.onend = () => setActiveSpeakingMsg(null);
      utterance.onerror = () => setActiveSpeakingMsg(null);

      setActiveSpeakingMsg(identifier);
      window.speechSynthesis.speak(utterance);
    }
  };

  // ── CHAT SESSION ACTIONS ──
  const startNewSession = () => {
    setCurrentSessionId(null);
    setChatInputValue("");
    setAttachedImage(null);
    setIsHistoryOpen(false);
  };

  const selectSession = (id: string) => {
    setCurrentSessionId(id);
    setIsHistoryOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm("Are you sure you want to delete this chat session?")) {
      const updated = sessions.filter(s => s.id !== id);
      saveSessions(updated);
      if (currentSessionId === id) {
        setCurrentSessionId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // ── CONVERSATIONAL CHAT SUBMISSION ──
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!chatInputValue.trim() && !attachedImage) || loading) return;

    setLoading(true);
    const textQuery = chatInputValue.trim();
    setChatInputValue("");

    // Create user message object
    const userMessage = {
      role: "user" as const,
      content: textQuery || "Uploaded an image for analysis.",
      imagePreview: attachedImage || undefined
    };

    let targetSessionId = currentSessionId;
    let targetSession = currentSession;
    let updatedSessions = [...sessions];

    // Initialize new session if none is active
    if (!targetSessionId) {
      targetSessionId = Date.now().toString();
      targetSession = {
        id: targetSessionId,
        title: textQuery.substring(0, 24) || "Study Question",
        messages: [userMessage],
        timestamp: Date.now()
      };
      updatedSessions = [targetSession, ...updatedSessions];
      setCurrentSessionId(targetSessionId);
    } else if (targetSession) {
      targetSession.messages = [...targetSession.messages, userMessage];
      updatedSessions = [
        targetSession,
        ...updatedSessions.filter(s => s.id !== targetSessionId)
      ];
    }

    saveSessions(updatedSessions);
    setAttachedImage(null);

    try {
      const apiMessages = targetSession!.messages.map(m => {
        const msgObj: any = {
          role: m.role === "user" ? "user" : "assistant",
          content: m.content
        };
        if (m.imagePreview) {
          msgObj.attachments = [
            {
              type: "image/jpeg",
              data: m.imagePreview,
              name: "homework.jpg"
            }
          ];
        }
        return msgObj;
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          language: "Hinglish",
          bookInfo: ""
        })
      });

      const data = await res.json();
      const replyContent = data.reply || "Sorry, I couldn't think of a response. Please try again.";

      if (targetSession) {
        targetSession.messages = [...targetSession.messages, { role: "ai", content: replyContent }];
        const finalSessions = updatedSessions.map(s => s.id === targetSessionId ? targetSession! : s);
        saveSessions(finalSessions);
      }
    } catch (err) {
      console.error(err);
      if (targetSession) {
        targetSession.messages = [...targetSession.messages, { role: "ai", content: "Could not connect to the AI tutor. Please check your network connection." }];
        const finalSessions = updatedSessions.map(s => s.id === targetSessionId ? targetSession! : s);
        saveSessions(finalSessions);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setAttachedImage(base64);
      } catch (e) {
        console.error("Error loading chat image:", e);
      }
    }
  };

  const generateSessionConclusion = async () => {
    if (generatingSummary) return;

    const activeMessages = currentSession?.messages;
    if (!activeMessages || activeMessages.length === 0) return;

    setGeneratingSummary(true);

    const summaryPrompt = {
      role: "user" as const,
      content: "Thank you for the explanations. Now, please generate a structured, encouraging study session conclusion and summary. Include: 1. Main Concepts Explored, 2. Important Formulas/Definitions, 3. Practical takeaways. Keep it clear, concise, and structured. Use bullet points."
    };

    try {
      const apiMessages = [...activeMessages, summaryPrompt].map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          language: "Hinglish",
          bookInfo: ""
        })
      });

      const data = await res.json();
      const summaryText = data.reply || "Could not compile summary.";

      if (currentSession) {
        const updated = sessions.map(s => s.id === currentSessionId ? { ...s, conclusion: summaryText } : s);
        saveSessions(updated);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to compile study summary.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleChipClick = (query: string) => {
    setChatInputValue(query);
  };

  const quickChips = [
    { label: "Refraction slab (Hindi)", query: "Can you explain refraction of light in a glass slab in easy Hinglish?", icon: Compass, color: "text-emerald-450 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10" },
    { label: "Solve Quadratic formula", query: "Explain how to solve the quadratic equation 2x² - 5x + 3 = 0 step-by-step?", icon: Zap, color: "text-amber-400 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10" },
    { label: "Metal reactivity series", query: "What is a simple mnemonic to remember the metal reactivity series for CBSE Class 10?", icon: GraduationCap, color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10" },
    { label: "Photosynthesis summary", query: "Explain the light and dark reactions of photosynthesis in simple terms.", icon: Sparkles, color: "text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5 hover:bg-fuchsia-500/10" }
  ];

  // ── LATEX / MATH SANITIZATION ──
  const cleanMathLaTeX = (mathStr: string): string => {
    let s = mathStr;
    s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)");
    s = s.replace(/\\sqrt\{([^}]+)\}/g, "√$1");
    s = s.replace(/\\sqrt\s*([a-zA-Z0-9])/g, "√$1");
    s = s.replace(/\^2/g, "²");
    s = s.replace(/\^3/g, "³");
    s = s.replace(/\^([a-zA-Z0-9\+\-]+)/g, "<sup>$1</sup>");
    s = s.replace(/_([a-zA-Z0-9\+\-]+)/g, "<sub>$1</sub>");
    s = s.replace(/\\neq/g, "≠");
    s = s.replace(/\\pm/g, "±");
    s = s.replace(/\\geq/g, "≥");
    s = s.replace(/\\leq/g, "≤");
    s = s.replace(/\\ge/g, "≥");
    s = s.replace(/\\le/g, "≤");
    s = s.replace(/\\approx/g, "≈");
    s = s.replace(/\\cdot/g, "·");
    s = s.replace(/\\times/g, "×");
    s = s.replace(/\\div/g, "÷");
    s = s.replace(/\\infty/g, "∞");
    s = s.replace(/\\to/g, "→");
    s = s.replace(/\\rightarrow/g, "→");
    s = s.replace(/\\alpha/g, "α");
    s = s.replace(/\\beta/g, "β");
    s = s.replace(/\\gamma/g, "γ");
    s = s.replace(/\\theta/g, "θ");
    s = s.replace(/\\pi/g, "π");
    s = s.replace(/\\in/g, "∈");
    s = s.replace(/\\notin/g, "∉");
    return s;
  };

  // ── MARKDOWN FORMATTER ──
  const formatMessageContent = (text: string) => {
    if (!text) return "";
    const lines = text.split("\n");
    
    return lines.map((line, idx) => {
      const isBlockMath = line.trim().startsWith("$$") && line.trim().endsWith("$$");
      if (isBlockMath) {
        const mathText = line.trim().slice(2, -2);
        return (
          <div 
            key={idx} 
            className="flex justify-center my-4 p-4.5 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl font-serif italic text-base text-indigo-300 tracking-widest font-bold select-all"
            dangerouslySetInnerHTML={{ __html: cleanMathLaTeX(mathText) }}
          />
        );
      }

      const formatMathInline = (mathText: string, keyIdx: number) => (
        <span 
          key={`math-${keyIdx}`}
          className="font-serif italic text-indigo-300 dark:text-indigo-400 font-bold text-sm tracking-wide bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/15 inline-block mx-0.5 select-all"
          dangerouslySetInnerHTML={{ __html: cleanMathLaTeX(mathText) }}
        />
      );

      const formatBoldAndPlain = (plainText: string, keyIdx: number) => {
        const parts = plainText.split(/\*\*/g);
        return (
          <React.Fragment key={`plain-${keyIdx}`}>
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold text-white">{part}</strong> : part)}
          </React.Fragment>
        );
      };

      const parseMix = (mixText: string) => {
        const parts = mixText.split("$");
        return parts.map((part, i) => {
          if (i % 2 === 1) return formatMathInline(part, i);
          return formatBoldAndPlain(part, i);
        });
      };

      const headingMatch = line.match(/^(#{1,4})\s*(.*)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const rawText = headingMatch[2];
        const headingContent = parseMix(rawText);

        if (level === 1) {
          return (
            <h1 key={idx} className="text-xl font-black text-white mt-4 mb-2 tracking-tight bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              {headingContent}
            </h1>
          );
        } else if (level === 2) {
          return (
            <h2 key={idx} className="text-base font-extrabold text-white mt-5 mb-2 tracking-tight bg-gradient-to-r from-indigo-400 via-purple-350 to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
              {headingContent}
            </h2>
          );
        } else {
          return <h3 key={idx} className="text-sm font-extrabold text-white mt-3 mb-1.5 tracking-tight">{headingContent}</h3>;
        }
      }

      const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");
      const isNumbered = /^\d+\.\s/.test(line.trim());

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2.5 ml-2.5 my-1.5 select-text">
            <span className="text-indigo-450 mt-1.5 text-xs">•</span>
            <span className="text-slate-300 dark:text-slate-200 text-sm font-medium leading-relaxed">{parseMix(line.trim().substring(2))}</span>
          </div>
        );
      }

      if (isNumbered) {
        const numMatch = line.trim().match(/^(\d+\.)\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-2.5 my-1.5 select-text">
              <span className="text-indigo-455 font-bold mt-0.5 text-sm">{numMatch[1]}</span>
              <span className="text-slate-300 dark:text-slate-200 text-sm font-medium leading-relaxed">{parseMix(numMatch[2])}</span>
            </div>
          );
        }
      }

      if (!line.trim()) return <div key={idx} className="h-2.5" />;

      return (
        <p key={idx} className="text-slate-300 dark:text-slate-200 text-sm font-medium mb-2.5 last:mb-0 leading-relaxed select-text">
          {parseMix(line)}
        </p>
      );
    });
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col bg-[#030409] text-slate-100 font-sans relative overflow-hidden">
      
      {/* Spectacular Glowing Ambient Spotlights */}
      <div className="absolute top-[-10%] left-[5vw] w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[5vw] w-[40vw] h-[40vw] bg-fuchsia-600/5 rounded-full blur-[130px] pointer-events-none mix-blend-screen" />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative z-10">
        
        {/* Toggle History Button (Mobile Only) */}
        <button 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="md:hidden fixed bottom-28 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.4)] border border-indigo-450 z-40"
          title="Toggle Chat Logs"
        >
          {isHistoryOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* ── LEFT COLUMN: SIDEBAR LOGS ── */}
        <aside className={`absolute md:static top-0 bottom-0 left-0 w-80 border-r border-white/5 bg-[#060814]/95 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none p-6 flex flex-col gap-6 z-30 transition-transform duration-300 ${
          isHistoryOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}>
          {/* New Session Button */}
          <button 
            onClick={startNewSession}
            className="w-full py-4.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(168,85,247,0.45)] hover:scale-[1.01] active:scale-[0.98]"
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>New Session</span>
            </div>
          </button>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 block mb-1">Recent Sessions</span>
            
            {sessions.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <p className="text-slate-650 text-xs font-bold px-4">No previous chats. Start a new one above!</p>
              </div>
            ) : (
              sessions.map(s => {
                const isActive = s.id === currentSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => selectSession(s.id)}
                    className={`group w-full p-4.5 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all relative ${
                      isActive
                        ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400 font-extrabold"
                        : "bg-white/[0.01] border-white/5 text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]" />
                    )}
                    <div className="flex items-center gap-3 min-w-0">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                      <span className="text-xs truncate">{s.title}</span>
                    </div>
                    <button
                      onClick={(e) => deleteSession(e, s.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-opacity"
                      title="Delete chat log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ── RIGHT COLUMN: MAIN CHAT SPACE ── */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#04050b]/25 relative">
          
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {!currentSessionId || currentSession?.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-xl mx-auto select-none">
                
                {/* Big Glowing Bot Avatar Welcome */}
                <div className="relative mb-8 flex items-center justify-center">
                  <div className="absolute w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
                  
                  {/* Concentric Halo Rings */}
                  <div className="absolute w-28 h-28 border border-indigo-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute w-24 h-24 border border-purple-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                  
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-650 to-pink-500 rounded-[2rem] flex items-center justify-center text-white relative z-10 shadow-2xl border border-white/10 hover:scale-105 hover:rotate-2 transition-transform duration-300">
                    <Bot className="w-10 h-10" />
                  </div>
                </div>

                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-300 mb-3 tracking-tight">
                  Professor AI Tutor
                </h2>
                <p className="text-slate-400 text-sm font-semibold mb-10 max-w-sm leading-relaxed">
                  Your personalized NCERT & CBSE study buddy. Ask textbook equations, attach figures, or dictate notes.
                </p>

                {/* Quick Chips Suggestion Deck */}
                <div className="w-full space-y-4 text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Interactive Doubts</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {quickChips.map((chip, idx) => {
                      const ChipIcon = chip.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleChipClick(chip.query)}
                          className={`px-5 py-4 border rounded-2xl text-xs font-extrabold transition-all text-left flex items-start gap-3 hover:scale-[1.01] active:scale-[0.99] shadow-sm ${chip.color}`}
                        >
                          <ChipIcon className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                          <span>{chip.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Generate Summary Banner */}
                {currentSession && !currentSession.conclusion && (
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={generateSessionConclusion}
                      disabled={generatingSummary}
                      className="flex items-center gap-2 px-5 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 rounded-2xl text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {generatingSummary ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Summarizing...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          <span>Compile Study Conclusion</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Messages Feed */}
                {currentSession?.messages.map((msg, i) => {
                  const identifier = `chat-${i}`;
                  const isAi = msg.role === "ai";
                  return (
                    <div key={i} className={`flex gap-5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border relative group-hover:scale-105 transition-transform ${
                        isAi 
                          ? "bg-indigo-950/45 text-indigo-400 border-indigo-500/15" 
                          : "bg-purple-950/45 text-purple-400 border-purple-500/15"
                      }`}>
                        {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>

                      {/* Bubble Wrapper */}
                      <div className="relative group max-w-[80%]">
                        
                        {/* Attached Image Preview */}
                        {msg.imagePreview && (
                          <div className="mb-3 rounded-2xl overflow-hidden max-w-[280px] border border-white/10 shadow-2xl relative group">
                            <img src={msg.imagePreview} alt="Attached doubt illustration" className="w-full h-auto object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/60 px-3 py-1.5 rounded-full border border-white/10">Attached figure</span>
                            </div>
                          </div>
                        )}

                        {/* Text bubble */}
                        <div className={`p-5 rounded-3xl shadow-2xl border leading-relaxed select-text ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-indigo-550 to-indigo-650 text-white rounded-tr-none border-indigo-400/20 font-bold"
                            : "bg-[#0b0c16]/80 backdrop-blur-2xl text-slate-300 rounded-tl-none border-white/5 border-l-4 border-l-indigo-500 font-semibold"
                        }`}>
                          {msg.role === "user" ? (
                            <p className="text-sm select-text whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <div className="space-y-1 select-text">
                              {formatMessageContent(msg.content)}
                            </div>
                          )}
                        </div>

                        {/* Speaker Voice Synthesizer Button */}
                        {isAi && (
                          <button
                            onClick={() => speakText(msg.content, identifier)}
                            className="absolute -right-11 top-3.5 p-2 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 shadow-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
                            title="Speak text aloud"
                          >
                            {activeSpeakingMsg === identifier ? (
                              <VolumeX className="w-4 h-4 text-red-400" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                        )}

                      </div>

                    </div>
                  );
                })}

                {/* Render compiled Study Conclusion Card */}
                {currentSession?.conclusion && (
                  <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/25 rounded-[2.2rem] p-6 shadow-2xl relative overflow-hidden border-l-4 border-l-indigo-500">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5.5 h-5.5 text-indigo-400 animate-pulse" />
                        <h4 className="font-extrabold text-sm text-indigo-300 uppercase tracking-widest leading-none">Saved Study Summary</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(currentSession.conclusion || "");
                          alert("Summary copied to clipboard!");
                        }}
                        className="flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 animate-shimmer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Summary</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formatMessageContent(currentSession.conclusion)}
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex gap-4.5">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-950/30 text-indigo-400 border border-indigo-500/15 flex items-center justify-center shrink-0">
                      <Bot className="w-4.5 h-4.5 animate-pulse" />
                    </div>
                    <div className="bg-[#0b0c16]/80 backdrop-blur-md rounded-3xl rounded-tl-none border border-white/5 px-5.5 py-4.5 flex items-center gap-2 shadow-xl">
                      <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Floating Input Dock */}
          <div className="p-6 bg-gradient-to-t from-[#030409] via-[#030409]/95 to-transparent backdrop-blur-md shrink-0 z-20">
            <div className="max-w-4xl mx-auto">
              
              {/* Image Draft Attach Tooltip */}
              {attachedImage && (
                <div className="mb-3.5 p-3.5 bg-slate-900/90 border border-white/5 rounded-2xl flex items-center justify-between w-fit gap-5 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shadow-inner">
                      <img src={attachedImage} alt="Homework draft" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-200">Homework Photo Attached</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Ready to solve inline</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAttachedImage(null)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all active:scale-95"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Form Input Bar wrapper */}
              <form onSubmit={handleChatSend} className="relative flex items-center">
                <input 
                  type="text" 
                  value={chatInputValue}
                  onChange={(e) => setChatInputValue(e.target.value)}
                  placeholder={isListening ? "Listening closely to your voice..." : "Ask your doubt (e.g. solve 2x² - 5x + 3 = 0, or write notes)..."}
                  className={`w-full bg-[#070914]/90 border ${
                    isListening ? "border-red-500/50 focus:ring-red-500" : "border-white/5 focus:border-indigo-500/50 focus:ring-indigo-500/30"
                  } rounded-[2rem] pl-16 pr-28 py-5 text-sm focus:outline-none focus:ring-1 text-slate-200 placeholder:text-slate-500 transition-all font-semibold shadow-inner`}
                />

                {/* Paperclip Button */}
                <button 
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  className="absolute left-4.5 w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-slate-450 hover:text-white transition-all active:scale-95"
                  title="Attach homework photo"
                >
                  <Paperclip className="w-4.5 h-4.5 stroke-[2]" />
                </button>
                <input 
                  type="file"
                  ref={chatFileInputRef}
                  onChange={handleChatFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* Speech Microphone & Send Button */}
                <div className="absolute right-3.5 flex gap-2 items-center">
                  <button 
                    type="button"
                    onClick={startSpeechToText}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                      isListening 
                        ? "bg-gradient-to-tr from-red-650 to-red-550 border-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white active:scale-95"
                    }`}
                    title="Voice speech-to-text input"
                  >
                    <Mic className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    type="submit"
                    disabled={(!chatInputValue.trim() && !attachedImage) || loading}
                    className="w-10 h-10 bg-gradient-to-r from-indigo-550 to-purple-650 text-white rounded-full flex items-center justify-center hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 transition-all shadow-[0_4px_15px_rgba(99,102,241,0.2)] active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
