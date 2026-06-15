"use client";

import React from 'react';
import { Home, Trophy, Medal, Star, Flame, Crown } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TrophiesPage() {
  const achievements = [
    { id: 1, title: 'Speed Reader', desc: 'Finished 5 chapters in one day', icon: <Flame className="w-8 h-8 text-orange-400" />, color: 'from-orange-500 to-red-600', shadow: 'shadow-orange-500/50', unlocked: true },
    { id: 2, title: 'Quiz Champion', desc: 'Won 10 multiplayer duels', icon: <Crown className="w-8 h-8 text-yellow-300" />, color: 'from-yellow-400 to-amber-600', shadow: 'shadow-yellow-500/50', unlocked: true },
    { id: 3, title: 'Science Whiz', desc: 'Mastered 3 Science subjects', icon: <Star className="w-8 h-8 text-blue-300" />, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/50', unlocked: true },
    { id: 4, title: 'Perfect Streak', desc: 'Study for 30 consecutive days', icon: <Medal className="w-8 h-8 text-slate-400" />, color: 'from-slate-700 to-slate-900', shadow: 'shadow-none', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans p-6 overflow-hidden relative perspective-1000">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <header className="max-w-6xl mx-auto flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-500/20 p-3 rounded-2xl border border-yellow-500/30">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">Trophy Room</h1>
            <p className="text-slate-400 text-sm font-medium">Showcase your hard-earned achievements.</p>
          </div>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-slate-700 shadow-lg">
          <Home className="w-4 h-4" /> Back
        </Link>
      </header>

      <main className="max-w-6xl mx-auto relative z-10 h-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {achievements.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50, rotateX: 45 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: index * 0.15, type: 'spring', damping: 15 }}
              whileHover={{ scale: 1.05, rotateY: item.unlocked ? 15 : 0, rotateX: item.unlocked ? -10 : 0 }}
              style={{ transformStyle: 'preserve-3d' }}
              className={`relative aspect-[3/4] rounded-3xl p-1 group cursor-pointer ${item.unlocked ? 'bg-gradient-to-b from-white/20 to-white/5' : 'bg-slate-800 border border-slate-700'} shadow-2xl ${item.unlocked ? item.shadow : ''}`}
            >
              {/* Inner card content */}
              <div 
                className={`w-full h-full rounded-[22px] flex flex-col items-center justify-center p-6 text-center ${item.unlocked ? `bg-gradient-to-br ${item.color}` : 'bg-slate-900'} relative overflow-hidden`}
                style={{ transform: 'translateZ(30px)' }}
              >
                {/* Glare effect */}
                {item.unlocked && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:translate-x-full ease-in-out -translate-x-full" style={{ transform: 'translateZ(40px)' }} />
                )}

                <div 
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl ${item.unlocked ? 'bg-white/20 ring-4 ring-white/30' : 'bg-slate-800 ring-4 ring-slate-700'}`}
                  style={{ transform: 'translateZ(50px)' }}
                >
                  {item.icon}
                </div>
                
                <h3 className={`text-xl font-extrabold mb-2 ${item.unlocked ? 'text-white' : 'text-slate-500'}`} style={{ transform: 'translateZ(40px)' }}>{item.title}</h3>
                <p className={`text-sm font-medium ${item.unlocked ? 'text-white/80' : 'text-slate-600'}`} style={{ transform: 'translateZ(30px)' }}>{item.desc}</p>
                
                {!item.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px] rounded-[22px]">
                    <div className="bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 text-xs font-bold text-slate-400">Locked</div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
