"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  BarChart3, ArrowLeft, Sparkles, AlertTriangle, 
  CheckCircle2, Download, Printer, Filter, BookOpen, 
  HelpCircle, ChevronRight, FileText, RefreshCw, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConceptDiagnostic {
  id: string;
  chapter: string;
  concept: string;
  subject: 'Science' | 'Mathematics';
  sectionA: number; // percentage mastery
  sectionB: number;
  sectionC: number;
  aggregate: number;
  commonMisconception: string;
  remedialTips: string[];
}

const DIAGNOSTIC_DATA: ConceptDiagnostic[] = [
  {
    id: 'diag-1',
    subject: 'Science',
    chapter: 'Light: Reflection & Refraction',
    concept: 'Cartesian Sign Convention & Lens Formula',
    sectionA: 42,
    sectionB: 38,
    sectionC: 45,
    aggregate: 41,
    commonMisconception: 'Students repeatedly use positive focal length for concave mirrors/lenses and fail to apply -u for real objects.',
    remedialTips: [
      'Emphasize the origin rule: Optical centre / Pole is (0,0). Left is negative, right is positive.',
      'Provide 5 dedicated sign-convention drill questions before full numericals.'
    ]
  },
  {
    id: 'diag-2',
    subject: 'Science',
    chapter: 'Chemical Reactions & Equations',
    concept: 'Redox Reactions (Oxidizing vs Reducing Agents)',
    sectionA: 54,
    sectionB: 49,
    sectionC: 58,
    aggregate: 53,
    commonMisconception: 'Confusing the substance oxidized with the oxidizing agent (substance reduced is the oxidizing agent).',
    remedialTips: [
      'Mnemonics: OIL RIG (Oxidation Is Loss, Reduction Is Gain of electrons).',
      'The agent is the reactant that CAUSES the process in the other substance.'
    ]
  },
  {
    id: 'diag-3',
    subject: 'Science',
    chapter: 'Electricity',
    concept: 'Resistors in Parallel vs Series Power Dissipation',
    sectionA: 78,
    sectionB: 72,
    sectionC: 75,
    aggregate: 75,
    commonMisconception: 'Using P = I²R instead of P = V²/R when analyzing devices connected in parallel across constant mains voltage.',
    remedialTips: [
      'Reiterate that household circuits are in parallel so Voltage V is constant for all appliances.'
    ]
  },
  {
    id: 'diag-4',
    subject: 'Science',
    chapter: 'Life Processes',
    concept: 'Double Circulation & Heart Chamber Pressures',
    sectionA: 88,
    sectionB: 84,
    sectionC: 86,
    aggregate: 86,
    commonMisconception: 'Reversing pulmonary artery and pulmonary vein oxygenation states.',
    remedialTips: [
      'Pulmonary artery is the ONLY artery carrying deoxygenated blood away from heart.'
    ]
  },
  {
    id: 'diag-5',
    subject: 'Mathematics',
    chapter: 'Quadratic Equations',
    concept: 'Nature of Roots & Discriminant Analysis',
    sectionA: 48,
    sectionB: 44,
    sectionC: 52,
    aggregate: 48,
    commonMisconception: 'Equating D = 0 with "no roots" rather than "real and equal roots".',
    remedialTips: [
      'Graphical connection: D=0 touches x-axis at 1 point; D>0 cuts at 2 points; D<0 floats above/below.'
    ]
  },
  {
    id: 'diag-6',
    subject: 'Mathematics',
    chapter: 'Triangles',
    concept: 'Basic Proportionality Theorem (Thales Theorem)',
    sectionA: 62,
    sectionB: 59,
    sectionC: 66,
    aggregate: 62,
    commonMisconception: 'Assuming converse of BPT is always applicable without verifying ratio equality.',
    remedialTips: [
      'Step-by-step ratio matching before claiming line is parallel to third side.'
    ]
  },
  {
    id: 'diag-7',
    subject: 'Mathematics',
    chapter: 'Circles',
    concept: 'Tangents from External Point & Subtended Angles',
    sectionA: 82,
    sectionB: 85,
    sectionC: 80,
    aggregate: 82,
    commonMisconception: 'Forgetting that radius through point of contact is perpendicular to tangent.',
    remedialTips: [
      'Always mark the 90° right angle symbol first when drawing radius to tangent contact point.'
    ]
  }
];

