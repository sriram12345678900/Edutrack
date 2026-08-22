"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GitFork, Lock, CheckCircle2, Zap, Trophy, Sparkles, BookOpen, 
  ChevronRight, ArrowUpRight, Flame, Shield, Star, Compass, Atom, Dna, Calculator
} from "lucide-react";
import Link from "next/link";
import { awardXp } from "@/lib/xp";
import { cn } from "@/lib/utils";

interface SkillNode {
  id: string;
  name: string;
  tier: number;
  prerequisites: string[];
  status: "mastered" | "unlocked" | "locked";
  xpReward: number;
  icon: string;
  description: string;
  keyFormulas: string[];
  studyLink: string;
}

interface SubjectTree {
  subject: string;
  icon: any;
  color: string;
  nodes: SkillNode[];
}

const SKILL_TREES: { [key: string]: SubjectTree } = {
  Physics: {
    subject: "Physics",
    icon: Atom,
    color: "from-blue-500 to-indigo-600",
    nodes: [
      {
        id: "p1",
        name: "Reflection & Mirrors",
        tier: 1,
        prerequisites: [],
        status: "mastered",
        xpReward: 100,
        icon: "🪞",
        description: "Laws of reflection, concave & convex spherical mirrors, mirror formula and sign conventions.",
        keyFormulas: ["1/f = 1/v + 1/u", "m = -v/u = h_i / h_o"],
        studyLink: "/learn/science/light-reflection-refraction"
      },
      {
        id: "p2",
        name: "Refraction & Lenses",
        tier: 2,
        prerequisites: ["p1"],
        status: "mastered",
        xpReward: 150,
        icon: "🔍",
        description: "Snell's law, refractive index, lens formula, power of lenses in dioptres.",
        keyFormulas: ["1/f = 1/v - 1/u", "n_21 = v_1 / v_2", "P = 1/f (m)"],
        studyLink: "/learn/science/light-reflection-refraction"
      },
      {
        id: "p3",
        name: "Current & Ohm's Law",
        tier: 1,
        prerequisites: [],
        status: "mastered",
        xpReward: 100,
        icon: "⚡",
        description: "Electric charge, potential difference, Ohm's law, resistance factors and resistivity.",
        keyFormulas: ["I = Q/t", "V = IR", "R = \\rho L / A"],
        studyLink: "/learn/science/electricity"
      },
      {
        id: "p4",
        name: "Circuit Resistors (Series & Parallel)",
        tier: 2,
        prerequisites: ["p3"],
        status: "unlocked",
        xpReward: 200,
        icon: "🔌",
        description: "Equivalent resistance in series & parallel circuits, Joule's law of heating, electric power.",
        keyFormulas: ["R_s = R_1 + R_2", "1/R_p = 1/R_1 + 1/R_2", "H = I^2 R t", "P = VI = I^2 R"],
        studyLink: "/learn/science/electricity"
      },
      {
        id: "p5",
        name: "Magnetic Effects & Solenoids",
        tier: 3,
        prerequisites: ["p2", "p4"],
        status: "unlocked",
        xpReward: 300,
        icon: "🧲",
        description: "Magnetic field lines, right-hand thumb rule, solenoid field, Lorentz force on a conductor.",
        keyFormulas: ["B = \\mu_0 n I", "F = B I L \\sin\\theta"],
        studyLink: "/learn/science/magnetic-effects-electric-current"
      },
      {
        id: "p6",
        name: "Electromagnetic Induction & Motors",
        tier: 4,
        prerequisites: ["p5"],
        status: "locked",
        xpReward: 500,
        icon: "⚙️",
        description: "Faraday's experiments, Fleming's left and right hand rules, AC vs DC generators.",
        keyFormulas: ["\\mathcal{E} = -d\\Phi_B / dt"],
        studyLink: "/learn/science/magnetic-effects-electric-current"
      }
    ]
  },
  Chemistry: {
    subject: "Chemistry",
    icon: Sparkles,
    color: "from-purple-500 to-pink-600",
    nodes: [
      {
        id: "c1",
        name: "Chemical Equations & Balancing",
        tier: 1,
        prerequisites: [],
        status: "mastered",
        xpReward: 100,
        icon: "🧪",
        description: "Types of reactions (Combination, Decomposition, Displacement, Redox), balancing by hit & trial.",
        keyFormulas: ["Law of Conservation of Mass"],
        studyLink: "/learn/science/chemical-reactions-equations"
      },
      {
        id: "c2",
        name: "Acids, Bases & pH Scale",
        tier: 2,
        prerequisites: ["c1"],
        status: "mastered",
        xpReward: 150,
        icon: "🍋",
        description: "Neutralisation reactions, indicators, pH scale calculation, salts in everyday life.",
        keyFormulas: ["\\text{Acid} + \\text{Base} \\rightarrow \\text{Salt} + \\text{H}_2\\text{O}", "\\text{pH} = -\\log[H^+]"],
        studyLink: "/learn/science/acids-bases-salts"
      },
      {
        id: "c3",
        name: "Metals & Reactivity Series",
        tier: 2,
        prerequisites: ["c1"],
        status: "unlocked",
        xpReward: 200,
        icon: "🪙",
        description: "Physical & chemical properties of metals, reactivity series, extraction and metallurgy roasting/calcination.",
        keyFormulas: ["\\text{K} > \\text{Na} > \\text{Ca} > \\text{Mg} > \\text{Al} > \\text{Zn}"],
        studyLink: "/learn/science/metals-non-metals"
      },
      {
        id: "c4",
        name: "Carbon & Covalent Bonding",
        tier: 3,
        prerequisites: ["c2", "c3"],
        status: "unlocked",
        xpReward: 350,
        icon: "💎",
        description: "Tetravalency, catenation, homologous series, functional groups (alcohols, aldehydes, carboxylic acids).",
        keyFormulas: ["\\text{C}_n\\text{H}_{2n+2} (\\text{Alkane})", "\\text{C}_n\\text{H}_{2n} (\\text{Alkene})"],
        studyLink: "/learn/science/carbon-compounds"
      },
      {
        id: "c5",
        name: "Organic Reactions & Polymers",
        tier: 4,
        prerequisites: ["c4"],
        status: "locked",
        xpReward: 500,
        icon: "🧬",
        description: "Esterification, saponification, addition & substitution reactions, soaps and detergents.",
        keyFormulas: ["\\text{RCOOH} + \\text{R'OH} \\rightarrow \\text{RCOOR'} + \\text{H}_2\\text{O}"],
        studyLink: "/learn/science/carbon-compounds"
      }
    ]
  },
  Biology: {
    subject: "Biology",
    icon: Dna,
    color: "from-emerald-500 to-teal-600",
    nodes: [
      {
        id: "b1",
        name: "Nutrition & Photosynthesis",
        tier: 1,
        prerequisites: [],
        status: "mastered",
        xpReward: 100,
        icon: "🌱",
        description: "Autotrophic vs heterotrophic nutrition, light and dark reactions of photosynthesis, digestive enzymes.",
        keyFormulas: ["6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2"],
        studyLink: "/learn/science/life-processes"
      },
      {
        id: "b2",
        name: "Respiration & Gas Exchange",
        tier: 2,
        prerequisites: ["b1"],
        status: "mastered",
        xpReward: 150,
        icon: "🫁",
        description: "Aerobic vs anaerobic glycolysis, ATP production, alveoli structure and gas exchange.",
        keyFormulas: ["\\text{Glucose} \\rightarrow \\text{Pyruvate} \\rightarrow 38 \\text{ ATP}"],
        studyLink: "/learn/science/life-processes"
      },
      {
        id: "b3",
        name: "Circulation & Excretion",
        tier: 3,
        prerequisites: ["b2"],
        status: "unlocked",
        xpReward: 250,
        icon: "❤️",
        description: "Double circulation in human heart, blood vessels, nephron structure and urine formation.",
        keyFormulas: ["\\text{Glomerular Filtration} \\rightarrow \\text{Selective Reabsorption}"],
        studyLink: "/learn/science/life-processes"
      },
      {
        id: "b4",
        name: "Heredity & Mendel's Laws",
        tier: 4,
        prerequisites: ["b3"],
        status: "locked",
        xpReward: 400,
        icon: "🧬",
        description: "Monohybrid and dihybrid crosses, law of segregation, law of independent assortment, sex determination.",
        keyFormulas: ["9:3:3:1 \\text{ Phenotypic Ratio}"],
        studyLink: "/learn/science/heredity-evolution"
      }
    ]
  },
  Mathematics: {
    subject: "Mathematics",
    icon: Calculator,
    color: "from-amber-500 to-orange-600",
    nodes: [
      {
        id: "m1",
        name: "Real Numbers & Euclid's Lemma",
        tier: 1,
        prerequisites: [],
        status: "mastered",
        xpReward: 100,
        icon: "🔢",
        description: "Fundamental Theorem of Arithmetic, irrationality proofs for √2, √3, √5, terminating decimal expansions.",
        keyFormulas: ["\\text{HCF}(a,b) \\times \\text{LCM}(a,b) = a \\times b"],
        studyLink: "/learn/maths/real-numbers"
      },
      {
        id: "m2",
        name: "Polynomials & Quadratics",
        tier: 2,
        prerequisites: ["m1"],
        status: "mastered",
        xpReward: 150,
        icon: "📈",
        description: "Relationship between zeroes and coefficients, quadratic formula, nature of roots (D > 0, D = 0, D < 0).",
        keyFormulas: ["x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", "\\alpha + \\beta = -b/a, \\quad \\alpha\\beta = c/a"],
        studyLink: "/learn/maths/quadratic-equations"
      },
      {
        id: "m3",
        name: "Trigonometry & Identities",
        tier: 3,
        prerequisites: ["m2"],
        status: "unlocked",
        xpReward: 300,
        icon: "📐",
        description: "Trigonometric ratios, values at standard angles (0°, 30°, 45°, 60°, 90°), fundamental Pythagorean identities.",
        keyFormulas: ["\\sin^2\\theta + \\cos^2\\theta = 1", "1 + \\tan^2\\theta = \\sec^2\\theta"],
        studyLink: "/learn/maths/introduction-to-trigonometry"
      },
      {
        id: "m4",
        name: "Heights & Distances (Applications)",
        tier: 4,
        prerequisites: ["m3"],
        status: "locked",
        xpReward: 450,
        icon: "🏔️",
        description: "Angle of elevation and depression, line of sight, solving multi-triangle real-world surveying problems.",
        keyFormulas: ["\\tan\\theta = \\text{Opposite} / \\text{Adjacent}"],
        studyLink: "/learn/maths/some-applications-of-trigonometry"
      }
    ]
  }
};

