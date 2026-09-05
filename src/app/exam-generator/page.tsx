"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Printer, Download, Sparkles, CheckSquare, Settings2, 
  BookOpen, Clock, Award, Shield, Copy, Check, Eye, EyeOff, RefreshCw,
  Timer, AlertCircle, ArrowLeft, CheckCircle2
} from "lucide-react";
import { awardXp } from "@/lib/xp";
import { cn } from "@/lib/utils";

interface ExamQuestion {
  num: number;
  section: "A" | "B" | "C" | "D" | "E";
  marks: number;
  text: string;
  options?: string[];
  markingScheme: string;
}

interface ExamPaper {
  title: string;
  subject: string;
  grade: string;
  board: string;
  durationHours: number;
  maxMarks: number;
  generalInstructions: string[];
  questions: ExamQuestion[];
}

const SAMPLE_PAPERS: { [key: string]: ExamPaper } = {
  "Class 10 - Science": {
    title: "CBSE Class X Board Examination Practice Paper (Science - 086)",
    subject: "Science",
    grade: "Class 10",
    board: "CBSE Official Blueprint",
    durationHours: 3,
    maxMarks: 80,
    generalInstructions: [
      "This question paper consists of 39 questions in 5 sections.",
      "All questions are compulsory. Internal choice is provided in some questions.",
      "Section A consists of 20 objective type questions carrying 1 mark each.",
      "Section B consists of 6 Very Short questions carrying 02 marks each.",
      "Section C consists of 7 Short Answer type questions carrying 03 marks each.",
      "Section D consists of 3 Long Answer type questions carrying 05 marks each.",
      "Section E consists of 3 source-based/case-based units of assessment of 04 marks each."
    ],
    questions: [
      {
        num: 1,
        section: "A",
        marks: 1,
        text: "Which of the following rays of light does not deviate after passing through a thin spherical lens?",
        options: ["(a) Ray parallel to principal axis", "(b) Ray passing through optical center", "(c) Ray passing through first focus", "(d) Ray incident at 45 degrees"],
        markingScheme: "**Correct Option: (b)** [1 Mark]\n*Reason:* A light ray passing through the optical center of a thin lens undergoes negligible lateral shift and emerges without angular deviation."
      },
      {
        num: 2,
        section: "A",
        marks: 1,
        text: "What happens when dilute hydrochloric acid is added to iron fillings?",
        options: ["(a) Hydrogen gas and iron chloride are produced", "(b) Chlorine gas and iron hydroxide are produced", "(c) No reaction takes place", "(d) Iron salt and water are produced"],
        markingScheme: "**Correct Option: (a)** [1 Mark]\n*Equation:* Fe(s) + 2HCl(aq) -> FeCl₂(aq) + H₂(g)"
      },
      {
        num: 3,
        section: "B",
        marks: 2,
        text: "Why does the cord of an electric heater not glow while the heating element does when connected to the same voltage supply?",
        markingScheme: "*Step 1:* Heating effect H = I²Rt. Since both cord and element are in series, current I is the same. [0.5 Mark]\n*Step 2:* Heating element (nichrome) has very high resistivity, so R is very large -> generates high heat and glows red-hot. [1 Mark]\n*Step 3:* Connecting cord (copper) has extremely low resistance -> negligible heat produced. [0.5 Mark]"
      },
      {
        num: 4,
        section: "C",
        marks: 3,
        text: "(a) State Snell's law of refraction.\n(b) The absolute refractive index of diamond is 2.42. What is the physical significance of this statement with respect to the speed of light?",
        markingScheme: "*(a)* Snell's law: Ratio of sin(i) to sin(r) is constant for a given pair of media: sin(i) / sin(r) = n. [1 Mark]\n*(b)* n = c / v. Refractive index = 2.42 means speed of light in diamond is 1/2.42 times (approx 41%) of its speed in vacuum: v = 3x10⁸ / 2.42 = 1.24 x 10⁸ m/s. [2 Marks]"
      },
      {
        num: 5,
        section: "D",
        marks: 5,
        text: "Describe the structure and functioning of a Nephron in the human kidney with the help of a labeled diagram or step-wise mechanism of urine formation.",
        markingScheme: "*Labeled Diagram/Components:* Bowman's capsule, Glomerulus, Henle's loop, Collecting duct. [2 Marks]\n*Mechanism:* 1. Ultrafiltration under high hydrostatic pressure in glomerulus [1 Mark]. 2. Selective reabsorption of glucose, amino acids, salts & water along tubular part [1 Mark]. 3. Tubular secretion of waste ions into collecting duct [1 Mark]."
      },
      {
        num: 6,
        section: "E",
        marks: 4,
        text: "**Case Study: Domestic Electric Circuits**\nIn our homes, electricity is supplied through mains at 220 V AC. Two separate circuits are used: 15 A rating for high-power appliances (geysers, ACs) and 5 A rating for bulbs and fans.\n\n(i) Why are domestic appliances connected in parallel rather than in series? [2 Marks]\n(ii) What is the function of an earth wire? [2 Marks]",
        markingScheme: "*(i)* In parallel: 1. Each appliance gets full voltage (220V). 2. Independent on/off switches. If one fails, others keep working. [2 Marks]\n*(ii)* Earth wire provides a low-resistance path to ground in case of metallic insulation breakdown, preventing fatal electric shocks. [2 Marks]"
      }
    ]
  },
  "Class 10 - Mathematics": {
    title: "CBSE Class X Board Examination Practice Paper (Mathematics Standard - 041)",
    subject: "Mathematics",
    grade: "Class 10",
    board: "CBSE Standard Blueprint",
    durationHours: 3,
    maxMarks: 80,
    generalInstructions: [
      "This question paper contains 38 questions divided into 5 Sections A, B, C, D, and E.",
      "Section A comprises 20 MCQs of 1 mark each.",
      "Section B comprises 5 Short Answer Type-I questions of 2 marks each.",
      "Section C comprises 6 Short Answer Type-II questions of 3 marks each.",
      "Section D comprises 4 Long Answer questions of 5 marks each.",
      "Section E comprises 3 Case-Based questions of 4 marks each."
    ],
    questions: [
      {
        num: 1,
        section: "A",
        marks: 1,
        text: "If HCF(a, b) = 12 and a x b = 1800, then LCM(a, b) is equal to:",
        options: ["(a) 3600", "(b) 150", "(c) 900", "(d) 600"],
        markingScheme: "**Correct Option: (b) 150** [1 Mark]\n*Working:* LCM x HCF = a x b => LCM = 1800 / 12 = 150."
      },
      {
        num: 2,
        section: "B",
        marks: 2,
        text: "Prove that √5 is an irrational number using the method of contradiction.",
        markingScheme: "*Proof:* Assume √5 = a/b (coprime integers, b ≠ 0). 5b² = a² => 5 divides a² => 5 divides a. Let a = 5c => 5b² = 25c² => b² = 5c² => 5 divides b. Contradicts coprimality of a and b. Hence √5 is irrational. [2 Marks]"
      },
      {
        num: 3,
        section: "C",
        marks: 3,
        text: "If sin θ + cos θ = √3, then prove that tan θ + cot θ = 1.",
        markingScheme: "*Step 1:* Square both sides: (sin θ + cos θ)² = 3 => sin²θ + cos²θ + 2 sin θ cos θ = 3 => 1 + 2 sin θ cos θ = 3 => 2 sin θ cos θ = 2 => sin θ cos θ = 1. [1.5 Marks]\n*Step 2:* tan θ + cot θ = sin θ / cos θ + cos θ / sin θ = (sin²θ + cos²θ) / (sin θ cos θ) = 1 / 1 = 1. [1.5 Marks]"
      },
      {
        num: 4,
        section: "D",
        marks: 5,
        text: "A straight highway leads to the foot of a tower. A man standing at the top of the tower observes a car at an angle of depression of 30°, which is approaching the foot of the tower with a uniform speed. Six seconds later, the angle of depression of the car is found to be 60°. Find the time taken by the car to reach the foot of the tower from this point.",
        markingScheme: "*Diagram & Setup:* Height of tower = h. Initial distance = d₁, after 6 sec = d₂. [1 Mark]\n*In Δ1:* tan 60° = h / d₂ => h = d₂√3. [1 Mark]\n*In Δ2:* tan 30° = h / d₁ => h = d₁ / √3. [1 Mark]\n*Equating:* d₂√3 = d₁ / √3 => d₁ = 3 d₂. Distance covered in 6s = d₁ - d₂ = 2 d₂ => Speed v = 2 d₂ / 6 = d₂ / 3. [1 Mark]\n*Time to cover remaining d₂:* t = d₂ / v = d₂ / (d₂ / 3) = 3 seconds. [1 Mark]"
      }
    ]
  }
};

