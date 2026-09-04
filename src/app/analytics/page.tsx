"use client";

import React, { useState, useEffect } from 'react';
import { Home, TrendingUp, Activity, BookOpen, Brain, Zap, Target } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getDecks } from '@/lib/flashcards';
import { getVaultMistakes } from '@/lib/error-vault';
import { getGamificationState, getPlans } from '@/lib/plans';

// ── helpers ──────────────────────────────────────────
const SUBJECT_DEFS = [
  { name: 'Science', color: '#3b82f6', angle: 0, darkLabel: 'text-blue-400', lightLabel: 'text-blue-700' },
  { name: 'Mathematics', color: '#8b5cf6', angle: 90, darkLabel: 'text-purple-400', lightLabel: 'text-purple-700' },
  { name: 'Social Science', color: '#10b981', angle: 180, darkLabel: 'text-emerald-400', lightLabel: 'text-emerald-700' },
  { name: 'English', color: '#f59e0b', angle: 270, darkLabel: 'text-amber-400', lightLabel: 'text-amber-700' },
];

const SHORT_LABELS: Record<string, string> = {
  'Science': 'Sci',
  'Mathematics': 'Math',
  'Social Science': 'SST',
  'English': 'Eng',
};

const LABEL_POSITIONS = [
  'absolute -top-6 left-1/2 -translate-x-1/2',
  'absolute top-1/2 -right-12 -translate-y-1/2',
  'absolute -bottom-6 left-1/2 -translate-x-1/2',
  'absolute top-1/2 -left-12 -translate-y-1/2',
];

function mapSubject(raw: string): string | null {
  const lower = raw.toLowerCase().trim();
  if (['physics', 'chemistry', 'biology', 'science'].some(k => lower.includes(k))) return 'Science';
  if (['math', 'maths', 'mathematics'].some(k => lower.includes(k))) return 'Mathematics';
  if (['social', 'history', 'geography', 'civics', 'economics', 'political'].some(k => lower.includes(k))) return 'Social Science';
  if (['english', 'literature', 'grammar', 'lang'].some(k => lower.includes(k))) return 'English';
  return null;
}

function getDailyActivityLog(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('edutrack_daily_activity') || '{}'); } catch { return {}; }
}
function saveDailyActivityLog(log: Record<string, number>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('edutrack_daily_activity', JSON.stringify(log));
}
function todayKey() { return new Date().toISOString().slice(0, 10); }

