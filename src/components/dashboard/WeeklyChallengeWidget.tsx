"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Award, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { getActiveWeeklyChallenge, WeeklyChallenge } from "@/lib/weekly-challenge";
import { awardUserXP } from "@/lib/xp";

export function WeeklyChallengeWidget() {
  const [data, setData] = useState<{ challenge: WeeklyChallenge; progress: number; completed: boolean } | null>(null);

  const loadData = () => {
    setData(getActiveWeeklyChallenge());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("edutrack_weekly_challenge_progress", handleUpdate);
    return () => window.removeEventListener("edutrack_weekly_challenge_progress", handleUpdate);
  }, []);

  if (!data) return null;

  const { challenge, progress, completed } = data;
  const percentage = Math.min(100, Math.round((progress / challenge.targetCount) * 100));

  const handleClaimReward = () => {
    const claimedKey = `edutrack_claimed_weekly_${challenge.id}`;
    if (localStorage.getItem(claimedKey)) return;
    localStorage.setItem(claimedKey, "true");
    awardUserXP(challenge.xpReward);
    loadData();
  };

  return (
    <div className="premium-glass-panel p-6 rounded-3xl border border-amber-500/20 relative overflow-hidden group shadow-sm">
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-amber-500/25 shrink-0">
            {challenge.badgeEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Weekly Community Sprint
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold">
                +{challenge.xpReward} XP
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {challenge.title}
            </h3>
          </div>
        </div>

        {completed ? (
          <button
            onClick={handleClaimReward}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1 shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
          </button>
        ) : (
          <div className="text-right shrink-0">
            <span className="text-sm font-black text-amber-500 font-mono">
              {progress} / {challenge.targetCount}
            </span>
            <span className="text-[10px] block text-slate-500 font-medium">
              {challenge.unit}
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed font-medium">
        {challenge.description}
      </p>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-slate-500">Weekly Progress</span>
          <span className="text-amber-500 font-mono">{percentage}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
