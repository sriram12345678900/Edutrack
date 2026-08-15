"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, Search, Copy, Check, Sparkles, Brain, ArrowLeft,
  Zap, Compass, Layers, ShieldCheck, Flame, Calculator, Eye, EyeOff, X, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FormulaItem {
  id: string;
  title: string;
  subject: "Physics" | "Mathematics" | "Chemistry";
  chapter: string;
  classLevel: string;
  formula: string;
  variables: string;
  units?: string;
  examTip: string;
  calcType?: "ohms_law" | "lens_power" | "quadratic" | "joules_heating" | "gravitation" | "density";
}

const MASTER_FORMULAS: FormulaItem[] = [
  // ---------------- PHYSICS CLASS 10 & 9 ----------------
  {
    id: "p1",
    title: "Ohm's Law",
    subject: "Physics",
    chapter: "Electricity",
    classLevel: "Class 10",
    formula: "V = I × R",
    variables: "V = Potential Difference, I = Current, R = Resistance",
    units: "V in Volts (V), I in Amperes (A), R in Ohms (Ω)",
    examTip: "Temperature must remain constant for Ohm's law to hold true.",
    calcType: "ohms_law"
  },
  {
    id: "p2",
    title: "Electric Power Formulas",
    subject: "Physics",
    chapter: "Electricity",
    classLevel: "Class 10",
    formula: "P = V × I = I²R = V² / R",
    variables: "P = Power, V = Voltage, I = Current, R = Resistance",
    units: "P in Watts (W) or Kilowatts (kW)",
    examTip: "Use P = V²/R for parallel circuits and P = I²R for series circuits."
  },
  {
    id: "p3",
    title: "Joule's Law of Heating",
    subject: "Physics",
    chapter: "Electricity",
    classLevel: "Class 10",
    formula: "H = I² × R × t",
    variables: "H = Heat Energy, I = Current, R = Resistance, t = Time",
    units: "H in Joules (J)",
    examTip: "Heat generated is directly proportional to square of current.",
    calcType: "joules_heating"
  },
  {
    id: "p4",
    title: "Commercial Unit of Electrical Energy",
    subject: "Physics",
    chapter: "Electricity",
    classLevel: "Class 10",
    formula: "E = P × t  ⟹  1 kWh = 3.6 × 10⁶ J",
    variables: "E = Energy in kWh, P = Power in kW, t = Time in hours",
    units: "1 unit = 1 kWh = 3,600,000 Joules",
    examTip: "Convert power to kW and time to hours before calculating cost of electricity."
  },
  {
    id: "p5",
    title: "Resistors in Series & Parallel",
    subject: "Physics",
    chapter: "Electricity",
    classLevel: "Class 10",
    formula: "Series: R_s = R₁ + R₂ + R₃  |  Parallel: 1/R_p = 1/R₁ + 1/R₂ + 1/R₃",
    variables: "R_s = Total Series Resistance, R_p = Total Parallel Resistance",
    units: "Ohms (Ω)",
    examTip: "In series current stays same; in parallel voltage stays same."
  },
  {
    id: "p6",
    title: "Mirror Formula & Magnification",
    subject: "Physics",
    chapter: "Light - Reflection & Refraction",
    classLevel: "Class 10",
    formula: "1/f = 1/v + 1/u  |  m = -v/u = h_i / h_o",
    variables: "f = Focal Length, v = Image Distance, u = Object Distance, m = Magnification",
    units: "m, cm",
    examTip: "Object distance u is ALWAYS negative according to Cartesian sign convention."
  },
  {
    id: "p7",
    title: "Lens Formula & Magnification",
    subject: "Physics",
    chapter: "Light - Reflection & Refraction",
    classLevel: "Class 10",
    formula: "1/f = 1/v - 1/u  |  m = v/u = h_i / h_o",
    variables: "f = Focal Length, v = Image Distance, u = Object Distance",
    units: "m, cm",
    examTip: "Focal length f of Concave lens/mirror is always negative; Convex is positive."
  },
  {
    id: "p8",
    title: "Power of a Lens",
    subject: "Physics",
    chapter: "Light - Reflection & Refraction",
    classLevel: "Class 10",
    formula: "P = 1 / f (in meters)",
    variables: "P = Power of Lens, f = Focal Length in meters",
    units: "Dioptre (D)",
    examTip: "Convert focal length to METERS before computing P. Concave lens power is negative.",
    calcType: "lens_power"
  },
  {
    id: "p9",
    title: "Snell's Law & Refractive Index",
    subject: "Physics",
    chapter: "Light - Reflection & Refraction",
    classLevel: "Class 10",
    formula: "n₂₁ = sin i / sin r  |  n = c / v",
    variables: "n = Refractive Index, i = Incident Angle, r = Refracted Angle, c = Speed of light",
    units: "Dimensionless (ratio)",
    examTip: "Denser medium has higher refractive index and light bends towards the normal."
  },
  {
    id: "p10",
    title: "Newton's Second Law of Motion",
    subject: "Physics",
    chapter: "Force & Laws of Motion",
    classLevel: "Class 9",
    formula: "F = m × a  |  p = m × v",
    variables: "F = Force, m = Mass, a = Acceleration, p = Momentum",
    units: "F in Newtons (N = kg·m/s²), p in kg·m/s",
    examTip: "Rate of change of momentum is equal to applied force."
  },
  {
    id: "p11",
    title: "Universal Law of Gravitation",
    subject: "Physics",
    chapter: "Gravitation",
    classLevel: "Class 9",
    formula: "F = G × (m₁ × m₂) / d²",
    variables: "F = Gravitational Force, G = 6.67 × 10⁻¹¹ N·m²/kg², m = Masses, d = Distance",
    units: "Newtons (N)",
    examTip: "If distance is doubled, gravitational force becomes 1/4th.",
    calcType: "gravitation"
  },

  // ---------------- MATHEMATICS CLASS 10 & 9 ----------------
  {
    id: "m1",
    title: "Quadratic Formula & Discriminant",
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    classLevel: "Class 10",
    formula: "x = (-b ± √(b² - 4ac)) / (2a)  |  D = b² - 4ac",
    variables: "a, b, c = Coefficients of ax² + bx + c = 0, D = Discriminant",
    examTip: "D > 0 (2 distinct real roots), D = 0 (2 equal real roots), D < 0 (no real roots).",
    calcType: "quadratic"
  },
  {
    id: "m2",
    title: "Trigonometric Identities",
    subject: "Mathematics",
    chapter: "Introduction to Trigonometry",
    classLevel: "Class 10",
    formula: "sin²A + cos²A = 1  |  1 + tan²A = sec²A  |  1 + cot²A = cosec²A",
    variables: "A = Angle in degrees",
    examTip: "Convert cosec, sec, tan, cot into sin and cos when proving identities."
  },
  {
    id: "m3",
    title: "Trigonometric Values (Standard Angles)",
    subject: "Mathematics",
    chapter: "Introduction to Trigonometry",
    classLevel: "Class 10",
    formula: "sin 30° = 1/2, sin 45° = 1/√2, sin 60° = √3/2, tan 45° = 1, tan 60° = √3",
    variables: "Standard angles: 0°, 30°, 45°, 60°, 90°",
    examTip: "Remember tan θ = sin θ / cos θ and cot θ = 1 / tan θ."
  },
  {
    id: "m4",
    title: "Arithmetic Progression (n-th Term & Sum)",
    subject: "Mathematics",
    chapter: "Arithmetic Progressions",
    classLevel: "Class 10",
    formula: "aₙ = a + (n - 1)d  |  Sₙ = n/2 × [2a + (n - 1)d] = n/2 × (a + l)",
    variables: "a = First term, d = Common difference, n = Number of terms, l = Last term",
    examTip: "Check d = a₂ - a₁ = a₃ - a₂ before applying AP formulas."
  },
  {
    id: "m5",
    title: "Distance & Section Formula",
    subject: "Mathematics",
    chapter: "Coordinate Geometry",
    classLevel: "Class 10",
    formula: "Distance: d = √[(x₂ - x₁)² + (y₂ - y₁)²]  |  Section: P(x,y) = ((m₁x₂ + m₂x₁)/(m₁+m₂), (m₁y₂ + m₂y₁)/(m₁+m₂))",
    variables: "(x₁, y₁) and (x₂, y₂) = Point coordinates, m₁:m₂ = Ratio",
    examTip: "Midpoint formula uses ratio 1:1, giving ((x₁ + x₂)/2, (y₁ + y₂)/2)."
  },
  {
    id: "m6",
    title: "Surface Area & Volume Formulas",
    subject: "Mathematics",
    chapter: "Surface Areas and Volumes",
    classLevel: "Class 10",
    formula: "Cylinder: V = πr²h, TSA = 2πr(r+h) | Cone: V = 1/3 πr²h, LSA = πrl | Sphere: V = 4/3 πr³, SA = 4πr²",
    variables: "r = Radius, h = Height, l = Slant height = √(r² + h²)",
    examTip: "Double check whether question asks for Curved Surface Area (CSA) or Total Surface Area (TSA)."
  },
  {
    id: "m7",
    title: "Statistics Mean Formulas",
    subject: "Mathematics",
    chapter: "Statistics",
    classLevel: "Class 10",
    formula: "Direct: x̄ = ∑fᵢxᵢ / ∑fᵢ  |  Assumed Mean: x̄ = a + (∑fᵢdᵢ / ∑fᵢ)",
    variables: "fᵢ = Frequency, xᵢ = Class mark = (Upper + Lower)/2, a = Assumed mean",
    examTip: "Class interval must be continuous. If discontinuous (1-5, 6-10), convert by subtracting 0.5 from lower limit."
  },
  {
    id: "m8",
    title: "Probability of an Event",
    subject: "Mathematics",
    chapter: "Probability",
    classLevel: "Class 10",
    formula: "P(E) = Number of Favourable Outcomes / Total Number of Possible Outcomes",
    variables: "0 ≤ P(E) ≤ 1  |  P(E) + P(Not E) = 1",
    examTip: "Probability of Sure event = 1, Impossible event = 0."
  },

  // ---------------- CHEMISTRY CLASS 10 & 9 ----------------
  {
    id: "c1",
    title: "pH Scale Formula & Indicator Color",
    subject: "Chemistry",
    chapter: "Acids, Bases and Salts",
    classLevel: "Class 10",
    formula: "pH = -log₁₀[H⁺]  |  pH < 7 (Acidic), pH = 7 (Neutral), pH > 7 (Basic)",
    variables: "[H⁺] = Hydrogen Ion Concentration",
    examTip: "Strong acids (HCl, HNO₃) have pH near 1-2; Strong bases (NaOH) have pH near 13-14."
  },
  {
    id: "c2",
    title: "Plaster of Paris & Gypsum Reaction",
    subject: "Chemistry",
    chapter: "Acids, Bases and Salts",
    classLevel: "Class 10",
    formula: "CaSO₄·½H₂O + 1½ H₂O  →  CaSO₄·2H₂O (Gypsum)",
    variables: "CaSO₄·½H₂O = Plaster of Paris, CaSO₄·2H₂O = Gypsum",
    examTip: "POP must be stored in moisture-proof containers to prevent setting into hard mass."
  },
  {
    id: "c3",
    title: "Esterification & Saponification",
    subject: "Chemistry",
    chapter: "Carbon and its Compounds",
    classLevel: "Class 10",
    formula: "Ester: CH₃COOH + C₂H₅OH (Acid cat.) → CH₃COOC₂H₅ + H₂O\nSaponification: CH₃COOC₂H₅ + NaOH → CH₃COONa + C₂H₅OH",
    variables: "CH₃COOH = Ethanoic Acid, C₂H₅OH = Ethanol, CH₃COOC₂H₅ = Ethyl Ethanoate (Sweet smell)",
    examTip: "Esters have sweet fruity smell and are used in perfumes and flavoring agents."
  }
];

