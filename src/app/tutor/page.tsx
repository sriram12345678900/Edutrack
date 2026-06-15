"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Home, Sparkles, MessageSquare, ArrowRight, 
  Bot, User, Check, Loader2, Mic, Volume2, 
  VolumeX, FileText, Copy, Plus, Trash2, Paperclip, X
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Mobile sidebar toggle

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
      rec.lang = "en-IN"; // English (India) is excellent for hybrid/Hinglish dictation

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
      
      // Attempt to find natural sounding English voice
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
        title: textQuery.substring(0, 24) || "Homework Image",
        messages: [userMessage],
        timestamp: Date.now()
      };
      updatedSessions = [targetSession, ...updatedSessions];
      setCurrentSessionId(targetSessionId);
    } else if (targetSession) {
      targetSession.messages = [...targetSession.messages, userMessage];
      // Move active session to the top of list
      updatedSessions = [
        targetSession,
        ...updatedSessions.filter(s => s.id !== targetSessionId)
      ];
    }

    saveSessions(updatedSessions);
    setAttachedImage(null);

    try {
      // Build API message payload
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

  // ── CONVERT IMAGE IN CHAT MODE ──
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

  // ── GENERATE CONCLUSION ──
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

  // Quick chips handler
  const handleChipClick = (query: string) => {
    setChatInputValue(query);
  };

  const quickChips = [
    { label: "Refraction slab (Hindi)", query: "Can you explain refraction of light in a glass slab in easy Hinglish?" },
    { label: "Solve Quadratic formula", query: "Explain how to solve the quadratic equation 2x² - 5x + 3 = 0 step-by-step?" },
    { label: "Metal reactivity mnemonic", query: "What is a simple mnemonic to remember the metal reactivity series for CBSE Class 10?" },
    { label: "Photosynthesis summary", query: "Explain the light and dark reactions of photosynthesis in simple terms." }
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
            className="flex justify-center my-4 p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl font-serif italic text-base text-indigo-300 tracking-widest font-bold select-all"
            dangerouslySetInnerHTML={{ __html: cleanMathLaTeX(mathText) }}
          />
        );
      }

      const formatMathInline = (mathText: string, keyIdx: number) => (
        <span 
          key={`math-${keyIdx}`}
          className="font-serif italic text-indigo-350 dark:text-indigo-400 font-bold text-sm tracking-wide bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/15 inline-block mx-0.5 select-all"
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
            <h1 key={idx} className="text-xl font-black text-white mt-4 mb-2 tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
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
            <span className="text-indigo-400 mt-1.5 text-xs">•</span>
            <span className="text-slate-300 dark:text-slate-200 text-sm font-medium leading-relaxed">{parseMix(line.trim().substring(2))}</span>
          </div>
        );
      }

      if (isNumbered) {
        const numMatch = line.trim().match(/^(\d+\.)\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-2.5 my-1.5 select-text">
              <span className="text-indigo-400 font-bold mt-0.5 text-sm">{numMatch[1]}</span>
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
    <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col bg-[#05060f] text-slate-100 font-sans relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="p-6 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 tracking-tight flex items-center gap-2">
            AI Tutor 💬
          </h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Your personal NCERT & CBSE study assistant. Ask anything, dictate with your voice, or attach homework files.
          </p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0 relative z-10">
        
        {/* Mobile history toggle button */}
        <button 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="md:hidden fixed bottom-24 right-6 w-12 h-12 rounded-full bg-indigo-655 text-white flex items-center justify-center shadow-xl border border-indigo-400/25 z-40"
          title="Chat History"
        >
          <FileText className="w-5 h-5" />
        </button>

        {/* History Sidebar Panel */}
        <aside className={`absolute md:static top-0 bottom-0 left-0 w-72 border-r border-slate-900 bg-[#060815]/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none p-5 flex flex-col gap-4 z-30 transition-transform duration-300 ${
          isHistoryOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}>
          <button 
            onClick={startNewSession}
            className="w-full py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 hover:border-indigo-500/40 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4" /> New Session
          </button>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2.5 mb-2 block">Recent doubt logs</h4>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-xs font-semibold">
                No sessions saved.
              </div>
            ) : (
              sessions.map(s => {
                const isActive = s.id === currentSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => selectSession(s.id)}
                    className={`group w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400 font-bold"
                        : "bg-transparent border-transparent text-slate-400 hover:bg-slate-900/30 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-indigo-405" : "text-slate-500"}`} />
                      <span className="text-xs truncate font-bold">{s.title}</span>
                    </div>
                    <button
                      onClick={(e) => deleteSession(e, s.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-1 rounded transition-opacity"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat main workspace */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#03040b]/30">
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!currentSessionId || currentSession?.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none max-w-xl mx-auto">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-650 rounded-3xl flex items-center justify-center text-white relative z-10 shadow-lg border border-white/10">
                    <Bot className="w-10 h-10" />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Ask EduTrack AI</h2>
                <p className="text-slate-450 text-sm font-semibold mb-8">
                  Your personal NCERT & CBSE study assistant. Ask anything, dictate with your voice, or snap a photo of your homework.
                </p>

                {/* Quickchips Grid */}
                <div className="w-full space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left block pl-1">Common study doubts</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {quickChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChipClick(chip.query)}
                        className="px-4 py-3 bg-slate-950/45 hover:bg-indigo-500/10 text-slate-300 hover:text-indigo-400 border border-slate-900 hover:border-indigo-500/30 rounded-2xl text-xs font-semibold transition-all text-left flex items-start gap-2.5 hover:scale-[1.01] active:scale-[0.99] shadow-sm"
                      >
                        <Sparkles className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Generate Conclusion Banner */}
                {currentSession && !currentSession.conclusion && (
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={generateSessionConclusion}
                      disabled={generatingSummary}
                      className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {generatingSummary ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Summarizing session...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          <span>Compile Study Summary</span>
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
                    <div key={i} className={`flex gap-4.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border ${
                        isAi 
                          ? "bg-indigo-950/30 text-indigo-400 border-indigo-500/15" 
                          : "bg-purple-950/30 text-purple-400 border-purple-500/15"
                      }`}>
                        {isAi ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                      </div>
                      <div className="relative group max-w-[80%]">
                        {/* Image preview in chat box */}
                        {msg.imagePreview && (
                          <div className="mb-3 rounded-2xl overflow-hidden max-w-[260px] border border-white/10 shadow-lg">
                            <img src={msg.imagePreview} alt="Attached homework" className="w-full h-auto object-cover" />
                          </div>
                        )}
                        
                        {/* Chat Bubble */}
                        <div className={`p-4.5 rounded-3xl shadow-xl border leading-relaxed ${
                          msg.role === "user" 
                            ? "bg-gradient-to-br from-indigo-550 to-indigo-650 text-white rounded-tr-none border-indigo-400/20 font-bold" 
                            : "bg-[#0b0c16]/70 backdrop-blur-md text-slate-300 rounded-tl-none border-slate-900/60 font-semibold"
                        }`}>
                          {msg.role === "user" ? (
                            <p className="text-sm select-text">{msg.content}</p>
                          ) : (
                            <div className="space-y-1">
                              {formatMessageContent(msg.content)}
                            </div>
                          )}
                        </div>

                        {/* TTS Speaker Icon */}
                        {isAi && (
                          <button
                            onClick={() => speakText(msg.content, identifier)}
                            className="absolute -right-10 top-2.5 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Speak response"
                          >
                            {activeSpeakingMsg === identifier ? (
                              <VolumeX className="w-4.5 h-4.5 text-red-400" />
                            ) : (
                              <Volume2 className="w-4.5 h-4.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Render saved Study Summary Conclusion */}
                {currentSession?.conclusion && (
                  <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-[2rem] p-6 shadow-xl relative overflow-hidden border-l-4 border-l-indigo-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between border-b border-indigo-500/25 pb-3.5 mb-4">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                        <h4 className="font-extrabold text-sm text-indigo-300 uppercase tracking-widest">Saved Study Conclusion</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(currentSession.conclusion || "");
                          alert("Summary copied to clipboard!");
                        }}
                        className="flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
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
                    <div className="bg-[#0b0c16]/70 backdrop-blur-md rounded-3xl rounded-tl-none border border-slate-900/60 px-5.5 py-4 flex items-center gap-1.5 shadow-xl">
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

          {/* Bottom Input Area */}
          <div className="p-4 bg-slate-950/45 border-t border-slate-900/60 backdrop-blur-md shrink-0">
            <div className="max-w-4xl mx-auto">
              {/* Image upload preview widget above input */}
              {attachedImage && (
                <div className="mb-3 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between w-fit gap-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shadow-inner">
                      <img src={attachedImage} alt="Homework draft" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Homework Photo Attached</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Will be solved inline with your doubt</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAttachedImage(null)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
                    title="Remove image"
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
                  placeholder={isListening ? "Listening closely to your voice..." : "Ask your doubt (e.g. solve 2x² - 5x + 3 = 0, or write physics notes)..."}
                  className={`w-full bg-[#03040c]/85 border ${
                    isListening ? "border-red-500/50 focus:ring-red-500" : "border-slate-800 focus:border-indigo-500/60 focus:ring-indigo-500/40"
                  } rounded-[2rem] pl-16 pr-26 py-4.5 text-sm focus:outline-none focus:ring-1 text-slate-200 placeholder:text-slate-500 transition-all font-semibold`}
                />

                {/* Left: Attachment trigger */}
                <button 
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  className="absolute left-4.5 w-9 h-9 rounded-full flex items-center justify-center bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-450 hover:text-white transition-colors"
                  title="Attach homework photo"
                >
                  <Paperclip className="w-4.5 h-4.5" />
                </button>
                <input 
                  type="file"
                  ref={chatFileInputRef}
                  onChange={handleChatFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* Right: Mic & Send button */}
                <div className="absolute right-2.5 flex gap-1.5 items-center">
                  <button 
                    type="button"
                    onClick={startSpeechToText}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                      isListening 
                        ? "bg-red-650 border-red-500 text-white animate-pulse" 
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                    title="Voice speech-to-text input"
                  >
                    <Mic className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    type="submit"
                    disabled={(!chatInputValue.trim() && !attachedImage) || loading}
                    className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-indigo-500/10 active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4.5 h-4.5" />
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
