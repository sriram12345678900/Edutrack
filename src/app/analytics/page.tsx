"use client";

import React from 'react';
import { Home, TrendingUp, Activity, BookOpen, Brain, Zap, Target } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const subjectMastery = [
    { name: 'Physics', value: 85, color: '#3b82f6', angle: 0 },
    { name: 'Chemistry', value: 65, color: '#8b5cf6', angle: 90 },
    { name: 'Maths', value: 92, color: '#10b981', angle: 180 },
    { name: 'Biology', value: 45, color: '#f59e0b', angle: 270 }
  ];

  // 7 days x 4 weeks
  const heatmapData = Array.from({ length: 28 }, () => Math.floor(Math.random() * 5));

  const getIntensityColor = (val: number) => {
    switch(val) {
      case 0: return 'bg-slate-800';
      case 1: return 'bg-indigo-900/40';
      case 2: return 'bg-indigo-700/60';
      case 3: return 'bg-indigo-500';
      case 4: return 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]';
      default: return 'bg-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans p-6 pb-20">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/20 p-3 rounded-2xl border border-indigo-500/30">
            <Activity className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Mastery Dashboard</h1>
            <p className="text-slate-400 text-sm font-medium">AI-driven analytics of your learning journey.</p>
          </div>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-slate-700 shadow-lg">
          <Home className="w-4 h-4" /> Back
        </Link>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Chart (Mastery) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-lg font-bold text-white w-full flex items-center gap-2 mb-8">
            <Target className="w-5 h-5 text-indigo-400" /> Subject Mastery
          </h2>
          
          <div className="relative w-48 h-48 mb-4">
            <svg viewBox="-100 -100 200 200" className="w-full h-full overflow-visible">
              {/* Grid circles */}
              {[20, 40, 60, 80, 100].map(r => (
                <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              ))}
              {/* Axes */}
              <line x1="0" y1="-100" x2="0" y2="100" stroke="#1e293b" strokeWidth="1" />
              <line x1="-100" y1="0" x2="100" y2="0" stroke="#1e293b" strokeWidth="1" />
              
              {/* Data Polygon */}
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

              {/* Data points */}
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
            
            {/* Labels */}
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-400">Physics (85%)</span>
            <span className="absolute top-1/2 -right-10 -translate-y-1/2 text-xs font-bold text-purple-400">Chem (65%)</span>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-400">Maths (92%)</span>
            <span className="absolute top-1/2 -left-12 -translate-y-1/2 text-xs font-bold text-amber-400">Bio (45%)</span>
          </div>
        </div>

        {/* Heatmap & AI Insights */}
        <div className="lg:col-span-2 grid grid-rows-2 gap-6">
          
          {/* Heatmap */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> 28-Day Study Streak
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
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-indigo-400" /> AI Recommendations
            </h2>
            <div className="space-y-4 relative z-10">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 flex gap-3">
                <div className="bg-amber-500/20 p-2 rounded-xl h-fit">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Focus on Biology</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Your mastery in Biology is currently at 45%. We recommend reviewing <strong className="text-indigo-300">Chapter 6: Life Processes</strong>.</p>
                </div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 flex gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-xl h-fit">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Maths Streak Achieved!</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Excellent work maintaining a 92% mastery in Maths. You are ready for the advanced Quiz Duels.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
