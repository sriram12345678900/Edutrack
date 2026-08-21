"use client";

import Link from "next/link";
import { BookOpen, Brain, Target, ArrowRight, Shield, Rocket, Play, Users, Trophy, Sparkles, Zap, GraduationCap, ChevronRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useAuth } from "@/context/AuthContext";

function AuthNavButtons() {
  const { user, loading, logout } = useAuth();
  
  if (loading) {
    return <div className="w-20 h-8 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-full" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={logout}
          className="text-sm font-semibold dark:text-slate-400 text-slate-500 hover:dark:text-white text-slate-900 transition-colors px-3 py-2"
        >
          Log Out
        </button>
        <Link
          href="/dashboard"
          className="premium-glow-border relative group px-5 py-2.5 rounded-full dark:bg-[#0a0d1c] bg-[#eef1f9] micro-hover-lift"
        >
          <span className="relative z-10 text-sm font-bold dark:text-white text-slate-900 flex items-center gap-1.5">
            Dashboard
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="text-sm font-semibold dark:text-slate-300 text-slate-700 hover:dark:text-white text-slate-900 transition-colors px-3 py-2"
      >
        Log In
      </Link>
      <Link
        href="/signup"
        className="premium-glow-border relative group px-5 py-2.5 rounded-full dark:bg-[#0a0d1c] bg-[#eef1f9] micro-hover-lift"
      >
        <span className="relative z-10 text-sm font-bold dark:text-white text-slate-900 flex items-center gap-1.5">
          Get Started
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </Link>
    </>
  );
}

const FEATURES = [
  {
    icon: Target,
    color: "indigo",
    title: "Adaptive AI Learning",
    body: "Our intelligent engine pinpoints your weak subjects and automatically crafts customized revision roadmaps for peak CBSE performance.",
  },
  {
    icon: Brain,
    color: "violet",
    title: "Instant Doubt Solver",
    body: "Stuck on a tricky equation or science diagram? Snap a picture or ask in plain English to receive clear, step-by-step guidance.",
  },
  {
    icon: Sparkles,
    color: "fuchsia",
    title: "Spaced Recall System",
    body: "Explore syllabus skill trees, Leitner box flashcard decks, and active recall sessions that turn studying into a rewarding ritual.",
  },
];