// ── component ────────────────────────────────────────
export default function AnalyticsPage() {
  const [subjectMastery, setSubjectMastery] = useState(SUBJECT_DEFS.map(s => ({ ...s, value: 0 })));
  const [heatmapData, setHeatmapData] = useState<number[]>(Array(28).fill(0));
  const [insights, setInsights] = useState<{ icon: 'warn' | 'success'; title: string; desc: string }[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const decks = getDecks();
    const mistakes = getVaultMistakes();
    const gamification = getGamificationState();

    setTotalXP(gamification.totalXP);
    setStreak(gamification.streakCount);

    // ── 1. Compute subject mastery ──────────────────
    const scores: Record<string, { mastered: number; total: number }> = {};
    SUBJECT_DEFS.forEach(s => { scores[s.name] = { mastered: 0, total: 0 }; });

    decks.forEach(deck => {
      const mapped = mapSubject(deck.subject);
      if (!mapped) return;
      deck.cards.forEach(card => {
        scores[mapped].total++;
        if (card.status === 'mastered') scores[mapped].mastered++;
      });
    });

    mistakes.forEach(m => {
      const mapped = mapSubject(m.subject);
      if (!mapped) return;
      scores[mapped].total += 2;
      if (m.status === 'mastered') scores[mapped].mastered += 2;
    });

    const baseFromXP = Math.min(60, Math.round(gamification.totalXP / 50));
    const computed = SUBJECT_DEFS.map(s => {
      const sc = scores[s.name];
      const value = sc.total > 0
        ? Math.round((sc.mastered / sc.total) * 100)
        : baseFromXP;
      return { ...s, value: Math.max(0, Math.min(100, value)) };
    });
    setSubjectMastery(computed);

    // ── 2. Build 28-day heatmap ─────────────────────
    const log = getDailyActivityLog();
    const today = todayKey();
    log[today] = Math.min(4, (log[today] || 0) + 1);

    const plans = getPlans();
    plans.forEach(plan => {
      plan.schedule.forEach(day => {
        if (day.completed && day.date) {
          const key = day.date.slice(0, 10);
          log[key] = Math.min(4, (log[key] || 0) + 1);
        }
      });
    });
    saveDailyActivityLog(log);

    const heatmap: number[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      heatmap.push(log[key] || 0);
    }
    setHeatmapData(heatmap);

    // ── 3. Dynamic AI insights ──────────────────────
    const sorted = [...computed].sort((a, b) => a.value - b.value);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];
    const newInsights: typeof insights = [];

    if (weakest.value < 70) {
      newInsights.push({
        icon: 'warn',
        title: `Focus on ${weakest.name}`,
        desc: `Your mastery in ${weakest.name} is at ${weakest.value}%. Try reviewing the weakest chapters and practicing flashcards to improve your score.`,
      });
    } else {
      newInsights.push({
        icon: 'success',
        title: 'All Subjects Above 70%!',
        desc: 'Great work! All your subjects are above 70% mastery. Keep practising with Quiz Duels and Exam Papers to maintain your edge.',
      });
    }

    if (strongest.value >= 70) {
      newInsights.push({
        icon: 'success',
        title: `${strongest.name} Streak Achieved!`,
        desc: `Excellent work maintaining ${strongest.value}% mastery in ${strongest.name}. You are ready for advanced Quiz Duels and HOTS-level exam papers.`,
      });
    }

    if (gamification.streakCount >= 3) {
      newInsights.push({
        icon: 'success',
        title: `${gamification.streakCount}-Day Study Streak 🔥`,
        desc: `You've studied ${gamification.streakCount} days in a row! Consistency is the key to board exam success.`,
      });
    }

    setInsights(newInsights.slice(0, 2));
  }, []);

  const getIntensityColor = (val: number) => {
    switch(val) {
      case 0: return 'bg-slate-50 dark:bg-slate-800';
      case 1: return 'bg-indigo-900/40';
      case 2: return 'bg-indigo-700/60';
      case 3: return 'bg-indigo-500';
      case 4: return 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]';
      default: return 'bg-slate-50 dark:bg-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] bg-[#eef1f9] text-slate-700 dark:text-slate-200 font-sans p-6 pb-20">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/20 p-3 rounded-2xl border border-indigo-500/30">
            <Activity className="w-8 h-8 dark:text-indigo-400 text-indigo-700" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Mastery Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">AI-driven analytics of your learning journey.</p>
          </div>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-slate-200 dark:border-slate-700 shadow-lg">
          <Home className="w-4 h-4" /> Back
        </Link>
      </header>

      {/* Stats Banner */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total XP', val: totalXP.toLocaleString(), icon: <Zap className="w-4 h-4 text-amber-400" /> },
          { label: 'Study Streak', val: `${streak} day${streak !== 1 ? 's' : ''}`, icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
          { label: 'Flashcard Decks', val: String((() => { try { return getDecks().length; } catch { return 0; } })()), icon: <BookOpen className="w-4 h-4 text-blue-400" /> },
          { label: 'Avg Mastery', val: `${Math.round(subjectMastery.reduce((a, s) => a + s.value, 0) / subjectMastery.length)}%`, icon: <Target className="w-4 h-4 text-purple-400" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-md">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">{stat.icon}</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Chart (Mastery) */}
        <div className="bg-white dark:bg-slate-900 bg-slate-100 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white w-full flex items-center gap-2 mb-8">
            <Target className="w-5 h-5 dark:text-indigo-400 text-indigo-700" /> Subject Mastery
          </h2>
          
          <div className="relative w-48 h-48 mb-4">
            <svg viewBox="-100 -100 200 200" className="w-full h-full overflow-visible">
              {[20, 40, 60, 80, 100].map(r => (
                <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="var(--border-grid, #1e293b)" strokeWidth="1" strokeDasharray="4 4" />
              ))}
              <line x1="0" y1="-100" x2="0" y2="100" stroke="var(--border-grid, #1e293b)" strokeWidth="1" />
              <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-grid, #1e293b)" strokeWidth="1" />
              
              <motion.polygon
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ duration: 1, type: "spring" }}
                points={subjectMastery.map(s => {
                  const rad = (s.angle - 90) * (Math.PI / 180);
                  return `${Math.cos(rad) * s.value},${Math.sin(rad) * s.value}`;
                }).join(' ')}
                fill="url(#radarGradient)"
                stroke="#6366f1"
                strokeWidth="2"
              />
              
              <defs>
                <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {subjectMastery.map(s => {
                const rad = (s.angle - 90) * (Math.PI / 180);
                const x = Math.cos(rad) * s.value;
                const y = Math.sin(rad) * s.value;
                return (
                  <motion.circle 
                    key={s.name}
                    initial={{ r: 0 }}
                    animate={{ r: 4 }}
                    transition={{ delay: 0.5 }}
                    cx={x} cy={y} fill={s.color} 
                    className="shadow-[0_0_10px_rgba(255,255,255,1)]"
                  />
                );
              })}
            </svg>
            
            {subjectMastery.map((s, i) => (
              <span key={s.name} className={`${LABEL_POSITIONS[i]} text-xs font-bold dark:${SUBJECT_DEFS[i].darkLabel} ${SUBJECT_DEFS[i].lightLabel}`}>
                {SHORT_LABELS[s.name] || s.name} ({s.value}%)
              </span>
            ))}
          </div>
        </div>

        {/* Heatmap & AI Insights */}
        <div className="lg:col-span-2 grid grid-rows-2 gap-6">
          
          {/* Heatmap */}
          <div className="bg-white dark:bg-slate-900 bg-slate-100 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 dark:text-emerald-400 text-emerald-700" /> 28-Day Study Streak
            </h2>
            <div className="grid grid-cols-7 gap-2 mx-auto sm:mx-0 w-full">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-slate-500 mb-1">{d}</div>
              ))}
              {heatmapData.map((val, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`aspect-square rounded-md ${getIntensityColor(val)}`}
                  title={`${val} hours studied`}
                />
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 dark:text-indigo-400 text-indigo-700" /> AI Recommendations
            </h2>
            <div className="space-y-4 relative z-10">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900/50 bg-slate-200/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-200/70 dark:border-slate-700/50 flex gap-3">
                  <div className={`${insight.icon === 'warn' ? 'bg-amber-500/20' : 'bg-emerald-500/20'} p-2 rounded-xl h-fit`}>
                    {insight.icon === 'warn'
                      ? <Zap className="w-4 h-4 dark:text-amber-400 text-amber-700" />
                      : <BookOpen className="w-4 h-4 dark:text-emerald-400 text-emerald-700" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">{insight.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{insight.desc}</p>
                  </div>
                </div>
              ))}
              {insights.length === 0 && (
                <div className="bg-white dark:bg-slate-900/50 bg-slate-200/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex gap-3">
                  <div className="bg-indigo-500/20 p-2 rounded-xl h-fit">
                    <Brain className="w-4 h-4 dark:text-indigo-400 text-indigo-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Start Your Journey!</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Complete some flashcards, quizzes, or exams and your personalised AI insights will appear here.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}