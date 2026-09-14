"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Rocket, Play } from "lucide-react";

const wordVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: 0.15 + i * 0.08,
      duration: 0.4,
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  }),
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-6 overflow-hidden"
      aria-label="Hero"
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto"
      >
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
            Next-Generation Learning OS
          </span>
        </motion.div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.03em] leading-[1.05] mb-8">
          {["Study", "Smarter."].map((word, i) => (
            <motion.span
              key={`l1-${i}`}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className={
                i === 1
                  ? "text-slate-500 font-light italic ml-2 sm:ml-3"
                  : "text-white"
              }
            >
              {word}
              {i === 0 ? " " : ""}
            </motion.span>
          ))}
          <br />
          {["Score", "Higher."].map((word, i) => (
            <motion.span
              key={`l2-${i}`}
              custom={i + 2}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className={
                i === 1 ? "relative inline-block text-white" : "text-white"
              }
            >
              {word}
              {i === 0 ? " " : ""}
              {i === 1 && (
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    delay: 0.8,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ originX: 0 }}
                  className="absolute -bottom-2 left-0 right-0 h-[4px] rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
                />
              )}
            </motion.span>
          ))}
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="text-base md:text-lg text-slate-400 max-w-2xl mb-12 font-medium leading-relaxed"
        >
          The AI-powered learning platform built for CBSE Class 6–10 students.
          Personalized notes, instant doubt solving, smart flashcards, and live
          study circles — all in one place.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.55 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/signup">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white text-zinc-950 font-bold text-sm rounded-full shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] transition-shadow cursor-pointer"
            >
              <Rocket className="w-4 h-4 text-indigo-600" />
              Start Learning Free
            </motion.div>
          </Link>
          <Link href="/formulas">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white/[0.05] text-white font-semibold text-sm rounded-full border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              Explore Formulas
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
