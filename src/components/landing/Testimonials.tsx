"use client";

import { motion } from "framer-motion";
import { Star, Quote, CheckCircle2, Award, Sparkles, TrendingUp } from "lucide-react";

interface Testimonial {
  name: string;
  grade: string;
  school: string;
  scoreBadge: string;
  scoreColor: string;
  avatarInitial: string;
  avatarGradient: string;
  comment: string;
  featureUsed: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aarav Sharma",
    grade: "Class 10 CBSE",
    school: "Delhi Public School, R.K. Puram",
    scoreBadge: "98.4% Boards",
    scoreColor: "from-emerald-400 to-teal-500",
    avatarInitial: "A",
    avatarGradient: "from-indigo-500 to-cyan-500",
    comment:
      "The AI Tutor is like having a CBSE national topper sitting next to you 24/7. When I was stuck on balancing redox reactions and ray diagrams at 1 AM before pre-boards, it explained each step with diagrams in seconds.",
    featureUsed: "AI Instant Tutor",
  },
  {
    name: "Priya Patel",
    grade: "Class 10 CBSE",
    school: "Kendriya Vidyalaya, Bengaluru",
    scoreBadge: "97.6% Science",
    scoreColor: "from-cyan-400 to-blue-500",
    avatarInitial: "P",
    avatarGradient: "from-purple-500 to-pink-500",
    comment:
      "The Leitner Flashcard system completely eliminated my exam anxiety. Instead of cramming 15 chapters of biology and SST in the last week, the 5-box algorithm scheduled daily 10-minute reviews that locked concepts into my long-term memory.",
    featureUsed: "Spaced Recall Flashcards",
  },
  {
    name: "Kabir Verma",
    grade: "Class 9 CBSE",
    school: "DAV Public School, Mumbai",
    scoreBadge: "Math: 62 ➔ 95 Jump!",
    scoreColor: "from-amber-400 to-orange-500",
    avatarInitial: "K",
    avatarGradient: "from-emerald-500 to-teal-500",
    comment:
      "I used to struggle with polynomial factorisation and Heron's formula. The step-by-step breakdown and the multiplayer quiz duels made practicing math addictive. My marks jumped by more than 30 points in the final term!",
    featureUsed: "Multiplayer Arena & Solver",
  },
  {
    name: "Ananya Deshmukh",
    grade: "Class 10 CBSE",
    school: "The Heritage School, Kolkata",
    scoreBadge: "96.8% Overall",
    scoreColor: "from-pink-400 to-rose-500",
    avatarInitial: "A",
    avatarGradient: "from-blue-500 to-indigo-600",
    comment:
      "The Virtual Lab allowed me to play with Ohm's Law and concave lenses before our school practical exam. Actually seeing the electric current and light rays react to sliders gave me intuition no textbook ever could.",
    featureUsed: "3D Virtual Lab",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-32 relative z-20 scroll-mt-28"
      aria-label="Student Testimonials"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="text-center mb-12 sm:mb-14"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 mb-5 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <Award className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-300">
            Real Student Results
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Loved by CBSE{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
            Toppers
          </span>.
        </h2>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Discover how students across India achieved top CBSE board scores and transformed their daily study habits.
        </p>
      </motion.div>

      {/* Testimonials 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-12">
        {TESTIMONIALS.map((t, idx) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className="group relative bg-[#0c1026]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-purple-500/40 hover:bg-[#0e1430] transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.5)]"
          >
            {/* Top subtle glare */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

            <div>
              {/* Header: Student Info + Score Badge */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center text-white font-black text-base shadow-md group-hover:scale-105 transition-transform`}
                  >
                    {t.avatarInitial}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm sm:text-base font-bold text-white">{t.name}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-400">{t.grade} • {t.school}</p>
                  </div>
                </div>

                {/* Score Badge */}
                <div
                  className={`px-3 py-1 rounded-full text-xs font-black text-white bg-gradient-to-r ${t.scoreColor} shadow-md shrink-0`}
                >
                  {t.scoreBadge}
                </div>
              </div>

              {/* 5-Star Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                ))}
              </div>

              {/* Comment text */}
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal mb-6">
                &quot;{t.comment}&quot;
              </p>
            </div>

            {/* Footer Tag */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Key Tool: <strong className="text-white">{t.featureUsed}</strong>
              </span>
              <span className="text-emerald-400 font-bold">Verified Student</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Aggregate Trust Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-5 sm:p-6 flex flex-wrap items-center justify-around gap-6 text-center"
      >
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-amber-400 font-black text-xl sm:text-2xl">
            <span>4.9</span>
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 mt-0.5">Average Student Rating</span>
        </div>

        <div className="h-8 w-px bg-white/10 hidden sm:block" />

        <div className="flex flex-col items-center">
          <span className="font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            50,000+
          </span>
          <span className="text-[11px] font-semibold text-slate-400 mt-0.5">Active CBSE Learners</span>
        </div>

        <div className="h-8 w-px bg-white/10 hidden sm:block" />

        <div className="flex flex-col items-center">
          <span className="font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
            98.2%
          </span>
          <span className="text-[11px] font-semibold text-slate-400 mt-0.5">Board Examination Pass Rate</span>
        </div>
      </motion.div>
    </section>
  );
}
