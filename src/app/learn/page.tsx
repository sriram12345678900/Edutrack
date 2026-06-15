"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calculator, Globe, Atom, FlaskConical, Dna, Landmark, Vote, TrendingUp, MessageCircle, BookOpen, Book } from "lucide-react";
import { motion } from "framer-motion";

export default function LearnHub() {
  const [userClass, setUserClass] = useState<number>(10);

  useEffect(() => {
    const stored = localStorage.getItem("edutrack_class");
    if (stored) {
      setUserClass(parseInt(stored, 10));
    }
  }, []);

  const subjectGroups = [
    {
      category: "Science",
      subjects: [
        { name: "Physics", icon: Atom, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", chapters: 4 },
        { name: "Chemistry", icon: FlaskConical, color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400", chapters: 4 },
        { name: "Biology", icon: Dna, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", chapters: 5 }
      ]
    },
    {
      category: "Social Science",
      subjects: [
        { name: "History", icon: Landmark, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", chapters: 5 },
        { name: "Geography", icon: Globe, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400", chapters: 7 },
        { name: "Political Science", icon: Vote, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400", chapters: 5 },
        { name: "Economics", icon: TrendingUp, color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400", chapters: 5 }
      ]
    },
    {
      category: "English",
      subjects: [
        { name: "English", icon: Book, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", chapters: 28 },
      ]
    },
    {
      category: "Mathematics",
      subjects: [
        { name: "Mathematics", icon: Calculator, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", chapters: 14 }
      ]
    }
  ];

  // Stagger variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-10"
    >
      <motion.header variants={item} className="relative p-8 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
            Subjects Hub
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Class {userClass} CBSE Curriculum</p>
        </div>
      </motion.header>

      {subjectGroups.map((group) => (
        <motion.section variants={item} key={group.category} className="space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span className="w-8 h-1 bg-indigo-500 rounded-full"></span>
            {group.category}
          </h2>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {group.subjects.map((subject) => {
              const Icon = subject.icon;

              if (subject.name === "English") {
                return (
                  <motion.div variants={item} key={subject.name} className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start gap-5 mb-8">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${subject.color}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-1 text-slate-800 dark:text-slate-100">English</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Which curriculum does your school follow?</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Link href="/learn/english-communicative" className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                          <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Communicative</p>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">14 Chapters</p>
                        </div>
                      </Link>

                      <Link href="/learn/english-literature" className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 hover:border-fuchsia-400 dark:hover:border-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-fuchsia-600 group-hover:text-white transition-all">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">Lang & Lit</p>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">28 Chapters</p>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div variants={item} key={subject.name} className="h-full">
                  <Link href={`/learn/${subject.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="group block h-full">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl h-full flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                      
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${subject.color}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{subject.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 flex-grow">{subject.chapters} Chapters</p>
                      
                      <div className="mt-auto bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                        <div className="flex flex-col gap-1 mb-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Progress</p>
                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">In Progress</p>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full relative" style={{ width: `${Math.random() * 60 + 10}%` }}>
                            <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>
      ))}
    </motion.div>
  );
}
