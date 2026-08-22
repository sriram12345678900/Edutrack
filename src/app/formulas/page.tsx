"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, Search, Copy, Check, Sparkles, Brain, ArrowLeft,
  Zap, Compass, Layers, ShieldCheck, Flame, Calculator, Eye, EyeOff, X, Play, Printer, CheckCircle2, ArrowRight, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { awardXp } from "@/lib/xp";
import { openPrintableCheatSheet } from "@/lib/cheat-sheet-generator";
import katex from "katex";
import "katex/dist/katex.min.css";

const MathEquation = ({ formula, displayMode = false }: { formula: string; displayMode?: boolean }) => {
  try {
    const html = katex.renderToString(formula, {
      throwOnError: false,
      displayMode,
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} className="math-equation" />;
  } catch (e) {
    return <span className="font-mono">{formula}</span>;
  }
};

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
    formula: "V = I \\cdot R",
    variables: "V = Potential Difference (Voltage), I = Electric Current, R = Electrical Resistance",
    units: "V in Volts (V), I in Amperes (A), R in Ohms (\\Omega)",
    examTip: "The temperature of the metallic conductor must remain strictly constant for Ohm's law to hold true.",
    calcType: "ohms_law"
  },
  {
    id: "p2",
    title: "Electric Power Formulas",
    subject: "Physics",
    chapter: "Electricity",
    classLevel: "Class 10",
    formula: "P = V \\cdot I = I^2 R = \\frac{V^2}{R}",
    variables: "P = Electric Power, V = Voltage, I = Current, R = Resistance",
    units: "P in Watts (W) or Kilowatts (kW), where 1 kW = 1000 W",
    examTip: "Use P = \\frac{V^2}{R} for parallel circuit questions (constant voltage) and P = I^2 R for series circuits (constant current)."
  },
  {
    id: "p3",
    title: "Joule's Law of Heating",
    subject: "Physics",
    chapter: "Electricity",
    classLevel: "Class 10",
    formula: "H = I^2 R t",
    variables: "H = Thermal Heat Energy, I = Electric Current, R = Resistance, t = Time duration",
    units: "H in Joules (J)",
    examTip: "Heat generated in a resistor is directly proportional to the square of the current, the resistance, and the time of flow.",
    calcType: "joules_heating"
  },
  {
    id: "p4",
    title: "Commercial Unit of Electrical Energy",
    subject: "Physics",
    chapter: "Electricity",
    classLevel: "Class 10",
    formula: "E = P \\cdot t \\implies 1\\text{ kWh} = 3.6 \\times 10^6\\text{ J}",
    variables: "E = Electrical Energy consumed, P = Power in kW, t = Time duration in hours",
    units: "1 unit = 1 Kilowatt-hour (kWh) = 3,600,000 Joules",
    examTip: "Always convert appliance power ratings to kilowatts and operational time to hours before computing utility costs."
  },
  {
    id: "p5",
    title: "Resistors in Series & Parallel",
    subject: "Physics",
    chapter: "Electricity",
    classLevel: "Class 10",
    formula: "R_s = R_1 + R_2 + R_3 \\quad \\Big| \\quad \\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}",
    variables: "R_s = Equivalent Series Resistance, R_p = Equivalent Parallel Resistance",
    units: "Resistance in Ohms (\\Omega)",
    examTip: "In a series circuit, current remains identical across all resistors. In a parallel circuit, potential difference stays the same."
  },
  {
    id: "p6",
    title: "Mirror Formula & Magnification",
    subject: "Physics",
    chapter: "Light - Reflection & Refraction",
    classLevel: "Class 10",
    formula: "\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u} \\quad \\Big| \\quad m = -\\frac{v}{u} = \\frac{h_i}{h_o}",
    variables: "f = Focal Length, v = Image Distance, u = Object Distance, m = Linear Magnification, h_i = Image Height, h_o = Object Height",
    units: "All distances must be in consistent linear units (cm, m)",
    examTip: "Object distance (u) is ALWAYS negative according to the New Cartesian Sign Convention."
  },
  {
    id: "p7",
    title: "Lens Formula & Magnification",
    subject: "Physics",
    chapter: "Light - Reflection & Refraction",
    classLevel: "Class 10",
    formula: "\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u} \\quad \\Big| \\quad m = \\frac{v}{u} = \\frac{h_i}{h_o}",
    variables: "f = Focal Length, v = Image Distance, u = Object Distance, m = Linear Magnification",
    units: "All distances must be in consistent linear units (cm, m)",
    examTip: "Focal length of a concave lens is always negative, while the focal length of a convex lens is positive."
  },
  {
    id: "p8",
    title: "Power of a Lens",
    subject: "Physics",
    chapter: "Light - Reflection & Refraction",
    classLevel: "Class 10",
    formula: "P = \\frac{1}{f\\text{ (in meters)}}",
    variables: "P = Optical Power of Lens, f = Focal Length in meters",
    units: "Power in Dioptres (D), Focal length in Meters (m)",
    examTip: "Crucial Step: Convert focal length from cm to METERS before computing power. Concave lens power is negative.",
    calcType: "lens_power"
  },
  {
    id: "p9",
    title: "Snell's Law & Refractive Index",
    subject: "Physics",
    chapter: "Light - Reflection & Refraction",
    classLevel: "Class 10",
    formula: "n_{21} = \\frac{\\sin i}{\\sin r} = \\frac{v_1}{v_2} \\quad \\Big| \\quad n = \\frac{c}{v}",
    variables: "n_{21} = Refractive index of medium 2 with respect to 1, i = Angle of incidence, r = Angle of refraction, c = Speed of light in vacuum, v = Speed of light in medium",
    units: "Dimensionless ratio (no units)",
    examTip: "An optically denser medium has a higher refractive index, and light rays bend towards the normal line when entering it."
  },
  {
    id: "p10",
    title: "Newton's Second Law of Motion",
    subject: "Physics",
    chapter: "Force & Laws of Motion",
    classLevel: "Class 9",
    formula: "F = m \\cdot a \\quad \\Big| \\quad p = m \\cdot v",
    variables: "F = Force applied, m = Inertial Mass, a = Acceleration, p = Linear Momentum, v = Instantaneous Velocity",
    units: "F in Newtons (N = kg \\cdot m/s^2), p in kg \\cdot m/s",
    examTip: "Force equals the rate of change of linear momentum. Remember that force and momentum are vector quantities."
  },
  {
    id: "p11",
    title: "Universal Law of Gravitation",
    subject: "Physics",
    chapter: "Gravitation",
    classLevel: "Class 9",
    formula: "F = G \\frac{m_1 \\cdot m_2}{d^2}",
    variables: "F = Gravitational Force of attraction, G = Universal Gravitational Constant (6.673 \\times 10^{-11}\\text{ N}\\cdot\\text{m}^2/\\text{kg}^2), m_1, m_2 = Masses of two bodies, d = Distance between centers",
    units: "Force in Newtons (N)",
    examTip: "Inverse Square Law: If the distance between two bodies is doubled, the gravitational force reduces to 1/4th.",
    calcType: "gravitation"
  },

  // ---------------- MATHEMATICS CLASS 10 & 9 ----------------
  {
    id: "m1",
    title: "Quadratic Formula & Discriminant",
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    classLevel: "Class 10",
    formula: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\quad \\Big| \\quad D = b^2 - 4ac",
    variables: "x = Roots of quadratic equation ax^2 + bx + c = 0, a, b, c = Coefficients, D = Discriminant",
    examTip: "Nature of Roots: If D > 0 (two distinct real roots), if D = 0 (two equal real roots), if D < 0 (no real roots exist).",
    calcType: "quadratic"
  },
  {
    id: "m2",
    title: "Trigonometric Identities",
    subject: "Mathematics",
    chapter: "Introduction to Trigonometry",
    classLevel: "Class 10",
    formula: "\\sin^2 A + \\cos^2 A = 1 \\quad \\Big| \\quad 1 + \\tan^2 A = \\sec^2 A \\quad \\Big| \\quad 1 + \\cot^2 A = \\csc^2 A",
    variables: "A = Angle in degrees or radians",
    examTip: "Convert cosec, sec, tan, and cot ratios into sin and cos fractions when simplifying complex trigonometric proofs."
  },
  {
    id: "m3",
    title: "Trigonometric Values (Standard Angles)",
    subject: "Mathematics",
    chapter: "Introduction to Trigonometry",
    classLevel: "Class 10",
    formula: "\\sin 30^\\circ = \\frac{1}{2}, \\quad \\sin 45^\\circ = \\frac{1}{\\sqrt{2}}, \\quad \\sin 60^\\circ = \\frac{\\sqrt{3}}{2}, \\quad \\tan 45^\\circ = 1, \\quad \\tan 60^\\circ = \\sqrt{3}",
    variables: "Trigonometric functions evaluated at standard reference angles: 0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ",
    examTip: "Derive tan \\theta using \\frac{\\sin \\theta}{\\cos \\theta} and cot \\theta using \\frac{1}{\\tan \\theta} during exam numerical calculations."
  },
  {
    id: "m4",
    title: "Arithmetic Progression (n-th Term & Sum)",
    subject: "Mathematics",
    chapter: "Arithmetic Progressions",
    classLevel: "Class 10",
    formula: "a_n = a + (n - 1)d \\quad \\Big| \\quad S_n = \\frac{n}{2} [2a + (n - 1)d] = \\frac{n}{2} (a + a_n)",
    variables: "a = First Term, d = Common Difference, n = Number of terms, a_n = n-th term, S_n = Sum of first n terms",
    examTip: "Always confirm that the common difference d is constant (d = a_2 - a_1 = a_3 - a_2) before applying AP formulas."
  },
  {
    id: "m5",
    title: "Distance & Section Formula",
    subject: "Mathematics",
    chapter: "Coordinate Geometry",
    classLevel: "Class 10",
    formula: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} \\quad \\Big| \\quad P(x,y) = \\left(\\frac{m_1 x_2 + m_2 x_1}{m_1 + m_2}, \\frac{m_1 y_2 + m_2 y_1}{m_1 + m_2}\\right)",
    variables: "(x_1, y_1), (x_2, y_2) = Coordinates of points, m_1:m_2 = Ratio in which P divides segment",
    examTip: "For midpoint calculations, set ratio m_1:m_2 = 1:1, reducing Section Formula to ((x_1 + x_2)/2, (y_1 + y_2)/2)."
  },
  {
    id: "m6",
    title: "Surface Area & Volume Formulas",
    subject: "Mathematics",
    chapter: "Surface Areas and Volumes",
    classLevel: "Class 10",
    formula: "\\text{Cylinder: } V = \\pi r^2 h, \\text{ TSA} = 2\\pi r(r + h) \\quad \\Big| \\quad \\text{Cone: } V = \\frac{1}{3}\\pi r^2 h, \\text{ LSA} = \\pi r l",
    variables: "r = Radius, h = Height, l = Slant Height = \\sqrt{r^2 + h^2}, V = Volume, TSA = Total Surface Area, LSA = Lateral Surface Area",
    examTip: "Read carefully to determine if the question requires Curved Surface Area (CSA/LSA) or Total Surface Area (TSA)."
  },
  {
    id: "m7",
    title: "Statistics Mean Formulas",
    subject: "Mathematics",
    chapter: "Statistics",
    classLevel: "Class 10",
    formula: "\\bar{x} = \\frac{\\sum f_i x_i}{\\sum f_i} \\quad \\Big| \\quad \\text{Assumed Mean: } \\bar{x} = a + \\frac{\\sum f_i d_i}{\\sum f_i}",
    variables: "\\bar{x} = Arithmetic Mean, f_i = Frequency of group, x_i = Class Mark (midpoint), a = Assumed Mean, d_i = Deviation (x_i - a)",
    examTip: "If class intervals are discontinuous (e.g. 1-5, 6-10), subtract 0.5 from lower boundaries and add 0.5 to upper boundaries first."
  },
  {
    id: "m8",
    title: "Probability of an Event",
    subject: "Mathematics",
    chapter: "Probability",
    classLevel: "Class 10",
    formula: "P(E) = \\frac{N_{\\text{favourable}}}{N_{\\text{total}}} \\quad \\Big| \\quad 0 \\le P(E) \\le 1 \\quad \\Big| \\quad P(E) + P(\\bar{E}) = 1",
    variables: "P(E) = Probability of event E, N_favourable = Number of favourable outcomes, N_total = Total possible outcomes, P(E-bar) = Probability of not E",
    examTip: "The probability of a certain (sure) event is 1, and the probability of an impossible event is always 0."
  },

  // ---------------- CHEMISTRY CLASS 10 & 9 ----------------
  {
    id: "c1",
    title: "pH Scale Formula",
    subject: "Chemistry",
    chapter: "Acids, Bases and Salts",
    classLevel: "Class 10",
    formula: "\\text{pH} = -\\log_{10}[\\text{H}^+] \\quad \\Big| \\quad [\\text{H}^+][\\text{OH}^-] = 10^{-14}",
    variables: "[H^+] = Hydrogen Ion Concentration, [OH^-] = Hydroxide Ion Concentration",
    examTip: "pH values < 7 indicate acidic character, pH = 7 is neutral, and pH > 7 indicates alkaline/basic character."
  },
  {
    id: "c2",
    title: "Plaster of Paris & Gypsum Reaction",
    subject: "Chemistry",
    chapter: "Acids, Bases and Salts",
    classLevel: "Class 10",
    formula: "\\text{CaSO}_4\\cdot\\frac{1}{2}\\text{H}_2\\text{O} + 1\\frac{1}{2}\\text{H}_2\\text{O} \\longrightarrow \\text{CaSO}_4\\cdot2\\text{H}_2\\text{O}",
    variables: "CaSO_4 . 1/2 H_2O = Plaster of Paris (Calcium Sulphate Hemihydrate), CaSO_4 . 2H_2O = Gypsum",
    examTip: "POP must be stored in moisture-proof containers to prevent setting into a hard crystalline solid mass of Gypsum."
  },
  {
    id: "c3",
    title: "Esterification & Saponification",
    subject: "Chemistry",
    chapter: "Carbon and its Compounds",
    classLevel: "Class 10",
    formula: "\\text{CH}_3\\text{COOH} + \\text{C}_2\\text{H}_5\\text{OH} \\xrightarrow{\\text{Acid}} \\text{CH}_3\\text{COOC}_2\\text{H}_5 + \\text{H}_2\\text{O} \\quad \\Big| \\quad \\text{Ester} + \\text{NaOH} \\longrightarrow \\text{CH}_3\\text{COONa} + \\text{C}_2\\text{H}_5\\text{OH}",
    variables: "CH_3COOH = Ethanoic Acid, C_2H_5OH = Ethanol, CH_3COOC_2H_5 = Ethyl Ethanoate (sweet smell), CH_3COONa = Sodium Acetate (Soap)",
    examTip: "Esters have sweet fruity fragrances and are widely used in food flavourings, essences, and perfumery."
  }
];

