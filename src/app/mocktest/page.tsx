"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Trophy, BookOpen, Clock, Play, ArrowRight, Loader2, Sparkles, CheckCircle, ShieldAlert, RotateCcw } from "lucide-react";
import Confetti from "@/components/Confetti";

interface Question {
  id: number;
  text: string;
  maxMarks: number;
  officialAnswer?: string;
}

export default function MockTestPage() {
  const [subject, setSubject] = useState<"Science" | "Mathematics" | "Social Science" | "English">("Science");
  const [grade, setGrade] = useState("10");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [maxMarks, setMaxMarks] = useState<number>(20);
  const [chapters, setChapters] = useState("");

  const [testStarted, setTestStarted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paper, setPaper] = useState<any>(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scorecard, setScorecard] = useState<any>(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (testStarted && timeLeft > 0 && !scorecard) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && testStarted && !scorecard) {
      handleSubmit(); // auto submit
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [testStarted, timeLeft, scorecard]);

  const handleStart = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/exam/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classLevel: grade,
          subject,
          maxMarks,
          difficulty,
          chapters: chapters.split(",").map(c => c.trim()).filter(Boolean),
          board: "CBSE"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate exam");
      
      setPaper(data.paper);
      setTestStarted(true);
      setTimeLeft(data.paper.durationHours * 3600);
      setAnswers({});
    } catch (err: any) {
      alert("Failed to generate exam: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (qId: number, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      const res = await fetch("/api/exam/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paper,
          studentAnswers: answers
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grade paper");
      
      setScorecard(data.evaluation);
      setConfettiActive(true);

      // Award XP
      const xpEarned = Math.round((data.evaluation.marksAwarded / data.evaluation.totalMarks) * 200);

      const localXp = localStorage.getItem("edutrack_xp");
      const currentXp = localXp ? parseInt(localXp, 10) : 0;
      localStorage.setItem("edutrack_xp", (currentXp + xpEarned).toString());

    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* HEADER */}
      <header className="relative p-6 md:p-8 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-indigo-800/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20">Exam Prep Center</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-3.5 tracking-tight flex items-center gap-3">
            CBSE AI Mock Tests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-1.5">Grade short answers against board patterns in real-time.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Link href="/dashboard" className="p-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-2xl transition-colors border border-slate-200 dark:border-white/10 shadow-sm">
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="grid gap-6">
        {!testStarted && !scorecard ? (
          /* Landing Screen */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 p-8 rounded-[2rem] text-center max-w-xl mx-auto space-y-6 shadow-xl"
          >
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
              <Clock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Configure Your Mock Exam</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed mt-1">Full-length and customized board papers generated by AI.</p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">Subject</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Science", "Mathematics", "Social Science", "English"] as const).map(sub => (
                    <button
                      key={sub}
                      onClick={() => setSubject(sub)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        subject === sub
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">Max Marks</label>
                  <select
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value={20}>20 Marks (Short Test)</option>
                    <option value={40}>40 Marks (Half Paper)</option>
                    <option value={80}>80 Marks (Full Board)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">Chapters (Optional, comma separated)</label>
                <input
                  type="text"
                  value={chapters}
                  onChange={(e) => setChapters(e.target.value)}
                  placeholder="e.g. Life Processes, Light..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={isGenerating}
              className="group flex w-full items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm uppercase tracking-wider px-10 py-4 rounded-xl hover:scale-[1.02] transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Paper...</> : <><Play className="w-5 h-5" /> Start Exam</>}
            </button>
          </motion.div>
        ) : testStarted && !scorecard && paper ? (
          /* Active Exam Paper */
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                <span className="text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-widest">Exam in Progress</span>
              </div>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm uppercase tracking-wider bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>Timer: {formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 p-6 rounded-2xl text-center space-y-2">
              <h2 className="text-xl font-black text-indigo-950 dark:text-indigo-300">{paper.title}</h2>
              <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{paper.grade} | {paper.maxMarks} Marks | {paper.durationHours} Hours</p>
            </div>

            <div className="space-y-5">
              {paper.questions.map((q: any) => (
                <div key={q.num} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 p-6 rounded-[2rem] shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/15">Question {q.num} (Section {q.section})</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-white/5">{q.marks} Marks</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">{q.text}</h3>
                  {q.options && q.options.length > 0 && (
                    <div className="space-y-1.5 pl-2 pt-2">
                      {q.options.map((opt: string, i: number) => (
                        <p key={i} className="text-sm font-medium text-slate-700 dark:text-slate-300">{opt}</p>
                      ))}
                    </div>
                  )}
                  <textarea
                    rows={q.marks > 2 ? 6 : 3}
                    value={answers[q.num] || ""}
                    onChange={(e) => handleAnswerChange(q.num, e.target.value)}
                    placeholder={q.options ? "Type your selected option here (e.g. (a) or (b))" : "Write your explanation or step-by-step methodology here..."}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-200 mt-2"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  if (confirm("Cancel test? Progress will be lost.")) {
                    setTestStarted(false);
                  }
                }}
                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-75 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting & Evaluating...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Submit Paper</>
                )}
              </button>
            </div>
          </div>
        ) : scorecard ? (
          /* Scorecard / Report Card */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Grand Summary Header */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-[#0d1512] dark:to-teal-950/40 border border-emerald-500/25 p-7 rounded-[2rem] shadow-xl text-center relative overflow-hidden">
              <div className="relative z-10 max-w-xl mx-auto space-y-4">
                <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto border border-emerald-500/35 animate-bounce">
                  <Trophy className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">CBSE Mock Test Scorecard</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">{scorecard.verdict}</p>
                </div>
                
                {/* Total Marks Gauge */}
                <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight pt-2">
                  Total Score:{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {scorecard.marksAwarded}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    /{scorecard.totalMarks}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs font-bold leading-normal px-6">
                  You gained a matching **+{Math.round((scorecard.marksAwarded / scorecard.totalMarks) * 200)} XP** addition to your profile!
                </p>
                
                {/* Overall Remarks */}
                <div className="mt-4 p-4 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-left shadow-sm">
                  <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Overall Remarks</h4>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{scorecard.overallRemarks}</p>
                </div>
              </div>
            </div>

            {/* Detailed Question Review Cards */}
            <div className="space-y-5">
              {scorecard.questionEvaluations?.map((item: any) => {
                const qRef = paper?.questions?.find((q: any) => q.num === item.num);
                return (
                  <div key={item.num} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 p-6 rounded-[2rem] shadow-sm space-y-4 text-left">
                    <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/5 pb-3">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Question {item.num} Review</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        Score: <span className="text-emerald-600 dark:text-emerald-400">{item.marksAwarded}</span>/{item.marksMax} Marks
                      </span>
                    </div>
                    
                    {qRef && (
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Question Text</h4>
                        <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">{qRef.text}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/5 p-4 rounded-xl">
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Your Answer</h4>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed italic">{answers[item.num] || "(No answer provided)"}</p>
                      </div>
                      <div className="bg-emerald-500/[0.05] border border-emerald-500/20 p-4 rounded-xl">
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">CBSE Baseline Reference</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{item.markingSchemeUsed || (qRef ? qRef.markingScheme : "")}</p>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-3 bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-200 dark:border-white/5 text-xs">
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[9px] mb-1">Evaluator Feedback</h5>
                          <p className="text-slate-700 dark:text-slate-300 font-bold leading-normal">{item.feedback}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={() => {
                  setTestStarted(false);
                  setScorecard(null);
                  setPaper(null);
                  setAnswers({});
                }}
                className="group flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-all shadow-xl shadow-indigo-600/20"
              >
                <RotateCcw className="w-4 h-4" /> Start New Test
              </button>
            </div>
          </motion.div>
        ) : null}
      </main>

      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />
    </div>
  );
}