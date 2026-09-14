"use client";

import { 
  Brain, Flame, Target, Book, BookOpen, ChevronRight, Loader2, Trophy, 
  Sparkles, Compass, ArrowUpRight, Users, Award, MessageCircle, 
  Copy, CheckCheck, Camera, Activity, Palette, Timer, Star, Zap, Lock, RefreshCw,
  GraduationCap, Video, Shield, Globe, Mic, Radio, GitFork, Sliders, FileText, Gamepad2,
  CheckCircle2, Sun, Moon, LayoutGrid, Eye, Maximize2, AlarmClock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useMotionTemplate } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Confetti from "@/components/Confetti";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DailyQuestionWidget } from "@/components/dashboard/DailyQuestionWidget";
import { ClassroomLauncher } from "@/components/dashboard/ClassroomLauncher";
import FeatureSpotlightTour from "@/components/FeatureSpotlightTour";
import { cn } from "@/lib/utils";
import { useGamificationStore } from "@/store/useGamificationStore";
import { useProfileStore } from "@/store/useProfileStore";

// Animated numeric counter using Framer Motion physics
const AnimatedCounter = ({ value, className }: { value: number; className?: string }) => {
  const motionVal = useMotionValue(value);
  const springVal = useSpring(motionVal, { damping: 25, stiffness: 120 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    return springVal.on("change", (v) => {
      setDisplay(Math.round(v));
    });
  }, [springVal]);

  return <span className={className}>{display.toLocaleString()}</span>;
};

// Reusable 3D Tilt Card for Bento Grid with enhanced hover physics & specular reflection
const TiltCard = ({ children, className, href, id }: { children: React.ReactNode, className?: string, href: string, id?: string }) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 15;
    const y = (e.clientY - top - height / 2) / 15;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const rotateX = useSpring(useTransform(mouseY, [-15, 15], [12, -12]), { damping: 20, stiffness: 300 });
  const rotateY = useSpring(useTransform(mouseX, [-15, 15], [-12, 12]), { damping: 20, stiffness: 300 });

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }} 
      style={{ perspective: 1200 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link href={href} passHref legacyBehavior>
        <motion.a
          id={id}
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className={cn("block relative group/card transition-shadow duration-300", className)}
        >
          {/* Internal hover specular glare that tracks cursor over the card */}
          <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
               style={{
                 background: `radial-gradient(300px circle at ${mouseX.get() * 15 + 150}px ${mouseY.get() * 15 + 100}px, rgba(255,255,255,0.08), transparent 45%)`
               }}
          />
          {children}
        </motion.a>
      </Link>
    </motion.div>
  );
};


