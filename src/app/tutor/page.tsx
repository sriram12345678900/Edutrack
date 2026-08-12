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

    // Persona System Instruction
    let personaInstruction = "";
    if (personaMode === "ncert_expert") {
      personaInstruction = "Act as an NCERT CBSE Board Examiner. Provide strict, marking-scheme-friendly solutions with definitions, formulas, and board exam tips.";
    } else if (personaMode === "socratic") {
      personaInstruction = "Act as a Socratic Mentor. Don't give answers directly immediately; guide the student with helpful hints, step by step.";
    } else if (personaMode === "simplifier") {
      personaInstruction = "Act as an ELI5 Simplifier. Use fun real-world analogies, simple terms, and zero jargon.";
    }

    try {
      const apiMessages = [
        { role: "system", content: personaInstruction },
        ...targetSession!.messages.map((m) => {
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
        })
      ];

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

  // ── LATEX / MATH SANITIZATION & TYPOGRAPHY ──
  const cleanMathLaTeX = (mathStr: string): string => {
    let s = mathStr;
    s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1) / ($2)");
    s = s.replace(/\\sqrt\{([^}]+)\}/g, "√($1)");
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

  // Check if a line is a standalone mathematical equation
  const isEquationLine = (lineStr: string): boolean => {
    const trimmed = lineStr.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith("$$") || (trimmed.startsWith("$") && trimmed.endsWith("$"))) return true;
    
    // Prose lines starting with bullets, step numbers, headers or system notes are NOT math equation boxes
    if (/^(\d+\.|\*|\-|\#|\[SYSTEM|\*Note:)/i.test(trimmed)) return false;
    if (trimmed.includes("**")) return false; // If line contains markdown bolding, treat as rich text paragraph
    
    // Pure mathematical equality or formula expressions
    const isPureMath = /^([a-zA-Z]\([a-zA-Z0-9,\s]+\)|[a-zA-Z0-9\s\\√±²³\+\-\*\/\^=]+)\s*=\s*(.*)$/i.test(trimmed) ||
                       /^\\(int|sum|lim|frac|sqrt)/i.test(trimmed);
                       
    return isPureMath;
  };

  // ── MARKDOWN FORMATTER WITH CLEAN TYPOGRAPHY ──
  const formatMessageContent = (text: string) => {
    if (!text) return null;

    // Clean stray system instructions or raw tags if any
    const cleanText = text.replace(/\[SYSTEM:[^\]]*\]/gi, "").trim();
    const lines = cleanText.split("\n");
    
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      const isExplicitBlockMath = trimmed.startsWith("$$") && trimmed.endsWith("$$");
      const isMathEquation = isExplicitBlockMath || isEquationLine(trimmed);

      // Render explicit math formulas as mathematical cards
      if (isExplicitBlockMath) {
        const mathText = trimmed.slice(2, -2);
        return (
          <div 
            key={idx} 
            className="flex justify-center my-3 p-3.5 bg-[#050c22] border border-cyan-500/40 rounded-xl font-mono text-sm sm:text-base text-cyan-300 tracking-wider font-extrabold select-all shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            dangerouslySetInnerHTML={{ __html: cleanMathLaTeX(mathText) }}
          />
        );
      }

      if (isMathEquation) {
        return (
          <div 
            key={idx} 
            className="my-2 p-2.5 px-3.5 bg-[#060e28]/80 border border-cyan-500/30 rounded-xl font-mono text-xs sm:text-sm text-cyan-200 tracking-wide font-bold select-all shadow-sm flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_#22d3ee]" />
            <span dangerouslySetInnerHTML={{ __html: cleanMathLaTeX(trimmed) }} />
          </div>
        );
      }

      const formatMathInline = (mathText: string, keyIdx: number) => (
        <span 
          key={`math-${keyIdx}`}
          className="font-mono text-cyan-300 font-bold text-xs tracking-wide bg-cyan-500/20 px-2 py-0.5 rounded-md border border-cyan-500/30 inline-block mx-0.5 select-all"
          dangerouslySetInnerHTML={{ __html: cleanMathLaTeX(mathText) }}
        />
      );

      const formatBoldItalicAndPlain = (plainText: string, keyIdx: number) => {
        const parts = plainText.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        return (
          <React.Fragment key={`plain-${keyIdx}`}>
            {parts.map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
                return <strong key={i} className="font-black text-cyan-200 bg-cyan-500/10 px-1 py-0.5 rounded border border-cyan-500/20">{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
                return <em key={i} className="italic text-slate-300">{part.slice(1, -1)}</em>;
              }
              return part;
            })}
          </React.Fragment>
        );
      };

      const parseMix = (mixText: string) => {
        const parts = mixText.split("$");
        return parts.map((part, i) => {
          if (i % 2 === 1) return formatMathInline(part, i);
          return formatBoldItalicAndPlain(part, i);
        });
      };

      const headingMatch = line.match(/^(#{1,4})\s*(.*)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const rawText = headingMatch[2];
        const headingContent = parseMix(rawText);

        if (level === 1) {
          return (
            <h1 key={idx} className="text-lg font-black text-white mt-4 mb-2 tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              {headingContent}
            </h1>
          );
        } else if (level === 2) {
          return (
            <h2 key={idx} className="text-base font-extrabold text-white mt-4 mb-2 tracking-tight flex items-center gap-2">
              {headingContent}
            </h2>
          );
        } else {
          return <h3 key={idx} className="text-sm font-extrabold text-white mt-3 mb-1 tracking-tight">{headingContent}</h3>;
        }
      }

      const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");
      const isNumbered = /^\d+\.\s/.test(line.trim());

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2.5 ml-2 my-1.5 select-text">
            <span className="text-cyan-400 mt-1 text-xs">•</span>
            <span className="text-slate-300 text-sm font-medium leading-relaxed">{parseMix(line.trim().substring(2))}</span>
          </div>
        );
      }

      if (isNumbered) {
        const numMatch = line.trim().match(/^(\d+\.)\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-1 my-2 select-text">
              <span className="text-cyan-400 font-extrabold text-xs bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/30 shrink-0">{numMatch[1]}</span>
              <span className="text-slate-200 text-sm font-semibold leading-relaxed pt-0.5">{parseMix(numMatch[2])}</span>
            </div>
          );
        }
      }

      return (
        <p key={idx} className="text-slate-300 text-sm font-medium mb-2 last:mb-0 leading-relaxed select-text">
          {parseMix(line)}
        </p>
      );
    });
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col bg-[#020309] text-slate-100 font-sans relative overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-15%] left-[10vw] w-[45vw] h-[45vw] bg-cyan-600/12 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[10vw] w-[45vw] h-[45vw] bg-indigo-600/12 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Compact Controls Header Bar */}
      <header className="sticky top-0 z-20 shrink-0 bg-[#040613]/95 backdrop-blur-3xl border-b border-white/10 px-4 sm:px-6 py-2.5 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-xl">
        
        {/* Left: AI Tutor Identity */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all shadow-sm active:scale-95">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <img src="/ai_tutor_avatar.jpg" alt="AI Core Avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white leading-tight flex items-center gap-2">
                  Professor AI Tutor 
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> Live Core
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">NCERT CBSE Class 10 Specialist</p>
              </div>
            </div>
          </div>

          {/* Mobile History Toggle */}
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="lg:hidden p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 text-xs font-bold"
          >
            <MessageSquare className="w-4 h-4" />
            <span>History</span>
          </button>
        </div>

        {/* Center: Persona Switcher Pills */}
        <div className="flex p-1 bg-black/50 border border-white/10 rounded-2xl backdrop-blur-xl shrink-0 overflow-x-auto max-w-full">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive 
                    ? "bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25 border border-white/20 scale-[1.02]" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white animate-pulse" : "text-slate-400"}`} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Drawer Toggle, New Chat & Language */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={startNewSession}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 active:scale-95 border border-white/20"
            title="Start a new AI study conversation"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Chat</span>
          </button>

          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all flex items-center gap-2 ${
              isHistoryOpen
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Saved Chats ({sessions.length})</span>
            <span className="sm:hidden">({sessions.length})</span>
          </button>

          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
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

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative z-10">
        
        {/* ── COLLAPSIBLE SESSIONS DRAWER ── */}
        <aside className={`fixed lg:relative top-0 bottom-0 left-0 w-72 border-r border-white/10 bg-[#040614]/95 lg:bg-[#040614]/80 backdrop-blur-2xl p-4 flex flex-col gap-3 z-30 transition-all duration-300 ${
          isHistoryOpen ? "translate-x-0 ml-0" : "-translate-x-full lg:translate-x-0 lg:-ml-72"
        }`}>
          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Study Sessions</span>
            <button onClick={() => setIsHistoryOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={startNewSession}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] border border-white/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Study Chat</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {sessions.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-white/[0.01] p-3">
                <MessageSquare className="w-6 h-6 text-slate-600 mx-auto mb-1.5 opacity-50" />
                <p className="text-slate-400 text-xs font-semibold">No previous chats.</p>
              </div>
            ) : (
              sessions.map(s => {
                const isActive = s.id === currentSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => selectSession(s.id)}
                    className={`group w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all relative ${
                      isActive
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-200 font-extrabold shadow-md"
                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                    )}
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
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

        {/* ── MAIN EXPANSIVE CHAT VIEWPORT ── */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#03040d]/60 relative p-2 sm:p-3 pb-0 sm:pb-0 overflow-hidden h-full min-h-0">
          
          {/* Framed Chat Box Container */}
          <div className="w-full flex-1 min-h-0 max-w-6xl mx-auto bg-[#050718]/90 backdrop-blur-3xl border border-cyan-500/30 rounded-t-2xl rounded-b-none sm:rounded-t-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.12)] relative">
            
            {/* Top Cyan Glow Beam Rim */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-indigo-500 shrink-0 shadow-[0_0_12px_#22d3ee]" />

            {/* Box Header Bar */}
            <div className="px-5 py-3 border-b border-cyan-500/20 bg-[#070b22]/80 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                <span className="text-xs font-black text-cyan-200 uppercase tracking-widest truncate max-w-[240px] sm:max-w-md">
                  {currentSession ? currentSession.title : "Active Study Session"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={startNewSession}
                  className="px-3 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  title="Start a new session"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">New Chat</span>
                </button>
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 rounded-lg shadow-sm">
                  {currentSession ? `${currentSession.messages.length} Messages` : "Live Core"}
                </span>
              </div>
            </div>

            {/* Ambient HUD Accents */}
            <div className="absolute top-12 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-400/40 pointer-events-none z-20" />
            <div className="absolute top-12 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-400/40 pointer-events-none z-20" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-400/40 pointer-events-none z-20" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-400/40 pointer-events-none z-20" />

            {/* Scrollable Messages Feed Inside Box */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
              {!currentSessionId || currentSession?.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-xl mx-auto select-none">
                  
                  {/* Avatar Icon */}
                  <div className="relative mb-5 flex items-center justify-center">
                    <div className="absolute w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border-2 border-cyan-400/40 p-1 bg-[#070a1a] hover:scale-105 transition-transform duration-300">
                      <img src="/ai_tutor_avatar.jpg" alt="Holographic AI Tutor" className="w-full h-full object-cover rounded-2xl" />
                      {activeSpeakingMsg && (
                        <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center gap-1 backdrop-blur-xs">
                          <Activity className="w-7 h-7 text-cyan-200 animate-bounce" />
                        </div>
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 mb-2 tracking-tight">
                    How can I help your study today?
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm font-semibold mb-6 max-w-md leading-relaxed">
                    Ask any doubt, upload homework photos, or select a topic below. Active in <strong className="text-cyan-400 uppercase tracking-wider">{personaMode.replace('_', ' ')}</strong> mode in <strong className="text-cyan-400">{userLanguage}</strong>.
                  </p>

                  {/* Quick Chips Suggestion Deck */}
                  <div className="w-full space-y-2.5 text-left">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" /> Interactive CBSE Doubts
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {quickChips.map((chip, idx) => {
                        const ChipIcon = chip.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleChipClick(chip.query)}
                            className={`px-4 py-3 border rounded-2xl text-xs font-extrabold transition-all text-left flex items-start gap-3 hover:scale-[1.02] active:scale-[0.98] shadow-md backdrop-blur-md ${chip.color}`}
                          >
                            <ChipIcon className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="leading-snug">{chip.label}</span>
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
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-md"
                      >
                        {generatingSummary ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
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
                      <div key={i} className={`flex gap-3.5 sm:gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xl border ${
                          isAi 
                            ? "bg-gradient-to-br from-cyan-950 to-indigo-950 text-cyan-300 border-cyan-500/40 shadow-cyan-500/10 ring-2 ring-cyan-500/20" 
                            : "bg-gradient-to-br from-purple-950 to-indigo-950 text-purple-300 border-purple-500/40 shadow-purple-500/10"
                        }`}>
                          {isAi ? <Bot className="w-4.5 h-4.5 text-cyan-400" /> : <User className="w-4.5 h-4.5 text-purple-300" />}
                        </div>

                        <div className="relative group max-w-[85%] sm:max-w-[82%]">
                          
                          {msg.imagePreview && (
                            <div className="mb-3 rounded-2xl overflow-hidden max-w-[260px] border border-cyan-500/30 shadow-2xl relative">
                              <img src={msg.imagePreview} alt="Attached homework" className="w-full h-auto object-cover" />
                            </div>
                          )}

                          <div className={`p-4 sm:p-5 rounded-3xl shadow-2xl border leading-relaxed select-text ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-cyan-600 via-teal-600 to-indigo-600 text-white rounded-tr-none border-cyan-400/30 font-bold text-sm shadow-[0_4px_20px_rgba(6,182,212,0.25)]"
                              : "bg-[#070b22]/95 backdrop-blur-2xl text-slate-100 rounded-tl-none border-white/10 border-l-4 border-l-cyan-400 font-medium text-sm shadow-[0_6px_30px_rgba(0,0,0,0.5)]"
                          }`}>
                            {msg.role === "user" ? (
                              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            ) : (
                              <div className="space-y-1">
                                {formatMessageContent(msg.content)}
                              </div>
                            )}
                          </div>

                          {isAi && (
                            <button
                              onClick={() => speakText(msg.content, identifier)}
                              className="absolute -right-10 top-3 p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 shadow-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
                              title="Read text aloud"
                            >
                              {activeSpeakingMsg === identifier ? (
                                <VolumeX className="w-4 h-4 text-red-400 animate-pulse" />
                              ) : (
                                <Volume2 className="w-4 h-4 text-cyan-400" />
                              )}
                            </button>
                          )}

                        </div>

                      </div>
                    );
                  })}

                  {/* Session Conclusion Card */}
                  {currentSession?.conclusion && (
                    <div className="bg-gradient-to-br from-cyan-500/15 via-indigo-500/10 to-transparent border border-cyan-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden border-l-4 border-l-cyan-400">
                      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-3.5">
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
                          <h4 className="font-black text-xs text-cyan-300 uppercase tracking-widest">Study Session Summary</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(currentSession.conclusion || "");
                            alert("Summary copied to clipboard!");
                          }}
                          className="flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Summary</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {formatMessageContent(currentSession.conclusion)}
                      </div>
                    </div>
                  )}

                  {/* Loading Typing Indicator */}
                  {loading && (
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-2xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-lg">
                        <Bot className="w-4.5 h-4.5 animate-pulse text-cyan-400" />
                      </div>
                      <div className="bg-[#080d26]/95 backdrop-blur-xl rounded-3xl rounded-tl-none border border-cyan-500/20 border-l-4 border-l-cyan-400 px-5 py-3.5 flex items-center gap-2 shadow-2xl">
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
            <div className="p-3 sm:p-4 pb-4 sm:pb-5 bg-[#040616]/95 border-t border-cyan-500/20 backdrop-blur-2xl shrink-0 z-20 shadow-[0_-15px_40px_rgba(0,0,0,0.5)]">
              <div className="max-w-5xl mx-auto">
                
                {attachedImage && (
                  <div className="mb-2.5 p-2.5 bg-slate-900/90 border border-cyan-500/30 rounded-2xl flex items-center justify-between w-fit gap-3 shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 shadow-md">
                        <img src={attachedImage} alt="Homework draft" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-200">Homework Photo Attached</p>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wide">Ready for analysis</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAttachedImage(null)}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleChatSend} className="relative flex items-center group">
                  <input 
                    type="text" 
                    value={chatInputValue}
                    onChange={(e) => setChatInputValue(e.target.value)}
                    placeholder={isListening ? "Listening closely to your voice..." : "Ask your doubt (e.g. solve 2x² - 5x + 3 = 0, or upload photo)..."}
                    className={`w-full bg-[#030514]/95 border ${
                      isListening 
                        ? "border-red-500/60 focus:ring-red-500" 
                        : "border-white/10 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/25"
                    } rounded-full pl-13 pr-24 py-3.5 text-sm focus:outline-none text-slate-100 placeholder:text-slate-500 transition-all font-semibold shadow-inner`}
                  />

                  <button 
                    type="button"
                    onClick={() => chatFileInputRef.current?.click()}
                    className="absolute left-3 w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95 shadow-sm"
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

                  <div className="absolute right-2.5 flex gap-1.5 items-center">
                    <button 
                      type="button"
                      onClick={startSpeechToText}
                      className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                        isListening 
                          ? "bg-red-600 border-red-500 text-white animate-pulse shadow-lg shadow-red-500/40 scale-105" 
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white active:scale-95"
                      }`}
                      title="Voice speech-to-text input"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button 
                      type="submit"
                      disabled={(!chatInputValue.trim() && !attachedImage) || loading}
                      className="w-9 h-9 bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-white rounded-full flex items-center justify-center hover:brightness-110 disabled:opacity-40 transition-all shadow-lg shadow-cyan-500/25 active:scale-95 hover:scale-105"
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