export default function TeacherAnalyticsPage() {
  const [selectedSubject, setSelectedSubject] = useState<'All' | 'Science' | 'Mathematics'>('All');
  const [selectedConcept, setSelectedConcept] = useState<ConceptDiagnostic | null>(DIAGNOSTIC_DATA[0]);
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false);
  const [worksheetGenerated, setWorksheetGenerated] = useState(false);

  const filteredConcepts = DIAGNOSTIC_DATA.filter(c => 
    selectedSubject === 'All' ? true : c.subject === selectedSubject
  );

  const getHeatmapColor = (score: number) => {
    if (score < 50) return 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30';
    if (score < 75) return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  };

  const handleGenerateRemedial = () => {
    setIsGeneratingWorksheet(true);
    setTimeout(() => {
      setIsGeneratingWorksheet(false);
      setWorksheetGenerated(true);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link 
              href="/teacher" 
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-500">Formative Assessment Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-500" />
            Diagnostic Concept Heatmap & Remedial Gen
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            Pinpoint exact learning gaps and misconceptions across Class 10 sections. Automatically produce targeted remedial worksheets for students falling behind in red-zone concepts.
          </p>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
          {(['All', 'Science', 'Mathematics'] as const).map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                selectedSubject === sub 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[10px] font-black uppercase text-slate-400">Class 10 Batch Mastery</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">65.2%</p>
          <span className="text-[11px] font-bold text-emerald-500">↑ 4.2% from last mock test</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[10px] font-black uppercase text-rose-500">Critical Red-Zone Concepts</span>
          <p className="text-2xl font-black text-rose-500 mt-1">2 Topics</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Sign Convention & Nature of Roots</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[10px] font-black uppercase text-amber-500">Moderate Retention</span>
          <p className="text-2xl font-black text-amber-500 mt-1">2 Topics</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Redox Reactions & BPT Theorem</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[10px] font-black uppercase text-emerald-500">Strong Concepts (&gt;80%)</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">3 Topics</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Double Circulation & Circle Tangents</span>
        </div>
      </div>

      {/* Main Diagnostic Heatmap & Remedial Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Heatmap Matrix Table (8 Cols) */}
        <div className="lg:col-span-8 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Class 10 Concept Diagnostic Matrix
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> &lt;50% Critical</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 50-75% Medium</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> &gt;75% Strong</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-black uppercase text-[10px]">
                  <th className="py-2.5 px-3">Sub-Concept & Chapter</th>
                  <th className="py-2.5 px-2 text-center">Sec 10-A</th>
                  <th className="py-2.5 px-2 text-center">Sec 10-B</th>
                  <th className="py-2.5 px-2 text-center">Sec 10-C</th>
                  <th className="py-2.5 px-2 text-center font-bold text-slate-700 dark:text-slate-200">Aggregate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredConcepts.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => {
                      setSelectedConcept(item);
                      setWorksheetGenerated(false);
                    }}
                    className={`cursor-pointer transition-colors ${
                      selectedConcept?.id === item.id 
                        ? 'bg-indigo-500/10 dark:bg-indigo-500/15' 
                        : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-slate-900 dark:text-white line-clamp-1">{item.concept}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10 font-bold">{item.subject}</span>
                        <span>{item.chapter}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded-lg font-black border text-[11px] ${getHeatmapColor(item.sectionA)}`}>
                        {item.sectionA}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded-lg font-black border text-[11px] ${getHeatmapColor(item.sectionB)}`}>
                        {item.sectionB}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded-lg font-black border text-[11px] ${getHeatmapColor(item.sectionC)}`}>
                        {item.sectionC}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-black">
                      <span className={`px-2.5 py-1 rounded-lg font-black border text-[11px] ${getHeatmapColor(item.aggregate)}`}>
                        {item.aggregate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Remedial Intervention Action Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {selectedConcept ? (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-500">
                  Concept Deep-Dive
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getHeatmapColor(selectedConcept.aggregate)}`}>
                  {selectedConcept.aggregate}% Avg
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {selectedConcept.concept}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedConcept.chapter} • {selectedConcept.subject}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs space-y-1.5">
                <span className="font-black flex items-center gap-1.5 uppercase text-[10px] text-rose-500">
                  <AlertTriangle className="w-3.5 h-3.5" /> High-Frequency Student Misconception:
                </span>
                <p className="font-medium leading-relaxed">
                  {selectedConcept.commonMisconception}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-400">Recommended Pedagogical Tips:</span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  {selectedConcept.remedialTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 1-Click Remedial Worksheet Generator */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/10">
                {!worksheetGenerated ? (
                  <button
                    onClick={handleGenerateRemedial}
                    disabled={isGeneratingWorksheet}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    {isGeneratingWorksheet ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating Targeted Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Remedial Worksheet (PDF)
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Targeted 5-Question Remedial Worksheet Ready!
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.print()}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                      <button
                        onClick={() => alert(`Downloading Remedial_Worksheet_${selectedConcept.concept.replace(/\s+/g, '_')}.pdf`)}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center text-slate-400 text-xs">
              Select a concept from the diagnostic heatmap to inspect student errors.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
