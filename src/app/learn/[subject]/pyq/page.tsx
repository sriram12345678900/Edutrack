"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Calendar, Award, Loader2, FileText, Download } from "lucide-react";

export default function PYQPage({ params }: { params: { subject: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chapter-pyq" | "full-paper">("chapter-pyq");
  const [pyqs, setPyqs] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const subjectName = params.subject.charAt(0).toUpperCase() + params.subject.slice(1);

  useEffect(() => {
    const storedClass = localStorage.getItem("edutrack_class");
    if (storedClass && storedClass !== "10") {
      router.push(`/learn/${params.subject}`);
    }
  }, [router, params.subject]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/pyq?subject=${subjectName}&type=${activeTab}`);
        const data = await res.json();
        if (activeTab === "chapter-pyq") {
          setPyqs(data.questions || []);
        } else {
          setPapers(data.papers || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [subjectName, activeTab]);

  return (
    <div className="space-y-8">
      <header>
        <Link href={`/learn/${params.subject}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-2 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to {subjectName}
        </Link>
        <h1 className="text-3xl font-bold">Past Year Questions (PYQs)</h1>
        <p className="text-slate-600 dark:text-slate-400">Fetched directly from official sources for {subjectName} Class 10</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("chapter-pyq")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "chapter-pyq" 
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Chapter-wise PYQs
        </button>
        <button
          onClick={() => setActiveTab("full-paper")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "full-paper" 
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Full Question Papers
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <p>Scraping web sources...</p>
        </div>
      ) : activeTab === "chapter-pyq" ? (
        <div className="space-y-6">
          {pyqs.map((pyq) => (
            <div key={pyq.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4" /> CBSE {pyq.year}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                    <Award className="w-4 h-4" /> {pyq.marks} Marks
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-lg font-medium leading-relaxed mb-6">{pyq.question}</p>
                <details className="group">
                  <summary className="list-none flex items-center gap-2 cursor-pointer text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                    View Model Solution
                  </summary>
                  <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <p className="font-medium whitespace-pre-wrap">{pyq.solution}</p>
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {papers.map((paper) => (
            <div key={paper.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                  PDF
                </span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{paper.title}</h3>
                <p className="text-sm text-slate-500">Board Exam • Year {paper.year}</p>
              </div>
              <a 
                href={paper.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 py-3 rounded-xl font-bold transition-colors"
              >
                <Download className="w-4 h-4" /> Download Paper
              </a>
            </div>
          ))}
        </div>
      )}

      {activeTab === "chapter-pyq" && (
        <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Practice these on paper!</h3>
            <p className="text-indigo-100">Board exams require good handwriting and proper formatting. Time yourself while answering.</p>
          </div>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap">
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