const STATS = [
  { value: "50K+", label: "Active Students" },
  { value: "98%", label: "Exam Satisfaction" },
  { value: "6–10", label: "CBSE Classes" },
  { value: "12+", label: "AI-Powered Tools" },
];

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: Brain, active: true },
  { label: "NCERT Books", icon: BookOpen, active: false },
  { label: "AI Tutor", icon: Sparkles, active: false },
  { label: "StudyCircles", icon: Users, active: false },
  { label: "Achievements", icon: Trophy, active: false },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0]);

  const stagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.09, delayChildren: 0.15 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
  };

  return (
    <div className="min-h-screen relative font-sans" ref={heroRef}>
      {/* Ambient Background */}
      <div className="premium-mesh-bg">
        <div className="premium-mesh-blob-1" />
        <div className="premium-mesh-blob-2" />
        <div className="premium-mesh-blob-3" />
      </div>

      {/* ── NAVBAR ─────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.07] premium-glass-panel rounded-none"
        style={{ borderRadius: 0 }}
      >
        <div className="container mx-auto px-5 sm:px-8 py-3.5 flex justify-between items-center max-w-7xl">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-[#5b6ff2] via-[#9b5de5] to-[#d946ef] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="w-4.5 h-4.5 dark:text-white text-slate-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-[1.2rem] font-black tracking-tight dark:text-white text-slate-900 leading-none">EduTrack</span>
              <span className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-indigo-400/80 leading-none mt-0.5 hidden sm:block">
                Class 6–10 AI Platform
              </span>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex gap-3 items-center shrink-0">
            <Link
              href="/formulas"
              className="hidden sm:flex text-xs font-semibold dark:text-slate-400 text-slate-600 hover:dark:text-white text-slate-900 transition-colors items-center gap-1.5 px-3 py-2"
            >
              Formulas Hub
            </Link>
            
            <AuthNavButtons />
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ───────────────────────────────── */}
      <main className="relative z-10">
        <section className="pt-40 pb-28 px-6 flex flex-col items-center text-center min-h-screen">
          <motion.div style={{ y, opacity: heroOpacity }} className="flex flex-col items-center w-full max-w-5xl mx-auto">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="premium-glass-panel inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full"
              style={{ borderRadius: 999 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] dark:text-indigo-300 text-indigo-700">
                Next-Generation Academic OS
              </span>
            </motion.div>

            {/* Headline — editorial, no gradient fills on keywords */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] font-black tracking-[-0.03em] leading-[1.1] sm:leading-[0.92] mb-8 max-w-4xl"
            >
              <span className="dark:text-white text-slate-900">Study</span>{" "}
              <span className="text-white/30 font-light italic tracking-[-0.04em]">Smarter.</span>
              <br />
              <span className="dark:text-white text-slate-900">Score</span>{" "}
              <span className="relative inline-block">
                <span className="dark:text-white text-slate-900">Higher.</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.9, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ originX: 0 }}
                  className="absolute -bottom-2 left-0 right-0 h-[5px] rounded-full bg-gradient-to-r from-[#5b6ff2] via-[#9b5de5] to-[#d946ef]"
                />
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.28 }}
              className="text-base md:text-xl dark:text-slate-400 text-slate-600 max-w-2xl mb-12 font-medium leading-relaxed"
            >
              The hyper-personalized learning system built for CBSE Class 6–10 students.
              AI notes, instant photo doubt resolution, spaced recall flashcards, and live study circles — in one unified workspace.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20"
            >
              <Link
                href="/signup"
                id="cta-launch"
                className="premium-glow-border group relative inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-white text-slate-950 font-bold text-sm uppercase tracking-widest rounded-full overflow-hidden micro-hover-lift shadow-[0_0_50px_rgba(255,255,255,0.3)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Launch Workspace
                  <Rocket className="w-4.5 h-4.5 text-indigo-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </motion.div>
          </motion.div>

          {/* ── MOCK DASHBOARD PREVIEW ──────────── */}
          <motion.div
            initial={{ opacity: 0, y: 80, rotateX: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.5, type: "spring", stiffness: 55, damping: 18 }}
            style={{ perspective: 1400 }}
            className="w-full max-w-5xl relative z-20 hidden md:block"
          >
            <div className="premium-glass-panel p-4 md:p-5 shadow-2xl shadow-black/70 hover:scale-[1.01] transition-transform duration-700">
              {/* Window chrome */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5 px-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex items-center gap-2 bg-black/50 border border-white/[0.08] rounded-full px-5 py-1 text-[11px] dark:text-slate-400 text-slate-600 font-mono">
                  <Shield className="w-3 h-3 dark:text-emerald-400 text-emerald-700" />
                  app.edutrack.space/dashboard
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-bold uppercase dark:text-emerald-400 text-emerald-700 tracking-wider hidden sm:block">Live</span>
                </div>
              </div>

              {/* Dashboard interior */}
              <div className="grid md:grid-cols-12 gap-5 text-left">
                {/* Sidebar mock */}
                <div className="hidden md:flex col-span-3 flex-col gap-2 border-r border-white/[0.07] pr-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5b6ff2] to-[#9b5de5] flex items-center justify-center">
                      <Brain className="w-4.5 h-4.5 dark:text-white text-slate-900" />
                    </div>
                    <div>
                      <div className="text-xs font-black dark:text-white text-slate-900">EduTrack</div>
                      <div className="text-[9px] dark:text-indigo-400 text-indigo-700">AI Workspace</div>
                    </div>
                  </div>
                  {SIDEBAR_ITEMS.map((item, i) => (
                    <div
                      key={i}
                      className={`h-10 rounded-xl flex items-center gap-2.5 px-3 text-[11px] font-semibold ${
                        item.active
                          ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
                          : "text-slate-500 dark:text-slate-500"
                      }`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main content mock */}
                <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
                  <div className="premium-glass-panel p-5">
                    <div className="text-[9px] font-bold dark:text-indigo-400 text-indigo-700 uppercase tracking-widest">Class 10 — CBSE Space</div>
                    <div className="text-base font-black dark:text-white text-slate-900 mt-0.5">Welcome back, Scholar</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Current Level", value: "Level 4 Scholar", color: "text-accent-gradient" },
                      { label: "Cards Mastered", value: "142 Cards", color: "text-emerald-400" },
                      { label: "Class Rank", value: "#2 of Class", color: "text-amber-400" },
                    ].map((stat, i) => (
                      <div key={i} className="premium-glass-panel p-4 flex flex-col gap-1.5">
                        <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                        <span className={`text-lg font-black ${stat.color}`}>{stat.value}</span>
                        {i === 0 && (
                          <div className="w-full bg-black/40 h-1.5 rounded-full mt-1">
                            <div className="bg-gradient-to-r from-[#5b6ff2] to-[#9b5de5] h-full w-[70%] rounded-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── STATS BAR ──────────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-5xl mx-auto px-6 mb-28 relative z-20"
        >
          <div className="premium-glass-panel grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.07] overflow-hidden">
            {STATS.map((s, i) => (
              <div key={i} className="p-6 md:p-8 text-center">
                <div className="text-2xl md:text-3xl font-black dark:text-white text-slate-900 tracking-tight">{s.value}</div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── FEATURE CARDS ──────────────────────── */}
        <section className="w-full max-w-6xl mx-auto px-6 mb-32 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full premium-glass-panel mb-5" style={{ borderRadius: 999 }}>
              <GraduationCap className="w-3.5 h-3.5 dark:text-indigo-400 text-indigo-700" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] dark:text-indigo-300 text-indigo-700">Built for Serious Students</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black dark:text-white text-slate-900 tracking-tight">
              Everything you need to{" "}
              <span className="dark:text-slate-400 text-slate-600 font-light italic">excel</span>.
            </h2>
            <p className="dark:text-slate-400 text-slate-600 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              A complete learning operating system — from NCERT mastery to peer study circles, all in one place.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-3 gap-5 text-left"
          >
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="premium-glass-panel p-7 group micro-hover-lift">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                  f.color === "indigo" ? "bg-indigo-500/15 border border-indigo-500/25" :
                  f.color === "violet" ? "bg-violet-500/15 border border-violet-500/25" :
                  "bg-fuchsia-500/15 border border-fuchsia-500/25"
                }`}>
                  <f.icon className={`w-5.5 h-5.5 ${
                    f.color === "indigo" ? "text-indigo-400" :
                    f.color === "violet" ? "text-violet-400" :
                    "text-fuchsia-400"
                  }`} />
                </div>
                <h3 className="text-lg font-black mb-2.5 dark:text-white text-slate-900 tracking-tight">{f.title}</h3>
                <p className="dark:text-slate-400 text-slate-600 font-medium leading-relaxed text-sm">{f.body}</p>
                <div className="mt-5 flex items-center gap-1 dark:text-indigo-400 text-indigo-700 text-[11px] font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
                  Learn more <ChevronRight className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── CTA BANNER ─────────────────────────── */}
        <section className="px-6 pb-28 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto premium-glass-panel premium-glow-border p-10 md:p-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] mb-6" style={{ borderRadius: 999 }}>
              <Zap className="w-3.5 h-3.5 dark:text-amber-400 text-amber-700" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] dark:text-slate-300 text-slate-700">Free to Start</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black dark:text-white text-slate-900 tracking-tight mb-4 leading-tight">
              Ready to transform the way you study?
            </h2>
            <p className="dark:text-slate-400 text-slate-600 font-medium max-w-lg mx-auto mb-10 text-sm leading-relaxed">
              Join thousands of CBSE students using EduTrack to ace exams with confidence and clarity.
            </p>
            <Link
              href="/signup"
              id="cta-footer"
              className="inline-flex items-center gap-2.5 px-9 py-4 bg-white text-slate-950 font-bold text-sm uppercase tracking-widest rounded-full micro-hover-lift shadow-[0_0_50px_rgba(255,255,255,0.35)] hover:shadow-[0_0_70px_rgba(255,255,255,0.5)] transition-shadow"
            >
              Get Started Free <ArrowRight className="w-4 h-4 text-indigo-600" />
            </Link>
          </motion.div>
        </section>

        {/* ── FOOTER ─────────────────────────────── */}
        <footer className="border-t border-white/[0.06] px-6 py-8 text-center relative z-10">
          <p className="text-slate-600 text-xs font-medium">
            &copy; {new Date().getFullYear()} EduTrack. Built for Indian CBSE students.
          </p>
        </footer>
      </main>
    </div>
  );
}