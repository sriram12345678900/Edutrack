"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitFork, ChevronDown, ChevronUp, ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { getCrossSubjectConnections } from "@/lib/cross-subject-map";

interface CrossSubjectPanelProps {
  chapterSlug: string;
}

export default function CrossSubjectPanel({ chapterSlug }: CrossSubjectPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const connections = getCrossSubjectConnections(chapterSlug);

  if (!connections || connections.length === 0) return null;

  return (
    <div className="my-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 p-4 backdrop-blur-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Multidisciplinary Subject Connections
              </h4>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {connections.length} Connected Links
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Discover how this topic connects directly to other subjects in your CBSE syllabus.
            </p>
          </div>
        </div>

        <div className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3 pt-3 border-t border-indigo-500/15"
          >
            {connections.map((conn, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/40 dark:bg-black/20 border border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{conn.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                        {conn.targetSubject} • {conn.targetChapter}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {conn.relationshipTitle}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {conn.synopsis}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/learn/${conn.targetSubject.toLowerCase().includes("math") ? "mathematics" : "science"}/${conn.targetSlug}`}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 self-end sm:self-center transition-all shadow-sm"
                >
                  <span>Explore Link</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
