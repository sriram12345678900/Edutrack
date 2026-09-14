"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Users,
  Gamepad2,
  Layers,
  FileText,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tool {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const TOOLS: Tool[] = [
  {
    icon: BookOpen,
    title: "NCERT Library",
    description:
      "All textbooks from Class 6–10 with built-in PDF reader, annotations, and AI-powered chapter chat.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Brain,
    title: "AI Tutor",
    description:
      "Your personal study companion. Ask anything — get clear explanations with diagrams and examples.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Users,
    title: "Study Circles",
    description:
      "Form study groups, chat in real-time, challenge friends to quiz duels, and learn together.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Gamepad2,
    title: "Games Arena",
    description:
      "Learn through play with 12+ educational mini-games covering Math, Science, and English.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Layers,
    title: "Smart Flashcards",
    description:
      "AI-generated flashcard decks with spaced repetition scheduling for long-term memory retention.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: FileText,
    title: "Exam Generator",
    description:
      "Generate practice tests matching CBSE exam patterns with instant AI-powered grading and feedback.",
    gradient: "from-indigo-500 to-blue-500",
  },
];

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
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
      className="w-full max-w-6xl mx-auto px-6 mb-32 relative z-20 scroll-mt-24"
      aria-label="Platform tools"
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="text-center mb-14"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
          <Wrench className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
            Platform Tools
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Your complete{" "}
          <span className="text-slate-500 font-light italic">toolkit</span>.
        </h2>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
          Six powerful tools designed to cover every aspect of your CBSE
          preparation.
        </p>
      </motion.div>

      {/* Bento grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        role="list"
      >
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <motion.article
              key={tool.title}
              variants={fadeUp}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="group bg-white/[0.03] backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7 cursor-default hover:border-white/[0.14] hover:shadow-xl hover:shadow-indigo-500/5 transition-[border-color,box-shadow]"
              role="listitem"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-5 shadow-lg`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                {tool.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {tool.description}
              </p>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
