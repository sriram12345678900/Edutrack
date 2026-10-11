"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle, RefreshCw, X, Clock, Play } from "lucide-react";
import { BreakActivity, getRandomBreakActivity } from "@/lib/break-activities";
import { awardUserXP } from "@/lib/xp";

interface BreakSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBreakTimer?: (minutes: number) => void;
}

export default function BreakSuggestionModal({
  isOpen,
  onClose,
  onStartBreakTimer,
}: BreakSuggestionModalProps) {
  const [activity, setActivity] = useState<BreakActivity>(getRandomBreakActivity());
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActivity(getRandomBreakActivity());
      setCompleted(false);
    }
  }, [isOpen]);

  const handleComplete = () => {
    setCompleted(true);
    awardUserXP(15);
    window.dispatchEvent(new CustomEvent("edutrack_break_activity_completed"));
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleReroll = () => {
    setActivity(getRandomBreakActivity());
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md p-6 bg-slate-900 border border-emerald-500/30 rounded-3xl text-white shadow-2xl overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl">
              {activity.emoji}
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Cognitive Refresh Suggestion
              </span>
              <h3 className="text-lg font-black tracking-tight">{activity.title}</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 mb-4">{activity.description}</p>

          <div className="space-y-2.5 p-3.5 bg-white/5 border border-white/10 rounded-2xl mb-5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>Steps ({activity.durationMinutes} min routine):</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Clock className="w-3 h-3" /> {activity.durationMinutes} min
              </span>
            </div>
            {activity.instructions.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{step}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleReroll}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5"
              title="Shuffle another break routine"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Another
            </button>

            <div className="flex items-center gap-2">
              {onStartBreakTimer && (
                <button
                  onClick={() => {
                    onStartBreakTimer(activity.durationMinutes);
                    onClose();
                  }}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Play className="w-3 h-3" /> Start {activity.durationMinutes}m Break
                </button>
              )}

              <button
                onClick={handleComplete}
                disabled={completed}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {completed ? "Completed! (+15 XP)" : "I Did It (+15 XP)"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
