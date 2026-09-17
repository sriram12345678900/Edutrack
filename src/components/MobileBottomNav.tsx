"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Sparkles, Camera, Compass, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MobileBottomNavProps {
  onOpenDrawer: () => void;
  isDrawerOpen: boolean;
}

export default function MobileBottomNav({ onOpenDrawer, isDrawerOpen }: MobileBottomNavProps) {
  const pathname = usePathname() || "";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHome = pathname === "/dashboard";
  const isLearn = pathname.startsWith("/learn") || pathname.startsWith("/ncert") || pathname.startsWith("/formulas");
  const isTutor = pathname.startsWith("/tutor");
  const isLens = pathname.startsWith("/lens");

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#060814]/95 backdrop-blur-2xl border-t border-slate-200/60 dark:border-white/10 px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),10px)] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-colors"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {/* 1. Home */}
        <Link
          href="/dashboard"
          prefetch={true}
          aria-label="Dashboard Home"
          className="focus:outline-none"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-1 min-h-[44px] rounded-2xl transition-all relative",
              (mounted && isHome)
                ? "text-indigo-600 dark:text-indigo-400 font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            {mounted && isHome && (
              <motion.div layoutId="mobileNavActive" className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            )}
            <Home className={cn("w-5 h-5 transition-transform", (mounted && isHome) && "scale-110")} />
            <span className="text-[11px] font-medium tracking-tight mt-0.5 leading-none">Home</span>
          </motion.div>
        </Link>

        {/* 2. Learn Hub */}
        <Link
          href="/learn"
          prefetch={true}
          aria-label="Subjects and Curriculum Hub"
          className="focus:outline-none"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-1 min-h-[44px] rounded-2xl transition-all relative",
              (mounted && isLearn)
                ? "text-indigo-600 dark:text-indigo-400 font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            {mounted && isLearn && (
              <motion.div layoutId="mobileNavActive" className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            )}
            <BookOpen className={cn("w-5 h-5 transition-transform", (mounted && isLearn) && "scale-110")} />
            <span className="text-[11px] font-medium tracking-tight mt-0.5 leading-none">Learn</span>
          </motion.div>
        </Link>

        {/* 3. Center AI Tutor Floating Action */}
        <Link
          href="/tutor"
          prefetch={true}
          aria-label="Open AI Tutor Mentor"
          className="flex flex-col items-center justify-center -mt-5 relative group focus:outline-none"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              "w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-[0_4px_20px_rgba(99,102,241,0.5)] border-2 border-white dark:border-[#060814] transition-all transform",
              (mounted && isTutor) ? "ring-4 ring-indigo-500/30" : ""
            )}
          >
            {mounted && isTutor && (
              <motion.div layoutId="mobileNavActive" className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            )}
            <Sparkles className="w-5.5 h-5.5 animate-pulse" />
          </motion.div>
          <span className={cn(
            "text-[11px] font-bold tracking-tight mt-1 leading-none",
            (mounted && isTutor) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300"
          )}>
            AI Tutor
          </span>
        </Link>

        {/* 4. Doubt-Solver Lens */}
        <Link
          href="/lens"
          prefetch={true}
          aria-label="Open Doubt-Solver Camera Lens"
          className="focus:outline-none"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-1 min-h-[44px] rounded-2xl transition-all relative",
              (mounted && isLens)
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            {mounted && isLens && (
              <motion.div layoutId="mobileNavActive" className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            )}
            <div className="relative">
              <Camera className={cn("w-5 h-5 transition-transform", (mounted && isLens) && "scale-110")} />
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-[11px] font-medium tracking-tight mt-0.5 leading-none">Lens</span>
          </motion.div>
        </Link>

        {/* 5. Explore / Hub Drawer Trigger */}
        <button
          onClick={onOpenDrawer}
          aria-label="Open Explore Menu"
          aria-expanded={isDrawerOpen}
          className="focus:outline-none"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-1 min-h-[44px] rounded-2xl transition-all relative",
              (mounted && isDrawerOpen)
                ? "text-purple-600 dark:text-purple-400 font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            {mounted && isDrawerOpen && (
              <motion.div layoutId="mobileNavActive" className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            )}
            <Compass className={cn("w-5 h-5 transition-transform", (mounted && isDrawerOpen) && "rotate-45 scale-110")} />
            <span className="text-[11px] font-medium tracking-tight mt-0.5 leading-none">Explore</span>
          </motion.div>
        </button>
      </div>
    </nav>
  );
}
