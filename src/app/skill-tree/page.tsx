"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GitFork, Lock, CheckCircle2, Zap, Trophy, Sparkles, BookOpen, 
  ChevronRight, ArrowUpRight, Flame, Shield, Star, Compass, Atom, Dna, Calculator
} from "lucide-react";
import Link from "next/link";
import { awardXp } from "@/lib/xp";
import { cn } from "@/lib/utils";
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
        description: "Explore Fermat's Principle and the laws of reflection. Master ray tracing, Cartesian sign conventions, and focal lengths for concave and convex spherical mirrors to solve board numericals.",
        keyFormulas: ["\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}", "m = -\\frac{v}{u} = \\frac{h_i}{h_o}"],
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
        description: "Understand Snell's Law and the optical density of media. Discover how light bends across interfaces, and calculate the focal lengths and dioptre power of thin spherical lenses.",
        keyFormulas: ["\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}", "n_{21} = \\frac{\\sin i}{\\sin r} = \\frac{v_1}{v_2}", "P = \\frac{1}{f\\text{ (in meters)}} = \\text{Dioptres (D)}"],
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
        description: "Define electric charge, current flow, and potential difference. Learn Ohm's Law and investigate the micro-factors affecting resistance, including length, area, and material resistivity.",
        keyFormulas: ["I = \\frac{Q}{t}", "V = I R", "R = \\rho \\frac{L}{A}"],
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
        description: "Analyze complex electrical networks. Solve equivalent resistance for series and parallel topologies. Learn Joule's Law of Heating and electric power consumption.",
        keyFormulas: ["R_s = R_1 + R_2 + R_3", "\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}", "H = I^2 R t", "P = V I = I^2 R = \\frac{V^2}{R}"],
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
        description: "Visualize magnetic field lines and field patterns around straight conductors, loops, and solenoids. Apply the Right-Hand Thumb Rule and evaluate Lorentz force on current-carrying conductors.",
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
        description: "Master electromagnetic induction (EMI) and induced potential difference. Contrast AC vs DC generators, learn Fleming's Left and Right Hand Rules, and understand magnetic flux dynamics.",
        keyFormulas: ["\\mathcal{E} = -\\frac{d\\Phi_B}{dt}"],
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
        description: "Apply the Law of Conservation of Mass to balance chemical equations. Identify combination, decomposition, displacement, double displacement, and redox (oxidation-reduction) reactions.",
        keyFormulas: ["\\text{Reactants} \\rightarrow \\text{Products}", "\\sum \\text{Mass}_{\\text{reactants}} = \\sum \\text{Mass}_{\\text{products}}"],
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
        description: "Investigate Arrhenius acids and bases, chemical indicators, and salt families. Understand the logarithmic pH scale and its daily application in physiology, digestive health, and agriculture.",
        keyFormulas: ["\\text{Acid} + \\text{Base} \\rightarrow \\text{Salt} + \\text{H}_2\\text{O}", "\\text{pH} = -\\log_{10}[\\text{H}^+]"],
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
        description: "Distinguish physical and chemical properties of metals and non-metals. Use the reactivity series to predict displacement reactions, and master metallurgical extraction (calcination vs. roasting).",
        keyFormulas: ["\\text{K} > \\text{Na} > \\text{Ca} > \\text{Mg} > \\text{Al} > \\text{Zn} > \\text{Fe} > \\text{Pb} > [\\text{H}] > \\text{Cu} > \\text{Ag} > \\text{Au}"],
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
        description: "Explore carbon's versatile nature: tetravalency and catenation. Study covalent bonding, homologous series, functional groups (alcohols, aldehydes, ketones, carboxylic acids), and IUPAC rules.",
        keyFormulas: ["\\text{C}_n\\text{H}_{2n+2}\\text{ (Alkane)}", "\\text{C}_n\\text{H}_{2n}\\text{ (Alkene)}", "\\text{C}_n\\text{H}_{2n-2}\\text{ (Alkyne)}"],
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
        description: "Learn major organic transformations: esterification, saponification, oxidation, addition, and substitution. Understand the micelle structure and cleansing action of soaps and synthetic detergents.",
        keyFormulas: ["\\text{RCOOH} + \\text{R'OH} \\xrightarrow{\\text{Acid}} \\text{RCOOR'} + \\text{H}_2\\text{O}", "\\text{Fat} + 3\\text{NaOH} \\rightarrow \\text{Glycerol} + 3\\text{Soap (RCOO}^-\\text{Na}^+)"],
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
        description: "Detail autotrophic (chlorophyll-mediated light and dark reactions) and heterotrophic nutrition. Walk through human ingestion, digestion by salivary/gastric/pancreatic enzymes, absorption, and assimilation.",
        keyFormulas: ["6\\text{CO}_2 + 12\\text{H}_2\\text{O} \\xrightarrow[\\text{Chlorophyll}]{\\text{Sunlight}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 + 6\\text{H}_2\\text{O}"],
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
        description: "Contrast aerobic and anaerobic respiration pathways. Track glycolysis in the cytoplasm, fermentation in yeast/muscle, and the Krebs cycle in mitochondria producing high ATP yields.",
        keyFormulas: ["\\text{Glucose} \\xrightarrow{\\text{Glycolysis}} \\text{Pyruvate} \\xrightarrow{\\text{Aerobic Respiration}} 36\\text{-}38\\text{ ATP}"],
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
        description: "Understand the human heart's double circulation and systemic capillary exchange. Trace the nephron's role in ultrafiltration (Glomerulus/Bowman's) and selective reabsorption (PCT/Henle/DCT).",
        keyFormulas: ["\\text{Urine Output} = \\text{Glomerular Filtration} - \\text{Selective Reabsorption} + \\text{Active Secretion}"],
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
        description: "Master genetic inheritance. Trace Mendel's monohybrid and dihybrid crosses to explain the Law of Dominance, Law of Segregation, and Law of Independent Assortment. Learn sex determination in humans.",
        keyFormulas: ["\\text{Monohybrid Phenotypic Ratio} = 3 : 1", "\\text{Dihybrid Phenotypic Ratio} = 9 : 3 : 3 : 1"],
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
        description: "Explore the Fundamental Theorem of Arithmetic. Learn Euclid's Division Lemma/Algorithm, prove the irrationality of numbers (like √2, √3, √5), and analyze decimal expansions.",
        keyFormulas: ["a = b q + r \\quad (0 \\le r < b)", "\\text{HCF}(a,b) \\times \\text{LCM}(a,b) = a \\cdot b"],
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
        description: "Connect polynomial zeroes with coefficients. Solve quadratic equations using factorization and the quadratic formula, and evaluate the nature of roots using the discriminant D.",
        keyFormulas: ["x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", "\\alpha + \\beta = -\\frac{b}{a}, \\quad \\alpha\\beta = \\frac{c}{a}"],
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
        description: "Define six trigonometric ratios. Memorize standard values at 0°, 30°, 45°, 60°, and 90°, and apply Pythagorean identities to prove complex trigonometric relations.",
        keyFormulas: ["\\sin^2\\theta + \\cos^2\\theta = 1", "1 + \\tan^2\\theta = \\sec^2\\theta", "1 + \\cot^2\\theta = \\csc^2\\theta"],
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
        description: "Apply trigonometry to real-world scenarios. Draw diagrams representing line of sight, angle of elevation, and angle of depression to calculate heights of towers, mountains, and width of rivers.",
        keyFormulas: ["\\tan\\theta = \\frac{\\text{Height (Opposite)}}{\\text{Distance (Adjacent)}}"],
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
                      <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center min-h-[48px] text-sm text-indigo-300 overflow-x-auto">
                        <MathEquation formula={f} displayMode={true} />
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
