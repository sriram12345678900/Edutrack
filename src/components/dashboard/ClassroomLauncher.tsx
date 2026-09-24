"use client";

import { GraduationCap, BookOpen, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function ClassroomLauncher({ itemVariants }: any) {
  return (
    <motion.div 
      variants={itemVariants} 
      className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 dark:from-indigo-900/60 dark:via-purple-900/40 dark:to-blue-900/50 border border-indigo-400/30 dark:border-indigo-500/30 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 text-white"
    >
      <div className="flex items-center gap-3.5 w-full md:w-auto">
        <div className="w-12 h-12 rounded-2xl bg-white/20 dark:bg-gradient-to-br dark:from-indigo-500 dark:to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-white/20 shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-white bg-white/20 dark:text-indigo-300 dark:bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-white/20 dark:border-indigo-400/20">
              School-to-Home Classroom
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 dark:bg-emerald-400 animate-ping" />
              Live Hub Active
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-white">Classrooms, Live Lectures & Homework Bridge</h3>
          <p className="text-xs text-white/80 dark:text-slate-300 line-clamp-1">Join active video classes, submit homework, or switch to Teacher command center.</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0">
        <Link
          href="/classroom"
          className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white dark:bg-indigo-600 hover:bg-slate-100 dark:hover:bg-indigo-700 text-indigo-700 dark:text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Student Classroom
        </Link>

        <Link
          href="/bridge"
          className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          title="School-to-Home Parent Bridge"
        >
          <Shield className="w-3.5 h-3.5 text-teal-200 dark:text-teal-300" />
          <span className="hidden sm:inline">Bridge</span>
        </Link>
      </div>
    </motion.div>
  );
}
