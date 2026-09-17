"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <>
      {/* CTA Banner */}
      <section id="pricing" className="px-4 sm:px-6 pb-20 relative z-20 scroll-mt-28" aria-label="Call to action">
        <div id="about" className="sr-only" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl bg-[#0c1026]/95 backdrop-blur-3xl border border-white/15 p-8 sm:p-12 md:p-16 text-center shadow-[0_25px_60px_rgba(0,0,0,0.75)]"
        >
          {/* Subtle top glare */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Cosmic radial glow */}
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.25),transparent_70%)] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                100% Free For CBSE Students
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              Ready to transform your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                grades?
              </span>
            </h2>

            <p className="text-slate-300 max-w-lg mx-auto mb-8 text-sm sm:text-base leading-relaxed font-normal">
              Join thousands of CBSE students across India using EduTrack to learn faster, retain forever, and ace board examinations.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-sm sm:text-base rounded-full shadow-[0_0_40px_rgba(217,70,239,0.4)] hover:shadow-[0_0_60px_rgba(217,70,239,0.6)] transition-all cursor-pointer"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 text-white" />
                </motion.div>
              </Link>
            </div>

            {/* Social Trust Stat */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-[#0c1026] flex items-center justify-center text-[10px] font-bold text-white">A</div>
                <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-[#0c1026] flex items-center justify-center text-[10px] font-bold text-white">R</div>
                <div className="w-6 h-6 rounded-full bg-pink-500 border-2 border-[#0c1026] flex items-center justify-center text-[10px] font-bold text-white">S</div>
              </div>
              <span className="text-xs font-semibold text-slate-300">
                Over <strong className="text-white font-bold">50,000+</strong> students learning actively
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer bar */}
      <footer className="border-t border-white/10 px-6 py-12 text-center relative z-10 bg-[#06080f]/90">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0d20] rounded-[6px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 text-xs">E</span>
              </div>
            </div>
            <span className="text-base font-black text-white tracking-tight">EduTrack</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400">
            <Link href="/tutor" className="hover:text-white transition-colors">AI Tutor</Link>
            <Link href="/sandbox" className="hover:text-white transition-colors">Virtual Lab</Link>
            <Link href="/flashcards" className="hover:text-white transition-colors">Flashcards</Link>
            <Link href="/arena" className="hover:text-white transition-colors">PvP Arena</Link>
            <Link href="/ncert" className="hover:text-white transition-colors">NCERT Books</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>

          <p className="text-slate-500 text-xs font-medium flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for CBSE Students
          </p>
        </div>
      </footer>
    </>
  );
}
