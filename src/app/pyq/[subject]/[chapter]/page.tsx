"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Camera, Upload, CheckCircle2, AlertCircle, Loader2, BookOpen, Target, Trophy, Dumbbell, ChevronRight, Timer, Star, X, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getPYQsForChapter, PYQQuestion } from "@/lib/pyq";
import { subjectColors, subjects } from "@/lib/ncert-books";

type Category = "MCQ" | "ExtraPractice" | "ThreeMarker" | "FiveMarker";
type QuizPhase = "category" | "list" | "mcq-setup" | "mcq-quiz" | "mcq-results" | "written-test";

const SECONDS_PER_QUESTION = 45;

function cleanMathText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\$\$/g, "")
    .replace(/\$/g, "")
    .replace(/\\rightarrow/g, " → ")
    .replace(/\\leftarrow/g, " ← ")
    .replace(/\\leftrightarrow/g, " ↔ ")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\text\b/g, "")
    .replace(/_\{([^}]+)\}/g, "$1")
    .replace(/_([a-zA-Z0-9])/g, "$1")
    .replace(/\^([a-zA-Z0-9+-])/g, "$1")
    .replace(/\\times/g, " × ")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\,/g, " ")
    .replace(/\\;/g, " ")
    .replace(/\\quad/g, "   ")
    .replace(/\\cdot/g, "·")
    .trim();
}

// Parse MCQ question text into stem + options
function parseQuestion(raw: string): { stem: string; options: { label: string; text: string }[] } {
  const text = raw.trim();
  
  // 1. Detect if it's an Assertion-Reason question
  const isAssertionReason = /assertion\s*\(a\)/i.test(text) || /reason\s*\(r\)/i.test(text);
  
  if (isAssertionReason) {
    const stdOptions = [
      { label: "A", text: "Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A)." },
      { label: "B", text: "Both Assertion (A) and Reason (R) are true, but Reason (R) is not the correct explanation of Assertion (A)." },
      { label: "C", text: "Assertion (A) is true, but Reason (R) is false." },
      { label: "D", text: "Assertion (A) is false, but Reason (R) is true." }
    ];
    
    // Strip standard options if they are written at the end of the text
    const optionStartIndex = text.search(/\((a|A)\)\s*both\s*assertion/i);
    let stem = text;
    if (optionStartIndex > 0) {
      stem = text.slice(0, optionStartIndex).trim();
    } else {
      const lastOptionIndex = text.search(/\((a|A)\)[^(]*\((b|B)\)[^(]*\((c|C)\)[^(]*\((d|D)\)/);
      if (lastOptionIndex > 0) {
        stem = text.slice(0, lastOptionIndex).trim();
      }
    }
    return { stem, options: stdOptions };
  }
  
  // 2. Regular MCQ parsing with multiple formats
  const patterns = [
    {
      regex: /\(((?:[a-d]|[A-D]))\)\s*([\s\S]*?)(?=\s*\((?:[a-d]|[A-D])\)|$)/g,
      test: /\((?:a|A)\)[\s\S]*?\((?:b|B)\)[\s\S]*?\((?:c|C)\)[\s\S]*?\((?:d|D)\)/
    },
    {
      regex: /(?:^|\s)((?:[a-d]|[A-D]))\)\s*([\s\S]*?)(?=\s*(?:[a-d]|[A-D])\)|$)/g,
      test: /(?:a|A)\)[\s\S]*?(?:b|B)\)[\s\S]*?(?:c|C)\)[\s\S]*?(?:d|D)\)/
    },
    {
      regex: /(?:^|\s)((?:[a-d]|[A-D]))\.\s*([\s\S]*?)(?=\s*(?:[a-d]|[A-D])\.|$)/g,
      test: /(?:a|A)\.[\s\S]*?(?:b|B)\.[\s\S]*?(?:c|C)\.[\s\S]*?(?:d|D)\./
    }
  ];
  
  for (const pat of patterns) {
    if (pat.test.test(text)) {
      const firstOptMatch = text.match(pat.test);
      if (firstOptMatch) {
        const optionStartIndex = text.indexOf(firstOptMatch[0]);
        const stem = text.slice(0, optionStartIndex).trim();
        const optionsText = text.slice(optionStartIndex);
        
        const options: { label: string; text: string }[] = [];
        let match;
        pat.regex.lastIndex = 0;
        while ((match = pat.regex.exec(optionsText)) !== null) {
          options.push({ label: match[1].toUpperCase(), text: match[2].trim() });
        }
        
        if (options.length === 4) {
          return { stem, options };
        }
      }
    }
  }
  
  // Basic backup option regex
  const optionRegex = /\(((?:[a-d]|[A-D]))\)\s*([\s\S]*?)(?=\s*\((?:[a-d]|[A-D])\)|$)/g;
  const options: { label: string; text: string }[] = [];
  let match;
  optionRegex.lastIndex = 0;
  while ((match = optionRegex.exec(text)) !== null) {
    options.push({ label: match[1].toUpperCase(), text: match[2].trim() });
  }
  
  if (options.length === 4) {
    const firstOptionIndex = text.search(/\(((?:a|A))\)/);
    const stem = firstOptionIndex > 0 ? text.slice(0, firstOptionIndex).trim() : text;
    return { stem, options };
  }
  
  return { stem: text, options: [] };
}

