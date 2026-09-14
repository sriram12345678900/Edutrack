"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

export default function Footer() {
  return (
    <>
      {/* CTA Banner */}
      <section className="px-6 pb-20 relative z-20" aria-label="Call to action">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto relative overflow-hidden rounded-2xl border border-white/[0.08] p-10 md:p-16 text-center"
        >
          {/* Gradient background layers */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-fuchsia-600/20 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-fuchsia-500/5 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] mb-6">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                100% Free
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              Ready to transform your grades?
            </h2>
            <p className="text-slate-400 font-medium max-w-lg mx-auto mb-10 text-sm leading-relaxed">
              Join thousands of CBSE students using EduTrack to study smarter,
              score higher, and actually enjoy learning.
            </p>
            <Link href="/signup">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex items-center gap-2.5 px-9 py-4 bg-white text-zinc-950 font-bold text-sm rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-shadow cursor-pointer"
              >
                Get Started Free{" "}
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer bar */}
      <footer className="border-t border-white/[0.06] px-6 py-8 text-center relative z-10">
        <p className="text-slate-600 text-xs font-medium">
          &copy; {new Date().getFullYear()} EduTrack. Built for Indian CBSE
          students.
        </p>
      </footer>
    </>
  );
}