interface GameFormulaItem {
  title: string;
  slots: string[];
  pool: string[];
  hint: string;
}

const GAME_FORMULAS: GameFormulaItem[] = [
  {
    title: "Ohm's Law",
    slots: ["V", "=", "I", "\\cdot", "R"],
    pool: ["V", "=", "I", "\\cdot", "R", "P", "R^2", "t", "Q"],
    hint: "Potential Difference equals Current multiplied by Resistance."
  },
  {
    title: "Joule's Heating Law",
    slots: ["H", "=", "I^2", "R", "t"],
    pool: ["H", "=", "I^2", "R", "t", "V", "P", "\\theta", "m"],
    hint: "Heat generated is current squared times resistance times time."
  },
  {
    title: "Mirror Formula",
    slots: ["\\frac{1}{f}", "=", "\\frac{1}{v}", "+", "\\frac{1}{u}"],
    pool: ["\\frac{1}{f}", "=", "\\frac{1}{v}", "+", "\\frac{1}{u}", "-", "R", "2f", "P"],
    hint: "Reciprocal of focal length equals sum of reciprocals of image and object distances."
  },
  {
    title: "Equivalent Series Resistance",
    slots: ["R_s", "=", "R_1", "+", "R_2"],
    pool: ["R_s", "=", "R_1", "+", "R_2", "R_p", "\\cdot", "\\frac{1}{R}", "V"],
    hint: "Sum of individual resistances in series."
  },
  {
    title: "pH Scale Formula",
    slots: ["\\text{pH}", "=", "-\\log_{10}[\\text{H}^+]"],
    pool: ["\\text{pH}", "=", "-\\log_{10}[\\text{H}^+]", "[\\text{OH}^-]", "14", "+", "10^{-7}"],
    hint: "Negative logarithm base 10 of hydrogen ion concentration."
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

  // Formula Constructor Game States
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [gameFormula, setGameFormula] = useState<GameFormulaItem | null>(null);
  const [gameSlots, setGameSlots] = useState<(string | null)[]>([]);
  const [gameTiles, setGameTiles] = useState<string[]>([]);
  const [gameFeedback, setGameFeedback] = useState<"idle" | "correct" | "incorrect">("idle");
  const [claimedGameXP, setClaimedGameXP] = useState(false);

  const startConstructorGame = () => {
    const randomF = GAME_FORMULAS[Math.floor(Math.random() * GAME_FORMULAS.length)];
    setGameFormula(randomF);
    setGameSlots(new Array(randomF.slots.length).fill(null));
    const shuffled = [...randomF.pool].sort(() => Math.random() - 0.5);
    setGameTiles(shuffled);
    setGameFeedback("idle");
    setClaimedGameXP(false);
    setIsGameOpen(true);
  };

  const handleTileClick = (tile: string) => {
    if (!gameFormula || gameFeedback === "correct") return;
    const emptyIdx = gameSlots.indexOf(null);
    if (emptyIdx !== -1) {
      const nextSlots = [...gameSlots];
      nextSlots[emptyIdx] = tile;
      setGameSlots(nextSlots);
    }
  };

  const handleSlotClick = (idx: number) => {
    if (gameFeedback === "correct") return;
    const nextSlots = [...gameSlots];
    nextSlots[idx] = null;
    setGameSlots(nextSlots);
  };

  const verifyConstructorGame = () => {
    if (!gameFormula) return;
    const matches = gameSlots.every((s, idx) => s === gameFormula.slots[idx]);
    if (matches) {
      setGameFeedback("correct");
    } else {
      setGameFeedback("incorrect");
    }
  };

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
          equation: `V = I \\cdot R = ${a}\\text{ A} \\cdot ${b}\\text{ }\\Omega`,
          result: `${V.toFixed(2)} Volts (V)`,
          steps: [`Given Current I = ${a} A`, `Given Resistance R = ${b} Ω`, `Using V = I × R = ${a} × ${b} = ${V.toFixed(2)} V`]
        };
      }
      case "lens_power": {
        // P = 1 / f (in meters)
        if (a === 0) return { equation: "\\text{Focal length } f \\neq 0", result: "Undefined", steps: ["Focal length cannot be zero."] };
        const fMeters = a / 100; // if in cm
        const P = 1 / fMeters;
        return {
          equation: `P = \\frac{1}{f} = \\frac{1}{${fMeters.toFixed(3)}\\text{ m}}`,
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
          equation: `D = b^2 - 4ac = (${b})^2 - 4(${a})(${c})`,
          result: `Discriminant D = ${D}`,
          steps: [`a = ${a}, b = ${b}, c = ${c}`, `D = ${b * b} - ${4 * a * c} = ${D}`, rootText]
        };
      }
      case "joules_heating": {
        // H = I^2 * R * t
        const H = a * a * b * c;
        return {
          equation: `H = I^2 \\cdot R \\cdot t = (${a})^2 \\cdot ${b} \\cdot ${c}`,
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
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#02040a] bg-[#eef1f9] backdrop-blur-2xl border-b border-slate-200/70 dark:border-white/10 px-4 sm:px-8 py-4">
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

          <div className="flex items-center gap-2">
            <button
              onClick={startConstructorGame}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
              <span>Constructor Game</span>
            </button>

            <button
              onClick={() => openPrintableCheatSheet(selectedSubject === "Chemistry" ? "chemical-reactions" : selectedSubject === "Physics" ? "light" : "electricity")}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Cheat-Sheet</span>
            </button>

            <button
              onClick={() => setPracticeMode(!practiceMode)}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${
                practiceMode 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200/70 dark:border-white/10 hover:bg-white/10"
              }`}
            >
              {practiceMode ? <EyeOff className="w-4 h-4 dark:text-amber-400 text-amber-700" /> : <Eye className="w-4 h-4 dark:text-indigo-400 text-indigo-700" />}
              <span>{practiceMode ? "Recall Test Mode ON" : "Recall Practice Mode"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 relative z-10">
        
        {/* Banner Section */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 backdrop-blur-md">
            <Sparkles className="w-4 h-4 dark:text-indigo-400 text-indigo-700 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest dark:text-indigo-300 text-indigo-700">NCERT Exam Ready Formula Sheets</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Physics, Maths & Chemistry Master Deck
          </h2>
          <p className="text-slate-600 dark:text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
            Search formulas, test active recall, or launch the <strong className="dark:text-indigo-400 text-indigo-700">Live Interactive Calculator</strong> to solve numericals step-by-step!
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

                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:dark:text-indigo-300 text-indigo-700 transition-colors">
                      {item.title}
                    </h3>

                    {/* Formula Display Box */}
                    <div className="bg-white/70 dark:bg-black/70 border border-slate-200/70 dark:border-white/10 rounded-2xl p-4.5 mb-4 relative overflow-hidden font-mono">
                      {practiceMode && !isRevealed ? (
                        <div 
                          onClick={() => toggleReveal(item.id)}
                          className="py-2.5 text-center dark:text-amber-400 text-amber-700 font-bold text-xs uppercase tracking-wider cursor-pointer hover:underline flex items-center justify-center gap-2"
                        >
                          <EyeOff className="w-4 h-4" /> Click to Reveal Formula (Recall Test)
                        </div>
                      ) : (
                        <div className="dark:text-indigo-300 text-indigo-700 text-base sm:text-lg font-black tracking-wider leading-relaxed pr-10 flex items-center justify-center min-h-[50px] overflow-x-auto">
                          <MathEquation formula={item.formula} displayMode={true} />
                        </div>
                      )}
                      
                      {(!practiceMode || isRevealed) && (
                        <button
                          onClick={() => handleCopy(item.id, item.formula)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-slate-200/70 dark:border-white/10 transition-all text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white"
                          title="Copy Formula"
                        >
                          {isCopied ? <Check className="w-4 h-4 dark:text-emerald-400 text-emerald-700" /> : <Copy className="w-4 h-4" />}
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
                      <Flame className="w-4 h-4 dark:text-amber-400 text-amber-700 shrink-0 mt-0.5" />
                      <span><strong className="dark:text-amber-300 text-amber-700 uppercase tracking-wider font-bold">Board Tip:</strong> {item.examTip}</span>
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
                <p className="text-xs dark:text-indigo-400 text-indigo-700 font-bold">Live Numerical Solver</p>
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
              <div className="bg-indigo-950/40 border border-indigo-500/30 p-5 rounded-2xl space-y-3">
                <div className="text-xs dark:text-indigo-300 text-indigo-700 font-bold uppercase tracking-wider font-mono">Formula Equation:</div>
                <div className="text-slate-900 dark:text-white text-base font-black flex items-center justify-center min-h-[44px] overflow-x-auto">
                  <MathEquation formula={calcOutput.equation} displayMode={true} />
                </div>
                <div className="dark:text-emerald-400 text-emerald-700 text-lg font-black pt-2 border-t border-indigo-500/20">
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

      {/* ── FORMULA CONSTRUCTOR GAME MODAL ── */}
      {isGameOpen && gameFormula && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-xl bg-white dark:bg-[#070a13] border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-2xl space-y-6 relative"
          >
            {/* Close */}
            <button
              onClick={() => setIsGameOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500 hover:text-slate-800 dark:hover:text-white" />
            </button>

            {/* Header */}
            <div className="border-b dark:border-white/10 border-slate-200 pb-3 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-md">
                <Brain className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-wide">
                  Formula Constructor: {gameFormula.title}
                </h3>
                <p className="text-[10px] dark:text-slate-400 text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  Click tiles to assemble the formula in correct order
                </p>
              </div>
            </div>

            {/* Hint */}
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex items-start gap-2.5 text-xs dark:text-slate-350 text-slate-750">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-400">NCERT Description:</span> {gameFormula.hint}
              </div>
            </div>

            {/* Construction Slots */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Equation Slots:</span>
              <div className="flex flex-wrap items-center gap-2 justify-center py-4 bg-slate-100 dark:bg-black/30 rounded-2xl border dark:border-white/5 border-slate-200 min-h-[70px]">
                {gameSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSlotClick(idx)}
                    className={`h-11 min-w-[44px] px-3.5 rounded-xl border font-bold font-mono text-sm transition-all flex items-center justify-center ${
                      slot 
                        ? "bg-indigo-600/15 border-indigo-500/60 dark:text-indigo-300 text-indigo-700 hover:bg-indigo-600/30" 
                        : "border-dashed dark:border-white/10 border-slate-300 dark:bg-white/5 bg-slate-200/50 text-slate-400 hover:border-indigo-500/50"
                    }`}
                  >
                    {slot ? <MathEquation formula={slot} /> : "?"}
                  </button>
                ))}
              </div>
            </div>

            {/* Selection Tiles Pool */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Tiles Pool:</span>
              <div className="flex flex-wrap items-center gap-2 justify-center">
                {gameTiles.map((tile, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTileClick(tile)}
                    className="h-10 px-3.5 rounded-xl dark:bg-white/5 bg-slate-100 dark:hover:bg-white/10 hover:bg-slate-200 border dark:border-white/10 border-slate-200 font-bold font-mono text-xs text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center shrink-0 hover:scale-105"
                  >
                    <MathEquation formula={tile} />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback / Controls */}
            <div className="pt-4 border-t dark:border-white/10 border-slate-200 flex flex-col items-center gap-3">
              {gameFeedback === "correct" && (
                <div className="w-full p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-center flex flex-col items-center gap-2.5">
                  <span className="text-emerald-450 dark:text-emerald-400 font-black text-sm flex items-center gap-1.5 animate-bounce">
                    <CheckCircle2 className="w-5 h-5" /> Formula Correctly Assembled!
                  </span>
                  
                  {!claimedGameXP ? (
                    <button
                      onClick={() => {
                        setClaimedGameXP(true);
                        awardXp(50, "Formula Constructor Game Complete");
                      }}
                      className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-transform"
                    >
                      Claim +50 XP Reward
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5">
                      <span className="text-xs font-bold text-emerald-400">+50 XP Awarded Successfully!</span>
                      <button
                        onClick={startConstructorGame}
                        className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1.5"
                      >
                        Try Another Formula <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {gameFeedback === "incorrect" && (
                <div className="text-xs font-black text-rose-500 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  ⚠️ Assembly Incorrect! Try reorganizing the variables.
                </div>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setGameSlots(new Array(gameFormula.slots.length).fill(null))}
                  disabled={gameFeedback === "correct"}
                  className="flex-1 py-3 rounded-xl border dark:border-white/10 border-slate-200 dark:hover:bg-white/5 hover:bg-slate-100 text-xs font-black uppercase text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors disabled:opacity-40"
                >
                  Clear Board
                </button>
                <button
                  onClick={verifyConstructorGame}
                  disabled={gameSlots.includes(null) || gameFeedback === "correct"}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-45"
                >
                  Verify Formula
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </div>
  );
}