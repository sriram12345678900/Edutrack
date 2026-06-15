"use client";

import { useState, useEffect } from "react";
import { BookOpen, ChevronRight, Brain, Trophy, Book, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ncertLibrary, subjectColors } from "@/lib/ncert-books";
import { motion } from "framer-motion";

export default function SubjectHubPage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    const storedClass = localStorage.getItem("edutrack_class");
    if (storedClass && storedClass !== "10") {
      router.push("/dashboard");
    }
  }, [router]);

  // We'll focus on Class 10 books since we have PYQs for them
  const class10Books = ncertLibrary.find(c => c.class === 10)?.books || [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-8">
        <motion.header variants={item} className="space-y-4">
          {/* Back to Dashboard */}
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-full font-bold w-fit mx-auto">
              <Brain className="w-5 h-5" /> PYQ Subject Hub
            </div>
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Select a Subject to Practice
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              Choose a subject and chapter to start your AI-graded Previous Year Question (PYQ) mock test.
            </p>
          </div>
        </motion.header>

        {/* Subject Grid */}
        <motion.div variants={item} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {class10Books.map((book) => {
            const gradient = subjectColors[book.subject] || subjectColors.default || "from-slate-500 to-slate-600";
            const isSelected = selectedSubject === book.code;

            return (
              <div key={book.code} className="flex flex-col gap-4">
                <button
                  onClick={() => setSelectedSubject(isSelected ? null : book.code)}
                  className={`relative overflow-hidden rounded-3xl p-6 text-left transition-all duration-300 border-2 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                    isSelected 
                      ? 'border-indigo-500 shadow-indigo-500/20' 
                      : 'border-transparent bg-white dark:bg-slate-900 shadow-slate-200/50 dark:shadow-none'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl -mr-10 -mt-10`}></div>
                  
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 text-white shadow-lg`}>
                    <BookOpen className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{book.subject}</h3>
                  <p className="text-slate-500 text-sm mt-1">{book.title}</p>
                </button>

                {/* Chapter List (Expands when clicked) */}
                {isSelected && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg"
                  >
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Book className="w-4 h-4" /> Select Chapter
                      </h4>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2">
                      {Array.from({ length: book.chapters }, (_, i) => i + 1).map(ch => (
                        <Link key={ch} href={`/pyq/${book.code}/${ch}`}>
                          <div className="flex items-center justify-between p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-colors group cursor-pointer">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              Chapter {ch}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-3 py-1 rounded-full flex items-center gap-1">
                                <Trophy className="w-3 h-3" /> PYQ
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
