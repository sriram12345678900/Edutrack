"use client";

import { motion } from "framer-motion";
import { 
  Check, 
  X, 
  Sparkles, 
  Flame, 
  Clock, 
  Coins, 
  Users, 
  BrainCircuit, 
  FileCheck2,
  Gamepad2
} from "lucide-react";

interface ComparisonRow {
  feature: string;
  category: string;
  icon: typeof Coins;
  offlineTuition: string;
  offlinePositive: boolean;
  edutrack: string;
  edutrackPositive: boolean;
  highlight?: boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Annual Cost",
    category: "Financials",
    icon: Coins,
    offlineTuition: "₹25,000 – ₹50,000 per year per student",
    offlinePositive: false,
    edutrack: "₹0 (100% Free Forever for all CBSE students)",
    edutrackPositive: true,
    highlight: true,
  },
  {
    feature: "Doubt Resolution Time",
    category: "Learning Support",
    icon: Clock,
    offlineTuition: "Wait for the next class; often rushed or skipped",
    offlinePositive: false,
    edutrack: "Instant (1.2s) 24/7 explanations with voice, text & photo",
    edutrackPositive: true,
  },
  {
    feature: "Student Attention Ratio",
    category: "Personalization",
    icon: Users,
    offlineTuition: "1 teacher divided across 50–80 batchmates",
    offlinePositive: false,
    edutrack: "1-on-1 dedicated AI Mentor adapting to your pace",
    edutrackPositive: true,
  },
  {
    feature: "Memory & Retention",
    category: "Pedagogy",
    icon: BrainCircuit,
    offlineTuition: "Passive rote memorization; 80% forgotten in 14 days",
    offlinePositive: false,
    edutrack: "Leitner 5-Box Spaced Repetition + 3D Interactive Labs",
    edutrackPositive: true,
  },
  {
    feature: "Board Exam Practice",
    category: "Assessment",
    icon: FileCheck2,
    offlineTuition: "Monthly photocopied test; weeks to get paper checked",
    offlinePositive: false,
    edutrack: "Unlimited AI mock tests matching official CBSE blueprints with instant marks",
    edutrackPositive: true,
  },
  {
    feature: "Engagement & Motivation",
    category: "Habit Building",
    icon: Gamepad2,
    offlineTuition: "Exhausting commutes and monotonous lectures",
    offlinePositive: false,
    edutrack: "Gamified XP streaks, multiplayer PvP arena & Roblox avatar shop",
    edutrackPositive: true,
  },
];

export default function TuitionComparison() {
  return (
    <section
      id="comparison"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-32 relative z-20 scroll-mt-28"
      aria-label="EduTrack vs Offline Tuition Comparison"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="text-center mb-12 sm:mb-14"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-5 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Flame className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
            The Smart Advantage
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Why CBSE Toppers Choose{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            EduTrack AI
          </span>.
        </h2>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          See how our cutting-edge AI platform compares directly with traditional coaching classes and coaching centres.
        </p>
      </motion.div>

      {/* Comparison Table Container */}
      <div className="relative bg-[#0c1026]/95 backdrop-blur-3xl border border-white/15 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.75)]">
        {/* Subtle top glare */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Table Column Headers */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b border-white/10 bg-white/[0.02]">
          <div className="hidden md:block md:col-span-4 p-5 sm:p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Capability / Dimension
          </div>
          <div className="hidden md:block md:col-span-4 p-5 sm:p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center border-l border-white/10">
            Traditional Offline Coaching
          </div>
          <div className="md:col-span-4 p-5 sm:p-6 text-center border-l border-indigo-500/30 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 relative">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 uppercase tracking-wider">
                EduTrack AI Platform
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold uppercase">
                Topper Choice
              </span>
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.07]">
          {COMPARISON_ROWS.map((row, idx) => {
            const Icon = row.icon;
            return (
              <div
                key={row.feature}
                className={`grid grid-cols-1 md:grid-cols-12 items-stretch transition-colors hover:bg-white/[0.02] ${
                  row.highlight ? "bg-indigo-500/[0.04]" : ""
                }`}
              >
                {/* Feature Label Column */}
                <div className="p-5 sm:p-6 md:col-span-4 flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {row.category}
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {row.feature}
                    </h4>
                  </div>
                </div>

                {/* Offline Coaching Column */}
                <div className="p-4 sm:p-6 md:col-span-4 flex items-center gap-3 md:border-l border-white/10 bg-rose-500/[0.02] text-xs sm:text-sm text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 block mb-0.5">Offline Coaching:</span>
                    <span>{row.offlineTuition}</span>
                  </div>
                </div>

                {/* EduTrack AI Column */}
                <div className="p-4 sm:p-6 md:col-span-4 flex items-center gap-3 md:border-l border-indigo-500/30 bg-emerald-500/[0.04] text-xs sm:text-sm font-bold text-white relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <span className="md:hidden text-[10px] font-bold text-emerald-400 block mb-0.5">EduTrack AI:</span>
                    <span className="text-emerald-100">{row.edutrack}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner inside table */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs sm:text-sm text-slate-200 font-semibold">
              Save over <strong className="text-emerald-400">₹40,000/year</strong> while learning with state-of-the-art AI technology.
            </p>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/[0.08] text-slate-300 border border-white/10 shrink-0">
            No Credit Card Required
          </span>
        </div>
      </div>
    </section>
  );
}
