"use client";

import React, { useState } from 'react';
import { 
  Home, Beaker, Atom, Flame, RefreshCw, AlertTriangle, 
  CheckCircle2, Compass, Eye, Sparkles, Zap, Layers, 
  Sliders, Info, HelpCircle, ArrowRight, Activity
} from 'lucide-react';
import Link from 'next/link';

// ==========================================
//  CHEMISTRY SIMULATOR TYPES & DATA
// ==========================================

type Reagent = {
  id: string;
  symbol: string;
  name: string;
  category: 'element' | 'acid_base' | 'salt';
  color: string; // Tailwind color class
  pH: number;
  state: 'solid' | 'liquid' | 'gas';
};

const REAGENTS: Reagent[] = [
  // Elements
  { id: 'H', symbol: 'H', name: 'Hydrogen', category: 'element', color: 'bg-blue-400', pH: 7, state: 'gas' },
  { id: 'O', symbol: 'O', name: 'Oxygen', category: 'element', color: 'bg-red-500', pH: 7, state: 'gas' },
  { id: 'Na', symbol: 'Na', name: 'Sodium', category: 'element', color: 'bg-purple-500', pH: 7, state: 'solid' },
  { id: 'Cl', symbol: 'Cl', name: 'Chlorine', category: 'element', color: 'bg-emerald-500', pH: 7, state: 'gas' },
  { id: 'C', symbol: 'C', name: 'Carbon', category: 'element', color: 'bg-slate-600', pH: 7, state: 'solid' },
  { id: 'N', symbol: 'N', name: 'Nitrogen', category: 'element', color: 'bg-indigo-400', pH: 7, state: 'gas' },
  { id: 'Fe', symbol: 'Fe', name: 'Iron (Nails)', category: 'element', color: 'bg-amber-600', pH: 7, state: 'solid' },
  { id: 'S', symbol: 'S', name: 'Sulfur Powder', category: 'element', color: 'bg-yellow-400', pH: 7, state: 'solid' },
  { id: 'Mg', symbol: 'Mg', name: 'Magnesium Ribbon', category: 'element', color: 'bg-slate-300', pH: 7, state: 'solid' },

  // Acids & Bases
  { id: 'HCl', symbol: 'HCl', name: 'Hydrochloric Acid', category: 'acid_base', color: 'bg-rose-500', pH: 1.0, state: 'liquid' },
  { id: 'NaOH', symbol: 'NaOH', name: 'Sodium Hydroxide', category: 'acid_base', color: 'bg-blue-600', pH: 13.5, state: 'liquid' },
  { id: 'H2SO4', symbol: 'H₂SO₄', name: 'Sulfuric Acid', category: 'acid_base', color: 'bg-red-600', pH: 0.5, state: 'liquid' },

  // Salts & Compounds
  { id: 'CuSO4', symbol: 'CuSO₄', name: 'Copper Sulfate', category: 'salt', color: 'bg-cyan-500', pH: 5.5, state: 'solid' },
  { id: 'CaCO3', symbol: 'CaCO₃', name: 'Calcium Carbonate', category: 'salt', color: 'bg-stone-300', pH: 9.0, state: 'solid' },
  { id: 'Ind', symbol: 'Ind', name: 'Universal Indicator', category: 'salt', color: 'bg-emerald-400', pH: 7.0, state: 'liquid' },
];

type ReactionResult = {
  equation: string;
  product: string;
  name: string;
  type: string;
  desc: string;
  finalPH: number;
  liquidColor: string;
  effect: 'gas' | 'precipitate' | 'heat' | 'neutral' | 'color_change';
  tempChange: string;
};