export default function Dashboard() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const router = useRouter();

  const { userClass, userLanguage, nickname, setUserClass, setUserLanguage, setNickname } = useProfileStore();
  const { xp, level, streak, missions, initializeMissions, awardXP } = useGamificationStore();
  
  const [activeTab, setActiveTab] = useState<"focus" | "tools" | "social">("focus");
  const [zenMode, setZenMode] = useState<boolean>(false);

  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [activeMissionGuide, setActiveMissionGuide] = useState<string | null>(null);
  const [equippedTitle, setEquippedTitle] = useState<string | null>(null);
  const [equippedFrame, setEquippedFrame] = useState<string | null>(null);
  const [justCompletedQuestId, setJustCompletedQuestId] = useState<string | null>(null); // For stamp animation
  
  const [whitelistSites, setWhitelistSites] = useState<{url: string, status: "checking" | "approved" | "rejected"}[]>([]);

  // Interactive Global Ambient Cursor Illumination
  const bgMouseX = useMotionValue(0);
  const bgMouseY = useMotionValue(0);
  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    bgMouseX.set(e.clientX);
    bgMouseY.set(e.clientY);
  };
  const bgGlow = useMotionTemplate`radial-gradient(750px circle at ${bgMouseX}px ${bgMouseY}px, rgba(99, 102, 241, 0.08), transparent 80%)`;

  useEffect(() => {
    initializeMissions();
    
    if (typeof window !== "undefined") {
      const storedTitle = localStorage.getItem("edutrack_equipped_title");
      const storedFrame = localStorage.getItem("edutrack_equipped_frame");
      if (storedTitle) setEquippedTitle(storedTitle);
      if (storedFrame) setEquippedFrame(storedFrame);
    }

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

    const handleShopUpdate = (e: any) => {
      if (e.detail?.equippedTitle !== undefined) setEquippedTitle(e.detail.equippedTitle);
      if (e.detail?.equippedFrame !== undefined) setEquippedFrame(e.detail.equippedFrame);
    };
    window.addEventListener("edutrack_shop_updated", handleShopUpdate);

    const handleWhitelistAdd = (e: any) => {
      if (e.detail?.url) {
        const newUrl = new URL(e.detail.url.startsWith("http") ? e.detail.url : `https://${e.detail.url}`).hostname;
        setWhitelistSites(prev => [{url: newUrl, status: "checking"}, ...prev]);
        
        // Simulate AI checking
        setTimeout(() => {
          setWhitelistSites(prev => prev.map(site => 
            site.url === newUrl ? { ...site, status: Math.random() > 0.2 ? "approved" : "rejected" } : site
          ));
        }, 1500);
      }
    };
    window.addEventListener("edutrack_whitelist_add", handleWhitelistAdd);

    return () => {
      window.removeEventListener("edutrack_profile_updated", handleProfileUpdate);
      window.removeEventListener("edutrack_xp_updated", handleXpUpdate);
      window.removeEventListener("edutrack_shop_updated", handleShopUpdate);
      window.removeEventListener("edutrack_whitelist_add", handleWhitelistAdd);
    };
  }, []);

  const handleAwardXP = (amount: number) => {
    const { newXp, newLevel, leveledUp } = awardXP(amount);

    if (leveledUp) {
      setShowLevelUp(true);
      setConfettiActive(true);
      // Auto close after 5s if user doesn't click
      setTimeout(() => setShowLevelUp(false), 5000);
    }
  };

  const toggleMission = (id: string) => {
    const mission = missions.find(m => m.id === id);
    if (mission?.completed) {
      // Small feedback that it's already done
      setJustCompletedQuestId(id);
      setTimeout(() => setJustCompletedQuestId(null), 1000);
      return;
    }

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
  const levelXpRequirement = level * 200;
  const xpPercentage = Math.min(100, Math.max(0, (xp / levelXpRequirement) * 100));
  
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  return (
    <motion.div onMouseMove={handleGlobalMouseMove} className="space-y-6 relative max-w-7xl mx-auto pb-12">
      {/* Interactive Global Cursor Ambient Glow */}
      <motion.div className="fixed inset-0 z-0 pointer-events-none" style={{ background: bgGlow }} />

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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {/* ── ZEN FOCUS VIEW (MINIMALIST DISTRACTION-FREE) ── */}
        {zenMode ? (
          <motion.div 
            key="zen"
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="space-y-6"
          >
            {/* Zen Hero Card */}
            <div className="premium-glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-500/20 bg-emerald-950/10 text-center relative overflow-hidden">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <Compass className="w-7 h-7" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Calm & Focused Study Mode
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto mt-2 leading-relaxed">
                All visual distractions and extra cards are hidden. Add websites to your whitelist or use our built-in focus tools to earn XP.
              </p>

              {/* Focus Tools / Whitelist Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8 text-left">
                {/* Left: Built-in Zen Tools */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> Focus Tools
                  </h3>
                  <div className="space-y-3">
                    <Link href="/learn" className="flex items-center gap-4 p-3 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-2xl transition-all group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 text-emerald-400 transition-colors">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white">Study Hub</h4>
                        <p className="text-[11px] text-slate-400">Read NCERT chapters</p>
                      </div>
                    </Link>
                    <Link href="/pomodoro" className="flex items-center gap-4 p-3 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 rounded-2xl transition-all group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="p-2 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 text-rose-400 transition-colors">
                        <Timer className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white">Focus Timer</h4>
                        <p className="text-[11px] text-slate-400">25-min Pomodoro cycles (+XP)</p>
                      </div>
                    </Link>
                    <Link href="/tutor" className="flex items-center gap-4 p-3 bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30 rounded-2xl transition-all group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 text-indigo-400 transition-colors">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white">AI Tutor</h4>
                        <p className="text-[11px] text-slate-400">Ask 1-on-1 doubts</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Right: AI Whitelist Manager */}
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                  <h3 className="font-bold text-white mb-1 flex items-center gap-2 relative z-10">
                    <Shield className="w-4 h-4 text-emerald-400" /> AI Web Filter Whitelist
                  </h3>
                  <p className="text-xs text-emerald-100/60 mb-4 relative z-10">Add websites. AI verifies if they are relevant to your Class {userClass} subjects before granting access.</p>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const el = e.currentTarget.elements.namedItem("urlInput") as HTMLInputElement;
                    if (el && el.value) {
                      // Trigger AI simulation logic (Mocked for dashboard)
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("edutrack_whitelist_add", { detail: { url: el.value } }));
                      }
                      el.value = "";
                    }
                  }} className="flex gap-2 relative z-10 mb-4">
                    <input 
                      name="urlInput"
                      type="url" 
                      placeholder="e.g. https://khanacademy.org" 
                      required
                      className="flex-1 bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                    />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors shadow-md shadow-emerald-900/50 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Check
                    </button>
                  </form>

                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-100 truncate max-w-[180px] sm:max-w-[200px]">ncert.nic.in</span>
                      </div>
                      <span className="text-[10px] uppercase font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">Auto-Approved</span>
                    </div>
                    
                    <AnimatePresence>
                      {whitelistSites.map((site, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              site.status === "checking" ? "bg-amber-400 animate-ping" : 
                              site.status === "approved" ? "bg-emerald-400" : "bg-red-400"
                            )} />
                            <span className={cn(
                              "text-sm font-semibold truncate max-w-[180px] sm:max-w-[200px]",
                              site.status === "checking" ? "text-amber-100" : 
                              site.status === "approved" ? "text-emerald-100" : "text-red-200 line-through opacity-70"
                            )}>{site.url}</span>
                          </div>
                          {site.status === "checking" && <span className="text-[10px] uppercase font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">AI Checking...</span>}
                          {site.status === "approved" && <span className="text-[10px] uppercase font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">Approved</span>}
                          {site.status === "rejected" && <span className="text-[10px] uppercase font-black text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30">Distraction Blocked</span>}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {whitelistSites.length === 0 && (
                      <div className="text-center p-3 border border-dashed border-white/10 rounded-xl bg-white/5 text-xs text-slate-500">
                        Add a site to verify via AI...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Minimal Daily Question */}
            <DailyQuestionWidget />
          </motion.div>
        ) : (
          /* ── STANDARD MODULAR BENTO DASHBOARD ── */
          <motion.div 
            key="standard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* ── CLEAN TAB NAVIGATOR ── */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl w-full sm:w-fit overflow-x-auto snap-x snap-mandatory hide-scrollbar relative">
              <button
                onClick={() => setActiveTab("focus")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 snap-center relative z-10",
                  activeTab === "focus" ? "text-white shadow-md" : "text-slate-400 hover:text-white"
                )}
              >
                {activeTab === "focus" && <motion.div layoutId="dashboardTab" className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-600/30" />}
                <Compass className="w-3.5 h-3.5" />
                <span>Today's Focus</span>
              </button>

              <button
                onClick={() => setActiveTab("tools")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 snap-center relative z-10",
                  activeTab === "tools" ? "text-white shadow-md" : "text-slate-400 hover:text-white"
                )}
              >
                {activeTab === "tools" && <motion.div layoutId="dashboardTab" className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-600/30" />}
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore AI & Labs</span>
              </button>

              <button
                onClick={() => setActiveTab("social")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 snap-center relative z-10",
                  activeTab === "social" ? "text-white shadow-md" : "text-slate-400 hover:text-white"
                )}
              >
                {activeTab === "social" && <motion.div layoutId="dashboardTab" className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-600/30" />}
                <Users className="w-3.5 h-3.5" />
                <span>Classroom & Progress</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* ── TAB 1: TODAY'S FOCUS ── */}
              {activeTab === "focus" && (
                <motion.div 
                  key="tab-focus"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Top Compact Hero Bar: Level HUD + Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Level HUD Card with Circular SVG */}
                    <motion.div variants={item} id="tour-stats-hud" className="md:col-span-1 p-[1px] rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative group overflow-hidden shadow-lg shadow-indigo-500/10">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500 rounded-3xl" />
                      <div className="bg-slate-950/80 backdrop-blur-2xl rounded-[23px] h-full p-5 flex flex-col justify-between relative z-10 overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
                        <div className="flex items-start justify-between gap-4">
                          {/* Circular Progress Ring */}
                          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="45" fill="none" className="stroke-indigo-900/50" strokeWidth="8" />
                              <motion.circle 
                                cx="50" cy="50" r="45" fill="none" 
                                className="stroke-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]" 
                                strokeWidth="8" strokeLinecap="round"
                                initial={{ strokeDasharray: "283", strokeDashoffset: "283" }}
                                animate={{ strokeDashoffset: 283 - (283 * xpPercentage) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="font-black text-base text-white">L{level}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">Total Score</span>
                            <span className="text-xl font-black text-white font-mono bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                              <AnimatedCounter value={userTotalXp} /> XP
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5 drop-shadow-sm">
                            {equippedTitle ? (
                              equippedTitle === "title-topper" ? "🏆 CBSE All-India Topper" :
                              equippedTitle === "title-prodigy" ? "⚛️ Quantum Prodigy" :
                              equippedTitle === "title-wizard" ? "📐 Math Olympiad Wizard" :
                              equippedTitle === "title-feynman" ? "🧠 Feynman Master" :
                              equippedTitle === "title-polyglot" ? "🗣️ Linguistic Polyglot" : "📜 NCERT Grand Archivist"
                            ) : (level <= 1 ? "Study Novice" : level <= 3 ? "Elite Scholar" : "Grandmaster")}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                                initial={{ width: 0 }}
                                animate={{ width: `${xpPercentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                            </div>
                            <span className="text-[10px] text-indigo-300 font-bold whitespace-nowrap">
                              <AnimatedCounter value={xp} /> / {levelXpRequirement} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Quick 4 Core Shortcuts */}
                    <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <motion.div variants={item} className="h-full">
                        <Link href="/lens" id="tour-quick-lens" className="h-full group relative flex flex-col items-center justify-center p-5 rounded-3xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/20">
                          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-emerald-500 transition-all duration-300 shadow-inner">
                            <Camera className="w-6 h-6 text-emerald-400 group-hover:text-white transition-colors" />
                          </div>
                          <span className="text-sm font-black text-emerald-100 group-hover:text-white transition-colors">AI Lens</span>
                        </Link>
                      </motion.div>
                      <motion.div variants={item} className="h-full">
                        <Link href="/tutor" id="tour-tools-aibot" className="h-full group relative flex flex-col items-center justify-center p-5 rounded-3xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/20">
                          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-500 transition-all duration-300 shadow-inner">
                            <MessageCircle className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" />
                          </div>
                          <span className="text-sm font-black text-indigo-100 group-hover:text-white transition-colors">AI Tutor</span>
                        </Link>
                      </motion.div>
                      <motion.div variants={item} className="h-full">
                        <Link href="/learn" className="h-full group relative flex flex-col items-center justify-center p-5 rounded-3xl bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20">
                          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-purple-500 transition-all duration-300 shadow-inner">
                            <BookOpen className="w-6 h-6 text-purple-400 group-hover:text-white transition-colors" />
                          </div>
                          <span className="text-sm font-black text-purple-100 group-hover:text-white transition-colors">Study Hub</span>
                        </Link>
                      </motion.div>
                      <motion.div variants={item} className="h-full">
                        <Link href="/whiteboard" className="h-full group relative flex flex-col items-center justify-center p-5 rounded-3xl bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20">
                          <div className="absolute inset-0 bg-gradient-to-b from-pink-500/0 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-pink-500 transition-all duration-300 shadow-inner">
                            <Palette className="w-6 h-6 text-pink-400 group-hover:text-white transition-colors" />
                          </div>
                          <span className="text-sm font-black text-pink-100 group-hover:text-white transition-colors">Whiteboard</span>
                        </Link>
                      </motion.div>
                    </div>

                  </div>

                  {/* Main Content Grid: Daily Challenge + Daily Quests + Flashcard Warmup */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Today's Question + Flashcard Swiper */}
                    <div className="lg:col-span-2 space-y-6">
                      <motion.div variants={item}>
                        <DailyQuestionWidget />
                      </motion.div>
                    </div>

                    {/* Right Column: Daily Quests */}
                    <div className="space-y-6">
                      <motion.div variants={item} className="premium-glass-panel p-6 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-5 relative z-10">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="p-2 bg-indigo-500/20 rounded-xl">
                              <Trophy className="w-5 h-5 text-indigo-400" />
                            </div>
                            Today's Quests
                          </h3>
                          <span className="text-xs font-black text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30 shadow-inner">
                            {missions.filter(m => m.completed).length} / {missions.length}
                          </span>
                        </div>

                        <div className="space-y-3 relative z-10">
                          {missions.map((mission) => (
                            <motion.div 
                              layout
                              key={mission.id}
                              onClick={() => toggleMission(mission.id)}
                              whileHover={!mission.completed ? { scale: 1.02 } : {}}
                              whileTap={!mission.completed ? { scale: 0.98 } : {}}
                              className={cn(
                                "p-3.5 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer select-none relative overflow-hidden group/quest",
                                mission.completed 
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-slate-400" 
                                  : "bg-slate-900/40 border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-white"
                              )}
                            >
                              {/* Stamp animation layer */}
                              <AnimatePresence>
                                {justCompletedQuestId === mission.id && (
                                  <motion.div
                                    initial={{ scale: 3, opacity: 0, rotate: -20 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-[2px] z-10"
                                  >
                                    <span className="text-emerald-400 font-black tracking-widest uppercase border-4 border-emerald-400 px-3 py-1 rounded-xl rotate-12 bg-black/50 shadow-lg">Completed</span>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-500",
                                mission.completed 
                                  ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                                  : "border-slate-600 bg-slate-800 group-hover/quest:border-indigo-400"
                              )}>
                                {mission.completed && <CheckCircle2 className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-bold truncate transition-all duration-500", mission.completed && "opacity-60 text-emerald-100")}>
                                  {mission.title}
                                </p>
                                <p className={cn("text-[11px] truncate mt-0.5", mission.completed ? "text-emerald-500/60" : "text-slate-400")}>{mission.desc}</p>
                              </div>
                              <span className={cn(
                                "text-[10px] font-black shrink-0 px-2 py-1 rounded-lg border",
                                mission.completed
                                  ? "text-emerald-500/50 border-emerald-500/20 bg-emerald-500/5"
                                  : "text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-sm"
                              )}>
                                +{mission.xp} XP
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Target Weak Subjects */}
                      {weakSubjects.length > 0 && (
                        <motion.div variants={item} className="premium-glass-panel p-5 rounded-3xl border border-rose-500/20 group hover:border-rose-500/40 transition-colors">
                          <h4 className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-3">
                            <Target className="w-3.5 h-3.5" /> Weak Subject Focus
                          </h4>
                          <div className="space-y-2">
                            {weakSubjects.map((sub, i) => (
                              <div key={i} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                <span className="text-xs font-bold text-white truncate">{sub}</span>
                                <Link href="/tutor" className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg hover:bg-indigo-500/30 transition-all hover:scale-105">
                                  Practice
                                </Link>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                    </div>

                  </div>
                </motion.div>
              )}

              {/* ── TAB 2: EXPLORE AI & LABS (BENTO SUITE) ── */}
              {activeTab === "tools" && (
                <motion.div 
                  key="tab-tools"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <motion.div variants={item}>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">AI Tools & Interactive Study Labs</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Explore Next-Gen interactive STEM simulations, oral examiners, and collaborative spaces.</p>
                  </motion.div>

                  {/* Bento Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* 1. AI Doubt Lens */}
                    <TiltCard href="/lens" className="premium-glass-panel p-6 rounded-3xl border border-emerald-500/20 hover:border-emerald-500/50 transition-colors flex flex-col justify-between h-48">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover/card:scale-110 group-hover/card:bg-emerald-500 group-hover/card:text-white transition-all duration-300">
                          <Camera className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">Camera OCR</span>
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-black text-base text-white group-hover/card:text-emerald-400 transition-colors">AI Doubt Lens</h4>
                        <p className="text-slate-400 text-xs mt-1">Upload or snap any textbook diagram or handwritten equation for instant step-by-step solutions.</p>
                      </div>
                    </TiltCard>

                    {/* 2. Simulation Sandbox */}
                    <TiltCard href="/sandbox" className="premium-glass-panel p-6 rounded-3xl border border-amber-500/20 hover:border-amber-500/50 transition-colors flex flex-col justify-between h-48">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 group-hover/card:scale-110 group-hover/card:bg-amber-500 group-hover/card:text-white transition-all duration-300">
                          <Zap className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">Interactive Lab</span>
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-black text-base text-white group-hover/card:text-amber-400 transition-colors">Science Sandbox</h4>
                        <p className="text-slate-400 text-xs mt-1">Mix real reagents in a beaker, test pH colors, and trigger interactive chemistry reactions in real-time.</p>
                      </div>
                    </TiltCard>

                    {/* 3. AI Voice Viva */}
                    <TiltCard href="/viva" className="premium-glass-panel p-6 rounded-3xl border border-purple-500/20 hover:border-purple-500/50 transition-colors flex flex-col justify-between h-48">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 group-hover/card:scale-110 group-hover/card:bg-purple-500 group-hover/card:text-white transition-all duration-300">
                          <Mic className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">Oral Practice</span>
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-black text-base text-white group-hover/card:text-purple-400 transition-colors">AI Voice Viva</h4>
                        <p className="text-slate-400 text-xs mt-1">Conversational oral board practical examiner with real-time speech dialogue and score feedback.</p>
                      </div>
                    </TiltCard>

                    {/* 4. Whiteboard */}
                    <TiltCard href="/whiteboard" className="premium-glass-panel p-6 rounded-3xl border border-pink-500/20 hover:border-pink-500/50 transition-colors flex flex-col justify-between h-48">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400 group-hover/card:scale-110 group-hover/card:bg-pink-500 group-hover/card:text-white transition-all duration-300">
                          <Palette className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">Canvas</span>
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-black text-base text-white group-hover/card:text-pink-400 transition-colors">Smart Whiteboard</h4>
                        <p className="text-slate-400 text-xs mt-1">Draw, sketch formulas, and have AI solve handwritten equations directly on your canvas.</p>
                      </div>
                    </TiltCard>

                    {/* 5. Battle Quiz Arena */}
                    <TiltCard href="/arena" className="premium-glass-panel p-6 rounded-3xl border border-rose-500/20 hover:border-rose-500/50 transition-colors flex flex-col justify-between h-48">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400 group-hover/card:scale-110 group-hover/card:bg-rose-500 group-hover/card:text-white transition-all duration-300">
                          <Gamepad2 className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">Multiplayer</span>
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-black text-base text-white group-hover/card:text-rose-400 transition-colors">Quiz Battle Arena</h4>
                        <p className="text-slate-400 text-xs mt-1">Compete against classmates in fast-paced real-time live question duels with powerups.</p>
                      </div>
                    </TiltCard>

                    {/* 6. Formula & Cheatsheet Vault */}
                    <TiltCard href="/formulas" className="premium-glass-panel p-6 rounded-3xl border border-cyan-500/20 hover:border-cyan-500/50 transition-colors flex flex-col justify-between h-48">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover/card:scale-110 group-hover/card:bg-cyan-500 group-hover/card:text-white transition-all duration-300">
                          <Compass className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">Quick Revision</span>
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-black text-base text-white group-hover/card:text-cyan-400 transition-colors">Formula Vault</h4>
                        <p className="text-slate-400 text-xs mt-1">High-yield equations, periodic trends, math theorems, and quick revision cards.</p>
                      </div>
                    </TiltCard>

                    {/* 7. Smart Study Alarm Clock */}
                    <TiltCard href="/alarm" className="premium-glass-panel p-6 rounded-3xl border border-amber-500/20 hover:border-amber-500/50 transition-colors flex flex-col justify-between h-48">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 group-hover/card:scale-110 group-hover/card:bg-amber-500 group-hover/card:text-white transition-all duration-300">
                          <AlarmClock className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">MCQ Dismiss</span>
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-black text-base text-white group-hover/card:text-amber-400 transition-colors">Study Alarm Clock</h4>
                        <p className="text-slate-400 text-xs mt-1">Wake up & study on time. Alarm will only silence once you solve a curriculum MCQ correctly!</p>
                      </div>
                    </TiltCard>

                  </div>
                </motion.div>
              )}

              {/* ── TAB 3: CLASSROOM & PROGRESS (SYLLABUS & SOCIAL) ── */}
              {activeTab === "social" && (
                <motion.div 
                  key="tab-social"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Virtual School Launcher */}
                  <motion.div variants={item}>
                    <ClassroomLauncher itemVariants={item} />
                  </motion.div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    
                    {/* Syllabus Mind Map (Left 2 cols) */}
                    <motion.div variants={item} className="lg:col-span-2 space-y-6">
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
                            {/* Animated connecting paths */}
                            <motion.path d="M 96 80 Q 176 40 256 40" fill="none" className="stroke-emerald-500/50" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: "easeOut" }} />
                            <motion.path d="M 256 40 Q 336 80 416 120" fill="none" className="stroke-indigo-500/40" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5, ease: "easeOut" }} />
                            <motion.path d="M 416 120 Q 496 80 576 40" fill="none" className="stroke-slate-700" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1, ease: "easeOut" }} />
                            <motion.path d="M 576 40 Q 656 80 720 88" fill="none" className="stroke-slate-700" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.5, ease: "easeOut" }} />

                            {skillNodes.map((node, i) => {
                              const isLocked = node.status === "locked";
                              const isActive = node.status === "active";
                              const isCompleted = node.status === "completed";
                              const cx = node.x * 8;
                              const cy = node.y * 1.5;

                              return (
                                <motion.g 
                                  key={node.id}
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: "spring", delay: i * 0.2 + 0.5 }}
                                  onClick={() => setSelectedNode(node)}
                                  className="cursor-pointer group select-none"
                                >
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r="20"
                                    className={cn(
                                      "transition-all duration-300 stroke-2 group-hover:scale-[1.2]",
                                      isCompleted ? "stroke-emerald-500 fill-emerald-950/40" : "",
                                      isActive ? "stroke-indigo-500 fill-indigo-950/40 group-hover:stroke-indigo-400 group-hover:fill-indigo-500/20" : "",
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
                                      className="transition-transform group-hover:scale-110"
                                    />
                                  ) : isLocked ? (
                                    <g transform={`translate(${cx - 4.5}, ${cy - 5.5}) scale(0.55)`}>
                                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="#64748b" strokeWidth="2.5"/>
                                    </g>
                                  ) : (
                                    <text x={cx} y={cy + 4} textAnchor="middle" className="text-[11px] font-black fill-indigo-400 font-mono transition-transform group-hover:scale-110">
                                      {node.percent}%
                                    </text>
                                  )}
                                  <text x={cx} y={cy - 28} textAnchor="middle" className="text-[10px] font-black fill-slate-400 uppercase transition-colors group-hover:fill-white">
                                    {node.label.split(" ")[0]}
                                  </text>
                                </motion.g>
                              );
                            })}
                          </svg>
                        </div>
                      </div>
                    </motion.div>

                    {/* Classmates Leaderboard (Right col) */}
                    <motion.div variants={item} id="tour-leaderboard-section" className="premium-glass-panel p-6 rounded-3xl border border-indigo-500/20 space-y-4">
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
                          <motion.div 
                            key={buddy.name}
                            whileHover={{ x: 4 }}
                            className={cn(
                              "flex items-center justify-between p-2.5 rounded-2xl border transition-colors",
                              buddy.isSelf 
                                ? "bg-indigo-500/10 border-indigo-500/40 shadow-sm shadow-indigo-500/10" 
                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {getRankBadge(index + 1)}
                              <div className={cn("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-black text-[10px] shadow-sm", buddy.color)}>
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
                              <Link href="/groups" className="p-2 bg-white/5 hover:bg-indigo-500/20 rounded-xl text-slate-400 hover:text-indigo-400 transition-colors">
                                <MessageCircle className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SYLLABUS NODE MODAL ── */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#0B0F19] border border-white/10 w-full max-w-md rounded-3xl p-6 text-left text-white shadow-2xl space-y-4"
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
                  className="p-1.5 bg-white/5 hover:bg-white/10 hover:text-rose-400 text-slate-400 rounded-xl text-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">{selectedNode.desc}</p>
              
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mb-2">Key Board Highlights</h4>
                <ul className="space-y-2">
                  {selectedNode.keyPoints.map((point: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-300 font-semibold flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <Link href="/mocktest">
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedNode(null)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    Start Mock Test
                  </motion.button>
                </Link>
                <Link href="/learn">
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedNode(null)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-all border border-white/10"
                  >
                    Read Theory
                  </motion.button>
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#0B0F19] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 text-center text-white"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black">Quest Guide</h3>
                <p className="text-xs text-slate-400 mt-0.5">How to complete this mission</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-semibold bg-white/5 p-4 rounded-2xl border border-white/5">
                {activeMissionGuide}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setActiveMissionGuide(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all text-xs shadow-md mt-2"
              >
                Understood!
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Level Up Celebration Modal */}
      <AnimatePresence>
        {showLevelUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-gradient-to-br from-indigo-950 to-purple-950 border border-indigo-500/30 w-full max-w-sm rounded-3xl p-8 text-center text-white shadow-[0_0_50px_rgba(99,102,241,0.3)] relative overflow-hidden"
            >
              {/* Shine effect */}
              <motion.div 
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
              
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-4xl font-black shadow-xl shadow-indigo-500/40 mb-6 border-2 border-white/20"
              >
                L{level}
              </motion.div>
              
              <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Level Up!</h2>
              <p className="text-slate-300 text-sm font-semibold mb-6">You've reached a new academic milestone. Keep up the great work!</p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowLevelUp(false)}
                className="w-full py-3 bg-white text-indigo-950 font-black rounded-xl shadow-lg relative z-10"
              >
                Awesome!
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />
      <FeatureSpotlightTour />
    </motion.div>
  );
}