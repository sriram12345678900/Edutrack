"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, Download, Sparkles, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  type: "mcq" | "fill_in" | "short_answer";
  question: string;
  options?: string[];
  answer: string;
}

interface Worksheet {
  title: string;
  topic: string;
  subject: string;
  classLevel: string;
  difficulty: string;
  questions: Question[];
}

export default function WorksheetGenerator() {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("Science");
  const [classLevel, setClassLevel] = useState("10");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionsCount, setQuestionsCount] = useState(10);
  
  const [loading, setLoading] = useState(false);
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setLoading(true);
    
    try {
      const res = await fetch("/api/teacher/worksheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, subject, classLevel, difficulty, questionsCount })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setWorksheet(data.worksheet);
    } catch (err: any) {
      alert("Failed to generate: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 pb-20 print:p-0 print:bg-white">
      {/* ── HEADER (Hidden in Print) ── */}
      <header className="flex items-center gap-4 mb-8 print:hidden">
        <Link href="/teacher" className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <FileText className="w-7 h-7 text-indigo-500" />
            AI Worksheet Generator
          </h1>
          <p className="text-slate-500 font-medium text-sm">Instantly create custom assignments and test papers.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── CONTROLS (Hidden in Print) ── */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Topic</label>
              <input
                required autoFocus value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Life Processes, Trigonometry"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium">
                  <option value="Science">Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="English">English</option>
                  <option value="Social Science">Social Science</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Class Level</label>
                <select value={classLevel} onChange={e => setClassLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium">
                  {["6","7","8","9","10","11","12"].map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Questions</label>
                <input
                  type="number" min={5} max={25} required value={questionsCount} onChange={e => setQuestionsCount(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium"
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 mt-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate Worksheet</>}
            </button>
          </form>

          {worksheet && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Include Answers</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={showAnswers} onChange={() => setShowAnswers(!showAnswers)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              <button onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold py-3 rounded-xl transition-colors">
                <Printer className="w-5 h-5" /> Print / Save PDF
              </button>
            </div>
          )}
        </div>

        {/* ── PREVIEW (Printable Area) ── */}
        <div className="lg:col-span-2">
          {!worksheet && !loading && (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 print:hidden">
              <FileText className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-medium text-lg">Your generated worksheet will appear here.</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[400px] border-2 border-slate-200 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center text-indigo-500 print:hidden">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-bold animate-pulse">Generating custom curriculum...</p>
            </div>
          )}

          {worksheet && !loading && (
            <div className="bg-white text-black p-8 md:p-12 shadow-xl border border-slate-200 rounded-sm print:shadow-none print:border-none print:p-0 min-h-[800px] max-w-[210mm] mx-auto">
              
              {/* Worksheet Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-black">
                <h1 className="text-3xl font-black mb-2">{worksheet.title}</h1>
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider text-slate-600">
                  <span>Class: {worksheet.classLevel}</span>
                  <span>Subject: {worksheet.subject}</span>
                  <span>Topic: {worksheet.topic}</span>
                </div>
              </div>

              {/* Student Details (Only if not showing answers) */}
              {!showAnswers && (
                <div className="flex justify-between gap-8 mb-10 text-lg">
                  <div className="flex-1 flex items-end gap-2">
                    <span className="font-bold shrink-0">Name:</span>
                    <div className="flex-1 border-b border-black"></div>
                  </div>
                  <div className="w-32 flex items-end gap-2">
                    <span className="font-bold shrink-0">Date:</span>
                    <div className="flex-1 border-b border-black"></div>
                  </div>
                  <div className="w-32 flex items-end gap-2">
                    <span className="font-bold shrink-0">Score:</span>
                    <div className="flex-1 border-b border-black"></div>
                  </div>
                </div>
              )}

              {showAnswers && (
                <div className="bg-emerald-100 text-emerald-800 font-bold p-3 text-center mb-8 uppercase tracking-widest print:border print:border-emerald-800">
                  --- Teacher Answer Key ---
                </div>
              )}

              {/* Questions */}
              <div className="space-y-8 text-[15px]">
                {worksheet.questions.map((q, i) => (
                  <div key={q.id} className="break-inside-avoid">
                    <div className="flex gap-2">
                      <span className="font-bold w-6">{i + 1}.</span>
                      <div className="flex-1">
                        <p className="font-medium mb-3">{q.question}</p>
                        
                        {q.type === "mcq" && q.options && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                            {q.options.map((opt, idx) => {
                              const letter = String.fromCharCode(65 + idx);
                              const isCorrect = showAnswers && q.answer.includes(opt);
                              return (
                                <div key={idx} className={`flex items-center gap-2 p-1.5 rounded ${isCorrect ? 'bg-emerald-100 font-bold' : ''}`}>
                                  <div className="w-6 h-6 rounded-full border border-black flex items-center justify-center shrink-0">
                                    {letter}
                                  </div>
                                  <span>{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.type === "fill_in" && (
                          <div className="ml-4 mt-2">
                            {showAnswers ? (
                              <span className="font-bold text-emerald-700 underline decoration-2">{q.answer}</span>
                            ) : (
                              <div className="h-6 border-b border-black w-64 inline-block"></div>
                            )}
                          </div>
                        )}

                        {q.type === "short_answer" && (
                          <div className="ml-4 mt-2">
                            {showAnswers ? (
                              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-emerald-800 italic font-medium">
                                Ans: {q.answer}
                              </div>
                            ) : (
                              <div className="space-y-6 mt-6 mb-4">
                                <div className="border-b border-slate-300 w-full"></div>
                                <div className="border-b border-slate-300 w-full"></div>
                                <div className="border-b border-slate-300 w-full"></div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Standalone Answer Display for MCQ if not inline highlighted */}
                        {showAnswers && q.type === "mcq" && (
                          <div className="ml-4 mt-3 text-emerald-700 font-bold italic text-sm">
                            Ans: {q.answer}
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