const CHEMISTRY_REACTIONS: Record<string, ReactionResult> = {
  // Neutralization
  'HCl-NaOH': {
    equation: 'HCl + NaOH  NaCl + H₂O',
    product: 'NaCl + H₂O',
    name: 'Sodium Chloride & Water',
    type: 'Neutralization (Acid + Base)',
    desc: 'Acid and base react to form salt and neutral water. Universal indicator turns green.',
    finalPH: 7.0,
    liquidColor: 'from-emerald-500/40 to-teal-600/30',
    effect: 'neutral',
    tempChange: '+4.5°C (Exothermic)',
  },
  'H2SO4-NaOH': {
    equation: 'H₂SO₄ + 2NaOH  Na₂SO₄ + 2H₂O',
    product: 'Na₂SO₄ + 2H₂O',
    name: 'Sodium Sulfate & Water',
    type: 'Neutralization',
    desc: 'Exothermic neutralization producing neutral sodium sulfate salt.',
    finalPH: 7.0,
    liquidColor: 'from-teal-500/40 to-emerald-500/30',
    effect: 'heat',
    tempChange: '+8.2°C (Exothermic)',
  },

  // Single Displacement
  'CuSO4-Fe': {
    equation: 'Fe + CuSO₄  FeSO₄ + Cu↓',
    product: 'FeSO₄ + Cu (Reddish-brown ppt)',
    name: 'Iron(II) Sulfate & Copper Deposit',
    type: 'Single Displacement Reaction',
    desc: 'More reactive Iron displaces Copper from copper sulfate. Blue solution turns pale light green, and brown copper deposits on iron nails!',
    finalPH: 5.5,
    liquidColor: 'from-emerald-600/60 to-green-800/40',
    effect: 'precipitate',
    tempChange: '+3.0°C',
  },
  'HCl-Mg': {
    equation: 'Mg + 2HCl  MgCl₂ + H₂↑',
    product: 'MgCl₂ + H₂ Gas',
    name: 'Magnesium Chloride & Hydrogen Gas',
    type: 'Displacement & Gas Evolution',
    desc: 'Vigorous reaction releasing Hydrogen gas bubbles which burn with a pop sound when tested with a matchstick.',
    finalPH: 4.0,
    liquidColor: 'from-slate-400/30 to-blue-500/20',
    effect: 'gas',
    tempChange: '+12.0°C (Vigorous Heat)',
  },

  // Combination / Synthesis
  'H-H-O': {
    equation: '2H₂ + O₂  2H₂O',
    product: 'H₂O',
    name: 'Water Synthesis',
    type: 'Combination (Exothermic)',
    desc: 'Hydrogen combusts with Oxygen to synthesize pure water with release of heat.',
    finalPH: 7.0,
    liquidColor: 'from-cyan-400/40 to-blue-500/30',
    effect: 'heat',
    tempChange: '+15.0°C',
  },
  'Cl-Na': {
    equation: '2Na + Cl₂  2NaCl',
    product: 'NaCl',
    name: 'Sodium Chloride (Table Salt)',
    type: 'Ionic Combination',
    desc: 'Sodium metal burns in chlorine gas with an intense yellow flame to form table salt.',
    finalPH: 7.0,
    liquidColor: 'from-purple-500/30 to-indigo-500/30',
    effect: 'heat',
    tempChange: '+20.0°C',
  },
  'C-O-O': {
    equation: 'C + O₂  CO₂↑',
    product: 'CO₂ Gas',
    name: 'Carbon Dioxide',
    type: 'Combustion',
    desc: 'Carbon burns completely in excess oxygen to produce carbon dioxide gas.',
    finalPH: 6.0,
    liquidColor: 'from-slate-500/40 to-gray-700/30',
    effect: 'gas',
    tempChange: '+18.0°C',
  },
  'Fe-S': {
    equation: 'Fe + S  FeS',
    product: 'FeS',
    name: 'Iron(II) Sulfide',
    type: 'Direct Combination',
    desc: 'Heating iron filings and sulfur powder produces a dark black non-magnetic compound.',
    finalPH: 7.0,
    liquidColor: 'from-yellow-700/50 to-amber-900/40',
    effect: 'precipitate',
    tempChange: '+6.0°C',
  },

  // Decomposition
  'CaCO3': {
    equation: 'CaCO₃ + Heat  CaO + CO₂↑',
    product: 'CaO + CO₂ Gas',
    name: 'Quicklime & Carbon Dioxide',
    type: 'Thermal Decomposition',
    desc: 'Heating limestone (calcium carbonate) decomposes it into quicklime (calcium oxide) and carbon dioxide gas.',
    finalPH: 11.5,
    liquidColor: 'from-stone-300/40 to-amber-100/30',
    effect: 'gas',
    tempChange: '-2.0°C (Endothermic)',
  },
  'CaCO3-HCl': {
    equation: 'CaCO₃ + 2HCl  CaCl₂ + H₂O + CO₂↑',
    product: 'CaCl₂ + H₂O + CO₂ Gas',
    name: 'Calcium Chloride, Water & Carbon Dioxide',
    type: 'Double Displacement & Decomposition',
    desc: 'Effervescence observed as brisk bubbles of Carbon Dioxide gas are evolved, turning lime water milky.',
    finalPH: 6.0,
    liquidColor: 'from-amber-200/30 to-slate-400/20',
    effect: 'gas',
    tempChange: '+5.0°C',
  }
};

// ==========================================
// ️ OPTICS SIMULATOR TYPES & PHYSICS ENGINE
// ==========================================

type OpticElementType = 'convex_lens' | 'concave_lens' | 'concave_mirror' | 'convex_mirror' | 'plane_mirror';

type OpticResult = {
  v: number; // Image distance (cm) - sign convention: right = +ve, left = -ve
  m: number; // Magnification
  hi: number; // Image height (cm)
  isReal: boolean;
  isInverted: boolean;
  isMagnified: boolean;
  natureText: string;
  positionText: string;
};

