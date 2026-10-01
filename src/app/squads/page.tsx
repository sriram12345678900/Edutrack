"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Users, Flame, Trophy, Swords, Zap, CheckCircle2, 
  ArrowRight, Crown, Sparkles, Plus, Copy, Check, Clock, AlertCircle,
  HelpCircle, ArrowLeft, Target, Heart, Award
} from "lucide-react";
import Link from "next/link";
import Confetti from "@/components/Confetti";
import { awardUserXP } from "@/lib/xp";
import { cn } from "@/lib/utils";

interface SquadMember {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  dailyFocusMins: number; // Goal: 25 mins
  targetMet: boolean;
  bossDamageDealt: number;
}

interface Squad {
  id: string;
  name: string;
  tag: string;
  code: string;
  motto: string;
  bannerGradient: string;
  members: SquadMember[];
  sharedShieldActive: boolean;
  bossHealth: number; // Max 10,000
  bossMaxHealth: number;
  bossName: string;
  bossLevel: number;
}

const INITIAL_SQUADS: Squad[] = [
  {
    id: "sq-1",
    name: "CBSE Titans Guild",
    tag: "TITAN",
    code: "TITAN-889",
    motto: "Consistent Daily Focus Conquers Any Board Exam.",
    bannerGradient: "from-indigo-600 via-purple-600 to-pink-600",
    bossName: "The Procrastination Behemoth",
    bossLevel: 10,
    bossHealth: 3750,
    bossMaxHealth: 10000,
    sharedShieldActive: true,
    members: [
      {
        id: "m-user",
        name: "You (Scholar)",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ScholarYou",
        grade: "Class 10",
        dailyFocusMins: 35,
        targetMet: true,
        bossDamageDealt: 1250
      },
      {
        id: "m-2",
        name: "Ananya Sharma",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AnanyaTitans",
        grade: "Class 10",
        dailyFocusMins: 45,
        targetMet: true,
        bossDamageDealt: 2000
      },
      {
        id: "m-3",
        name: "Rohan Varma",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=RohanTitans",
        grade: "Class 10",
        dailyFocusMins: 28,
        targetMet: true,
        bossDamageDealt: 1500
      },
      {
        id: "m-4",
        name: "Sneha Patel",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SnehaTitans",
        grade: "Class 10",
        dailyFocusMins: 30,
        targetMet: true,
        bossDamageDealt: 1500
      }
    ]
  },
  {
    id: "sq-2",
    name: "Quantum Aryabhatas",
    tag: "ARYA",
    code: "ARYA-404",
    motto: "Precision in Calculations, Mastery in Concepts.",
    bannerGradient: "from-cyan-600 via-teal-600 to-emerald-600",
    bossName: "The Formula Void Titan",
    bossLevel: 9,
    bossHealth: 7500,
    bossMaxHealth: 10000,
    sharedShieldActive: false,
    members: [
      {
        id: "m-user",
        name: "You (Scholar)",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ScholarYou",
        grade: "Class 10",
        dailyFocusMins: 35,
        targetMet: true,
        bossDamageDealt: 1000
      },
      {
        id: "m-5",
        name: "Kabir Mehta",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=KabirArya",
        grade: "Class 10",
        dailyFocusMins: 15,
        targetMet: false,
        bossDamageDealt: 500
      },
      {
        id: "m-6",
        name: "Diya Nair",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=DiyaArya",
        grade: "Class 10",
        dailyFocusMins: 30,
        targetMet: true,
        bossDamageDealt: 1000
      },
      {
        id: "m-7",
        name: "Vikram Sen",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=VikramArya",
        grade: "Class 10",
        dailyFocusMins: 10,
        targetMet: false,
        bossDamageDealt: 0
      }
    ]
  }
];