const SUBJECT_CHAPTERS: { [subject: string]: string[] } = {
  "Science": [
    "Chemical Reactions and Equations",
    "Acids, Bases and Salts",
    "Metals and Non-metals",
    "Carbon and its Compounds",
    "Life Processes",
    "Control and Coordination",
    "How do Organisms Reproduce?",
    "Heredity and Evolution",
    "Light - Reflection and Refraction",
    "The Human Eye and the Colourful World",
    "Electricity",
    "Magnetic Effects of Electric Current",
    "Our Environment"
  ],
  "Mathematics": [
    "Real Numbers",
    "Polynomials",
    "Pair of Linear Equations in Two Variables",
    "Quadratic Equations",
    "Arithmetic Progressions",
    "Triangles",
    "Coordinate Geometry",
    "Introduction to Trigonometry",
    "Some Applications of Trigonometry",
    "Circles",
    "Surface Areas and Volumes",
    "Statistics",
    "Probability"
  ],
  "Social Science": [
    "The Rise of Nationalism in Europe",
    "Nationalism in India",
    "Resources and Development",
    "Forest and Wildlife Resources",
    "Water Resources",
    "Agriculture",
    "Power Sharing",
    "Federalism",
    "Gender, Religion and Caste",
    "Development",
    "Sectors of the Indian Economy",
    "Money and Credit",
    "Globalization and the Indian Economy"
  ],
  "English": [
    "A Letter to God",
    "Nelson Mandela: Long Walk to Freedom",
    "Two Stories about Flying",
    "From the Diary of Anne Frank",
    "Glimpses of India",
    "Madam Rides the Bus",
    "The Sermon at Benares",
    "The Proposal",
    "Dust of Snow (Poem)",
    "Fire and Ice (Poem)",
    "A Triumph of Surgery",
    "The Thief's Story",
    "The Midnight Visitor",
    "A Question of Trust"
  ]
};

