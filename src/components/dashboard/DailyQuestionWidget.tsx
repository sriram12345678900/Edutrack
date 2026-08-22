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
      <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl">
            <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          Daily Challenge
        </h2>
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
          +30 XP
        </span>
      </div>

      <p className="font-bold text-slate-800 dark:text-slate-200 mb-4">{questionData.question}</p>

      <div className="space-y-2.5">
        {questionData.options.map((opt: string, idx: number) => {
          let stateClass = "bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 cursor-pointer";
          
          if (isAnswered) {
            if (idx === questionData.answer) {
              stateClass = "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold";
            } else if (idx === selectedOption) {
              stateClass = "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 font-bold";
            } else {
              stateClass = "bg-slate-100/50 dark:bg-slate-800/30 border-transparent opacity-50 cursor-not-allowed";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${stateClass}`}
            >
              <span className="text-sm">{opt}</span>
              {isAnswered && idx === questionData.answer && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              {isAnswered && idx === selectedOption && idx !== questionData.answer && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
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
              <span className="text-indigo-500 uppercase tracking-widest text-[10px] block mb-1">Explanation</span>
              {questionData.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