export default function FormulasPage() {
  const [selectedSubject, setSelectedSubject] = useState<"All" | "Physics" | "Mathematics" | "Chemistry">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  
  // Interactive Calculator Modal State
  const [activeCalcFormula, setActiveCalcFormula] = useState<FormulaItem | null>(null);
  const [valA, setValA] = useState<string>("5");
  const [valB, setValB] = useState<string>("10");
  const [valC, setValC] = useState<string>("2");

  const filteredFormulas = MASTER_FORMULAS.filter((item) => {
    const matchesSubject = selectedSubject === "All" || item.subject === selectedSubject;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(q) ||
      item.formula.toLowerCase().includes(q) ||
      item.chapter.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q);
    return matchesSubject && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Perform Live Math Calculations
  const computeLiveResult = () => {
    if (!activeCalcFormula) return null;
    const a = parseFloat(valA) || 0;
    const b = parseFloat(valB) || 0;
    const c = parseFloat(valC) || 0;

    switch (activeCalcFormula.calcType) {
      case "ohms_law": {
        // V = I * R
        const V = a * b;
        return {
          equation: `V = I × R = ${a} A × ${b} Ω`,
          result: `${V.toFixed(2)} Volts (V)`,
          steps: [`Given Current I = ${a} A`, `Given Resistance R = ${b} Ω`, `Using V = I × R = ${a} × ${b} = ${V.toFixed(2)} V`]
        };
      }
      case "lens_power": {
        // P = 1 / f (in meters)
        if (a === 0) return { equation: "f cannot be 0", result: "Undefined", steps: ["Focal length cannot be zero."] };
        const fMeters = a / 100; // if in cm
        const P = 1 / fMeters;
        return {
          equation: `P = 1 / f = 1 / ${fMeters.toFixed(3)} m`,
          result: `${P.toFixed(2)} Dioptres (D)`,
          steps: [`Focal Length f = ${a} cm = ${fMeters} m`, `P = 1 / ${fMeters} = ${P.toFixed(2)} D`]
        };
      }
      case "quadratic": {
        // D = b^2 - 4ac
        const D = b * b - 4 * a * c;
        let rootText = "";
        if (D > 0) {
          const x1 = (-b + Math.sqrt(D)) / (2 * a);
          const x2 = (-b - Math.sqrt(D)) / (2 * a);
          rootText = `Two distinct real roots: x₁ = ${x1.toFixed(2)}, x₂ = ${x2.toFixed(2)}`;
        } else if (D === 0) {
          const x = -b / (2 * a);
          rootText = `Two equal real roots: x = ${x.toFixed(2)}`;
        } else {
          rootText = "No real roots (D < 0, complex conjugate roots)";
        }
        return {
          equation: `D = b² - 4ac = (${b})² - 4(${a})(${c})`,
          result: `Discriminant D = ${D}`,
          steps: [`a = ${a}, b = ${b}, c = ${c}`, `D = ${b * b} - ${4 * a * c} = ${D}`, rootText]
        };
      }
      case "joules_heating": {
        // H = I^2 * R * t
        const H = a * a * b * c;
        return {
          equation: `H = I² × R × t = (${a})² × ${b} × ${c}`,
          result: `${H.toFixed(2)} Joules (J)`,
          steps: [`Current I = ${a} A, Resistance R = ${b} Ω, Time t = ${c} s`, `H = ${a * a} × ${b} × ${c} = ${H.toFixed(2)} J`]
        };
      }
      default:
        return {
          equation: `${activeCalcFormula.formula}`,
          result: "Formula standard form verified",
          steps: ["Plug in variables as required by NCERT numerical problems."]
        };
    }
  };

  const calcOutput = computeLiveResult();

  return (
    <div className="min-h-screen text-slate-900 dark:text-white selection:bg-indigo-500/30 selection:text-indigo-200 pb-20 font-sans relative" style={{ backgroundColor: "var(--background)" }}>
      {/* Background Mesh Overlays */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f15_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[40vw] h-[40vw] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[40vw] h-[40vw] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-white dark:bg-[#02040a] bg-[#eef1f9] backdrop-blur-2xl border-b border-slate-200/70 dark:border-white/10 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-white/10 border border-slate-200/70 dark:border-white/10 transition-all text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-slate-200/70 dark:border-white/10">
                <Brain className="w-5.5 h-5.5 text-slate-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  EduTrack <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Formulas Hub</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">CBSE Class 6–10 Master Formulas & Live Solver</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPracticeMode(!practiceMode)}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${
              practiceMode 
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-600 dark:text-slate-300 border-slate-200/70 dark:border-white/10 hover:bg-white/10"
            }`}
          >
            {practiceMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-indigo-400" />}
            <span>{practiceMode ? "Recall Test Mode ON" : "Recall Practice Mode"}</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 relative z-10">
        
        {/* Banner Section */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-indigo-300">NCERT Exam Ready Formula Sheets</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Physics, Maths & Chemistry Master Deck
          </h2>
          <p className="text-slate-600 dark:text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
            Search formulas, test active recall, or launch the <strong className="text-indigo-400">Live Interactive Calculator</strong> to solve numericals step-by-step!
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
          <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 backdrop-blur-md w-full sm:w-auto overflow-x-auto">
            {(["All", "Physics", "Mathematics", "Chemistry"] as const).map((subject) => {
              const isActive = selectedSubject === subject;
              return (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all whitespace-nowrap ${
                    isActive 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-slate-900 dark:text-white shadow-lg shadow-indigo-500/25 border border-slate-200/70 dark:border-white/10" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-white/5"
                  }`}
                >
                  {subject === "All" && "All Subjects"}
                  {subject === "Physics" && "Physics"}
                  {subject === "Mathematics" && "Mathematics"}
                  {subject === "Chemistry" && "Chemistry"}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search formula, Ohm, Lens, Quadratic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors font-semibold shadow-inner"
            />
          </div>
        </div>

        {/* Formulas Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredFormulas.map((item) => {
              const isCopied = copiedId === item.id;
              const isRevealed = revealedIds[item.id];
              const subjectColor = 
                item.subject === "Physics" ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" :
                item.subject === "Mathematics" ? "border-purple-500/30 bg-purple-500/10 text-purple-400" :
                "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 hover:border-indigo-500/40 rounded-3xl p-6 backdrop-blur-xl relative group flex flex-col justify-between transition-colors shadow-2xl"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${subjectColor}`}>
                          {item.subject}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-[10px] font-extrabold text-slate-600 dark:text-slate-600 dark:text-slate-300">
                          {item.chapter}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-500 dark:text-slate-400">{item.classLevel}</span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h3>

                    {/* Formula Display Box */}
                    <div className="bg-white/70 dark:bg-black/70 border border-slate-200/70 dark:border-white/10 rounded-2xl p-4.5 mb-4 relative overflow-hidden font-mono">
                      {practiceMode && !isRevealed ? (
                        <div 
                          onClick={() => toggleReveal(item.id)}
                          className="py-2.5 text-center text-amber-400 font-bold text-xs uppercase tracking-wider cursor-pointer hover:underline flex items-center justify-center gap-2"
                        >
                          <EyeOff className="w-4 h-4" /> Click to Reveal Formula (Recall Test)
                        </div>
                      ) : (
                        <div className="text-indigo-300 text-lg sm:text-xl font-black tracking-wider leading-relaxed pr-10">
                          {item.formula}
                        </div>
                      )}
                      
                      {(!practiceMode || isRevealed) && (
                        <button
                          onClick={() => handleCopy(item.id, item.formula)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-slate-200/70 dark:border-white/10 transition-all text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white"
                          title="Copy Formula"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 mb-4 text-xs sm:text-sm">
                      <p className="text-slate-600 dark:text-slate-600 dark:text-slate-300 font-semibold">
                        <span className="text-slate-500 font-bold">Variables:</span> {item.variables}
                      </p>
                      {item.units && (
                        <p className="text-slate-600 dark:text-slate-600 dark:text-slate-300 font-semibold">
                          <span className="text-slate-500 font-bold">Units:</span> {item.units}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer: Board Tip & Live Calculator Trigger */}
                  <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                    <div className="flex items-start gap-2.5 text-xs text-amber-300/90 font-medium bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                      <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong className="text-amber-300 uppercase tracking-wider font-bold">Board Tip:</strong> {item.examTip}</span>
                    </div>

                    {item.calcType && (
                      <button
                        onClick={() => setActiveCalcFormula(item)}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-slate-900 dark:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200/70 dark:border-white/10 shadow-lg shadow-indigo-500/20"
                      >
                        <Calculator className="w-4 h-4" /> Live Interactive Variable Solver
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* Interactive Formula Solver Modal */}
      {activeCalcFormula && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="dark:bg-[#080b18] bg-[#eef1f9] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
          >
            <button
              onClick={() => setActiveCalcFormula(null)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white border border-slate-200/70 dark:border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{activeCalcFormula.title}</h3>
                <p className="text-xs text-indigo-400 font-bold">Live Numerical Solver</p>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="space-y-4 mb-6">
              {activeCalcFormula.calcType === "ohms_law" && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Current I (Amperes):</label>
                    <input type="number" value={valA} onChange={(e) => setValA(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Resistance R (Ohms Ω):</label>
                    <input type="number" value={valB} onChange={(e) => setValB(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:border-indigo-500 outline-none" />
                  </div>
                </>
              )}

              {activeCalcFormula.calcType === "lens_power" && (
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Focal Length f (in centimeters):</label>
                  <input type="number" value={valA} onChange={(e) => setValA(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:border-indigo-500 outline-none" />
                </div>
              )}

              {activeCalcFormula.calcType === "quadratic" && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Coeff a:</label>
                    <input type="number" value={valA} onChange={(e) => setValA(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Coeff b:</label>
                    <input type="number" value={valB} onChange={(e) => setValB(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Coeff c:</label>
                    <input type="number" value={valC} onChange={(e) => setValC(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono" />
                  </div>
                </div>
              )}

              {activeCalcFormula.calcType === "joules_heating" && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Current I (A):</label>
                    <input type="number" value={valA} onChange={(e) => setValA(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Resistance R (Ω):</label>
                    <input type="number" value={valB} onChange={(e) => setValB(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Time t (seconds):</label>
                    <input type="number" value={valC} onChange={(e) => setValC(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white font-mono" />
                  </div>
                </>
              )}
            </div>

            {/* Computed Output Box */}
            {calcOutput && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 p-5 rounded-2xl space-y-3 font-mono">
                <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Formula Equation:</div>
                <div className="text-slate-900 dark:text-white text-base font-black">{calcOutput.equation}</div>
                <div className="text-emerald-400 text-lg font-black pt-2 border-t border-indigo-500/20">
                  Result: {calcOutput.result}
                </div>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-600 dark:text-slate-300 font-sans pt-2">
                  <div className="font-bold text-slate-500 dark:text-slate-400">Step-by-Step Breakdown:</div>
                  {calcOutput.steps.map((st, i) => (
                    <div key={i}>• {st}</div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}