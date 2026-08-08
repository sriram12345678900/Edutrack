"use client";

import Link from "next/link";
import { BookOpen, Brain, Target, ArrowRight, Sparkles, Zap, Shield, Rocket, CheckCircle2, Star, Flame, Trophy, Users, Award, Play } from "lucide-react";
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

  // Stagger animation variants
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
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden relative font-sans" ref={targetRef}>
      {/* Grainy Noise Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay z-50"></div>
      
      {/* Animated Gradient Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] bg-indigo-600/30 rounded-full blur-[130px] pointer-events-none mix-blend-screen" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.4, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[65vw] h-[65vw] bg-fuchsia-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen" 
      />
      <div className="absolute top-[35%] left-[35%] w-[35vw] h-[35vw] bg-blue-500/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>

      {/* Top Glass Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-[#02040a]/60 backdrop-blur-2xl"
      >
        <div className="container mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -translate-x-full" />
              <Brain className="w-5 h-5 text-white relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-white">
                EduTrack
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 -mt-1 hidden sm:block">Class 6-10 AI Platform</span>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4 items-center shrink-0">
            <Link href="/formulas" className="text-xs font-black text-indigo-300 hover:text-white transition-colors flex items-center gap-1.5 bg-indigo-500/10 px-3.5 py-2 rounded-full border border-indigo-500/25">
              📐 Formulas Hub
            </Link>
            <Link href="/login" className="text-xs sm:text-sm font-extrabold text-slate-300 hover:text-white transition-colors px-3 py-2">
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="relative group px-4 py-2 sm:px-6 sm:py-2.5 overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 border border-white/20 shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all"
            >
              <span className="relative z-10 text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <span>Start Free</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Main Hero Showcase */}
      <main className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6 flex flex-col items-center text-center z-10 min-h-screen">
        
        <motion.div style={{ y, opacity }} className="flex flex-col items-center w-full max-w-6xl mx-auto">
          
          {/* Dynamic Glow Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
            className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.2)]"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 bg-clip-text text-transparent">
              Next-Gen Academic Learning OS
            </span>
          </motion.div>
          
          {/* Big Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter mb-8 leading-[0.95] max-w-5xl"
          >
            Study <span className="italic text-slate-400 font-light tracking-tight">Faster.</span> <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400">
              Think
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 ml-4 relative inline-block">
              Smarter.
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
                className="absolute -bottom-2 left-0 h-[6px] bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]"
              />
            </span>
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-2xl text-slate-300 max-w-3xl mb-12 font-medium leading-relaxed"
          >
            The hyper-personalized learning system tailored for Class 6-10 CBSE students. Dynamic AI NCERT notes, instant photo doubt resolution, spaced recall flashcards, and live study circles.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-5 mb-16 w-full sm:w-auto"
          >
            <Link href="/signup" className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-950 font-black text-sm uppercase tracking-widest rounded-full overflow-hidden hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.4)]">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-2">Launch Workspace <Rocket className="w-5 h-5 text-indigo-600 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
            <Link href="/dashboard" className="group flex items-center justify-center gap-2.5 px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest rounded-full transition-all border border-white/15 hover:border-white/30 backdrop-blur-md">
              <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              Explore Demo Dashboard
            </Link>
          </motion.div>

          {/* Quick Metrics Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-4xl mb-20 shadow-2xl"
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-white">98.4%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Exam Prep Accuracy</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-indigo-400">10k+</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">CBSE Questions Solved</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-purple-400">⚡ &lt; 3s</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">AI Doubt Resolution</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-pink-400">Class 6-10</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Syllabus Coverage</span>
            </div>
          </motion.div>
        </motion.div>

        {/* 3D Dashboard Perspective Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, type: "spring", stiffness: 50, damping: 20 }}
          style={{ perspective: 1000 }}
          className="w-full max-w-6xl relative z-20 group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 via-purple-500/20 to-pink-500/10 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 rounded-full transform -translate-y-10" />
          
          <div className="relative bg-[#040612]/95 backdrop-blur-2xl border border-white/15 rounded-[2rem] p-4 md:p-6 shadow-2xl shadow-black/80 overflow-hidden transform transition-transform duration-700 hover:scale-[1.01]">
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

            {/* Dashboard Mock Grid */}
            <div className="grid md:grid-cols-12 gap-6 text-left">
              {/* Mock Sidebar */}
              <div className="hidden md:flex col-span-3 flex-col gap-3 border-r border-white/10 pr-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"><Brain className="w-5 h-5 text-white" /></div>
                  <div>
                    <div className="h-3.5 w-20 bg-white/90 rounded font-black text-xs text-white">EduTrack</div>
                    <div className="h-2 w-14 bg-indigo-400/60 rounded mt-1" />
                  </div>
                </div>
                {[
                  { label: "Dashboard", active: true, icon: Brain },
                  { label: "NCERT Books", active: false, icon: BookOpen },
                  { label: "AI Tutor", active: false, icon: Sparkles },
                  { label: "StudyCircles", active: false, icon: Users },
                  { label: "Flashcards", active: false, icon: Trophy },
                ].map((item, idx) => (
                  <div key={idx} className={`h-10 rounded-xl flex items-center justify-between px-3.5 text-xs font-bold ${item.active ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/[0.02] text-slate-400'}`}>
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock Main Panel */}
              <div className="col-span-12 md:col-span-9 flex flex-col gap-6">
                
                {/* Header Welcome Bar */}
                <div className="flex justify-between items-center bg-gradient-to-r from-indigo-950/60 via-purple-950/30 to-transparent p-5 rounded-2xl border border-white/10">
                  <div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Class 10 CBSE Space</span>
                    <h3 className="text-xl font-black text-white mt-1">Welcome back, Student Scholar! 👋</h3>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 text-orange-400 px-3.5 py-2 rounded-xl font-black text-xs">
                    <Flame className="w-4 h-4 text-orange-400" /> 7 Day Streak
                  </div>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Current Level</span>
                    <span className="text-2xl font-black text-indigo-400">Level 4 Scholar</span>
                    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[70%]" />
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Flashcards Mastered</span>
                    <span className="text-2xl font-black text-emerald-400">142 Cards</span>
                    <span className="text-[10px] text-emerald-400/80 font-bold">Leitner Box Active</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Peer Rank</span>
                    <span className="text-2xl font-black text-yellow-400">#2 Rank 👑</span>
                    <span className="text-[10px] text-slate-400 font-bold">Class 10 Leaderboard</span>
                  </div>
                </div>

                {/* Mock Action Section */}
                <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Daily AI Study Recommendation</h4>
                      <p className="text-xs text-slate-400 font-bold">Review Chemical Reactions & Equations (Acids & Bases)</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl">
                    Open Lab
                  </button>
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
          {/* Feature 1 */}
          <motion.div variants={item} className="p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.06] to-transparent border border-white/10 hover:border-indigo-500/50 transition-all group relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/25 transition-colors" />
            <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Target className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-white">Adaptive AI Learning</h3>
            <p className="text-slate-300 font-medium leading-relaxed text-sm">
              Our intelligent engine pinpoints your weak subjects and automatically crafts customized revision roadmaps for peak CBSE performance.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={item} className="p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.06] to-transparent border border-white/10 hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-lg">
             <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/25 transition-colors" />
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Brain className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-white">Instant AI Doubt Solver</h3>
            <p className="text-slate-300 font-medium leading-relaxed text-sm">
              Stuck on a tricky math equation or science diagram? Snap a picture or ask in plain English/Hinglish to receive step-by-step guidance.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={item} className="p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.06] to-transparent border border-white/10 hover:border-pink-500/50 transition-all group relative overflow-hidden shadow-lg">
             <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/25 transition-colors" />
            <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-8 border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
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
          className="mt-32 w-full max-w-5xl bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-pink-900/40 border border-white/20 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" />
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Ready to Supercharge Your Studies?
          </h2>
          <p className="text-slate-300 font-medium max-w-xl mx-auto mb-8 text-base">
            Join thousands of CBSE students using EduTrack to ace exams with confidence and clarity.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-950 font-black text-sm uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.4)]">
            Get Started Now <Rocket className="w-5 h-5 text-indigo-600" />
          </Link>
        </motion.div>

      </main>
    </div>
  );
}

