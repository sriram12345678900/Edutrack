"use client";

import { 
  Brain, Flame, Target, Book, ChevronRight, Loader2, Trophy, 
  Sparkles, Compass, ArrowUpRight, Users, Award, MessageCircle, 
  Copy, CheckCheck, Camera, Activity, Palette, Timer, Star, Zap, Lock, RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Confetti from "@/components/Confetti";
import { cn } from "@/lib/utils";
import { getOrInitializeMissions, awardUserXP } from "@/lib/xp";

// Draggable Swiper Card Sub-component
interface SwiperCardProps {
  card: { id: string; front: string; back: string };
  index: number;
  activeIndex: number;
  totalCards: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

function SwiperCard({ card, index, activeIndex, totalCards, onSwipeLeft, onSwipeRight }: SwiperCardProps) {
  const isTop = index === activeIndex;
  const dragX = useMotionValue(0);
  
  // Transform drag offset to rotation, tilt, and exit direction
  const rotate = useTransform(dragX, [-150, 150], [-25, 25]);
  const cardOpacity = useTransform(dragX, [-150, -80, 0, 80, 150], [0.6, 1, 1, 1, 0.6]);
  
  // Swipe feedback labels opacity
  const studyLabelOpacity = useTransform(dragX, [-100, -20], [1, 0]);
  const masterLabelOpacity = useTransform(dragX, [20, 100], [0, 1]);

  if (index < activeIndex) return null;

  return (
    <motion.div
      style={{
        zIndex: 10 - index,
        x: dragX,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? cardOpacity : Math.max(0, 0.95 - (index - activeIndex) * 0.1),
        y: isTop ? 0 : (index - activeIndex) * 12,
        scale: isTop ? 1 : Math.max(0.8, 1 - (index - activeIndex) * 0.04),
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      onDragEnd={(e, info) => {
        if (!isTop) return;
        if (info.offset.x > 130) {
          onSwipeRight();
        } else if (info.offset.x < -130) {
          onSwipeLeft();
        }
      }}
      className={cn(
        "absolute inset-0 bg-[#0d1127]/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.4)] cursor-grab",
        !isTop && "pointer-events-none"
      )}
    >
      {/* Swipe Overlay Feedback Indicators */}
      {isTop && (
        <>
          <motion.div 
            style={{ opacity: studyLabelOpacity }}
            className="absolute top-4 left-4 bg-red-500/25 border border-red-500/50 px-3 py-1 rounded-full text-red-400 text-[10px] font-black uppercase tracking-wider pointer-events-none"
          >
            Study Later
          </motion.div>
          <motion.div 
            style={{ opacity: masterLabelOpacity }}
            className="absolute top-4 right-4 bg-emerald-500/25 border border-emerald-500/50 px-3 py-1 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-wider pointer-events-none"
          >
            Mastered! +50 XP
          </motion.div>
        </>
      )}

      <div className="flex justify-between items-center relative z-10">
        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/25">Question</span>
        <span className="text-[9px] text-slate-500 font-bold">Card {index + 1} of {totalCards}</span>
      </div>
      
      <p className="text-center font-extrabold text-sm text-white px-2 mt-2 leading-relaxed relative z-10">{card.front}</p>
      
      {/* Interactive Swipe Hint */}
      <div className="mt-3 text-[10px] text-slate-500 font-black tracking-widest uppercase text-center border-t border-white/5 pt-2 flex justify-between items-center relative z-10">
        <span className="text-red-400/80">← Swipe Left</span>
        <span className="text-slate-600">Active Recall</span>
        <span className="text-emerald-400/80">Swipe Right →</span>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const router = useRouter();

  const [userClass, setUserClass] = useState<number | null>(null);
  
  // Gamification States
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [streak, setStreak] = useState<number>(7);
  const [missions, setMissions] = useState<any[]>([
    { id: "theory", title: "NCERT Scholar", desc: "Read a dynamic AI Textbook chapter page today", xp: 50, completed: false },
    { id: "flashcards", title: "Recall Wizard", desc: "Promote at least one flashcard in Leitner boxes", xp: 50, completed: false },
    { id: "notes", title: "Quick Summary", desc: "Load/generate a chapter revision summary", xp: 30, completed: false }
  ]);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const [showQuestCelebration, setShowQuestCelebration] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [swiperIndex, setSwiperIndex] = useState<number>(0);
  
  // Strict Quest Guide modal state
  const [activeMissionGuide, setActiveMissionGuide] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("edutrack_class");
    if (!stored) {
      router.push("/setup");
    } else {
      setUserClass(parseInt(stored, 10));
    }

    // Load Gamification stats from localStorage
    const loadStats = () => {
      if (typeof window !== "undefined") {
        const storedXp = localStorage.getItem("edutrack_xp");
        const storedLevel = localStorage.getItem("edutrack_level");
        const storedStreak = localStorage.getItem("edutrack_streak");
        
        const initializedMissions = getOrInitializeMissions();
        setMissions(initializedMissions);
        
        if (storedXp) setXp(parseInt(storedXp, 10));
        if (storedLevel) setLevel(parseInt(storedLevel, 10));
        if (storedStreak) setStreak(parseInt(storedStreak, 10));
        else localStorage.setItem("edutrack_streak", "7");

        // Check if all quests are completed
        const allDone = initializedMissions.every(m => m.completed);
        const alreadyCelebrated = localStorage.getItem("edutrack_quests_celebrated_today") === new Date().toDateString();
        if (allDone && !alreadyCelebrated) {
          setShowQuestCelebration(true);
          setConfettiActive(true);
          localStorage.setItem("edutrack_quests_celebrated_today", new Date().toDateString());
          setTimeout(() => setShowQuestCelebration(false), 5000);
        }
      }
    };

    loadStats();

    window.addEventListener("edutrack_xp_updated", loadStats);
    return () => window.removeEventListener("edutrack_xp_updated", loadStats);
  }, [router]);

  const awardXP = (amount: number) => {
    const { newXp, newLevel, leveledUp } = awardUserXP(amount);
    setXp(newXp);
    setLevel(newLevel);

    if (leveledUp) {
      setShowLevelUp(true);
      setConfettiActive(true);
      setTimeout(() => setShowLevelUp(false), 5000);
    }
  };

  const toggleMission = (id: string) => {
    if (id === "theory") {
      setActiveMissionGuide("To complete the 'NCERT Scholar' quest (+50 XP), click on 'Subjects Hub' or 'NCERT Books' in the sidebar, open a chapter, and read its dynamic AI textbook content!");
    } else if (id === "flashcards") {
      setActiveMissionGuide("To complete the 'Recall Wizard' quest (+50 XP), open any chapter under 'Subjects Hub', go to the 'Flashcards' tab, and promote a card into box 5!");
    } else if (id === "notes") {
      setActiveMissionGuide("To complete the 'Quick Summary' quest (+30 XP), open any chapter under 'Subjects Hub' and load its 'Quick Revision' cheat sheet!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-semibold">Loading academic workspace...</p>
      </div>
    );
  }

  const firstName = user?.displayName?.split(" ")[0] || "Student";
  const initials = (user?.displayName || user?.email || "S").charAt(0).toUpperCase();
  const weakSubjects = profile?.weakSubjects || [];

  // Gamified Leaderboard & Buddies sorting
  const userTotalXp = xp + (level === 1 ? 0 : Array.from({length: level - 1}, (_, i) => (i + 1) * 200).reduce((a, b) => a + b, 0));
  
  const classmates = [
    { name: "Aditya Sharma", totalXp: 950, status: "Active Study ✍️", online: true, avatar: "AS", color: "from-amber-500 to-orange-500" },
    { name: "Priya Nair", totalXp: 720, status: "In Call Arena 📞", online: true, avatar: "PN", color: "from-emerald-400 to-teal-500" },
    { name: `${firstName} (You)`, totalXp: userTotalXp, status: "On Dashboard 🏆", online: true, isSelf: true, avatar: initials, color: "from-indigo-500 to-purple-600" },
    { name: "Rohan Das", totalXp: 340, status: "Idle", online: false, avatar: "RD", color: "from-blue-400 to-cyan-500" },
    { name: "Sneha Patel", totalXp: 180, status: "Active Study ✍️", online: true, avatar: "SP", color: "from-fuchsia-400 to-pink-500" }
  ];

  const skillNodes = [
    { id: "reactions", label: "Chemical Reactions", status: "completed", percent: 100, x: 12, y: 55, color: "stroke-emerald-500 fill-emerald-500/10 text-emerald-450 border-emerald-500/30", desc: "Balance chemical equations and explore corrosion.", keyPoints: ["Balanced equations show conservation of mass.", "Combination vs Decomposition reactions.", "Oxidation is loss of electrons, Reduction is gain."] },
    { id: "acids", label: "Acids & Bases", status: "active", percent: 45, x: 32, y: 25, color: "stroke-indigo-500 fill-indigo-500/10 text-indigo-400 border-indigo-500/30", desc: "Understand pH scales, indicators, and salt families.", keyPoints: ["Acids release H+ ions in solution; Bases release OH-.", "pH < 7 is acidic; pH > 7 is basic.", "Chlor-alkali process creates NaOH, Cl2, and H2."] },
    { id: "metals", label: "Metals & Nonmetals", status: "locked", percent: 0, x: 52, y: 75, color: "stroke-slate-700 fill-slate-800/10 text-slate-500 border-slate-800", desc: "Reactivity series, ionic bonding, and metallurgy.", keyPoints: ["Prerequisite: Complete Acids & Bases first.", "Metals form basic oxides, non-metals form acidic oxides.", "Ionic compounds have high melting points."] },
    { id: "carbon", label: "Carbon Compounds", status: "locked", percent: 0, x: 72, y: 25, color: "stroke-slate-700 fill-slate-800/10 text-slate-500 border-slate-800", desc: "Covalent bonding, isomerism, and functional groups.", keyPoints: ["Prerequisite: Unlock Metals first.", "Catenation is carbon's unique ability to form long chains.", "Saturated vs Unsaturated hydrocarbons."] },
    { id: "life", label: "Life Processes", status: "locked", percent: 0, x: 90, y: 55, color: "stroke-slate-700 fill-slate-800/10 text-slate-500 border-slate-800", desc: "Nutrition, respiration, circulation, and excretion.", keyPoints: ["Prerequisite: Unlock Carbon Compounds first.", "Autotrophic vs Heterotrophic nutrition.", "Double circulation in humans prevents mixing of blood."] }
  ];

  const swiperCards = [
    { id: "card_1", front: "Why do copper vessels lose shine?", back: "Due to basic copper carbonate formation from reaction with moist CO2 and O2." },
    { id: "card_2", front: "What is the pH scale?", back: "A logarithmic scale measuring hydrogen ion concentration, running from 0 (highly acidic) to 14 (highly basic)." },
    { id: "card_3", front: "What is double circulation?", back: "Blood flows through the heart twice for every complete body cycle, preventing oxygenated and deoxygenated blood from mixing." }
  ];

  // Sort classmates by total XP descending
  classmates.sort((a, b) => b.totalXp - a.totalXp);

  // Stagger variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 20 } }
  };

  // Rank badge mapping helper
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-xl shrink-0" title="First Place Gold Crown">👑</span>;
    if (rank === 2) return <span className="text-lg shrink-0" title="Second Place Shield">🥈</span>;
    if (rank === 3) return <span className="text-lg shrink-0" title="Third Place Badge">🥉</span>;
    return <span className="w-5 font-black text-xs text-center font-mono shrink-0 text-slate-500">#{rank}</span>;
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 relative max-w-7xl mx-auto"
    >
      {/* Premium Dashboard Glowing Ambient Meshes */}
      <div className="absolute top-[-10%] right-[5%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-slow" />
      <div className="absolute bottom-[10%] left-[-5%] w-[450px] h-[450px] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-delayed" />
      <div className="absolute top-[40%] left-[30%] w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />

      {/* ── HEADER SECTION ── */}
      <motion.header 
        variants={item} 
        className="flex flex-col md:flex-row justify-between md:items-center gap-6 border-b border-slate-200/50 dark:border-white/5 pb-8"
      >
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/15">
            Premium Academic Space
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-3.5 tracking-tight flex items-center gap-2.5">
            <span className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-slate-200 bg-clip-text text-transparent">
              Welcome back, {firstName}!
            </span>
            <span className="shrink-0 drop-shadow-sm select-none">👋</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2.5 font-bold text-xs">
            {profile?.className || (userClass ? `Class ${userClass}` : "Class 10")} | Language Preference: Hinglish
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="inline-flex items-center gap-2 bg-orange-500/5 dark:bg-orange-500/5 text-orange-600 dark:text-orange-400 px-4.5 py-3 rounded-2xl border border-orange-500/15 font-black text-sm shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 -translate-x-full group-hover:animate-shimmer" />
            <Flame className="w-5 h-5 text-orange-500 animate-flame-glow" /> 
            <span>{streak} Day Streak</span>
          </div>
          <Link href="/setup">
            <button className="text-xs font-extrabold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.04] px-4.5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95">
              Settings & Setup
            </button>
          </Link>
        </div>
      </motion.header>

      {/* ── TWO-COLUMN MAIN LAYOUT ── */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: PRIMARY WORKSPACE (Wide) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* QUICK PREMIUM UTILITY ROW */}
          <motion.section variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.96 }} onClick={() => router.push('/tutor')} className="bg-white/60 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200/50 dark:border-white/10 p-5 rounded-[1.75rem] flex flex-col items-center justify-center text-center cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-emerald-500/15 hover:border-emerald-500/40 transition-all group">
              <Camera className="w-8 h-8 text-emerald-500 mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]" />
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">AI Lens</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.96 }} onClick={() => router.push('/sandbox')} className="bg-white/60 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200/50 dark:border-white/10 p-5 rounded-[1.75rem] flex flex-col items-center justify-center text-center cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-orange-500/15 hover:border-orange-500/40 transition-all group">
              <Zap className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(249,115,22,0.35)]" />
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Sandbox</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.96 }} onClick={() => router.push('/trophies')} className="bg-white/60 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200/50 dark:border-white/10 p-5 rounded-[1.75rem] flex flex-col items-center justify-center text-center cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-yellow-500/15 hover:border-yellow-500/40 transition-all group">
              <Trophy className="w-8 h-8 text-yellow-500 mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(234,179,8,0.35)]" />
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Trophies</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.96 }} onClick={() => router.push('/analytics')} className="bg-white/60 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200/50 dark:border-white/10 p-5 rounded-[1.75rem] flex flex-col items-center justify-center text-center cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-indigo-500/15 hover:border-indigo-500/40 transition-all group">
              <Activity className="w-8 h-8 text-indigo-500 mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(99,102,241,0.35)]" />
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Analytics</span>
            </motion.div>
          </motion.section>
          
          {/* STATS & PROGRESS HUD (Glassmorphic Command Deck) */}
          <motion.section 
            variants={item}
            className="relative bg-gradient-to-br from-indigo-950 via-[#0d1020] to-[#040612] border border-white/5 rounded-3xl p-6.5 shadow-2xl overflow-hidden select-none"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-[-50%] left-[-20%] w-[350px] h-[350px] bg-indigo-500/15 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-[-50%] right-[-20%] w-[350px] h-[350px] bg-pink-500/15 rounded-full blur-[90px] pointer-events-none" />
            
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6 w-full md:w-auto">
                {/* Immersive Circular SVG Level Ring */}
                <div className="relative flex items-center justify-center shrink-0 w-22 h-22 group">
                  <div className="absolute inset-0.5 bg-gradient-to-tr from-indigo-500/15 to-pink-500/15 rounded-full blur-md group-hover:scale-105 transition-transform duration-300" />
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="44"
                      cy="44"
                      r="37"
                      className="stroke-white/[0.03] fill-none"
                      strokeWidth="5"
                    />
                    <motion.circle
                      cx="44"
                      cy="44"
                      r="37"
                      className="stroke-indigo-500 fill-none"
                      strokeWidth="5.5"
                      strokeDasharray={2 * Math.PI * 37}
                      initial={{ strokeDashoffset: 2 * Math.PI * 37 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 37 - ((xp / (level * 200)) * 100 / 100) * 2 * Math.PI * 37 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      strokeLinecap="round"
                      style={{
                        stroke: "url(#progressGradient)"
                      }}
                      filter="drop-shadow(0 0 6px rgba(168, 85, 247, 0.4))"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300 opacity-80 leading-none">Level</span>
                    <span className="text-2.5xl font-black text-white leading-none mt-0.5">{level}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-xl text-white leading-tight flex items-center gap-2">
                    {level <= 1 ? "Study Novice" : level <= 3 ? "Elite Revisionist" : level <= 5 ? "Academic Warrior" : "Grandmaster Scholar"} 🎓
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-indigo-300 font-bold tracking-wide">
                    <Star className="w-3.5 h-3.5 fill-current text-indigo-400" />
                    <span>{xp} / {level * 200} XP to Level UP</span>
                  </div>
                </div>
              </div>

              {/* Progress Detail HUD info */}
              <div className="flex flex-col gap-1 w-full md:w-60">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-right hidden md:block">Progression Tracker</span>
                <div className="w-full bg-[#050710] h-3.5 rounded-full overflow-hidden border border-white/5 shadow-inner relative mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(129,140,248,0.5)]"
                    style={{ width: `${(xp / (level * 200)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <span className="text-xs font-black text-indigo-200 bg-indigo-500/10 px-4 py-2.5 rounded-xl border border-indigo-500/20 uppercase tracking-widest block text-center md:inline-block">
                  {userTotalXp} Total XP
                </span>
              </div>
            </div>
          </motion.section>

          {/* AI & INTERACTIVE STUDY LAB ROW */}
          <motion.section variants={item} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                Study Tools Hub
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* AI Bot Card */}
              <motion.div whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.98 }} onClick={() => router.push('/tutor')} className="group cursor-pointer">
                <div className="bg-white/80 dark:bg-[#0c0f1d]/80 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 p-5 rounded-[2rem] flex flex-col justify-between h-44 transition-all group-hover:border-indigo-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_30px_rgba(99,102,241,0.04)]">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl w-fit text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-xs uppercase tracking-wider">AI Study Bot</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-snug mt-1.5 font-bold">Instant doubt solver & learning coach.</p>
                  </div>
                </div>
              </motion.div>

              {/* Study Hub Card */}
              <motion.div whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.98 }} onClick={() => router.push('/learn')} className="group cursor-pointer">
                <div className="bg-white/80 dark:bg-[#0c0f1d]/80 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 p-5 rounded-[2rem] flex flex-col justify-between h-44 transition-all group-hover:border-emerald-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_30px_rgba(16,185,129,0.04)]">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Book className="w-5 h-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white group-hover:text-emerald-650 dark:group-hover:text-emerald-400 transition-colors text-xs uppercase tracking-wider">Study Hub</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-snug mt-1.5 font-bold">NCERT books & dynamic summaries.</p>
                  </div>
                </div>
              </motion.div>

              {/* Whiteboard Card */}
              <motion.div whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.98 }} onClick={() => router.push('/whiteboard')} className="group cursor-pointer">
                <div className="bg-white/80 dark:bg-[#0c0f1d]/80 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 p-5 rounded-[2rem] flex flex-col justify-between h-44 transition-all group-hover:border-pink-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_30px_rgba(236,72,153,0.04)]">
                  <div className="p-3 bg-pink-500/10 rounded-2xl w-fit text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform">
                    <Palette className="w-5 h-5 drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white group-hover:text-pink-650 dark:group-hover:text-pink-400 transition-colors text-xs uppercase tracking-wider">Whiteboard</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-snug mt-1.5 font-bold">Collaborative sketching & notes canvas.</p>
                  </div>
                </div>
              </motion.div>

              {/* Pomodoro Card */}
              <motion.div whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.98 }} onClick={() => router.push('/pomodoro')} className="group cursor-pointer">
                <div className="bg-white/80 dark:bg-[#0c0f1d]/80 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 p-5 rounded-[2rem] flex flex-col justify-between h-44 transition-all group-hover:border-amber-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_30px_rgba(245,158,11,0.04)]">
                  <div className="p-3 bg-amber-500/10 rounded-2xl w-fit text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <Timer className="w-5 h-5 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-xs uppercase tracking-wider">Focus Timer</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-snug mt-1.5 font-bold">Structured study & break cycles.</p>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.section>

          {/* DYNAMIC CORE STUDY PATH */}
          <motion.section 
            variants={item}
            className="bg-white/65 dark:bg-[#040612]/65 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-8 rounded-[2rem] shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <Compass className="w-6 h-6 text-indigo-650 dark:text-indigo-400" />
                  </div>
                  Daily Study Path
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1.5 ml-1">
                  AI Scheduled Roadmap for CBSE Success
                </p>
              </div>
              <Link href="/plan">
                <button className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase hover:underline">
                  Full Planner <ArrowUpRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Interactive Timeline Flow */}
            <div className="grid md:grid-cols-3 gap-6 relative">
              <div className="hidden md:block absolute top-[45%] inset-x-12 h-[2px] bg-gradient-to-r from-indigo-150/40 via-purple-150/40 to-indigo-150/40 dark:from-white/5 dark:via-white/10 dark:to-white/5 -z-10" />

              {/* Task 1: NCERT Textbook */}
              <Link href="/learn" className="group">
                <div className="bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/5 hover:border-indigo-500/40 p-6 rounded-2xl transition-all duration-350 hover:-translate-y-1.5 hover:shadow-xl h-48 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                      <Book className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/10">Step 1</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-base">NCERT Theory</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed font-bold">Read dynamic AI Textbook chapters without mole concepts.</p>
                  </div>
                </div>
              </Link>

              {/* Task 2: AI Recall Cards */}
              <Link href="/flashcards" className="group">
                <div className="bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/5 hover:border-purple-500/40 p-6 rounded-2xl transition-all duration-350 hover:-translate-y-1.5 hover:shadow-xl h-48 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/10">Step 2</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-base">Spaced Recall</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed font-bold">Master high-yield questions using active Leitner boxes.</p>
                  </div>
                </div>
              </Link>

              {/* Task 3: StudyCircles Chat */}
              <Link href="/groups" className="group">
                <div className="bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/5 hover:border-emerald-500/40 p-6 rounded-2xl transition-all duration-350 hover:-translate-y-1.5 hover:shadow-xl h-48 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/10">Step 3</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-base">StudyCircles</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed font-bold">Join code-based rooms to message friends in real-time.</p>
                  </div>
                </div>
              </Link>
            </div>
          </motion.section>

          {/* SYLLABUS SKILL TREE / MIND MAP */}
          <motion.section 
            variants={item}
            className="bg-white/65 dark:bg-[#040612]/65 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-8 rounded-[2rem] shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <Compass className="w-6 h-6 text-indigo-650 dark:text-indigo-400" />
                  </div>
                  Mastery Mind Map & Syllabus Tree
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1.5 ml-1">
                  Click nodes to open syllabus sheets & trigger mock tests
                </p>
              </div>
            </div>

            {/* Interactive SVG Canvas */}
            <div className="relative w-full bg-slate-950/40 dark:bg-black/35 rounded-2xl border border-slate-200/20 dark:border-white/5 p-4 overflow-x-auto scrollbar-none min-h-[220px]">
              <svg className="w-[800px] h-[160px] mx-auto relative z-10" viewBox="0 0 800 160">
                {/* Connecting Paths with dynamic flows */}
                <path d="M 96 80 Q 176 40 256 40" fill="none" className="stroke-emerald-500/50 animate-laser-flow" strokeWidth="3.5" />
                <path d="M 256 40 Q 336 80 416 120" fill="none" className="stroke-indigo-500/40 animate-laser-flow" strokeWidth="3" />
                <path d="M 416 120 Q 496 80 576 40" fill="none" className="stroke-slate-800" strokeWidth="2" />
                <path d="M 576 40 Q 656 80 720 88" fill="none" className="stroke-slate-800" strokeWidth="2" />

                {/* SVG Node Circles */}
                {skillNodes.map((node, idx) => {
                  const isLocked = node.status === "locked";
                  const isActive = node.status === "active";
                  const isCompleted = node.status === "completed";
                  const cx = node.x * 8; // scale x coordinate
                  const cy = node.y * 1.5; // scale y coordinate

                  return (
                    <g 
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer group select-none"
                    >
                      {/* Outer glowing ring for active node */}
                      {isActive && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="28"
                          className="stroke-indigo-500 fill-none animate-pulse-glow"
                          strokeWidth="2.5"
                          filter="drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))"
                        />
                      )}
                      
                      {/* Completed Glow */}
                      {isCompleted && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="26"
                          className="stroke-emerald-500/20 fill-none"
                          strokeWidth="3"
                          filter="drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))"
                        />
                      )}
                      
                      <circle
                        cx={cx}
                        cy={cy}
                        r="21"
                        className={cn(
                          "transition-all duration-300 stroke-2 fill-slate-905/90 group-hover:scale-110",
                          isCompleted ? "stroke-emerald-500 fill-emerald-950/20" : "",
                          isActive ? "stroke-indigo-500 fill-indigo-950/20" : "",
                          isLocked ? "stroke-slate-800 fill-slate-950/40" : ""
                        )}
                      />
                      
                      {/* Node representation (completed: Check, Active: star, Locked: Lock) */}
                      {isCompleted ? (
                        <path 
                          d={`M ${cx - 5.5} ${cy} L ${cx - 2} ${cy + 4.5} L ${cx + 5} ${cy - 4}`}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ) : isLocked ? (
                        <g transform={`translate(${cx - 5.5}, ${cy - 6.5}) scale(0.65)`}>
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="#64748b" strokeWidth="2.5"/>
                        </g>
                      ) : (
                        <text
                          x={cx}
                          y={cy + 4}
                          textAnchor="middle"
                          className="text-xs font-black fill-indigo-400 font-mono"
                        >
                          {node.percent}%
                        </text>
                      )}

                      {/* Floating tooltip label */}
                      <text
                        x={cx}
                        y={cy - 30}
                        textAnchor="middle"
                        className="text-[10px] font-black fill-slate-400 opacity-80 group-hover:opacity-100 uppercase tracking-wider transition-opacity"
                      >
                        {node.label.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </motion.section>

          {/* ACTIVE MEMORY STUDY SWIPER */}
          <motion.section 
            variants={item}
            className="bg-white/65 dark:bg-[#040612]/65 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-8 rounded-[2rem] shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 rounded-xl">
                    <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  Supersonic Card Swiper
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1.5 ml-1">
                  Drag cards: Right to Master (+50 XP), Left to Study Later
                </p>
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center min-h-[220px] bg-slate-950/40 dark:bg-black/35 rounded-2xl border border-slate-200/20 dark:border-white/5 p-6 overflow-hidden">
              {swiperIndex < swiperCards.length ? (
                <div className="relative w-full max-w-sm h-40 flex items-center justify-center">
                  {swiperCards.map((card, idx) => (
                    <SwiperCard
                      key={card.id}
                      card={card}
                      index={idx}
                      activeIndex={swiperIndex}
                      totalCards={swiperCards.length}
                      onSwipeLeft={() => setSwiperIndex(prev => prev + 1)}
                      onSwipeRight={() => {
                        awardXP(50);
                        setConfettiActive(true);
                        setSwiperIndex(prev => prev + 1);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                    <Trophy className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-base font-black text-white">All Cards Cleared! 🏆</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">Great job! You gained bonus XP revision points.</p>
                  <button 
                    onClick={() => setSwiperIndex(0)}
                    className="mt-4 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10"
                  >
                    Reset Deck
                  </button>
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* HIGH-YIELD PYQ & EXAM HUB */}
          {userClass === 10 && (
            <motion.section 
              variants={item}
              className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/15 rounded-[2rem] p-8 shadow-sm hover:shadow-xl relative overflow-hidden group"
            >
              <div className="absolute right-6 top-6 opacity-[0.05] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 pointer-events-none">
                <Trophy className="w-40 h-40 text-amber-500" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3.5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider border border-amber-500/25">
                  <Award className="w-4 h-4" /> Board Exam Practice
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-4">Jump into PYQ Subject Hub</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2.5 max-w-xl leading-relaxed font-bold">
                  Practice previous years' board exam question sheets mapped exactly to CBSE grading schemes. Submit answers and receive detailed AI evaluations.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link href="/pyq">
                    <button className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl hover:scale-[1.03] active:scale-[0.98] transition-all shadow-md shadow-amber-500/10 border border-white/10">
                      Start Grading Practice
                    </button>
                  </Link>
                  <Link href="/ncert">
                    <button className="bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/5 transition-all">
                      Browse NCERT Books
                    </button>
                  </Link>
                </div>
              </div>
            </motion.section>
          )}

        </div>

        {/* RIGHT COLUMN: SIDEBAR STATS & QUESTBOARD */}
        <div className="space-y-8">
          
          {/* DAILY QUESTBOARD (MISSIONS) */}
          <motion.section 
            variants={item} 
            className="bg-white/60 dark:bg-[#040612]/60 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-extrabold flex items-center gap-3 mb-6 text-slate-900 dark:text-white">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Trophy className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
              </div>
              Daily Quests
            </h3>
            
            <div className="space-y-3.5">
              {missions.map((mission) => (
                <div 
                  key={mission.id}
                  onClick={() => toggleMission(mission.id)}
                  className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 select-none ${
                    mission.completed
                      ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 shadow-sm shadow-emerald-500/5'
                      : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200/30 dark:border-white/5 hover:border-indigo-500/40 hover:scale-[1.01]'
                  }`}
                >
                  {/* Dynamic Spring Checkbox */}
                  <motion.div 
                    whileTap={{ scale: 0.8 }}
                    className={`w-5.5 h-5.5 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                      mission.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white scale-[1.05] shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                        : 'border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 group-hover:border-indigo-500/50'
                    }`}
                  >
                    {mission.completed && (
                      <motion.svg 
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="w-3.5 h-3.5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth="3.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </motion.div>

                  <div className="flex-1 overflow-hidden">
                    <p className={`font-black text-xs transition-all truncate ${
                      mission.completed 
                        ? 'text-slate-400 dark:text-slate-500 line-through font-semibold' 
                        : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {mission.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-snug mt-0.5 truncate font-bold">{mission.desc}</p>
                  </div>
                  
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 border transition-all ${
                    mission.completed
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 group-hover:bg-indigo-500/15'
                  }`}>
                    +{mission.xp} XP
                  </span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* CLASSMATES LEADERBOARD & STUDY BUDDIES */}
          <motion.section 
            variants={item} 
            className="bg-white/60 dark:bg-[#040612]/60 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold flex items-center gap-3 text-slate-900 dark:text-white">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <Users className="w-5 h-5 text-indigo-650 dark:text-indigo-400" /> 
                </div>
                Classmates
              </h3>
              <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/25 uppercase tracking-wide">
                Leaderboard
              </span>
            </div>
            
            <div className="space-y-3">
              {classmates.map((buddy, index) => {
                const rank = index + 1;
                return (
                  <div 
                    key={buddy.name} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl border transition-all duration-300",
                      buddy.isSelf
                        ? "bg-indigo-500/10 dark:bg-indigo-500/10 border-indigo-500/45 shadow-[0_0_12px_rgba(99,102,241,0.1)] shimmer-border"
                        : "bg-slate-50/50 dark:bg-white/[0.01] border-slate-200/30 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getRankBadge(rank)}
                      
                      <div className="relative shrink-0 select-none">
                        <div className={cn(
                          "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-black text-xs shadow-sm border border-white/10",
                          buddy.color
                        )}>
                          {buddy.avatar}
                        </div>
                        {buddy.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className={cn(
                          "text-xs truncate font-black leading-tight",
                          buddy.isSelf ? "text-indigo-950 dark:text-white" : "text-slate-800 dark:text-slate-250"
                        )}>
                          {buddy.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-none mt-1 font-bold">
                          Lvl {buddy.isSelf ? level : Math.floor(buddy.totalXp / 200) + 1} • {buddy.totalXp} XP • <span className="text-indigo-400 font-semibold">{buddy.status}</span>
                        </p>
                      </div>
                    </div>

                    {!buddy.isSelf && (
                      <button
                        onClick={() => router.push("/groups")}
                        className="p-2 bg-white dark:bg-white/5 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15 border border-slate-200 dark:border-white/5 hover:border-indigo-500/25 rounded-xl text-slate-500 hover:text-indigo-650 dark:text-slate-400 dark:hover:text-indigo-400 shadow-sm transition-all"
                        title={`Message ${buddy.name}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* TARGET SUBJECT AREAS (WEAK AREAS) */}
          <motion.section 
            variants={item} 
            className="bg-white/60 dark:bg-[#040612]/60 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold flex items-center gap-3 text-slate-900 dark:text-white">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <Target className="w-5 h-5 text-emerald-650 dark:text-emerald-400" /> 
                </div>
                Target Areas
              </h3>
              <Link href="/analytics">
                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase hover:underline cursor-pointer">
                  Stats
                </span>
              </Link>
            </div>
            
            <div className="space-y-3.5">
              {weakSubjects.length > 0 ? (
                weakSubjects.map((subject, idx) => (
                  <div key={idx} className="group bg-slate-50/50 dark:bg-white/[0.01] hover:bg-indigo-500/5 dark:hover:bg-indigo-550/5 p-4.5 rounded-2xl flex justify-between items-center transition-all border border-slate-200/30 dark:border-white/5 hover:border-indigo-500/20">
                    <div className="overflow-hidden mr-2">
                      <p className="font-black text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{subject}</p>
                      <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Needs Focus
                      </p>
                    </div>
                    <Link href="/tutor" className="shrink-0">
                      <button className="text-[10px] font-black uppercase tracking-wider bg-white dark:bg-white/5 text-indigo-650 dark:text-indigo-400 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                        Train
                      </button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 bg-slate-50/30 dark:bg-white/[0.01] rounded-2xl border border-slate-200/30 dark:border-white/5">
                  <p className="text-slate-650 dark:text-slate-350 font-black text-sm mb-1">Looking Great!</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold">No weak areas identified yet. Practice quizzes to check performance.</p>
                </div>
              )}
            </div>
          </motion.section>

        </div>

      </div>

      {/* ── LEVEL UP MODAL CELEBRATION ── */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-10 right-10 z-50 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-[2rem] p-6 shadow-2xl flex items-center gap-5 border border-white/20 select-none pointer-events-none"
          >
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0 border border-white/30 animate-bounce">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="font-black text-xl leading-none">Level Up! 🎉</h4>
              <p className="text-sm font-bold opacity-90 mt-1">You reached Level {level}! Keep studying!</p>
            </div>
          </motion.div>
        )}

        {showQuestCelebration && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: 50, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-50 bg-gradient-to-r from-fuchsia-600 to-indigo-650 text-white rounded-[2rem] p-6.5 shadow-2xl flex items-center gap-4.5 border border-white/10 select-none"
          >
            <div className="w-13 h-13 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/25 animate-pulse">
              <Sparkles className="w-6.5 h-6.5 text-yellow-300" />
            </div>
            <div>
              <h4 className="font-black text-lg leading-none">All Quests Completed! 🏆</h4>
              <p className="text-xs font-bold opacity-90 mt-1.5">Fantastic job! You've conquered all daily study missions!</p>
            </div>
          </motion.div>
        )}

        {selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0c0f1d]/95 backdrop-blur-xl border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-7 text-left text-white"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/25">CBSE Syllabus Node</span>
                  <h3 className="text-2xl font-black mt-2 leading-none">{selectedNode.label}</h3>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)} 
                  className="p-2 bg-white/5 hover:bg-white/10 hover:text-red-400 rounded-xl transition-all font-black text-xs uppercase border border-white/5"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/[0.02] px-4 py-2.5 rounded-xl border border-white/5">
                  <span className="text-xs font-semibold text-slate-400">Mastery Progress</span>
                  <span className="text-xs font-black text-indigo-400">{selectedNode.percent}% Complete</span>
                </div>

                <p className="text-slate-400 text-sm font-semibold leading-relaxed">{selectedNode.desc}</p>
                
                <div className="bg-white/[0.02] border border-white/5 p-4.5 rounded-2xl">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mb-2">High-Yield Board Highlights</h4>
                  <ul className="space-y-2">
                    {selectedNode.keyPoints.map((point: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-300 font-bold flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5"></span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link href="/mocktest">
                    <button 
                      onClick={() => setSelectedNode(null)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-650 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl border border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Trophy className="w-4 h-4" /> Start Mock Test
                    </button>
                  </Link>
                  <Link href="/learn">
                    <button 
                      onClick={() => setSelectedNode(null)}
                      className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl border border-white/5 transition-all"
                    >
                      <Book className="w-4 h-4" /> Read Theory
                    </button>
                  </Link>
                </div>
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
              className="w-full max-w-md bg-white dark:bg-[#0c0f1d] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-2">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Quest Guide</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-wider">How to earn XP</p>
              </div>
              
              <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-bold">
                {activeMissionGuide}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setActiveMissionGuide(null)}
                  className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md shadow-indigo-500/10"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />
    </motion.div>
  );
}
