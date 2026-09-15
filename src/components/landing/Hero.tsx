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
    href: "/tutor",
    icon: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Ambient neon back-glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-pink-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
        {/* Glowing Chat Speech Bubble Icon */}
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#0f142b] border border-cyan-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
          <MessageSquare className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
        </div>
      </div>
    ),
    borderHover: "hover:border-cyan-400/40",
    glowColor: "rgba(6, 182, 212, 0.2)"
  },
  {
    title: "Virtual Lab",
    subtitle: "Interactive Virtual Lab",
    href: "/sandbox",
    icon: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-teal-400 to-pink-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#0f142b] border border-teal-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.5)]">
          <FlaskConical className="w-7 h-7 text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
        </div>
      </div>
    ),
    borderHover: "hover:border-teal-400/40",
    glowColor: "rgba(45, 212, 191, 0.2)"
  },
  {
    title: "Flashcard Deck",
    subtitle: "Dynamic Flashcards",
    href: "/flashcards",
    icon: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#0f142b] border border-purple-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
            <span className="text-white font-black text-sm tracking-wider">A</span>
          </div>
        </div>
      </div>
    ),
    borderHover: "hover:border-purple-400/40",
    glowColor: "rgba(168, 85, 247, 0.2)"
  },
  {
    title: "Multiplayer Arena",
    subtitle: "Competitive Learning",
    href: "/arena",
    icon: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 via-fuchsia-500 to-indigo-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#0f142b] border border-rose-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.5)]">
          <Swords className="w-7 h-7 text-pink-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
        </div>
      </div>
    ),
    borderHover: "hover:border-rose-400/40",
    glowColor: "rgba(244, 63, 94, 0.2)"
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
      className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-24 px-4 sm:px-6 overflow-hidden bg-[#060814]"
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
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-14 sm:mb-16"
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
        </motion.div>

        {/* 4 Center Elevated Dark Glass Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {HERO_CORE_CARDS.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * idx, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="h-full"
            >
              <Link href={card.href} className="h-full block">
                <div 
                  className={`group relative h-full flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl backdrop-blur-2xl bg-[#0c1024]/75 border border-white/[0.08] ${card.borderHover} transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.5)] overflow-hidden`}
                  style={{
                    boxShadow: `0 20px 40px -15px ${card.glowColor}`
                  }}
                >
                  {/* Subtle inner top glare reflection */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  {/* 3D Illuminated Icon */}
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>

                  {/* Card Title & Subtitle */}
                  <h3 className="text-base font-bold text-white tracking-wide group-hover:text-indigo-200 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 mt-1">
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