export default function SkillTreePage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("Physics");
  const [activeNode, setActiveNode] = useState<SkillNode | null>(SKILL_TREES["Physics"].nodes[3]);

  const tree = SKILL_TREES[selectedSubject];

  const handleNodeClick = (node: SkillNode) => {
    setActiveNode(node);
  };

  const handleUnlockNode = (nodeId: string) => {
    // Demo unlock trigger
    awardXp(100, "Unlocked New Skill Node");
    alert("Node Unlocked! +100 XP gained.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/60 border border-indigo-500/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black uppercase tracking-wider">
                <GitFork className="w-3.5 h-3.5" />
                RPG Knowledge Architecture
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                Subject <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Skill Tree</span>
              </h1>
              <p className="text-slate-300 text-xs md:text-sm max-w-xl">
                Master prerequisites, unlock advanced chapters, and level up your academic talent tree like an RPG hero!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">TALENT POINTS</span>
                <span className="text-sm font-black text-amber-400 flex items-center gap-1 justify-center">
                  <Star className="w-4 h-4 fill-amber-400" /> 14 Available
                </span>
              </div>
            </div>
          </div>

          {/* Subject Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-800/80 mt-6">
            {Object.keys(SKILL_TREES).map(subj => {
              const item = SKILL_TREES[subj];
              const Icon = item.icon;
              const isSelected = selectedSubject === subj;
              return (
                <button
                  key={subj}
                  onClick={() => {
                    setSelectedSubject(subj);
                    setActiveNode(SKILL_TREES[subj].nodes[0]);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all border",
                    isSelected
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-105"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {subj}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tree & Node Inspector Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Visual Interactive Tree (2 cols) */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden min-h-[500px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                {selectedSubject} Mastery Tree
              </h2>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Mastered
                </span>
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> In Progress
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Locked
                </span>
              </div>
            </div>

            {/* Tree Nodes Flow */}
            <div className="space-y-8 py-4">
              {/* Group nodes by Tier */}
              {[1, 2, 3, 4].map(tier => {
                const tierNodes = tree.nodes.filter(n => n.tier === tier);
                if (tierNodes.length === 0) return null;

                return (
                  <div key={tier} className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <span>Tier {tier}</span>
                      <div className="flex-1 h-[1px] bg-slate-800" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {tierNodes.map(node => {
                        const isSelected = activeNode?.id === node.id;
                        return (
                          <div
                            key={node.id}
                            onClick={() => handleNodeClick(node)}
                            className={cn(
                              "p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between",
                              isSelected ? "ring-2 ring-indigo-500 scale-[1.02]" : "",
                              node.status === "mastered"
                                ? "bg-emerald-950/20 border-emerald-500/40 shadow-sm"
                                : node.status === "unlocked"
                                ? "bg-indigo-950/30 border-indigo-500/40 shadow-sm"
                                : "bg-slate-950/40 border-slate-800/80 opacity-60"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-11 h-11 rounded-2xl flex items-center justify-center text-xl border",
                                node.status === "mastered"
                                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                  : node.status === "unlocked"
                                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                                  : "bg-slate-800 border-slate-700 text-slate-500"
                              )}>
                                {node.icon}
                              </div>

                              <div>
                                <h3 className="text-xs md:text-sm font-black text-white">{node.name}</h3>
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                                  <Zap className="w-3 h-3 fill-amber-400" /> +{node.xpReward} XP
                                </span>
                              </div>
                            </div>

                            <div>
                              {node.status === "mastered" && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              )}
                              {node.status === "unlocked" && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                                  Ready
                                </span>
                              )}
                              {node.status === "locked" && (
                                <Lock className="w-4 h-4 text-slate-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Inspector Panel */}
          <div className="space-y-4">
            {activeNode ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl sticky top-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-400">Node Intel</span>
                  <span className={cn(
                    "text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase",
                    activeNode.status === "mastered" ? "bg-emerald-500/20 text-emerald-300" :
                    activeNode.status === "unlocked" ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-400"
                  )}>
                    {activeNode.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-3xl">{activeNode.icon}</div>
                  <h2 className="text-lg font-black text-white">{activeNode.name}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeNode.description}</p>
                </div>

                {/* Key Formulas */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400">Core Formulas & Principles</span>
                  <div className="space-y-1.5">
                    {activeNode.keyFormulas.map((f, i) => (
                      <div key={i} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300">
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <Link
                    href={activeNode.studyLink}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    Open Chapter & Notes
                  </Link>

                  {activeNode.status === "unlocked" && (
                    <button
                      onClick={() => handleUnlockNode(activeNode.id)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Claim Mastery (+{activeNode.xpReward} XP)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-xs text-slate-500">
                Click any node on the skill tree to view topic intel, formulas, and study links.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
