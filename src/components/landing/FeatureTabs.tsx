"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Brain,
  Sparkles,
  TrendingUp,
  Camera,
  Repeat,
} from "lucide-react";

const TABS = [
  {
    id: "adaptive",
    label: "AI Learning",
    icon: Target,
    title: "Adaptive AI Learning Paths",
    description:
      "Our intelligent engine analyzes your strengths and weaknesses across every CBSE subject, automatically building personalized revision roadmaps that evolve as you learn.",
    highlights: ["Weakness detection", "Custom roadmaps", "Real-time adaptation"],
    visual: { icon: TrendingUp, gradient: "from-indigo-500 to-violet-500" },
  },
  {
    id: "doubt",
    label: "Doubt Solver",
    icon: Brain,
    title: "Instant AI Doubt Resolution",
    description:
      "Stuck on a tricky problem? Snap a photo of any equation, diagram, or textbook question and get clear, step-by-step explanations in seconds — powered by advanced vision AI.",
    highlights: [
      "Photo-based input",
      "Step-by-step solutions",
      "Multi-language support",
    ],
    visual: { icon: Camera, gradient: "from-violet-500 to-fuchsia-500" },
  },
  {
    id: "recall",
    label: "Spaced Recall",
    icon: Sparkles,
    title: "Scientific Spaced Repetition",
    description:
      "Master any concept permanently with Leitner-box flashcard decks, active recall quizzes, and skill trees that turn daily revision into a rewarding, game-like ritual.",
    highlights: [
      "Leitner flashcards",
      "Active recall sessions",
      "Skill tree progression",
    ],
    visual: { icon: Repeat, gradient: "from-fuchsia-500 to-pink-500" },
  },
];

export default function FeatureTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const current = TABS[activeTab];
  const VisualIcon = current.visual.icon;

  return (
    <section
      id="features"
      className="w-full max-w-6xl mx-auto px-6 mb-32 relative z-20 scroll-mt-24"
      aria-label="Core features"
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="text-center mb-14"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
            Core Features
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Everything you need to{" "}
          <span className="text-slate-500 font-light italic">excel</span>.
        </h2>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
          Three pillars that power your academic transformation.
        </p>
      </motion.div>

      {/* Tab switcher */}
      <div className="flex justify-center mb-10" role="tablist" aria-label="Feature tabs">
        <div className="inline-flex bg-white/[0.03] border border-white/[0.07] rounded-2xl p-1.5 gap-1">
          {TABS.map((tab, i) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(i)}
                className={`relative px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  activeTab === i
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                role="tab"
                aria-selected={activeTab === i}
                aria-controls={`tabpanel-${tab.id}`}
              >
                {activeTab === i && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/[0.08] border border-white/[0.1] rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <TabIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-white/[0.03] backdrop-blur-lg border border-white/[0.07] rounded-2xl p-8 md:p-12"
          role="tabpanel"
          id={`tabpanel-${current.id}`}
          aria-label={current.label}
        >
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Text content */}
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4">
                {current.title}
              </h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                {current.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {current.highlights.map((h) => (
                  <span
                    key={h}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.1,
                }}
                className={`w-40 h-40 md:w-52 md:h-52 rounded-3xl bg-gradient-to-br ${current.visual.gradient} flex items-center justify-center shadow-2xl`}
              >
                <VisualIcon
                  className="w-16 h-16 md:w-20 md:h-20 text-white/90"
                  strokeWidth={1.5}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
