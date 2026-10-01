"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, 
  HelpCircle, Trophy, RotateCcw, ShieldCheck, ChevronRight, Award, 
  Loader2, Zap, Brain, ArrowLeft, Target, Check, X
} from "lucide-react";
import Link from "next/link";
import Confetti from "@/components/Confetti";
import { awardUserXP } from "@/lib/xp";
import { AUTHENTIC_CASE_STUDIES, CBSECaseStudy, CaseStudyQuestion } from "@/lib/competency-data";
import { cn } from "@/lib/utils";

export default function CompetencyAssessmentPage() {
  const [studies, setStudies] = useState<CBSECaseStudy[]>(AUTHENTIC_CASE_STUDIES);
  const [selectedStudy, setSelectedStudy] = useState<CBSECaseStudy>(AUTHENTIC_CASE_STUDIES[0]);
  const [activeSubject, setActiveSubject] = useState<string>("All");
  
  // Quiz interaction state
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState<{ earned: number; total: number } | null>(null);

  // AI Generator modal state
  const [customSubject, setCustomSubject] = useState("Science");
  const [customChapter, setCustomChapter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const filteredStudies = studies.filter(s => activeSubject === "All" || s.subject === activeSubject);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitCaseStudy = () => {
    let earned = 0;
    let total = 0;
    selectedStudy.questions.forEach(q => {
      total += q.marks;
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        earned += q.marks;
      }
    });

    setScore({ earned, total });
    setSubmitted(true);
    if (earned > 0) {
      awardUserXP(earned * 25);
    }
    if (earned === total) {
      setShowConfetti(true);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(null);
    setShowConfetti(false);
  };

  const handleGenerateCustom = async () => {
    if (!customChapter.trim()) return;
    setIsGenerating(true);
    setGenError("");

    try {
      const res = await fetch("/api/competency/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: customSubject,
          grade: "Class 10",
          chapter: customChapter.trim()
        })
      });

      if (!res.ok) throw new Error("Failed to generate case study");
      const newStudy: CBSECaseStudy = await res.json();
      setStudies(prev => [newStudy, ...prev]);
      setSelectedStudy(newStudy);
      handleReset();
      setCustomChapter("");
    } catch (e: any) {
      setGenError(e.message || "Failed to generate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" /> NEP 2020 & CBSE Competency Framework
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Case-Study & Assertion-Reason Lab
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Master Section E Case-Based Questions and Section A Assertion-Reasoning that constitute 50% of the modern CBSE Board Exam blueprint.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters & AI Generator Bar */}
        <div className="mt-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["All", "Science", "Mathematics"].map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSubject(sub)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border",
                  activeSubject === sub
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/25"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* AI Generator Input */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl">
            <select
              value={customSubject}
              onChange={e => setCustomSubject(e.target.value)}
              className="bg-slate-950 text-xs text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="Science">Science</option>
              <option value="Mathematics">Mathematics</option>
            </select>
            <input
              type="text"
              placeholder="e.g. Life Processes, Triangles..."
              value={customChapter}
              onChange={e => setCustomChapter(e.target.value)}
              className="bg-slate-950 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 w-44 md:w-56"
            />
            <button
              onClick={handleGenerateCustom}
              disabled={isGenerating || !customChapter.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 transition active:scale-95"
            >
              {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {isGenerating ? "Synthesizing..." : "Generate AI Case"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: List of Case Studies */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Available Modules ({filteredStudies.length})
          </div>
          {filteredStudies.map(study => {
            const isSelected = selectedStudy.id === study.id;
            return (
              <button
                key={study.id}
                onClick={() => {
                  setSelectedStudy(study);
                  handleReset();
                }}
                className={cn(
                  "text-left p-4 rounded-2xl border transition-all relative overflow-hidden",
                  isSelected
                    ? "bg-slate-850 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50"
                    : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700"
                )}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-400 mb-1.5">
                  <span>{study.subject} • {study.grade}</span>
                  <span className="text-slate-500">{study.questions.length} Questions</span>
                </div>
                <h4 className="font-semibold text-sm text-slate-100 line-clamp-1">{study.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{study.realWorldContext}</p>
              </button>
            );
          })}
        </div>

        {/* Right Column: Case Study Interactive Workspace */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-6 md:p-8 backdrop-blur-md shadow-2xl">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {selectedStudy.chapter}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                  {selectedStudy.title}
                </h2>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-purple-400" />
                  <span>Real-World Context: {selectedStudy.realWorldContext}</span>
                </div>
              </div>

              {score && (
                <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-bold text-indigo-200">
                    Score: {score.earned} / {score.total} Marks
                  </span>
                </div>
              )}
            </div>

            {/* Scenario Story Box */}
            <div className="mt-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 p-5 md:p-6 text-sm text-slate-300 leading-relaxed space-y-3 font-normal">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Case Scenario Text
              </div>
              <p className="whitespace-pre-line text-slate-200">{selectedStudy.scenarioText}</p>
            </div>

            {/* Questions List */}
            <div className="mt-8 space-y-8">
              {selectedStudy.questions.map((q, idx) => {
                const userChoice = selectedAnswers[q.id];
                const isCorrect = submitted && userChoice === q.correctOptionIndex;

                return (
                  <div key={q.id} className="pt-6 border-t border-slate-800/70">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-300 text-xs font-bold">
                          Q{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          {q.type === "assertion_reason" ? "Assertion & Reasoning" : "Competency Assessment"}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        [{q.marks} Mark{q.marks > 1 ? "s" : ""}]
                      </span>
                    </div>

                    <div className="text-base font-medium text-slate-100 mb-4">{q.question}</div>

                    {/* Assertion-Reason Visual Card if applicable */}
                    {q.type === "assertion_reason" && q.assertion && q.reason && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block mb-1">
                            Assertion (A)
                          </span>
                          <span className="text-xs text-slate-200">{q.assertion}</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                            Reason (R)
                          </span>
                          <span className="text-xs text-slate-200">{q.reason}</span>
                        </div>
                      </div>
                    )}

                    {/* Options */}
                    {q.options && (
                      <div className="grid grid-cols-1 gap-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userChoice === optIdx;
                          let btnStyle = "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700";

                          if (submitted) {
                            if (optIdx === q.correctOptionIndex) {
                              btnStyle = "bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-semibold";
                            } else if (isSelected && optIdx !== q.correctOptionIndex) {
                              btnStyle = "bg-rose-500/15 border-rose-500/50 text-rose-200 line-through";
                            }
                          } else if (isSelected) {
                            btnStyle = "bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold shadow-md shadow-indigo-600/10";
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={submitted}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={cn(
                                "text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between",
                                btnStyle
                              )}
                            >
                              <span>{opt}</span>
                              {submitted && optIdx === q.correctOptionIndex && (
                                <Check className="h-4 w-4 text-emerald-400 shrink-0 ml-2" />
                              )}
                              {submitted && isSelected && optIdx !== q.correctOptionIndex && (
                                <X className="h-4 w-4 text-rose-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation & Marking Scheme Reveal */}
                    {submitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 space-y-1.5"
                      >
                        <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Official CBSE Marking Scheme
                        </div>
                        <p className="text-slate-300 leading-relaxed">{q.stepExplanation}</p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
              {submitted ? (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  <RotateCcw className="h-4 w-4" /> Try Again
                </button>
              ) : (
                <button
                  onClick={handleSubmitCaseStudy}
                  disabled={Object.keys(selectedAnswers).length === 0}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 disabled:opacity-50 transition active:scale-95 ml-auto"
                >
                  Submit & Check Marking Scheme
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
