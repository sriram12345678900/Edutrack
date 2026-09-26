"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, BellOff, Clock, AlarmClock, Plus, Trash2, CheckCircle2, 
  XCircle, Sparkles, Volume2, VolumeX, ArrowLeft, Zap, Trophy,
  AlertTriangle, RotateCcw, Brain, ShieldAlert, BookOpen, Coffee
} from "lucide-react";
import Confetti from "@/components/Confetti";
import { awardUserXP } from "@/lib/xp";
import { AlarmMCQ, getRandomAlarmQuestion } from "@/lib/alarmQuestions";

interface SavedAlarm {
  id: string;
  timeStr: string; // "06:30"
  label: string;
  subject: string;
  enabled: boolean;
  repeatDaily: boolean;
}

export default function AlarmPage() {
  // Current Live Clock State
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  
  // Alarms State
  const [alarms, setAlarms] = useState<SavedAlarm[]>([]);
  const [newTime, setNewTime] = useState("06:00");
  const [newLabel, setNewLabel] = useState("Morning Revision Routine");
  const [newSubject, setNewSubject] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Active Ringing State
  const [isRinging, setIsRinging] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<AlarmMCQ | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [isAnsweredCorrect, setIsAnsweredCorrect] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [wrongStreak, setWrongStreak] = useState(0);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  // Initialize clock ticker
  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check if any alarm should trigger
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMins = String(now.getMinutes()).padStart(2, "0");
      const currentSecs = now.getSeconds();
      const timeMatch = `${currentHours}:${currentMins}`;

      if (currentSecs === 0) {
        setAlarms((prev) => {
          const hit = prev.find((a) => a.enabled && a.timeStr === timeMatch);
          if (hit) {
            triggerAlarmRinging(hit);
          }
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Load saved alarms
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("edutrack_study_alarms");
      if (saved) {
        try {
          setAlarms(JSON.parse(saved));
        } catch (_) {}
      } else {
        const defaults: SavedAlarm[] = [
          { id: "default-1", timeStr: "05:30", label: "Early Bird Formula Revision", subject: "Mathematics", enabled: true, repeatDaily: true },
          { id: "default-2", timeStr: "06:30", label: "NCERT Science Wake-Up", subject: "Science", enabled: false, repeatDaily: true }
        ];
        setAlarms(defaults);
        localStorage.setItem("edutrack_study_alarms", JSON.stringify(defaults));
      }
    }
  }, []);

  const saveAlarms = (updated: SavedAlarm[]) => {
    setAlarms(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("edutrack_study_alarms", JSON.stringify(updated));
    }
  };

  // ── WEB AUDIO SYNTHESIZER FOR EMERGENCY STUDY ALARM ──
  const getAudioContext = () => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTone = (freq: number, duration: number, type: OscillatorType = "sine") => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  const startAlarmAudio = () => {
    stopAlarmAudio();
    let toggle = false;
    sirenIntervalRef.current = setInterval(() => {
      toggle = !toggle;
      playTone(toggle ? 880 : 660, 0.28, "triangle");
    }, 350);
  };

  const stopAlarmAudio = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
  };

  const playErrorBuzzer = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (_) {}
  };

  const playVictoryChime = () => {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.4, "sine"), idx * 120);
    });
  };

  // ── TRIGGER RINGING ──
  const triggerAlarmRinging = (alarm?: SavedAlarm) => {
    const question = getRandomAlarmQuestion(alarm?.subject);
    setCurrentChallenge(question);
    setSelectedOption(null);
    setIsAnsweredCorrect(false);
    setIsRinging(true);
    setWrongStreak(0);
    startAlarmAudio();
  };

  const handleOptionSelect = (index: number) => {
    if (!currentChallenge || isAnsweredCorrect) return;
    setSelectedOption(index);

    if (index === currentChallenge.correctIndex) {
      // ── CORRECT ANSWER: DISMISS ALARM! ──
      stopAlarmAudio();
      playVictoryChime();
      setIsAnsweredCorrect(true);
      setConfettiActive(true);
      awardUserXP(25);

      setTimeout(() => {
        setIsRinging(false);
        setConfettiActive(false);
      }, 3200);
    } else {
      // ── WRONG ANSWER: BUZZ & REGENERATE QUESTION! ──
      playErrorBuzzer();
      setShake(true);
      setWrongStreak((prev) => prev + 1);
      setTimeout(() => setShake(false), 500);

      // Load another fresh question so student cannot just brute-force
      setTimeout(() => {
        setCurrentChallenge(getRandomAlarmQuestion());
        setSelectedOption(null);
      }, 650);
    }
  };

  // Quick Power-Nap Timer (+X minutes)
  const setQuickNap = (minutes: number) => {
    const target = new Date(Date.now() + minutes * 60 * 1000);
    const hrs = String(target.getHours()).padStart(2, "0");
    const mins = String(target.getMinutes()).padStart(2, "0");
    const napAlarm: SavedAlarm = {
      id: `nap-${Date.now()}`,
      timeStr: `${hrs}:${mins}`,
      label: `Power Nap (${minutes}m)`,
      subject: "all",
      enabled: true,
      repeatDaily: false
    };
    saveAlarms([napAlarm, ...alarms]);
    alert(`Power-nap alarm set for ${hrs}:${mins}! Ringing will require an MCQ solution.`);
  };

  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;
    const newAlarmItem: SavedAlarm = {
      id: `alarm-${Date.now()}`,
      timeStr: newTime,
      label: newLabel.trim() || "Study Alarm",
      subject: newSubject,
      enabled: true,
      repeatDaily: true
    };
    saveAlarms([...alarms, newAlarmItem]);
    setShowAddModal(false);
  };

  const toggleAlarm = (id: string) => {
    saveAlarms(alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  };

  const deleteAlarm = (id: string) => {
    saveAlarms(alarms.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 sm:p-8 relative overflow-x-hidden selection:bg-amber-500/30">
      <Confetti active={confettiActive} />

      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="flex items-center gap-3.5">
            <Link
              href="/dashboard"
              className="p-2.5 rounded-2xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 shadow-sm"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 text-slate-900 dark:text-white">
                <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20">
                  <AlarmClock className="w-6 h-6" />
                </span>
                Smart Study Alarm Clock
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Rings loudly until you solve an academic syllabus MCQ. No snooze cheating.
              </p>
            </div>
          </div>

          {/* Action Buttons: Test Now & Add Alarm */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => triggerAlarmRinging()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-500/10 dark:bg-gradient-to-r dark:from-red-600/30 dark:to-amber-600/30 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-amber-300 font-black text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              <Bell className="w-4 h-4 animate-bounce text-red-500 dark:text-amber-400" />
              <span>Test Alarm & MCQ</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all border border-white/10"
            >
              <Plus className="w-4 h-4" />
              <span>Set Alarm</span>
            </motion.button>
          </div>
        </header>

        {/* ── LIVE DIGITAL CYBER-ACADEMIC CLOCK ── */}
        <div className="p-8 sm:p-12 rounded-[2.5rem] bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-xl text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.06),transparent_70%)] pointer-events-none" />
          
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-inner mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Live Synced Clock
          </span>

          <div className="font-mono text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:via-slate-100 dark:to-slate-300 drop-shadow-sm dark:drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
            {currentTime ? (
              <>
                <span>{String(currentTime.getHours()).padStart(2, "0")}</span>
                <span className="text-amber-500 animate-pulse">:</span>
                <span>{String(currentTime.getMinutes()).padStart(2, "0")}</span>
                <span className="text-slate-400 dark:text-slate-600 text-3xl sm:text-5xl ml-2 font-bold">
                  :{String(currentTime.getSeconds()).padStart(2, "0")}
                </span>
              </>
            ) : (
              "00:00:00"
            )}
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-3">
            {currentTime?.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>

          {/* Quick Power-Nap Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-amber-500" /> Power-Nap Presets:
            </span>
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => setQuickNap(mins)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-amber-500/20 hover:border-amber-500/40 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 transition-all active:scale-95 shadow-sm"
              >
                +{mins} Min
              </button>
            ))}
          </div>
        </div>

        {/* ── SCHEDULED ALARMS GRID ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
              <Clock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Scheduled Study Alarms ({alarms.length})
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {alarms.filter((a) => a.enabled).length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alarms.map((alarm) => (
              <motion.div
                key={alarm.id}
                layout
                whileHover={{ y: -3 }}
                className={`p-6 rounded-3xl border transition-all flex items-center justify-between gap-4 backdrop-blur-xl ${
                  alarm.enabled
                    ? "bg-white dark:bg-slate-900/80 border-amber-500/30 shadow-lg shadow-amber-500/5"
                    : "bg-white/50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-colors ${
                      alarm.enabled
                        ? "bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    <AlarmClock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        {alarm.timeStr}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                        {alarm.subject}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 truncate max-w-[200px] sm:max-w-[240px]">
                      {alarm.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleAlarm(alarm.id)}
                    className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                      alarm.enabled ? "bg-amber-500 justify-end shadow-md shadow-amber-500/30" : "bg-slate-200 dark:bg-slate-800 justify-start"
                    }`}
                    title={alarm.enabled ? "Disable Alarm" : "Enable Alarm"}
                  >
                    <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>

                  <button
                    onClick={() => deleteAlarm(alarm.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete Alarm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {alarms.length === 0 && (
              <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl text-slate-400 space-y-3">
                <AlarmClock className="w-10 h-10 mx-auto opacity-30 text-amber-500" />
                <p className="text-sm font-semibold">No alarms scheduled yet.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Create your first wake-up routine →
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── ADD ALARM MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 sm:p-8 rounded-[2rem] max-w-md w-full shadow-2xl space-y-6 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <AlarmClock className="w-5 h-5 text-amber-500" /> Set Study Alarm
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddAlarm} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">
                    Alarm Time (24h)
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-2xl font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">
                    Routine / Label
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g. Morning Board Exam Math Drill"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">
                    Wake-Up MCQ Subject
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                  >
                    <option value="all">🎲 Surprise Mixed (All Subjects)</option>
                    <option value="Mathematics">📐 Mathematics (Algebra / Geometry / AP)</option>
                    <option value="Science">🧬 Science (Physics / Chemistry / Biology)</option>
                    <option value="Social Science">🏛️ Social Science (History / Civics / Geo)</option>
                    <option value="English">📖 English Grammar & Vocabulary</option>
                  </select>
                </div>

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 transition-all"
                  >
                    Confirm & Save Alarm
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EMERGENCY RINGING & MCQ LOCK SCREEN MODAL ── */}
      <AnimatePresence>
        {isRinging && currentChallenge && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
            {/* Animated Emergency Beacon Background */}
            <div className="absolute inset-0 bg-red-600/15 animate-pulse pointer-events-none" />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={
                shake
                  ? { scale: 1, opacity: 1, x: [-15, 15, -15, 15, 0] }
                  : { scale: 1, opacity: 1, x: 0 }
              }
              transition={{ duration: 0.35 }}
              className={`max-w-xl w-full p-6 sm:p-8 rounded-[2.5rem] border shadow-2xl relative z-10 transition-colors ${
                isAnsweredCorrect
                  ? "bg-slate-900/95 border-emerald-500 shadow-emerald-500/30"
                  : "bg-slate-900/95 border-red-500/60 shadow-red-500/30"
              }`}
            >
              {/* Header Badge */}
              <div className="text-center space-y-2 mb-6">
                <motion.div
                  animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                  transition={{ duration: 0.5, repeat: isAnsweredCorrect ? 0 : Infinity }}
                  className="w-16 h-16 mx-auto rounded-3xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-lg shadow-red-500/20 mb-3"
                >
                  <Bell className="w-8 h-8 animate-bounce" />
                </motion.div>

                {isAnsweredCorrect ? (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-black text-emerald-400">
                      🎉 Challenge Solved! Alarm Off
                    </h2>
                    <p className="text-xs text-emerald-300 font-bold">
                      +25 XP Awarded! Your brain is officially awake and ready to study.
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full">
                      ⚠️ Alarm Ringing &bull; Solve MCQ to Turn Off
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Wake Up Scholar! Answer Correctly:
                    </h2>
                    {wrongStreak > 0 && (
                      <p className="text-xs text-red-400 font-extrabold animate-pulse">
                        Incorrect answer! Question refreshed. Read carefully!
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* The MCQ Challenge Card */}
              <div className="bg-slate-950/80 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-inner">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {currentChallenge.subject} &bull; {currentChallenge.topic}
                  </span>
                  <span className="text-[10px] font-black uppercase text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                    +25 XP Reward
                  </span>
                </div>

                <p className="text-base sm:text-lg font-bold text-white leading-snug">
                  {currentChallenge.question}
                </p>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  {currentChallenge.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentChallenge.correctIndex;

                    let btnClass = "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20";
                    if (isAnsweredCorrect && isCorrect) {
                      btnClass = "bg-emerald-500/25 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20 font-black";
                    } else if (isSelected && !isCorrect) {
                      btnClass = "bg-red-500/25 border-red-500 text-red-300 font-bold";
                    }

                    return (
                      <motion.button
                        key={idx}
                        whileHover={!isAnsweredCorrect ? { scale: 1.01 } : {}}
                        whileTap={!isAnsweredCorrect ? { scale: 0.98 } : {}}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={isAnsweredCorrect}
                        className={`p-3.5 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${btnClass}`}
                      >
                        <span>{option}</span>
                        {isAnsweredCorrect && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                        {isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {isAnsweredCorrect && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 font-medium leading-relaxed"
                  >
                    <span className="font-black text-emerald-400 block mb-0.5">Explanation:</span>
                    {currentChallenge.explanation}
                  </motion.div>
                )}
              </div>

              {/* Status Footer */}
              <div className="mt-6 text-center text-xs text-slate-500 font-medium">
                {isAnsweredCorrect ? (
                  <span className="text-emerald-400 font-bold">Dismissing alarm in a moment...</span>
                ) : (
                  <span>The alarm will continue ringing until the correct answer is selected.</span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
