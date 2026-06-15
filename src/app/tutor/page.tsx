"use client";

import React, { useState, useRef } from "react";
import { 
  Home, Camera, Upload, Sparkles, MessageSquare, ArrowRight, 
  Scan, Zap, Bot, User, Check, Loader2, Mic, Volume2, 
  VolumeX, FileText, Share2, Copy 
} from "lucide-react";
import Link from "next/link";

export default function TutorPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string; imagePreview?: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingMsg, setActiveSpeakingMsg] = useState<number | null>(null);

  // Conclusion/Summary States
  const [conclusion, setConclusion] = useState<string | null>(null);
  const [generatingConclusion, setGeneratingConclusion] = useState(false);

  // Convert uploaded image file to Base64 data URL
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const startSpeechToText = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Browser speech recognition not supported in this browser. Try Chrome/Edge!");
        return;
      }
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-IN"; // English (India) works great for Hinglish queries!

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => (prev ? prev + " " + transcript : transcript));
      };

      rec.start();
    }
  };

  const speakText = (text: string, index: number) => {
    if (typeof window !== "undefined") {
      if (activeSpeakingMsg === index) {
        window.speechSynthesis.cancel();
        setActiveSpeakingMsg(null);
        return;
      }
      
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select natural sounding Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("hi-IN"));
      if (voice) utterance.voice = voice;
      
      utterance.onend = () => setActiveSpeakingMsg(null);
      utterance.onerror = () => setActiveSpeakingMsg(null);

      setActiveSpeakingMsg(index);
      window.speechSynthesis.speak(utterance);
    }
  };

  const quickChips = [
    { label: "Refraction of Light (Hindi)", query: "Can you explain refraction of light in a glass slab in easy Hinglish?" },
    { label: "Quadratic Equations", query: "Explain how to solve the quadratic equation 2x² - 5x + 3 = 0 step-by-step?" },
    { label: "Mnemonic for Reactivity", query: "What is a simple mnemonic to remember the metal reactivity series for CBSE Class 10?" },
    { label: "Photosynthesis Process", query: "Explain the light and dark reactions of photosynthesis in simple terms." }
  ];

  const handleChipClick = (query: string) => {
    setChatStarted(true);
    setConclusion(null);
    setMessages([
      { role: "user", content: query },
      { role: "ai", content: "Step 1: Sure! Let's break this down. First, let's look at the core concept...\n\nWhen we study this in **NCERT Class 10**, we learn that the fundamental rule involves breaking the equation down step-by-step. Let's make sure we write down our formulas clearly.\n\n* **Main Concept**: Solving quadratic formulas using the discriminant method.\n* **Important Step**: Calculate D = b² - 4ac first to verify real roots exist.\n* **Encouragement**: Practice makes perfect, don't worry!" }
    ]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setImage(base64);
      } catch (err) {
        console.error("Error reading uploaded file:", err);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const base64 = await fileToBase64(file);
        setImage(base64);
      } catch (err) {
        console.error("Error reading dropped file:", err);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const [loading, setLoading] = useState(false);

  const startScan = async () => {
    if (!image || isScanning) return;
    setIsScanning(true);
    setChatStarted(true);
    setConclusion(null);
    setMessages([
      { role: "user", content: "Uploaded a homework image for analysis.", imagePreview: image }
    ]);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "Please analyze this homework image, extract the text or question, and explain how to solve it step-by-step.",
              attachments: [
                {
                  type: "image/jpeg",
                  data: image,
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
        setMessages([
          { role: "user", content: "Uploaded a homework image for analysis.", imagePreview: image },
          { role: "ai", content: data.reply }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "ai", content: "Failed to analyze the image. Please check your API key or image size." }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: "ai", content: "Failed to connect to the doubt solver. Please check your connection." }
      ]);
    } finally {
      setIsScanning(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;
    
    const userMessage = { role: "user" as const, content: inputValue };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setLoading(true);
    setConclusion(null); // Reset conclusion on follow-up question
    
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
      if (data.reply) {
        setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error while thinking. Please try again." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "ai", content: "Could not connect to the AI tutor. Please check your internet connection." }]);
    } finally {
      setLoading(false);
    }
  };

  // Generate Conclusion / Study Summary
  const generateConclusion = async () => {
    if (messages.length === 0 || generatingConclusion) return;
    setGeneratingConclusion(true);

    const summaryPrompt = {
      role: "user" as const,
      content: "Thank you for the explanations. Now, please generate a structured, encouraging study session conclusion and summary. Include: 1. Main Concepts Explored, 2. Important Formulas/Definitions, 3. Practical takeaways. Keep it clear, concise, and structured. Use bullet points."
    };

    try {
      const apiMessages = [...messages, summaryPrompt].map(m => ({
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
      if (data.reply) {
        setConclusion(data.reply);
      } else {
        alert("Could not generate summary conclusion. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect. Please check your network.");
    } finally {
      setGeneratingConclusion(false);
    }
  };

  // Helper to sanitize LaTeX math strings for clean rendering in Cambria/Georgia serif font
  const cleanMathLaTeX = (mathStr: string): string => {
    let s = mathStr;
    
    // Replace fractions: \frac{a}{b} -> (a)/(b)
    s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)");
    
    // Replace square root: \sqrt{x} -> √x
    s = s.replace(/\\sqrt\{([^}]+)\}/g, "√$1");
    s = s.replace(/\\sqrt\s*([a-zA-Z0-9])/g, "√$1");
    
    // Replace powers: ^2 -> ², ^3 -> ³
    s = s.replace(/\^2/g, "²");
    s = s.replace(/\^3/g, "³");
    s = s.replace(/\^([a-zA-Z0-9\+\-]+)/g, "<sup>$1</sup>");
    
    // Replace subscript: _i -> ᵢ, _0 -> ₀
    s = s.replace(/_([a-zA-Z0-9\+\-]+)/g, "<sub>$1</sub>");
    
    // Replace other common latex symbols
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
    s = s.replace(/\\mathbb\{Z\}/g, "ℤ");
    s = s.replace(/\\mathbb\{R\}/g, "ℝ");
    s = s.replace(/\\mathbb\{N\}/g, "ℕ");
    
    return s;
  };

  // Custom text formatter to render markdown headers, bold, LaTeX math ($), and lists in premium styling
  const formatMessageContent = (text: string) => {
    if (!text) return "";
    const lines = text.split("\n");
    
    return lines.map((line, idx) => {
      // 1. Check for block math (e.g. $$equation$$)
      const isBlockMath = line.trim().startsWith("$$") && line.trim().endsWith("$$");
      if (isBlockMath) {
        const mathText = line.trim().slice(2, -2);
        const cleaned = cleanMathLaTeX(mathText);
        return (
          <div 
            key={idx} 
            className="flex justify-center my-4 p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl font-serif italic text-base text-indigo-300 tracking-widest font-bold select-all"
            dangerouslySetInnerHTML={{ __html: cleaned }}
          />
        );
      }

      // Helper function to format inline math blocks
      const formatMathInline = (mathText: string, keyIdx: number) => {
        const cleaned = cleanMathLaTeX(mathText);
        return (
          <span 
            key={`math-${keyIdx}`}
            className="font-serif italic text-indigo-300 dark:text-indigo-400 font-bold text-sm tracking-wide bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/15 inline-block mx-0.5 select-all"
            dangerouslySetInnerHTML={{ __html: cleaned }}
          />
        );
      };

      // Helper to format bold text and normal text
      const formatBoldAndPlain = (plainText: string, keyIdx: number) => {
        const parts = plainText.split(/\*\*/g);
        return (
          <React.Fragment key={`plain-${keyIdx}`}>
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold text-white">{part}</strong> : part)}
          </React.Fragment>
        );
      };

      // Parse a mix of inline math ($...$) and text
      const parseMix = (mixText: string) => {
        const parts = mixText.split("$");
        return parts.map((part, i) => {
          if (i % 2 === 1) {
            return formatMathInline(part, i);
          }
          return formatBoldAndPlain(part, i);
        });
      };

      // 2. Check if it's a heading (e.g. ## Step 1)
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
            <h2 key={idx} className="text-base font-extrabold text-white mt-5 mb-2 tracking-tight bg-gradient-to-r from-emerald-400 via-teal-350 to-indigo-455 bg-clip-text text-transparent flex items-center gap-2">
              {headingContent}
            </h2>
          );
        } else {
          return (
            <h3 key={idx} className="text-sm font-extrabold text-white mt-3 mb-1.5 tracking-tight">
              {headingContent}
            </h3>
          );
        }
      }

      // 3. Check list items
      const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");
      const isNumbered = /^\d+\.\s/.test(line.trim());

      if (isBullet) {
        const cleanLine = line.trim().substring(2);
        const bulletContent = parseMix(cleanLine);
        return (
          <div key={idx} className="flex items-start gap-2.5 ml-2.5 my-1.5 select-text">
            <span className="text-emerald-400 mt-1.5 text-xs">•</span>
            <span className="text-slate-350 dark:text-slate-250 text-sm font-medium leading-relaxed">{bulletContent}</span>
          </div>
        );
      }

      if (isNumbered) {
        const numMatch = line.trim().match(/^(\d+\.)\s(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const cleanLine = numMatch[2];
          const numContent = parseMix(cleanLine);
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-2.5 my-1.5 select-text">
              <span className="text-emerald-400 font-bold mt-0.5 text-sm">{num}</span>
              <span className="text-slate-350 dark:text-slate-250 text-sm font-medium leading-relaxed">{numContent}</span>
            </div>
          );
        }
      }

      // 4. Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2.5" />;
      }

      // 5. Plain line
      return (
        <p key={idx} className="text-slate-350 dark:text-slate-250 text-sm font-medium mb-2.5 last:mb-0 leading-relaxed select-text">
          {parseMix(line)}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#060814] text-slate-200 font-sans p-6 relative overflow-hidden">
      {/* Glowing Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="max-w-5xl mx-auto flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/20 p-3.5 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
            <Scan className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-350 to-cyan-400 tracking-tight">
              AI Doubt-Solver Lens 🔍
            </h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              Snap a photo of your homework to get step-by-step explanations instantly.
            </p>
          </div>
        </div>
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md hover:bg-indigo-650/20 text-slate-350 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/30 px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side: Upload / Scanner */}
        <div className="flex flex-col gap-6">
          <div 
            className={`relative bg-slate-900/40 backdrop-blur-3xl border-2 border-dashed ${
              image ? "border-emerald-500/40" : "border-slate-800 hover:border-emerald-500/50"
            } rounded-[2.5rem] p-3 aspect-[4/3] flex flex-col items-center justify-center overflow-hidden transition-all group`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {image ? (
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-inner">
                <img src={image} alt="Uploaded homework" className="w-full h-full object-cover" />
                {isScanning && (
                  <>
                    <div className="absolute inset-0 bg-emerald-500/10" />
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_20px_#34d399] animate-scan" />
                  </>
                )}
                {!isScanning && !chatStarted && (
                  <button 
                    onClick={startScan}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-2xl hover:scale-105 active:scale-98 transition-all duration-300 border border-emerald-400/25"
                  >
                    <Zap className="w-4.5 h-4.5 fill-current" /> Analyze Question
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center p-8 select-none">
                <div className="w-20 h-20 bg-slate-805/40 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800/80 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Drag & Drop Image</h3>
                <p className="text-slate-500 text-xs font-semibold mb-6">or click the button below to browse</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-800/60 hover:bg-slate-700/60 text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-colors border border-slate-700 mx-auto active:scale-95"
                >
                  <Upload className="w-4 h-4" /> Select File
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            )}
          </div>

          <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800/60 rounded-[2.5rem] p-6 shadow-xl">
            <h3 className="text-xs font-extrabold text-slate-350 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-400" /> How it works
            </h3>
            <ul className="space-y-3.5">
              {[
                "Take a clear photo of one doubt or question at a time.",
                "Our AI extracts text and analyzes complex diagrams instantly.",
                "Get a step-by-step breakdown helper that explains the core concepts."
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

        {/* Right Side: Chat Canvas */}
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800/60 rounded-[2.5rem] overflow-hidden flex flex-col h-[650px] shadow-2xl relative">
          {!chatStarted ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10 select-none">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                <MessageSquare className="w-16 h-16 text-slate-700 animate-bounce relative z-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-350 mb-2">Interactive AI Canvas</h2>
              <p className="text-slate-500 text-xs font-semibold mb-6 max-w-sm">Upload an image and click analyze, or click a quick-chip below to start instantly.</p>
              
              {isScanning ? (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <span className="text-emerald-400 font-extrabold text-xs tracking-widest uppercase animate-pulse">Running Optical Character Recognition...</span>
                </div>
              ) : (
                <div className="w-full max-w-md mt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 text-left pl-1">Frequently Asked Doubts</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChipClick(chip.query)}
                        className="px-4 py-2 bg-slate-950/40 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 rounded-2xl text-xs font-bold transition-all text-left flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
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
              <div className="bg-slate-800/80 p-4 flex items-center justify-between border-b border-slate-700 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 p-2 rounded-xl">
                    <Bot className="w-5 h-5 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Professor AI</h3>
                    <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Online</p>
                  </div>
                </div>
                {messages.length > 0 && !conclusion && (
                  <button
                    onClick={generateConclusion}
                    disabled={generatingConclusion}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {generatingConclusion ? (
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
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                      msg.role === "ai" ? "bg-emerald-900/50 text-emerald-400" : "bg-indigo-900/50 text-indigo-400"
                    }`}>
                      {msg.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="relative group max-w-[85%]">
                      {/* Image Preview within Bubble if uploaded */}
                      {msg.imagePreview && (
                        <div className="mb-2.5 rounded-2xl overflow-hidden max-w-[200px] border border-white/10 shadow-md">
                          <img src={msg.imagePreview} alt="Homework Attachment" className="w-full h-auto object-cover" />
                        </div>
                      )}
                      
                      <div className={`p-4.5 rounded-2xl shadow-md border leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-gradient-to-br from-indigo-500 to-indigo-650 text-white rounded-tr-none border-indigo-400/20" 
                          : "bg-[#0e1227]/60 backdrop-blur-md text-slate-200 rounded-tl-none border-slate-800/80"
                      }`}>
                        {msg.role === "user" ? (
                          <p className="text-sm font-semibold select-text">{msg.content}</p>
                        ) : (
                          <div className="space-y-1">
                            {formatMessageContent(msg.content)}
                          </div>
                        )}
                      </div>
                      
                      {msg.role === "ai" && (
                        <button
                          onClick={() => speakText(msg.content, i)}
                          className="absolute -right-10 top-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Read aloud"
                        >
                          {activeSpeakingMsg === i ? (
                            <VolumeX className="w-3.5 h-3.5 text-red-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* STUDY SESSION CONCLUSION CARD */}
                {conclusion && (
                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden my-6 border-l-4">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <h4 className="font-extrabold text-sm text-emerald-300 uppercase tracking-widest">Study Session Summary</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(conclusion);
                          alert("Summary copied to clipboard!");
                        }}
                        className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Summary</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formatMessageContent(conclusion)}
                    </div>
                    {/* Foot marker */}
                    <div className="text-[8px] font-black tracking-widest text-emerald-500/40 uppercase text-right leading-none select-none mt-4">
                      Published Study Session Conclusion
                    </div>
                  </div>
                )}

                {/* Typing Indicator */}
                {loading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-[#0e1227]/60 backdrop-blur-md rounded-2xl rounded-tl-none border border-slate-800/80 px-5 py-4 flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-slate-800/30 border-t border-slate-800/60 backdrop-blur-md">
                <form onSubmit={sendMessage} className="relative flex items-center">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isListening ? "Listening closely..." : "Ask a follow-up question..."}
                    className={`w-full bg-slate-950/80 border ${
                      isListening ? "border-red-500/50 focus:ring-red-500" : "border-slate-800 focus:border-emerald-500/60 focus:ring-emerald-500/40"
                    } rounded-full pl-5 pr-26 py-4 text-sm focus:outline-none focus:ring-1 text-slate-200 placeholder:text-slate-500 transition-all font-semibold`}
                  />
                  <div className="absolute right-2 flex gap-1.5 items-center">
                    <button 
                      type="button"
                      onClick={startSpeechToText}
                      className={`w-9.5 h-9.5 rounded-full flex items-center justify-center border transition-all ${
                        isListening 
                          ? "bg-red-650 border-red-500 text-white animate-pulse" 
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                      title="Speak doubt"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button 
                      type="submit"
                      disabled={!inputValue.trim() || loading}
                      className="w-9.5 h-9.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition-colors shadow-md shadow-emerald-500/10 active:scale-95"
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
      </main>
      
      {/* Scanning Animation Styles */}
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
