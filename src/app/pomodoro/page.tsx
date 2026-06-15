"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, RotateCcw, Timer, Award, CheckCircle, 
  Sparkles, Volume2, VolumeX, Flame, Heart, Lightbulb 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TimerMode = "study" | "shortBreak" | "longBreak";

const quotes = [
  { text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell" },
  { text: "It is not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "Your talent determines what you can do. Your motivation determines how much you are willing to do.", author: "Lou Holtz" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack" },
  { text: "There are no shortcuts to any place worth going.", author: "Beverly Sills" }
];

export default function PomodoroPage() {
  const [mode, setMode] = useState<TimerMode>("study");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tickEnabled, setTickEnabled] = useState(false);
  
  // Statistics
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [breaksCompleted, setBreaksCompleted] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);

  // Quote index
  const [quoteIdx, setQuoteIdx] = useState(0);

  const timerRef = useRef<any>(null);

  // Load stats from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSessions = localStorage.getItem("edutrack_pomo_sessions") || "0";
      const storedBreaks = localStorage.getItem("edutrack_pomo_breaks") || "0";
      const storedMinutes = localStorage.getItem("edutrack_pomo_minutes") || "0";
      setSessionsCompleted(parseInt(storedSessions, 10));
      setBreaksCompleted(parseInt(storedBreaks, 10));
      setTotalFocusMinutes(parseInt(storedMinutes, 10));
    }
  }, []);

  const saveStats = (sessions: number, breaks: number, minutes: number) => {
    localStorage.setItem("edutrack_pomo_sessions", sessions.toString());
    localStorage.setItem("edutrack_pomo_breaks", breaks.toString());
    localStorage.setItem("edutrack_pomo_minutes", minutes.toString());
  };

  // Sound Synthesizers
  const playCompletionChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Play a beautiful, bright academic major triad chime (C5 -> E5 -> G5 -> C6)
      playTone(523.25, ctx.currentTime, 0.4);       // C5
      playTone(659.25, ctx.currentTime + 0.15, 0.4); // E5
      playTone(783.99, ctx.currentTime + 0.3, 0.4);  // G5
      playTone(1046.50, ctx.currentTime + 0.45, 0.6); // C6
    } catch {}
  };

  const playTickSound = () => {
    if (!soundEnabled || !tickEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  };

  // Timer loop logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleModeCompletion();
            return 0;
          }
          if (prev % 60 === 0 || prev < 10) {
            playTickSound();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, tickEnabled, soundEnabled]);

  const handleModeCompletion = () => {
    playCompletionChime();
    
    if (mode === "study") {
      const nextSessions = sessionsCompleted + 1;
      const nextMinutes = totalFocusMinutes + 25;
      setSessionsCompleted(nextSessions);
      setTotalFocusMinutes(nextMinutes);
      saveStats(nextSessions, breaksCompleted, nextMinutes);
      
      // Auto transition to short break
      setMode("shortBreak");
      setTimeLeft(5 * 60);
    } else {
      const nextBreaks = breaksCompleted + 1;
      setBreaksCompleted(nextBreaks);
      saveStats(sessionsCompleted, nextBreaks, totalFocusMinutes);
      
      // Auto transition to focus
      setMode("study");
      setTimeLeft(25 * 60);
    }
    
    // Pick a new quote on completion
    setQuoteIdx(Math.floor(Math.random() * quotes.length));
  };

  const getModeDuration = (m: TimerMode) => {
    switch (m) {
      case "study": return 25 * 60;
      case "shortBreak": return 5 * 60;
      case "longBreak": return 15 * 60;
    }
  };

  const changeMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getModeDuration(newMode));
    setQuoteIdx(Math.floor(Math.random() * quotes.length));
  };

  const toggleStart = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      setQuoteIdx(Math.floor(Math.random() * quotes.length));
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getModeDuration(mode));
  };

  // Formatter for MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Percentage for progress circle
  const maxDuration = getModeDuration(mode);
  const strokePercent = (timeLeft / maxDuration) * 100;
  const strokeDashoffset = 439.8 - (439.8 * strokePercent) / 100; // 2 * pi * r (r=70)

  return (
    <div className="space-y-8 max-w-5xl mx-auto select-none">
      
      {/* HEADER SECTION */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 pb-5">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/15">
          Productivity Booster
        </span>
        <h1 className="text-3xl font-extrabold mt-3 tracking-tight">Pomodoro Focus Timer ⏳</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-semibold text-xs">
          Stay focused for 25-minute intervals and recharge with structured breaks to optimize retention.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        
        {/* TIMER CORE UNIT (Spans 2 columns) */}
        <div className="md:col-span-2 flex flex-col items-center justify-center bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-[-40%] left-[-20%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px]" />
          
          {/* Mode Switchers */}
          <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-850 gap-1.5 mb-10 relative z-10">
            <button 
              onClick={() => changeMode("study")}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wide transition-all ${
                mode === "study"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Focus Session
            </button>
            <button 
              onClick={() => changeMode("shortBreak")}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wide transition-all ${
                mode === "shortBreak"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Short Break
            </button>
            <button 
              onClick={() => changeMode("longBreak")}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wide transition-all ${
                mode === "longBreak"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Long Break
            </button>
          </div>

          {/* Immersive Circular Timer Display */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-10">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Ring */}
              <circle
                cx="128"
                cy="128"
                r="110"
                className="stroke-slate-100 dark:stroke-slate-850"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Active Progress Ring */}
              <motion.circle
                cx="128"
                cy="128"
                r="110"
                stroke={mode === "study" ? "#4f46e5" : mode === "shortBreak" ? "#10b981" : "#2563eb"}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="691"
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.5, ease: "linear" }}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner text countdown */}
            <div className="absolute text-center flex flex-col items-center justify-center">
              <span className="text-5xl font-black font-mono tracking-tight text-slate-850 dark:text-white leading-none">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-555 mt-2.5">
                {mode === "study" ? "Focus" : "Rest & Recharge"}
              </span>
            </div>
          </div>

          {/* Core Controls Row */}
          <div className="flex items-center gap-4 relative z-10 mb-8">
            <button 
              onClick={resetTimer}
              className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 rounded-2xl transition-all active:scale-95"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button 
              onClick={toggleStart}
              className={`px-8 py-4 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 hover:scale-[1.03] ${
                mode === "study" 
                  ? "bg-indigo-650 hover:bg-indigo-700 shadow-indigo-500/10" 
                  : mode === "shortBreak" 
                  ? "bg-emerald-650 hover:bg-emerald-700 shadow-emerald-500/10" 
                  : "bg-blue-650 hover:bg-blue-700 shadow-blue-500/10"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Session</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-4 border rounded-2xl transition-all active:scale-95 ${
                soundEnabled 
                  ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-150 dark:border-indigo-900/35" 
                  : "bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-850"
              }`}
              title="Toggle Audio Cues"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* Interactive Quote Indicator */}
          <div className="w-full max-w-md text-center border-t border-slate-100 dark:border-slate-850/80 pt-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
              &ldquo;{quotes[quoteIdx].text}&rdquo;
            </p>
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-455 uppercase tracking-wide mt-2">
              — {quotes[quoteIdx].author}
            </p>
          </div>
        </div>

        {/* STATS & SETTINGS BLOCK (1 column) */}
        <div className="space-y-6">
          {/* STATS PANEL */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-[2rem] shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Award className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              Focus Metrics
            </h3>

            <div className="space-y-4">
              <div className="bg-slate-50/50 dark:bg-slate-950/35 border border-slate-150/70 dark:border-slate-850/50 p-4 rounded-2xl flex items-center gap-3.5">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-650 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-450 font-bold">Sessions Completed</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{sessionsCompleted}</p>
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-950/35 border border-slate-150/70 dark:border-slate-850/50 p-4 rounded-2xl flex items-center gap-3.5">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-650 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-450 font-bold">Breaks Completed</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{breaksCompleted}</p>
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-950/35 border border-slate-150/70 dark:border-slate-850/50 p-4 rounded-2xl flex items-center gap-3.5">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-650 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-450 font-bold">Total Focus Time</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalFocusMinutes} Mins</p>
                </div>
              </div>
            </div>
          </div>

          {/* INTERACTIVE EXTRA OPTIONS */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-[2rem] shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Lightbulb className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              Focus Enhancements
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-1">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Secondary Ticking Sound</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Tick sound every minute during study sessions</p>
                </div>
                <button
                  onClick={() => setTickEnabled(!tickEnabled)}
                  className={`w-10 h-6 rounded-full transition-all relative ${
                    tickEnabled ? "bg-indigo-650" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    tickEnabled ? "right-1" : "left-1"
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