// Extract the correct letter from officialAnswer
function getCorrectLetter(officialAnswer?: string): string {
  if (!officialAnswer) return "";
  
  // Match standard option letters
  const m = officialAnswer.trim().match(/^\(?([a-d])\)?/i);
  if (m) return m[1].toUpperCase();
  
  // Handle full Assertion-Reason text matches
  const text = officialAnswer.toLowerCase();
  if (text.includes("both assertion") && text.includes("correct explanation")) {
    return "A";
  }
  if (text.includes("both assertion") && text.includes("not the correct explanation")) {
    return "B";
  }
  if (text.includes("assertion is true") || text.includes("assertion (a) is true")) {
    return "C";
  }
  if (text.includes("assertion is false") || text.includes("assertion (a) is false") || text.includes("assertion is wrong") || text.includes("assertion (a) is wrong")) {
    return "D";
  }
  
  return "";
}

export default function PYQTestPage({ params }: { params: { subject: string, chapter: string } }) {
  const chapterNum = parseInt(params.chapter, 10);
  const allQuestions = getPYQsForChapter(params.subject, chapterNum);
  const router = useRouter();

  useEffect(() => {
    const storedClass = localStorage.getItem("edutrack_class");
    if (storedClass && storedClass !== "10") {
      router.push("/dashboard");
    }
  }, [router]);

  // Smart back — goes to wherever user came from (chapter page, subject hub, etc.)
  const goBack = () => router.back();

  const [phase, setPhase] = useState<QuizPhase>("category");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // ── MCQ Quiz State ──
  const [quizCount, setQuizCount] = useState<number>(10);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [timeTaken, setTimeTaken] = useState(0);
  const [quizResults, setQuizResults] = useState<{ q: PYQQuestion; chosen: string | null; correct: boolean; timeTaken: number }[]>([]);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  const allCategoryQuestions = allQuestions.filter(q => q.category === selectedCategory);
  // For MCQ quiz: slice to quizCount. For written, use all.
  const questions = selectedCategory === 'MCQ'
    ? allCategoryQuestions.slice(0, quizCount)
    : allCategoryQuestions;

  // ── Written Test State ──
  const [writtenIndex, setWrittenIndex] = useState(0);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<any>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  const gradient = subjectColors[params.subject as keyof typeof subjectColors] || "from-indigo-500 to-purple-600";
  const subjectName = params.subject || "Subject";

  // ── Timer ──
  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    startTimeRef.current = Date.now();
    setTimeLeft(SECONDS_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          stopTimer();
          setRevealed(true); // auto-reveal on timeout
          setTimeTaken(SECONDS_PER_QUESTION);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    if (phase === "mcq-quiz") startTimer();
    return stopTimer;
  }, [phase, quizIndex, startTimer, stopTimer]);

  // ── MCQ Quiz handlers ──
  function handleOptionSelect(label: string) {
    if (revealed) return;
    stopTimer();
    const taken = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeTaken(taken);
    setSelectedOption(label);
    setRevealed(true);
    const q = questions[quizIndex];
    const correct = getCorrectLetter(q.officialAnswer) === label;
    if (correct) setScore(s => s + 1);
  }

  function handleNextMCQ() {
    const q = questions[quizIndex];
    const correct = getCorrectLetter(q.officialAnswer) === selectedOption;
    setQuizResults(r => [...r, { q, chosen: selectedOption, correct, timeTaken }]);
    if (quizIndex + 1 >= questions.length) {
      stopTimer();
      setPhase("mcq-results");
    } else {
      setRevealed(false);
      setSelectedOption(null);
      setQuizIndex(i => i + 1);
    }
  }

  function resetMcqQuiz() {
    setQuizIndex(0);
    setScore(0);
    setRevealed(false);
    setSelectedOption(null);
    setQuizResults([]);
    setPhase("mcq-quiz");
  }

  // ── Written test handlers ──
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
      setEvaluation(null);
    }
  };
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
  };
  const getCroppedImg = (): string => {
    if (!completedCrop || !imgRef.current) return imgSrc;
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return imgSrc;
    ctx.drawImage(imgRef.current, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, completedCrop.width, completedCrop.height);
    return canvas.toDataURL('image/jpeg');
  };
  const handleEvaluate = async () => {
    if (!imgSrc) return;
    setIsEvaluating(true);
    setEvaluation(null);
    const base64Image = completedCrop ? getCroppedImg() : imgSrc;
    const q = questions[writtenIndex];
    try {
      const res = await fetch('/api/pyq-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.question, maxMarks: q.marks, officialAnswer: q.officialAnswer, imageBase64: base64Image })
      });
      if (!res.ok) throw new Error("Evaluation failed");
      setEvaluation(await res.json());
    } catch (err) { alert("Failed to evaluate. Please try again."); }
    finally { setIsEvaluating(false); }
  };

  const timerPercent = (timeLeft / SECONDS_PER_QUESTION) * 100;
  const timerColor = timeLeft > 20 ? "#22c55e" : timeLeft > 10 ? "#f59e0b" : "#ef4444";

  // ════════════════════════════════════
  // RENDERS
  // ════════════════════════════════════

  if (allQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No PYQs Available</h2>
          <button onClick={goBack} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  // ── CATEGORY SELECTION ──
  if (phase === "category") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <header className={`bg-gradient-to-r ${gradient} p-4 text-white shadow-md flex items-center gap-4 sticky top-0 z-50`}>
          <button onClick={goBack} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg">PYQ Categories</h1>
            <p className="text-white/80 text-xs font-semibold">{subjectName} • Chapter {chapterNum}</p>
          </div>
        </header>
        <main className="flex-1 max-w-4xl w-full mx-auto p-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">What do you want to practice?</h2>
          <p className="text-slate-500 mb-8">Select a category to begin your mock test.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <CategoryCard title="MCQs" desc="Timed Quiz — 45s per question" icon={<BookOpen className="w-8 h-8 text-blue-500" />} count={allQuestions.filter(q => q.category === 'MCQ').length}
              onClick={() => { setSelectedCategory('MCQ'); setPhase('mcq-setup'); }} />
            <CategoryCard title="Extra Practice" desc="Short Answers (1 & 2 Marks)" icon={<Dumbbell className="w-8 h-8 text-emerald-500" />} count={allQuestions.filter(q => q.category === 'ExtraPractice').length}
              onClick={() => { setSelectedCategory('ExtraPractice'); setWrittenIndex(0); setEvaluation(null); setImgSrc(''); setPhase('list'); }} />
            <CategoryCard title="3 Markers" desc="Medium Answer Type" icon={<Target className="w-8 h-8 text-amber-500" />} count={allQuestions.filter(q => q.category === 'ThreeMarker').length}
              onClick={() => { setSelectedCategory('ThreeMarker'); setWrittenIndex(0); setEvaluation(null); setImgSrc(''); setPhase('list'); }} />
            <CategoryCard title="5 Markers" desc="Long Answer Type" icon={<Trophy className="w-8 h-8 text-purple-500" />} count={allQuestions.filter(q => q.category === 'FiveMarker').length}
              onClick={() => { setSelectedCategory('FiveMarker'); setWrittenIndex(0); setEvaluation(null); setImgSrc(''); setPhase('list'); }} />
          </div>
        </main>
      </div>
    );
  }

  // ── MCQ SETUP SCREEN ──
  if (phase === "mcq-setup") {
    const totalMCQs = allQuestions.filter(q => q.category === 'MCQ').length;
    const presets = [5, 10, 15, totalMCQs].filter((v, i, a) => a.indexOf(v) === i && v <= totalMCQs);
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <header className={`bg-gradient-to-r ${gradient} p-4 text-white shadow-md flex items-center gap-4 sticky top-0 z-50`}>
          <button onClick={() => setPhase("category")} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg">MCQ Quiz Setup</h1>
            <p className="text-white/80 text-xs font-semibold">{subjectName} • Chapter {chapterNum}</p>
          </div>
        </header>

        <main className="flex-1 max-w-lg w-full mx-auto p-6 flex flex-col justify-center gap-8">
          {/* Quiz info card */}
          <div className={`bg-gradient-to-br ${gradient} rounded-3xl p-6 text-white text-center shadow-xl`}>
            <div className="text-5xl mb-3">🎯</div>
            <h2 className="text-2xl font-extrabold mb-1">MCQ Quiz</h2>
            <p className="text-white/70 text-sm">{totalMCQs} questions available • 45s per question</p>
          </div>

          {/* How many? */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-1">How many questions?</h3>
            <p className="text-slate-500 text-sm mb-5">Choose how many MCQs you want to attempt in this session.</p>

            {/* Preset buttons */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {presets.map(n => (
                <button
                  key={n}
                  onClick={() => setQuizCount(n)}
                  className={`py-4 rounded-2xl border-2 font-bold text-lg transition-all ${
                    quizCount === n
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 scale-105 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {n === totalMCQs ? `All (${n})` : `${n} Qs`}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-semibold text-slate-500 shrink-0">Custom:</span>
              <input
                type="number"
                min={1}
                max={totalMCQs}
                value={quizCount}
                onChange={e => setQuizCount(Math.min(totalMCQs, Math.max(1, parseInt(e.target.value) || 1)))}
                className="flex-1 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2 font-bold text-center text-lg focus:border-indigo-500 outline-none transition-colors"
              />
              <span className="text-sm font-semibold text-slate-400">/ {totalMCQs}</span>
            </div>

            {/* Start button */}
            <button
              onClick={() => {
                setQuizIndex(0); setScore(0); setRevealed(false);
                setSelectedOption(null); setQuizResults([]);
                setPhase('mcq-quiz');
              }}
              className={`w-full py-4 rounded-2xl font-extrabold text-lg text-white shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-r ${gradient}`}
            >
              Start Quiz — {quizCount} Questions 🚀
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">No questions in this category.</p>
          <button onClick={() => setPhase("category")} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Back</button>
        </div>
      </div>
    );
  }

  // ── WRITTEN QUESTION LIST ──
  if (phase === "list") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <header className={`bg-gradient-to-r ${gradient} p-4 text-white shadow-md flex items-center justify-between sticky top-0 z-50`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setPhase("category")} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg">{selectedCategory} Questions</h1>
              <p className="text-white/80 text-xs font-semibold">{subjectName} • Chapter {chapterNum}</p>
            </div>
          </div>
          <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">{questions.length} Qs</span>
        </header>
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-3">
          {questions.map((q, idx) => (
            <button key={q.id || idx} onClick={() => { setWrittenIndex(idx); setImgSrc(''); setEvaluation(null); setPhase('written-test'); }}
              className="w-full text-left bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-all flex flex-col gap-2 group">
              <div className="flex justify-between items-center">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Q{idx + 1}</span>
                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">{q.year} • {q.marks}M</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2">{q.question}</p>
              <div className="text-sm text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Solve <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </main>
      </div>
    );
  }

  // ── MCQ QUIZ ──
  if (phase === "mcq-quiz") {
    const q = questions[quizIndex];
    const { stem, options } = parseQuestion(q.question);
    const correctLetter = getCorrectLetter(q.officialAnswer);
    const progress = ((quizIndex) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        {/* Header */}
        <header className={`bg-gradient-to-r ${gradient} px-4 pt-4 pb-0 text-white shadow-md sticky top-0 z-50`}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => { stopTimer(); setPhase("category"); }} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="font-extrabold text-lg">Q {quizIndex + 1} / {questions.length}</p>
              <p className="text-white/70 text-xs">{subjectName} • MCQ Quiz</p>
            </div>
            {/* Timer Circle */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="17" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                <circle cx="20" cy="20" r="17" fill="transparent" stroke={timerColor} strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 17}`} strokeDashoffset={`${2 * Math.PI * 17 * (1 - timerPercent / 100)}`}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
              </svg>
              <span className="text-white font-black text-sm z-10">{timeLeft}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-6 flex flex-col gap-5">
          {/* Score badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold px-3 py-1 rounded-full text-sm">
              <Star className="w-4 h-4" /> Score: {score}
            </span>
            <span className="text-xs font-semibold text-slate-400">{q.year} Board</span>
          </div>

          {/* Question */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow border border-slate-200 dark:border-slate-800">
            <p className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{cleanMathText(stem)}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.length > 0 ? options.map(opt => {
              const isSelected = selectedOption === opt.label;
              const isCorrect = opt.label === correctLetter;
              let cls = "w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold transition-all duration-200 flex items-start gap-3 ";
              if (!revealed) {
                cls += isSelected
                  ? "border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-300 hover:bg-indigo-50/50";
              } else {
                if (isCorrect) cls += "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 scale-[1.01]";
                else if (isSelected) cls += "border-red-400 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
                else cls += "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 opacity-60";
              }
              return (
                <button key={opt.label} onClick={() => handleOptionSelect(opt.label)} disabled={revealed} className={cls}>
                  <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black border-2 ${
                    revealed && isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' :
                    revealed && isSelected && !isCorrect ? 'bg-red-400 border-red-400 text-white' :
                    'border-current'
                  }`}>{opt.label}</span>
                  <span className="flex-1 leading-snug">{cleanMathText(opt.text)}</span>
                  {revealed && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
                  {revealed && isSelected && !isCorrect && <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                </button>
              );
            }) : (
              // Fallback: generic A/B/C/D buttons if parsing fails
              ['A','B','C','D'].map(opt => (
                <button key={opt} onClick={() => handleOptionSelect(opt)} disabled={revealed}
                  className={`w-full py-4 rounded-2xl border-2 font-bold text-lg transition-all ${
                    revealed && opt === correctLetter ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30' :
                    revealed && opt === selectedOption ? 'border-red-400 bg-red-50 text-red-700' :
                    selectedOption === opt ? 'border-indigo-500 bg-indigo-50 text-indigo-700' :
                    'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                  }`}>
                  Option {opt}
                </button>
              ))
            )}
          </div>

          {/* Revealed: Show answer explanation + Next */}
          {revealed && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-emerald-200 dark:border-emerald-900/50 shadow space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h4 className="font-bold text-emerald-700 dark:text-emerald-400">Correct Answer: ({correctLetter})</h4>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{cleanMathText(q.officialAnswer || "")}</p>
              <button onClick={handleNextMCQ}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-colors mt-2">
                {quizIndex + 1 < questions.length ? "Next Question →" : "See Results 🏆"}
              </button>
            </div>
          )}

          {/* Timeout hint */}
          {timeLeft === 0 && !selectedOption && (
            <div className="text-center text-red-500 font-bold animate-pulse">⏰ Time's up!</div>
          )}
        </main>
      </div>
    );
  }

  // ── MCQ RESULTS ──
  if (phase === "mcq-results") {
    const percent = Math.round((score / questions.length) * 100);
    const emoji = percent >= 80 ? "🏆" : percent >= 60 ? "👍" : percent >= 40 ? "😐" : "📚";
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <header className={`bg-gradient-to-r ${gradient} p-4 text-white shadow-md flex items-center gap-4`}>
          <button onClick={() => setPhase("category")} className="p-2 bg-white/20 rounded-xl"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-bold text-lg">Quiz Results</h1>
        </header>
        <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-6 space-y-6">
          {/* Score Card */}
          <div className={`bg-gradient-to-br ${gradient} rounded-3xl p-8 text-white text-center shadow-2xl`}>
            <div className="text-7xl mb-3">{emoji}</div>
            <div className="text-6xl font-black mb-1">{score}<span className="text-3xl font-bold opacity-70">/{questions.length}</span></div>
            <p className="text-white/80 text-lg font-semibold">{percent}% Correct</p>
            <div className="mt-6 flex gap-3 justify-center">
              <button onClick={resetMcqQuiz} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-3 rounded-2xl font-bold transition-colors">
                <RotateCcw className="w-4 h-4" /> Retry Quiz
              </button>
              <button onClick={() => setPhase("category")} className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-3 rounded-2xl font-bold transition-colors">
                Change Category
              </button>
            </div>
          </div>

          {/* Per-question breakdown */}
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-lg">Question Breakdown</h3>
          <div className="space-y-3">
            {quizResults.map((r, i) => {
              const { stem } = parseQuestion(r.q.question);
              return (
                <div key={i} className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 ${r.correct ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-red-200 dark:border-red-900/50'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${r.correct ? 'bg-emerald-500 text-white' : 'bg-red-400 text-white'}`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 dark:text-slate-300 text-sm line-clamp-2">{stem}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs font-bold">
                        {r.chosen && <span className={`px-2 py-0.5 rounded-full ${r.correct ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>Your answer: ({r.chosen})</span>}
                        {!r.correct && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Correct: ({getCorrectLetter(r.q.officialAnswer)})</span>}
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{r.timeTaken}s</span>
                      </div>
                      {!r.correct && <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2">{r.q.officialAnswer}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ── WRITTEN TEST ──
  const writtenQ = questions[writtenIndex];
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className={`bg-gradient-to-r ${gradient} p-4 text-white shadow-md flex items-center justify-between sticky top-0 z-50`}>
        <div className="flex items-center gap-4">
          <button onClick={() => { setPhase("list"); setEvaluation(null); setImgSrc(''); }} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg">{selectedCategory}</h1>
            <p className="text-white/80 text-xs font-semibold">{subjectName} • Q{writtenIndex + 1}</p>
          </div>
        </div>
        <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">[{writtenQ.marks} Marks]</span>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{writtenQ.year} Board Exam</span>
          <p className="text-lg md:text-xl text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-4 whitespace-pre-wrap">{writtenQ.question}</p>
        </div>

        {!evaluation && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-500" /> Upload Your Answer
            </h3>
            <p className="text-sm text-slate-500 mb-5">Write your answer on paper, snap a photo, and get AI grading with the official answer key!</p>
            <input type="file" accept="image/*" capture="environment" onChange={onSelectFile} className="hidden" ref={fileInputRef} />
            {!imgSrc ? (
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <Camera className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-bold text-lg">Tap to open Camera / Upload</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden flex justify-center max-h-[60vh]">
                  <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={setCompletedCrop}>
                    <img ref={imgRef} alt="Answer" src={imgSrc} onLoad={onImageLoad} className="max-h-[60vh] w-auto object-contain" />
                  </ReactCrop>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setImgSrc('')} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 transition-colors">Retake</button>
                  <button onClick={handleEvaluate} disabled={isEvaluating} className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-70">
                    {isEvaluating ? <><Loader2 className="w-5 h-5 animate-spin" /> Evaluating...</> : <><Upload className="w-5 h-5" /> Submit for Grading</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {evaluation && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col md:flex-row gap-6 mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-8 border-indigo-100 dark:border-indigo-900/50">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-indigo-500" strokeDasharray="289" strokeDashoffset={289 - (289 * (evaluation.marksGained / writtenQ.marks))} strokeLinecap="round" />
                    </svg>
                    <div className="text-center z-10">
                      <span className="text-3xl font-black text-slate-800 dark:text-slate-200">{evaluation.marksGained}</span>
                      <span className="text-lg text-slate-400 font-bold">/{writtenQ.marks}</span>
                    </div>
                  </div>
                  <span className="mt-2 font-bold text-slate-500 uppercase tracking-widest text-xs">Marks</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {evaluation.marksGained === writtenQ.marks ? "Perfect Score! 🏆" : "Good Effort! 👍"}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{evaluation.feedback}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-4 border border-red-100 dark:border-red-900/30">
                  <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Errors</h4>
                  <p className="text-red-600/90 dark:text-red-300/80 text-sm leading-relaxed whitespace-pre-wrap">{evaluation.errors}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> How to Improve</h4>
                  <p className="text-emerald-600/90 dark:text-emerald-300/80 text-sm leading-relaxed whitespace-pre-wrap">{evaluation.improvements}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setPhase("list"); setEvaluation(null); setImgSrc(''); }} className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-300 transition-colors">← Back to List</button>
              {writtenIndex < questions.length - 1 && (
                <button onClick={() => { setWrittenIndex(i => i + 1); setEvaluation(null); setImgSrc(''); setPhase('written-test'); }} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">Next Question →</button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function CategoryCard({ title, desc, icon, count, onClick }: { title: string; desc: string; icon: React.ReactNode; count: number; onClick: () => void }) {
  const disabled = count === 0;
  return (
    <button onClick={onClick} disabled={disabled}
      className={`p-6 rounded-3xl border text-left transition-all flex flex-col gap-4 ${disabled ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1'}`}>
      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">{icon}</div>
      <div>
        <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200">{title}</h3>
        <p className="text-slate-500 text-sm mt-1">{desc}</p>
      </div>
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${disabled ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400'}`}>
          {count} Questions
        </span>
      </div>
    </button>
  );
}
