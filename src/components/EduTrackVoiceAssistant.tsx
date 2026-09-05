"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, MicOff, Volume2, VolumeX, Sparkles, X, 
  ArrowRight, Compass, CheckCircle2, Loader2, Radio, Headphones
} from "lucide-react";
import { cn } from "@/lib/utils";

type AssistantState = "idle" | "listening_wake" | "listening_command" | "processing" | "speaking";

export default function EduTrackVoiceAssistant() {
  const router = useRouter();
  const pathname = usePathname() || "/dashboard";

  // States
  const [handsFreeEnabled, setHandsFreeEnabled] = useState<boolean>(true);
  const [assistantState, setAssistantState] = useState<AssistantState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [interimText, setInterimText] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isOpenHUD, setIsOpenHUD] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Say 'Hey EduTrack' or 'Edu' to start");

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeWordTriggeredRef = useRef<boolean>(false);
  const stateRef = useRef<AssistantState>("idle");
  stateRef.current = assistantState;
  const startRecognitionRef = useRef<(() => void) | null>(null);

  // Web Audio Chime on wake word detection
  const playChime = useCallback((frequency = 587.33, duration = 0.15) => {
    try {
      if (typeof window === "undefined") return;
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + duration); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }, []);

  // Text-To-Speech Output
  const speakText = useCallback((text: string, onComplete?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || isMuted) {
      setAssistantState(handsFreeEnabled ? "listening_wake" : "idle");
      if (handsFreeEnabled) {
        startRecognitionRef.current?.();
      }
      if (onComplete) onComplete();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of markdown / symbols for clean pronunciation
    const cleanText = text.replace(/[*_~`#[\]]/g, "").replace(/https?:\/\/\S+/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.lang.includes("en-US") || v.lang.includes("en-IN")) && v.lang.startsWith("en")
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setAssistantState("speaking");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };

    utterance.onend = () => {
      setAssistantState(handsFreeEnabled ? "listening_wake" : "idle");
      if (handsFreeEnabled) {
        startRecognitionRef.current?.();
      }
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      setAssistantState(handsFreeEnabled ? "listening_wake" : "idle");
      if (handsFreeEnabled) {
        startRecognitionRef.current?.();
      }
      if (onComplete) onComplete();
    };

    window.speechSynthesis.speak(utterance);
  }, [isMuted, handsFreeEnabled]);

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setAssistantState(handsFreeEnabled ? "listening_wake" : "idle");
    if (handsFreeEnabled) {
      startRecognitionRef.current?.();
    }
  };

  // Process User's Voice Command
  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setAssistantState("processing");
    setStatusMessage("Thinking...");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }

    const lower = command.toLowerCase().trim();

    // Quick Local Command: Theme Toggle
    if (lower.includes("dark mode") || lower.includes("light mode") || lower.includes("toggle theme") || lower.includes("switch theme")) {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("edutrack_theme", "light");
        setAiResponse("Switched to Light mode! ☀️");
        speakText("Switched to Light mode.");
      } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("edutrack_theme", "dark");
        setAiResponse("Switched to Dark mode! 🌙");
        speakText("Switched to Dark mode.");
      }
      return;
    }

    // Quick Local Command: Stop / Quiet
    if (lower === "stop" || lower === "cancel" || lower === "quiet" || lower === "mute") {
      stopSpeaking();
      setIsOpenHUD(false);
      return;
    }

    // Server Action & Educational Q&A
    try {
      const activeCtx = typeof window !== "undefined" ? (window as any).__edutrack_active_context : null;

      const res = await fetch("/api/voice-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: command, 
          currentPath: pathname,
          activeContext: activeCtx
        })
      });

      const data = await res.json();

      if (data.displayText) {
        setAiResponse(data.displayText);
      }

      // Dispatch specific in-app actions
      if (typeof window !== "undefined" && data.actionType) {
        if (data.actionType === "ACTION_FLIP_CARD") {
          window.dispatchEvent(new CustomEvent("edutrack_action_flip_card"));
        } else if (data.actionType === "ACTION_MASTER_CARD") {
          window.dispatchEvent(new CustomEvent("edutrack_action_master_card"));
        } else if (data.actionType === "ACTION_LEARN_CARD") {
          window.dispatchEvent(new CustomEvent("edutrack_action_learning_card"));
        } else if (data.actionType === "ACTION_READ_CARD") {
          window.dispatchEvent(new CustomEvent("edutrack_action_read_card"));
        } else if (data.actionType === "ACTION_POMODORO_START") {
          window.dispatchEvent(new CustomEvent("edutrack_pomodoro_start"));
        } else if (data.actionType === "ACTION_POMODORO_PAUSE") {
          window.dispatchEvent(new CustomEvent("edutrack_pomodoro_pause"));
        } else if (data.actionType === "ACTION_POMODORO_RESET") {
          window.dispatchEvent(new CustomEvent("edutrack_pomodoro_reset"));
        } else if (data.actionType === "ACTION_POMODORO_MODE_STUDY") {
          window.dispatchEvent(new CustomEvent("edutrack_pomodoro_mode", { detail: { mode: "study" } }));
        } else if (data.actionType === "ACTION_POMODORO_MODE_SHORT") {
          window.dispatchEvent(new CustomEvent("edutrack_pomodoro_mode", { detail: { mode: "shortBreak" } }));
        } else if (data.actionType === "ACTION_POMODORO_MODE_LONG") {
          window.dispatchEvent(new CustomEvent("edutrack_pomodoro_mode", { detail: { mode: "longBreak" } }));
        }
      }

      if (data.suggestedRoute && data.suggestedRoute !== pathname) {
        router.push(data.suggestedRoute);
      }

      if (data.spokenText) {
        speakText(data.spokenText);
      } else {
        setAssistantState(handsFreeEnabled ? "listening_wake" : "idle");
        if (handsFreeEnabled) {
          startRecognition();
        }
      }
    } catch (e) {
      console.error("Voice assistant error:", e);
      const fallback = "I'm having a little trouble connecting right now, but I'm listening!";
      setAiResponse(fallback);
      speakText(fallback);
    }
  };

  // Handle Speech Recognition Result
  const handleResult = (event: any) => {
    let finalTranscript = "";
    let currentInterim = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const trans = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += trans;
      } else {
        currentInterim += trans;
      }
    }

    const fullUtterance = (finalTranscript + " " + currentInterim).trim();
    const lowerUtterance = fullUtterance.toLowerCase();

    // Check for Wake Word ("Hey EduTrack" / "EduTrack" / "OK EduTrack" / "Hi EduTrack")
    const wakeWords = [
      "hey edutrack", "edutrack", "ok edutrack", "okay edutrack", "hi edutrack", "hello edutrack", 
      "edutrac", "edu track", "hey edutracck", "edutracck", "hey edutrackk", "edutrackk",
      "hey edu", "edu", "hey ed", "ed", "hey track", "track", "headache", "eight track", "ok edu", "okay edu"
    ];
    const matchedWakeWord = wakeWords.find(w => lowerUtterance.includes(w));

    if (matchedWakeWord && !wakeWordTriggeredRef.current) {
      wakeWordTriggeredRef.current = true;
      playChime();
      setIsOpenHUD(true);
      setAssistantState("listening_command");
      setStatusMessage("I'm listening! What can I do for you?");
      setTranscript("");
      setAiResponse("");

      // Strip wake word from utterance if user said wake word + command in one breath
      const remainder = lowerUtterance.split(matchedWakeWord)[1]?.trim();
      if (remainder && remainder.length > 2) {
        setTranscript(remainder);
        setInterimText("");
        
        // Reset timer to process
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          wakeWordTriggeredRef.current = false;
          executeCommand(remainder);
        }, 1200);
      }
      return;
    }

    // If already in listening_command state
    if (wakeWordTriggeredRef.current || stateRef.current === "listening_command") {
      const activeText = finalTranscript || currentInterim;
      if (activeText) {
        setInterimText(currentInterim);
        if (finalTranscript) {
          setTranscript(prev => (prev ? prev + " " : "") + finalTranscript);
        }

        // Set silence timeout to finalize
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const finalCommand = (transcript + " " + activeText).replace(/hey edutrack|edutrack|ok edutrack/gi, "").trim();
          wakeWordTriggeredRef.current = false;
          if (finalCommand) {
            executeCommand(finalCommand);
          } else {
            setAssistantState(handsFreeEnabled ? "listening_wake" : "idle");
          }
        }, 1400);
      }
    }
  };

  // Start Recognition Service
  const startRecognition = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onstart = () => {
      isListeningRef.current = true;
      if (stateRef.current !== "listening_command" && stateRef.current !== "processing" && stateRef.current !== "speaking") {
        setAssistantState("listening_wake");
        setStatusMessage("Listening for 'Hey EduTrack' or 'Edu'...");
      }
    };

    recog.onresult = handleResult;

    recog.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        console.warn("Speech recognition error:", event.error);
      }
    };

    recog.onend = () => {
      isListeningRef.current = false;
      // Auto-restart continuous listening if hands-free is enabled and not explicitly stopped
      if (handsFreeEnabled && stateRef.current !== "processing" && stateRef.current !== "speaking" && stateRef.current !== "listening_command") {
        setTimeout(() => {
          try {
            if (!isListeningRef.current) {
              recog.start();
            }
          } catch (_) {}
        }, 300);
      } else if (stateRef.current !== "processing" && stateRef.current !== "speaking") {
        setAssistantState("idle");
      }
    };

    try {
      recog.start();
      recognitionRef.current = recog;
    } catch (e) {
      console.warn("Could not start recognition:", e);
    }
  }, [handsFreeEnabled]);
  startRecognitionRef.current = startRecognition;

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    isListeningRef.current = false;
    setAssistantState("idle");
  }, []);

  // Hands-free Toggle
  const toggleHandsFree = () => {
    const nextState = !handsFreeEnabled;
    setHandsFreeEnabled(nextState);
    localStorage.setItem("edutrack_hands_free", String(nextState));

    if (nextState) {
      playChime(659.25, 0.2);
      startRecognition();
      setIsOpenHUD(true);
      setStatusMessage("Hands-free active! Say 'Hey EduTrack' or 'Edu' anytime.");
      speakText("Hands free mode is now active. Just call out Hey EduTrack or simply Edu whenever you need me!");
    } else {
      stopRecognition();
      stopSpeaking();
      setIsOpenHUD(false);
    }
  };

  // Manual Trigger (Clicking Voice Assistant Button)
  const handleManualActivate = () => {
    setIsOpenHUD(true);
    wakeWordTriggeredRef.current = true;
    playChime();
    setAssistantState("listening_command");
    setStatusMessage("I'm listening! Ask a doubt or tell me where to go...");
    setTranscript("");
    setAiResponse("");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    if (!isListeningRef.current) {
      startRecognition();
    }
  };

  // Keyboard shortcut: Alt + V to trigger voice assistant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "v" || e.key === "V")) {
        e.preventDefault();
        handleManualActivate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Restore saved hands-free preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("edutrack_hands_free");
      if (saved !== "false") {
        setHandsFreeEnabled(true);
        // Delay slight start to avoid autoplay mic block
        const timer = setTimeout(() => {
          startRecognition();
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setHandsFreeEnabled(false);
      }
    }
  }, [startRecognition]);

  return (
    <>
      {/* ── TOP-RIGHT / SIDEBAR FLOATING VOICE PILL ── */}
      <div className="fixed top-14 right-4 sm:top-4 sm:right-24 z-[130] flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleManualActivate}
          title="Activate EduTrack Voice Assistant (Alt + V)"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md backdrop-blur-md border",
            assistantState === "listening_command" || assistantState === "speaking"
              ? "bg-indigo-600 text-white border-indigo-400 animate-pulse shadow-indigo-500/30"
              : handsFreeEnabled
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-white/80 dark:bg-[#0c1024]/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-indigo-500/40"
          )}
        >
          <div className="relative">
            {assistantState === "listening_command" ? (
              <Radio className="w-3.5 h-3.5 text-white animate-spin" />
            ) : assistantState === "speaking" ? (
              <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" />
            ) : (
              <Mic className={cn("w-3.5 h-3.5", handsFreeEnabled ? "text-emerald-500" : "text-indigo-500")} />
            )}
            {handsFreeEnabled && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="hidden sm:inline">
            {assistantState === "listening_command" 
              ? "Listening..." 
              : assistantState === "speaking" 
                ? "Speaking..." 
                : handsFreeEnabled 
                  ? "Hey EduTrack (Active)" 
                  : "Voice Assist"}
          </span>
        </motion.button>
      </div>

      {/* ── EXPANDED VOICE HUD OVERLAY ── */}
      <AnimatePresence>
        {isOpenHUD && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-6 right-4 sm:right-8 z-[140] w-[92vw] sm:w-[420px] bg-white dark:bg-[#070a1e] border-2 border-indigo-500/30 rounded-3xl shadow-[0_20px_60px_rgba(99,102,241,0.25)] overflow-hidden flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-wide flex items-center gap-1.5">
                    EduTrack Voice AI
                    {handsFreeEnabled && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 font-bold uppercase tracking-wider">
                        Wake Word ON
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-indigo-100/90 font-medium">
                    Call out <span className="underline font-bold">"Hey EduTrack"</span> or <span className="underline font-bold">"Edu"</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsMuted(prev => !prev)}
                  title={isMuted ? "Unmute Voice" : "Mute Voice"}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    stopSpeaking();
                    setIsOpenHUD(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Glowing Orb & Waveform Center */}
            <div className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden bg-slate-50/50 dark:bg-black/20">
              {/* Background ambient glow */}
              <div className="absolute w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Pulsing AI Orb */}
              <div className="relative mb-4">
                <motion.div
                  animate={{
                    scale: assistantState === "listening_command" ? [1, 1.2, 1] : assistantState === "speaking" ? [1, 1.15, 1.05, 1.18, 1] : 1,
                    rotate: assistantState === "processing" ? 360 : 0
                  }}
                  transition={{
                    duration: assistantState === "processing" ? 2 : 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  onClick={handleManualActivate}
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center cursor-pointer shadow-xl transition-all border-4",
                    assistantState === "listening_command"
                      ? "bg-gradient-to-tr from-rose-500 to-indigo-600 border-rose-300 text-white shadow-rose-500/40"
                      : assistantState === "speaking"
                        ? "bg-gradient-to-tr from-emerald-500 to-indigo-600 border-emerald-300 text-white shadow-emerald-500/40"
                        : assistantState === "processing"
                          ? "bg-gradient-to-tr from-amber-500 to-indigo-600 border-amber-300 text-white shadow-amber-500/40"
                          : "bg-gradient-to-tr from-indigo-500 to-purple-600 border-indigo-300/40 text-white shadow-indigo-500/30"
                  )}
                >
                  {assistantState === "processing" ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : assistantState === "speaking" ? (
                    <Volume2 className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </motion.div>

                {/* Animated Ring waves when active */}
                {(assistantState === "listening_command" || assistantState === "speaking") && (
                  <motion.div
                    animate={{ scale: [1, 1.6, 2], opacity: [0.8, 0.4, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border-2 border-indigo-400 pointer-events-none"
                  />
                )}
              </div>

              {/* Status Message */}
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                {statusMessage}
              </p>

              {/* Live Transcript / Subtitles Box */}
              <div className="w-full min-h-[54px] max-h-[110px] overflow-y-auto px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-center">
                {transcript || interimText ? (
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    "{transcript} <span className="text-indigo-500 italic">{interimText}</span>"
                  </p>
                ) : aiResponse ? (
                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                    {aiResponse}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                    Say <span className="font-bold text-indigo-500">"Open Flashcards"</span>, <span className="font-bold text-indigo-500">"Take me to Feynman Lab"</span>, or ask any concept doubt!
                  </p>
                )}
              </div>
            </div>

            {/* Quick Action Suggestions */}
            <div className="px-4 py-2.5 bg-slate-100/80 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 shrink-0 mr-1">
                Try saying:
              </span>
              {[
                "Open Flashcards",
                "Feynman Lab",
                "Simulations Lab",
                "Explain Snell's law",
                "Toggle Dark Mode"
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => executeCommand(cmd)}
                  className="whitespace-nowrap text-[11px] font-bold px-2.5 py-1 bg-white dark:bg-indigo-950/40 border border-slate-200 dark:border-indigo-400/20 rounded-lg text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/60 transition-colors shadow-xs"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Bottom Footer & Accessibility Toggle */}
            <div className="p-3.5 bg-white dark:bg-[#050716] border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={handsFreeEnabled}
                  onChange={toggleHandsFree}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500 relative" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Always-On Wake Word
                </span>
              </label>

              {assistantState === "speaking" ? (
                <button
                  onClick={stopSpeaking}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center gap-1"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  Stop Voice
                </button>
              ) : (
                <button
                  onClick={handleManualActivate}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-sm"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Tap to Speak
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
