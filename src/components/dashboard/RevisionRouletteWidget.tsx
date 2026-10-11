"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Play, RotateCw, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { awardUserXP } from "@/lib/xp";

const ROULETTE_CHAPTERS = [
  { subject: "Science", chapter: "Chemical Reactions & Equations", slug: "chemical-reactions", color: "from-amber-500 to-orange-500", icon: "⚗️" },
  { subject: "Mathematics", chapter: "Quadratic Equations", slug: "quadratic-equations", color: "from-blue-500 to-indigo-600", icon: "📐" },
  { subject: "Science", chapter: "Electricity & Circuits", slug: "electricity", color: "from-yellow-400 to-amber-600", icon: "⚡" },
  { subject: "Mathematics", chapter: "Triangles & Similarity", slug: "triangles", color: "from-purple-500 to-indigo-500", icon: "🔺" },
  { subject: "Science", chapter: "Acids, Bases & Salts", slug: "acids-bases", color: "from-emerald-500 to-teal-600", icon: "🧪" },
  { subject: "Science", chapter: "Life Processes", slug: "life-processes", color: "from-rose-500 to-pink-600", icon: "🧬" },
  { subject: "Social Science", chapter: "Nationalism in India", slug: "nationalism-india", color: "from-orange-500 to-red-600", icon: "🇮🇳" },
  { subject: "Mathematics", chapter: "Coordinate Geometry", slug: "coordinate-geometry", color: "from-cyan-500 to-blue-600", icon: "📊" },
];

export function RevisionRouletteWidget() {
  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState(0);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setSelectedIndex(null);

    // Pick random target
    const targetIdx = Math.floor(Math.random() * ROULETTE_CHAPTERS.length);
    // At least 4 full rotations (1440 deg) + angle for slice
    const sliceAngle = 360 / ROULETTE_CHAPTERS.length;
    const additionalTurns = 5 * 360;
    const targetAngle = additionalTurns + (targetIdx * sliceAngle);

    setRotationDegrees((prev) => prev + targetAngle);

    setTimeout(() => {
      setSelectedIndex(targetIdx);
      setSpinning(false);
      awardUserXP(10);
    }, 2800);
  };

  const selectedChapter = selectedIndex !== null ? ROULETTE_CHAPTERS[selectedIndex] : null;

  return (
    <div className="premium-glass-panel p-6 rounded-3xl border border-indigo-500/20 relative overflow-hidden group shadow-sm">
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <RotateCw className={`w-6 h-6 ${spinning ? "animate-spin" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Revision Roulette Wheel
              </h3>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Random Recall
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Overcome decision paralysis! Spin the wheel to test spontaneous chapter retention.
            </p>
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={spinning}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{spinning ? "Spinning..." : "Spin the Wheel"}</span>
        </button>
      </div>

      {/* Selected Winner Card */}
      <AnimatePresence>
        {selectedChapter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedChapter.icon}</span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  {selectedChapter.subject} Target (+10 XP Awarded!)
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {selectedChapter.chapter}
                </h4>
              </div>
            </div>

            <Link
              href={`/learn/${selectedChapter.subject.toLowerCase().replace(/ /g, "-")}/${selectedChapter.slug}`}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <span>Practice Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
