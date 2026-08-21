import { Sparkles, Flame } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function DashboardHeader({ firstName, userClass, userLanguage, streak, itemVariants }: any) {
  return (
    <motion.header 
      variants={itemVariants} 
      className="flex flex-col md:flex-row justify-between md:items-center gap-6 border-b border-slate-200/50 dark:border-slate-200/60 dark:border-white/5 pb-8"
    >
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/15">
          Premium Academic Space
        </span>
        <h1 className="text-4xl md:text-5xl font-black mt-3.5 tracking-tight">
          <span className="premium-text-gradient-accent">
            Welcome back, {firstName}!
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2.5 font-bold text-xs">
          {userClass ? `Class ${userClass}` : "Class 10"} | Language Preference: {userLanguage}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="inline-flex items-center gap-2 bg-orange-500/5 dark:bg-orange-500/5 text-orange-600 dark:text-orange-400 px-4.5 py-3 rounded-2xl border border-orange-500/15 font-black text-sm shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 -translate-x-full group-hover:animate-shimmer" />
          <Flame className="w-5 h-5 text-orange-500 animate-flame-glow" /> 
          <span>{streak} Day Streak</span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("edutrack_open_tour", { detail: { initialStep: 0 } }));
            }
          }}
          className="text-xs font-black text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-4.5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>App Tour</span>
        </button>
        <Link href="/setup">
          <button className="text-xs font-extrabold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-200/60 dark:border-white/5 bg-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.04] px-4.5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95">
            Settings
          </button>
        </Link>
      </div>
    </motion.header>
  );
}