function calculateOptics(type: OpticElementType, fMag: number, uMag: number, ho: number): OpticResult {
  // u is always to the left of element in standard ray diagrams: u = -uMag
  const u = -uMag;

  if (type === 'plane_mirror') {
    return {
      v: uMag, // Behind mirror (+ve)
      m: 1.0,
      hi: ho,
      isReal: false,
      isInverted: false,
      isMagnified: false,
      natureText: 'Virtual & Erect',
      positionText: `Behind Mirror at ${uMag.toFixed(1)} cm (Same distance)`
    };
  }

  let f = fMag;
  let v = 0;
  let m = 0;

  if (type === 'convex_lens') {
    // Convex Lens: f > 0
    f = fMag;
    if (Math.abs(uMag - f) < 0.1) {
      v = Infinity;
      m = Infinity;
    } else {
      v = (f * uMag) / (uMag - f);
      m = v / u; // Lens magnification m = v / u = v / (-uMag)
    }
  } else if (type === 'concave_lens') {
    // Concave Lens: f < 0 (-fMag)
    f = -fMag;
    v = -(fMag * uMag) / (uMag + fMag);
    m = v / u; // Lens m = v / u
  } else if (type === 'concave_mirror') {
    // Concave Mirror: f < 0 (-fMag)
    f = -fMag;
    if (Math.abs(uMag - fMag) < 0.1) {
      v = Infinity;
      m = Infinity;
    } else {
      v = -(fMag * uMag) / (uMag - fMag);
      m = -(v / u); // Mirror m = -v / u = -v / (-uMag) = v / uMag
    }
  } else if (type === 'convex_mirror') {
    // Convex Mirror: f > 0 (+fMag)
    f = fMag;
    v = (fMag * uMag) / (uMag + fMag);
    m = -(v / u); // Mirror m = -v / (-uMag) = v / uMag
  }

  const hi = m === Infinity ? Infinity : m * ho;
  const isReal = type.includes('lens') ? v > 0 : v < 0;
  const isInverted = m < 0;
  const absM = Math.abs(m);
  const isMagnified = absM > 1.0;

  // Position Description
  let posText = '';
  if (v === Infinity) {
    posText = 'At Infinity (Parallel rays)';
  } else if (type === 'convex_lens') {
    if (v < 0) posText = `On same side as object (Virtual, |v| = ${Math.abs(v).toFixed(1)} cm)`;
    else if (Math.abs(v - fMag) < 1) posText = `At Focus F₂ (${v.toFixed(1)} cm)`;
    else if (Math.abs(v - 2 * fMag) < 1) posText = `At 2F₂ (${v.toFixed(1)} cm)`;
    else if (v > 2 * fMag) posText = `Beyond 2F₂ (${v.toFixed(1)} cm)`;
    else posText = `Between F₂ and 2F₂ (${v.toFixed(1)} cm)`;
  } else if (type === 'concave_lens') {
    posText = `Between Focus F₁ and Optical Center (${Math.abs(v).toFixed(1)} cm to left)`;
  } else if (type === 'concave_mirror') {
    if (v > 0) posText = `Behind Mirror (Virtual, ${v.toFixed(1)} cm to right)`;
    else if (Math.abs(Math.abs(v) - fMag) < 1) posText = `At Focus F (${Math.abs(v).toFixed(1)} cm in front)`;
    else if (Math.abs(Math.abs(v) - 2 * fMag) < 1) posText = `At Center of Curvature C (${Math.abs(v).toFixed(1)} cm in front)`;
    else if (Math.abs(v) > 2 * fMag) posText = `Beyond Center of Curvature C (${Math.abs(v).toFixed(1)} cm in front)`;
    else posText = `Between Focus F and Center of Curvature C (${Math.abs(v).toFixed(1)} cm in front)`;
  } else if (type === 'convex_mirror') {
    posText = `Behind Mirror between Pole P and Focus F (${v.toFixed(1)} cm to right)`;
  }

  const natureText = v === Infinity 
    ? 'Real, Highly Enlarged at Infinity' 
    : `${isReal ? 'Real' : 'Virtual'} & ${isInverted ? 'Inverted' : 'Erect'} (${absM > 1.05 ? 'Magnified' : absM < 0.95 ? 'Diminished' : 'Same Size'})`;

  return {
    v,
    m,
    hi,
    isReal,
    isInverted,
    isMagnified,
    natureText,
    positionText: posText
  };
}

