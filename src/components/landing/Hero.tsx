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
  ArrowRight,
  Send,
  RotateCw,
  CheckCircle2,
  Zap,
  BookOpen,
  ChevronRight,
  Flame,
  Check,
  Sliders
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

// Doubt Demo Samples for Live Studio
interface DoubtSample {
  question: string;
  subject: string;
  chapter: string;
  steps: string[];
  finalAnswer: string;
}

const DOUBT_SAMPLES: DoubtSample[] = [
  {
    question: "Balance the chemical equation: Fe + H2O -> Fe3O4 + H2",
    subject: "Class 10 Science",
    chapter: "Chapter 1: Chemical Reactions",
    steps: [
      "Step 1: Balance Fe atoms: Add coefficient 3 to Fe -> 3Fe + H2O -> Fe3O4 + H2",
      "Step 2: Balance O atoms: Fe3O4 has 4 oxygen atoms, multiply H2O by 4 -> 3Fe + 4H2O -> Fe3O4 + H2",
      "Step 3: Balance H atoms: 4H2O has 8 hydrogen atoms, multiply H2 by 4 -> 3Fe + 4H2O -> Fe3O4 + 4H2"
    ],
    finalAnswer: "Balanced: 3Fe (s) + 4H2O (g) -> Fe3O4 (s) + 4H2 (g)"
  },
  {
    question: "Find the roots of quadratic equation: 2x² - 7x + 3 = 0",
    subject: "Class 10 Mathematics",
    chapter: "Chapter 4: Quadratic Equations",
    steps: [
      "Step 1: Identify coefficients: a = 2, b = -7, c = 3",
      "Step 2: Discriminant D = b² - 4ac = (-7)² - 4(2)(3) = 49 - 24 = 25 (D > 0, real roots)",
      "Step 3: Quadratic Formula: x = [-(-7) ± √25] / (2 × 2) = (7 ± 5) / 4"
    ],
    finalAnswer: "Roots are x = 3 and x = 1/2"
  },
  {
    question: "Why is the clear sky blue in color during the day?",
    subject: "Class 10 Physics",
    chapter: "Chapter 11: The Human Eye",
    steps: [
      "Step 1: Sunlight enters the Earth's atmosphere composed of fine gas molecules.",
      "Step 2: Rayleigh scattering states scattering intensity is proportional to 1 / λ⁴.",
      "Step 3: Blue light has a much shorter wavelength than red light, scattering nearly 10x more."
    ],
    finalAnswer: "Atmospheric Rayleigh scattering directs diffuse blue wavelengths into our eyes."
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

  // Interactive Live Studio State
  const [activeStudioTab, setActiveStudioTab] = useState<"doubt" | "flashcard" | "lab">("doubt");

  // Doubt Studio State
  const [selectedDoubtIdx, setSelectedDoubtIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // 3D Flashcard State
  const [isFlipped, setIsFlipped] = useState(false);
  const [leitnerBox, setLeitnerBox] = useState(1);
  const [xpGained, setXpGained] = useState(0);

  // Virtual Lab Ohm's Law State
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(4);
  const currentAmp = (voltage / resistance).toFixed(2);
  const powerWatt = (voltage * (voltage / resistance)).toFixed(1);

  // Simulate typing effect when doubt changes
  useEffect(() => {
    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 400);
    return () => clearTimeout(t);
  }, [selectedDoubtIdx]);

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

        {/* ============================================================== */}
        {/* 🚀 LIVE INTERACTIVE PRODUCT STUDIO (Hands-On Showcase)         */}
        {/* ============================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-5xl relative z-20 mb-14"
        >
          <div className="relative bg-[#0c1028]/95 backdrop-blur-3xl border border-white/15 rounded-3xl p-5 sm:p-8 md:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden text-left">
            {/* Top subtle glare */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            {/* Studio Mode Switcher Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-white">Live Product Workbench</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 animate-pulse">
                      Interactive Live Demo
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Experience EduTrack features instantly right in your browser</p>
                </div>
              </div>

              {/* Mode Select Buttons */}
              <div className="inline-flex bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1 gap-1 self-start sm:self-auto">
                <button
                  onClick={() => setActiveStudioTab("doubt")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeStudioTab === "doubt"
                      ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>AI Doubt</span>
                </button>

                <button
                  onClick={() => setActiveStudioTab("flashcard")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeStudioTab === "flashcard"
                      ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>3D Flashcard</span>
                </button>

                <button
                  onClick={() => setActiveStudioTab("lab")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeStudioTab === "lab"
                      ? "bg-teal-600 text-white shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Virtual Lab</span>
                </button>
              </div>
            </div>

            {/* STUDIO TAB 1: AI DOUBT SOLVER PREVIEW */}
            {activeStudioTab === "doubt" && (
              <div className="space-y-5">
                {/* Sample Prompt Chips */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Select a live CBSE problem to test AI resolution:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {DOUBT_SAMPLES.map((sample, idx) => (
                      <button
                        key={sample.question}
                        onClick={() => setSelectedDoubtIdx(idx)}
                        className={`text-left text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all ${
                          selectedDoubtIdx === idx
                            ? "bg-indigo-500/20 border-indigo-400/60 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                            : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        {sample.question}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doubt Solver Window */}
                <div className="rounded-2xl bg-[#080b1d] border border-white/10 p-5 sm:p-6 shadow-inner relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>{DOUBT_SAMPLES[selectedDoubtIdx].subject}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-indigo-300">{DOUBT_SAMPLES[selectedDoubtIdx].chapter}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-400">
                      Latency: 1.2s
                    </span>
                  </div>

                  {/* Question Bubble */}
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-4">
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {DOUBT_SAMPLES[selectedDoubtIdx].question}
                    </p>
                  </div>

                  {/* AI Response Breakdown */}
                  {isTyping ? (
                    <div className="py-6 flex items-center justify-center gap-2 text-indigo-400 text-xs font-bold">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Synthesizing step-by-step CBSE NCERT solution...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        {DOUBT_SAMPLES[selectedDoubtIdx].steps.map((st, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.05]">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>

                      {/* Final Answer Banner */}
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs sm:text-sm font-bold text-emerald-300 font-mono">
                            {DOUBT_SAMPLES[selectedDoubtIdx].finalAnswer}
                          </span>
                        </div>
                        <Link
                          href="/tutor"
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 shrink-0"
                        >
                          Try with your doubt <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STUDIO TAB 2: 3D SPACED RECALL FLASHCARD */}
            {activeStudioTab === "flashcard" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Interactive 3D Leitner Card (Click card to flip)
                    </span>
                    <p className="text-xs text-slate-300">
                      Active recall testing transfers knowledge to lifelong memory.
                    </p>
                  </div>
                  {xpGained > 0 && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    >
                      <Flame className="w-4 h-4 text-orange-400" /> +{xpGained} XP Streak!
                    </motion.div>
                  )}
                </div>

                {/* 3D Flip Card Container */}
                <div 
                  className="w-full max-w-lg mx-auto h-56 cursor-pointer select-none"
                  style={{ perspective: "1000px" }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <motion.div
                    className="w-full h-full relative"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                  >
                    {/* Front Side */}
                    <div
                      className="absolute inset-0 rounded-2xl p-6 bg-gradient-to-br from-[#121738] to-[#0c1029] border border-purple-500/30 flex flex-col justify-between shadow-2xl"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300 bg-purple-500/15 px-2.5 py-1 rounded-full border border-purple-500/30">
                          Class 10 Biology • Card #104
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <RotateCw className="w-3.5 h-3.5" /> Tap to flip
                        </span>
                      </div>

                      <div className="text-center my-auto px-4">
                        <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                          &quot;What is the primary function of Mitochondria in eukaryotic cells?&quot;
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-slate-400">
                        <span>Leitner Level: <strong className="text-purple-300">Box {leitnerBox} of 5</strong></span>
                        <span className="text-purple-400 font-semibold">NCERT Chapter 6</span>
                      </div>
                    </div>

                    {/* Back Side */}
                    <div
                      className="absolute inset-0 rounded-2xl p-6 bg-gradient-to-br from-[#191338] to-[#0d0924] border border-pink-500/40 flex flex-col justify-between shadow-2xl"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                          Answer & Key Concept
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <RotateCw className="w-3.5 h-3.5" /> Tap to flip
                        </span>
                      </div>

                      <div className="text-center my-auto px-4">
                        <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-relaxed">
                          Mitochondria are the <strong className="text-white">&quot;Powerhouses of the Cell&quot;</strong>. They generate most of the chemical energy required by cellular biochemical reactions in the form of <strong className="text-pink-300">ATP (Adenosine Triphosphate)</strong> via cellular respiration.
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px]">
                        <span className="text-emerald-400 font-bold">Concept Mastered</span>
                        <span className="text-slate-400 font-semibold">Scheduled in 3 days</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Confidence Action Bar */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLeitnerBox(1);
                      setXpGained(0);
                      setIsFlipped(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs transition-all active:scale-95"
                  >
                    Still Learning (Reset to Box 1)
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLeitnerBox((prev) => Math.min(5, prev + 1));
                      setXpGained((prev) => prev + 25);
                      setIsFlipped(true);
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    <Check className="w-3.5 h-3.5" /> Got It! Advance Box (+25 XP)
                  </button>
                </div>
              </div>
            )}

            {/* STUDIO TAB 3: VIRTUAL LAB (OHM'S LAW) */}
            {activeStudioTab === "lab" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Interactive Circuit Simulation (CBSE Class 10 Physics • Electricity)
                    </span>
                    <p className="text-xs text-slate-300">
                      Adjust Voltage (V) & Resistance (R) to observe live current I = V / R.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold">
                      Formula: I = V / R
                    </div>
                  </div>
                </div>

                {/* Sliders and Circuit Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center rounded-2xl bg-[#080b1d] border border-white/10 p-5 sm:p-6">
                  {/* Left: Interactive Controls */}
                  <div className="space-y-5">
                    {/* Voltage Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" /> Voltage (V):
                        </span>
                        <span className="text-amber-300 font-mono text-sm">{voltage} Volts</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={24}
                        value={voltage}
                        onChange={(e) => setVoltage(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                        <span>1V</span>
                        <span>12V</span>
                        <span>24V</span>
                      </div>
                    </div>

                    {/* Resistance Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Resistance (R):
                        </span>
                        <span className="text-cyan-300 font-mono text-sm">{resistance} &Omega;</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={20}
                        value={resistance}
                        onChange={(e) => setResistance(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                        <span>1&Omega;</span>
                        <span>10&Omega;</span>
                        <span>20&Omega;</span>
                      </div>
                    </div>

                    <Link
                      href="/sandbox"
                      className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      <span>Launch 12+ 3D Virtual Science Simulations</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Right: Live Digital Multimeter & Glowing Bulb */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-black/40 border border-white/10 relative overflow-hidden">
                    {/* Glowing Bulb Simulation */}
                    <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                      <div 
                        className="absolute inset-0 rounded-full blur-xl transition-all duration-300"
                        style={{
                          backgroundColor: "#fbbf24",
                          opacity: Math.min(1, Math.max(0.1, Number(powerWatt) / 100)),
                          transform: `scale(${Math.min(1.8, 0.8 + Number(currentAmp) / 3)})`
                        }}
                      />
                      <div className="relative z-10 w-14 h-14 rounded-full bg-amber-400/20 border border-amber-400/60 flex items-center justify-center shadow-lg">
                        <Zap 
                          className="w-7 h-7 text-amber-300 transition-transform duration-300" 
                          style={{
                            transform: `scale(${Math.min(1.3, 0.9 + Number(currentAmp) / 4)})`
                          }}
                        />
                      </div>
                    </div>

                    {/* Digital Meter Readout */}
                    <div className="w-full grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 rounded-lg bg-white/[0.04] border border-white/10">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Electric Current (I)
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-teal-300 font-mono">
                          {currentAmp} A
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.04] border border-white/10">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Dissipated Power (P)
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                          {powerWatt} W
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ============================================================== */}
        {/* 4 CORE QUICK LAUNCH APP PILLS                                  */}
        {/* ============================================================== */}
        <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12">
          {[
            {
              title: "AI Tutor",
              desc: "24/7 Step-by-Step",
              icon: MessageSquare,
              href: "/tutor",
              gradient: "from-cyan-500/20 to-indigo-500/20",
              border: "border-cyan-500/30 hover:border-cyan-400",
              iconColor: "text-cyan-300"
            },
            {
              title: "Virtual Lab",
              desc: "Physics & Chemistry",
              icon: FlaskConical,
              href: "/sandbox",
              gradient: "from-teal-500/20 to-emerald-500/20",
              border: "border-teal-500/30 hover:border-teal-400",
              iconColor: "text-teal-300"
            },
            {
              title: "Flashcards",
              desc: "Leitner Recall",
              icon: Layers,
              href: "/flashcards",
              gradient: "from-purple-500/20 to-pink-500/20",
              border: "border-purple-500/30 hover:border-purple-400",
              iconColor: "text-purple-300"
            },
            {
              title: "PvP Arena",
              desc: "Multiplayer Duels",
              icon: Swords,
              href: "/arena",
              gradient: "from-rose-500/20 to-amber-500/20",
              border: "border-rose-500/30 hover:border-rose-400",
              iconColor: "text-rose-300"
            }
          ].map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <Link key={tool.title} href={tool.href} className="block group">
                <div className={`p-4 rounded-2xl bg-[#0c1026]/80 backdrop-blur-xl border ${tool.border} transition-all duration-300 group-hover:scale-105 group-hover:bg-[#0f1433] shadow-lg text-left`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shrink-0 border border-white/10`}>
                      <ToolIcon className={`w-5 h-5 ${tool.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                        {tool.title}
                      </h4>
                      <p className="text-[10px] text-slate-400">{tool.desc}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
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
              <span className="text-xs font-semibold text-slate-400 mt-1">Active CBSE Students</span>
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
              <span className="text-xs font-semibold text-slate-400 mt-1">Doubts & Questions Solved</span>
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
