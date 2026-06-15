"use client";

import Link from "next/link";
import { BookOpen, Brain, Target, ArrowRight, Sparkles, ChevronRight, Zap, Shield, Rocket } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
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
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-indigo-500/30 overflow-x-hidden relative" ref={targetRef}>
      {/* Spectacular Glowing Spotlights & Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay z-50"></div>
      
      {/* Animated Gradient Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none mix-blend-screen" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-fuchsia-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen" 
      />
      <div className="absolute top-[30%] left-[40%] w-[30vw] h-[30vw] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>

      {/* Top Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/5 bg-[#02040a]/50 backdrop-blur-2xl"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3">
            {/* Preferred Logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -translate-x-full" />
              <Brain className="w-5.5 h-5.5 text-white relative z-10" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              EduTrack
            </span>
          </div>
          <div className="flex gap-5 items-center">
            <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="relative group px-6 py-2.5 overflow-hidden rounded-full bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 text-sm font-black text-white flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center z-10 min-h-screen">
        
        <motion.div style={{ y, opacity }} className="flex flex-col items-center w-full max-w-6xl mx-auto">
          {/* Dynamic Glow Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.15)]"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">Next-Gen Learning OS</span>
          </motion.div>
          
          {/* Big Bold Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter mb-8 leading-[0.95] max-w-5xl"
          >
            Study <span className="italic text-slate-400 font-light tracking-tight">Faster.</span> <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500">
              Think
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 ml-4 relative inline-block">
              Smarter.
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
                className="absolute -bottom-2 left-0 h-[6px] bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full"
              />
            </span>
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-2xl text-slate-400 max-w-3xl mb-12 font-medium leading-relaxed"
          >
            The hyper-personalized platform for Class 6-10 CBSE students. AI-generated revision, instant doubt resolution, and adaptive study plans.
          </motion.p>
          
          {/* Call-to-action buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-5 mb-24 w-full sm:w-auto"
          >
            <Link href="/signup" className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-950 font-black text-sm uppercase tracking-widest rounded-full overflow-hidden hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-2">Launch Workspace <Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
            <Link href="/login" className="group flex items-center justify-center gap-2 px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest rounded-full transition-all border border-white/10 hover:border-white/20 backdrop-blur-md">
              <Zap className="w-4 h-4 text-yellow-400" />
              See How It Works
            </Link>
          </motion.div>
        </motion.div>

        {/* 3D Perspective UI Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, type: "spring", stiffness: 50, damping: 20 }}
          style={{ perspective: 1000 }}
          className="w-full max-w-6xl relative z-20 group"
        >
          {/* Stunning glowing backdrop for the mockup */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 rounded-full transform -translate-y-10" />
          
          <div className="relative bg-[#040612]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-3 md:p-6 shadow-2xl shadow-black/50 overflow-hidden transform transition-transform duration-700 hover:scale-[1.02]">
            {/* Fake Browser Chrome */}
            <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-6 px-4 pt-2">
              <div className="flex gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-inner" />
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 shadow-inner" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 shadow-inner" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-black/40 border border-white/5 rounded-md px-6 py-1.5 text-xs text-slate-400 flex items-center gap-2 font-mono">
                  <Shield className="w-3 h-3 text-green-400" /> app.edutrack.space
                </div>
              </div>
              <div className="w-[70px]"></div>
            </div>

            {/* Mockup Content Grid */}
            <div className="grid md:grid-cols-12 gap-6 p-2">
              {/* Sidebar Mock */}
              <div className="hidden md:flex col-span-3 flex-col gap-4 border-r border-white/5 pr-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Brain className="w-4 h-4 text-white" /></div>
                  <div className="h-4 w-24 bg-white/10 rounded" />
                </div>
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-10 rounded-xl flex items-center px-3 gap-3 ${i === 1 ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white/[0.02]'}`}>
                    <div className={`w-5 h-5 rounded ${i === 1 ? 'bg-indigo-500/50' : 'bg-white/10'}`} />
                    <div className={`h-2.5 rounded ${i === 1 ? 'w-20 bg-indigo-400' : 'w-24 bg-white/20'}`} />
                  </div>
                ))}
              </div>

              {/* Main Content Mock */}
              <div className="col-span-12 md:col-span-9 flex flex-col gap-6">
                {/* Header Area */}
                <div className="flex justify-between items-end">
                  <div>
                    <div className="h-3 w-32 bg-indigo-500/50 rounded-full mb-3" />
                    <div className="h-8 w-64 bg-white/90 rounded-md" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-10 w-10 bg-white/10 rounded-full" />
                    <div className="h-10 w-32 bg-indigo-600 rounded-full" />
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { c1: 'bg-emerald-500/20', c2: 'bg-emerald-400' },
                    { c1: 'bg-purple-500/20', c2: 'bg-purple-400' },
                    { c1: 'bg-pink-500/20', c2: 'bg-pink-400' }
                  ].map((c, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-20 h-20 ${c.c1} blur-2xl rounded-full`} />
                      <div className={`w-10 h-10 ${c.c1} rounded-xl mb-4 border border-white/10`} />
                      <div className={`h-6 w-16 ${c.c2} rounded mb-2`} />
                      <div className="h-2 w-24 bg-white/20 rounded" />
                    </div>
                  ))}
                </div>

                {/* Big Dashboard Area */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-white/10 rounded-2xl p-6 flex-1 min-h-[250px] relative">
                  <div className="absolute top-4 right-4 h-6 w-24 bg-white/10 rounded-full" />
                  <div className="h-5 w-40 bg-white/60 rounded mb-8" />
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="w-12 h-12 bg-white/10 rounded-lg" />
                        <div className="flex-1">
                          <div className="h-3 w-48 bg-white/60 rounded mb-2" />
                          <div className="h-2 w-32 bg-white/20 rounded" />
                        </div>
                        <div className="h-8 w-20 bg-indigo-500/20 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-6 w-full max-w-6xl mt-32 relative z-20 text-left"
        >
          {/* Feature 1 */}
          <motion.div variants={item} className="p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-indigo-500/50 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
            <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/30">
              <Target className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black mb-4 text-white">Adaptive Planning</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              Our AI analyzes your weak areas and automatically schedules revision blocks to optimize your retention and score.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={item} className="p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-purple-500/50 transition-colors group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/30">
              <Brain className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-black mb-4 text-white">Instant AI Tutor</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              Stuck on a problem? Snap a photo or type it out. Get step-by-step explanations in plain English or Hinglish instantly.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={item} className="p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-fuchsia-500/50 transition-colors group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl group-hover:bg-fuchsia-500/20 transition-colors" />
            <div className="w-14 h-14 bg-fuchsia-500/20 rounded-2xl flex items-center justify-center mb-8 border border-fuchsia-500/30">
              <BookOpen className="w-7 h-7 text-fuchsia-400" />
            </div>
            <h3 className="text-2xl font-black mb-4 text-white">Smart Flashcards</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              Automatically generated flashcards from your NCERT chapters using spaced repetition to ensure you never forget.
            </p>
          </motion.div>
        </motion.div>

      </main>
    </div>
  );
}
