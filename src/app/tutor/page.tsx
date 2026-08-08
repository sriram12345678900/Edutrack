"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, MessageSquare, ArrowRight, Bot, User, Check, Loader2, 
  Mic, Volume2, VolumeX, FileText, Copy, Plus, Trash2, Paperclip, X,
  Compass, Zap, GraduationCap, ChevronLeft, Menu, Settings2, Lightbulb, ShieldCheck, Globe, Activity
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

type PersonaMode = "ncert_expert" | "socratic" | "simplifier";

export default function TutorPage() {
  // Conversational Chat States
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatInputValue, setChatInputValue] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Persona & Language States
  const [personaMode, setPersonaMode] = useState<PersonaMode>("ncert_expert");
  const [userLanguage, setUserLanguage] = useState<string>("Hinglish");

  // Common UI States
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingMsg, setActiveSpeakingMsg] = useState<string | null>(null);
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
      const storedLang = localStorage.getItem("edutrack_language");
      if (storedLang) {
        setUserLanguage(storedLang);
      }
    }
  }, []);

  const saveSessions = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem("edutrack_tutor_sessions", JSON.stringify(updatedSessions));
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSessionId, sessions, loading]);

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
      rec.lang = userLanguage === "Hindi" ? "hi-IN" : "en-IN";

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

    const userMessage = {
      role: "user" as const,
      content: textQuery || "Uploaded an image for analysis.",
      imagePreview: attachedImage || undefined
    };

    let targetSessionId = currentSessionId;
    let targetSession = currentSession;
    let updatedSessions = [...sessions];

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

    // Persona System Instruction Prefix
    let personaPrompt = "";
    if (personaMode === "ncert_expert") {
      personaPrompt = "[SYSTEM: Act as an NCERT CBSE Board Examiner. Provide strict, marking-scheme-friendly solutions with definitions, formulas, and board exam tips.]";
    } else if (personaMode === "socratic") {
      personaPrompt = "[SYSTEM: Act as a Socratic Mentor. Don't give answers directly immediately; guide the student with helpful hints, step 1, step 2.]";
    } else if (personaMode === "simplifier") {
      personaPrompt = "[SYSTEM: Act as an ELI5 Simplifier. Use fun real-world analogies, simple terms, and zero jargon.]";
    }

    try {
      const apiMessages = targetSession!.messages.map((m, idx) => {
        const msgObj: any = {
          role: m.role === "user" ? "user" : "assistant",
          content: idx === targetSession!.messages.length - 1 && m.role === "user" ? `${personaPrompt} ${m.content}` : m.content
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
          language: userLanguage,
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
          language: userLanguage,
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
    { label: "Refraction in Glass Slab", query: "Explain refraction of light through a rectangular glass slab with ray diagram steps in Hinglish?", icon: Compass, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20" },
    { label: "Solve Quadratic Equation", query: "Explain how to solve 2x² - 5x + 3 = 0 step-by-step using the quadratic formula?", icon: Zap, color: "text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20" },
    { label: "Metal Reactivity Mnemonic", query: "What is a simple memory trick to remember the metal reactivity series for CBSE Class 10?", icon: GraduationCap, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20" },
    { label: "Photosynthesis Reactions", query: "Explain light and dark reactions of photosynthesis in simple terms.", icon: Sparkles, color: "text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10 hover:bg-fuchsia-500/20" }
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
            className="flex justify-center my-4 p-4.5 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl font-serif italic text-base text-cyan-300 tracking-widest font-bold select-all shadow-inner"
            dangerouslySetInnerHTML={{ __html: cleanMathLaTeX(mathText) }}
          />
        );
      }

      const formatMathInline = (mathText: string, keyIdx: number) => (
        <span 
          key={`math-${keyIdx}`}
          className="font-serif italic text-cyan-300 font-bold text-sm tracking-wide bg-cyan-500/20 px-2 py-0.5 rounded-lg border border-cyan-500/30 inline-block mx-0.5 select-all"
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
            <h1 key={idx} className="text-xl font-black text-white mt-4 mb-2 tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              {headingContent}
            </h1>
          );
        } else if (level === 2) {
          return (
            <h2 key={idx} className="text-base font-extrabold text-white mt-5 mb-2 tracking-tight bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent flex items-center gap-2">
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
            <span className="text-cyan-400 mt-1 text-xs">•</span>
            <span className="text-slate-300 text-sm font-medium leading-relaxed">{parseMix(line.trim().substring(2))}</span>
          </div>
        );
      }

      if (isNumbered) {
        const numMatch = line.trim().match(/^(\d+\.)\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-2.5 my-1.5 select-text">
              <span className="text-cyan-400 font-bold mt-0.5 text-sm">{numMatch[1]}</span>
              <span className="text-slate-300 text-sm font-medium leading-relaxed">{parseMix(numMatch[2])}</span>
            </div>
          );
        }
      }

      if (!line.trim()) return <div key={idx} className="h-2.5" />;

      return (
        <p key={idx} className="text-slate-300 text-sm font-medium mb-2.5 last:mb-0 leading-relaxed select-text">
          {parseMix(line)}
        </p>
      );
    });
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col bg-[#03040b] text-slate-100 font-sans relative overflow-hidden">
      
      {/* Ambient Background Orbs */}
      <div className="absolute top-[-10%] left-[10vw] w-[45vw] h-[45vw] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10vw] w-[45vw] h-[45vw] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Controls Header Bar */}
      <header className="sticky top-0 z-20 bg-[#050714]/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            {/* Animated Cyber Core Icon */}
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <img src="/ai_tutor_avatar.jpg" alt="AI Core Avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay" />
            </div>
            <div>
              <h1 className="text-base font-black text-white leading-tight flex items-center gap-2">
                Professor AI Tutor <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> Live Core
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-semibold">NCERT CBSE Class 10 Interactive Learning Specialist</p>
            </div>
          </div>
        </div>

        {/* Persona Mode & Language Selector */}
        <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto">
          
          {/* Persona Pills */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            {[
              { id: "ncert_expert", label: "NCERT Board Expert", icon: ShieldCheck },
              { id: "socratic", label: "Socratic Mentor", icon: Lightbulb },
              { id: "simplifier", label: "ELI5 Simplifier", icon: Zap }
            ].map((p) => {
              const Icon = p.icon;
              const isActive = personaMode === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPersonaMode(p.id as PersonaMode)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive 
                      ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 border border-white/20 scale-[1.02]" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={userLanguage}
              onChange={(e) => {
                setUserLanguage(e.target.value);
                localStorage.setItem("edutrack_language", e.target.value);
              }}
              className="bg-transparent text-white font-extrabold focus:outline-none cursor-pointer text-xs pr-1"
            >
              <option value="Hinglish" className="bg-[#080b18] text-white">Hinglish</option>
              <option value="English" className="bg-[#080b18] text-white">English</option>
              <option value="Hindi" className="bg-[#080b18] text-white">Hindi</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative z-10">
        
        {/* Toggle History Button (Mobile Only) */}
        <button 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="md:hidden fixed bottom-28 right-6 w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shadow-xl border border-cyan-400 z-40"
        >
          {isHistoryOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* ── LEFT COLUMN: SIDEBAR LOGS ── */}
        <aside className={`absolute md:static top-0 bottom-0 left-0 w-80 border-r border-white/10 bg-[#050714]/95 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none p-5 flex flex-col gap-5 z-30 transition-transform duration-300 ${
          isHistoryOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}>
          <button 
            onClick={startNewSession}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] border border-white/20"
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New Study Chat</span>
            </div>
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 block mb-1">Recent Sessions</span>
            
            {sessions.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <p className="text-slate-400 text-xs font-semibold px-4">No previous chats. Start a new session above!</p>
              </div>
            ) : (
              sessions.map(s => {
                const isActive = s.id === currentSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => selectSession(s.id)}
                    className={`group w-full p-3.5 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all relative ${
                      isActive
                        ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-extrabold shadow-lg"
                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-[3.5px] bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                    )}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                      <span className="text-xs truncate font-semibold">{s.title}</span>
                    </div>
                    <button
                      onClick={(e) => deleteSession(e, s.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 rounded-lg hover:bg-white/10 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ── RIGHT COLUMN: MAIN CHAT SPACE LOCKED IN A FRAMED BOX ── */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#04050b]/40 relative p-3 sm:p-6 overflow-hidden">
          
          {/* Locked Chat Box Card Container */}
          <div className="w-full h-full max-w-5xl mx-auto bg-[#060817]/90 backdrop-blur-3xl border border-cyan-500/20 rounded-3xl sm:rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)] relative">
            
            {/* Ambient Corner HUD Accents */}
            <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none z-20" />
            <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none z-20" />
            <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none z-20" />
            <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none z-20" />

            {/* Scrollable Messages Feed Inside Box */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {!currentSessionId || currentSession?.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-xl mx-auto select-none">
                  
                  {/* Futuristic Cyber Avatar HUD Header */}
                  <div className="relative mb-6 flex items-center justify-center">
                    <div className="absolute w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border-2 border-cyan-400/40 p-1 bg-[#070a1a] hover:scale-105 transition-transform duration-300">
                      <img src="/ai_tutor_avatar.jpg" alt="Holographic AI Tutor" className="w-full h-full object-cover rounded-2xl" />
                      {activeSpeakingMsg && (
                        <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center gap-1 backdrop-blur-xs">
                          <Activity className="w-6 h-6 text-cyan-300 animate-bounce" />
                        </div>
                      )}
                    </div>
                  </div>

                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 mb-2 tracking-tight">
                    How can I help your study today?
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm font-semibold mb-8 max-w-sm leading-relaxed">
                    Currently active in <strong className="text-cyan-400 uppercase tracking-wider">{personaMode.replace('_', ' ')}</strong> mode in <strong className="text-cyan-400">{userLanguage}</strong>.
                  </p>

                  {/* Quick Chips Suggestion Deck */}
                  <div className="w-full space-y-3 text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Interactive CBSE Doubts</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {quickChips.map((chip, idx) => {
                        const ChipIcon = chip.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleChipClick(chip.query)}
                            className={`px-4.5 py-3.5 border rounded-2xl text-xs font-extrabold transition-all text-left flex items-start gap-3 hover:scale-[1.01] active:scale-[0.99] shadow-md ${chip.color}`}
                          >
                            <ChipIcon className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{chip.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                  
                  {/* Summary Generator Button Banner */}
                  {currentSession && !currentSession.conclusion && (
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={generateSessionConclusion}
                        disabled={generatingSummary}
                        className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-2xl text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-md"
                      >
                        {generatingSummary ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Compiling Summary...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 text-cyan-400" />
                            <span>Generate Session Summary</span>
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
                      <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border ${
                          isAi 
                            ? "bg-cyan-950/60 text-cyan-400 border-cyan-500/30" 
                            : "bg-purple-950/60 text-purple-400 border-purple-500/30"
                        }`}>
                          {isAi ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                        </div>

                        <div className="relative group max-w-[82%]">
                          
                          {msg.imagePreview && (
                            <div className="mb-3 rounded-2xl overflow-hidden max-w-[260px] border border-white/10 shadow-2xl relative">
                              <img src={msg.imagePreview} alt="Attached homework" className="w-full h-auto object-cover" />
                            </div>
                          )}

                          <div className={`p-4.5 sm:p-5 rounded-3xl shadow-2xl border leading-relaxed select-text ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-cyan-600 to-indigo-600 text-white rounded-tr-none border-cyan-400/20 font-bold text-sm"
                              : "bg-[#080a17]/90 backdrop-blur-2xl text-slate-200 rounded-tl-none border-white/10 border-l-4 border-l-cyan-500 font-medium text-sm"
                          }`}>
                            {msg.role === "user" ? (
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                              <div className="space-y-1">
                                {formatMessageContent(msg.content)}
                              </div>
                            )}
                          </div>

                          {isAi && (
                            <button
                              onClick={() => speakText(msg.content, identifier)}
                              className="absolute -right-10 top-3 p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 shadow-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
                              title="Read text aloud"
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

                  {/* Session Conclusion Card */}
                  {currentSession?.conclusion && (
                    <div className="bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden border-l-4 border-l-cyan-500">
                      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                          <h4 className="font-extrabold text-xs text-cyan-300 uppercase tracking-widest">Study Session Summary</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(currentSession.conclusion || "");
                            alert("Summary copied to clipboard!");
                          }}
                          className="flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
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

                  {/* Loading Typing Indicator */}
                  {loading && (
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-2xl bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        <Bot className="w-4.5 h-4.5 animate-pulse" />
                      </div>
                      <div className="bg-[#080a17]/90 backdrop-blur-md rounded-3xl rounded-tl-none border border-white/10 px-5 py-4 flex items-center gap-2 shadow-xl">
                        <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Fixed Input Dock Inside Box */}
            <div className="p-4 sm:p-5 bg-[#050716]/95 border-t border-white/10 backdrop-blur-2xl shrink-0 z-20">
              <div className="max-w-4xl mx-auto">
                
                {attachedImage && (
                  <div className="mb-3 p-3 bg-slate-900/90 border border-white/10 rounded-2xl flex items-center justify-between w-fit gap-4 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                        <img src={attachedImage} alt="Homework draft" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-200">Homework Photo Attached</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Ready for analysis</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAttachedImage(null)}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all active:scale-95"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleChatSend} className="relative flex items-center">
                  <input 
                    type="text" 
                    value={chatInputValue}
                    onChange={(e) => setChatInputValue(e.target.value)}
                    placeholder={isListening ? "Listening closely to your voice..." : "Ask your doubt (e.g. solve 2x² - 5x + 3 = 0, or write notes)..."}
                    className={`w-full bg-[#030510]/95 border ${
                      isListening ? "border-red-500/50 focus:ring-red-500" : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/30"
                    } rounded-full pl-14 pr-28 py-4 text-sm focus:outline-none focus:ring-1 text-slate-100 placeholder:text-slate-400 transition-all font-semibold shadow-inner`}
                  />

                  <button 
                    type="button"
                    onClick={() => chatFileInputRef.current?.click()}
                    className="absolute left-3.5 w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
                    title="Attach homework photo"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input 
                    type="file"
                    ref={chatFileInputRef}
                    onChange={handleChatFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="absolute right-3 flex gap-2 items-center">
                    <button 
                      type="button"
                      onClick={startSpeechToText}
                      className={`w-9.5 h-9.5 rounded-full flex items-center justify-center border transition-all ${
                        isListening 
                          ? "bg-red-600 border-red-500 text-white animate-pulse shadow-lg shadow-red-500/40" 
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white active:scale-95"
                      }`}
                      title="Voice speech-to-text input"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button 
                      type="submit"
                      disabled={(!chatInputValue.trim() && !attachedImage) || loading}
                      className="w-9.5 h-9.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-full flex items-center justify-center hover:from-cyan-600 hover:to-indigo-700 disabled:opacity-40 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>

        </section>

      </div>
    </div>
  );
}
