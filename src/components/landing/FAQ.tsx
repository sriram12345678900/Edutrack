"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "Is EduTrack free to use?",
    a: "Yes! EduTrack is completely free for all CBSE students. All core features — AI tutoring, NCERT library, flashcards, games, and study circles — are available at no cost.",
  },
  {
    q: "Which classes and boards does EduTrack support?",
    a: "EduTrack is built specifically for CBSE Class 6 to Class 10 students. Our entire content library, question banks, and AI models are fine-tuned for the CBSE/NCERT curriculum.",
  },
  {
    q: "How does the AI Tutor work?",
    a: "Our AI Tutor uses advanced language models to explain concepts step-by-step. You can type questions, paste text, or even snap a photo of a problem — the tutor will break it down clearly with examples and diagrams.",
  },
  {
    q: "Can I study with my friends on EduTrack?",
    a: "Absolutely! Study Circles let you create private groups, chat in real-time, share notes, challenge each other to quiz duels, and even collaborate on a shared whiteboard.",
  },
  {
    q: "Is my data safe and private?",
    a: "Yes. EduTrack uses Firebase for secure authentication and encrypted data storage. We never share your personal information with third parties, and you can delete your account and data at any time.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="w-full max-w-3xl mx-auto px-4 sm:px-6 mb-32 relative z-20 scroll-mt-28"
      aria-label="Frequently asked questions"
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
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300">
            Got Questions?
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Common{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            questions
          </span>.
        </h2>
      </motion.div>

      {/* Accordion */}
      <div className="flex flex-col gap-3.5">
        {FAQS.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-[#0c1026]/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left group transition-colors hover:bg-white/[0.02]"
              aria-expanded={open === i}
              aria-controls={`faq-answer-${i}`}
            >
              <span className="text-sm md:text-base font-bold text-white pr-4 group-hover:text-indigo-200 transition-colors">
                {faq.q}
              </span>
              <motion.div
                animate={{ rotate: open === i ? 180 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="shrink-0 w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:border-indigo-400/40"
              >
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  id={`faq-answer-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                  role="region"
                  aria-label={faq.q}
                >
                  <div className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-white/[0.08] pt-4 font-normal">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
