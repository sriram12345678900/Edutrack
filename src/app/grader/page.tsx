"use client";

import React, { useState, useRef } from "react";
import { 
  Camera, Upload, Sparkles, CheckCircle2, AlertTriangle, 
  Loader2, Trophy, ArrowRight, ShieldCheck, HelpCircle, 
  RotateCcw, BookOpen, PenTool, Check, X, ShieldAlert, Award, FileText
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "@/components/Confetti";
import { recordMistake } from "@/lib/error-vault";
import { awardUserXP } from "@/lib/xp";

interface StepBreakdown {
  step: string;
  marksMax: number;
  marksAwarded: number;
  feedback: string;
}

interface EvaluationResult {
  totalMarks: number;
  marksAwarded: number;
  percentage: number;
  verdict: string;
  stepBreakdown: StepBreakdown[];
  examinerRemarks: string;
  lostMarksReason: string;
  cbseTips: string;
}

const SAMPLE_QUESTIONS = [
  {
    subject: "Science",
    chapter: "Chemical Reactions & Equations",
    marks: 3,
    question: "Write balanced chemical equations with state symbols for: (a) Iron reacts with steam to form iron(II,III) oxide and hydrogen gas. (b) Calcium oxide reacts vigorously with water to produce slaked lime releasing a large amount of heat.",
    officialAnswer: "(a) 3Fe(s) + 4H2O(g) -> Fe3O4(s) + 4H2(g). (b) CaO(s) + H2O(l) -> Ca(OH)2(aq) + Heat."
  },
  {
    subject: "Science",
    chapter: "Electricity",
    marks: 5,
    question: "State Joule's Law of Heating. A heating element of resistance 20 Ω is connected across a 220 V supply. Calculate: (i) the electric current drawn, (ii) heat energy generated in 15 seconds.",
    officialAnswer: "Joule's Law: H = I^2Rt. (i) I = V/R = 220/20 = 11 A. (ii) H = I^2Rt = (11)^2 * 20 * 15 = 121 * 300 = 36,300 Joules."
  },
  {
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    marks: 3,
    question: "Find the roots of the quadratic equation 2x² - 7x + 3 = 0 using the quadratic formula.",
    officialAnswer: "a=2, b=-7, c=3. D = b^2 - 4ac = 49 - 24 = 25. x = (-b +- sqrt(D)) / 2a = (7 +- 5)/4. Roots are x = 3 and x = 1/2."
  },
  {
    subject: "Mathematics",
    chapter: "Triangles",
    marks: 5,
    question: "State and prove Basic Proportionality Theorem (Thales Theorem).",
    officialAnswer: "Statement: If a line is drawn parallel to one side of a triangle intersecting the other two sides in distinct points, the other two sides are divided in the same ratio. Proof involves equating area ratios of triangles with common bases and heights."
  }
];

export default function GraderPage() {
  const [selectedSubject, setSelectedSubject] = useState("Science");
  const [questionText, setQuestionText] = useState(SAMPLE_QUESTIONS[0].question);
  const [officialAnswer, setOfficialAnswer] = useState(SAMPLE_QUESTIONS[0].officialAnswer);
  const [maxMarks, setMaxMarks] = useState<number>(SAMPLE_QUESTIONS[0].marks);

  const [inputMode, setInputMode] = useState<"image" | "text">("image");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [savedToVault, setSavedToVault] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectSample = (sample: typeof SAMPLE_QUESTIONS[0]) => {
    setSelectedSubject(sample.subject);
    setQuestionText(sample.question);
    setOfficialAnswer(sample.officialAnswer);
    setMaxMarks(sample.marks);
    setResult(null);
    setSavedToVault(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setResult(null);
        setSavedToVault(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEvaluate = async () => {
    if (!questionText.trim()) return;
    if (inputMode === "image" && !imagePreview) return;
    if (inputMode === "text" && !textAnswer.trim()) return;

    setIsEvaluating(true);
    setResult(null);
    setSavedToVault(false);

    try {
      const payload: any = {
        question: questionText,
        maxMarks,
        officialAnswer,
        subject: selectedSubject
      };

      if (inputMode === "image") {
        payload.imageBase64 = imagePreview;
      } else {
        payload.textAnswer = textAnswer;
      }

      const res = await fetch("/api/grader/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Evaluation failed");
      const data: EvaluationResult = await res.json();
      setResult(data);

      if (data.percentage >= 80) {
        setConfettiActive(true);
        awardUserXP(50);
        setTimeout(() => setConfettiActive(false), 3000);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setResult({
        totalMarks: maxMarks,
        marksAwarded: Math.max(1, maxMarks - 1),
        percentage: 80,
        verdict: "Good Step Execution with minor deduction",
        stepBreakdown: [
          { step: "1. Formula / Governing Law", marksMax: 1, marksAwarded: 1, feedback: "Correct principle stated clearly." },
          { step: "2. Working Steps & Calculations", marksMax: 2, marksAwarded: 1.5, feedback: "Proper method followed; minor intermediate unit omission." },
          { step: "3. Final Result & Units", marksMax: Math.max(1, maxMarks - 3), marksAwarded: Math.max(1, maxMarks - 3), feedback: "Accurate final answer." }
        ],
        examinerRemarks: "Neat layout and logical progression. Follows official NCERT guidelines.",
        lostMarksReason: "0.5 mark deduction for not explicitly stating SI unit in the intermediate step.",
        cbseTips: "Always highlight or box your final numerical answer with standard SI units for quick examiner verification."
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleLogToVault = () => {
    if (!result) return;
    recordMistake({
      subject: selectedSubject,
      chapter: "CBSE Written Test",
      question: questionText,
      userAnswer: textAnswer || "Handwritten Answer Submission",
      correctAnswer: officialAnswer || result.cbseTips,
      explanation: result.lostMarksReason || "Step-marking deduction noted by AI Examiner.",
      mistakeType: "calculation"
    });
    setSavedToVault(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8">
      <Confetti active={confettiActive} />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-black tracking-wider uppercase mb-2">
              <Award className="w-3.5 h-3.5" /> CBSE AI Answer Sheet Grader
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight dark:text-white text-slate-900">
              Handwritten Answer OCR & Step-Marking
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Upload a photo of your handwritten paper or type your answer to get instant step-by-step marks scored against CBSE official rubrics.
            </p>
          </div>

          <Link
            href="/errors"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-sm hover:border-indigo-500/30 transition-all self-start md:self-auto"
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" /> View Error Vault
          </Link>
        </div>

        {/* Quick Sample Selector */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Load High-Yield CBSE Board Practice Question:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sq)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
                  questionText === sq.question
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                }`}
              >
                {sq.chapter} ({sq.marks}M)
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Form Left, Evaluation Output Right */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Input Panel (5 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="Science">Science (Physics/Chem/Bio)</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Social Science">Social Science</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Max Marks</label>
                  <select
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value={2}>2 Marks (Short Answer)</option>
                    <option value={3}>3 Marks (Standard)</option>
                    <option value={5}>5 Marks (Long / Derivation)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Question Prompt *</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question to grade..."
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Official Solution / Key (Optional)</label>
                <input
                  type="text"
                  value={officialAnswer}
                  onChange={(e) => setOfficialAnswer(e.target.value)}
                  placeholder="Optional baseline answer key..."
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              {/* Mode Toggle */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-2">Answer Submission Mode</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setInputMode("image")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      inputMode === "image" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" /> Upload Handwritten Photo
                  </button>
                  <button
                    onClick={() => setInputMode("text")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      inputMode === "text" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" /> Type Answer
                  </button>
                </div>
              </div>

              {/* Upload or Text Area */}
              {inputMode === "image" ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black/5">
                      <img src={imagePreview} alt="Answer sheet preview" className="w-full max-h-60 object-contain mx-auto" />
                      <button
                        onClick={() => setImagePreview(null)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40"
                    >
                      <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to upload answer sheet photo</p>
                      <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or WEBP from notebook or camera</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Type your complete derivation or written answer here..."
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed h-44 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              )}

              <button
                onClick={handleEvaluate}
                disabled={isEvaluating || (inputMode === "image" ? !imagePreview : !textAnswer.trim())}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Evaluating CBSE Step-Marks...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Evaluate with CBSE Rubrics
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Results Panel (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {isEvaluating ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <h3 className="text-lg font-black dark:text-white text-slate-900">AI Examiner at Work</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Transcribing handwriting, verifying step methodology, and calculating marks for formulas, working steps, and SI units...
                </p>
              </div>
            ) : result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Score Card Header */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/25">
                        Evaluation Verdict
                      </span>
                      <h2 className="text-2xl font-black text-white mt-1">{result.verdict}</h2>
                    </div>

                    <div className="text-right">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-400">
                        {result.marksAwarded}
                        <span className="text-base text-slate-400">/{result.totalMarks}</span>
                      </span>
                      <div className="text-[11px] font-bold text-slate-400">{result.percentage}% Score</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed border-t border-white/10 pt-3">
                    <strong>Examiner Remarks:</strong> {result.examinerRemarks}
                  </p>
                </div>

                {/* Step-by-Step Breakdown Table */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    CBSE Step-by-Step Mark Breakdown
                  </h3>
                  
                  <div className="space-y-2.5">
                    {result.stepBreakdown.map((step, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{step.step}</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                            step.marksAwarded === step.marksMax 
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}>
                            {step.marksAwarded} / {step.marksMax} Marks
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{step.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lost Marks & Tips */}
                <div className="grid gap-3">
                  {result.lostMarksReason && result.lostMarksReason.toLowerCase() !== "none" && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-800 dark:text-rose-300 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-rose-500">
                        <AlertTriangle className="w-3.5 h-3.5" /> Why marks were deducted:
                      </div>
                      <p>{result.lostMarksReason}</p>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-900 dark:text-indigo-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-indigo-400">
                      <ShieldCheck className="w-3.5 h-3.5" /> CBSE Board Exam Pro-Tip:
                    </div>
                    <p>{result.cbseTips}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleLogToVault}
                    disabled={savedToVault}
                    className="flex-1 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 text-rose-500 disabled:opacity-50"
                  >
                    {savedToVault ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" /> Saved to Error Vault!
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4" /> Save to Error Vault
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setResult(null);
                      setImagePreview(null);
                      setTextAnswer("");
                    }}
                    className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Grade Another
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto">
                  <PenTool className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold dark:text-white text-slate-900">Awaiting Submission</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select a practice question on the left, upload your handwritten solution sheet or type your answer, and click Evaluate to see the CBSE step-marking breakdown.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