export default function ExamGeneratorPage() {
  const [selectedKey, setSelectedKey] = useState<string>("Class 10 - Science");
  const [showMarkingScheme, setShowMarkingScheme] = useState(true);
  const [copied, setCopied] = useState(false);

  // Custom exam form states
  const [selectedClass, setSelectedClass] = useState<string>("Class 10");
  const [selectedSubject, setSelectedSubject] = useState<string>("Science");
  const [selectedMarks, setSelectedMarks] = useState<number>(80);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>("CBSE");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("Medium");
  const [customPaper, setCustomPaper] = useState<ExamPaper | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Exam Taker & Evaluation states
  const [isExamMode, setIsExamMode] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState<{ [qNum: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationReport, setEvaluationReport] = useState<any>(null);

  // Countdown timer for Exam Taker
  useEffect(() => {
    if (!isExamMode || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [isExamMode, timeLeft]);

  // Auto-sync selected chapters when subject changes
  useEffect(() => {
    if (SUBJECT_CHAPTERS[selectedSubject]) {
      setSelectedChapters(SUBJECT_CHAPTERS[selectedSubject]);
    }
  }, [selectedSubject]);

  const paper = customPaper || SAMPLE_PAPERS[selectedKey];

  const handleSelectSample = (key: string) => {
    setCustomPaper(null);
    setSelectedKey(key);
    setEvaluationReport(null);
    setIsExamMode(false);
    setError(null);
  };

  const startExam = () => {
    const duration = paper.durationHours * 3600;
    setTimeLeft(duration);
    setStudentAnswers({});
    setEvaluationReport(null);
    setIsExamMode(true);
  };

  const handleSubmitExam = async (overrideAnswers?: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const answersToSubmit = overrideAnswers || studentAnswers;
      const res = await fetch("/api/exam/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paper: paper,
          studentAnswers: answersToSubmit
        })
      });
      const data = await res.json();
      if (data.evaluation) {
        setEvaluationReport(data.evaluation);
        setIsExamMode(false);
        const earned = data.evaluation.marksAwarded * 10;
        awardXp(earned, `Completed Board Exam Practice: ${data.evaluation.marksAwarded}/${data.evaluation.totalMarks}`);
      } else {
        throw new Error(data.error || "Failed to evaluate exam");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to submit and evaluate exam.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateCustom = async () => {
    setIsGenerating(true);
    setError(null);
    setEvaluationReport(null);
    setIsExamMode(false);
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (_) {}

    try {
      const res = await fetch("/api/exam/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classLevel: selectedClass === "Class 10" ? "10" : selectedClass,
          subject: selectedSubject,
          maxMarks: selectedMarks,
          chapters: selectedChapters,
          board: selectedBoard,
          difficulty: selectedDifficulty
        })
      });
      const data = await res.json();
      if (data.paper) {
        setCustomPaper(data.paper);
        awardXp(80, "Generated Custom Board Exam Paper");
      } else {
        throw new Error(data.error || "Failed to generate paper");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to generate exam paper. Please check your API key / server.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
    awardXp(50, "Generated Printable Exam Paper");
  };

  const handleCopyMarkdown = () => {
    const text = `
# ${paper.title}
Subject: ${paper.subject} | Grade: ${paper.grade} | Duration: ${paper.durationHours} Hours | Max Marks: ${paper.maxMarks}

## General Instructions:
${paper.generalInstructions.map(i => `- ${i}`).join("\n")}

---

${paper.questions.map(q => `
### Question ${q.num} (Section ${q.section} - ${q.marks} Mark${q.marks > 1 ? "s" : ""})
${q.text}
${q.options ? q.options.join("\n") : ""}

**Marking Scheme:**
${q.markingScheme}
`).join("\n---\n")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {isExamMode ? (
          <div className="space-y-6">
            {/* Exam Header with Countdown Timer */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{paper.board}</span>
                <h1 className="text-xl font-black text-white">{paper.title}</h1>
                <p className="text-xs text-slate-400">Subject: {paper.subject} | Max Marks: {paper.maxMarks}</p>
              </div>
              <div className="flex items-center gap-3 bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800">
                <Timer className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span className="font-mono text-xl font-black text-white">
                  {Math.floor(timeLeft / 3600).toString().padStart(2, "0")}:
                  {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, "0")}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Questions List */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8">
              {paper.questions.map((q) => {
                const answer = studentAnswers[q.num] || "";
                return (
                  <div key={q.num} className="space-y-4 pb-6 border-b border-slate-800 last:border-b-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                          {q.num}
                        </span>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-200 leading-relaxed whitespace-pre-line">
                            {q.text}
                          </p>
                          <span className="inline-block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            Section {q.section} • {q.marks} Mark{q.marks > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Question Answering Area */}
                    {q.options ? (
                      /* Section A MCQs */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-0 sm:pl-10 mt-3 sm:mt-0 max-w-2xl">
                        {q.options.map((opt) => {
                          const optLabel = opt.match(/^\([a-d]\)/)?.[0] || opt.substring(0, 3);
                          const isSelected = answer === optLabel || answer === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setStudentAnswers({ ...studentAnswers, [q.num]: optLabel })}
                              className={cn(
                                "text-left p-3.5 rounded-xl border text-xs font-bold transition-all",
                                isSelected
                                  ? "bg-indigo-950/30 border-indigo-500 text-indigo-300 font-extrabold shadow-md shadow-indigo-500/5"
                                  : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                              )}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Descriptive questions */
                      <div className="pl-0 sm:pl-10 mt-3 sm:mt-0">
                        <textarea
                          value={answer}
                          onChange={(e) => setStudentAnswers({ ...studentAnswers, [q.num]: e.target.value })}
                          placeholder="Type your step-by-step answer here..."
                          className="w-full h-32 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-2xl p-4 text-xs font-medium text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-y"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-3xl">
              <div className="text-xs text-slate-400 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-400" />
                <span>Make sure to attempt all sections. Your answers are auto-saved.</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel? Your progress will be lost.")) {
                      setIsExamMode(false);
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-colors"
                >
                  Cancel & Exit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const attempted = Object.keys(studentAnswers).length;
                    const total = paper.questions.length;
                    if (confirm(`You have attempted ${attempted} of ${total} questions. Are you sure you want to submit?`)) {
                      handleSubmitExam();
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-550 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      Submit Answer Sheet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : evaluationReport ? (
          <div className="space-y-6">
            {/* Scorecard Top Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/60 border border-indigo-500/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-3 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5" />
                    AI Assessment Complete
                  </div>
                  <h1 className="text-3xl font-black text-white">Your Board Exam Scorecard</h1>
                  <p className="text-slate-300 text-xs md:text-sm max-w-xl">
                    Evaluation based on official {selectedBoard} marking rubrics.
                  </p>
                </div>

                <div className="flex items-center gap-5 bg-slate-950/80 px-6 py-4 rounded-3xl border border-slate-800">
                  <div className="text-center">
                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</span>
                    <span className="text-4xl font-black text-indigo-400">{evaluationReport.marksAwarded}</span>
                    <span className="text-slate-500 text-sm"> / {evaluationReport.totalMarks}</span>
                  </div>
                  <div className="w-px h-10 bg-slate-800" />
                  <div className="text-center">
                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Percentage</span>
                    <span className="text-2xl font-black text-white">{evaluationReport.percentage}%</span>
                    <span className="block text-[10px] font-extrabold text-emerald-400">{evaluationReport.verdict}</span>
                  </div>
                </div>
              </div>

              {/* Section breakdown */}
              {evaluationReport.sectionScores && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-slate-800/80 mt-6">
                  {Object.entries(evaluationReport.sectionScores).map(([sec, scoreObj]: [string, any]) => (
                    <div key={sec} className="bg-slate-950/50 p-3 rounded-2xl border border-slate-900/60 text-center">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Section {sec}</span>
                      <span className="text-sm font-black text-white">{scoreObj.awarded}</span>
                      <span className="text-slate-500 text-xs"> / {scoreObj.max}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assessment Remarks, Weakness, Action Plan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Examiner Remarks */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-2">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Examiner Remarks</span>
                <p className="text-xs text-slate-300 leading-relaxed">{evaluationReport.overallRemarks || evaluationReport.examinerRemarks}</p>
              </div>

              {/* Weak Areas */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-2">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block">Weak Areas Identified</span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                  {evaluationReport.weakAreas && evaluationReport.weakAreas.length > 0 ? (
                    evaluationReport.weakAreas.map((w: string) => <li key={w}>{w}</li>)
                  ) : (
                    <li>No significant weak areas! Excellent work.</li>
                  )}
                </ul>
              </div>

              {/* Action Plan */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Custom Action Plan</span>
                <p className="text-xs text-slate-300 leading-relaxed">{evaluationReport.actionPlan}</p>
              </div>
            </div>

            {/* Question by Question Review */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <h2 className="text-lg font-black text-white uppercase tracking-wider border-b border-slate-800 pb-4">Detailed Question Review</h2>
              <div className="space-y-6">
                {paper.questions.map((q) => {
                  const evalItem = evaluationReport.questionEvaluations?.find((e: any) => e.num === q.num);
                  const studentAns = studentAnswers[q.num] || "No Answer Submitted";
                  return (
                    <div key={q.num} className="space-y-3 pb-6 border-b border-slate-800 last:border-b-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                            {q.num}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-200 leading-relaxed whitespace-pre-line">{q.text}</p>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                              Section {q.section} • Max: {q.marks} Mark{q.marks > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        {evalItem && (
                          <span className={cn(
                            "text-xs font-mono font-bold px-2 py-1 border rounded shrink-0",
                            evalItem.marksAwarded === evalItem.marksMax
                              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                              : evalItem.marksAwarded > 0
                                ? "bg-amber-955/20 border-amber-505/30 text-amber-450"
                                : "bg-rose-955/20 border-rose-450/30 text-rose-450"
                          )}>
                            Gained: {evalItem.marksAwarded} / {evalItem.marksMax}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-9 mt-2">
                        {/* Student Answer */}
                        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900 text-xs">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Your Answer:</span>
                          <p className="text-slate-300 italic whitespace-pre-line leading-relaxed">"{studentAns}"</p>
                        </div>
                        {/* Evaluation & Feedback */}
                        {evalItem && (
                          <div className="p-3 bg-indigo-950/15 rounded-xl border border-indigo-950/40 text-xs space-y-1">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider block">AI Evaluator Feedback:</span>
                            <p className="text-slate-300 leading-relaxed">{evalItem.feedback}</p>
                            {evalItem.markingSchemeUsed && (
                              <p className="text-[10px] text-slate-500 italic mt-1 leading-normal">
                                Rubric Applied: {evalItem.markingSchemeUsed}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Back action */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setEvaluationReport(null)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 mx-auto transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Exam Generator
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Banner (Hidden during Print) */}
            <div className="print:hidden relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/40 via-teal-900/40 to-slate-900/60 border border-emerald-500/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    {selectedBoard} Board Exam & Rubric Generator
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                    1-Click <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Exam & Rubric</span> Generator
                  </h1>
                  <p className="text-slate-300 text-xs md:text-sm max-w-xl">
                    Generate official board-pattern question papers with blueprints (Sections A–E), step-wise marking schemes, model answers, and printable PDF formats.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <button
                    onClick={startExam}
                    className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all w-full"
                  >
                    <Sparkles className="w-4 h-4 text-white animate-pulse shrink-0" />
                    <span>Start Exam</span>
                  </button>

                  <button
                    onClick={() => setShowMarkingScheme(!showMarkingScheme)}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all w-full"
                  >
                    {showMarkingScheme ? <EyeOff className="w-4 h-4 text-amber-400 shrink-0" /> : <Eye className="w-4 h-4 text-emerald-400 shrink-0" />}
                    <span>{showMarkingScheme ? "Hide Rubric" : "Show Rubric"}</span>
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all w-full md:w-auto"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all w-full md:w-auto"
                  >
                    <Printer className="w-4 h-4 shrink-0" />
                    <span>Print PDF</span>
                  </button>
                </div>
              </div>

              {/* Paper Switcher Tabs */}
              <div className="flex items-center gap-2 pt-6 border-t border-slate-800/80 mt-6">
                {Object.keys(SAMPLE_PAPERS).map(key => (
                  <button
                    key={key}
                    onClick={() => handleSelectSample(key)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black transition-all border",
                      !customPaper && selectedKey === key
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-md"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                    )}
                  >
                    {key}
                  </button>
                ))}
                {customPaper && (
                  <span className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 border border-emerald-500 text-white shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-white" /> Custom Paper
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Exam Builder Form (Hidden during Print) */}
            <div className="print:hidden bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                <Settings2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-black text-white uppercase tracking-wider">Exam Configuration</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {/* Class Selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Class / Grade</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="Class 10">Class X (Class 10)</option>
                    <option value="Class 9">Class IX (Class 9)</option>
                    <option value="Class 8">Class VIII (Class 8)</option>
                  </select>
                </div>

                {/* Target Board Selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Target Board</label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="CBSE">CBSE (NCERT)</option>
                    <option value="ICSE">ICSE / CISCE</option>
                    <option value="State Board">State Board</option>
                  </select>
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Difficulty Level</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="Easy">Easy (Conceptual)</option>
                    <option value="Medium">Medium (Balanced)</option>
                    <option value="Hard">Hard (HOTS/Analytical)</option>
                  </select>
                </div>

                {/* If Class 10 (Class X) is selected, show Subject and Marks options */}
                {selectedClass === "Class 10" ? (
                  <>
                    {/* Subject Selection */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Subject</label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                      >
                        <option value="Science">Science (086)</option>
                        <option value="Mathematics">Mathematics Standard (041)</option>
                        <option value="Social Science">Social Science (087)</option>
                        <option value="English">English Lang & Lit (184)</option>
                      </select>
                    </div>

                    {/* Marks Selection */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">No. of Marks</label>
                      <select
                        value={selectedMarks}
                        onChange={(e) => setSelectedMarks(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                      >
                        <option value={80}>80 Marks (Full Term - 3 Hours)</option>
                        <option value={40}>40 Marks (Periodic Test - 1.5 Hours)</option>
                        <option value={20}>20 Marks (Unit Test - 1 Hour)</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 flex items-center p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl text-xs text-slate-400 font-bold">
                    ⚠️ Dynamic generation is currently optimized for Class X patterns. Try switching back to Class X!
                  </div>
                )}
              </div>

              {/* Chapter Selection (Checkboxes) */}
              {selectedClass === "Class 10" && SUBJECT_CHAPTERS[selectedSubject] && (
                <div className="space-y-3 pt-5 border-t border-slate-800/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Select Chapters to Include
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedChapters(SUBJECT_CHAPTERS[selectedSubject])}
                        className="text-[10px] font-black text-emerald-400 hover:text-emerald-350 hover:underline transition-colors"
                      >
                        Select All
                      </button>
                      <span className="text-slate-800 text-[10px]">•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedChapters([])}
                        className="text-[10px] font-black text-slate-500 hover:text-slate-400 hover:underline transition-colors"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {SUBJECT_CHAPTERS[selectedSubject].map(chapter => {
                      const isChecked = selectedChapters.includes(chapter);
                      return (
                        <label
                          key={chapter}
                          className={cn(
                            "flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none text-[11px] font-bold leading-normal",
                            isChecked
                              ? "bg-emerald-950/20 border-emerald-500/25 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                              : "bg-slate-950/30 border-slate-900/60 text-slate-400 hover:border-slate-800 hover:text-slate-300"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedChapters(selectedChapters.filter(c => c !== chapter));
                              } else {
                                setSelectedChapters([...selectedChapters, chapter]);
                              }
                            }}
                            className="mt-0.5 rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 bg-slate-950 focus:ring-offset-0 shrink-0"
                          />
                          <span>{chapter}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Blueprint: Official {selectedBoard} Assessment Standard (Sections A to E)</span>
                </div>

                <button
                  onClick={handleGenerateCustom}
                  disabled={isGenerating || selectedClass !== "Class 10"}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Generating Paper...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      Generate Exam Paper
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 font-bold">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Printable Examination Paper View */}
            <div className="bg-white text-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 font-serif print:p-0 print:shadow-none print:rounded-none">
              
              {/* Official Board Paper Header */}
              <div className="text-center border-b-2 border-slate-900 pb-6 space-y-2">
                <h4 className="text-xs uppercase font-sans font-bold tracking-widest text-slate-600">
                  {paper.board} • Annual Assessment
                </h4>
                <h1 className="text-xl md:text-2xl font-black font-sans uppercase tracking-tight text-slate-900">
                  {paper.title}
                </h1>
                <div className="flex items-center justify-between text-xs font-sans font-bold pt-3 text-slate-700">
                  <span>Time Allowed: {paper.durationHours} Hours</span>
                  <span>Subject: {paper.subject} ({paper.grade})</span>
                  <span>Maximum Marks: {paper.maxMarks}</span>
                </div>
              </div>

              {/* General Instructions */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs font-sans">
                <span className="font-bold uppercase tracking-wider block text-slate-800">General Instructions:</span>
                <ul className="list-decimal pl-5 space-y-1 text-slate-600">
                  {paper.generalInstructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
              </div>

              {/* Questions Stream */}
              <div className="space-y-6">
                {paper.questions.map((q) => (
                  <div key={q.num} className="space-y-3 pb-5 border-b border-slate-200 last:border-b-0">
                    <div className="flex items-start justify-between gap-4 font-sans">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {q.num}
                        </span>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-900 leading-relaxed whitespace-pre-line">
                            {q.text}
                          </p>

                          {q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs text-slate-700">
                              {q.options.map((opt, oi) => (
                                <div key={oi} className="p-1.5 rounded-lg bg-slate-100/80 font-mono">
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-bold font-mono px-2 py-1 bg-slate-100 border border-slate-300 rounded text-slate-800 shrink-0">
                        [{q.marks} Mark{q.marks > 1 ? "s" : ""}]
                      </span>
                    </div>

                    {/* Step-by-Step Marking Scheme (Toggleable) */}
                    {showMarkingScheme && (
                      <div className="mt-3 p-4 bg-emerald-50/80 border border-emerald-300/80 rounded-xl text-xs font-sans space-y-1.5 print:bg-slate-50 print:border-slate-300">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5" /> Official Marking Scheme & Step-Wise Criteria
                        </span>
                        <div className="text-emerald-950 whitespace-pre-line leading-relaxed font-sans font-medium">
                          {q.markingScheme}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="text-center pt-6 border-t border-slate-300 text-xs font-sans text-slate-500">
                *** End of Question Paper • Generated via EduTrack AI Exam Engine ***
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
