"use client";

import { Sparkles, Flame, Globe } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getLanguageConfig } from "@/lib/languages";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  firstName: string;
  userClass: any;
  userLanguage: string;
  streak: number;
  itemVariants: any;
  zenMode?: boolean;
  onToggleZen?: () => void;
}

export function DashboardHeader({ 
  firstName, 
  userClass, 
  userLanguage, 
  streak, 
  itemVariants,
  zenMode,
  onToggleZen
}: DashboardHeaderProps) {
  const langConfig = getLanguageConfig(userLanguage);

  return (
    <motion.header 
      variants={itemVariants} 
      className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 border-b border-slate-200 dark:border-white/10 pb-6 w-full"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/15">
            Premium Academic Space
          </span>
          <Link href="/settings" className="inline-flex items-center gap-1.5 text-[10px] font-black text-purple-600 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-500/20 transition-colors" title="Click to change study language in Settings">
            <Globe className="w-3 h-3 text-purple-500" />
            <span>{langConfig.label}</span>
          </Link>
        </div>
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mt-2.5 sm:mt-3.5 tracking-tight">
          <span className="premium-text-gradient-accent">
            Welcome back, {firstName}!
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1.5 sm:mt-2.5 font-bold text-xs">
          {userClass ? `Class ${userClass}` : "Class 10"} | Studying in {langConfig.englishName === langConfig.nativeName ? langConfig.englishName : `${langConfig.englishName} (${langConfig.nativeName})`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
        <div id="tour-streak-header" className="inline-flex items-center gap-2 bg-orange-500/10 dark:bg-orange-500/5 text-orange-600 dark:text-orange-400 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-2xl border border-orange-500/20 font-black text-xs sm:text-sm shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 -translate-x-full group-hover:animate-shimmer" />
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 animate-flame-glow" /> 
          <span>{streak} Day Streak</span>
        </div>

        {onToggleZen && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onToggleZen}
            className={cn(
              "flex items-center gap-2 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-2xl text-xs font-bold transition-all border shadow-sm min-h-[40px]",
              zenMode 
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20" 
                : "bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
            title="Toggle Zen Focus Mode"
          >
            <Sparkles className={cn("w-3.5 h-3.5", zenMode ? "text-emerald-500 dark:text-emerald-400 animate-pulse" : "text-slate-400")} />
            <span>{zenMode ? "Zen: Active" : "Zen Focus Mode"}</span>
          </motion.button>
        )}

        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("edutrack_open_feature_tour", { detail: { stepIndex: 0 } }));
            }
          }}
          className="text-xs font-black text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5 sm:gap-2 min-h-[40px]"
          title="Explore interactive feature callouts"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
          <span>Feature Tour</span>
        </button>
        <Link href="/settings">
          <button className="text-xs font-extrabold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.08] px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 min-h-[40px]">
            Settings
          </button>
        </Link>
      </div>
    </motion.header>
  );
}
