"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  { value: 50000, suffix: "+", label: "Active Students", format: "k" as const },
  { value: 98, suffix: "%", label: "Exam Satisfaction", format: "n" as const },
  { value: 6, suffix: "–10", label: "CBSE Classes", format: "n" as const },
  { value: 12, suffix: "+", label: "AI-Powered Tools", format: "n" as const },
];

function AnimatedNumber({
  target,
  suffix,
  format,
  inView,
}: {
  target: number;
  suffix: string;
  format: "k" | "n";
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 1500;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [inView, target]);

  const display = format === "k" ? `${Math.floor(count / 1000)}K` : `${count}`;

  return (
    <span className="text-3xl md:text-4xl font-black text-white tracking-tight tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-5xl mx-auto px-6 mb-28 relative z-20"
      aria-label="Platform statistics"
    >
      <div className="bg-white/[0.03] backdrop-blur-lg border border-white/[0.07] rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06] overflow-hidden">
        {STATS.map((s, i) => (
          <div
            key={i}
            className="p-6 md:p-8 text-center flex flex-col items-center gap-1.5"
          >
            <AnimatedNumber
              target={s.value}
              suffix={s.suffix}
              format={s.format}
              inView={inView}
            />
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