// ==========================================
//  MAIN SANDBOX PAGE COMPONENT
// ==========================================

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState<'chemistry' | 'optics'>('chemistry');

  // ------------------------------------------
  // Chemistry Workbench States
  // ------------------------------------------
  const [chemCategory, setChemCategory] = useState<'all' | 'element' | 'acid_base' | 'salt'>('all');
  const [workspace, setWorkspace] = useState<Reagent[]>([]);
  const [result, setResult] = useState<ReactionResult | null>(null);
  const [isReacting, setIsReacting] = useState(false);

  const addReagent = (r: Reagent) => {
    if (workspace.length >= 4) return;
    setWorkspace([...workspace, r]);
    setResult(null);
  };

  const handleReact = () => {
    if (workspace.length === 0) return;
    setIsReacting(true);

    setTimeout(() => {
      // Sort symbols for matching keys
      const ids = workspace.map(r => r.id).sort().join('-');
      let matched = CHEMISTRY_REACTIONS[ids];

      if (!matched) {
        // Try fallback matches
        const concat = workspace.map(r => r.id).sort().join('');
        if (concat.includes('HCl') && concat.includes('NaOH')) matched = CHEMISTRY_REACTIONS['HCl-NaOH'];
        else if (concat.includes('CuSO4') && concat.includes('Fe')) matched = CHEMISTRY_REACTIONS['CuSO4-Fe'];
        else if (concat.includes('HCl') && concat.includes('Mg')) matched = CHEMISTRY_REACTIONS['HCl-Mg'];
        else if (concat.includes('CaCO3') && concat.includes('HCl')) matched = CHEMISTRY_REACTIONS['CaCO3-HCl'];
        else if (concat.includes('H2SO4') && concat.includes('NaOH')) matched = CHEMISTRY_REACTIONS['H2SO4-NaOH'];
        else if (concat === 'HHO' || concat === 'HH' + 'O') matched = CHEMISTRY_REACTIONS['H-H-O'];
        else if (concat === 'ClNa' || concat === 'NaCl') matched = CHEMISTRY_REACTIONS['Cl-Na'];
        else if (concat === 'COO') matched = CHEMISTRY_REACTIONS['C-O-O'];
        else if (concat === 'FeS') matched = CHEMISTRY_REACTIONS['Fe-S'];
        else if (concat === 'CaCO3') matched = CHEMISTRY_REACTIONS['CaCO3'];
      }

      if (matched) {
        setResult(matched);
      } else {
        // Compute average pH for mixed unreacted liquid
        const avgPH = workspace.reduce((acc, r) => acc + r.pH, 0) / workspace.length;
        setResult({
          equation: 'No Chemical Reaction',
          product: 'Mixture / Solution',
          name: 'Physical Mixture',
          type: 'No Reaction Observed',
          desc: 'These reagents do not undergo a common NCERT chemical reaction under room temperature.',
          finalPH: avgPH,
          liquidColor: avgPH < 6 ? 'from-rose-500/30 to-amber-500/20' : avgPH > 8 ? 'from-blue-600/30 to-indigo-600/20' : 'from-emerald-500/30 to-teal-500/20',
          effect: 'neutral',
          tempChange: '0°C'
        });
      }
      setIsReacting(false);
    }, 1000);
  };

  const clearWorkspace = () => {
    setWorkspace([]);
    setResult(null);
  };

  // Compute Current Beaker Liquid pH
  const currentPH = result 
    ? result.finalPH 
    : workspace.length > 0 
    ? workspace.reduce((acc, r) => acc + r.pH, 0) / workspace.length 
    : 7.0;

  // ------------------------------------------
  // Optics Physics States & Calculations
  // ------------------------------------------
  const [opticsMode, setOpticsMode] = useState<'ray_optics' | 'snell_refraction'>('ray_optics');
  const [elementType, setElementType] = useState<OpticElementType>('convex_lens');
  const [focalLength, setFocalLength] = useState<number>(30); // cm
  const [objectDistance, setObjectDistance] = useState<number>(50); // cm
  const [objectHeight, setObjectHeight] = useState<number>(30); // cm

  // Refraction mode states (Snell's Law)
  const [incidentAngle, setIncidentAngle] = useState<number>(45);
  const [refractiveIndex, setRefractiveIndex] = useState<number>(1.52);
  const [mediumName, setMediumName] = useState<string>("Crown Glass");

  // Perform Ray Optics Math
  const opticsRes = calculateOptics(elementType, focalLength, objectDistance, objectHeight);

  // Snell's Law Math
  const radI = (incidentAngle * Math.PI) / 180;
  const sinR = Math.sin(radI) / refractiveIndex;
  const radR = Math.asin(Math.min(1, Math.max(-1, sinR)));
  const refractedAngle = (radR * 180) / Math.PI;

  const filteredReagents = REAGENTS.filter(r => chemCategory === 'all' || r.category === chemCategory);

  return (
    <div className="min-h-screen dark:bg-[#03050d] bg-[#eef1f9] text-slate-100 font-sans p-3 sm:p-6 lg:p-8 relative selection:bg-indigo-500/30">
      
      {/* Background Orbs */}
      <div className="fixed top-0 left-1/3 w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/3 w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl border border-white/10 shadow-lg shadow-indigo-500/30">
            <Beaker className="w-6 h-6 sm:w-7 sm:h-7 dark:text-white text-slate-900" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-300">
              Interactive Sim Sandbox
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold">NCERT Virtual Physics & Chemistry Simulator</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Main Mode Switcher */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab('chemistry')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'chemistry' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Beaker className="w-4 h-4" /> Molecular Chemistry Lab
            </button>
            <button
              onClick={() => setActiveTab('optics')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'optics' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" /> Light Optics & Ray Lab
            </button>
          </div>

          <Link href="/dashboard" className="hidden lg:flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all border border-white/10 text-slate-600 dark:text-slate-300">
            <Home className="w-4 h-4" /> Exit Sandbox
          </Link>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  TAB 1: ENHANCED CHEMISTRY MOLECULAR LABORATORY             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'chemistry' && (
        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          
          {/* Left Panel: Categorized Shelf (4 Cols) */}
          <div className="lg:col-span-4 dark:bg-[#070916] bg-[#eef1f9] border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col h-[580px]">
            
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black dark:text-white text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Atom className="w-4 h-4 text-indigo-400" /> Reagent & Element Shelf
              </h2>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                {filteredReagents.length} Available
              </span>
            </div>

            {/* Shelf Category Tabs */}
            <div className="flex gap-1.5 p-1 bg-black/40 border border-white/5 rounded-xl mb-3">
              {[
                { id: 'all', label: 'All' },
                { id: 'element', label: 'Elements' },
                { id: 'acid_base', label: 'Acids/Bases' },
                { id: 'salt', label: 'Compounds' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setChemCategory(cat.id as any)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    chemCategory === cat.id ? 'bg-indigo-500 text-white font-extrabold shadow' : 'text-slate-500 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid of Reagent Cards */}
            <div className="grid grid-cols-2 gap-2.5 flex-1 overflow-y-auto pr-1">
              {filteredReagents.map((r) => (
                <button 
                  key={r.id}
                  onClick={() => addReagent(r)}
                  className={`p-3 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${r.color} bg-opacity-15 hover:bg-opacity-30 text-left relative group`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md ${r.color}`}>
                    {r.symbol}
                  </div>
                  <span className="text-[11px] font-bold dark:text-slate-200 text-slate-800 text-center line-clamp-1">{r.name}</span>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                    {r.state} • pH {r.pH}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick NCERT Mixing Hints */}
            <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <p className="text-[11px] text-indigo-300 font-semibold leading-relaxed">
                 <strong>Try mixing:</strong><br />
                • <strong className="dark:text-white text-slate-900">Fe + CuSO₄</strong> (Displacement & color change)<br />
                • <strong className="dark:text-white text-slate-900">HCl + NaOH</strong> (Neutralization to pH 7.0)<br />
                • <strong className="dark:text-white text-slate-900">Mg + HCl</strong> (Effervescence H₂ gas)
              </p>
            </div>
          </div>

          {/* Right Panel: Beaker Visualizer & Workbench (8 Cols) */}
          <div className="lg:col-span-8 dark:bg-[#070916] bg-[#eef1f9] border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col relative overflow-hidden min-h-[580px]">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between mb-4 relative z-10 border-b border-white/5 pb-3">
              <h2 className="text-sm font-black dark:text-white text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-orange-400" /> Reaction Deck & Animated Beaker
              </h2>
              <button 
                onClick={clearWorkspace}
                className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-500 dark:text-slate-400 hover:dark:text-white text-slate-900 transition-colors px-3 py-1.5 bg-white/5 rounded-xl border border-white/10"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Clear Beaker
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 items-center relative z-10">
              
              {/* Added Reagents Pills (5 Cols) */}
              <div className="md:col-span-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Reagents in Beaker:</h3>
                  {workspace.length === 0 ? (
                    <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center text-slate-500">
                      <Atom className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" />
                      <p className="text-xs font-semibold">Click elements on the left shelf to place them in the reaction beaker.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {workspace.map((r, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between animate-in zoom-in duration-200">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center text-white ${r.color}`}>
                              {r.symbol}
                            </span>
                            <div>
                              <div className="text-xs font-bold dark:text-white text-slate-900">{r.name}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">pH {r.pH} • {r.category}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* pH Meter Bar */}
                <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-300">pH Indicator Level:</span>
                    <span className={`font-mono font-black text-xs px-2 py-0.5 rounded ${
                      currentPH < 6 ? 'bg-rose-500/20 text-rose-400' : currentPH > 8 ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      pH {currentPH.toFixed(1)} ({currentPH < 6 ? 'Acidic' : currentPH > 8 ? 'Basic' : 'Neutral'})
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 via-blue-500 to-purple-600 p-0.5 relative">
                    <div 
                      className="w-2.5 h-3.5 bg-white rounded-full border border-black shadow-lg absolute -top-0.5 transition-all duration-500"
                      style={{ left: `${Math.min(95, Math.max(2, (currentPH / 14) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Trigger Reaction Button */}
                <button
                  onClick={handleReact}
                  disabled={workspace.length === 0 || isReacting}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${
                    workspace.length > 0 && !isReacting 
                      ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:scale-[1.02] active:scale-95 border border-white/20' 
                      : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {isReacting ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing Reaction...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Trigger Chemical Reaction</>
                  )}
                </button>
              </div>

              {/* Animated Beaker SVG Visualizer (7 Cols) */}
              <div className="md:col-span-7 flex flex-col items-center justify-center relative min-h-[300px] bg-black/40 rounded-2xl border border-white/10 p-4">
                
                {/* SVG Beaker */}
                <div className="relative w-48 h-56">
                  <svg className="w-full h-full" viewBox="0 0 100 120">
                    {/* Beaker Glass Outline */}
                    <path d="M 20 10 L 20 110 Q 20 115 25 115 L 75 115 Q 80 115 80 110 L 80 10 M 15 10 L 85 10" 
                      fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Graduation Marks */}
                    <line x1="20" y1="35" x2="30" y2="35" stroke="#475569" strokeWidth="1" />
                    <line x1="20" y1="55" x2="35" y2="55" stroke="#475569" strokeWidth="1.5" />
                    <line x1="20" y1="75" x2="30" y2="75" stroke="#475569" strokeWidth="1" />
                    <line x1="20" y1="95" x2="35" y2="95" stroke="#475569" strokeWidth="1.5" />
                    <text x="38" y="58" fill="#475569" className="text-[5px] font-mono">100ml</text>

                    {/* Liquid Fill */}
                    {workspace.length > 0 && (
                      <g className="transition-all duration-700">
                        <path 
                          d={`M 22 ${110 - Math.min(75, workspace.length * 20)} L 22 110 Q 22 113 25 113 L 75 113 Q 78 113 78 110 L 78 ${110 - Math.min(75, workspace.length * 20)} Z`}
                          fill={result ? (
                            result.liquidColor.includes('emerald') ? '#10b981' :
                            result.liquidColor.includes('blue') || result.liquidColor.includes('cyan') ? '#06b6d4' :
                            result.liquidColor.includes('rose') || result.liquidColor.includes('red') ? '#f43f5e' :
                            result.liquidColor.includes('stone') ? '#d6d3d1' : '#3b82f6'
                          ) : '#3b82f6'}
                          fillOpacity={0.45}
                        />

                        {/* Animated Liquid Waves */}
                        <path 
                          d={`M 22 ${110 - Math.min(75, workspace.length * 20)} Q 50 ${107 - Math.min(75, workspace.length * 20)} 78 ${110 - Math.min(75, workspace.length * 20)}`} 
                          stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.6" className="animate-pulse" />
                      </g>
                    )}

                    {/* Animated Gas Bubbles (if gas effect) */}
                    {result?.effect === 'gas' && (
                      <g className="animate-in fade-in duration-300">
                        <circle cx="35" cy="70" r="2.5" fill="#ffffff" opacity="0.8" className="animate-bounce" />
                        <circle cx="50" cy="50" r="3" fill="#ffffff" opacity="0.9" className="animate-ping" />
                        <circle cx="65" cy="65" r="2" fill="#ffffff" opacity="0.7" className="animate-bounce" />
                        <circle cx="42" cy="30" r="3.5" fill="#ffffff" opacity="0.6" />
                        {/* Fumes / Gas cloud */}
                        <path d="M 35 15 Q 40 5 50 12 Q 60 5 65 15" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2,2" fill="none" opacity="0.6" />
                      </g>
                    )}

                    {/* Animated Precipitate Particles (if precipitate effect) */}
                    {result?.effect === 'precipitate' && (
                      <g>
                        <circle cx="30" cy="108" r="2" fill="#b45309" />
                        <circle cx="45" cy="109" r="2.5" fill="#b45309" />
                        <circle cx="60" cy="107" r="3" fill="#b45309" />
                        <circle cx="68" cy="109" r="2" fill="#b45309" />
                      </g>
                    )}
                  </svg>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {result ? result.name : workspace.length > 0 ? 'Beaker Ready for Reaction' : 'Empty Reaction Flask'}
                  </span>
                </div>
              </div>

            </div>

            {/* Reaction Result Banner */}
            {result && (
              <div className="mt-4 p-4 dark:bg-[#080b1e] bg-[#eef1f9] backdrop-blur-2xl border border-white/10 rounded-2xl animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${result.type.includes('No Reaction') ? 'bg-slate-500/20 text-slate-600 dark:text-slate-300' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                    {result.type.includes('No Reaction') ? <Info className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-black dark:text-white text-slate-900 font-mono">{result.equation}</h3>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {result.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1">{result.desc}</p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 border-t border-white/5 pt-2">
                      <span>Temp Change: <strong className="text-orange-400">{result.tempChange}</strong></span>
                      <span>Final pH: <strong className="text-emerald-400">{result.finalPH.toFixed(1)}</strong></span>
                      <span>Result State: <strong className="text-indigo-300">{result.product}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ️ TAB 2: LIGHT OPTICS (LENSES & MIRRORS RAY SIMULATOR)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'optics' && (
        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          
          {/* Controls Panel (4 Cols) */}
          <div className="lg:col-span-4 dark:bg-[#070916] bg-[#eef1f9] border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col space-y-5">
            
            {/* Mode Switcher inside Optics */}
            <div className="flex p-1 bg-black/40 border border-white/5 rounded-xl">
              <button
                onClick={() => setOpticsMode('ray_optics')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                  opticsMode === 'ray_optics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-white'
                }`}
              >
                 Lenses & Mirrors
              </button>
              <button
                onClick={() => setOpticsMode('snell_refraction')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                  opticsMode === 'snell_refraction' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-white'
                }`}
              >
                Snell's Refraction
              </button>
            </div>

            {/* ── SUBMODE 1: RAY OPTICS LENSES & MIRRORS ── */}
            {opticsMode === 'ray_optics' && (
              <>
                {/* Optical Element Choice */}
                <div>
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block mb-2">Select Optical Element:</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { id: 'convex_lens', label: 'Convex Lens (Converging)', desc: 'f > 0' },
                      { id: 'concave_lens', label: 'Concave Lens (Diverging)', desc: 'f < 0' },
                      { id: 'concave_mirror', label: 'Concave Mirror (Converging)', desc: 'f < 0' },
                      { id: 'convex_mirror', label: 'Convex Mirror (Diverging)', desc: 'f > 0' },
                      { id: 'plane_mirror', label: 'Plane Mirror', desc: 'f = ∞' },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setElementType(item.id as OpticElementType)}
                        className={`p-2.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                          elementType === item.id 
                            ? 'bg-indigo-600/30 border-indigo-500 text-white font-extrabold shadow-md' 
                            : 'bg-white/5 border-white/5 text-slate-500 dark:text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xs">{item.label}</span>
                        <span className="text-[10px] font-mono text-indigo-400 font-bold">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focal Length Slider */}
                {elementType !== 'plane_mirror' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Focal Length magnitude (|f|):</label>
                      <span className="text-xs font-mono font-black text-indigo-400">{focalLength} cm</span>
                    </div>
                    <input 
                      type="range"
                      min="15"
                      max="60"
                      value={focalLength}
                      onChange={(e) => setFocalLength(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-500 bg-white/10 rounded-lg cursor-pointer h-2"
                    />
                  </div>
                )}

                {/* Object Distance Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Object Distance (|u|):</label>
                    <span className="text-xs font-mono font-black text-indigo-400">{objectDistance} cm</span>
                  </div>
                  <input 
                    type="range"
                    min="10"
                    max="140"
                    value={objectDistance}
                    onChange={(e) => setObjectDistance(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 bg-white/10 rounded-lg cursor-pointer h-2"
                  />
                </div>

                {/* Object Height Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Object Height (hₒ):</label>
                    <span className="text-xs font-mono font-black text-indigo-400">{objectHeight} cm</span>
                  </div>
                  <input 
                    type="range"
                    min="10"
                    max="45"
                    value={objectHeight}
                    onChange={(e) => setObjectHeight(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 bg-white/10 rounded-lg cursor-pointer h-2"
                  />
                </div>

                {/* Live Formula Badge */}
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl space-y-1 text-xs font-mono">
                  <div className="text-[10px] font-black uppercase text-indigo-300">NCERT Sign Formula:</div>
                  <div className="dark:text-white text-slate-900 font-bold">
                    {elementType.includes('lens') ? '1/f = 1/v - 1/u (Lens)' : '1/f = 1/v + 1/u (Mirror)'}
                  </div>
                  <div className="text-emerald-400 font-bold">
                    Image v = {opticsRes.v === Infinity ? '∞' : `${opticsRes.v.toFixed(1)} cm`}
                  </div>
                </div>
              </>
            )}

            {/* ── SUBMODE 2: SNELL'S LAW REFRACTION ── */}
            {opticsMode === 'snell_refraction' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Angle of Incidence (i):</label>
                    <span className="text-xs font-mono font-black text-indigo-400">{incidentAngle}°</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="80"
                    value={incidentAngle}
                    onChange={(e) => setIncidentAngle(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 bg-white/10 rounded-lg cursor-pointer h-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2">Select Refractive Medium (n₂):</label>
                  <div className="space-y-1.5">
                    {[
                      { name: "Water", n: 1.33 },
                      { name: "Crown Glass", n: 1.52 },
                      { name: "Dense Flint Glass", n: 1.66 },
                      { name: "Diamond", n: 2.42 }
                    ].map((m) => (
                      <button
                        key={m.name}
                        onClick={() => { setRefractiveIndex(m.n); setMediumName(m.name); }}
                        className={`w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                          refractiveIndex === m.n ? 'bg-indigo-600/30 border-indigo-500 text-white font-extrabold' : 'bg-white/5 border-white/5 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <span className="text-xs">{m.name}</span>
                        <span className="text-xs font-mono font-bold text-indigo-400">n = {m.n}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl space-y-1 text-xs font-mono">
                  <div className="text-[10px] font-black uppercase text-indigo-300">Snell's Law:</div>
                  <div className="dark:text-white text-slate-900 font-bold">n₂₁ = sin(i) / sin(r) = {refractiveIndex}</div>
                  <div className="text-emerald-400 font-bold">Refracted Angle (r) = {refractedAngle.toFixed(2)}°</div>
                </div>
              </div>
            )}

          </div>

          {/* Canvas SVG Panel (8 Cols) */}
          <div className="lg:col-span-8 dark:bg-[#070916] bg-[#eef1f9] border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between relative overflow-hidden min-h-[580px]">
            
            {/* Top Canvas Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                {opticsMode === 'ray_optics' ? `Ray Diagram (${elementType.replace('_', ' ').toUpperCase()})` : `Refraction: Air  ${mediumName}`}
              </span>
              {opticsMode === 'ray_optics' && (
                <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  {opticsRes.natureText}
                </span>
              )}
            </div>

            {/* ── SVG RAY CANVAS FOR LENSES & MIRRORS ── */}
            {opticsMode === 'ray_optics' && (
              <div className="my-auto w-full h-[360px] bg-black/60 rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 500 320">
                  {/* Grid Lines */}
                  <line x1="0" y1="160" x2="500" y2="160" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,4" />
                  <line x1="250" y1="20" x2="250" y2="300" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />

                  {/* Optical Center / Pole Marker (250, 160) */}
                  <circle cx="250" cy="160" r="3" fill="#818cf8" />
                  <text x="254" y="174" fill="#818cf8" className="text-[9px] font-mono font-bold">O / P</text>

                  {/* Focal & Curvature Markers */}
                  {(() => {
                    const scale = 1.8; // Scale factor for cm to pixels
                    const fPx = focalLength * scale;
                    const f1X = 250 - fPx;
                    const f2X = 250 + fPx;
                    const c1X = 250 - 2 * fPx;
                    const c2X = 250 + 2 * fPx;

                    return (
                      <g className="text-[8px] font-mono fill-slate-400">
                        {/* F1 & 2F1 (Left side) */}
                        {f1X > 20 && (
                          <>
                            <circle cx={f1X} cy="160" r="2.5" fill="#f43f5e" />
                            <text x={f1X - 6} y="174">F₁</text>
                          </>
                        )}
                        {c1X > 20 && (
                          <>
                            <circle cx={c1X} cy="160" r="2.5" fill="#f43f5e" />
                            <text x={c1X - 8} y="174">2F₁ / C</text>
                          </>
                        )}

                        {/* F2 & 2F2 (Right side) */}
                        {f2X < 480 && (
                          <>
                            <circle cx={f2X} cy="160" r="2.5" fill="#3b82f6" />
                            <text x={f2X - 6} y="174">F₂</text>
                          </>
                        )}
                        {c2X < 480 && (
                          <>
                            <circle cx={c2X} cy="160" r="2.5" fill="#3b82f6" />
                            <text x={c2X - 8} y="174">2F₂</text>
                          </>
                        )}
                      </g>
                    );
                  })()}

                  {/* Optical Element Shape Drawing */}
                  {(() => {
                    if (elementType === 'convex_lens') {
                      return <path d="M 250 40 Q 270 160 250 280 Q 230 160 250 40 Z" fill="rgba(99, 102, 241, 0.2)" stroke="#818cf8" strokeWidth="2" />;
                    } else if (elementType === 'concave_lens') {
                      return <path d="M 240 40 L 260 40 Q 248 160 260 280 L 240 280 Q 252 160 240 40 Z" fill="rgba(99, 102, 241, 0.2)" stroke="#818cf8" strokeWidth="2" />;
                    } else if (elementType === 'concave_mirror') {
                      return (
                        <g>
                          <path d="M 250 40 Q 230 160 250 280" fill="none" stroke="#c084fc" strokeWidth="3" />
                          <line x1="250" y1="40" x2="258" y2="45" stroke="#64748b" strokeWidth="1" />
                          <line x1="250" y1="160" x2="258" y2="160" stroke="#64748b" strokeWidth="1" />
                          <line x1="250" y1="280" x2="258" y2="275" stroke="#64748b" strokeWidth="1" />
                        </g>
                      );
                    } else if (elementType === 'convex_mirror') {
                      return (
                        <g>
                          <path d="M 250 40 Q 270 160 250 280" fill="none" stroke="#c084fc" strokeWidth="3" />
                          <line x1="250" y1="40" x2="242" y2="45" stroke="#64748b" strokeWidth="1" />
                          <line x1="250" y1="160" x2="242" y2="160" stroke="#64748b" strokeWidth="1" />
                          <line x1="250" y1="280" x2="242" y2="275" stroke="#64748b" strokeWidth="1" />
                        </g>
                      );
                    } else {
                      // Plane Mirror
                      return (
                        <g>
                          <line x1="250" y1="40" x2="250" y2="280" stroke="#cbd5e1" strokeWidth="3" />
                          <line x1="250" y1="50" x2="258" y2="55" stroke="#64748b" strokeWidth="1" />
                          <line x1="250" y1="160" x2="258" y2="165" stroke="#64748b" strokeWidth="1" />
                          <line x1="250" y1="270" x2="258" y2="275" stroke="#64748b" strokeWidth="1" />
                        </g>
                      );
                    }
                  })()}

                  {/* OBJECT ARROW (Left of element: X_obj = 250 - u * scale) */}
                  {(() => {
                    const scale = 1.8;
                    const objX = Math.max(30, 250 - objectDistance * scale);
                    const objH = objectHeight * scale;
                    const topY = 160 - objH;

                    return (
                      <g filter="drop-shadow(0 0 6px rgba(251, 191, 36, 0.8))">
                        {/* Vertical Candle / Arrow body */}
                        <line x1={objX} y1="160" x2={objX} y2={topY} stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
                        {/* Arrowhead */}
                        <polygon points={`${objX},${topY - 6} ${objX - 5},${topY + 2} ${objX + 5},${topY + 2}`} fill="#fbbf24" />
                        <text x={objX - 12} y={topY - 8} fill="#fbbf24" className="text-[9px] font-mono font-bold">Object</text>
                      </g>
                    );
                  })()}

                  {/* IMAGE ARROW (Position X_img = 250 + v * scale) */}
                  {opticsRes.v !== Infinity && (() => {
                    const scale = 1.8;
                    const imgX = 250 + opticsRes.v * scale;
                    const imgH = opticsRes.hi * scale;
                    const imgTopY = 160 - imgH;

                    if (imgX < 10 || imgX > 490) return null; // Outside SVG bounds

                    return (
                      <g filter="drop-shadow(0 0 6px rgba(16, 185, 129, 0.8))">
                        {/* Vertical Image Arrow */}
                        <line x1={imgX} y1="160" x2={imgX} y2={imgTopY} stroke="#10b981" strokeWidth="3" strokeDasharray={opticsRes.isReal ? "none" : "3,3"} />
                        {/* Arrowhead */}
                        <polygon points={`${imgX},${imgTopY + (opticsRes.isInverted ? 6 : -6)} ${imgX - 4},${imgTopY + (opticsRes.isInverted ? -2 : 2)} ${imgX + 4},${imgTopY + (opticsRes.isInverted ? -2 : 2)}`} fill="#10b981" />
                        <text x={imgX - 12} y={imgTopY + (opticsRes.isInverted ? 16 : -8)} fill="#10b981" className="text-[9px] font-mono font-bold">Image</text>
                      </g>
                    );
                  })()}

                  {/* LIGHT RAYS (Principal Rays) */}
                  {(() => {
                    const scale = 1.8;
                    const objX = Math.max(30, 250 - objectDistance * scale);
                    const objH = objectHeight * scale;
                    const topY = 160 - objH;
                    const imgX = 250 + opticsRes.v * scale;
                    const imgTopY = 160 - opticsRes.hi * scale;

                    return (
                      <g opacity="0.85">
                        {/* Ray 1: Parallel to Principal Axis */}
                        <line x1={objX} y1={topY} x2="250" y2={topY} stroke="#f43f5e" strokeWidth="1.5" />
                        {opticsRes.v !== Infinity && (
                          <line x1="250" y1={topY} x2={imgX} y2={imgTopY} stroke="#f43f5e" strokeWidth="1.5" />
                        )}

                        {/* Ray 2: Through Optical Center / Pole */}
                        {opticsRes.v !== Infinity && (
                          <line x1={objX} y1={topY} x2={imgX} y2={imgTopY} stroke="#3b82f6" strokeWidth="1.5" />
                        )}
                      </g>
                    );
                  })()}
                </svg>
              </div>
            )}

            {/* ── SVG RAY CANVAS FOR SNELL'S LAW REFRACTION ── */}
            {opticsMode === 'snell_refraction' && (
              <div className="my-auto w-full h-[360px] bg-black/60 rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 400 300">
                  {/* Air upper medium */}
                  <rect x="0" y="0" width="400" height="150" fill="rgba(99, 102, 241, 0.05)" />
                  <text x="20" y="30" fill="#818cf8" className="text-xs font-mono font-bold">Air (n₁ = 1.0)</text>

                  {/* Glass / Water lower medium */}
                  <rect x="0" y="150" width="400" height="150" fill="rgba(168, 85, 247, 0.15)" />
                  <text x="20" y="180" fill="#c084fc" className="text-xs font-mono font-bold">{mediumName} (n₂ = {refractiveIndex})</text>

                  {/* Interface Line */}
                  <line x1="0" y1="150" x2="400" y2="150" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="6,4" />

                  {/* Normal Line */}
                  <line x1="200" y1="20" x2="200" y2="280" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />

                  {/* Incident Ray */}
                  {(() => {
                    const length = 130;
                    const x1 = 200 - length * Math.sin(radI);
                    const y1 = 150 - length * Math.cos(radI);
                    return (
                      <g>
                        <line x1={x1} y1={y1} x2="200" y2="150" stroke="#ec4899" strokeWidth="3.5" />
                        <text x={200 - 45 * Math.sin(radI/2) - 10} y={150 - 45 * Math.cos(radI/2)} fill="#ec4899" className="text-xs font-mono font-bold">i = {incidentAngle}°</text>
                      </g>
                    );
                  })()}

                  {/* Refracted Ray */}
                  {(() => {
                    const length = 130;
                    const x2 = 200 + length * Math.sin(radR);
                    const y2 = 150 + length * Math.cos(radR);
                    return (
                      <g>
                        <line x1="200" y1="150" x2={x2} y2={y2} stroke="#10b981" strokeWidth="3.5" />
                        <text x={200 + 45 * Math.sin(radR/2) + 5} y={150 + 45 * Math.cos(radR/2) + 10} fill="#10b981" className="text-xs font-mono font-bold">r = {refractedAngle.toFixed(1)}°</text>
                      </g>
                    );
                  })()}

                  <circle cx="200" cy="150" r="4" fill="#ffffff" />
                </svg>
              </div>
            )}

            {/* Bottom Metrics Banner */}
            {opticsMode === 'ray_optics' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/5 pt-3">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Image Distance (v)</div>
                  <div className="text-xs font-mono font-black dark:text-white text-slate-900">
                    {opticsRes.v === Infinity ? '∞' : `${opticsRes.v.toFixed(1)} cm`}
                  </div>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Magnification (m)</div>
                  <div className="text-xs font-mono font-black text-indigo-400">
                    {opticsRes.m === Infinity ? '∞' : `${opticsRes.m.toFixed(2)}x`}
                  </div>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Image Height (hᵢ)</div>
                  <div className="text-xs font-mono font-black text-emerald-400">
                    {opticsRes.hi === Infinity ? '∞' : `${opticsRes.hi.toFixed(1)} cm`}
                  </div>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Image Location</div>
                  <div className="text-[10px] font-bold text-amber-300 line-clamp-1">
                    {opticsRes.positionText}
                  </div>
                </div>
              </div>
            )}

          </div>

        </main>
      )}

    </div>
  );
}