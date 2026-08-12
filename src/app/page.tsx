"use client";

import Link from "next/link";
import { BookOpen, Brain, Target, ArrowRight, Sparkles, Shield, Rocket, Play, Users, Trophy } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen relative font-sans" ref={targetRef}>
      {/* Premium Vanilla CSS Backgrounds */}
      <div className="premium-mesh-bg">
        <div className="premium-mesh-blob-1"></div>
        <div className="premium-mesh-blob-2"></div>
        <div className="premium-mesh-blob-3"></div>
        <div className="premium-grid-overlay"></div>
      </div>
      
      {/* Top Glass Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 premium-glass-panel rounded-none"
      >
        <div className="container mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-500 rounded-xl flex items-center justify-center premium-glow-border relative overflow-hidden group">
              <Brain className="w-5 h-5 text-white relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-white">
                EduTrack
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest premium-text-gradient-accent -mt-1 hidden sm:block">Class 6-10 AI Platform</span>
            </div>
          </div>

          <div className="flex gap-4 items-center shrink-0">
            <Link href="/formulas" className="text-xs font-black text-indigo-300 hover:text-white transition-colors flex items-center gap-1.5 px-3.5 py-2 micro-hover-lift">
              📐 Formulas Hub
            </Link>
            <Link href="/login" className="text-sm font-extrabold text-slate-300 hover:text-white transition-colors px-3 py-2">
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="premium-glow-border relative group px-6 py-2.5 rounded-full bg-[#0d1127] micro-hover-shine micro-hover-lift"
            >
              <span className="relative z-10 text-sm font-black premium-text-gradient flex items-center gap-1.5">
                <span>Start Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Main Hero Showcase */}
      <main className="relative pt-44 pb-32 px-6 flex flex-col items-center text-center z-10 min-h-screen">
        
        <motion.div style={{ y, opacity }} className="flex flex-col items-center w-full max-w-6xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
            className="premium-glass-panel inline-flex items-center gap-2.5 px-5 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest premium-text-gradient-accent">
              Next-Gen Academic Learning OS
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter mb-8 leading-[0.95] max-w-5xl"
          >
            Study <span className="italic text-slate-400 font-light tracking-tight">Faster.</span> <br/>
            <span className="premium-text-gradient">
              Think
            </span>
            <span className="premium-text-gradient-accent ml-4 relative inline-block">
              Smarter.
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
                className="absolute -bottom-2 left-0 h-[6px] bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-full"
              />
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-2xl text-slate-300 max-w-3xl mb-12 font-medium leading-relaxed"
          >
            The hyper-personalized learning system tailored for Class 6-10 CBSE students. Dynamic AI NCERT notes, instant photo doubt resolution, spaced recall flashcards, and live study circles.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-5 mb-24 w-full sm:w-auto"
          >
            <Link href="/signup" className="premium-glow-border group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-950 font-black text-sm uppercase tracking-widest rounded-full overflow-hidden micro-hover-lift shadow-[0_0_40px_rgba(255,255,255,0.4)]">
              <span className="relative z-10 flex items-center gap-2">Launch Workspace <Rocket className="w-5 h-5 text-indigo-600 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
            <Link href="/dashboard" className="premium-glass-panel group flex items-center justify-center gap-2.5 px-10 py-5 hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest rounded-full transition-all micro-hover-lift">
              <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              Explore Demo Dashboard
            </Link>
          </motion.div>
        </motion.div>

        {/* 3D Dashboard Perspective Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, type: "spring", stiffness: 50, damping: 20 }}
          style={{ perspective: 1200 }}
          className="w-full max-w-5xl relative z-20 group"
        >
          <div className="premium-glass-panel p-4 md:p-6 shadow-2xl shadow-black/80 overflow-hidden transform transition-transform duration-700 hover:scale-[1.02]">
            {/* Fake Window Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 px-4 pt-2">
              <div className="flex gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-inner" />
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 shadow-inner" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 shadow-inner" />
              </div>
              <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-full px-6 py-1.5 text-xs text-slate-300 font-mono">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> app.edutrack.space/dashboard
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Live System</span>
              </div>
            </div>

            {/* Premium Inner Mock Dashboard */}
            <div className="grid md:grid-cols-12 gap-6 text-left">
              <div className="hidden md:flex col-span-3 flex-col gap-3 border-r border-white/10 pr-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center premium-glow-border"><Brain className="w-5 h-5 text-white" /></div>
                  <div>
                    <div className="h-3.5 w-20 bg-white/90 rounded font-black text-xs text-white">EduTrack</div>
                    <div className="h-2 w-14 bg-indigo-400/60 rounded mt-1.5" />
                  </div>
                </div>
                {[
                  { label: "Dashboard", active: true, icon: Brain },
                  { label: "NCERT Books", active: false, icon: BookOpen },
                  { label: "AI Tutor", active: false, icon: Sparkles },
                  { label: "StudyCircles", active: false, icon: Users },
                  { label: "Flashcards", active: false, icon: Trophy },
                ].map((item, idx) => (
                  <div key={idx} className={`h-11 rounded-xl flex items-center justify-between px-4 text-xs font-bold ${item.active ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/[0.02] text-slate-400'}`}>
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-span-12 md:col-span-9 flex flex-col gap-6">
                <div className="flex justify-between items-center premium-glass-panel p-6">
                  <div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Class 10 CBSE Space</span>
                    <h3 className="text-xl font-black text-white mt-1">Welcome back, Student Scholar! 👋</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="premium-glass-panel p-5 flex flex-col gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Current Level</span>
                    <span className="text-2xl font-black premium-text-gradient-accent">Level 4 Scholar</span>
                    <div className="w-full bg-black/40 h-2 rounded-full mt-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[70%] rounded-full shadow-[0_0_10px_#8b5cf6]" />
                    </div>
                  </div>
                  <div className="premium-glass-panel p-5 flex flex-col gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Flashcards Mastered</span>
                    <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">142 Cards</span>
                    <span className="text-[10px] text-emerald-400/80 font-bold mt-2">Leitner Box Active</span>
                  </div>
                  <div className="premium-glass-panel p-5 flex flex-col gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Peer Rank</span>
                    <span className="text-2xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">#2 Rank 👑</span>
                    <span className="text-[10px] text-slate-400 font-bold mt-2">Class 10 Leaderboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Matrix */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-6 w-full max-w-6xl mt-32 relative z-20 text-left"
        >
          <motion.div variants={item} className="premium-glass-panel p-8 group micro-hover-lift">
            <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/30">
              <Target className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-white">Adaptive AI Learning</h3>
            <p className="text-slate-300 font-medium leading-relaxed text-sm">
              Our intelligent engine pinpoints your weak subjects and automatically crafts customized revision roadmaps for peak CBSE performance.
            </p>
          </motion.div>

          <motion.div variants={item} className="premium-glass-panel p-8 group micro-hover-lift">
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/30">
              <Brain className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-white">Instant AI Doubt Solver</h3>
            <p className="text-slate-300 font-medium leading-relaxed text-sm">
              Stuck on a tricky math equation or science diagram? Snap a picture or ask in plain English/Hinglish to receive step-by-step guidance.
            </p>
          </motion.div>

          <motion.div variants={item} className="premium-glass-panel p-8 group micro-hover-lift">
            <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-8 border border-pink-500/30">
              <BookOpen className="w-7 h-7 text-pink-400" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-white">Interactive Mind Maps</h3>
            <p className="text-slate-300 font-medium leading-relaxed text-sm">
              Explore syllabus skill trees, active recall card decks, and Leitner box flashcards that turn studying into an engaging game.
            </p>
          </motion.div>
        </motion.div>

        {/* Footer Call to Action Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 w-full max-w-5xl premium-glass-panel premium-glow-border p-12 md:p-16 text-center shadow-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Ready to Supercharge Your Studies?
          </h2>
          <p className="text-slate-300 font-medium max-w-xl mx-auto mb-10 text-base">
            Join thousands of CBSE students using EduTrack to ace exams with confidence and clarity.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-950 font-black text-sm uppercase tracking-widest rounded-full micro-hover-lift shadow-[0_0_40px_rgba(255,255,255,0.4)]">
            Get Started Now <Rocket className="w-5 h-5 text-indigo-600" />
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

