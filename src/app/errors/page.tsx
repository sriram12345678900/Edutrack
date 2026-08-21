"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, Sparkles, CheckCircle2, RotateCcw, Trash2, 
  Search, Filter, Plus, ArrowRight, BookOpen, AlertTriangle, 
  HelpCircle, Trophy, Zap, ChevronRight, Check, X, Brain, Flame
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "@/components/Confetti";
import { 
  getVaultMistakes, 
  saveVaultMistakes, 
  markMistakeMastered, 
  deleteVaultMistake, 
  recordMistake, 
  VaultMistake, 
  MistakeType 
} from "@/lib/error-vault";

export default function ErrorVaultPage() {
  const [mistakes, setMistakes] = useState<VaultMistake[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "mastered">("active");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [retestMode, setRetestMode] = useState(false);
  const [retestIndex, setRetestIndex] = useState(0);
  const [retestAnswer, setRetestAnswer] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState("Science");
  const [newChapter, setNewChapter] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newUserAnswer, setNewUserAnswer] = useState("");
  const [newCorrectAnswer, setNewCorrectAnswer] = useState("");
  const [newExplanation, setNewExplanation] = useState("");
  const [newType, setNewType] = useState<MistakeType>("conceptual");

  useEffect(() => {
    setMistakes(getVaultMistakes());
    const handler = () => setMistakes(getVaultMistakes());
    window.addEventListener("edutrack_vault_updated", handler);
    return () => window.removeEventListener("edutrack_vault_updated", handler);
  }, []);

  const filteredMistakes = mistakes.filter(m => {
    if (activeTab === "active" && m.status !== "active") return false;
    if (activeTab === "mastered" && m.status !== "mastered") return false;
    if (selectedSubject !== "All" && m.subject !== selectedSubject) return false;
    if (selectedType !== "All" && m.mistakeType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.question.toLowerCase().includes(q) || 
             m.chapter.toLowerCase().includes(q) || 
             m.correctAnswer.toLowerCase().includes(q);
    }
    return true;
  });

  const activeMistakesList = mistakes.filter(m => m.status === "active");
  const masteredCount = mistakes.filter(m => m.status === "mastered").length;
  const masteryRate = mistakes.length > 0 ? Math.round((masteredCount / mistakes.length) * 100) : 100;

  const handleStartRetest = () => {
    if (activeMistakesList.length === 0) return;
    setRetestIndex(0);
    setRetestAnswer("");
    setShowSolution(false);
    setRetestMode(true);
  };

  const handleNextRetest = (mastered: boolean) => {
    const currentMistake = activeMistakesList[retestIndex];
    if (mastered && currentMistake) {
      markMistakeMastered(currentMistake.id);
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 2500);
    }

    if (retestIndex + 1 < activeMistakesList.length) {
      setRetestIndex(prev => prev + 1);
      setRetestAnswer("");
      setShowSolution(false);
    } else {
      setRetestMode(false);
      setMistakes(getVaultMistakes());
    }
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newCorrectAnswer.trim()) return;

    recordMistake({
      subject: newSubject,
      chapter: newChapter || "General",
      question: newQuestion,
      userAnswer: newUserAnswer || undefined,
      correctAnswer: newCorrectAnswer,
      explanation: newExplanation || "Standard textbook concept.",
      mistakeType: newType
    });

    setMistakes(getVaultMistakes());
    setShowAddModal(false);
    setNewQuestion("");
    setNewUserAnswer("");
    setNewCorrectAnswer("");
    setNewExplanation("");
    setNewChapter("");
  };

  const getTypeBadge = (type: MistakeType) => {
    switch (type) {
      case "conceptual":
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">🧠 Conceptual Gap</span>;
      case "calculation":
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">⚡ Calculation Error</span>;
      case "formula":
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">📐 Formula Slip</span>;
      default:
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">🔍 Misread Question</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8">
      <Confetti active={confettiActive} />

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black tracking-wider uppercase mb-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Error Vault • Mistake Notebook
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight dark:text-white text-slate-900">
              Your Intelligent Error Vault
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Every mistake from Quizzes, PYQs, and Mock Tests is cataloged here for spaced active recall until mastered.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 text-indigo-500" /> Add Entry
            </button>
            <button
              onClick={handleStartRetest}
              disabled={activeMistakesList.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white text-sm font-black shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Launch Re-Test ({activeMistakesList.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Mistakes</span>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-white">{mistakes.length}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Recorded across all chapters</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Needs Revision</span>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-rose-500">{activeMistakesList.length}</div>
            <span className="text-[11px] text-rose-400 mt-1 block">Active recall candidates</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Mastered</span>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-emerald-500">{masteredCount}</div>
            <span className="text-[11px] text-emerald-400 mt-1 block">+50 XP earned per mastery</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Recovery Rate</span>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-indigo-500">{masteryRate}%</div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-emerald-500 h-full rounded-full transition-all" style={{ width: `${masteryRate}%` }} />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {retestMode && activeMistakesList.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
              >
                <button 
                  onClick={() => setRetestMode(false)}
                  className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      Re-Test Mode
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Question {retestIndex + 1} of {activeMistakesList.length}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-indigo-400">
                    {activeMistakesList[retestIndex]?.subject} • {activeMistakesList[retestIndex]?.chapter}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Question:</span>
                    <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                      {activeMistakesList[retestIndex]?.question}
                    </p>
                  </div>

                  {activeMistakesList[retestIndex]?.userAnswer && (
                    <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
                      <span className="font-bold">Your previous wrong attempt: </span>
                      {activeMistakesList[retestIndex]?.userAnswer}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Try Answering Again:
                    </label>
                    <textarea
                      value={retestAnswer}
                      onChange={(e) => setRetestAnswer(e.target.value)}
                      placeholder="Type your corrected answer or derivation here..."
                      className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-28"
                    />
                  </div>

                  {!showSolution ? (
                    <button
                      onClick={() => setShowSolution(true)}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all"
                    >
                      Reveal Correct Solution & Explanation
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 space-y-2">
                        <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wide">
                          <Check className="w-4 h-4" /> Official Correct Solution:
                        </div>
                        <p className="text-sm font-semibold leading-relaxed">
                          {activeMistakesList[retestIndex]?.correctAnswer}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-emerald-500/20">
                          <strong className="text-emerald-500">Concept Note:</strong> {activeMistakesList[retestIndex]?.explanation}
                        </p>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleNextRetest(false)}
                          className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all"
                        >
                          Still Needs Practice ⏱
                        </button>
                        <button
                          onClick={() => handleNextRetest(true)}
                          className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Trophy className="w-4 h-4 text-yellow-300" /> Mastered! (+50 XP)
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "active" ? "bg-white dark:bg-slate-900 text-rose-500 shadow-sm" : "text-slate-500"
              }`}
            >
              Needs Practice ({activeMistakesList.length})
            </button>
            <button
              onClick={() => setActiveTab("mastered")}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "mastered" ? "bg-white dark:bg-slate-900 text-emerald-500 shadow-sm" : "text-slate-500"
              }`}
            >
              Mastered ({masteredCount})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "all" ? "bg-white dark:bg-slate-900 text-indigo-500 shadow-sm" : "text-slate-500"
              }`}
            >
              All ({mistakes.length})
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto items-center">
            <div className="relative flex-1 md:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search mistakes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Subjects</option>
              <option value="Science">Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Social Science">Social Science</option>
              <option value="English">English</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Mistake Types</option>
              <option value="conceptual">Conceptual Gap</option>
              <option value="calculation">Calculation Error</option>
              <option value="formula">Formula Slip</option>
              <option value="misread">Misread Question</option>
            </select>
          </div>
        </div>

        {filteredMistakes.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Vault is Clear for this Filter!</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              No active mistakes found. As you take Quizzes and Mock Tests, any challenging questions will automatically be queued here for mastery.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMistakes.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(m.mistakeType)}
                    <span className="text-xs font-black text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                      {m.subject}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {m.chapter}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {m.status === "mastered" ? (
                      <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> Retries: {m.retriesCount}
                      </span>
                    )}

                    <button
                      onClick={() => {
                        deleteVaultMistake(m.id);
                        setMistakes(getVaultMistakes());
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete mistake"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Question:</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    {m.question}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  {m.userAnswer && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/15 text-xs text-rose-800 dark:text-rose-300">
                      <span className="font-extrabold uppercase text-[10px] tracking-wider block text-rose-500 mb-1">What tripped you up:</span>
                      {m.userAnswer}
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider block text-emerald-500 mb-1">Official Solution:</span>
                    {m.correctAnswer}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
                  <strong className="text-indigo-400">Concept Fix:</strong> {m.explanation}
                </div>

                {m.status === "active" && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        markMistakeMastered(m.id);
                        setConfettiActive(true);
                        setTimeout(() => setConfettiActive(false), 2500);
                        setMistakes(getVaultMistakes());
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/25 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Mastered (+50 XP)
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative"
              >
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-extrabold dark:text-white text-slate-900 mb-1">
                  Log Custom Mistake or Doubt
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Add tricky textbook questions to review them later in active recall sessions.
                </p>

                <form onSubmit={handleCreateManual} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Subject</label>
                      <select
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      >
                        <option value="Science">Science</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Social Science">Social Science</option>
                        <option value="English">English</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Mistake Type</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as MistakeType)}
                        className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      >
                        <option value="conceptual">Conceptual Gap</option>
                        <option value="calculation">Calculation Error</option>
                        <option value="formula">Formula Slip</option>
                        <option value="misread">Misread Question</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Chapter / Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. Life Processes, Trigonometry"
                      value={newChapter}
                      onChange={(e) => setNewChapter(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Question Prompt *</label>
                    <textarea
                      required
                      placeholder="Enter the exact question or problem statement..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs h-20"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Correct Answer / Key Formula *</label>
                    <textarea
                      required
                      placeholder="Enter the correct solution..."
                      value={newCorrectAnswer}
                      onChange={(e) => setNewCorrectAnswer(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs h-16"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Explanation / Why this happened</label>
                    <input
                      type="text"
                      placeholder="e.g. Forgot to reverse sign when multiplying by negative number"
                      value={newExplanation}
                      onChange={(e) => setNewExplanation(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
                    >
                      Save to Vault
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
