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
  const [subject, setSubject] = useState<"Science" | "Mathematics">("Science");
  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scorecard, setScorecard] = useState<any[] | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Subject Questions Bank
  const questionsBank = {
    Science: [
      { id: 1, text: "State the laws of refraction of light. Define refractive index.", maxMarks: 5, officialAnswer: "1. The incident ray, the refracted ray and the normal at the point of incidence, all lie in the same plane. 2. The ratio of sine of angle of incidence to the sine of angle of refraction is a constant (Snell's Law). Refractive index is the ratio of speed of light in vacuum to speed of light in medium." },
      { id: 2, text: "Explain why is respiration considered an exothermic reaction?", maxMarks: 3, officialAnswer: "Respiration is considered an exothermic reaction because glucose combines with oxygen in our body cells to produce carbon dioxide, water, and energy is released in the form of heat/ATP." },
      { id: 3, text: "Write the balanced chemical equation for the reaction of iron with steam. Identify the type of reaction.", maxMarks: 2, officialAnswer: "3Fe(s) + 4H2O(g) -> Fe3O4(s) + 4H2(g). This is a metal-steam reaction resulting in oxidation of iron (or a redox/displacement reaction)." }
    ],
    Mathematics: [
      { id: 1, text: "Find the roots of the quadratic equation: 2x² - 5x + 3 = 0 using factorization method.", maxMarks: 3, officialAnswer: "2x² - 3x - 2x + 3 = 0 -> x(2x - 3) - 1(2x - 3) = 0 -> (x-1)(2x-3) = 0 -> Roots are x = 1 and x = 1.5." },
      { id: 2, text: "State and prove Basic Proportionality Theorem (BPT/Thales Theorem) briefly.", maxMarks: 5, officialAnswer: "BPT: If a line is drawn parallel to one side of a triangle intersecting the other two sides, then it divides the two sides in the same ratio. Proof involves area ratios of triangles sharing heights." },
      { id: 3, text: "Find the HCF and LCM of 96 and 404 using prime factorization method.", maxMarks: 2, officialAnswer: "96 = 2^5 * 3, 404 = 2^2 * 101. HCF = 2^2 = 4. LCM = 2^5 * 3 * 101 = 9696." }
    ]
  };

  const activeQuestions = questionsBank[subject];

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

  const handleStart = () => {
    setTestStarted(true);
    setTimeLeft(600);
    setAnswers({});
    setScorecard(null);
  };

  const handleAnswerChange = (qId: number, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      const evaluationPromises = activeQuestions.map(async (q) => {
        const studentAns = answers[q.id] || "";
        const res = await fetch("/api/pyq-evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q.text,
            maxMarks: q.maxMarks,
            officialAnswer: q.officialAnswer,
            textAnswer: studentAns
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to grade question");
        
        return {
          questionId: q.id,
          questionText: q.text,
          maxMarks: q.maxMarks,
          studentAnswer: studentAns,
          marksGained: data.marksGained ?? 0,
          errors: data.errors ?? "None",
          improvements: data.improvements ?? "",
          feedback: data.feedback ?? ""
        };
      });

      const results = await Promise.all(evaluationPromises);
      setScorecard(results);
      setConfettiActive(true);

      // Award XP
      const totalGained = results.reduce((sum, item) => sum + item.marksGained, 0);
      const totalPossible = results.reduce((sum, item) => sum + item.maxMarks, 0);
      const xpEarned = Math.round((totalGained / totalPossible) * 200);

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
      <header className="relative p-6 md:p-8 rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-955 border border-indigo-800/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-550/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20">Exam Prep Center</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-3.5 tracking-tight flex items-center gap-3">
            CBSE AI Mock Tests
          </h1>
          <p className="text-slate-400 font-medium text-xs mt-1.5">Grade short answers against board patterns in real-time.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Link href="/dashboard" className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors border border-white/10">
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
            className="bg-white/60 dark:bg-[#040612]/60 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-8 rounded-[2rem] text-center max-w-xl mx-auto space-y-6 shadow-xl"
          >
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
              <Clock className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Configure Your Mock Exam</h2>
              <p className="text-slate-500 dark:text-slate-455 text-xs font-bold leading-relaxed mt-1">10-minute short test. 3 board questions graded by Gemini.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#050812]/50 border border-white/5 rounded-2xl max-w-sm mx-auto">
              {(["Science", "Mathematics"] as const).map(sub => (
                <button
                  key={sub}
                  onClick={() => setSubject(sub)}
                  className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    subject === sub
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white bg-transparent"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-650 text-white font-extrabold text-sm uppercase tracking-wider px-10 py-4.5 rounded-full hover:scale-105 transition-all shadow-xl shadow-indigo-500/20 border border-white/10 mx-auto"
            >
              Start Exam <Play className="w-4 h-4" />
            </button>
          </motion.div>
        ) : testStarted && !scorecard ? (
          /* Active Exam Paper */
          <div className="space-y-6">
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                <span className="text-xs font-black text-red-400 uppercase tracking-widest">Exam in Progress</span>
              </div>
              <div className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-wider bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Timer: {formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="space-y-5">
              {activeQuestions.map((q, idx) => (
                <div key={q.id} className="bg-white/60 dark:bg-[#040612]/60 border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-indigo-650 dark:text-indigo-455 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/15">Question {idx + 1}</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-white/5">{q.maxMarks} Marks</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">{q.text}</h3>
                  <textarea
                    rows={4}
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Write your explanation or step-by-step methodology here..."
                    className="w-full bg-[#050813]/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500 text-slate-900 dark:text-slate-200"
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
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-75 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-xl border border-white/10 transition-colors shadow-lg shadow-indigo-600/10"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting & Evaluating...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Submit Paper</>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Scorecard / Report Card */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Grand Summary Header */}
            <div className="bg-gradient-to-r from-emerald-500/5 via-[#0d1512] to-teal-500/5 border border-emerald-500/25 p-7 rounded-[2rem] shadow-xl text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#10b9811c,transparent_50%)]" />
              <div className="relative z-10 max-w-xl mx-auto space-y-4">
                <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto border border-emerald-500/35 animate-bounce">
                  <Trophy className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">CBSE Mock Test Scorecard</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">AI Evaluator Graded Report Card</p>
                </div>
                
                {/* Total Marks Gauge */}
                <div className="text-4xl font-black text-white tracking-tight pt-2">
                  Total Score:{" "}
                  <span className="text-emerald-400">
                    {scorecard?.reduce((sum, item) => sum + item.marksGained, 0)}
                  </span>
                  <span className="text-slate-600">
                    /{scorecard?.reduce((sum, item) => sum + item.maxMarks, 0)}
                  </span>
                </div>
                <p className="text-slate-500 text-xs font-bold leading-normal px-6">
                  You gained a matching **+{Math.round((scorecard?.reduce((sum, item) => sum + item.marksGained, 0) / scorecard?.reduce((sum, item) => sum + item.maxMarks, 1)) * 200)} XP** addition to your profile!
                </p>
              </div>
            </div>

            {/* Detailed Question Review Cards */}
            <div className="space-y-5">
              {scorecard?.map((item, idx) => (
                <div key={idx} className="bg-white/60 dark:bg-[#040612]/60 border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm space-y-4 text-left">
                  <div className="flex justify-between items-start border-b border-white/5 pb-3">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Question {idx + 1} Review</span>
                    <span className="text-sm font-black text-white">
                      Score: <span className="text-emerald-400">{item.marksGained}</span>/{item.maxMarks} Marks
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Question Text</h4>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-slate-250 mt-1">{item.questionText}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 dark:bg-black/35 border border-slate-200/10 dark:border-white/5 p-4 rounded-xl">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-550">Your Answer</h4>
                      <p className="text-xs text-slate-350 mt-1 leading-relaxed italic">{item.studentAnswer || "(No answer provided)"}</p>
                    </div>
                    <div className="bg-emerald-500/[0.02] border border-emerald-500/10 p-4 rounded-xl">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-400">CBSE Baseline Reference</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{activeQuestions[idx].officialAnswer}</p>
                    </div>
                  </div>

                  {/* Corrections & Feedback */}
                  <div className="space-y-3 pt-2">
                    {item.errors !== "None" && (
                      <div className="flex items-start gap-3 bg-red-500/5 p-3.5 rounded-xl border border-red-500/10 text-xs">
                        <ShieldAlert className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-black text-red-400 uppercase tracking-wider text-[9px] mb-1">Identified Errors & Gap Analyses</h5>
                          <p className="text-slate-300 font-bold leading-normal">{item.errors}</p>
                        </div>
                      </div>
                    )}

                    {item.improvements && (
                      <div className="flex items-start gap-3 bg-indigo-500/5 p-3.5 rounded-xl border border-indigo-500/10 text-xs">
                        <Sparkles className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-black text-indigo-400 uppercase tracking-wider text-[9px] mb-1">Board-Pattern Layout Recommendations</h5>
                          <p className="text-slate-300 font-bold leading-normal">{item.improvements}</p>
                        </div>
                      </div>
                    )}

                    {item.feedback && (
                      <div className="flex items-start gap-3 bg-slate-100/50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-200/50 dark:border-white/5 text-xs">
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-black text-slate-400 uppercase tracking-wider text-[9px] mb-1">AI Evaluator Feedback</h5>
                          <p className="text-slate-300 font-bold leading-normal">{item.feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={() => {
                  setTestStarted(false);
                  setScorecard(null);
                }}
                className="group flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-650 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-all shadow-xl border border-white/10"
              >
                <RotateCcw className="w-4 h-4" /> Start New Test
              </button>
            </div>
          </motion.div>
        )}
      </main>

      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />
    </div>
  );
}
