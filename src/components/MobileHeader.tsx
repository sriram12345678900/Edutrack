"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Brain, Flame, Trophy, Moon, Sun, Sparkles, Menu, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamificationStore } from "@/store/useGamificationStore";

interface MobileHeaderProps {
  displayName: string;
  initials: string;
  userLevel: number;
  userXp: number;
  photoURL?: string | null;
  friendCode?: string;
  onOpenDrawer: () => void;
  onOpenTour: () => void;
}

export default function MobileHeader({
  displayName,
  initials,
  userLevel,
  userXp,
  photoURL,
  friendCode,
  onOpenDrawer,
  onOpenTour,
}: MobileHeaderProps) {
  const [userClass, setUserClass] = useState<string>("10");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  const streakDays = useGamificationStore(state => state.streak);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedClass = localStorage.getItem("edutrack_class");
      if (storedClass) setUserClass(storedClass);

      setIsDarkMode(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("edutrack_theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("edutrack_theme", "dark");
      setIsDarkMode(true);
    }
  };

  return (
    <header className="md:hidden sticky top-0 left-0 right-0 z-30 bg-white/90 dark:bg-[#040614]/90 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/10 px-3.5 py-2.5 flex items-center justify-between transition-colors shadow-sm">
      {/* Brand & Class Badge */}
      <div className="flex items-center gap-2.5">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/30 border border-white/20 shrink-0 group-active:scale-95 transition-transform">
            <Brain className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white leading-none">EduTrack</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </div>
            <span className="text-[8px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 leading-none mt-0.5">
              Class {userClass}
            </span>
          </div>
        </Link>
      </div>

      {/* Right Stats & Quick Actions */}
      <div className="flex items-center gap-1.5">
        {/* Streak Pill */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 px-2 py-1 rounded-full text-amber-600 dark:text-amber-400 active:scale-95 transition-transform"
          title={`Daily Study Streak: ${streakDays} days`}
        >
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-bounce" style={{ animationDuration: "2s" }} />
          <span className="text-[10px] font-black">{streakDays}d</span>
        </Link>

        {/* Level Pill */}
        <Link
          href="/trophies"
          className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/25 px-2 py-1 rounded-full text-indigo-600 dark:text-indigo-400 active:scale-95 transition-transform"
          title={`Level ${userLevel} (${userXp} XP)`}
        >
          <Trophy className="w-3 h-3 text-indigo-500" />
          <span className="text-[10px] font-black">L{userLevel}</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 active:scale-90 transition-transform"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          )}
        </button>

        {/* Profile Avatar / Menu Trigger */}
        <button
          onClick={onOpenDrawer}
          className="relative shrink-0 active:scale-95 transition-transform ml-0.5"
          title="Open menu & tools"
          aria-label="Open menu"
        >
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500/40 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-[11px] shadow-sm border border-white/20">
              {initials}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-indigo-600 rounded-full flex items-center justify-center border border-white dark:border-[#040614]">
            <Menu className="w-2 h-2 text-white" />
          </div>
        </button>
      </div>
    </header>
  );
}
