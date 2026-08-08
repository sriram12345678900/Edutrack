"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Home, Camera, Upload, Sparkles, MessageSquare, ArrowRight, 
  Zap, Bot, User, Check, Loader2, Mic, Volume2, 
  VolumeX, FileText, Copy, X, Eye, HelpCircle, BookOpen, Compass
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface SampleDoubt {
  id: string;
  title: string;
  subject: "Physics" | "Mathematics" | "Chemistry";
  query: string;
  imageSvgData?: string;
}

const SAMPLE_NCERT_DOUBTS: SampleDoubt[] = [
  {
    id: "d1",
    title: "Light Refraction Prism Angle",
    subject: "Physics",
    query: "Explain angle of deviation (D) when a white light ray passes through a glass prism for CBSE Class 10?",
  },
  {
    id: "d2",
    title: "Quadratic Equation Word Problem",
    subject: "Mathematics",
    query: "A motor boat whose speed is 18 km/h in still water takes 1 hour more to go 24 km upstream than to return downstream to the same spot. Find the speed of the stream.",
  },
  {
    id: "d3",
    title: "Esterification vs Saponification",
    subject: "Chemistry",
    query: "Write chemical equations for esterification of ethanoic acid with ethanol and saponification of ethyl ethanoate with sodium hydroxide.",
  }
];

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
  const [activeSpeakingMsg, setActiveSpeakingMsg] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [userLanguage, setUserLanguage] = useState<string>("Hinglish");

  useEffect(() => {
    const storedLang = localStorage.getItem("edutrack_language");
    if (storedLang) {
      setUserLanguage(storedLang);
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lensChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    lensChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lensMessages, isScanning]);

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
          language: userLanguage,
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
          language: userLanguage,
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

  // Trigger Preset Sample Doubt
  const handleSampleDoubtClick = async (sample: SampleDoubt) => {
    setLensChatStarted(true);
    setLensConclusion(null);
    setLensMessages([{ role: "user", content: sample.query }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `[NCERT Doubt Analysis] ${sample.query}` }],
          language: userLanguage,
          bookInfo: ""
        })
      });

      const data = await res.json();
      setLensMessages([
        { role: "user", content: sample.query },
        { role: "ai", content: data.reply || "Error solving doubt." }
      ]);
    } catch (e) {
      console.error(e);
      setLensMessages(prev => [...prev, { role: "ai", content: "Failed to connect to the doubt solver." }]);
    } finally {
      setLoading(false);
    }
  };

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
          language: userLanguage,
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
            className="flex justify-center my-4 p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl font-serif italic text-base text-emerald-300 tracking-widest font-bold select-all"
            dangerouslySetInnerHTML={{ __html: cleanMathLaTeX(mathText) }}
          />
        );
      }

      const formatMathInline = (mathText: string, keyIdx: number) => (
        <span 
          key={`math-${keyIdx}`}
          className="font-serif italic text-emerald-300 font-bold text-sm tracking-wide bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/20 inline-block mx-0.5 select-all"
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
            <h1 key={idx} className="text-xl font-black text-white mt-4 mb-2 tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {headingContent}
            </h1>
          );
        } else if (level === 2) {
          return (
            <h2 key={idx} className="text-base font-extrabold text-white mt-5 mb-2 tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent flex items-center gap-2">
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
            <span className="text-emerald-400 mt-1.5 text-xs">•</span>
            <span className="text-slate-300 text-sm font-medium leading-relaxed">{parseMix(line.trim().substring(2))}</span>
          </div>
        );
      }

      if (isNumbered) {
        const numMatch = line.trim().match(/^(\d+\.)\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-2.5 my-1.5 select-text">
              <span className="text-emerald-400 font-bold mt-0.5 text-sm">{numMatch[1]}</span>
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05060f]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Loading doubt solver lens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen flex flex-col bg-[#03050d] text-slate-100 font-sans relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ── TOP HEADER ── */}
      <header className="p-4 sm:p-6 border-b border-white/10 bg-[#050816]/90 backdrop-blur-2xl flex flex-row items-center justify-between gap-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 border border-white/10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <Camera className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 tracking-tight flex items-center gap-2">
              AI Doubt-Solver Lens 🔍
            </h1>
            <p className="text-slate-400 text-xs font-semibold mt-0.5">
              Instant Optical Character Recognition & Step-by-Step Solutions
            </p>
          </div>
        </div>

        <Link href="/dashboard">
          <button className="px-4.5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm">
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
        </Link>
      </header>

      {/* ── DOUBLE-COLUMN SCANNER WORKSPACE ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6 overflow-hidden min-h-0 relative z-10">
        
        {/* Left Column: Holographic Laser Scanner Canvas & Sample Presets */}
        <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10">
          
          {/* Holographic HUD Viewport */}
          <div 
            className={`relative bg-[#060a1c]/90 backdrop-blur-3xl border-2 border-dashed ${
              lensImage ? "border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]" : "border-white/15 hover:border-emerald-500/50"
            } rounded-3xl p-3 aspect-[4/3] flex flex-col items-center justify-center overflow-hidden transition-all group shrink-0 relative`}
            onDrop={handleLensDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Holographic Frame Corner Accents */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400/80 z-20 pointer-events-none" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400/80 z-20 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400/80 z-20 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400/80 z-20 pointer-events-none" />

            {lensImage ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                <img src={lensImage} alt="Uploaded homework" className="w-full h-full object-cover" />
                
                {isScanning && (
                  <>
                    <div className="absolute inset-0 bg-emerald-500/10" />
                    {/* Animated Cyan/Emerald Laser Line */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-300 shadow-[0_0_20px_#10b981] animate-scan" />
                  </>
                )}

                {!isScanning && !lensChatStarted && (
                  <button 
                    onClick={triggerLensScan}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20"
                  >
                    <Zap className="w-4.5 h-4.5 fill-current" /> Trigger OCR Scan & Solve
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center p-8 select-none relative z-10 w-full h-full flex flex-col items-center justify-center rounded-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none mix-blend-screen" style={{ backgroundImage: "url('/ai_lens_scanner.jpg')" }} />
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-[0_0_25px_rgba(16,185,129,0.25)] relative z-10 backdrop-blur-md">
                  <Camera className="w-9 h-9 text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-1.5 relative z-10 tracking-tight">Drag & Drop Homework Photo</h3>
                <p className="text-slate-400 text-xs font-semibold mb-6 relative z-10 max-w-xs">Scan math equations, physics diagrams, or chemistry formulas instantly</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all border border-white/20 mx-auto active:scale-95 shadow-xl shadow-emerald-500/25 relative z-10"
                >
                  <Upload className="w-4.5 h-4.5" /> Browse Homework Image
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

          {/* Sample NCERT Doubt Presets Deck */}
          <div className="bg-[#070918]/90 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" /> Test Sample NCERT Doubts
              </h3>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                1-Click Demo
              </span>
            </div>

            <div className="space-y-3">
              {SAMPLE_NCERT_DOUBTS.map((sd) => (
                <button
                  key={sd.id}
                  onClick={() => handleSampleDoubtClick(sd)}
                  className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-left transition-all group flex items-start justify-between gap-3 shadow-md"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">
                        {sd.subject}
                      </span>
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {sd.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 font-semibold">{sd.query}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0 mt-2 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Split Screen Interactive AI Canvas */}
        <div className="bg-[#060817]/90 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl relative min-h-0 backdrop-blur-xl">
          {!lensChatStarted ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10 select-none">
              <div className="relative mb-5 flex items-center justify-center">
                <div className="absolute w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl animate-pulse" />
                <div className="w-18 h-18 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-white relative z-10 shadow-2xl border border-white/20">
                  <Bot className="w-9 h-9" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                AI Solution Canvas Ready
              </h2>
              <p className="text-slate-400 text-xs font-semibold mb-6 max-w-sm leading-relaxed">
                Upload a homework image or click a sample NCERT doubt to generate step-by-step explanations.
              </p>

              {isScanning && (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-emerald-400 font-extrabold text-xs tracking-widest uppercase animate-pulse">Running OCR & Analyzing Equations...</span>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-[#080b1e]/90 p-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">Professor Doubt Solver</h3>
                    <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">Active Session</p>
                  </div>
                </div>

                {lensMessages.length > 0 && !lensConclusion && (
                  <button
                    onClick={generateSessionConclusion}
                    disabled={generatingSummary}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-extrabold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-md"
                  >
                    {generatingSummary ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Compiling...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Generate Conclusion</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {lensMessages.map((msg, i) => {
                  const identifier = `lens-${i}`;
                  const isAi = msg.role === "ai";
                  return (
                    <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md border ${
                        isAi ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/20" : "bg-purple-950/60 text-purple-400 border-purple-500/20"
                      }`}>
                        {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      <div className="relative group max-w-[85%]">
                        {msg.imagePreview && (
                          <div className="mb-2.5 rounded-2xl overflow-hidden max-w-[220px] border border-white/10 shadow-lg">
                            <img src={msg.imagePreview} alt="Scanned Attachment" className="w-full h-auto object-cover" />
                          </div>
                        )}
                        
                        <div className={`p-4 sm:p-5 rounded-3xl shadow-2xl border leading-relaxed ${
                          msg.role === "user" 
                            ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-tr-none border-emerald-400/20 font-bold text-sm" 
                            : "bg-[#080a18]/90 backdrop-blur-md text-slate-200 rounded-tl-none border-white/10 font-medium text-sm"
                        }`}>
                          {msg.role === "user" ? (
                            <p className="select-text whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <div className="space-y-1">
                              {formatMessageContent(msg.content)}
                            </div>
                          )}
                        </div>
                        
                        {isAi && (
                          <button
                            onClick={() => speakText(msg.content, identifier)}
                            className="absolute -right-10 top-3 p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
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
                  <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden my-6 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <h4 className="font-extrabold text-xs text-emerald-300 uppercase tracking-widest">Study Session Summary</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(lensConclusion || "");
                          alert("Summary copied to clipboard!");
                        }}
                        className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Summary</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formatMessageContent(lensConclusion)}
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-[#080a18]/90 backdrop-blur-md rounded-2xl rounded-tl-none border border-white/10 px-5 py-4 flex items-center gap-2 shadow-md">
                      <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                <div ref={lensChatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-[#050816]/90 border-t border-white/10 backdrop-blur-md shrink-0">
                <form onSubmit={handleLensSend} className="relative flex items-center">
                  <input 
                    type="text" 
                    value={lensInputValue}
                    onChange={(e) => setLensInputValue(e.target.value)}
                    placeholder={isListening ? "Listening closely..." : "Ask a follow-up question about this scanned doubt..."}
                    className={`w-full bg-[#03040c]/90 border ${
                      isListening ? "border-red-500/50 focus:ring-red-500" : "border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/30"
                    } rounded-full pl-5 pr-26 py-4 text-sm focus:outline-none focus:ring-1 text-slate-100 placeholder:text-slate-500 transition-all font-semibold`}
                  />
                  <div className="absolute right-2 flex gap-1.5 items-center">
                    <button 
                      type="button"
                      onClick={startSpeechToText}
                      className={`w-9.5 h-9.5 rounded-full flex items-center justify-center border transition-all ${
                        isListening 
                          ? "bg-red-600 border-red-500 text-white animate-pulse" 
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                      title="Speak doubt"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button 
                      type="submit"
                      disabled={!lensInputValue.trim() || loading}
                      className="w-9.5 h-9.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center hover:from-emerald-600 hover:to-teal-700 disabled:opacity-40 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
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
