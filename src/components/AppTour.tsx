"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Brain, 
  GraduationCap, 
  Globe, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  X, 
  Flame, 
  BookOpen, 
  Zap, 
  Users, 
  Layers, 
  Trophy, 
  FileText, 
  Tv, 
  ShieldCheck,
  Check
} from "lucide-react";
import Confetti from "./Confetti";
import { useAuth } from "@/context/AuthContext";

interface AppTourProps {
  forcedOpen?: boolean;
  onClose?: () => void;
  initialStep?: number;
}

export default function AppTour({ forcedOpen, onClose, initialStep = 0 }: AppTourProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [confettiActive, setConfettiActive] = useState(false);

  // Profile setup state
  const [nickname, setNickname] = useState("");
  const [selectedClass, setSelectedClass] = useState<number>(10);
  const [language, setLanguage] = useState<string>("English");
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [suffix] = useState<number>(() => Math.floor(1000 + Math.random() * 9000));

  // Initialize or listen for open events
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedNick = localStorage.getItem("edutrack_nickname") || "";
      const storedClass = parseInt(localStorage.getItem("edutrack_class") || "10", 10);
      const storedLang = localStorage.getItem("edutrack_language") || "English";
      const storedCode = localStorage.getItem("edutrack_friend_code") || "";
      const tourCompleted = localStorage.getItem("edutrack_tour_completed");

      if (storedNick) {
        setNickname(storedNick);
        setGeneratedCode(storedCode || `${storedNick.toUpperCase().replace(/\s+/g, '')}#${suffix}`);
      }
      if (storedClass) setSelectedClass(storedClass);
      if (storedLang) setLanguage(storedLang);

      if (forcedOpen !== undefined) {
        setIsOpen(forcedOpen);
        if (forcedOpen) setCurrentStep(initialStep);
      } else if (!tourCompleted && !storedNick) {
        // Auto open for first-time visitors
        setIsOpen(true);
        setCurrentStep(0);
      }

      // Event listener for opening tour from anywhere (e.g. sidebar button)
      const handleOpenTour = (e: any) => {
        setIsOpen(true);
        if (e.detail?.initialStep !== undefined) {
          setCurrentStep(e.detail.initialStep);
        } else {
          // Open from Step 0 so users can review or change their nickname
          setCurrentStep(0);
        }
      };

      window.addEventListener("edutrack_open_tour", handleOpenTour);
      return () => {
        window.removeEventListener("edutrack_open_tour", handleOpenTour);
      };
    }
  }, [forcedOpen, initialStep, suffix]);

  const handleNicknameChange = (val: string) => {
    setNickname(val);
    if (val.trim()) {
      setGeneratedCode(`${val.trim().replace(/\s+/g, '').toUpperCase()}#${suffix}`);
    } else {
      setGeneratedCode("");
    }
  };

  const saveProfileSettings = async () => {
    const finalNick = nickname.trim() || "Scholar";
    const finalCode = generatedCode || `${finalNick.toUpperCase()}#${suffix}`;

    localStorage.setItem("edutrack_nickname", finalNick);
    localStorage.setItem("edutrack_friend_code", finalCode);
    localStorage.setItem("edutrack_class", selectedClass.toString());
    localStorage.setItem("edutrack_language", language);

    // Save to Firebase/Firestore if logged in
    if (user) {
      try {
        const { updateProfile } = await import("firebase/auth");
        if (user && "updateProfile" in user) {
          await (user as any).updateProfile({ displayName: finalNick });
        }
      } catch (err) {
        console.warn("Could not update auth displayName:", err);
      }

      try {
        const { updateUserProfile } = await import("@/lib/db");
        await updateUserProfile(user.uid, {
          nickname: finalNick,
          displayName: finalNick,
          friendCode: finalCode,
          className: selectedClass.toString(),
          language: language,
        });
      } catch (err) {
        console.warn("Could not save to firestore profile:", err);
      }
    }

    // Broadcast update event so all components update immediately in real-time
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("edutrack_profile_updated", {
        detail: {
          nickname: finalNick,
          friendCode: finalCode,
          className: selectedClass,
          language: language
        }
      }));
    }
  };

  const completeTour = () => {
    saveProfileSettings();
    localStorage.setItem("edutrack_tour_completed", "true");

    // Award +100 Starter XP if not already awarded
    const starterAwarded = localStorage.getItem("edutrack_tour_reward_claimed");
    if (!starterAwarded) {
      const currentXp = parseInt(localStorage.getItem("edutrack_xp") || "0", 10);
      const newXp = currentXp + 100;
      localStorage.setItem("edutrack_xp", newXp.toString());
      localStorage.setItem("edutrack_tour_reward_claimed", "true");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("edutrack_xp_updated", { detail: { xp: newXp } }));
      }
    }

    setConfettiActive(true);
    setTimeout(() => {
      setIsOpen(false);
      if (onClose) onClose();
    }, 1800);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      saveProfileSettings();
      setCurrentStep(1);
    } else if (currentStep < 6) {
      if (currentStep === 5) {
        // Finishing step 5 goes to celebration step
        setConfettiActive(true);
      }
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    saveProfileSettings();
    localStorage.setItem("edutrack_tour_completed", "true");
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  const TOUR_STEPS = [
    {
      title: "Set Up Your Identity",
      subtitle: "Choose your permanent study nickname and grade",
      tag: "Step 1 of 6 • Account Setup"
    },
    {
      title: "AI Study Dashboard & Quests",
      subtitle: "Your personal academic command center",
      tag: "Superpower 1 • Roadmaps & Gamification"
    },
    {
      title: "NCERT AI Textbook & AI Tutor",
      subtitle: "Line-by-line clarity and 24/7 doubt resolution",
      tag: "Superpower 2 • Deep Learning"
    },
    {
      title: "Leitner Recall Flashcards",
      subtitle: "Spaced repetition science for permanent memory",
      tag: "Superpower 3 • Active Recall"
    },
    {
      title: "Past 10-Yr PYQs & Mock Tests",
      subtitle: "CBSE board question bank with AI grading",
      tag: "Superpower 4 • Exam Mastery"
    },
    {
      title: "Study Circles & Whiteboard",
      subtitle: "Collaborate with peers in realtime rooms and 1v1 duels",
      tag: "Superpower 5 • Multiplayer Collaboration"
    },
    {
      title: "You're Ready to Excel!",
      subtitle: "Claim your Welcome XP Starter Bonus",
      tag: "Launch Ready"
    }
  ];

  return (
    <>
      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />

      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl transition-all duration-300">
        
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="w-full max-w-2xl bg-[#0d1226]/95 border border-white/15 rounded-3xl shadow-[0_0_80px_rgba(99,102,241,0.25)] text-white overflow-hidden flex flex-col max-h-[92vh] relative"
        >
          {/* Top glowing accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shrink-0" />

          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">
                  {TOUR_STEPS[currentStep].tag}
                </span>
                <span className="text-sm font-black text-white">
                  EduTrack Workspace Tour
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                Skip Tour
              </button>
              <button
                onClick={handleSkip}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 custom-scrollbar">
            <AnimatePresence mode="wait">
              
              {/* STEP 0: NICKNAME & CLASS SETUP */}
              {currentStep === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                      <span>Welcome to EduTrack!</span> 🚀
                    </h2>
                    <p className="text-slate-300 text-sm font-medium mt-1.5">
                      Give yourself a <strong className="text-indigo-300">permanent study nickname</strong>. This nickname will be displayed across your workspace, leaderboard, study circles, and duels!
                    </p>
                  </div>

                  {/* Nickname Input & Live Friend Code Badge */}
                  <div className="bg-white/[0.04] border border-white/10 p-5 rounded-2xl space-y-4">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                      Permanent Study Nickname
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => handleNicknameChange(e.target.value)}
                        placeholder="e.g. CosmicScholar, Aarav, QuantumBrain"
                        maxLength={18}
                        className="w-full px-4 py-3.5 bg-black/40 border border-indigo-500/40 rounded-xl font-bold text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                        autoFocus
                      />
                    </div>

                    {/* Live Identity Badge Preview */}
                    <div className="bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-transparent border border-indigo-500/30 rounded-xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                          {(nickname || "S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">
                            {nickname.trim() || "Your Nickname"}
                          </p>
                          <p className="text-[10px] text-indigo-300 font-mono font-bold tracking-wider">
                            {generatedCode || `SCHOLAR#${suffix}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full">
                        Class {selectedClass}
                      </span>
                    </div>
                  </div>

                  {/* Class Selection */}
                  <div className="space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-400" /> Which CBSE Class are you preparing for?
                    </label>
                    <div className="grid grid-cols-5 gap-2.5">
                      {[6, 7, 8, 9, 10].map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => setSelectedClass(cls)}
                          className={`py-3 rounded-xl border-2 font-black text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                            selectedClass === cls
                              ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30 scale-105"
                              : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className="text-lg leading-none">{cls}</span>
                          <span className="text-[9px] uppercase font-bold text-slate-300">Class</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Study Language */}
                  <div className="space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-indigo-400" /> Default AI Explanation Language
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {[
                        "English", "Hinglish", "Telugu", "Telgish", "Tamil", "Tanglish", "Hindi", "Marathi"
                      ].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setLanguage(lang)}
                          className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all text-center ${
                            language === lang
                              ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                              : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: AI DASHBOARD & QUESTS */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">AI Study Dashboard & Quests</h2>
                      <p className="text-slate-400 text-xs font-medium">Your personalized daily roadmap and mastery tree</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                        <Flame className="w-4 h-4 text-orange-400" /> Daily Quests & Streaks
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Earn daily XP by reading NCERT chapters, mastering flashcard decks, and taking quizzes. Build unstoppable learning habits!
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                        <Zap className="w-4 h-4 text-amber-400" /> Dynamic Skill Tree
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Visual nodes track your concept mastery across Physics, Chemistry, Biology, and Maths with AI recommendations.
                      </p>
                    </div>
                  </div>

                  {/* Visual Preview Graphic */}
                  <div className="bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-black/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                        <Flame className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">Daily Streak Active</div>
                        <div className="text-[10px] text-slate-400">Earn bonus multiplier XP each day</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      Level 1 Scholar
                    </span>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: NCERT & AI TUTOR */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">Smart NCERT & 24/7 AI Tutor</h2>
                      <p className="text-slate-400 text-xs font-medium">Interactive line-by-line textbook and voice mentor</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Line-by-Line AI Textbook</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          Click any sentence in NCERT to generate real-world analogies, simplified explanations, and instant memory hooks in your preferred language.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Tv className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">AI Doubt Solver & Voice Tutor</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          Snap a photo using AI Lens or talk naturally to the AI Tutor to get step-by-step guidance without ever getting stuck.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: LEITNER FLASHCARDS */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">Leitner Recall Flashcards</h2>
                      <p className="text-slate-400 text-xs font-medium">Science-backed spaced repetition algorithm</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Cards move across 5 Leitner boxes as you master them. Hard cards are reviewed frequently; mastered cards are reinforced before you forget.
                    </p>

                    <div className="grid grid-cols-5 gap-2 pt-2">
                      {["Box 1: New", "Box 2: Review", "Box 3: Strong", "Box 4: Master", "Box 5: Permanent"].map((box, i) => (
                        <div key={i} className="bg-black/40 border border-white/10 p-2.5 rounded-xl text-center">
                          <div className={`text-base font-black ${i === 4 ? "text-emerald-400" : i === 0 ? "text-indigo-400" : "text-purple-400"}`}>
                            B{i + 1}
                          </div>
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1 truncate">
                            {box.split(": ")[1]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: PYQS & MOCK TESTS */}
              {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">Past 10-Yr CBSE PYQs & Tests</h2>
                      <p className="text-slate-400 text-xs font-medium">Board exam questions with AI grading</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" /> Solved Board Papers
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Extracted CBSE 10-year question bank categorized by chapter, question difficulty, and recurring topics.
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                        <ShieldCheck className="w-4 h-4" /> AI Answer Evaluation
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Write answers and let the AI grader provide instantaneous feedback against official CBSE marking schemes.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: STUDY CIRCLES & WHITEBOARD */}
              {currentStep === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">Study Circles & Live Whiteboard</h2>
                      <p className="text-slate-400 text-xs font-medium">Realtime peer rooms, 1v1 duels, and drawing</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="text-xs font-bold text-slate-300">Your Permanent Tag in Circles:</span>
                      <span className="text-xs font-mono font-black text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                        {generatedCode || `${(nickname || "SCHOLAR").toUpperCase()}#${suffix}`}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Invite friends using your unique Friend Code. Challenge them to 1v1 timed quiz duels or sketch diagrams collaboratively on the shared live whiteboard canvas!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: CELEBRATION & STARTER XP REWARD */}
              {currentStep === 6 && (
                <motion.div
                  key="step-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="text-center py-4 space-y-6"
                >
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-indigo-600 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(249,115,22,0.4)] border border-white/20">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      You're All Set, <span className="text-indigo-400">{nickname.trim() || "Scholar"}</span>! 🎉
                    </h2>
                    <p className="text-slate-300 text-sm font-medium mt-2 max-w-md mx-auto">
                      Your profile and permanent nickname have been configured. We've added a Welcome Starter Reward to your account!
                    </p>
                  </div>

                  {/* XP Reward Card */}
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-indigo-500/20 border border-amber-500/40 px-6 py-3.5 rounded-2xl shadow-lg">
                    <Zap className="w-6 h-6 text-amber-400" />
                    <div className="text-left">
                      <div className="text-xs font-black uppercase tracking-wider text-amber-300">Starter Bonus</div>
                      <div className="text-xl font-black text-white">+100 Welcome XP Claimed</div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="px-6 sm:px-8 py-4 border-t border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
            
            {/* Step indicator dots */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (currentStep === 0) saveProfileSettings();
                    setCurrentStep(idx);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    currentStep === idx
                      ? "w-6 bg-gradient-to-r from-indigo-500 to-purple-500"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  title={`Go to ${TOUR_STEPS[idx].title}`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-xl border border-white/15 hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 0 && !nickname.trim()}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${
                  currentStep === 0 && !nickname.trim()
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:scale-105 text-white shadow-indigo-500/25"
                }`}
              >
                {currentStep === 6 ? (
                  <>
                    <span>Start Learning</span>
                    <Check className="w-4 h-4" />
                  </>
                ) : currentStep === 0 ? (
                  <>
                    <span>Confirm & Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </>
  );
}
