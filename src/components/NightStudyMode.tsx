"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sparkles, X, AlarmClock, Eye } from "lucide-react";
import Link from "next/link";
import { getNightModeConfig, isCurrentlyNightTime, NightModeConfig } from "@/lib/night-mode";

export default function NightStudyMode() {
  const [isNight, setIsNight] = useState(false);
  const [config, setConfig] = useState<NightModeConfig>(getNightModeConfig());
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      const cfg = getNightModeConfig();
      setConfig(cfg);
      const active = isCurrentlyNightTime(cfg);
      setIsNight(active);

      if (active) {
        document.documentElement.classList.add("night-study-active");
        // Check if reminder was dismissed today
        const todayStr = new Date().toISOString().slice(0, 10);
        const dismissedDate = localStorage.getItem("edutrack_night_dismissed_date");
        if (cfg.bedtimeReminder && dismissedDate !== todayStr) {
          setShowReminder(true);
        }
      } else {
        document.documentElement.classList.remove("night-study-active");
        setShowReminder(false);
      }
    };

    evaluate();
    const interval = setInterval(evaluate, 60000); // Check every minute

    const handleToggle = () => evaluate();
    window.addEventListener("edutrack_night_mode_toggle", handleToggle);

    return () => {
      clearInterval(interval);
      window.removeEventListener("edutrack_night_mode_toggle", handleToggle);
      document.documentElement.classList.remove("night-study-active");
    };
  }, []);

  const handleDismissReminder = () => {
    setShowReminder(false);
    const todayStr = new Date().toISOString().slice(0, 10);
    localStorage.setItem("edutrack_night_dismissed_date", todayStr);
  };

  return (
    <>
      {/* Visual Sepia / Blue-light filtration overlay when active */}
      {isNight && (
        <div 
          className="fixed inset-0 pointer-events-none z-[9998] transition-opacity duration-1000 bg-amber-950/10 dark:bg-amber-900/[0.08] mix-blend-color" 
          aria-hidden="true" 
        />
      )}

      {/* Gentle Bedtime & Circadian Reminder Modal */}
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-[9999] max-w-sm p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/30 text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
                <Moon className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300">
                    Night Study Comfort Active
                  </h4>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-200 px-1.5 py-0.2 rounded font-mono">
                    21:00+
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Blue-light shielding is on. Science shows sleeping before 10:30 PM solidifies 
                  memory consolidation for CBSE concepts.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Link
                    href="/alarm"
                    onClick={handleDismissReminder}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all"
                  >
                    <AlarmClock className="w-3 h-3" /> Set Wake Alarm
                  </Link>
                  <button
                    onClick={handleDismissReminder}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 font-medium text-[11px] transition-all"
                  >
                    Got It
                  </button>
                </div>
              </div>
              <button 
                onClick={handleDismissReminder}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
