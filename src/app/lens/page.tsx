"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Home, Camera, Upload, Sparkles, MessageSquare, ArrowRight, 
  Zap, Bot, User, Check, Loader2, Mic, Volume2, 
  VolumeX, FileText, Copy, X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function LensPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Doubt-Solver Lens (Scan) States
  const [lensImage, setLensImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lensChatStarted, setLensChatStarted] = useState(false);
  const [lensMessages, setLensMessages] = useState<{ role: "user" | "ai"; content: string; imagePreview?: string }[]>([]);
  const [lensInputValue, setLensInputValue] = useState("");
  const [lensConclusion, setLensConclusion] = useState<string | null>(null);

  // Common UI States
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingMsg, setActiveSpeakingMsg] = useState<string | null>(null); // formatted as "lens-index"
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lensChatEndRef = useRef<HTMLDivElement>(null);

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Scroll to bottom on new messages
  useEffect(() => {
    lensChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lensMessages, isScanning]);

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
        setLensInputValue(prev => (prev ? prev + " " + transcript : transcript));
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

  // ── LENS DOUBLE-COLUMN WORKSPACE SEND ──
  const handleLensSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lensInputValue.trim() || loading) return;

    const query = lensInputValue.trim();
    setLensInputValue("");
    setLoading(true);
    setLensConclusion(null);

    const userMessage = { role: "user" as const, content: query };
    const updatedMessages = [...lensMessages, userMessage];
    setLensMessages(updatedMessages);

    try {
      const apiMessages = updatedMessages.map(m => ({
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
      setLensMessages(prev => [...prev, { role: "ai", content: data.reply || "Error generating response." }]);
    } catch (e) {
      console.error(e);
      setLensMessages(prev => [...prev, { role: "ai", content: "Failed to connect to the tutor." }]);
    } finally {
      setLoading(false);
    }
  };

  // ── LENS IMAGE UPLOADS ──
  const handleLensFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setLensImage(base64);
        setLensChatStarted(false);
        setLensMessages([]);
        setLensConclusion(null);
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }
  };

  const handleLensDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const base64 = await fileToBase64(file);
        setLensImage(base64);
        setLensChatStarted(false);
        setLensMessages([]);
        setLensConclusion(null);
      } catch (err) {
        console.error("Error reading dropped file:", err);
      }
    }
  };

  // ── LENS OCR SCAN ──
  const triggerLensScan = async () => {
    if (!lensImage || isScanning) return;
    setIsScanning(true);
    setLensChatStarted(true);
    setLensConclusion(null);
    setLensMessages([
      { role: "user", content: "Uploaded a homework image for analysis.", imagePreview: lensImage }
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "Please analyze this homework image, extract the text/question, and explain how to solve it step-by-step.",
              attachments: [
                {
                  type: "image/jpeg",
                  data: lensImage,
                  name: "homework.jpg"
                }
              ]
            }
          ],
          language: "Hinglish",
          bookInfo: ""
        })
      });

      const data = await res.json();
      if (data.reply) {
        setLensMessages([
          { role: "user", content: "Uploaded a homework image for analysis.", imagePreview: lensImage },
          { role: "ai", content: data.reply }
        ]);
      } else {
        setLensMessages(prev => [
          ...prev,
          { role: "ai", content: "Failed to analyze the image. Please try again." }
        ]);
      }
    } catch (e) {
      console.error(e);
      setLensMessages(prev => [
        ...prev,
        { role: "ai", content: "Failed to connect to the doubt solver." }
      ]);
    } finally {
      setIsScanning(false);
    }
  };

  // ── GENERATE CONCLUSION ──
  const generateSessionConclusion = async () => {
    if (generatingSummary || lensMessages.length === 0) return;

    setGeneratingSummary(true);

    const summaryPrompt = {
      role: "user" as const,
      content: "Thank you for the explanations. Now, please generate a structured, encouraging study session conclusion and summary. Include: 1. Main Concepts Explored, 2. Important Formulas/Definitions, 3. Practical takeaways. Keep it clear, concise, and structured. Use bullet points."
    };

    try {
      const apiMessages = [...lensMessages, summaryPrompt].map(m => ({
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
      setLensConclusion(summaryText);
    } catch (e) {
      console.error(e);
      alert("Failed to compile study summary.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Quick chips handler
  const handleChipClick = async (query: string) => {
    setLensChatStarted(true);
    setLensConclusion(null);
    setLensMessages([
      { role: "user", content: query }
    ]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: query }],
          language: "Hinglish",
          bookInfo: ""
        })
      });

      const data = await res.json();
      setLensMessages(prev => [...prev, { role: "ai", content: data.reply || "Error generating response." }]);
    } catch (e) {
      console.error(e);
      setLensMessages(prev => [...prev, { role: "ai", content: "Failed to connect to the tutor." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    { label: "Refraction of Light (Hindi)", query: "Can you explain refraction of light in a glass slab in easy Hinglish?" },
    { label: "Quadratic Equations", query: "Explain how to solve the quadratic equation 2x² - 5x + 3 = 0 step-by-step?" },
    { label: "Mnemonic for Reactivity", query: "What is a simple mnemonic to remember the metal reactivity series for CBSE Class 10?" },
    { label: "Photosynthesis Process", query: "Explain the light and dark reactions of photosynthesis in simple terms." }
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05060f]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen flex flex-col bg-[#05060f] text-slate-100 font-sans relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── TOP HEADER ── */}
      <div className="p-6 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md flex flex-row items-center justify-between gap-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Camera className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 tracking-tight flex items-center gap-2">
              AI Doubt-Solver Lens 🔍
            </h1>
            <p className="text-slate-500 text-xs font-semibold mt-0.5">
              Snap a photo of your homework to get step-by-step explanations instantly.
            </p>
          </div>
        </div>

        <Link href="/dashboard">
          <button className="px-5.5 py-3 rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-900/60 text-slate-350 hover:text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
        </Link>
      </div>

      {/* ── DOUBLE-COLUMN SCANNER WORKSPACE ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 overflow-hidden min-h-0 relative z-10">
        
        {/* Left Column: Drag & Drop upload scanner workspace */}
        <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10">
          <div 
            className={`relative bg-slate-900/40 backdrop-blur-3xl border-2 border-dashed ${
              lensImage ? "border-emerald-500/40" : "border-slate-800 hover:border-emerald-500/50"
            } rounded-[2.5rem] p-3 aspect-[4/3] flex flex-col items-center justify-center overflow-hidden transition-all group shrink-0`}
            onDrop={handleLensDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {lensImage ? (
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-inner">
                <img src={lensImage} alt="Uploaded homework" className="w-full h-full object-cover" />
                {isScanning && (
                  <>
                    <div className="absolute inset-0 bg-emerald-500/10" />
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-450 to-teal-450 shadow-[0_0_20px_#10b981] animate-scan" />
                  </>
                )}
                {!isScanning && !lensChatStarted && (
                  <button 
                    onClick={triggerLensScan}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-750 text-white px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-2xl hover:scale-105 active:scale-98 transition-all duration-300 border border-emerald-400/25"
                  >
                    <Zap className="w-4.5 h-4.5 fill-current" /> Analyze homework doubt
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center p-8 select-none">
                <div className="w-20 h-20 bg-slate-850/40 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800/80 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Drag & Drop Image</h3>
                <p className="text-slate-500 text-xs font-semibold mb-6">or click the button below to browse</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-800/60 hover:bg-slate-700/60 text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-colors border border-slate-750 mx-auto active:scale-95"
                >
                  <Upload className="w-4 h-4" /> Select File
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLensFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            )}
          </div>

          <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800/60 rounded-[2.5rem] p-6 shadow-xl shrink-0">
            <h3 className="text-xs font-extrabold text-slate-350 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-400" /> How It Works
            </h3>
            <ul className="space-y-3.5">
              {[
                "Take a clear photo of one doubt or question at a time.",
                "Our AI extracts text and analyzes complex diagrams instantly."
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-400 font-semibold leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Split Screen Chat Canvas */}
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800/60 rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-2xl relative min-h-0">
          {!lensChatStarted ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10 select-none">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                <MessageSquare className="w-16 h-16 text-slate-700 animate-bounce relative z-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-350 mb-2">Interactive AI Canvas</h2>
              <p className="text-slate-500 text-xs font-semibold mb-6 max-w-sm">
                Upload an image and click analyze, or click a quick-chip below to start instantly.
              </p>

              {isScanning && (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <span className="text-emerald-400 font-extrabold text-xs tracking-widest uppercase animate-pulse">Running Optical Character Recognition...</span>
                </div>
              )}

              {/* Quickchips Grid */}
              {!isScanning && (
                <div className="w-full max-w-md mt-6 space-y-3.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-550 text-center block">Frequently Asked Doubts</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quickChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChipClick(chip.query)}
                        className="px-4 py-3.5 bg-slate-950/45 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 border border-slate-900 hover:border-emerald-500/30 rounded-2xl text-xs font-semibold transition-all text-left flex items-start gap-2 hover:scale-[1.01] active:scale-[0.99] shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-slate-850/80 p-4 flex items-center justify-between border-b border-slate-800 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/25 p-2 rounded-xl">
                    <Bot className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Professor AI</h3>
                    <p className="text-[10px] text-emerald-455 uppercase tracking-widest font-bold">Online</p>
                  </div>
                </div>
                {lensMessages.length > 0 && !lensConclusion && (
                  <button
                    onClick={generateSessionConclusion}
                    disabled={generatingSummary}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {generatingSummary ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Summarizing...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>Generate Conclusion</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {lensMessages.map((msg, i) => {
                  const identifier = `lens-${i}`;
                  const isAi = msg.role === "ai";
                  return (
                    <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                        isAi ? "bg-emerald-900/50 text-emerald-400" : "bg-purple-900/50 text-purple-400"
                      }`}>
                        {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className="relative group max-w-[85%]">
                        {/* Image preview in bubble */}
                        {msg.imagePreview && (
                          <div className="mb-2.5 rounded-2xl overflow-hidden max-w-[200px] border border-white/10 shadow-md">
                            <img src={msg.imagePreview} alt="Homework Attachment" className="w-full h-auto object-cover" />
                          </div>
                        )}
                        
                        <div className={`p-4.5 rounded-2xl shadow-md border leading-relaxed ${
                          msg.role === "user" 
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-650 text-white rounded-tr-none border-emerald-400/20" 
                            : "bg-[#0b0c16]/75 backdrop-blur-md text-slate-300 rounded-tl-none border-slate-800/80"
                        }`}>
                          {msg.role === "user" ? (
                            <p className="text-sm font-semibold select-text">{msg.content}</p>
                          ) : (
                            <div className="space-y-1">
                              {formatMessageContent(msg.content)}
                            </div>
                          )}
                        </div>
                        
                        {isAi && (
                          <button
                            onClick={() => speakText(msg.content, identifier)}
                            className="absolute -right-10 top-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Read aloud"
                          >
                            {activeSpeakingMsg === identifier ? (
                              <VolumeX className="w-3.5 h-3.5 text-red-400" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Lens Conclusion Card */}
                {lensConclusion && (
                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden my-6 border-l-4 border-l-emerald-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <h4 className="font-extrabold text-sm text-emerald-300 uppercase tracking-widest">Study Session Summary</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(lensConclusion || "");
                          alert("Summary copied to clipboard!");
                        }}
                        className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Summary</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formatMessageContent(lensConclusion)}
                    </div>
                  </div>
                )}

                {/* Loading Typing Indicator */}
                {loading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-[#0b0c16]/75 backdrop-blur-md rounded-2xl rounded-tl-none border border-slate-800/80 px-5 py-4 flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2.5 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                <div ref={lensChatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-slate-950/45 border-t border-slate-850/60 backdrop-blur-md shrink-0">
                <form onSubmit={handleLensSend} className="relative flex items-center">
                  <input 
                    type="text" 
                    value={lensInputValue}
                    onChange={(e) => setLensInputValue(e.target.value)}
                    placeholder={isListening ? "Listening closely..." : "Ask a follow-up question about this scanned doubt..."}
                    className={`w-full bg-[#03040c]/80 border ${
                      isListening ? "border-red-500/50 focus:ring-red-500" : "border-slate-800 focus:border-emerald-500/60 focus:ring-emerald-500/40"
                    } rounded-full pl-5 pr-26 py-4 text-sm focus:outline-none focus:ring-1 text-slate-250 placeholder:text-slate-500 transition-all font-semibold`}
                  />
                  <div className="absolute right-2 flex gap-1.5 items-center">
                    <button 
                      type="button"
                      onClick={startSpeechToText}
                      className={`w-9.5 h-9.5 rounded-full flex items-center justify-center border transition-all ${
                        isListening 
                          ? "bg-red-650 border-red-500 text-white animate-pulse" 
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                      title="Speak doubt"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button 
                      type="submit"
                      disabled={!lensInputValue.trim() || loading}
                      className="w-9.5 h-9.5 bg-gradient-to-r from-emerald-500 to-emerald-650 text-white rounded-full flex items-center justify-center hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-colors shadow-md shadow-emerald-500/10 active:scale-95"
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
            </>
          )}
        </div>

      </div>

      {/* Laser Scanning Animation Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />
    </div>
  );
}
