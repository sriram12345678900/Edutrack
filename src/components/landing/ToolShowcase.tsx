"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Users,
  Gamepad2,
  Layers,
  FileText,
  Wrench,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tool {
  icon: LucideIcon;
  title: string;
  tag: string;
  href: string;
  description: string;
  gradient: string;
  glowColor: string;
}

const TOOLS: Tool[] = [
  {
    icon: BookOpen,
    title: "NCERT Library",
    tag: "Class 6–10",
    href: "/ncert",
    description:
      "All textbooks from Class 6–10 with built-in interactive reader, chapter notes, and AI-powered chapter chat.",
    gradient: "from-emerald-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.2)",
  },
  {
    icon: Brain,
    title: "AI Tutor",
    tag: "24/7 Available",
    href: "/tutor",
    description:
      "Your personal CBSE study companion. Ask anything — get instant step-by-step explanations with diagrams and formulas.",
    gradient: "from-violet-500 to-purple-500",
    glowColor: "rgba(168, 85, 247, 0.2)",
  },
  {
    icon: Users,
    title: "Study Circles",
    tag: "Multiplayer",
    href: "/community",
    description:
      "Form study groups, chat in real-time, challenge classmates to quiz duels, and collaborate on shared whiteboards.",
    gradient: "from-blue-500 to-cyan-500",
    glowColor: "rgba(6, 182, 212, 0.2)",
  },
  {
    icon: Gamepad2,
    title: "Games Arena",
    tag: "12+ Mini Games",
    href: "/games",
    description:
      "Gamified learning with 12+ educational mini-games covering Math speed drills, Science trivia, and vocabulary.",
    gradient: "from-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.2)",
  },
  {
    icon: Layers,
    title: "Smart Flashcards",
    tag: "Spaced Recall",
    href: "/flashcards",
    description:
      "AI-generated flashcard decks with Leitner spaced repetition scheduling for 98% long-term memory retention.",
    gradient: "from-pink-500 to-rose-500",
    glowColor: "rgba(244, 63, 94, 0.2)",
  },
  {
    icon: FileText,
    title: "Exam Generator",
    tag: "CBSE Blueprint",
    href: "/dashboard",
    description:
      "Generate timed practice tests matching official CBSE exam patterns with instant AI-powered grading and feedback.",
    gradient: "from-indigo-500 to-blue-500",
    glowColor: "rgba(99, 102, 241, 0.2)",
  },
];

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
};

export default function ToolShowcase() {
  return (
    <section
      id="tools"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-32 relative z-20 scroll-mt-28"
      aria-label="Platform tools"
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="text-center mb-12 sm:mb-14"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-5 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <Wrench className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300">
            Platform Arsenal
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Your complete{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            toolkit
          </span>.
        </h2>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Six powerful tools designed to cover every single aspect of your CBSE board examination preparation.
        </p>
      </motion.div>

      {/* Bento grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        role="list"
      >
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <motion.article
              key={tool.title}
              variants={fadeUp}
              whileHover={{ scale: 1.02, y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="h-full"
              role="listitem"
            >
              <Link href={tool.href} className="h-full block">
                <div
                  className="group relative h-full bg-[#0c1024]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 flex flex-col justify-between hover:border-white/20 hover:bg-[#0e1430]/95 transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.5)] overflow-hidden"
                  style={{
                    boxShadow: `0 15px 35px -10px ${tool.glowColor}`
                  }}
                >
                  {/* Top subtle glare */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  {/* Corner tag */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-bold text-slate-300 group-hover:text-white group-hover:border-white/20 transition-colors">
                      {tool.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight mb-2 group-hover:text-indigo-200 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                      {tool.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-auto flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
