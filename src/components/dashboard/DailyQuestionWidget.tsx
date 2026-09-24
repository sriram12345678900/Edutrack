"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Award } from "lucide-react";
import { useGamificationStore } from "@/store/useGamificationStore";
import Confetti from "@/components/Confetti";

const QUESTIONS = [
  {
    question: "Which of the following is a chemical change?",
    options: ["Melting of ice", "Rusting of iron", "Boiling of water", "Dissolving salt in water"],
    answer: 1,
    explanation: "Rusting of iron is a chemical change because a new substance (iron oxide) is formed."
  },
  {
    question: "The pH of a neutral solution at 25°C is:",
    options: ["0", "14", "7", "1"],
    answer: 2,
    explanation: "A neutral solution has a pH of exactly 7."
  },
  {
    question: "In human beings, the respiratory pigment is:",
    options: ["Chlorophyll", "Hemoglobin", "Carotene", "Melanin"],
    answer: 1,
    explanation: "Hemoglobin in red blood cells carries oxygen throughout the body."
  }
];

export function DailyQuestionWidget() {
  const { awardXP } = useGamificationStore();
  
  const [questionData, setQuestionData] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    // Check if answered today
    const lastAnswered = localStorage.getItem("edutrack_daily_q_date");
    const today = new Date().toDateString();
    
    if (lastAnswered === today) {
      setIsAnswered(true);
      setIsCorrect(localStorage.getItem("edutrack_daily_q_result") === "correct");
      // Pick the same question for the day to show the result
      const qIndex = parseInt(localStorage.getItem("edutrack_daily_q_index") || "0");
      setQuestionData(QUESTIONS[qIndex % QUESTIONS.length]);
      setSelectedOption(parseInt(localStorage.getItem("edutrack_daily_q_selected") || "0"));
    } else {
      // Pick a random question for today based on date
      const todayNum = new Date().getDate();
      setQuestionData(QUESTIONS[todayNum % QUESTIONS.length]);
    }
  }, []);

  const handleSelect = (index: number) => {
    if (isAnswered || !questionData) return;
    
    setSelectedOption(index);
    setIsAnswered(true);
    
    const correct = index === questionData.answer;
    setIsCorrect(correct);
    
    // Save state
    const today = new Date().toDateString();
    localStorage.setItem("edutrack_daily_q_date", today);
    localStorage.setItem("edutrack_daily_q_result", correct ? "correct" : "incorrect");
    
    // Find index of question
    const qIndex = QUESTIONS.findIndex(q => q.question === questionData.question);
    localStorage.setItem("edutrack_daily_q_index", qIndex.toString());
    localStorage.setItem("edutrack_daily_q_selected", index.toString());
    
    if (correct) {
      awardXP(30);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      // Dispatch custom event if we want the dashboard to show level up
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("edutrack_xp_updated", { detail: { xp: 30 } }));
      }
    }
  };

  if (!questionData) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-glass-panel p-6 relative overflow-hidden"
    >
      <Confetti active={showConfetti} />
      <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30 shadow-inner">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          Daily Challenge
        </h2>
        <div className="flex flex-col items-end">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            +30 XP
          </span>
        </div>
      </div>

      <p className="text-lg font-bold text-slate-800 dark:text-white mb-6 leading-relaxed relative z-10">{questionData.question}</p>

      <div className="space-y-3 relative z-10">
        {questionData.options.map((opt: string, idx: number) => {
          let stateClass = "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/10 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-500/10 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm";
          
          if (isAnswered) {
            if (idx === questionData.answer) {
              stateClass = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm ring-1 ring-emerald-500/20";
            } else if (idx === selectedOption) {
              stateClass = "bg-red-50 dark:bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 font-bold shadow-sm";
            } else {
              stateClass = "bg-slate-100/50 dark:bg-slate-900/20 border-transparent opacity-40 cursor-not-allowed text-slate-400";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
              className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group ${stateClass}`}
            >
              <span className="text-sm font-semibold">{opt}</span>
              <div className="flex items-center">
                {!isAnswered && (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-amber-500 transition-colors" />
                )}
                {isAnswered && idx === questionData.answer && <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 drop-shadow-md" />}
                {isAnswered && idx === selectedOption && idx !== questionData.answer && <XCircle className="w-6 h-6 text-red-500 shrink-0 drop-shadow-md" />}
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10"
          >
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-[10px] block mb-1">Explanation</span>
              {questionData.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