export default function StudySquadsPage() {
  const [squads, setSquads] = useState<Squad[]>(INITIAL_SQUADS);
  const [activeSquad, setActiveSquad] = useState<Squad>(INITIAL_SQUADS[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [raidAttacking, setRaidAttacking] = useState(false);
  const [hitDamageAnimation, setHitDamageAnimation] = useState<number | null>(null);

  // Attack the boss via rapid PYQ raid
  const handleRaidAttack = () => {
    if (activeSquad.bossHealth <= 0 || raidAttacking) return;
    setRaidAttacking(true);
    const damage = 500;
    setHitDamageAnimation(damage);

    setTimeout(() => {
      const nextHp = Math.max(0, activeSquad.bossHealth - damage);
      const updatedSquad: Squad = {
        ...activeSquad,
        bossHealth: nextHp,
        members: activeSquad.members.map(m => 
          m.id === "m-user" ? { ...m, bossDamageDealt: m.bossDamageDealt + damage } : m
        )
      };

      setActiveSquad(updatedSquad);
      setSquads(prev => prev.map(s => s.id === updatedSquad.id ? updatedSquad : s));
      setRaidAttacking(false);
      setHitDamageAnimation(null);
      awardUserXP(75);

      if (nextHp === 0) {
        setShowConfetti(true);
        awardUserXP(500);
      }
    }, 600);
  };

  const copySquadCode = () => {
    navigator.clipboard.writeText(activeSquad.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070914] text-slate-100 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <Shield className="h-3.5 w-3.5 text-indigo-400" /> Peer Study Guilds & Clan Wars
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Study Squads & Shared Streak Shield
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Team up with 3 study partners. When everyone logs 25+ daily focus minutes, your whole squad unlocks a <strong>Shared Streak Shield</strong> that prevents streak reset.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Squad Switcher Tabs */}
        <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-1">
          {squads.map(sq => (
            <button
              key={sq.id}
              onClick={() => setActiveSquad(sq)}
              className={cn(
                "px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2.5 whitespace-nowrap",
                activeSquad.id === sq.id
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850"
              )}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>{sq.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono">[{sq.tag}]</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Squad Members & Shared Shield */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Squad Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
            <div className={`absolute top-0 right-0 w-full h-2 bg-gradient-to-r ${activeSquad.bannerGradient}`} />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl md:text-2xl font-black text-white">{activeSquad.name}</h2>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                    {activeSquad.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 italic">"{activeSquad.motto}"</p>
              </div>

              <button
                onClick={copySquadCode}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-indigo-400" />}
                <span>{activeSquad.code}</span>
              </button>
            </div>

            {/* Streak Shield Status Banner */}
            <div className="mt-6 p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 bg-slate-950/70 border-slate-800">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg",
                  activeSquad.sharedShieldActive
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30"
                    : "bg-slate-800 text-slate-500"
                )}>
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Squad Streak Shield</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase",
                      activeSquad.sharedShieldActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    )}>
                      {activeSquad.sharedShieldActive ? "ACTIVE TODAY 🛡️" : "PENDING GOALS"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeSquad.sharedShieldActive
                      ? "All 4 members hit 25+ mins! Your streaks are 100% protected today."
                      : "2 members still need to hit their 25-minute focus session today to activate the shield."}
                  </p>
                </div>
              </div>
            </div>

            {/* Member List */}
            <div className="mt-6 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Squad Roster (4/4 Members)
              </div>
              {activeSquad.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <img src={m.avatar} alt={m.name} className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{m.name}</span>
                        {m.id === "m-user" && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">YOU</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{m.grade}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-300 font-mono">{m.dailyFocusMins}m / 25m</span>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            m.targetMet ? "bg-emerald-500" : "bg-indigo-500"
                          )}
                          style={{ width: `${Math.min(100, (m.dailyFocusMins / 25) * 100)}%` }}
                        />
                      </div>
                    </div>
                    {m.targetMet ? (
                      <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="h-6 w-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center">
                        <Clock className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Guild Boss Raid */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-3xl border border-rose-500/30 bg-slate-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-rose-500" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400">Weekly Boss Raid</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">Level {activeSquad.bossLevel} Boss</span>
              </div>

              {/* Boss Visual Card */}
              <div className="relative text-center p-6 rounded-2xl bg-gradient-to-b from-slate-950/90 to-rose-950/20 border border-slate-800 mb-6">
                {hitDamageAnimation && (
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 1.2 }}
                    animate={{ opacity: 0, y: -40, scale: 1.5 }}
                    className="absolute inset-0 flex items-center justify-center text-3xl font-black text-rose-400 font-mono z-30 pointer-events-none drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                  >
                    -{hitDamageAnimation} HP!
                  </motion.div>
                )}

                <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/20 mb-3 animate-pulse">
                  <Heart className="w-10 h-10 fill-rose-500 text-rose-500" />
                </div>
                <h3 className="text-lg font-black text-white">{activeSquad.bossName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Solve NCERT questions to deal damage collectively.</p>

                {/* HP Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 mb-1">
                    <span>HP: {activeSquad.bossHealth.toLocaleString()}</span>
                    <span>{activeSquad.bossMaxHealth.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(activeSquad.bossHealth / activeSquad.bossMaxHealth) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Squad Boss Damage Leaderboard */}
              <div className="space-y-2 mb-6">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Raid Contribution
                </span>
                {activeSquad.members.map(m => (
                  <div key={m.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950/60 border border-slate-850">
                    <span className="font-medium text-slate-200">{m.name}</span>
                    <span className="font-mono font-bold text-rose-400">{m.bossDamageDealt} DMG</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Raid Attack Action */}
            <button
              onClick={handleRaidAttack}
              disabled={activeSquad.bossHealth <= 0 || raidAttacking}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Swords className="h-4 w-4" />
              {activeSquad.bossHealth <= 0 ? "Boss Defeated! Raid Conquered 🏆" : "Deal -500 DMG (Solve Rapid PYQ)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
