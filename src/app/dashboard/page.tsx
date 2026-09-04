"use client";

import { 
  Brain, Flame, Target, Book, BookOpen, ChevronRight, Loader2, Trophy, 
  Sparkles, Compass, ArrowUpRight, Users, Award, MessageCircle, 
  Copy, CheckCheck, Camera, Activity, Palette, Timer, Star, Zap, Lock, RefreshCw,
  GraduationCap, Video, Shield, Globe, Mic, Radio, GitFork, Sliders, FileText, Gamepad2,
  CheckCircle2, Sun, Moon, LayoutGrid, Eye, Maximize2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Confetti from "@/components/Confetti";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DailyQuestionWidget } from "@/components/dashboard/DailyQuestionWidget";
import { ClassroomLauncher } from "@/components/dashboard/ClassroomLauncher";
import FeatureSpotlightTour from "@/components/FeatureSpotlightTour";
import { cn } from "@/lib/utils";
import { useGamificationStore } from "@/store/useGamificationStore";
import { useProfileStore } from "@/store/useProfileStore";



export default function Dashboard() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const router = useRouter();

  const { userClass, userLanguage, nickname, setUserClass, setUserLanguage, setNickname } = useProfileStore();
  const { xp, level, streak, missions, initializeMissions, awardXP } = useGamificationStore();
  
  // Clean View Modes: 'focus' (My Day), 'tools' (AI & Labs), 'social' (Classroom & Progress)
  const [activeTab, setActiveTab] = useState<"focus" | "tools" | "social">("focus");
  const [zenMode, setZenMode] = useState<boolean>(false);

  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const [showQuestCelebration, setShowQuestCelebration] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [activeMissionGuide, setActiveMissionGuide] = useState<string | null>(null);

  useEffect(() => {
    initializeMissions();
    
    const handleProfileUpdate = (e: any) => {
      if (e.detail?.nickname) setNickname(e.detail.nickname);
      if (e.detail?.className) setUserClass(Number(e.detail.className));
      if (e.detail?.language) setUserLanguage(e.detail.language);
    };

    window.addEventListener("edutrack_profile_updated", handleProfileUpdate);

    const handleXpUpdate = (e: any) => {
      if (e.detail?.xp !== undefined) {
        handleAwardXP(e.detail.xp);
      }
    };
    window.addEventListener("edutrack_xp_updated", handleXpUpdate);

    return () => {
      window.removeEventListener("edutrack_profile_updated", handleProfileUpdate);
      window.removeEventListener("edutrack_xp_updated", handleXpUpdate);
    };
  }, []);

  const handleAwardXP = (amount: number) => {
    const { newXp, newLevel, leveledUp } = awardXP(amount);

    if (leveledUp) {
      setShowLevelUp(true);
      setConfettiActive(true);
      setTimeout(() => setShowLevelUp(false), 5000);
    }
  };

  const toggleMission = (id: string) => {
    if (id === "theory") {
      setActiveMissionGuide("To complete the 'NCERT Scholar' quest (+50 XP), open 'Study Hub' in the navigation, open any chapter, and read its dynamic AI textbook notes!");
    } else if (id === "flashcards") {
      setActiveMissionGuide("To complete the 'Recall Wizard' quest (+50 XP), open 'Flashcards' and promote a card into box 5!");
    } else if (id === "notes") {
      setActiveMissionGuide("To complete the 'Quick Summary' quest (+30 XP), open any chapter under 'Study Hub' and load its Quick Revision cheat sheet!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-semibold text-sm">Preparing your personal study space...</p>
      </div>
    );
  }

  const firstName = nickname || user?.displayName?.split(" ")[0] || "Scholar";
  const initials = (nickname || user?.displayName || user?.email || "S").charAt(0).toUpperCase();
  const weakSubjects = profile?.weakSubjects || [];

  const userTotalXp = xp + (level === 1 ? 0 : Array.from({length: level - 1}, (_, i) => (i + 1) * 200).reduce((a, b) => a + b, 0));
  
  const classmates = [
    { name: "Aditya Sharma", totalXp: 950, status: "Studying Science 🔬", online: true, avatar: "AS", color: "from-amber-500 to-orange-500" },
    { name: "Priya Nair", totalXp: 720, status: "In Study Room 👥", online: true, avatar: "PN", color: "from-emerald-400 to-teal-500" },
    { name: `${firstName} (You)`, totalXp: userTotalXp, status: "On Dashboard ✨", online: true, isSelf: true, avatar: initials, color: "from-indigo-500 to-purple-600" },
    { name: "Rohan Das", totalXp: 340, status: "Idle", online: false, avatar: "RD", color: "from-blue-400 to-cyan-500" },
    { name: "Sneha Patel", totalXp: 180, status: "Active Recall ⚡", online: true, avatar: "SP", color: "from-fuchsia-400 to-pink-500" }
  ];
  classmates.sort((a, b) => b.totalXp - a.totalXp);

  const skillNodes = [
    { id: "reactions", label: "Chemical Reactions", status: "completed", percent: 100, x: 12, y: 55, desc: "Balance chemical equations and explore corrosion.", keyPoints: ["Balanced equations show conservation of mass.", "Combination vs Decomposition reactions.", "Oxidation is loss of electrons, Reduction is gain."] },
    { id: "acids", label: "Acids & Bases", status: "active", percent: 45, x: 32, y: 25, desc: "Understand pH scales, indicators, and salt families.", keyPoints: ["Acids release H+ ions in solution; Bases release OH-.", "pH < 7 is acidic; pH > 7 is basic.", "Chlor-alkali process creates NaOH, Cl2, and H2."] },
    { id: "metals", label: "Metals & Nonmetals", status: "locked", percent: 0, x: 52, y: 75, desc: "Reactivity series, ionic bonding, and metallurgy.", keyPoints: ["Prerequisite: Complete Acids & Bases first.", "Metals form basic oxides, non-metals form acidic oxides.", "Ionic compounds have high melting points."] },
    { id: "carbon", label: "Carbon Compounds", status: "locked", percent: 0, x: 72, y: 25, desc: "Covalent bonding, isomerism, and functional groups.", keyPoints: ["Prerequisite: Unlock Metals first.", "Catenation is carbon's unique ability to form long chains.", "Saturated vs Unsaturated hydrocarbons."] },
    { id: "life", label: "Life Processes", status: "locked", percent: 0, x: 90, y: 55, desc: "Nutrition, respiration, circulation, and excretion.", keyPoints: ["Prerequisite: Unlock Carbon Compounds first.", "Autotrophic vs Heterotrophic nutrition.", "Double circulation in humans prevents mixing of blood."] }
  ];



  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-[10px] font-black text-amber-400 bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 rounded-full shrink-0">#1</span>;
    if (rank === 2) return <span className="text-[10px] font-black text-slate-300 bg-slate-300/15 border border-slate-300/25 px-1.5 py-0.5 rounded-full shrink-0">#2</span>;
    if (rank === 3) return <span className="text-[10px] font-black text-amber-600 bg-amber-600/15 border border-amber-600/25 px-1.5 py-0.5 rounded-full shrink-0">#3</span>;
    return <span className="w-4 font-black text-[10px] text-center font-mono shrink-0 text-slate-500">#{rank}</span>;
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="space-y-6 relative max-w-7xl mx-auto pb-12">
      {/* Background Ambience */}
      <div className="premium-mesh-bg">
        <div className="premium-mesh-blob-1" />
        <div className="premium-mesh-blob-2" />
        <div className="premium-grid-overlay" />
      </div>

      {/* ── HEADER WITH ZEN MODE TOGGLE ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-1">
        <DashboardHeader 
          firstName={firstName} 
          userClass={profile?.className || userClass} 
          userLanguage={userLanguage} 
          streak={streak} 
          itemVariants={item} 
        />
        
        {/* Quick Zen Mode Toggle Button */}
        <button
          onClick={() => setZenMode(!zenMode)}
          className={cn(
            "self-end sm:self-center flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border shadow-sm",
            zenMode 
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 ring-2 ring-emerald-500/20" 
              : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white"
          )}
          title="Toggle Zen Focus Mode"
        >
          <Sparkles className={cn("w-3.5 h-3.5", zenMode ? "text-emerald-400 animate-pulse" : "text-slate-400")} />
          <span>{zenMode ? "Zen Mode: Active" : "Zen Focus Mode"}</span>
        </button>
      </div>

      {/* ── ZEN FOCUS VIEW (MINIMALIST DISTRACTION-FREE) ── */}
      {zenMode ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="space-y-6"
        >
          {/* Zen Hero Card */}
          <div className="premium-glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-500/20 bg-emerald-950/10 text-center relative overflow-hidden">
            <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 text-emerald-400">
              <Compass className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Calm & Focused Study Mode
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mt-2 leading-relaxed">
              All visual distractions, leaderboards, and extra cards are hidden. Choose your task and learn with full clarity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
              <Link href="/learn" className="p-4 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-2xl transition-all group text-left">
                <BookOpen className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-black text-sm text-white">Study Hub</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Read NCERT chapters</p>
              </Link>
              <Link href="/pomodoro" className="p-4 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 rounded-2xl transition-all group text-left">
                <Timer className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-black text-sm text-white">Focus Timer</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">25-min Pomodoro cycles</p>
              </Link>
              <Link href="/tutor" className="p-4 bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30 rounded-2xl transition-all group text-left">
                <Brain className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-black text-sm text-white">AI Tutor</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Ask 1-on-1 doubts</p>
              </Link>
            </div>
          </div>

          {/* Minimal Daily Question */}
          <DailyQuestionWidget />
        </motion.div>
      ) : (
        /* ── STANDARD MODULAR BENTO DASHBOARD ── */
        <div className="space-y-6">
          
          {/* ── CLEAN TAB NAVIGATOR ── */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("focus")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                activeTab === "focus" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Today's Focus</span>
            </button>

            <button
              onClick={() => setActiveTab("tools")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                activeTab === "tools" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore AI & Labs</span>
            </button>

            <button
              onClick={() => setActiveTab("social")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                activeTab === "social" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Classroom & Progress</span>
            </button>
          </div>

          {/* ── TAB 1: TODAY'S FOCUS (CLEAN & ACTION-ORIENTED) ── */}
          {activeTab === "focus" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Top Compact Hero Bar: Level HUD + Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Level HUD Card */}
                <div id="tour-stats-hud" className="premium-glass-panel p-5 rounded-2xl flex items-center justify-between gap-4 border border-indigo-500/20">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                      L{level}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {level <= 1 ? "Study Novice" : level <= 3 ? "Elite Scholar" : "Grandmaster"}
                      </h4>
                      <p className="text-[11px] text-indigo-400 font-bold mt-0.5">
                        {xp} / {level * 200} XP to Level {level + 1}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Score</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{userTotalXp} XP</span>
                  </div>
                </div>

                {/* Quick 4 Core Shortcuts */}
                <div className="md:col-span-2 grid grid-cols-4 gap-2.5">
                  <Link href="/lens" id="tour-quick-lens" className="premium-glass-panel p-3.5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-emerald-500/40 transition-all group">
                    <Camera className="w-5 h-5 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black text-slate-200">AI Lens</span>
                  </Link>
                  <Link href="/tutor" id="tour-tools-aibot" className="premium-glass-panel p-3.5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-indigo-500/40 transition-all group">
                    <MessageCircle className="w-5 h-5 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black text-slate-200">AI Tutor</span>
                  </Link>
                  <Link href="/learn" className="premium-glass-panel p-3.5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-purple-500/40 transition-all group">
                    <BookOpen className="w-5 h-5 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black text-slate-200">Study Hub</span>
                  </Link>
                  <Link href="/whiteboard" className="premium-glass-panel p-3.5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-pink-500/40 transition-all group">
                    <Palette className="w-5 h-5 text-pink-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black text-slate-200">Whiteboard</span>
                  </Link>
                </div>

              </div>

              {/* Main Content Grid: Daily Challenge + Daily Quests + Flashcard Warmup */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Left Column: Today's Question + Flashcard Swiper */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Daily Question */}
                  <DailyQuestionWidget />



                </div>

                {/* Right Column: Daily Quests */}
                <div className="space-y-6">
                  <div className="premium-glass-panel p-6 rounded-3xl border border-indigo-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-indigo-400" />
                        Today's Quests
                      </h3>
                      <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        {missions.filter(m => m.completed).length} / {missions.length} Done
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {missions.map((mission) => (
                        <div 
                          key={mission.id}
                          onClick={() => toggleMission(mission.id)}
                          className={cn(
                            "p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer select-none",
                            mission.completed 
                              ? "bg-emerald-500/5 border-emerald-500/20 text-slate-400" 
                              : "bg-white/5 border-white/5 hover:border-indigo-500/30 text-white"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 text-xs",
                            mission.completed 
                              ? "bg-emerald-500 border-emerald-500 text-white" 
                              : "border-white/20 bg-white/5"
                          )}>
                            {mission.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs font-bold truncate", mission.completed && "line-through opacity-60")}>
                              {mission.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{mission.desc}</p>
                          </div>
                          <span className="text-[9px] font-black text-indigo-400 shrink-0">
                            +{mission.xp} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target Weak Subjects */}
                  {weakSubjects.length > 0 && (
                    <div className="premium-glass-panel p-5 rounded-3xl border border-rose-500/20">
                      <h4 className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-3">
                        <Target className="w-3.5 h-3.5" /> Weak Subject Focus
                      </h4>
                      <div className="space-y-2">
                        {weakSubjects.map((sub, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-white truncate">{sub}</span>
                            <Link href="/tutor" className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg hover:bg-indigo-500/20 transition-all">
                              Practice
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </motion.div>
          )}

          {/* ── TAB 2: EXPLORE AI & LABS (BENTO SUITE) ── */}
          {activeTab === "tools" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">AI Tools & Interactive Study Labs</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Explore Next-Gen interactive STEM simulations, oral examiners, and collaborative spaces.</p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. AI Doubt Lens */}
                <Link href="/lens" className="premium-glass-panel p-6 rounded-3xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all group flex flex-col justify-between h-48">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">Camera OCR</span>
                  </div>
                  <div>
                    <h4 className="font-black text-base text-white group-hover:text-emerald-400 transition-colors">AI Doubt Lens</h4>
                    <p className="text-slate-400 text-xs mt-1">Upload or snap any textbook diagram or handwritten equation for instant step-by-step solutions.</p>
                  </div>
                </Link>

                {/* 2. Simulation Sandbox */}
                <Link href="/sandbox" className="premium-glass-panel p-6 rounded-3xl border border-amber-500/20 hover:border-amber-500/50 transition-all group flex flex-col justify-between h-48">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">Interactive Lab</span>
                  </div>
                  <div>
                    <h4 className="font-black text-base text-white group-hover:text-amber-400 transition-colors">Science Sandbox</h4>
                    <p className="text-slate-400 text-xs mt-1">Mix real reagents in a beaker, test pH colors, and trigger interactive chemistry reactions in real-time.</p>
                  </div>
                </Link>

                {/* 3. AI Voice Viva */}
                <Link href="/viva" className="premium-glass-panel p-6 rounded-3xl border border-purple-500/20 hover:border-purple-500/50 transition-all group flex flex-col justify-between h-48">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
                      <Mic className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">Oral Practice</span>
                  </div>
                  <div>
                    <h4 className="font-black text-base text-white group-hover:text-purple-400 transition-colors">AI Voice Viva</h4>
                    <p className="text-slate-400 text-xs mt-1">Conversational oral board practical examiner with real-time speech dialogue and score feedback.</p>
                  </div>
                </Link>

                {/* 4. Whiteboard */}
                <Link href="/whiteboard" className="premium-glass-panel p-6 rounded-3xl border border-pink-500/20 hover:border-pink-500/50 transition-all group flex flex-col justify-between h-48">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400 group-hover:scale-110 transition-transform">
                      <Palette className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">Canvas</span>
                  </div>
                  <div>
                    <h4 className="font-black text-base text-white group-hover:text-pink-400 transition-colors">Smart Whiteboard</h4>
                    <p className="text-slate-400 text-xs mt-1">Draw, sketch formulas, and have AI solve handwritten equations directly on your canvas.</p>
                  </div>
                </Link>

                {/* 5. Battle Quiz Arena */}
                <Link href="/arena" className="premium-glass-panel p-6 rounded-3xl border border-rose-500/20 hover:border-rose-500/50 transition-all group flex flex-col justify-between h-48">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400 group-hover:scale-110 transition-transform">
                      <Gamepad2 className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">Multiplayer</span>
                  </div>
                  <div>
                    <h4 className="font-black text-base text-white group-hover:text-rose-400 transition-colors">Quiz Battle Arena</h4>
                    <p className="text-slate-400 text-xs mt-1">Compete against classmates in fast-paced real-time live question duels with powerups.</p>
                  </div>
                </Link>

                {/* 6. Formula & Cheatsheet Vault */}
                <Link href="/formulas" className="premium-glass-panel p-6 rounded-3xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all group flex flex-col justify-between h-48">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform">
                      <Compass className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">Quick Revision</span>
                  </div>
                  <div>
                    <h4 className="font-black text-base text-white group-hover:text-cyan-400 transition-colors">Formula Vault</h4>
                    <p className="text-slate-400 text-xs mt-1">High-yield equations, periodic trends, math theorems, and quick revision cards.</p>
                  </div>
                </Link>

              </div>
            </motion.div>
          )}

          {/* ── TAB 3: CLASSROOM & PROGRESS (SYLLABUS & SOCIAL) ── */}
          {activeTab === "social" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Virtual School Launcher */}
              <ClassroomLauncher itemVariants={item} />

              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Syllabus Mind Map (Left 2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="premium-glass-panel p-6 rounded-3xl border border-indigo-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Compass className="w-4 h-4 text-indigo-400" />
                          Mastery Mind Map & Syllabus Tree
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Click nodes to view chapter highlights and trigger mock tests</p>
                      </div>
                    </div>

                    <div className="relative w-full bg-black/30 rounded-2xl border border-white/5 p-4 overflow-x-auto min-h-[200px]">
                      <svg className="w-full max-w-[700px] h-auto mx-auto" viewBox="0 0 800 160">
                        <path d="M 96 80 Q 176 40 256 40" fill="none" className="stroke-emerald-500/50" strokeWidth="3" />
                        <path d="M 256 40 Q 336 80 416 120" fill="none" className="stroke-indigo-500/40" strokeWidth="3" />
                        <path d="M 416 120 Q 496 80 576 40" fill="none" className="stroke-slate-800" strokeWidth="2" />
                        <path d="M 576 40 Q 656 80 720 88" fill="none" className="stroke-slate-800" strokeWidth="2" />

                        {skillNodes.map((node) => {
                          const isLocked = node.status === "locked";
                          const isActive = node.status === "active";
                          const isCompleted = node.status === "completed";
                          const cx = node.x * 8;
                          const cy = node.y * 1.5;

                          return (
                            <g 
                              key={node.id}
                              onClick={() => setSelectedNode(node)}
                              className="cursor-pointer group select-none"
                            >
                              <circle
                                cx={cx}
                                cy={cy}
                                r="20"
                                className={cn(
                                  "transition-all duration-300 stroke-2 group-hover:scale-110",
                                  isCompleted ? "stroke-emerald-500 fill-emerald-950/40" : "",
                                  isActive ? "stroke-indigo-500 fill-indigo-950/40" : "",
                                  isLocked ? "stroke-slate-800 fill-black/60" : ""
                                )}
                              />
                              {isCompleted ? (
                                <path 
                                  d={`M ${cx - 5} ${cy} L ${cx - 2} ${cy + 4} L ${cx + 5} ${cy - 4}`}
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                />
                              ) : isLocked ? (
                                <g transform={`translate(${cx - 4.5}, ${cy - 5.5}) scale(0.55)`}>
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="#64748b" strokeWidth="2.5"/>
                                </g>
                              ) : (
                                <text x={cx} y={cy + 4} textAnchor="middle" className="text-[11px] font-black fill-indigo-400 font-mono">
                                  {node.percent}%
                                </text>
                              )}
                              <text x={cx} y={cy - 26} textAnchor="middle" className="text-[10px] font-black fill-slate-400 uppercase">
                                {node.label.split(" ")[0]}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Classmates Leaderboard (Right col) */}
                <div id="tour-leaderboard-section" className="premium-glass-panel p-6 rounded-3xl border border-indigo-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      Classmate Ranks
                    </h3>
                    <Link href="/groups" className="text-[10px] font-bold text-indigo-400 hover:underline">
                      StudyCircles →
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {classmates.map((buddy, index) => (
                      <div 
                        key={buddy.name}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-2xl border transition-all",
                          buddy.isSelf 
                            ? "bg-indigo-500/10 border-indigo-500/40" 
                            : "bg-white/5 border-white/5 hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getRankBadge(index + 1)}
                          <div className={cn("w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-black text-[10px]", buddy.color)}>
                            {buddy.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className={cn("text-xs font-bold truncate", buddy.isSelf ? "text-indigo-300" : "text-white")}>
                              {buddy.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{buddy.totalXp} XP</p>
                          </div>
                        </div>

                        {!buddy.isSelf && (
                          <Link href="/groups" className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </div>
      )}

      {/* ── SYLLABUS NODE MODAL ── */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl p-6 text-left text-white shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    CBSE Syllabus Node
                  </span>
                  <h3 className="text-xl font-black mt-1.5">{selectedNode.label}</h3>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)} 
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs"
                >
                  ✕
                </button>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">{selectedNode.desc}</p>
              
              <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mb-1.5">Key Board Highlights</h4>
                <ul className="space-y-1.5">
                  {selectedNode.keyPoints.map((point: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-300 font-semibold flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <Link href="/mocktest">
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Start Mock Test
                  </button>
                </Link>
                <Link href="/learn">
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-all border border-white/10"
                  >
                    Read Theory
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Strict Quest Guide Modal */}
      <AnimatePresence>
        {activeMissionGuide && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 text-center text-white"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black">Quest Guide</h3>
                <p className="text-xs text-slate-400 mt-0.5">How to complete this mission</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                {activeMissionGuide}
              </p>
              <button
                onClick={() => setActiveMissionGuide(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all text-xs"
              >
                Understood!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />
      <FeatureSpotlightTour />
    </div>
  );
}