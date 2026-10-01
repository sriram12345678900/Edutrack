"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck, Zap, X, ChevronRight, BookOpen, AlertTriangle } from "lucide-react";
import { getDailyDueSRSItems, recordSRSReview, SRSItem, SRSQuality } from "@/lib/srs-engine";
import Confetti from "@/components/Confetti";
import { cn } from "@/lib/utils";

export default function DailySRSWidget() {
  const [data, setData] = useState<{
    dueItems: SRSItem[];
    totalFlashcardsDue: number;
    totalMistakesDue: number;
    masteredCount: number;
  }>({ dueItems: [], totalFlashcardsDue: 0, totalMistakesDue: 0, masteredCount: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedInSession, setCompletedInSession] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const refreshData = () => {
    setData(getDailyDueSRSItems());
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener("edutrack_srs_updated", handleUpdate);
    window.addEventListener("edutrack_vault_updated", handleUpdate);
    window.addEventListener("edutrack_flashcards_updated", handleUpdate);
    return () => {
      window.removeEventListener("edutrack_srs_updated", handleUpdate);
      window.removeEventListener("edutrack_vault_updated", handleUpdate);
      window.removeEventListener("edutrack_flashcards_updated", handleUpdate);
    };
  }, []);

  const totalDue = data.dueItems.length;
  const currentItem = data.dueItems[currentIndex];

  const handleRate = (quality: SRSQuality) => {
    if (!currentItem) return;
    recordSRSReview(currentItem, quality);
    setIsFlipped(false);
    setCompletedInSession(prev => prev + 1);

    if (currentIndex + 1 < data.dueItems.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowConfetti(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setCurrentIndex(0);
        refreshData();
      }, 2500);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/30 p-5 shadow-xl backdrop-blur-md">
        {/* Glow orb */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-base">SuperMemo-2 Adaptive Revision</h3>
                <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
                  SRS Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {totalDue > 0
                  ? `${totalDue} item${totalDue > 1 ? "s" : ""} scheduled today based on Ebbinghaus forgetting curve decay.`
                  : "All memory retention schedules completed for today! Awesome recall consistency."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 pr-2 border-r border-slate-700/50">
              <span className="flex items-center gap-1 text-sky-400 font-medium">
                <BookOpen className="h-3.5 w-3.5" /> {data.totalFlashcardsDue} Cards
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" /> {data.totalMistakesDue} Vault Errors
              </span>
            </div>

            {totalDue > 0 ? (
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setIsModalOpen(true);
                }}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-95"
              >
                <Zap className="h-4 w-4 fill-white text-white group-hover:scale-110 transition-transform" />
                Review {totalDue} Due
                <ArrowRight className="h-3.5 w-3.5 opacity-80" />
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="h-4 w-4" /> 100% Retained Today
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SRS Study Modal */}
      <AnimatePresence>
        {isModalOpen && currentItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <Confetti active={showConfetti} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-900 shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border",
                    currentItem.type === "flashcard" 
                      ? "bg-sky-500/15 border-sky-500/30 text-sky-300"
                      : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                  )}>
                    {currentItem.type === "flashcard" ? "Flashcard" : "Error Vault Fix"}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">{currentItem.subject}</span>
                  {currentItem.chapter && (
                    <span className="text-xs text-slate-500">• {currentItem.chapter}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-indigo-300 font-mono">
                    {currentIndex + 1} / {data.dueItems.length}
                  </span>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-slate-800 w-full">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / data.dueItems.length) * 100}%` }}
                />
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 flex flex-col justify-center min-h-[280px]">
                <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Prompt / Question</div>
                <div className="text-lg md:text-xl font-medium text-slate-100 whitespace-pre-wrap leading-relaxed">
                  {currentItem.front}
                </div>

                {isFlipped ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-6 border-t border-slate-800"
                  >
                    <div className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Correct Recall & Logic
                    </div>
                    <div className="text-base text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                      {currentItem.back}
                    </div>
                  </motion.div>
                ) : (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => setIsFlipped(true)}
                      className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all border border-slate-700 hover:border-slate-600 shadow-md active:scale-95"
                    >
                      Show Answer & Explanation (Space)
                    </button>
                  </div>
                )}
              </div>

              {/* SM-2 Quality Rating Footer */}
              {isFlipped && (
                <div className="border-t border-slate-800 bg-slate-950/80 p-4 px-6 flex flex-col gap-2">
                  <div className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
                    How well did you recall this concept? (SM-2 Interval Scheduling)
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    <button
                      onClick={() => handleRate(1)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-xs transition active:scale-95"
                    >
                      <span>Again</span>
                      <span className="text-[10px] text-rose-400/80 mt-0.5">1 Day</span>
                    </button>
                    <button
                      onClick={() => handleRate(2)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs transition active:scale-95"
                    >
                      <span>Hard</span>
                      <span className="text-[10px] text-amber-400/80 mt-0.5">~2 Days</span>
                    </button>
                    <button
                      onClick={() => handleRate(4)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-xs transition active:scale-95"
                    >
                      <span>Good</span>
                      <span className="text-[10px] text-emerald-400/80 mt-0.5">~6 Days</span>
                    </button>
                    <button
                      onClick={() => handleRate(5)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-xs transition active:scale-95"
                    >
                      <span>Easy</span>
                      <span className="text-[10px] text-cyan-400/80 mt-0.5">~14+ Days</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
