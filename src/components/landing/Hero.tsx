"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { 
  Sparkles, 
  MessageSquare, 
  FlaskConical, 
  Layers, 
  Swords, 
  BrainCircuit, 
  Mic2, 
  TrendingUp,
  ArrowRight
} from "lucide-react";

// Animated Counter for Metrics
const AnimatedCounter = ({ end, suffix = "" }: { end: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 25);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [end]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// 4 Core Hero Cards data from mockup
const HERO_CORE_CARDS = [
  {
    title: "AI Tutor",
    subtitle: "AI-Powered Tutor",
    tag: "Instant 24/7 AI",
    href: "/tutor",
    floatDuration: 3.2,
    floatDelay: 0,
    icon: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Ambient neon back-glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
        {/* Glowing Chat Speech Bubble Icon */}
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#0f142b] border border-cyan-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.5)]">
          <MessageSquare className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-pink-500 shadow-[0_0_10px_#ec4899] animate-ping" style={{ animationDuration: '3s' }} />
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-pink-500" />
        </div>
      </div>
    ),
    borderHover: "hover:border-cyan-400/60",
    glowColor: "rgba(6, 182, 212, 0.25)"
  },
  {
    title: "Virtual Lab",
    subtitle: "Interactive Virtual Lab",
    tag: "Simulations",
    href: "/sandbox",
    floatDuration: 3.8,
    floatDelay: 0.3,
    icon: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-teal-400 to-pink-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#0f142b] border border-teal-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(45,212,191,0.5)]">
          <FlaskConical className="w-7 h-7 text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf] animate-ping" />
        </div>
      </div>
    ),
    borderHover: "hover:border-teal-400/60",
    glowColor: "rgba(45, 212, 191, 0.25)"
  },
  {
    title: "Flashcard Deck",
    subtitle: "Dynamic Flashcards",
    tag: "Spaced Recall",
    href: "/flashcards",
    floatDuration: 3.4,
    floatDelay: 0.6,
    icon: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#0f142b] border border-purple-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.5)]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
            <span className="text-white font-black text-sm tracking-wider">A</span>
          </div>
        </div>
      </div>
    ),
    borderHover: "hover:border-purple-400/60",
    glowColor: "rgba(168, 85, 247, 0.25)"
  },
  {
    title: "Multiplayer Arena",
    subtitle: "Competitive Learning",
    tag: "Live PvP Duels",
    href: "/arena",
    floatDuration: 4.1,
    floatDelay: 0.9,
    icon: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 via-fuchsia-500 to-indigo-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#0f142b] border border-rose-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.5)]">
          <Swords className="w-7 h-7 text-pink-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
        </div>
      </div>
    ),
    borderHover: "hover:border-rose-400/60",
    glowColor: "rgba(244, 63, 94, 0.25)"
  }
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-24 px-4 sm:px-6 overflow-hidden bg-transparent"
      aria-label="Hero"
    >
      {/* Background Ambient Glowing Neon Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Content Container */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center text-center max-w-6xl mx-auto w-full"
      >
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-6 backdrop-blur-xl shadow-[0_0_20px_rgba(99,102,241,0.2)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold text-indigo-200 tracking-wide">
            Next-Gen AI Learning OS • CBSE Class 6–10
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span>Study</span>
            <span className="relative inline-block pb-3">
              <span>Smarter.</span>
              {/* Dual-color glowing underline ribbon */}
              <svg 
                className="absolute -bottom-1 left-0 w-full h-3 overflow-visible pointer-events-none" 
                viewBox="0 0 160 12" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M2 7C40 2 110 3 158 8" 
                  stroke="url(#underline-gradient-1)" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                />
                <defs>
                  <linearGradient id="underline-gradient-1" x1="2" y1="7" x2="158" y2="8" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38bdf8" />
                    <stop offset="0.6" stopColor="#818cf8" />
                    <stop offset="1" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span>Score</span>
            <span className="relative inline-block pb-3">
              <span>Higher.</span>
              {/* Dual-color glowing underline ribbon continuation */}
              <svg 
                className="absolute -bottom-1 left-0 w-full h-3 overflow-visible pointer-events-none" 
                viewBox="0 0 160 12" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M2 8C50 3 120 4 158 8" 
                  stroke="url(#underline-gradient-2)" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                />
                <defs>
                  <linearGradient id="underline-gradient-2" x1="2" y1="8" x2="158" y2="8" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#c084fc" />
                    <stop offset="0.7" stopColor="#ec4899" />
                    <stop offset="1" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-slate-300/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mt-6 leading-relaxed font-normal">
            The futuristic all-in-one platform built for CBSE toppers. Master complex concepts with your 24/7 AI Tutor, 3D interactive labs, spaced recall flashcards, and live multiplayer duels.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mt-8">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold text-sm rounded-full shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_45px_rgba(217,70,239,0.6)] transition-all hover:scale-105 active:scale-95"
            >
              Start Learning Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => {
                document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white font-semibold text-sm rounded-full border border-white/10 hover:border-white/20 backdrop-blur-xl transition-all hover:scale-105"
            >
              Explore Features
            </button>
          </div>
        </motion.div>

        {/* 4 Center Elevated Dark Glass Cards with Floating Animation */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {HERO_CORE_CARDS.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: 1,
                y: [0, -8, 0],
              }}
              transition={{
                opacity: { duration: 0.5, delay: 0.1 * idx, ease: "easeOut" },
                y: {
                  duration: card.floatDuration,
                  delay: card.floatDelay,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
              }}
              whileHover={{ y: -12, scale: 1.04 }}
              className="h-full"
            >
              <Link href={card.href} className="h-full block">
                <div 
                  className={`group relative h-full flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl backdrop-blur-2xl bg-[#0c1024]/85 border border-white/10 ${card.borderHover} transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6)] overflow-hidden hover:bg-[#0f1430]/95`}
                  style={{
                    boxShadow: `0 20px 40px -15px ${card.glowColor}`
                  }}
                >
                  {/* Subtle inner top glare reflection */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                  {/* Corner Mini Tag Badge */}
                  <div className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[9px] font-bold text-slate-300 tracking-wider group-hover:border-white/25 group-hover:text-white transition-all">
                    {card.tag}
                  </div>

                  {/* 3D Illuminated Icon */}
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>

                  {/* Card Title & Subtitle */}
                  <h3 className="text-base font-bold text-white tracking-wide group-hover:text-indigo-200 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">
                    {card.subtitle}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Metrics Pill Bar (Social Proof) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="w-full max-w-4xl backdrop-blur-2xl bg-[#0b0e22]/80 border border-white/10 rounded-3xl px-6 py-6 sm:py-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)] mb-8 sm:mb-12"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {/* Metric 1 */}
            <div className="flex flex-col items-center justify-center sm:px-6">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-tight">
                <AnimatedCounter end={50} suffix="K+" />
              </span>
              <span className="text-xs font-semibold text-slate-400 mt-1">Active Students</span>
            </div>

            {/* Metric 2 */}
            <div className="flex flex-col items-center justify-center pt-4 sm:pt-0 sm:px-6">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
                <AnimatedCounter end={98} suffix="%" />
              </span>
              <span className="text-xs font-semibold text-slate-400 mt-1">Learner Satisfaction</span>
            </div>

            {/* Metric 3 */}
            <div className="flex flex-col items-center justify-center pt-4 sm:pt-0 sm:px-6">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-tight">
                <AnimatedCounter end={2} suffix="M+" />
              </span>
              <span className="text-xs font-semibold text-slate-400 mt-1">Lessons Completed</span>
            </div>
          </div>
        </motion.div>

        {/* Secondary 3 Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Card 1 */}
          <Link href="/skill-tree">
            <div className="group flex items-center gap-3.5 p-4 rounded-2xl backdrop-blur-xl bg-[#0c1024]/60 border border-white/[0.08] hover:border-purple-500/30 transition-all hover:bg-[#0c1024]/90 text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                  AI Personalized Path
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Custom learning journeys</p>
              </div>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/classroom">
            <div className="group flex items-center gap-3.5 p-4 rounded-2xl backdrop-blur-xl bg-[#0c1024]/60 border border-white/[0.08] hover:border-pink-500/30 transition-all hover:bg-[#0c1024]/90 text-left">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Mic2 className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                  Live Masterclasses
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Expert-led sessions</p>
              </div>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/analytics">
            <div className="group flex items-center gap-3.5 p-4 rounded-2xl backdrop-blur-xl bg-[#0c1024]/60 border border-white/[0.08] hover:border-cyan-500/30 transition-all hover:bg-[#0c1024]/90 text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Skill Analytics
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Track Progress & Performance</p>
              </div>
            </div>
          </Link>
        </motion.div>

      </motion.div>
    </section>
  );
}
