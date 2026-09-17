"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, Plus, Trash2, Check, TrendingUp, BarChart2, PieChart, Star, 
  CheckSquare, Award, Flame, Zap, Calendar, Sparkles, Volume2, VolumeX, 
  Layers, Filter, ChevronRight, Edit3, Compass, ArrowUpRight, Clock, ShieldCheck,
  Sun, Moon, Sunrise, Sunset, ArrowUpDown
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from '@/components/Confetti';
import { awardXp } from '@/lib/xp';

export type HabitCategory = 'academic' | 'wellness' | 'focus';
export type HabitPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  goalDays: number;
  category: HabitCategory;
  time?: string; // 24-hour "HH:MM", e.g. "05:30"
  period?: HabitPeriod;
}

const getPeriodFromTime = (time?: string): HabitPeriod => {
  if (!time) return 'morning';
  const hour = parseInt(time.split(':')[0], 10);
  if (isNaN(hour)) return 'morning';
  if (hour >= 4 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const formatTime12 = (time24?: string) => {
  if (!time24) return "Flexible";
  const parts = time24.split(":");
  let h = parseInt(parts[0], 10);
  const m = parts[1] || "00";
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
};

const getPeriodBadge = (period: HabitPeriod) => {
  switch (period) {
    case 'morning':
      return { label: 'Morning', icon: '🌅', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    case 'afternoon':
      return { label: 'Afternoon', icon: '☀️', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' };
    case 'evening':
      return { label: 'Evening', icon: '🌆', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
    case 'night':
      return { label: 'Night', icon: '🌙', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
  }
};

const TIME_PRESETS = [
  { label: "05:00 AM", value: "05:00", period: "morning" as HabitPeriod, icon: "🌅" },
  { label: "06:30 AM", value: "06:30", period: "morning" as HabitPeriod, icon: "🌅" },
  { label: "08:00 AM", value: "08:00", period: "morning" as HabitPeriod, icon: "☀️" },
  { label: "12:30 PM", value: "12:30", period: "afternoon" as HabitPeriod, icon: "🌤️" },
  { label: "03:30 PM", value: "15:30", period: "afternoon" as HabitPeriod, icon: "🌤️" },
  { label: "06:00 PM", value: "18:00", period: "evening" as HabitPeriod, icon: "🌆" },
  { label: "08:00 PM", value: "20:00", period: "evening" as HabitPeriod, icon: "🌆" },
  { label: "09:30 PM", value: "21:30", period: "night" as HabitPeriod, icon: "🌙" },
  { label: "10:30 PM", value: "22:30", period: "night" as HabitPeriod, icon: "🌙" },
];

const EMOJI_PRESETS = [
  "⏰", "💪", "📖", "📐", "🧬", "📵", "💧", "📋", "⚡", "📝", 
  "🏃", "🧘", "🌙", "🎯", "🧠", "☕", "🚴", "✍️", "🔬", "🍎"
];

const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Wake up at 05:00', emoji: '⏰', goalDays: 20, category: 'wellness', time: '05:00', period: 'morning' },
  { id: '2', name: 'Gym / Morning Workout', emoji: '💪', goalDays: 16, category: 'wellness', time: '06:00', period: 'morning' },
  { id: '3', name: 'NCERT Deep Reading', emoji: '📖', goalDays: 24, category: 'academic', time: '07:30', period: 'morning' },
  { id: '4', name: 'Math / Physics PYQs', emoji: '📐', goalDays: 22, category: 'academic', time: '14:00', period: 'afternoon' },
  { id: '5', name: 'Science Concept Notes', emoji: '🧬', goalDays: 20, category: 'academic', time: '16:00', period: 'afternoon' },
  { id: '6', name: 'Social Media Detox', emoji: '📵', goalDays: 25, category: 'focus', time: '17:30', period: 'evening' },
  { id: '7', name: 'Hydration (2.5L Water)', emoji: '💧', goalDays: 28, category: 'wellness', time: '18:30', period: 'evening' },
  { id: '8', name: 'Daily Priority Planning', emoji: '📋', goalDays: 26, category: 'focus', time: '19:30', period: 'evening' },
  { id: '9', name: 'Active Recall Flashcards', emoji: '⚡', goalDays: 22, category: 'academic', time: '20:30', period: 'night' },
  { id: '10', name: 'Night Journal & Tomorrow Plan', emoji: '📝', goalDays: 24, category: 'focus', time: '21:30', period: 'night' }
];

const ROUTINE_TEMPLATES = [
  {
    title: "CBSE Board Topper Kit",
    desc: "Rigorous daily revision, high-yield formula recall, and deep work blocks.",
    badge: "Most Popular",
    color: "from-blue-600 to-indigo-700",
    habits: [
      { name: "Morning Formula Drill", emoji: "📐", goalDays: 26, category: "academic" as HabitCategory, time: "05:30", period: "morning" as HabitPeriod },
      { name: "NCERT Active Reading (1 Ch)", emoji: "📖", goalDays: 24, category: "academic" as HabitCategory, time: "07:00", period: "morning" as HabitPeriod },
      { name: "Solve 5 Exemplar / PYQ Questions", emoji: "✍️", goalDays: 22, category: "academic" as HabitCategory, time: "14:30", period: "afternoon" as HabitPeriod },
      { name: "Digital Distraction Lockout (2hr)", emoji: "📵", goalDays: 28, category: "focus" as HabitCategory, time: "17:00", period: "evening" as HabitPeriod },
      { name: "Evening Error Log Analysis", emoji: "🔍", goalDays: 20, category: "academic" as HabitCategory, time: "20:00", period: "night" as HabitPeriod }
    ]
  },
  {
    title: "High-Energy Student Wellness",
    desc: "Peak cognitive performance begins with physical recovery and focus.",
    badge: "Health & Mind",
    color: "from-emerald-600 to-teal-700",
    habits: [
      { name: "Hydrate: 500ml Water Upon Waking", emoji: "💧", goalDays: 30, category: "wellness" as HabitCategory, time: "05:30", period: "morning" as HabitPeriod },
      { name: "20-Min Cardio / Yoga Stretch", emoji: "🏃", goalDays: 20, category: "wellness" as HabitCategory, time: "06:15", period: "morning" as HabitPeriod },
      { name: "Outdoor 10k Steps Walk", emoji: "🚶", goalDays: 22, category: "wellness" as HabitCategory, time: "17:00", period: "evening" as HabitPeriod },
      { name: "10-Min Mindfulness Meditation", emoji: "🧘", goalDays: 25, category: "wellness" as HabitCategory, time: "20:00", period: "night" as HabitPeriod },
      { name: "8 Hours Sleep Schedule", emoji: "🌙", goalDays: 26, category: "wellness" as HabitCategory, time: "22:00", period: "night" as HabitPeriod }
    ]
  },
  {
    title: "STEM & Olympiad Achiever",
    desc: "Intensive problem-solving, AI simulation labs, and Olympiad puzzles.",
    badge: "Elite Focus",
    color: "from-purple-600 to-pink-700",
    habits: [
      { name: "Solve 1 Olympiad Hard Problem", emoji: "🧠", goalDays: 22, category: "academic" as HabitCategory, time: "06:00", period: "morning" as HabitPeriod },
      { name: "Science Sandbox Simulation Lab", emoji: "🔬", goalDays: 18, category: "academic" as HabitCategory, time: "14:00", period: "afternoon" as HabitPeriod },
      { name: "EduTrack Viva Voice Practice", emoji: "🗣️", goalDays: 20, category: "academic" as HabitCategory, time: "16:30", period: "afternoon" as HabitPeriod },
      { name: "Deep Focus Pomodoro Block", emoji: "⏱️", goalDays: 25, category: "focus" as HabitCategory, time: "18:30", period: "evening" as HabitPeriod },
      { name: "Daily Learning Summary Notes", emoji: "📝", goalDays: 24, category: "focus" as HabitCategory, time: "21:00", period: "night" as HabitPeriod }
    ]
  }
];

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  // logs: { "YYYY-MM-DD": { [habitId]: boolean } }
  const [logs, setLogs] = useState<Record<string, Record<string, boolean>>>({});
  
  // Real time reference
  const now = useMemo(() => new Date(), []);
  const realYear = now.getFullYear();
  const realMonthIndex = now.getMonth();
  const realDay = now.getDate();
  
  const months = useMemo(() => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], []);
  
  const [selectedYear, setSelectedYear] = useState<number>(realYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(months[realMonthIndex]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | HabitCategory>('all');
  const [todayFilter, setTodayFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [activePeriodFilter, setActivePeriodFilter] = useState<'all' | HabitPeriod | 'next_up'>('all');
  const [sortByScheduleTime, setSortByScheduleTime] = useState<boolean>(true);
  const [quickTimePickerId, setQuickTimePickerId] = useState<string | null>(null);
  const [chartViewMode, setChartViewMode] = useState<'donut' | 'weekday' | 'gauge' | 'heatmap'>('donut');
  const [mobileView, setMobileView] = useState<'matrix' | 'cards'>('cards');
  
  // Modals & UI States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [confettiActive, setConfettiActive] = useState(false);
  const [xpToast, setXpToast] = useState<{ show: boolean; msg: string; xp: number } | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmoji, setFormEmoji] = useState("⚡");
  const [formGoal, setFormGoal] = useState(22);
  const [formCategory, setFormCategory] = useState<HabitCategory>('academic');
  const [formTime, setFormTime] = useState("07:00");
  const [formPeriod, setFormPeriod] = useState<HabitPeriod>('morning');

  // Days in current selected month
  const monthIndex = useMemo(() => months.indexOf(selectedMonth), [selectedMonth, months]);
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, monthIndex + 1, 0).getDate();
  }, [selectedYear, monthIndex]);

  // Real today key
  const todayKey = `${realYear}-${String(realMonthIndex + 1).padStart(2, '0')}-${String(realDay).padStart(2, '0')}`;

  // Audio synthesizer using Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playChime = (freq = 587.33) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio context might be restricted
    }
  };

  const playVictoryFanfare = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.35);
      });
    } catch {
      // Audio context might be restricted
    }
  };

  // Load from local storage
  useEffect(() => {
    const storedHabits = localStorage.getItem('edutrack_habits');
    const storedLogs = localStorage.getItem('edutrack_habit_logs');
    const storedSound = localStorage.getItem('edutrack_habit_sound');

    if (storedSound !== null) {
      setSoundEnabled(storedSound === 'true');
    }

    if (storedHabits) {
      try {
        const parsed: Habit[] = JSON.parse(storedHabits);
        // Ensure category & time schedule defaults if loading older format
        const defaultTimes = ['05:00', '06:00', '07:30', '14:00', '16:00', '17:30', '18:30', '19:30', '20:30', '21:30'];
        const upgraded = parsed.map((h, idx) => {
          const time = h.time || defaultTimes[idx % defaultTimes.length];
          return {
            ...h,
            category: h.category || ('academic' as HabitCategory),
            time,
            period: h.period || getPeriodFromTime(time)
          };
        });
        setHabits(upgraded);
      } catch {
        setHabits(DEFAULT_HABITS);
      }
    } else {
      setHabits(DEFAULT_HABITS);
      localStorage.setItem('edutrack_habits', JSON.stringify(DEFAULT_HABITS));
    }

    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch {
        setLogs({});
      }
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

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('edutrack_habit_sound', String(next));
  };

  // Streak calculations
  const habitStreaks = useMemo(() => {
    const streaks: Record<string, { current: number; best: number }> = {};

    habits.forEach(h => {
      let current = 0;
      let best = 0;
      let tempStreak = 0;

      // Scan up to today
      const checkDate = new Date(realYear, realMonthIndex, realDay);
      // Check current streak walking backward
      let d = new Date(checkDate);
      let isStreakAlive = true;

      // Check today first, if not checked check yesterday to keep streak active
      const todayK = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (logs[todayK]?.[h.id]) {
        current++;
        d.setDate(d.getDate() - 1);
      } else {
        // Today not done yet; check if yesterday was done
        d.setDate(d.getDate() - 1);
        const yestK = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!logs[yestK]?.[h.id]) {
          isStreakAlive = false;
        }
      }

      while (isStreakAlive) {
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (logs[k]?.[h.id]) {
          current++;
          d.setDate(d.getDate() - 1);
        } else {
          isStreakAlive = false;
        }
      }

      // Best streak calculation in the selected month
      for (let day = 1; day <= daysInMonth; day++) {
        const k = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (logs[k]?.[h.id]) {
          tempStreak++;
          if (tempStreak > best) best = tempStreak;
        } else {
          tempStreak = 0;
        }
      }

      streaks[h.id] = { current, best: Math.max(best, current) };
    });

    return streaks;
  }, [habits, logs, realYear, realMonthIndex, realDay, selectedYear, monthIndex, daysInMonth]);

  // Toggle habit on a given date key
  const toggleDateHabit = (habitId: string, dateKey: string) => {
    const dayLogs = { ...(logs[dateKey] || {}) };
    const willBeChecked = !dayLogs[habitId];
    dayLogs[habitId] = willBeChecked;

    const newLogs = { ...logs, [dateKey]: dayLogs };
    saveLogs(newLogs);

    if (willBeChecked) {
      playChime();
      awardXp(10, `Completed habit`);
      setXpToast({ show: true, msg: "Habit complete! Consistency streak boosted", xp: 10 });
      setTimeout(() => setXpToast(null), 2500);

      // Check if ALL habits for this day are now completed
      const allDone = habits.every(h => (h.id === habitId ? true : !!dayLogs[h.id]));
      if (allDone && habits.length > 0) {
        playVictoryFanfare();
        setConfettiActive(true);
        awardXp(50, `100% Daily Habits Completed!`);
        setTimeout(() => setConfettiActive(false), 5000);
      }
    }
  };

  // Toggle for specific day number in current selected month
  const toggleDayNum = (habitId: string, dayNum: number) => {
    const dateKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    toggleDateHabit(habitId, dateKey);
  };

  // Quick complete all remaining for today
  const completeAllToday = () => {
    const dayLogs = { ...(logs[todayKey] || {}) };
    let newlyDoneCount = 0;

    habits.forEach(h => {
      if (!dayLogs[h.id]) {
        dayLogs[h.id] = true;
        newlyDoneCount++;
      }
    });

    if (newlyDoneCount > 0) {
      const newLogs = { ...logs, [todayKey]: dayLogs };
      saveLogs(newLogs);
      playVictoryFanfare();
      setConfettiActive(true);
      awardXp(newlyDoneCount * 10 + 50, "Full Day Habit Routine Completed!");
      setXpToast({ show: true, msg: `All habits finished! +${newlyDoneCount * 10 + 50} XP`, xp: newlyDoneCount * 10 + 50 });
      setTimeout(() => setConfettiActive(false), 5000);
      setTimeout(() => setXpToast(null), 3000);
    }
  };

  // Filtered habits
  const filteredHabits = useMemo(() => {
    if (activeCategoryFilter === 'all') return habits;
    return habits.filter(h => h.category === activeCategoryFilter);
  }, [habits, activeCategoryFilter]);

  // Current time representation (HH:MM)
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

  // Next up pending habit for today
  const nextUpHabitId = useMemo(() => {
    const todayLogs = logs[todayKey] || {};
    const pendingHabits = habits.filter(h => !todayLogs[h.id]);
    if (pendingHabits.length === 0) return null;
    
    const sorted = [...pendingHabits].sort((a, b) => (a.time || "12:00").localeCompare(b.time || "12:00"));
    const upcoming = sorted.find(h => (h.time || "00:00") >= currentTimeStr);
    return (upcoming || sorted[0])?.id || null;
  }, [habits, logs, todayKey, currentTimeStr]);

  // Today Deck Habits (with status, category, period filter & chronological sorting)
  const todayDeckHabits = useMemo(() => {
    let list = [...habits];

    const todayLogs = logs[todayKey] || {};
    if (todayFilter === 'pending') {
      list = list.filter(h => !todayLogs[h.id]);
    } else if (todayFilter === 'done') {
      list = list.filter(h => !!todayLogs[h.id]);
    }

    if (activeCategoryFilter !== 'all') {
      list = list.filter(h => h.category === activeCategoryFilter);
    }

    if (activePeriodFilter === 'next_up') {
      if (nextUpHabitId) {
        list = list.filter(h => h.id === nextUpHabitId);
      }
    } else if (activePeriodFilter !== 'all') {
      list = list.filter(h => (h.period || getPeriodFromTime(h.time)) === activePeriodFilter);
    }

    if (sortByScheduleTime) {
      list.sort((a, b) => (a.time || "12:00").localeCompare(b.time || "12:00"));
    }

    return list;
  }, [habits, logs, todayKey, todayFilter, activeCategoryFilter, activePeriodFilter, nextUpHabitId, sortByScheduleTime]);

  // Fast inline time reschedule
  const updateHabitTimeFast = (habitId: string, newTime: string) => {
    const period = getPeriodFromTime(newTime);
    const updated = habits.map(h => h.id === habitId ? { ...h, time: newTime, period } : h);
    saveHabits(updated);
    setQuickTimePickerId(null);
    playChime(784);
    setXpToast({ show: true, msg: `Rescheduled to ${formatTime12(newTime)}`, xp: 0 });
    setTimeout(() => setXpToast(null), 2000);
  };

  // Complete specific period block (e.g. morning, afternoon) in 1 tap
  const completePeriodBlock = (targetPeriod: HabitPeriod) => {
    const dayLogs = { ...(logs[todayKey] || {}) };
    let count = 0;
    habits.forEach(h => {
      const period = h.period || getPeriodFromTime(h.time);
      if (period === targetPeriod && !dayLogs[h.id]) {
        dayLogs[h.id] = true;
        count++;
      }
    });

    if (count > 0) {
      const newLogs = { ...logs, [todayKey]: dayLogs };
      saveLogs(newLogs);
      playVictoryFanfare();
      setConfettiActive(true);
      awardXp(count * 10, `${targetPeriod.toUpperCase()} habit block completed!`);
      setXpToast({ show: true, msg: `${count} ${targetPeriod} habit${count > 1 ? 's' : ''} completed! +${count * 10} XP`, xp: count * 10 });
      setTimeout(() => setConfettiActive(false), 5000);
      setTimeout(() => setXpToast(null), 3000);
    }
  };

  // Today's Routine calculations
  const todayStats = useMemo(() => {
    const todayLogs = logs[todayKey] || {};
    const total = habits.length;
    const completed = habits.filter(h => !!todayLogs[h.id]).length;
    const pending = Math.max(0, total - completed);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, percentage };
  }, [habits, logs, todayKey]);

  // Monthly stats per habit
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
        progress,
        streak: habitStreaks[h.id] || { current: 0, best: 0 }
      };
    });
  }, [habits, logs, daysInMonth, selectedYear, monthIndex, habitStreaks]);

  // Totals for Month
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

  // Graphical: Category Distribution Data for Multi-Slice Pie/Donut Chart
  const categoryChartData = useMemo(() => {
    const categories: Record<HabitCategory, { label: string; count: number; completedCount: number; color: string }> = {
      academic: { label: "Academic", count: 0, completedCount: 0, color: "#6366f1" }, // indigo-500
      wellness: { label: "Wellness", count: 0, completedCount: 0, color: "#10b981" }, // emerald-500
      focus: { label: "Focus & Mind", count: 0, completedCount: 0, color: "#f59e0b" } // amber-500
    };

    habitCompletionStats.forEach(h => {
      const cat = h.category || 'academic';
      categories[cat].count++;
      categories[cat].completedCount += h.actual;
    });

    const totalCompletions = Object.values(categories).reduce((acc, c) => acc + c.completedCount, 0);
    const slices = Object.entries(categories).map(([key, data]) => {
      const percent = totalCompletions > 0 ? (data.completedCount / totalCompletions) * 100 : (data.count / (habits.length || 1)) * 100;
      return {
        category: key as HabitCategory,
        ...data,
        percent: Math.round(percent * 10) / 10
      };
    });

    return { slices, totalCompletions };
  }, [habitCompletionStats, habits.length]);

  // Graphical: Day-of-Week (Mon-Sun) Consistency Distribution
  const weekdayStats = useMemo(() => {
    const daysArr = [
      { name: "Sun", short: "S", totalOccurrences: 0, completedCount: 0 },
      { name: "Mon", short: "M", totalOccurrences: 0, completedCount: 0 },
      { name: "Tue", short: "T", totalOccurrences: 0, completedCount: 0 },
      { name: "Wed", short: "W", totalOccurrences: 0, completedCount: 0 },
      { name: "Thu", short: "T", totalOccurrences: 0, completedCount: 0 },
      { name: "Fri", short: "F", totalOccurrences: 0, completedCount: 0 },
      { name: "Sat", short: "S", totalOccurrences: 0, completedCount: 0 }
    ];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(selectedYear, monthIndex, d);
      const dayOfWeek = dayDate.getDay();
      daysArr[dayOfWeek].totalOccurrences++;

      const dateKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayLogs = logs[dateKey] || {};
      const completedOnDay = Object.values(dayLogs).filter(Boolean).length;
      daysArr[dayOfWeek].completedCount += completedOnDay;
    }

    const reordered = [daysArr[1], daysArr[2], daysArr[3], daysArr[4], daysArr[5], daysArr[6], daysArr[0]]; // Mon-Sun

    const totalHabits = Math.max(1, habits.length);
    let peakDay = reordered[0];
    let peakRate = 0;

    const formatted = reordered.map(item => {
      const maxPossible = item.totalOccurrences * totalHabits;
      const rate = maxPossible > 0 ? Math.round((item.completedCount / maxPossible) * 100) : 0;
      if (rate > peakRate) {
        peakRate = rate;
        peakDay = item;
      }
      return {
        ...item,
        rate
      };
    });

    return { days: formatted, peakDay: peakDay.name, peakRate };
  }, [selectedYear, monthIndex, daysInMonth, logs, habits.length]);

  // Graphical: Daily Progress Bar Data (31 Days)
  const dailyProgress = useMemo(() => {
    const data: { day: number; completedCount: number; ratio: number; isToday: boolean }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayLogs = logs[dateKey] || {};
      const completedCount = Object.values(dayLogs).filter(Boolean).length;
      const maxPossible = habits.length;
      const ratio = maxPossible > 0 ? Math.min(100, Math.round((completedCount / maxPossible) * 100)) : 0;
      const isToday = selectedYear === realYear && monthIndex === realMonthIndex && d === realDay;
      data.push({ day: d, completedCount, ratio, isToday });
    }
    return data;
  }, [logs, daysInMonth, selectedYear, monthIndex, habits.length, realYear, realMonthIndex, realDay]);

  // Top Ranked Habits
  const topHabits = useMemo(() => {
    return [...habitCompletionStats]
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 5);
  }, [habitCompletionStats]);

  // Add / Edit habit handlers
  const openAddModal = () => {
    setEditingHabit(null);
    setFormName("");
    setFormEmoji("⚡");
    setFormGoal(22);
    setFormCategory('academic');
    setFormTime("07:00");
    setFormPeriod('morning');
    setShowAddModal(true);
  };

  const openEditModal = (h: Habit) => {
    setEditingHabit(h);
    setFormName(h.name);
    setFormEmoji(h.emoji);
    setFormGoal(h.goalDays);
    setFormCategory(h.category || 'academic');
    const timeVal = h.time || "07:00";
    setFormTime(timeVal);
    setFormPeriod(h.period || getPeriodFromTime(timeVal));
    setShowAddModal(true);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    const finalPeriod = formPeriod || getPeriodFromTime(formTime);

    if (editingHabit) {
      const updated = habits.map(h => 
        h.id === editingHabit.id 
          ? { 
              ...h, 
              name: formName.trim(), 
              emoji: formEmoji || "⚡", 
              goalDays: formGoal, 
              category: formCategory,
              time: formTime,
              period: finalPeriod
            } 
          : h
      );
      saveHabits(updated);
      setXpToast({ show: true, msg: `Habit "${formName.trim()}" updated!`, xp: 0 });
      setTimeout(() => setXpToast(null), 2000);
    } else {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: formName.trim(),
        emoji: formEmoji || "⚡",
        goalDays: Math.min(daysInMonth, Math.max(1, formGoal)),
        category: formCategory,
        time: formTime,
        period: finalPeriod
      };
      saveHabits([...habits, newHabit]);
      playChime(659.25);
      awardXp(15, "Created new habit routine!");
      setXpToast({ show: true, msg: `Habit added! Scheduled for ${formatTime12(formTime)}`, xp: 15 });
      setTimeout(() => setXpToast(null), 2500);
    }

    setShowAddModal(false);
    setEditingHabit(null);
  };

  const handleDeleteHabit = (id: string) => {
    if (confirm("Remove this habit from tracking?")) {
      saveHabits(habits.filter(h => h.id !== id));
      setXpToast({ show: true, msg: "Habit removed", xp: 0 });
      setTimeout(() => setXpToast(null), 1500);
    }
  };

  const importTemplate = (template: typeof ROUTINE_TEMPLATES[0]) => {
    const newItems: Habit[] = template.habits.map((item, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: item.name,
      emoji: item.emoji,
      goalDays: item.goalDays,
      category: item.category as HabitCategory,
      time: item.time || "07:00",
      period: item.period || getPeriodFromTime(item.time)
    }));
    saveHabits([...habits, ...newItems]);
    setShowTemplatesModal(false);
    playVictoryFanfare();
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 4000);
  };

  // Discipline rating level
  const disciplineLevel = useMemo(() => {
    const rate = totals.progressPercent;
    if (rate >= 90) return { label: "Master of Discipline", color: "text-emerald-400", badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400", angle: 180 };
    if (rate >= 75) return { label: "Unstoppable Momentum", color: "text-indigo-400", badge: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400", angle: 140 };
    if (rate >= 50) return { label: "Steady Consistency", color: "text-blue-400", badge: "bg-blue-500/10 border-blue-500/30 text-blue-400", angle: 95 };
    return { label: "Building Focus Habit", color: "text-amber-400", badge: "bg-amber-500/10 border-amber-500/30 text-amber-400", angle: 45 };
  }, [totals.progressPercent]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-3 xs:p-4 sm:p-6 pb-28 md:pb-24 relative overflow-x-hidden selection:bg-indigo-500/30">
      <Confetti active={confettiActive} />

      {/* Floating XP Toast */}
      <AnimatePresence>
        {xpToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 bg-indigo-600/90 backdrop-blur-md border border-indigo-400/40 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 font-extrabold text-xs"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Zap className="w-4 h-4 fill-amber-300" />
            </div>
            <div>
              <p className="text-[10px] text-indigo-200 uppercase tracking-wider font-bold">XP Awarded</p>
              <p className="text-white text-xs">{xpToast.msg}</p>
            </div>
            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg text-xs font-black shadow">
              +{xpToast.xp} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 sm:p-3 rounded-2xl shadow-lg shadow-indigo-600/20 border border-indigo-400/30 shrink-0">
            <CheckSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl xs:text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                HABIT COMMAND CENTER
              </h1>
              <span className="text-[10px] uppercase font-black tracking-wider bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded-full">
                Gamified 2.0
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
              Build relentless atomic routines, track graphical consistency, and earn academic XP.
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Routine Templates Button */}
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/30 text-indigo-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Routine Kits
          </button>

          {/* Add Habit Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Habit
          </button>

          <Link 
            href="/dashboard" 
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 transition-all"
          >
            <Home className="w-3.5 h-3.5" /> Dashboard
          </Link>
        </div>
      </header>

      {/* TOP SECTION: Today's Routine Hero Deck */}
      <section className="max-w-[1600px] mx-auto mb-6">
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900 to-indigo-950/40 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-5 border-b border-slate-800/80 pb-5">
            <div className="flex items-center gap-4">
              {/* Circular Progress Indicator for Today */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-500 transition-all duration-700 ease-out"
                    strokeDasharray={`${todayStats.percentage}, 100`}
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-sm sm:text-base font-black text-white">{todayStats.percentage}%</span>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Today</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Today&apos;s Focus &bull; {months[realMonthIndex]} {realDay}, {realYear}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  {todayStats.percentage === 100 ? (
                    <span className="text-emerald-400 flex items-center gap-2">
                      <Award className="w-6 h-6" /> Perfect Routine Complete!
                    </span>
                  ) : (
                    <span>
                      {todayStats.completed} of {todayStats.total} Habits Done
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {todayStats.pending === 0 
                    ? "Sensational discipline! You unlocked full bonus XP today." 
                    : `${todayStats.pending} remaining routine item${todayStats.pending > 1 ? 's' : ''} to complete your day.`}
                </p>
              </div>
            </div>

            {/* Quick Actions & Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filters */}
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs font-bold">
                <button
                  onClick={() => setTodayFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${todayFilter === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  All ({habits.length})
                </button>
                <button
                  onClick={() => setTodayFilter('pending')}
                  className={`px-3 py-1 rounded-lg transition-all ${todayFilter === 'pending' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Pending ({todayStats.pending})
                </button>
                <button
                  onClick={() => setTodayFilter('done')}
                  className={`px-3 py-1 rounded-lg transition-all ${todayFilter === 'done' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Done ({todayStats.completed})
                </button>
              </div>

              {/* Sort by Schedule Time Toggle */}
              <button
                onClick={() => setSortByScheduleTime(!sortByScheduleTime)}
                title="Toggle Chronological Schedule Sorting"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  sortByScheduleTime 
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-sm' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{sortByScheduleTime ? "Timeline Order" : "Default Order"}</span>
              </button>

              {/* Quick Batch Actions */}
              {activePeriodFilter !== 'all' && activePeriodFilter !== 'next_up' && (
                <button
                  onClick={() => completePeriodBlock(activePeriodFilter as HabitPeriod)}
                  className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Fast Complete {activePeriodFilter.toUpperCase()}
                </button>
              )}

              {todayStats.pending > 0 && (
                <button
                  onClick={completeAllToday}
                  className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  <Check className="w-3.5 h-3.5" /> Check All Remaining
                </button>
              )}
            </div>
          </div>

          {/* SECONDARY ROW: Fast Time Schedule Period Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 mb-4 pt-1 hide-scrollbar">
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-850 text-xs font-bold">
              <button
                onClick={() => setActivePeriodFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  activePeriodFilter === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Full Day Schedule
              </button>
              <button
                onClick={() => setActivePeriodFilter('morning')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  activePeriodFilter === 'morning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🌅</span> Morning (4am - 12pm)
              </button>
              <button
                onClick={() => setActivePeriodFilter('afternoon')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  activePeriodFilter === 'afternoon' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>☀️</span> Afternoon (12pm - 5pm)
              </button>
              <button
                onClick={() => setActivePeriodFilter('evening')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  activePeriodFilter === 'evening' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🌆</span> Evening (5pm - 9pm)
              </button>
              <button
                onClick={() => setActivePeriodFilter('night')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  activePeriodFilter === 'night' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🌙</span> Night (9pm+)
              </button>
              {nextUpHabitId && (
                <button
                  onClick={() => setActivePeriodFilter(activePeriodFilter === 'next_up' ? 'all' : 'next_up')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    activePeriodFilter === 'next_up' 
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 animate-pulse'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" /> Up Next Now
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-850 shrink-0">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Current Time: <strong className="text-white font-black">{formatTime12(currentTimeStr)}</strong></span>
            </div>
          </div>

          {/* Quick-Toggle Habits Grid for Today */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {todayDeckHabits.map(h => {
              const isChecked = !!logs[todayKey]?.[h.id];
              const streak = habitStreaks[h.id] || { current: 0, best: 0 };
              const period = h.period || getPeriodFromTime(h.time);
              const periodInfo = getPeriodBadge(period);
              const isNextUp = h.id === nextUpHabitId && !isChecked;
              const isTimePickerOpen = quickTimePickerId === h.id;

              const catColor = 
                h.category === 'academic' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                h.category === 'wellness' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20';

              return (
                <motion.div
                  key={h.id}
                  whileHover={{ y: -2 }}
                  className={`relative p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isNextUp 
                      ? 'bg-gradient-to-b from-indigo-950/70 to-slate-950 border-amber-500/60 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/10'
                      : isChecked 
                      ? 'bg-indigo-950/30 border-indigo-500/40 shadow-sm shadow-indigo-500/10' 
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Top Header inside Card */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl p-1 rounded-xl bg-slate-900 border border-slate-800">{h.emoji}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${catColor}`}>
                          {h.category || 'academic'}
                        </span>
                      </div>

                      {/* Right Action Icons: Edit & Streak */}
                      <div className="flex items-center gap-1.5">
                        {streak.current > 0 && (
                          <div className="flex items-center gap-0.5 text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
                            <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{streak.current}d</span>
                          </div>
                        )}
                        <button
                          onClick={() => openEditModal(h)}
                          title="Edit Habit (Name, Goal, Time Slot)"
                          className="p-1 rounded-lg bg-slate-900 hover:bg-indigo-600 text-slate-400 hover:text-white border border-slate-800 hover:border-indigo-500 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Next Up Tag */}
                    {isNextUp && (
                      <div className="inline-flex items-center gap-1 text-[9px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-md mb-1.5 animate-pulse">
                        <Zap className="w-2.5 h-2.5 fill-amber-300" />
                        <span>UP NEXT</span>
                      </div>
                    )}

                    <p className={`text-xs font-bold truncate mb-1.5 ${isChecked ? 'text-slate-300 line-through opacity-80' : 'text-slate-100'}`}>
                      {h.name}
                    </p>

                    {/* Time Slot Chip (Click to fast reschedule inline) */}
                    <div className="relative mb-3">
                      <button
                        type="button"
                        onClick={() => setQuickTimePickerId(isTimePickerOpen ? null : h.id)}
                        className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-lg border transition-all ${
                          isTimePickerOpen 
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                            : `${periodInfo.color} hover:brightness-125`
                        }`}
                        title="Click for Fast Inline Reschedule"
                      >
                        <Clock className="w-3 h-3" />
                        <span>{formatTime12(h.time)}</span>
                        <span className="opacity-70">&bull; {periodInfo.icon}</span>
                      </button>

                      {/* Fast Inline Time Selector Popover */}
                      {isTimePickerOpen && (
                        <div className="absolute left-0 top-7 z-30 w-52 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl space-y-2 text-slate-100 animate-in fade-in zoom-in-95">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Fast Reschedule
                            </span>
                            <button
                              onClick={() => setQuickTimePickerId(null)}
                              className="text-slate-500 hover:text-slate-200 text-xs font-bold"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            {TIME_PRESETS.map((preset) => (
                              <button
                                key={preset.value}
                                onClick={() => updateHabitTimeFast(h.id, preset.value)}
                                className={`text-[10px] font-black py-1 px-1.5 rounded-lg border text-left transition-all ${
                                  h.time === preset.value
                                    ? 'bg-indigo-600 text-white border-indigo-400'
                                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                                }`}
                              >
                                {preset.icon} {preset.label}
                              </button>
                            ))}
                          </div>

                          {/* Custom time input */}
                          <div className="pt-1 border-t border-slate-800">
                            <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Custom Time</label>
                            <input
                              type="time"
                              value={h.time || "07:00"}
                              onChange={(e) => updateHabitTimeFast(h.id, e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs text-white outline-none cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Completion Toggle Button */}
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => toggleDateHabit(h.id, todayKey)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                      isChecked 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30' 
                        : isNextUp
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isChecked ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Done Today
                      </>
                    ) : isNextUp ? (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" /> Complete Next Up
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full border border-slate-600" /> Mark Complete
                      </>
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
            {todayDeckHabits.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-2xl border border-slate-850">
                No habits match the active filter criteria. Select another schedule period or category.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* GRAPHICAL ANALYTICS SUITE: Dynamic Visual Cards */}
      <section className="max-w-[1600px] mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-200">
              Visual Consistency Analytics
            </h2>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
              {selectedMonth} {selectedYear}
            </span>
          </div>

          {/* View Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setChartViewMode('donut')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${chartViewMode === 'donut' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <PieChart className="w-3.5 h-3.5" /> Category Pie & Breakdown
            </button>
            <button
              onClick={() => setChartViewMode('weekday')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${chartViewMode === 'weekday' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Day-of-Week Rhythm
            </button>
            <button
              onClick={() => setChartViewMode('gauge')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${chartViewMode === 'gauge' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Compass className="w-3.5 h-3.5" /> Discipline Gauge
            </button>
            <button
              onClick={() => setChartViewMode('heatmap')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${chartViewMode === 'heatmap' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Layers className="w-3.5 h-3.5" /> Activity Heatmap
            </button>
          </div>
        </div>

        {/* Graphical Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Visual Display (Span 8) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            {/* View 1: Multi-Segment Pie & Category Donut */}
            {chartViewMode === 'donut' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                      Category Distribution & Routine Balance
                    </h3>
                    <p className="text-xs text-slate-500">Visual share of completed daily habits grouped by core life pillars.</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-indigo-400"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Academic</span>
                    <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Wellness</span>
                    <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Focus</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Interactive Multi-Slice SVG Pie Chart */}
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                      {/* Background circle */}
                      <circle cx="100" cy="100" r="70" fill="none" stroke="#1e293b" strokeWidth="24" />
                      
                      {/* Slices calculated dynamically */}
                      {(() => {
                        const r = 70;
                        const c = 2 * Math.PI * r;
                        let accumulated = 0;
                        return categoryChartData.slices.map((slice) => {
                          const strokeDasharray = `${(slice.percent / 100) * c} ${c}`;
                          const strokeDashoffset = -((accumulated / 100) * c);
                          accumulated += slice.percent;
                          return (
                            <circle
                              key={slice.category}
                              cx="100"
                              cy="100"
                              r={r}
                              fill="none"
                              stroke={slice.color}
                              strokeWidth="24"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              className="transition-all duration-700 ease-out hover:opacity-90 cursor-pointer"
                            />
                          );
                        });
                      })()}
                    </svg>

                    {/* Centered Donut Summary */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black text-white">{totals.progressPercent}%</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Total Month</span>
                    </div>
                  </div>

                  {/* Slices Breakdown Cards */}
                  <div className="space-y-3">
                    {categoryChartData.slices.map(slice => (
                      <div 
                        key={slice.category}
                        className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-850 hover:border-slate-700 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3.5 h-3.5 rounded-lg flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: slice.color }}
                          />
                          <div>
                            <p className="text-xs font-black text-slate-200">{slice.label}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{slice.count} Habits Defined</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-white">{slice.percent}%</span>
                          <p className="text-[10px] font-extrabold text-slate-400">{slice.completedCount} checks</p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-bold border-t border-slate-800">
                      <span>Total Executions:</span>
                      <span className="text-white font-extrabold">{totals.actual} Checks</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View 2: Day-of-Week Rhythm Bar Chart */}
            {chartViewMode === 'weekday' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                      Day-of-Week Consistency Rhythm
                    </h3>
                    <p className="text-xs text-slate-500">Discover your weekly energy patterns and peak performance days.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-xl text-xs font-bold text-indigo-300">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Peak Day: <span className="font-black text-white">{weekdayStats.peakDay} ({weekdayStats.peakRate}%)</span>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-3 h-48 pt-6 items-end">
                  {weekdayStats.days.map((item) => (
                    <div key={item.name} className="flex flex-col items-center h-full justify-end group">
                      <span className="text-[10px] font-black text-slate-400 mb-1 opacity-80 group-hover:opacity-100 group-hover:text-indigo-400 transition-all">
                        {item.rate}%
                      </span>
                      <div className="w-full bg-slate-950 rounded-t-xl h-full flex items-end p-1 border border-slate-850">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(6, item.rate)}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className={`w-full rounded-lg transition-all ${
                            item.name === weekdayStats.peakDay
                              ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-400 shadow-lg shadow-indigo-600/30'
                              : 'bg-gradient-to-t from-slate-800 to-slate-700 group-hover:from-indigo-600 group-hover:to-indigo-500'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-300 mt-2">{item.name}</span>
                      <span className="text-[9px] text-slate-500 font-semibold">{item.completedCount} done</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View 3: Speedometer Discipline Gauge */}
            {chartViewMode === 'gauge' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                      Discipline Index & Speedometer
                    </h3>
                    <p className="text-xs text-slate-500">Atomic habit momentum score benchmarked against target milestones.</p>
                  </div>
                  <span className={`text-xs font-black uppercase px-3 py-1 rounded-xl border ${disciplineLevel.badge}`}>
                    {disciplineLevel.label}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="relative w-64 h-32 flex items-center justify-center overflow-hidden">
                    <svg className="w-64 h-64" viewBox="0 0 200 200">
                      {/* Background arc 180 deg */}
                      <path
                        d="M 25 100 A 75 75 0 0 1 175 100"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="18"
                        strokeLinecap="round"
                      />
                      {/* Gradient Value Arc */}
                      <path
                        d="M 25 100 A 75 75 0 0 1 175 100"
                        fill="none"
                        stroke="url(#gauge-gradient)"
                        strokeWidth="18"
                        strokeLinecap="round"
                        strokeDasharray={`${(totals.progressPercent / 100) * 235.62} 235.62`}
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="50%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute bottom-0 flex flex-col items-center text-center">
                      <span className="text-4xl font-black text-white tracking-tight">{totals.progressPercent}%</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consistency Rating</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-6 text-center border-t border-slate-800 pt-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Target Goal</p>
                      <p className="text-base font-extrabold text-slate-200">{totals.goal} Days</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Delivered</p>
                      <p className="text-base font-extrabold text-emerald-400">{totals.actual} Days</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Remaining</p>
                      <p className="text-base font-extrabold text-slate-400">{totals.left} Days</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View 4: GitHub-Style Activity Heatmap */}
            {chartViewMode === 'heatmap' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                      GitHub-Style Monthly Activity Matrix
                    </h3>
                    <p className="text-xs text-slate-500">Day-by-day habit completion intensity across {selectedMonth}.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <span>Less</span>
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-950 border border-slate-800" />
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-950 border border-indigo-800" />
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-700" />
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <span>100%</span>
                  </div>
                </div>

                <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-11 gap-2">
                  {dailyProgress.map((day) => {
                    // Intensity color based on % of habits completed
                    let bg = "bg-slate-950 border-slate-850 text-slate-600";
                    if (day.ratio === 100) bg = "bg-emerald-500 border-emerald-400 text-white font-black shadow-md shadow-emerald-500/20";
                    else if (day.ratio >= 75) bg = "bg-indigo-500 border-indigo-400 text-white";
                    else if (day.ratio >= 40) bg = "bg-indigo-700 border-indigo-600 text-indigo-100";
                    else if (day.ratio > 0) bg = "bg-indigo-950 border-indigo-800 text-indigo-300";

                    return (
                      <div
                        key={day.day}
                        className={`aspect-square p-2 rounded-xl border flex flex-col items-center justify-between transition-all hover:scale-110 cursor-pointer ${bg} ${
                          day.isToday ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''
                        }`}
                        title={`Day ${day.day}: ${day.completedCount}/${habits.length} habits done (${day.ratio}%)`}
                      >
                        <span className="text-[10px] font-bold">{day.day}</span>
                        <span className="text-[9px] font-black">{day.completedCount > 0 ? `${day.completedCount}✓` : '·'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Top Consistency Rankings (Span 4) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                    Leaderboard Habits
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                  Top Consistent
                </span>
              </div>

              <div className="space-y-3">
                {topHabits.map((h, i) => (
                  <div 
                    key={h.id}
                    className="p-3 bg-slate-950/50 border border-slate-850 rounded-2xl flex items-center justify-between hover:border-slate-750 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
                        i === 0 ? 'bg-amber-400 text-slate-950 shadow-sm' :
                        i === 1 ? 'bg-slate-300 text-slate-950' :
                        i === 2 ? 'bg-amber-700 text-white' :
                        'bg-slate-850 text-slate-400'
                      }`}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5 truncate max-w-[140px]">
                          <span>{h.emoji}</span> {h.name}
                        </p>
                        <span className="text-[9px] font-black text-slate-500 uppercase">
                          {h.category} &bull; {h.streak.current}d streak
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-indigo-400">{h.actual}/{h.goalDays}</span>
                      <p className="text-[9px] font-bold text-slate-400">{h.progress}%</p>
                    </div>
                  </div>
                ))}
                {habits.length === 0 && (
                  <p className="text-slate-500 text-xs italic text-center py-6">No habits tracked yet.</p>
                )}
              </div>
            </div>

            {/* Streak Motivation Quote */}
            <div className="mt-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-black text-indigo-300">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Atomic Habit Law:
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-200/90 font-medium">
                &ldquo;You do not rise to the level of your goals. You fall to the level of your systems.&rdquo; Every check earns XP and rewires neural discipline.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* DAILY PROGRESS HISTOGRAM: Full-Width 31-Day Bar Chart */}
      <section className="max-w-[1600px] mx-auto mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                Daily Completion Histogram ({selectedMonth} {selectedYear})
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
              <span>Goal: 100% complete everyday</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex items-end justify-between gap-1.5 h-36 min-w-[700px] pt-4 px-1">
              {dailyProgress.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center group h-full justify-end">
                  <div className="text-[9px] font-bold text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.completedCount}
                  </div>
                  <div className="w-full bg-slate-950 rounded-t-md h-full flex items-end p-0.5 border border-slate-850">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(4, d.ratio)}%` }}
                      transition={{ duration: 0.5 }}
                      className={`w-full rounded-t-sm transition-all ${
                        d.isToday 
                          ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-md shadow-amber-500/20' 
                          : d.ratio === 100
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          : 'bg-gradient-to-t from-indigo-700 to-indigo-400 group-hover:from-indigo-600 group-hover:to-indigo-300'
                      }`}
                    />
                  </div>
                  <span className={`text-[9px] font-black mt-1.5 ${d.isToday ? 'text-amber-400 font-extrabold' : 'text-slate-500'}`}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MONTHLY CHECKLIST MATRIX & HABIT MANAGEMENT (Grid Layout) */}
      <section className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left: Habit List Management (Span 3) */}
        <div className="xl:col-span-3 space-y-6">
          {/* Calendar Selectors */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Time Range
              </h3>
              <button
                onClick={() => {
                  setSelectedYear(realYear);
                  setSelectedMonth(months[realMonthIndex]);
                }}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline"
              >
                Jump to Current
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer text-slate-200"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer text-slate-200"
                >
                  {months.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Manage Habits List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Tracked Habits ({habits.length})
                </h3>
              </div>
              <button
                onClick={openAddModal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg text-xs transition-all shadow flex items-center gap-1 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {habits.map(h => (
                <div 
                  key={h.id} 
                  className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl hover:border-slate-700 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-base p-1 rounded-lg bg-slate-900 border border-slate-800">{h.emoji}</span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-200 truncate">{h.name}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-semibold flex items-center gap-1 mt-0.5">
                        <span className="text-indigo-400 font-bold">{formatTime12(h.time)}</span>
                        <span>&bull;</span>
                        <span>{h.category}</span>
                        <span>&bull;</span>
                        <span>{h.goalDays}d</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => openEditModal(h)}
                      className="text-slate-500 hover:text-indigo-400 p-1 rounded-md transition-colors"
                      title="Edit Habit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteHabit(h.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: The 31-Day Checkmark Grid Matrix (Span 9) */}
        <div className="xl:col-span-9 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                Monthly Execution Matrix ({selectedMonth})
              </h3>
            </div>

            {/* Category Filter & Mobile View Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex sm:hidden p-1 bg-slate-950 rounded-xl border border-slate-850 w-full">
                <button
                  onClick={() => setMobileView('cards')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mobileView === 'cards' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Today's Cards
                </button>
                <button
                  onClick={() => setMobileView('matrix')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mobileView === 'matrix' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Matrix View
                </button>
              </div>

              <div className="flex overflow-x-auto pb-1 sm:pb-0 hide-scrollbar bg-slate-950 p-1 rounded-xl border border-slate-850 text-xs font-bold shrink-0">
                <button
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${activeCategoryFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  All Categories
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('academic')}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${activeCategoryFilter === 'academic' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Academic
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('wellness')}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${activeCategoryFilter === 'wellness' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Wellness
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('focus')}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${activeCategoryFilter === 'focus' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Focus
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Card View (Today only) */}
          {mobileView === 'cards' && (
            <div className="sm:hidden grid grid-cols-1 gap-3">
              {filteredHabits.map(h => {
                const isChecked = !!logs[todayKey]?.[h.id];
                const period = h.period || getPeriodFromTime(h.time);
                const periodBadge = getPeriodBadge(period);

                return (
                  <div key={h.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between shadow-sm hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden mr-3">
                      <div className={`w-12 h-12 flex shrink-0 items-center justify-center rounded-2xl text-2xl transition-colors ${isChecked ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-800 border border-slate-700'}`}>
                        {h.emoji}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-black text-white truncate">{h.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${periodBadge.color}`}>
                            {periodBadge.icon} {formatTime12(h.time)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{h.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditModal(h)}
                        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                        title="Edit Habit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleDateHabit(h.id, todayKey)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isChecked ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'}`}
                      >
                        <Check className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Matrix Scrollable Table */}
          <div className={`overflow-x-auto ${mobileView === 'cards' ? 'hidden sm:block' : 'block'}`}>
            <div className="min-w-[840px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-2.5 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-52">
                      Habit &amp; Schedule
                    </th>
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dNum = i + 1;
                      const isToday = selectedYear === realYear && monthIndex === realMonthIndex && dNum === realDay;
                      return (
                        <th 
                          key={i} 
                          className={`text-center py-2 text-[9px] font-black w-6 ${
                            isToday ? 'text-amber-400 bg-amber-500/10 rounded-t-lg' : 'text-slate-500'
                          }`}
                        >
                          {dNum}
                        </th>
                      );
                    })}
                    <th className="text-center py-2 px-2 text-[10px] font-black uppercase text-slate-400 w-16">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHabits.map(h => {
                    const stats = habitCompletionStats.find(s => s.id === h.id);
                    const period = h.period || getPeriodFromTime(h.time);
                    const pBadge = getPeriodBadge(period);

                    return (
                      <tr key={h.id} className="border-b border-slate-850/60 hover:bg-slate-950/40 transition-colors group">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-base">{h.emoji}</span>
                              <div className="overflow-hidden">
                                <span className="text-xs font-bold text-slate-200 truncate block max-w-[120px]" title={h.name}>
                                  {h.name}
                                </span>
                                <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border inline-block mt-0.5 ${pBadge.color}`}>
                                  {pBadge.icon} {formatTime12(h.time)}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => openEditModal(h)}
                              className="p-1 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-all opacity-60 group-hover:opacity-100"
                              title="Edit Habit & Schedule"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const dayNum = i + 1;
                          const dateKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                          const isChecked = !!logs[dateKey]?.[h.id];
                          const isToday = selectedYear === realYear && monthIndex === realMonthIndex && dayNum === realDay;

                          return (
                            <td key={i} className={`py-1.5 text-center ${isToday ? 'bg-amber-500/5' : ''}`}>
                              <button
                                onClick={() => toggleDayNum(h.id, dayNum)}
                                className={`w-4 h-4 mx-auto rounded-md border flex items-center justify-center transition-all ${
                                  isChecked
                                    ? "bg-indigo-600 border-indigo-400 text-white scale-110 shadow-sm shadow-indigo-600/30"
                                    : "border-slate-800 hover:border-slate-700 bg-slate-950"
                                }`}
                              >
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                              </button>
                            </td>
                          );
                        })}
                        <td className="py-2 px-2 text-center text-xs font-black text-indigo-400">
                          {stats?.actual || 0}/{h.goalDays}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredHabits.length === 0 && (
                    <tr>
                      <td colSpan={daysInMonth + 2} className="py-10 text-center text-slate-500 text-xs italic">
                        No habits found under &ldquo;{activeCategoryFilter}&rdquo;. Change the category filter or add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </section>

      {/* MODAL: Add / Edit Habit */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto hide-scrollbar">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
                {editingHabit ? <Edit3 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </div>
              <h3 className="text-lg font-black uppercase tracking-wide">
                {editingHabit ? "Edit Habit Routine" : "Create New Habit"}
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Customize schedule, daily slot, and academic targets.
              </p>
            </div>

            <form onSubmit={handleSaveHabit} className="space-y-4">
              {/* Habit Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase block">Habit Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Solve 5 NCERT Math Problems"
                  maxLength={36}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs sm:text-sm font-bold text-white transition-all outline-none"
                />
              </div>

              {/* Emoji Selector with 1-Tap Tray */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Icon</label>
                  <span className="text-xs text-slate-400">Selected: <strong className="text-base">{formEmoji}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormEmoji(emoji)}
                      className={`text-base p-2 rounded-xl transition-all shrink-0 border ${
                        formEmoji === emoji
                          ? 'bg-indigo-600/30 border-indigo-400 shadow-sm scale-110'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAST TIME SCHEDULING SECTION */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-indigo-400 uppercase flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Fast Time Schedule
                  </label>
                  <span className="text-[11px] font-black text-white bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-800">
                    {formatTime12(formTime)}
                  </span>
                </div>

                {/* 1-Tap Fast Presets */}
                <div className="grid grid-cols-3 gap-1.5">
                  {TIME_PRESETS.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        setFormTime(p.value);
                        setFormPeriod(p.period);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 border transition-all ${
                        formTime === p.value 
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Time & Period Input */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Precise Time</label>
                    <input
                      type="time"
                      value={formTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormTime(val);
                        setFormPeriod(getPeriodFromTime(val));
                      }}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs font-bold text-white outline-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Day Period</label>
                    <select
                      value={formPeriod}
                      onChange={(e) => setFormPeriod(e.target.value as HabitPeriod)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs font-bold text-white outline-none cursor-pointer capitalize"
                    >
                      <option value="morning">🌅 Morning (4am - 12pm)</option>
                      <option value="afternoon">☀️ Afternoon (12pm - 5pm)</option>
                      <option value="evening">🌆 Evening (5pm - 9pm)</option>
                      <option value="night">🌙 Night (9pm+)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Goal & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase block">Monthly Goal (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={formGoal}
                    onChange={(e) => setFormGoal(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs font-bold text-center text-white transition-all outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase block">Category</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['academic', 'wellness', 'focus'] as HabitCategory[]).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormCategory(cat)}
                        className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase transition-all border text-center ${
                          formCategory === cat 
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' 
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {cat.slice(0, 4)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 font-extrabold py-2.5 rounded-xl transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 text-xs"
                >
                  {editingHabit ? "Save Changes" : "Create Habit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Routine Starter Kits & Templates */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wide">
                    Curated Routine Kits
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    1-Click import routines built for top academic achievement and mental stamina.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="text-slate-400 hover:text-white p-2 text-sm font-black"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROUTINE_TEMPLATES.map(t => (
                <div 
                  key={t.title}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {t.badge}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">
                      {t.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 mb-3 line-clamp-2">
                      {t.desc}
                    </p>

                    <div className="space-y-1.5 border-t border-slate-850 pt-2.5 mb-4">
                      {t.habits.slice(0, 3).map(h => (
                        <div key={h.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 truncate">
                          <span>{h.emoji}</span>
                          <span className="truncate">{h.name}</span>
                        </div>
                      ))}
                      {t.habits.length > 3 && (
                        <p className="text-[9px] font-bold text-slate-500">+{t.habits.length - 3} more habits</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => importTemplate(t)}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all flex items-center justify-center gap-1 shadow-md shadow-indigo-600/20"
                  >
                    <Plus className="w-3.5 h-3.5" /> Import Kit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
