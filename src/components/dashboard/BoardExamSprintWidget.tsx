"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, Clock, Calendar, CheckCircle2, ChevronRight, 
  Sparkles, Target, Trophy, ArrowRight, Zap, AlertCircle
} from "lucide-react";
import { awardUserXP } from "@/lib/xp";
import Confetti from "@/components/Confetti";
import { cn } from "@/lib/utils";

interface SprintTask {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  type: "mcq" | "numerical" | "diagram";
  completed: boolean;
}

export default function BoardExamSprintWidget() {
  const [examDate, setExamDate] = useState<string>("2027-02-15");
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [completedChapters, setCompletedChapters] = useState(19);
  const totalChapters = 32;

  const [sprintTasks, setSprintTasks] = useState<SprintTask[]>([
    {
      id: "st-1",
      title: "Ray Diagram: Concave Mirror Object Between C & F",
      subject: "Science",
      chapter: "Light - Reflection & Refraction",
      type: "diagram",
      completed: true
    },
    {
      id: "st-2",
      title: "Solve 2 PYQs on Roots of Quadratic Equations (D > 0)",
      subject: "Mathematics",
      chapter: "Quadratic Equations",
      type: "numerical",
      completed: false
    },
    {
      id: "st-3",
      title: "Revise Neutralization: Slaked Lime and Bleaching Powder",
      subject: "Science",
      chapter: "Acids, Bases & Salts",
      type: "mcq",
      completed: false
    }
  ]);

  const [showConfetti, setShowConfetti] = useState(false);

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(examDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [examDate]);

  const handleToggleTask = (taskId: string) => {
    setSprintTasks(prev => {
      const next = prev.map(t => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            awardUserXP(35);
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      });

      if (next.every(t => t.completed)) {
        setShowConfetti(true);
        awardUserXP(100);
      }
      return next;
    });
  };

  const completedCount = sprintTasks.filter(t => t.completed).length;
  const progressPct = Math.round((completedChapters / totalChapters) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-950 p-6 md:p-7 shadow-xl backdrop-blur-xl">
      <Confetti active={showConfetti} />
      
      {/* Ambient glow */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      {/* Header & Live Ticker */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Flame className="h-3.5 w-3.5 fill-amber-400" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              CBSE Class 10 Board Exam Sprint
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
            Target Exam Velocity & Countdown
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic syllabus pacing: You are pacing <strong className="text-emerald-400 font-semibold">1.4 chapters/week</strong> (on track to finish 12 days early).
          </p>
        </div>

        {/* Live Countdown Clock Blocks */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-2xl shrink-0">
          <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800/60 min-w-[50px]">
            <span className="text-lg md:text-xl font-black text-amber-400 font-mono">{timeLeft.days}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Days</span>
          </div>
          <span className="text-slate-600 font-bold">:</span>
          <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800/60 min-w-[50px]">
            <span className="text-lg md:text-xl font-black text-slate-200 font-mono">{String(timeLeft.hours).padStart(2, "0")}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hrs</span>
          </div>
          <span className="text-slate-600 font-bold">:</span>
          <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800/60 min-w-[50px]">
            <span className="text-lg md:text-xl font-black text-slate-200 font-mono">{String(timeLeft.minutes).padStart(2, "0")}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Min</span>
          </div>
          <span className="text-slate-600 font-bold">:</span>
          <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800/60 min-w-[50px]">
            <span className="text-lg md:text-xl font-black text-amber-500 font-mono">{String(timeLeft.seconds).padStart(2, "0")}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sec</span>
          </div>
        </div>
      </div>

      {/* Progress & Daily Sprint Tasks */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Overall Syllabus Burn-Down */}
        <div className="md:col-span-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">Syllabus Completion</span>
            <span className="text-amber-400 font-mono">{completedChapters}/{totalChapters} Ch ({progressPct}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Science: 11/13</span>
            <span>Math: 8/14</span>
            <span>SST: 0/5</span>
          </div>
        </div>

        {/* Right: Today's High-Yield Sprint Tasks */}
        <div className="md:col-span-8 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
            <span className="uppercase tracking-wider">Today's High-Yield Sprint ({completedCount}/{sprintTasks.length} Done)</span>
            <span className="text-amber-400 font-mono">+100 Sprint Bonus XP</span>
          </div>

          <div className="space-y-2">
            {sprintTasks.map(task => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all text-xs",
                  task.completed
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition",
                    task.completed
                      ? "bg-emerald-500 border-emerald-400 text-white"
                      : "border-slate-700 bg-slate-900"
                  )}>
                    {task.completed && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div>
                    <span className={cn("font-medium", task.completed && "line-through opacity-70")}>
                      {task.title}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {task.subject} • {task.chapter}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-300 shrink-0 font-mono">
                  +35 XP
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
