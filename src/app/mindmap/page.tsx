"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  GitFork, Sparkles, CheckCircle2, Lock, Unlock, 
  ChevronRight, Brain, BookOpen, Compass, Award, Trophy,
  RotateCcw, Check, X, ArrowRight, HelpCircle, Layers
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "@/components/Confetti";
import { 
  MINDMAP_CHAPTERS, 
  ConceptNode, 
  getMasteredNodeIds, 
  unlockNodeMastery 
} from "@/lib/mindmap-data";

export default function MindmapPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("Science");
  const [selectedChapterTitle, setSelectedChapterTitle] = useState<string>(MINDMAP_CHAPTERS[0].chapter);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [activeNode, setActiveNode] = useState<ConceptNode | null>(null);
  
  // Micro Quiz state
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    setMasteredIds(getMasteredNodeIds());
    const handler = () => setMasteredIds(getMasteredNodeIds());
    window.addEventListener("edutrack_mindmap_updated", handler);
    return () => window.removeEventListener("edutrack_mindmap_updated", handler);
  }, []);

  const currentChapterData = useMemo(() => {
    return MINDMAP_CHAPTERS.find(c => c.chapter === selectedChapterTitle) || MINDMAP_CHAPTERS[0];
  }, [selectedChapterTitle]);

  const nodes = currentChapterData.nodes;

  // Set default active node on chapter change
  useEffect(() => {
    if (nodes.length > 0) {
      setActiveNode(nodes[0]);
      setQuizSelectedOption(null);
      setQuizSubmitted(false);
    }
  }, [currentChapterData, nodes]);

  const isNodeLocked = (node: ConceptNode): boolean => {
    if (node.prerequisites.length === 0) return false;
    // Locked if ANY prerequisite is not mastered
    return !node.prerequisites.every(preId => masteredIds.includes(preId));
  };

  const isNodeMastered = (nodeId: string): boolean => {
    return masteredIds.includes(nodeId);
  };

  const handleSelectNode = (node: ConceptNode) => {
    setActiveNode(node);
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
  };

  const handleQuizSubmit = () => {
    if (!quizSelectedOption || !activeNode) return;
    setQuizSubmitted(true);

    if (quizSelectedOption === activeNode.quiz.correctAnswer) {
      if (!isNodeMastered(activeNode.id)) {
        unlockNodeMastery(activeNode.id);
        setMasteredIds(getMasteredNodeIds());
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 3000);
      }
    }
  };

  const chapterMasteredCount = nodes.filter(n => isNodeMastered(n.id)).length;
  const chapterProgressPercent = Math.round((chapterMasteredCount / nodes.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8">
      <Confetti active={confettiActive} />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-black tracking-wider uppercase mb-2">
              <GitFork className="w-3.5 h-3.5" /> Concept Knowledge Graph • Mind Maps
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight dark:text-white text-slate-900">
              Interactive Concept Mind Maps
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Visualize prerequisite concept flows, unlock nodes via micro-challenges, and master chapter foundations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mastery Progress</span>
                <span className="text-sm font-black text-emerald-500">{chapterMasteredCount} / {nodes.length} Nodes</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center font-black text-xs text-emerald-500">
                {chapterProgressPercent}%
              </div>
            </div>
          </div>
        </div>

        {/* Chapter Selection Bar */}
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-2">
          {MINDMAP_CHAPTERS.map((chap) => (
            <button
              key={chap.chapter}
              onClick={() => setSelectedChapterTitle(chap.chapter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                selectedChapterTitle === chap.chapter
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              {chap.chapter} ({chap.subject})
            </button>
          ))}
        </div>

        {/* Main Grid: Mindmap Canvas (7 cols) + Concept Inspector (5 cols) */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Canvas Panel */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden min-h-[520px] flex flex-col justify-between">
              {/* Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3 z-10 relative">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-emerald-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Mastered
                  </span>
                  <span className="flex items-center gap-1.5 text-indigo-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" /> In Progress
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Locked
                  </span>
                </div>
                <span>Click any node to inspect & quiz</span>
              </div>

              {/* Visual Node Graph Container */}
              <div className="relative flex-1 w-full h-[420px] mt-4">
                {/* SVG Connections Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  {nodes.map(node => {
                    return node.prerequisites.map(preId => {
                      const preNode = nodes.find(n => n.id === preId);
                      if (!preNode) return null;
                      const isBothMastered = isNodeMastered(node.id) && isNodeMastered(preId);

                      return (
                        <line
                          key={`${preId}-${node.id}`}
                          x1={`${preNode.x}%`}
                          y1={`${preNode.y}%`}
                          x2={`${node.x}%`}
                          y2={`${node.y}%`}
                          stroke={isBothMastered ? "#10b981" : "url(#lineGrad)"}
                          strokeWidth={isBothMastered ? "3" : "2"}
                          strokeDasharray={isBothMastered ? "none" : "5,5"}
                          opacity={isBothMastered ? 0.9 : 0.5}
                        />
                      );
                    });
                  })}
                </svg>

                {/* Nodes */}
                {nodes.map(node => {
                  const locked = isNodeLocked(node);
                  const mastered = isNodeMastered(node.id);
                  const isSelected = activeNode?.id === node.id;

                  return (
                    <motion.div
                      key={node.id}
                      style={{
                        position: "absolute",
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        transform: "translate(-50%, -50%)"
                      }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSelectNode(node)}
                      className={`cursor-pointer z-10 transition-all rounded-2xl p-3 shadow-lg border flex items-center gap-2.5 max-w-[200px] ${
                        isSelected
                          ? "ring-4 ring-indigo-500/40 bg-white dark:bg-slate-800 border-indigo-500"
                          : mastered
                          ? "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-500"
                          : locked
                          ? "bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 opacity-60"
                          : "bg-white dark:bg-slate-800 border-indigo-500/30 hover:border-indigo-500"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        mastered
                          ? "bg-emerald-500 text-white"
                          : locked
                          ? "bg-slate-200 dark:bg-slate-700 text-slate-400"
                          : "bg-indigo-600 text-white"
                      }`}>
                        {mastered ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : locked ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="overflow-hidden">
                        <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">
                          Tier {node.tier}
                        </span>
                        <h4 className="text-xs font-bold leading-tight line-clamp-2 text-slate-800 dark:text-slate-100">
                          {node.title}
                        </h4>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Tip */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>💡 Solid lines connect prerequisite concepts in logical learning sequence</span>
                <span className="text-indigo-400 font-bold">Class 10 CBSE Syllabus</span>
              </div>
            </div>
          </div>

          {/* Right Inspector & Micro-Quiz Panel */}
          <div className="lg:col-span-5 space-y-4">
            {activeNode ? (
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
              >
                {/* Node Title & Status Badge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      Tier {activeNode.tier} Concept
                    </span>
                    {isNodeMastered(activeNode.id) ? (
                      <span className="text-xs font-black text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mastered (+50 XP)
                      </span>
                    ) : isNodeLocked(activeNode) ? (
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                        <Lock className="w-3.5 h-3.5" /> Prerequisite Required
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                        <Sparkles className="w-3.5 h-3.5" /> Ready for Quiz
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {activeNode.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {activeNode.description}
                  </p>
                </div>

                {/* Key Points */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Core Board Principles:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {activeNode.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Formula Highlight if present */}
                {activeNode.formula && (
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                    <span className="text-[10px] font-black uppercase text-indigo-400 block mb-1">Key Formula:</span>
                    <code className="font-mono font-bold text-indigo-600 dark:text-indigo-300">{activeNode.formula}</code>
                  </div>
                )}

                {/* Micro Quiz Challenge */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" /> Mastery Challenge
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold">Answer correctly to master</span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {activeNode.quiz.question}
                  </p>

                  <div className="space-y-2">
                    {activeNode.quiz.options.map((opt, idx) => {
                      const isCorrect = opt === activeNode.quiz.correctAnswer;
                      const isSelected = quizSelectedOption === opt;

                      let btnStyle = "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100";
                      if (quizSubmitted) {
                        if (isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold";
                        else if (isSelected && !isCorrect) btnStyle = "bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-300";
                      } else if (isSelected) {
                        btnStyle = "bg-indigo-600 text-white border-indigo-600 font-bold";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={quizSubmitted}
                          onClick={() => setQuizSelectedOption(opt)}
                          className={`w-full text-left p-3 rounded-xl text-xs border transition-all ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={!quizSelectedOption}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Submit & Verify Mastery
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-1">
                      <div className={`p-3 rounded-xl text-xs ${
                        quizSelectedOption === activeNode.quiz.correctAnswer
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                          : "bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300"
                      }`}>
                        <strong>{quizSelectedOption === activeNode.quiz.correctAnswer ? "🎉 Correct!" : "⚠️ Needs Review:"}</strong>{" "}
                        {activeNode.quiz.explanation}
                      </div>

                      <button
                        onClick={() => {
                          setQuizSelectedOption(null);
                          setQuizSubmitted(false);
                        }}
                        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold transition-all"
                      >
                        Try Again
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                Select a concept node to view explanation and micro-quiz
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
