"use client";

import React, { useState, useEffect } from "react";
import { 
  Home, Trophy, Medal, Star, Flame, Crown, 
  Sparkles, Gift, Users, ShieldCheck, ArrowRight, Check, ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "@/components/Confetti";
import { awardUserXP } from "@/lib/xp";

interface Achievement {
  id: number;
  title: string;
  desc: string;
  icon: string;
  color: string;
  shadow: string;
  unlocked: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 1, title: "Speed Reader", desc: "Finished 5 chapters in one day", icon: "⚡", color: "from-orange-500 to-red-600", shadow: "shadow-orange-500/50", unlocked: true },
  { id: 2, title: "Quiz Champion", desc: "Won 10 multiplayer duels", icon: "👑", color: "from-yellow-400 to-amber-600", shadow: "shadow-yellow-500/50", unlocked: true },
  { id: 3, title: "Science Whiz", desc: "Mastered 3 Science subjects", icon: "🔬", color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/50", unlocked: true },
  { id: 4, title: "Error Vault Master", desc: "Cleared 10 tricky questions in active recall", icon: "🛡️", color: "from-purple-500 to-indigo-600", shadow: "shadow-purple-500/50", unlocked: true },
  { id: 5, title: "Perfect Streak", desc: "Study for 30 consecutive days", icon: "🔥", color: "from-slate-700 to-slate-900", shadow: "shadow-none", unlocked: false },
  { id: 6, title: "All-India Board Ranker", desc: "Score 95%+ across 5 full mock tests", icon: "🏆", color: "from-slate-700 to-slate-900", shadow: "shadow-none", unlocked: false }
];

const LEADERBOARD_DATA = {
  national: [
    { rank: 1, name: "Aarav Sharma", school: "DPS R.K. Puram, Delhi", xp: 4850, badge: "🥇 Rank 1", avatar: "⚡" },
    { rank: 2, name: "Ananya Iyer", school: "National Public School, Bengaluru", xp: 4620, badge: "🥈 Rank 2", avatar: "🌟" },
    { rank: 3, name: "Rohan Verma", school: "DAV Public School, Chandigarh", xp: 4390, badge: "🥉 Rank 3", avatar: "🔬" },
    { rank: 4, name: "Sneha Patel", school: "Kendriya Vidyalaya, Mumbai", xp: 4120, badge: "Top 1%", avatar: "🎓" },
    { rank: 5, name: "You (Scholar)", school: "CBSE Class 10 Division", xp: 3950, badge: "Rising Star", avatar: "🚀", isUser: true }
  ],
  school: [
    { rank: 1, name: "You (Scholar)", school: "Your School Squad", xp: 3950, badge: "Squad Leader", avatar: "🚀", isUser: true },
    { rank: 2, name: "Vikram Reddy", school: "Your School Squad", xp: 3420, badge: "Prefect", avatar: "🧬" },
    { rank: 3, name: "Priya Das", school: "Your School Squad", xp: 3180, badge: "Scholar", avatar: "📚" }
  ],
  weekly: [
    { rank: 1, name: "Ishaan Gupta", school: "St. Xavier's, Kolkata", xp: 1250, badge: "Sprint Master", avatar: "⚡" },
    { rank: 2, name: "You (Scholar)", school: "CBSE Class 10 Division", xp: 980, badge: "Top 3", avatar: "🚀", isUser: true },
    { rank: 3, name: "Diya Menon", school: "Bhavans, Kochi", xp: 870, badge: "Challenger", avatar: "🌟" }
  ]
};

export default function TrophiesPage() {
  const [activeTab, setActiveTab] = useState<"trophies" | "crate" | "leaderboard">("trophies");
  const [leaderboardFilter, setLeaderboardFilter] = useState<"national" | "school" | "weekly">("national");
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  
  // Daily Crate state
  const [crateOpened, setCrateOpened] = useState<boolean>(false);
  const [isOpeningCrate, setIsOpeningCrate] = useState<boolean>(false);
  const [crateReward, setCrateReward] = useState<{ xp: number; badge: string; token: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const today = new Date().toDateString();
      const lastOpened = localStorage.getItem("edutrack_crate_date");
      if (lastOpened === today) {
        setCrateOpened(true);
      }
    }
  }, []);

  const handleOpenDailyCrate = () => {
    if (crateOpened || isOpeningCrate) return;
    setIsOpeningCrate(true);

    setTimeout(() => {
      const reward = {
        xp: 150,
        badge: "Daily Vanguard Badge",
        token: "1x Streak Freeze Shield"
      };

      awardUserXP(reward.xp);
      setCrateReward(reward);
      setIsOpeningCrate(false);
      setCrateOpened(true);
      setConfettiActive(true);

      if (typeof window !== "undefined") {
        localStorage.setItem("edutrack_crate_date", new Date().toDateString());
      }

      setTimeout(() => setConfettiActive(false), 3500);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b13] text-slate-900 dark:text-slate-100 p-4 sm:p-8 relative overflow-hidden">
      <Confetti active={confettiActive} />

      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/30">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                Trophies & Leaderboard
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
                Showcase your board achievements, open daily mystery crates, and climb national school rankings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all"
            >
              <ShoppingBag className="w-4 h-4" /> Rewards Shop
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <Home className="w-4 h-4" /> Back
            </Link>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-md">
          <button
            onClick={() => setActiveTab("trophies")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "trophies" ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-500"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Badges ({ACHIEVEMENTS.filter(a => a.unlocked).length})
          </button>
          <button
            onClick={() => setActiveTab("crate")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "crate" ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-500"
            }`}
          >
            <Gift className="w-3.5 h-3.5" /> Mystery Crate
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "leaderboard" ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-500"
            }`}
          >
            <Crown className="w-3.5 h-3.5" /> Leaderboard
          </button>
        </div>

        {/* TAB 1: TROPHIES ROOM */}
        {activeTab === "trophies" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACHIEVEMENTS.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.03 }}
                className={`p-6 rounded-3xl border transition-all flex items-start gap-4 shadow-xl ${
                  item.unlocked
                    ? "bg-white dark:bg-slate-900 border-amber-500/30"
                    : "bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg ${
                  item.unlocked ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30" : "bg-slate-200 dark:bg-slate-800"
                }`}>
                  {item.icon}
                </div>

                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{item.title}</h3>
                    {item.unlocked && <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Unlocked</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* TAB 2: DAILY MYSTERY CRATE */}
        {activeTab === "crate" && (
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center max-w-xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Daily Scholar Mystery Crate
            </div>

            <motion.div
              animate={isOpeningCrate ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.5, repeat: isOpeningCrate ? Infinity : 0 }}
              className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-2 border-amber-500/40 rounded-3xl flex items-center justify-center text-6xl shadow-2xl shadow-amber-500/20"
            >
              {crateOpened ? "🎁" : "📦"}
            </motion.div>

            {crateReward ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                <h3 className="text-2xl font-black text-amber-400">🎉 Today's Crate Unboxed!</h3>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                    <span className="text-[10px] font-bold text-amber-400 block">XP Reward</span>
                    <span className="text-lg font-black text-white font-mono">+{crateReward.xp} XP</span>
                  </div>
                  <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    <span className="text-[10px] font-bold text-indigo-400 block">Power-Up</span>
                    <span className="text-xs font-black text-white">{crateReward.token}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">Next daily crate available tomorrow at midnight!</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-extrabold dark:text-white text-slate-900">
                  {crateOpened ? "You already opened today's crate!" : "Unlock Today's Daily Academic Loot"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Contains guaranteed bonus XP, rare profile frames, and streak freeze shields to protect your momentum.
                </p>
                <button
                  onClick={handleOpenDailyCrate}
                  disabled={crateOpened || isOpeningCrate}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
                >
                  {isOpeningCrate ? "Opening Crate..." : crateOpened ? "Crate Claimed for Today" : "Open Daily Crate (Free)"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NATIONAL & SCHOOL LEADERBOARD */}
        {activeTab === "leaderboard" && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "national", label: "🇮🇳 All-India Board League" },
                { id: "school", label: "🏫 My School Squad" },
                { id: "weekly", label: "⚡ Weekly Sprint" }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setLeaderboardFilter(filter.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    leaderboardFilter === filter.id
                      ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-md"
                      : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
              {LEADERBOARD_DATA[leaderboardFilter].map((entry) => (
                <div
                  key={entry.rank}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    entry.isUser
                      ? "bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/30"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 font-black text-base text-slate-400 font-mono text-center">
                      #{entry.rank}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-lg">
                      {entry.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">{entry.name}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {entry.badge}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{entry.school}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono font-black text-amber-500 text-base">
                    {entry.xp} XP
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}