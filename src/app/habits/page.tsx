"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Home, Plus, Trash2, Check, TrendingUp, BarChart2, PieChart, Star, CheckSquare, Award } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { awardXp } from '@/lib/xp';

interface Habit {
  id: string;
  name: string;
  emoji: string;
  goalDays: number;
}

const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Wake up at 05:00', emoji: '⏰', goalDays: 20 },
  { id: '2', name: 'Gym / Exercise', emoji: '💪', goalDays: 15 },
  { id: '3', name: 'Reading / Learning', emoji: '📖', goalDays: 25 },
  { id: '4', name: 'Day Planning', emoji: '📋', goalDays: 28 },
  { id: '5', name: 'Science Deep Study', emoji: '🧬', goalDays: 22 },
  { id: '6', name: 'Math Problem Solve', emoji: '📐', goalDays: 22 },
  { id: '7', name: 'No Alcohol / Clean Eat', emoji: '🥦', goalDays: 30 },
  { id: '8', name: 'Social Media Detox', emoji: '📵', goalDays: 25 },
  { id: '9', name: 'Goal Journaling', emoji: '📝', goalDays: 20 },
  { id: '10', name: '10k Steps Walk', emoji: '🚶', goalDays: 20 },
  { id: '11', name: 'Plan Tomorrow Study', emoji: '🗒️', goalDays: 28 }
];

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  // Store logs as: { "YYYY-MM-DD": { [habitId]: boolean } }
  const [logs, setLogs] = useState<Record<string, Record<string, boolean>>>({});
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitEmoji, setNewHabitEmoji] = useState("⚡");
  const [newHabitGoal, setNewHabitGoal] = useState(20);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = useMemo(() => {
    const mIdx = months.indexOf(selectedMonth);
    return new Date(selectedYear, mIdx + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const monthIndex = useMemo(() => months.indexOf(selectedMonth), [selectedMonth]);

  // Load from local storage
  useEffect(() => {
    const storedHabits = localStorage.getItem('edutrack_habits');
    const storedLogs = localStorage.getItem('edutrack_habit_logs');
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
    } else {
      setHabits(DEFAULT_HABITS);
      localStorage.setItem('edutrack_habits', JSON.stringify(DEFAULT_HABITS));
    }
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
  }, []);

  const saveHabits = (updated: Habit[]) => {
    setHabits(updated);
    localStorage.setItem('edutrack_habits', JSON.stringify(updated));
  };

  const saveLogs = (updated: Record<string, Record<string, boolean>>) => {
    setLogs(updated);
    localStorage.setItem('edutrack_habit_logs', JSON.stringify(updated));
  };

  const toggleDay = (habitId: string, dayNum: number) => {
    const dateKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayLogs = { ...(logs[dateKey] || {}) };
    const isChecked = !dayLogs[habitId];
    dayLogs[habitId] = isChecked;

    const newLogs = { ...logs, [dateKey]: dayLogs };
    saveLogs(newLogs);

    if (isChecked) {
      // Award XP for ticking a habit checklist item
      awardXp(5, `Completed habit: ${habits.find(h => h.id === habitId)?.name || ""}`);
    }
  };

  // ── Calculation Utilities for charts ────────────────
  const habitCompletionStats = useMemo(() => {
    return habits.map(h => {
      let count = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (logs[dateKey]?.[h.id]) {
          count++;
        }
      }
      const goal = h.goalDays;
      const left = Math.max(0, goal - count);
      const progress = goal > 0 ? Math.min(100, Math.round((count / goal) * 100)) : 0;
      return {
        ...h,
        actual: count,
        left,
        progress
      };
    });
  }, [habits, logs, daysInMonth, selectedYear, monthIndex]);

  // Overall totals for donut chart
  const totals = useMemo(() => {
    const totalGoals = habits.reduce((acc, h) => acc + h.goalDays, 0);
    const totalActual = habitCompletionStats.reduce((acc, h) => acc + h.actual, 0);
    const totalLeft = Math.max(0, totalGoals - totalActual);
    const progressPercent = totalGoals > 0 ? Math.min(100, Math.round((totalActual / totalGoals) * 100)) : 0;
    return {
      goal: totalGoals,
      actual: totalActual,
      left: totalLeft,
      progressPercent
    };
  }, [habits, habitCompletionStats]);

  // Daily Progress Chart (Top center bar chart)
  const dailyProgress = useMemo(() => {
    const data: { day: number; completedCount: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayLogs = logs[dateKey] || {};
      const completedCount = Object.values(dayLogs).filter(Boolean).length;
      data.push({ day: d, completedCount });
    }
    return data;
  }, [logs, daysInMonth, selectedYear, monthIndex]);

  // Top 10 Habits list (Ranked by actual completed days)
  const topHabits = useMemo(() => {
    return [...habitCompletionStats]
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 10);
  }, [habitCompletionStats]);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      emoji: newHabitEmoji,
      goalDays: Math.min(daysInMonth, Math.max(1, newHabitGoal))
    };
    saveHabits([...habits, newHabit]);
    setNewHabitName("");
    setShowAddModal(false);
  };

  const handleDeleteHabit = (id: string) => {
    if (confirm("Are you sure you want to remove this habit?")) {
      saveHabits(habits.filter(h => h.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 font-sans p-6 pb-20 overflow-x-auto">
      {/* Top Navigation */}
      <header className="max-w-[1600px] mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/20 p-3 rounded-2xl border border-indigo-500/30">
            <CheckSquare className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">HABIT TRACKER</h1>
            <p className="text-slate-500 text-sm font-medium">Build consistency, master your daily routines, and earn academic XP.</p>
          </div>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-black/40">
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </header>

      {/* Main Grid: Match reference layout structure */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Habit Settings List (Span 3) */}
        <div className="xl:col-span-3 space-y-6">
          {/* Calendar settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">Calendar Settings</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
                >
                  {months.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* List of habits management */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">My Habits</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-650 hover:bg-indigo-600 text-white p-1.5 rounded-lg text-xs transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              {habits.map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-slate-850 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{h.emoji}</span>
                    <span className="text-xs font-bold text-slate-200">{h.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteHabit(h.id)}
                    className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Daily Progress + Checkbox Grid (Span 6) */}
        <div className="xl:col-span-6 space-y-6">
          
          {/* Top segment: Daily Progress Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-indigo-400" /> Daily Progress ({selectedMonth})
            </h2>

            {/* Scrollable container for the horizontal bars */}
            <div className="overflow-x-auto pr-1">
              <div className="flex items-end justify-between gap-1 h-32 pt-4 min-w-[500px]">
                {dailyProgress.map(d => {
                  const maxPossible = habits.length;
                  const ratio = maxPossible > 0 ? (d.completedCount / maxPossible) * 100 : 0;
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center group h-full justify-end">
                      <div className="text-[9px] font-bold text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.completedCount}
                      </div>
                      <div
                        className="w-full bg-indigo-500/10 rounded-t-sm transition-all relative overflow-hidden"
                        style={{ height: `${Math.max(4, ratio)}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-650 to-indigo-400" />
                      </div>
                      <div className="text-[8px] font-bold text-slate-600 mt-1">{d.day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid Checklist Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Habit Checklist Grid</h2>
            </div>

            {/* Grid Header and checklist table */}
            <div className="min-w-[760px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80">
                    <th className="text-left py-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 w-32">Habit Name</th>
                    {Array.from({ length: daysInMonth }).map((_, i) => (
                      <th key={i} className="text-center py-2 text-[9px] font-black text-slate-500 w-6">{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {habits.map(h => (
                    <tr key={h.id} className="border-b border-slate-900 hover:bg-slate-950/20 transition-colors">
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <span className="text-sm">{h.emoji}</span>
                        <span className="text-xs font-bold text-slate-300 truncate max-w-[120px]">{h.name}</span>
                      </td>
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        const isChecked = !!logs[dateKey]?.[h.id];
                        return (
                          <td key={i} className="py-2 text-center">
                            <button
                              onClick={() => toggleDay(h.id, dayNum)}
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                isChecked
                                  ? "bg-indigo-600 border-indigo-500 text-white scale-110 shadow-sm shadow-indigo-600/30"
                                  : "border-slate-800 hover:border-slate-700 bg-slate-950"
                              }`}
                            >
                              {isChecked && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {habits.length === 0 && (
                    <tr>
                      <td colSpan={daysInMonth + 1} className="py-8 text-center text-slate-500 text-xs italic">
                        No habits added yet. Click "Add" above to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Circular Progress + Analysis Table + Top Ranked (Span 3) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* circular doughnut chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 w-full flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-indigo-400" /> Overall Completion
            </h2>
            
            <div className="relative w-36 h-36 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-850"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-500 transition-all duration-500"
                  strokeDasharray={`${totals.progressPercent}, 100`}
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{totals.progressPercent}%</span>
                <span className="text-[9px] font-black uppercase text-slate-500">Progress</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full mt-4 text-center border-t border-slate-850 pt-4">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Goal</p>
                <p className="text-sm font-extrabold text-slate-200">{totals.goal}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Done</p>
                <p className="text-sm font-extrabold text-emerald-400">{totals.actual}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Left</p>
                <p className="text-sm font-extrabold text-slate-400">{totals.left}</p>
              </div>
            </div>
          </div>

          {/* Analysis table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Consistency Analysis
            </h2>

            <div className="space-y-3 overflow-y-auto max-h-[220px] scrollbar-thin pr-1">
              {habitCompletionStats.map(h => (
                <div key={h.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-350">
                    <span className="truncate max-w-[120px]">{h.emoji} {h.name}</span>
                    <span>{h.actual}/{h.goalDays} ({h.progress}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${h.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              {habits.length === 0 && (
                <p className="text-slate-500 text-xs italic text-center py-4">No data to analyze.</p>
              )}
            </div>
          </div>

          {/* Top 10 Habits */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Star className="w-4 h-4 text-indigo-400" /> Top Ranked Habits
            </h2>

            <div className="space-y-2">
              {topHabits.map((h, i) => (
                <div key={h.id} className="flex items-center justify-between text-xs p-2 bg-slate-950/30 rounded-lg">
                  <div className="flex items-center gap-2 font-bold text-slate-300">
                    <span className="text-slate-500 text-[10px] w-4">{i + 1}.</span>
                    <span>{h.emoji} {h.name}</span>
                  </div>
                  <span className="font-extrabold text-indigo-400">{h.actual} Days</span>
                </div>
              ))}
              {habits.length === 0 && (
                <p className="text-slate-500 text-xs italic text-center py-4">Add habits to rank consistency.</p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Add Habit modal overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wide">Add New Habit</h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Set a new personal learning or study wellness target.</p>
            </div>

            <form onSubmit={handleAddHabit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-450 uppercase block">Habit Name</label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Solve 5 Algebra PYQs"
                  maxLength={25}
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 uppercase block">Emoji Icon</label>
                  <input
                    type="text"
                    value={newHabitEmoji}
                    onChange={(e) => setNewHabitEmoji(e.target.value)}
                    maxLength={2}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl text-xs sm:text-sm font-bold text-center text-white transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 uppercase block">Goal (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={newHabitGoal}
                    onChange={(e) => setNewHabitGoal(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl text-xs sm:text-sm font-bold text-center text-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 font-extrabold py-3 rounded-2xl transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold py-3 rounded-2xl transition-all shadow-md shadow-indigo-600/10 text-xs"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
