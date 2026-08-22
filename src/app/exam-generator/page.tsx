"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Printer, Download, Sparkles, CheckSquare, Settings2, 
  BookOpen, Clock, Award, Shield, Copy, Check, Eye, EyeOff, RefreshCw
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

export default function ExamGeneratorPage() {
  const [selectedKey, setSelectedKey] = useState<string>("Class 10 - Science");
  const [showMarkingScheme, setShowMarkingScheme] = useState(true);
  const [copied, setCopied] = useState(false);

  const paper = SAMPLE_PAPERS[selectedKey];

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
        
        {/* Banner (Hidden during Print) */}
        <div className="print:hidden relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/40 via-teal-900/40 to-slate-900/60 border border-emerald-500/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                CBSE/ICSE Board Exam & Rubric Generator
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                1-Click <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Exam & Rubric</span> Generator
              </h1>
              <p className="text-slate-300 text-xs md:text-sm max-w-xl">
                Generate official board-pattern question papers with blueprints (Sections A–E), step-wise marking schemes, model answers, and printable PDF formats.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowMarkingScheme(!showMarkingScheme)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
              >
                {showMarkingScheme ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                {showMarkingScheme ? "Hide Solutions" : "Show Marking Scheme"}
              </button>

              <button
                onClick={handleCopyMarkdown}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Paper"}
              </button>

              <button
                onClick={handlePrint}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* Paper Switcher Tabs */}
          <div className="flex items-center gap-2 pt-6 border-t border-slate-800/80 mt-6">
            {Object.keys(SAMPLE_PAPERS).map(key => (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all border",
                  selectedKey === key
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-md"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                )}
              >
                {key}
              </button>
            ))}
          </div>
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
                    <div className="text-emerald-950 whitespace-pre-line leading-relaxed font-sans">
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

      </div>
    </div>
  );
}
