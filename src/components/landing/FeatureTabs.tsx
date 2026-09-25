"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Brain,
  Sparkles,
  TrendingUp,
  Camera,
  Repeat,
  CheckCircle2,
  Cpu,
  Layers,
  Flame,
  ArrowRight,
} from "lucide-react";

const TABS = [
  {
    id: "adaptive",
    label: "AI Learning",
    icon: Target,
    title: "Adaptive AI Learning Paths",
    badge: "Personalized Roadmap",
    glowColor: "rgba(99, 102, 241, 0.25)",
    gradient: "from-indigo-500 via-purple-500 to-cyan-400",
    description:
      "Our intelligent engine analyzes your strengths and weaknesses across every CBSE subject, automatically building personalized revision roadmaps that evolve in real-time as you learn.",
    highlights: ["Weakness detection", "Custom syllabus roadmaps", "Real-time mastery tracking", "NCERT benchmarked"],
    visualType: "learning_path"
  },
  {
    id: "doubt",
    label: "Doubt Solver",
    icon: Brain,
    title: "Instant AI Doubt Resolution",
    badge: "Vision AI & Step-by-Step",
    glowColor: "rgba(168, 85, 247, 0.25)",
    gradient: "from-purple-500 via-violet-500 to-pink-500",
    description:
      "Stuck on a tricky problem? Snap a photo of any equation, diagram, or textbook question and get clear, step-by-step explanations in seconds — powered by advanced vision AI.",
    highlights: [
      "Photo-based instant scan",
      "Step-by-step derivations",
      "Multi-concept breakdown",
      "NCERT & Exemplar hints",
    ],
    visualType: "doubt_solver"
  },
  {
    id: "recall",
    label: "Spaced Recall",
    icon: Sparkles,
    title: "Scientific Spaced Repetition",
    badge: "Leitner Memory Algorithm",
    glowColor: "rgba(244, 63, 94, 0.25)",
    gradient: "from-pink-500 via-rose-500 to-indigo-500",
    description:
      "Master any concept permanently with Leitner-box flashcard decks, active recall quizzes, and skill trees that turn daily revision into a rewarding, game-like ritual.",
    highlights: [
      "Leitner 5-box scheduling",
      "Active recall testing",
      "Streak & XP multipliers",
      "Long-term memory lock",
    ],
    visualType: "spaced_recall"
  },
];

export default function FeatureTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const current = TABS[activeTab];

  return (
    <section
      id="features"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-32 relative z-20 scroll-mt-28"
      aria-label="Core features"
    >
      <div id="solutions" className="sr-only" />

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-5 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300">
            Next-Gen Architecture
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Everything you need to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            excel
          </span>.
        </h2>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Three pillars engineered specifically to propel CBSE students from average to topper.
        </p>
      </motion.div>

      {/* Tab Switcher Pills */}
      <div className="flex justify-center mb-8 sm:mb-10" role="tablist" aria-label="Feature tabs">
        <div className="inline-flex bg-[#0b0e24]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {TABS.map((tab, i) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === i;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(i)}
                className={`relative px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  isActive
                    ? "text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFeatureTab"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <TabIcon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Box - Solid Cyber Glass */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative bg-[#0c1026]/95 backdrop-blur-3xl border border-white/15 rounded-3xl p-6 sm:p-10 md:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.75)] overflow-hidden"
          style={{
            boxShadow: `0 25px 60px -15px ${current.glowColor}, 0 0 1px 1px rgba(255,255,255,0.1) inset`
          }}
          role="tabpanel"
          id={`tabpanel-${current.id}`}
          aria-label={current.label}
        >
          {/* Subtle Top Glare */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Ambient Corner Glow */}
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-40"
            style={{ backgroundColor: current.glowColor }}
          />

          <div className="relative z-10 grid md:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Left Column: Feature Details */}
            <div className="md:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-bold text-indigo-300 mb-4">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                {current.badge}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4">
                {current.title}
              </h3>

              <p className="text-slate-300/90 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                {current.description}
              </p>

              {/* Highlights Pill Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mb-6">
                {current.highlights.map((h) => (
                  <div
                    key={h}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-200">{h}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href={current.id === "doubt" ? "/tutor" : current.id === "recall" ? "/flashcards" : "/skill-tree"}
                  className="group inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Experience {current.label} in action
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Column: Dynamic Interactive Mock Preview Panel */}
            <div className="md:col-span-5 flex items-center justify-center">
              {current.visualType === "learning_path" && (
                <div className="w-full max-w-sm rounded-2xl bg-[#080b1e] border border-indigo-500/30 p-5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                      <span className="text-xs font-bold text-white">Live AI Roadmap</span>
                    </div>
                    <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      CBSE Class 10
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                        <span>Trigonometric Identities</span>
                        <span className="text-emerald-400 font-bold">92% Mastered</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "92%" }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                        <span>Heights & Distances</span>
                        <span className="text-amber-400 font-bold">Weak Spot (64%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "64%" }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-amber-400"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>AI Recommendation: 5 Targeted Practice Questions Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {current.visualType === "doubt_solver" && (
                <div className="w-full max-w-sm rounded-2xl bg-[#080b1e] border border-purple-500/30 p-5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">Visual Doubt Solver</span>
                    </div>
                    <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full">
                      Instant 1.2s
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 font-mono text-purple-200 text-center">
                      Solve: 2x² - 5x + 3 = 0
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-300 bg-white/[0.03] p-2 rounded-lg border border-white/[0.06]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>Step 1: Identify a=2, b=-5, c=3</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 bg-white/[0.03] p-2 rounded-lg border border-white/[0.06]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>Step 2: D = b² - 4ac = 25 - 24 = 1</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Roots: x = 3/2 or x = 1</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {current.visualType === "spaced_recall" && (
                <div className="w-full max-w-sm rounded-2xl bg-[#080b1e] border border-pink-500/30 p-5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-bold text-white">Leitner Smart Box</span>
                    </div>
                    <span className="text-[10px] font-bold text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" /> 14 Day Streak
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-indigo-500/15 border border-pink-500/30 text-center">
                      <span className="text-[10px] font-bold text-pink-300 uppercase tracking-widest block mb-1">
                        Flashcard #84 • Physics
                      </span>
                      <p className="text-xs font-bold text-white leading-relaxed">
                        &quot;For every action, there is an equal and opposite reaction.&quot;
                      </p>
                      <span className="text-[10px] font-semibold text-slate-400 mt-2 block">
                        Newton&apos;s Third Law
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-2 pt-1 text-[11px] font-semibold text-slate-300">
                      <span>Box Level: <strong className="text-pink-400">Box 4 of 5</strong></span>
                      <span className="text-emerald-400">Review in 4 Days</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

