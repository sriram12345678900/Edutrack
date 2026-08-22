"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, Beaker, Atom, Flame, RefreshCw, AlertTriangle, 
  CheckCircle2, Compass, Eye, Sparkles, Zap, Layers, 
  Sliders, Info, HelpCircle, ArrowRight, Activity, Search,
  Sun, BatteryCharging, TestTube, Thermometer, Volume2,
  VolumeX, Droplet, BookOpen, ChevronRight, X, ExternalLink,
  Check, Filter, Play, FlaskConical, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  ALL_ELEMENTS, 
  ChemicalElement, 
  ElementCategory, 
  CATEGORY_DETAILS, 
  getElement 
} from '@/lib/chemistry-elements-data';
import CircuitLab from '@/components/sandbox/CircuitLab';
import BiologyLab from '@/components/sandbox/BiologyLab';
import ProjectileLab from '@/components/sandbox/ProjectileLab';
import TitrationLab from '@/components/sandbox/TitrationLab';
import { Heart } from 'lucide-react';

import { 
  ALL_COMPOUNDS, 
  ChemicalCompound, 
  CompoundCategory, 
  COMPOUND_CATEGORIES, 
  getCompound 
} from '@/lib/chemistry-compounds-data';

import { 
  CANONICAL_REACTIONS, 
  ReactionDefinition, 
  ReactionTypeCategory, 
  solveReaction,
  playPopSound,
  playBubblingSound,
  playFlameSound,
  playChimeSound,
  playClinkSound
} from '@/lib/chemistry-reactions-engine';

// ==========================================
// ️ OPTICS SIMULATOR TYPES & ENGINE
// ==========================================
type OpticElementType = 'convex_lens' | 'concave_lens' | 'concave_mirror' | 'convex_mirror' | 'plane_mirror';

type OpticResult = {
  v: number;
  m: number;
  hi: number;
  isReal: boolean;
  isInverted: boolean;
  isMagnified: boolean;
  natureText: string;
  positionText: string;
};

function calculateOptics(type: OpticElementType, fMag: number, uMag: number, ho: number): OpticResult {
  const u = -uMag;

  if (type === 'plane_mirror') {
    return {
      v: uMag,
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
    f = fMag;
    if (Math.abs(uMag - f) < 0.1) {
      v = Infinity;
      m = Infinity;
    } else {
      v = (f * uMag) / (uMag - f);
      m = v / u;
    }
  } else if (type === 'concave_lens') {
    f = -fMag;
    v = -(fMag * uMag) / (uMag + fMag);
    m = v / u;
  } else if (type === 'concave_mirror') {
    f = -fMag;
    if (Math.abs(uMag - fMag) < 0.1) {
      v = Infinity;
      m = Infinity;
    } else {
      v = -(fMag * uMag) / (uMag - fMag);
      m = -(v / u);
    }
  } else if (type === 'convex_mirror') {
    f = fMag;
    v = (fMag * uMag) / (uMag + fMag);
    m = -(v / u);
  }

  const hi = m === Infinity ? Infinity : m * ho;
  const isReal = type.includes('lens') ? v > 0 : v < 0;
  const isInverted = m < 0;
  const absM = Math.abs(m);
  const isMagnified = absM > 1.0;

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

  return { v, m, hi, isReal, isInverted, isMagnified, natureText, positionText: posText };
}

// ==========================================
//  MAIN VIRTUAL SCIENCE SANDBOX PAGE
// ==========================================
export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState<'chemistry' | 'periodictable' | 'compendium' | 'titration' | 'optics' | 'circuits' | 'projectile' | 'biology'>('chemistry');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const activeSubject = useMemo(() => {
    if (activeTab === 'chemistry' || activeTab === 'periodictable' || activeTab === 'compendium' || activeTab === 'titration') {
      return 'chemistry';
    }
    if (activeTab === 'optics' || activeTab === 'circuits' || activeTab === 'projectile') {
      return 'physics';
    }
    return 'biology';
  }, [activeTab]);

  // ------------------------------------------
  // Virtual Chemistry Lab States
  // ------------------------------------------
  const [shelfTab, setShelfTab] = useState<'all' | 'elements' | 'acids' | 'bases' | 'salts' | 'oxides' | 'organics' | 'indicators'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [beakerReagents, setBeakerReagents] = useState<{ id: string; name: string; symbol: string; color: string; pH: number; isElement?: boolean }[]>([]);
  
  // Apparatus Conditions
  const [heatApplied, setHeatApplied] = useState(false);
  const [sunlightApplied, setSunlightApplied] = useState(false);
  const [electricityApplied, setElectricityApplied] = useState(false);
  const [selectedCatalyst, setSelectedCatalyst] = useState<string | null>(null);

  // Lab Reaction Evaluation States
  const [reactionResult, setReactionResult] = useState<ReactionDefinition | null>(null);
  const [isReacting, setIsReacting] = useState(false);

  // Diagnostic Test Tools
  const [splintTestActive, setSplintTestActive] = useState(false);
  const [splintResult, setSplintResult] = useState<string | null>(null);
  const [pHStripDipped, setPHStripDipped] = useState(false);
  const [limewaterBubblerActive, setLimewaterBubblerActive] = useState(false);
  const [limewaterMilky, setLimewaterMilky] = useState(false);

  // Periodic Table Modal Inspector State
  const [selectedElement, setSelectedElement] = useState<ChemicalElement | null>(null);
  const [ptCategoryFilter, setPtCategoryFilter] = useState<string>('all');
  const [ptBlockFilter, setPtBlockFilter] = useState<string>('all');
  const [ptSearchQuery, setPtSearchQuery] = useState<string>('');

  // Reaction Compendium Search & Filter State
  const [compendiumCategory, setCompendiumCategory] = useState<string>('all');
  const [compendiumSearch, setCompendiumSearch] = useState<string>('');

  // ------------------------------------------
  // Optics Lab States
  // ------------------------------------------
  const [opticsMode, setOpticsMode] = useState<'ray_optics' | 'snell_refraction'>('ray_optics');
  const [elementType, setElementType] = useState<OpticElementType>('convex_lens');
  const [focalLength, setFocalLength] = useState<number>(30);
  const [objectDistance, setObjectDistance] = useState<number>(50);
  const [objectHeight, setObjectHeight] = useState<number>(30);
  const [incidentAngle, setIncidentAngle] = useState<number>(45);
  const [refractiveIndex, setRefractiveIndex] = useState<number>(1.52);
  const [mediumName, setMediumName] = useState<string>("Crown Glass");

  const opticsRes = calculateOptics(elementType, focalLength, objectDistance, objectHeight);
  const radI = (incidentAngle * Math.PI) / 180;
  const sinR = Math.sin(radI) / refractiveIndex;
  const radR = Math.asin(Math.min(1, Math.max(-1, sinR)));
  const refractedAngle = (radR * 180) / Math.PI;

  // Add reagent to beaker
  const handleAddReagent = (item: { id: string; name: string; symbol: string; color: string; pH: number; isElement?: boolean }) => {
    if (beakerReagents.length >= 6) return;
    setBeakerReagents(prev => [...prev, item]);
    setReactionResult(null);
    setSplintResult(null);
    setPHStripDipped(false);
    setLimewaterMilky(false);
    if (soundEnabled) playClinkSound();
  };

  const handleRemoveReagent = (idx: number) => {
    setBeakerReagents(prev => prev.filter((_, i) => i !== idx));
    setReactionResult(null);
    setSplintResult(null);
    setPHStripDipped(false);
    setLimewaterMilky(false);
  };

  const handleClearBeaker = () => {
    setBeakerReagents([]);
    setReactionResult(null);
    setSplintResult(null);
    setPHStripDipped(false);
    setLimewaterMilky(false);
    setHeatApplied(false);
    setSunlightApplied(false);
    setElectricityApplied(false);
    setSelectedCatalyst(null);
  };

  // Trigger Reaction Evaluation
  const handleSynthesizeReaction = () => {
    if (beakerReagents.length === 0) return;
    setIsReacting(true);

    setTimeout(() => {
      const reactantIds = beakerReagents.map(r => r.id);
      const res = solveReaction(reactantIds, {
        heat: heatApplied,
        sunlight: sunlightApplied,
        electricity: electricityApplied,
        catalyst: selectedCatalyst || undefined
      });

      setReactionResult(res);
      setIsReacting(false);

      // Play appropriate sound effect based on reaction effect
      if (soundEnabled) {
        if (res.visualEffect === 'flame' || res.category === 'combustion' || res.category === 'thermite') {
          playFlameSound();
        } else if (res.visualEffect === 'gas' || res.gasEvolved) {
          playBubblingSound(2);
        } else if (res.visualEffect === 'precipitate' || res.precipitate) {
          playChimeSound();
        }
      }
    }, 600);
  };

  // Run Splint Test
  const handleRunSplintTest = () => {
    setSplintTestActive(true);
    if (!reactionResult || !reactionResult.splintTest || reactionResult.splintTest === 'none') {
      setSplintResult("No distinctive flammable or oxidizing gas detected (Flame unaffected).");
    } else if (reactionResult.splintTest === 'pop') {
      if (soundEnabled) playPopSound();
      setSplintResult("🔥💥 LOUD 'POP' SOUND! Burning splint ignited hydrogen gas ($H_2$) with characteristic pop sound!");
    } else if (reactionResult.splintTest === 'rekindle') {
      if (soundEnabled) playFlameSound();
      setSplintResult("✨ Glowing wooden splint bursts vigorously back into flame! Confirms pure Oxygen gas ($O_2$).");
    } else if (reactionResult.splintTest === 'extinguish') {
      setSplintResult("💨 Flame instantly extinguished! Confirms Carbon Dioxide ($CO_2$) / Nitrogen ($N_2$) suffocating gas.");
    }
  };

  // Run Limewater Test
  const handleRunLimewaterTest = () => {
    setLimewaterBubblerActive(true);
    if (reactionResult?.limewaterTest || reactionResult?.gasEvolved?.includes('CO₂')) {
      if (soundEnabled) playBubblingSound(1.5);
      setLimewaterMilky(true);
    } else {
      setLimewaterMilky(false);
    }
  };

  // Load a Reaction directly from the compendium into the beaker
  const handleLoadReaction = (rxn: ReactionDefinition) => {
    handleClearBeaker();
    const newReagents: { id: string; name: string; symbol: string; color: string; pH: number; isElement?: boolean }[] = [];

    rxn.reactants.forEach(rId => {
      const el = getElement(rId);
      if (el) {
        newReagents.push({ id: el.symbol, name: el.name, symbol: el.symbol, color: el.color, pH: el.pH, isElement: true });
        return;
      }
      const comp = getCompound(rId);
      if (comp) {
        newReagents.push({ id: comp.id, name: comp.name, symbol: comp.formula, color: comp.color, pH: comp.pH, isElement: false });
        return;
      }
      newReagents.push({ id: rId, name: rId, symbol: rId, color: 'bg-indigo-500', pH: 7.0 });
    });

    setBeakerReagents(newReagents);
    if (rxn.requiredConditions?.heat) setHeatApplied(true);
    if (rxn.requiredConditions?.sunlight) setSunlightApplied(true);
    if (rxn.requiredConditions?.electricity) setElectricityApplied(true);
    if (rxn.requiredConditions?.catalyst) setSelectedCatalyst(rxn.requiredConditions.catalyst);

    setReactionResult(rxn);
    setActiveTab('chemistry');
  };

  // Compute Current Liquid pH
  const currentPH = reactionResult
    ? reactionResult.finalPH
    : beakerReagents.length > 0
    ? beakerReagents.reduce((acc, r) => acc + r.pH, 0) / beakerReagents.length
    : 7.0;

  // Filter shelf items
  const filteredElements = useMemo(() => {
    return ALL_ELEMENTS.filter(el => {
      const matchesSearch = !searchQuery || el.name.toLowerCase().includes(searchQuery.toLowerCase()) || el.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || el.number.toString() === searchQuery;
      return matchesSearch;
    });
  }, [searchQuery]);

  const filteredCompounds = useMemo(() => {
    return ALL_COMPOUNDS.filter(cp => {
      const matchesSearch = !searchQuery || cp.name.toLowerCase().includes(searchQuery.toLowerCase()) || cp.formula.toLowerCase().includes(searchQuery.toLowerCase()) || (cp.commonName && cp.commonName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTab = shelfTab === 'all' || 
        (shelfTab === 'acids' && cp.category === 'acid') ||
        (shelfTab === 'bases' && cp.category === 'base') ||
        (shelfTab === 'salts' && cp.category === 'salt') ||
        (shelfTab === 'oxides' && cp.category === 'oxide') ||
        (shelfTab === 'organics' && cp.category === 'organic') ||
        (shelfTab === 'indicators' && cp.category === 'indicator');
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, shelfTab]);

  // Filter Periodic Table view
  const periodicTableElements = useMemo(() => {
    return ALL_ELEMENTS.filter(el => {
      const matchesCat = ptCategoryFilter === 'all' || el.category === ptCategoryFilter;
      const matchesBlock = ptBlockFilter === 'all' || el.block === ptBlockFilter;
      const matchesSearch = !ptSearchQuery || el.name.toLowerCase().includes(ptSearchQuery.toLowerCase()) || el.symbol.toLowerCase().includes(ptSearchQuery.toLowerCase()) || el.number.toString() === ptSearchQuery;
      return matchesCat && matchesBlock && matchesSearch;
    });
  }, [ptCategoryFilter, ptBlockFilter, ptSearchQuery]);

  // Filter Compendium
  const filteredCompendium = useMemo(() => {
    return CANONICAL_REACTIONS.filter(rxn => {
      const matchesCat = compendiumCategory === 'all' || rxn.category === compendiumCategory;
      const matchesSearch = !compendiumSearch || 
        rxn.name.toLowerCase().includes(compendiumSearch.toLowerCase()) || 
        rxn.equation.toLowerCase().includes(compendiumSearch.toLowerCase()) ||
        rxn.type.toLowerCase().includes(compendiumSearch.toLowerCase()) ||
        (rxn.ncertActivity && rxn.ncertActivity.toLowerCase().includes(compendiumSearch.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [compendiumCategory, compendiumSearch]);

  return (
    <div className="min-h-screen dark:bg-[#03050d] bg-[#eef1f9] text-slate-100 font-sans p-3 sm:p-6 lg:p-8 relative selection:bg-indigo-500/30">
      
      {/* Dynamic Background Glows */}
      <div className="fixed top-0 left-1/4 w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-3 rounded-2xl border border-white/10 shadow-lg shadow-indigo-500/30">
            <FlaskConical className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-300">
                Interactive Science Sim Sandbox
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                118 Elements & 150+ Rxns
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm font-semibold">
              Complete Virtual Chemistry Laboratory, All 118 Elements, Real-time Reaction Engine & Optics Physics
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Subject Navigation Bar */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md overflow-x-auto max-w-full gap-0.5">
            <button
              onClick={() => setActiveTab('chemistry')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeSubject === 'chemistry'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Beaker className="w-3.5 h-3.5 text-orange-400" /> Chemistry
            </button>
            <button
              onClick={() => setActiveTab('optics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeSubject === 'physics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Physics
            </button>
            <button
              onClick={() => setActiveTab('biology')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeSubject === 'biology'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-emerald-400" /> Biology
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-all"
            title={soundEnabled ? "Mute Lab Sound FX" : "Unmute Lab Sound FX"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <Link href="/dashboard" className="hidden xl:flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-extrabold transition-all border border-white/10 text-slate-300">
            <Home className="w-4 h-4" /> Exit
          </Link>
        </div>
      </header>

      {/* Secondary Sub-Tabs for Chemistry and Physics */}
      {activeSubject !== 'biology' && (
        <div className="max-w-7xl mx-auto flex justify-start mb-6 relative z-10">
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md overflow-x-auto max-w-full gap-1">
            {activeSubject === 'chemistry' && (
              <>
                <button
                  onClick={() => setActiveTab('chemistry')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === 'chemistry'
                      ? 'bg-indigo-600/80 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Beaker Workbench
                </button>
                <button
                  onClick={() => setActiveTab('periodictable')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === 'periodictable'
                      ? 'bg-indigo-600/80 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Periodic Table
                </button>
                <button
                  onClick={() => setActiveTab('compendium')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === 'compendium'
                      ? 'bg-indigo-600/80 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Reactions Compendium
                </button>
                <button
                  onClick={() => setActiveTab('titration')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === 'titration'
                      ? 'bg-indigo-600/80 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Acid-Base Titration
                </button>
              </>
            )}
            {activeSubject === 'physics' && (
              <>
                <button
                  onClick={() => setActiveTab('optics')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === 'optics'
                      ? 'bg-pink-600/80 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Ray Optics Lab
                </button>
                <button
                  onClick={() => setActiveTab('circuits')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === 'circuits'
                      ? 'bg-pink-600/80 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Electric Circuit Builder
                </button>
                <button
                  onClick={() => setActiveTab('projectile')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === 'projectile'
                      ? 'bg-pink-600/80 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Projectile Launcher
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  TAB 1: VIRTUAL CHEMISTRY LAB & MOLECULAR REACTION WORKBENCH  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'chemistry' && (
        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          
          {/* Left Column: Comprehensive Reagent & Element Shelf (5 Cols) */}
          <div className="lg:col-span-5 dark:bg-[#070916] bg-white dark:border-white/10 border-slate-200 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col h-[700px]">
            
            {/* Shelf Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black dark:text-white text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Atom className="w-4 h-4 text-indigo-400" /> Reagent & Element Shelf
              </h2>
              <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                118 Elements • 60+ Compounds
              </span>
            </div>

            {/* Shelf Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol (Na, Fe, HCl, CuSO4) or name..."
                className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 p-1 bg-black/40 border border-white/5 rounded-xl mb-3 overflow-x-auto shrink-0">
              {[
                { id: 'all', label: 'All' },
                { id: 'elements', label: '118 Elements' },
                { id: 'acids', label: 'Acids' },
                { id: 'bases', label: 'Bases' },
                { id: 'salts', label: 'Salts' },
                { id: 'oxides', label: 'Oxides' },
                { id: 'organics', label: 'Organics' },
                { id: 'indicators', label: 'Indicators' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setShelfTab(cat.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                    shelfTab === cat.id ? 'bg-indigo-500 text-white font-extrabold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Reagents Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 overflow-y-auto pr-1">
              
              {/* Render 118 Elements if on 'all' or 'elements' tab */}
              {(shelfTab === 'all' || shelfTab === 'elements') && filteredElements.map(el => (
                <button
                  key={`el_${el.number}`}
                  onClick={() => handleAddReagent({ id: el.symbol, name: el.name, symbol: el.symbol, color: el.color, pH: el.pH, isElement: true })}
                  className="p-2.5 rounded-xl border border-white/10 dark:bg-black/50 bg-slate-900 flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 hover:border-indigo-500/50 hover:bg-white/10 text-left relative group shadow-sm"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md ${el.color}`}>
                    {el.symbol}
                  </div>
                  <span className="text-[11px] font-bold text-white text-center line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {el.name}
                  </span>
                  <span className="text-[9px] font-mono font-semibold text-slate-300 uppercase">
                    Z={el.number} • {el.state}
                  </span>
                </button>
              ))}

              {/* Render Compounds */}
              {(shelfTab !== 'elements') && filteredCompounds.map(comp => (
                <button
                  key={`comp_${comp.id}`}
                  onClick={() => handleAddReagent({ id: comp.id, name: comp.name, symbol: comp.formula, color: comp.color, pH: comp.pH, isElement: false })}
                  className="p-2.5 rounded-xl border border-white/10 dark:bg-black/50 bg-slate-900 flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 hover:border-indigo-500/50 hover:bg-white/10 text-left relative group shadow-sm"
                >
                  <div className={`px-2.5 py-1 rounded-md flex items-center justify-center text-white font-black text-[11px] font-mono shadow-md ${comp.color}`}>
                    {comp.formula}
                  </div>
                  <span className="text-[11px] font-bold text-white text-center line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {comp.name}
                  </span>
                  <span className="text-[9px] font-mono font-semibold text-slate-300 uppercase">
                    pH {comp.pH} • {comp.category}
                  </span>
                </button>
              ))}

            </div>

            {/* Quick NCERT Mixing Cheatsheet */}
            <div className="mt-3 p-3 bg-indigo-500/15 border border-indigo-500/30 rounded-2xl shrink-0">
              <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
                💡 <strong className="text-indigo-300">Try famous reactions:</strong><br />
                • <span className="text-cyan-300 font-bold">Fe + CuSO₄</span> (Displacement) • <span className="text-emerald-300 font-bold">Na₂SO₄ + BaCl₂</span> (White ppt)<br />
                • <span className="text-yellow-300 font-bold">Zn + HCl</span> (H₂ Pop Test) • <span className="text-pink-300 font-bold">CaCO₃ + HCl</span> (CO₂ limewater)<br />
                • <span className="text-orange-300 font-bold">Pb(NO₃)₂ + Heat</span> (Brown NO₂ fumes + Bunsen 🔥)
              </p>
            </div>

          </div>

          {/* Right Column: Interactive Apparatus, Animated Beaker & Results (7 Cols) */}
          <div className="lg:col-span-7 dark:bg-[#070916] bg-white dark:border-white/10 border-slate-200 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col h-[700px] overflow-y-auto">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <h2 className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-wider">
                  Reaction Deck & Virtual Apparatus
                </h2>
              </div>
              <button 
                onClick={handleClearBeaker}
                className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-400 hover:text-white transition-colors px-3 py-1.5 bg-white/5 rounded-xl border border-white/10"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Clear Deck
              </button>
            </div>

            {/* Apparatus Controls Bar (Bunsen Heat, Electricity, Sunlight, Catalysts) */}
            <div className="p-3 bg-black/40 border border-white/10 rounded-2xl mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              {/* Bunsen Burner Heat Toggle */}
              <button
                onClick={() => setHeatApplied(!heatApplied)}
                className={`p-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  heatApplied 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-400' 
                    : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Flame className={`w-4 h-4 ${heatApplied ? 'animate-bounce text-yellow-300' : 'text-orange-400'}`} />
                {heatApplied ? '🔥 Heat ON (Δ)' : 'Heat (Δ)'}
              </button>

              {/* Electrolysis Current Toggle */}
              <button
                onClick={() => setElectricityApplied(!electricityApplied)}
                className={`p-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  electricityApplied 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-cyan-400' 
                    : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <BatteryCharging className={`w-4 h-4 ${electricityApplied ? 'animate-pulse text-cyan-300' : 'text-blue-400'}`} />
                {electricityApplied ? '⚡ Current ON' : 'Electrolysis'}
              </button>

              {/* Sunlight / UV Toggle */}
              <button
                onClick={() => setSunlightApplied(!sunlightApplied)}
                className={`p-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  sunlightApplied 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/30 ring-2 ring-yellow-400' 
                    : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Sun className={`w-4 h-4 ${sunlightApplied ? 'animate-spin text-yellow-200' : 'text-amber-400'}`} />
                {sunlightApplied ? '☀️ Sunlight (hν)' : 'Sunlight (hν)'}
              </button>

              {/* Catalyst Selector */}
              <select
                value={selectedCatalyst || ''}
                onChange={(e) => setSelectedCatalyst(e.target.value || null)}
                className="bg-black/50 border border-white/10 text-xs text-slate-200 rounded-xl px-2 py-1 font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="">🧪 No Catalyst</option>
                <option value="MnO₂">MnO₂ (Oxidant / Peroxide)</option>
                <option value="Pt">Pt (Platinum)</option>
                <option value="Ni">Ni (Nickel Hydrogenation)</option>
                <option value="Conc. H₂SO₄">Conc. H₂SO₄ (Ester)</option>
                <option value="Fe / Mo">Fe / Mo (Haber)</option>
              </select>

            </div>

            {/* Workbench Middle Row: Reagents Added & Animated SVG Flask Visualizer */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mb-4">
              
              {/* Added Reagents in Vessel (5 Cols) */}
              <div className="sm:col-span-5 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    Reagents in Flask ({beakerReagents.length}/6):
                  </h3>

                  {beakerReagents.length === 0 ? (
                    <div className="p-4 border border-dashed border-white/10 rounded-2xl text-center text-slate-500">
                      <Atom className="w-6 h-6 mx-auto mb-1 opacity-40 text-indigo-400" />
                      <p className="text-[11px] font-semibold">Click elements or compounds from the left shelf to add them.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {beakerReagents.map((r, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between animate-in zoom-in-50 duration-150">
                          <div className="flex items-center gap-2">
                            <span className={`min-w-[1.75rem] h-6 px-1.5 rounded-md text-[10px] font-black flex items-center justify-center text-white shadow-sm ${r.color}`}>
                              {r.symbol}
                            </span>
                            <span className="text-xs font-bold text-white line-clamp-1">{r.name}</span>
                          </div>
                          <button onClick={() => handleRemoveReagent(idx)} className="text-slate-400 hover:text-red-400 p-1 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live pH Meter */}
                <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Fluid pH:</span>
                    <span className={`font-mono font-black text-xs px-2 py-0.5 rounded ${
                      currentPH < 6 ? 'bg-rose-500/20 text-rose-400' : currentPH > 8 ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      pH {currentPH.toFixed(1)} ({currentPH < 6 ? 'Acidic' : currentPH > 8 ? 'Basic' : 'Neutral'})
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 via-blue-500 to-purple-600 p-0.5 relative">
                    <div 
                      className="w-2.5 h-3 bg-white rounded-full border border-black shadow-lg absolute -top-0.5 transition-all duration-500"
                      style={{ left: `${Math.min(95, Math.max(2, (currentPH / 14) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Synthesize Reaction Trigger Button */}
                <button
                  onClick={handleSynthesizeReaction}
                  disabled={beakerReagents.length === 0 || isReacting}
                  className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${
                    beakerReagents.length > 0 && !isReacting 
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

              {/* Animated SVG Flask & Thermal Apparatus Visualizer (7 Cols) */}
              <div className="sm:col-span-7 flex flex-col items-center justify-center relative min-h-[260px] bg-black/50 rounded-2xl border border-white/10 p-4 overflow-hidden">
                
                {/* SVG Chemistry Flask */}
                <div className="relative w-44 h-52">
                  <svg className="w-full h-full" viewBox="0 0 100 120">
                    
                    {/* Bunsen Burner Flame below Flask if Heat is Active */}
                    {heatApplied && (
                      <g className="animate-pulse">
                        <polygon points="45,118 50,105 55,118" fill="#f97316" opacity="0.9" />
                        <polygon points="47,118 50,110 53,118" fill="#38bdf8" opacity="0.95" />
                        <rect x="42" y="118" width="16" height="4" fill="#64748b" rx="1" />
                      </g>
                    )}

                    {/* Flask Outline (Erlenmeyer shape) */}
                    <path 
                      d="M 40 10 L 40 35 L 18 100 Q 15 106 22 106 L 78 106 Q 85 106 82 100 L 60 35 L 60 10 M 35 10 L 65 10" 
                      fill="none" 
                      stroke="#94a3b8" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />

                    {/* Liquid Fill in Flask */}
                    {beakerReagents.length > 0 && (
                      <g className="transition-all duration-700">
                        <path 
                          d={`M ${30 - Math.min(10, beakerReagents.length * 2)} ${105 - Math.min(55, beakerReagents.length * 10)} L 22 104 Q 24 105 28 105 L 72 105 Q 76 105 78 104 L ${70 + Math.min(10, beakerReagents.length * 2)} ${105 - Math.min(55, beakerReagents.length * 10)} Z`}
                          fill={reactionResult ? (
                            reactionResult.liquidColor.includes('emerald') || reactionResult.liquidColor.includes('green') ? '#10b981' :
                            reactionResult.liquidColor.includes('cyan') || reactionResult.liquidColor.includes('blue') ? '#06b6d4' :
                            reactionResult.liquidColor.includes('rose') || reactionResult.liquidColor.includes('red') ? '#f43f5e' :
                            reactionResult.liquidColor.includes('yellow') || reactionResult.liquidColor.includes('amber') ? '#eab308' :
                            reactionResult.liquidColor.includes('purple') ? '#a855f7' : '#3b82f6'
                          ) : '#3b82f6'}
                          fillOpacity={0.5}
                        />

                        {/* Liquid Wave Ripple */}
                        <path 
                          d={`M 25 ${105 - Math.min(55, beakerReagents.length * 10)} Q 50 ${102 - Math.min(55, beakerReagents.length * 10)} 75 ${105 - Math.min(55, beakerReagents.length * 10)}`} 
                          stroke="#ffffff" 
                          strokeWidth="1" 
                          fill="none" 
                          opacity="0.6" 
                          className="animate-pulse" 
                        />
                      </g>
                    )}

                    {/* Gas Bubbles Animation */}
                    {(reactionResult?.visualEffect === 'gas' || reactionResult?.gasEvolved) && (
                      <g>
                        <circle cx="35" cy="80" r="2.5" fill="#ffffff" opacity="0.8" className="animate-bounce" />
                        <circle cx="50" cy="65" r="3" fill="#ffffff" opacity="0.9" className="animate-ping" />
                        <circle cx="62" cy="75" r="2" fill="#ffffff" opacity="0.7" className="animate-bounce" />
                        <circle cx="45" cy="40" r="3" fill="#ffffff" opacity="0.6" />
                        {/* Vapor stream exiting flask mouth */}
                        <path d="M 45 8 Q 50 -5 55 5 Q 60 -5 65 8" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2,2" fill="none" opacity="0.7" />
                      </g>
                    )}

                    {/* Precipitate Crystals Layer at Bottom */}
                    {reactionResult?.precipitate && (
                      <g>
                        <ellipse cx="50" cy="103" rx="24" ry="3" fill={reactionResult.precipitate.hex} opacity="0.9" />
                        <circle cx="38" cy="102" r="2" fill={reactionResult.precipitate.hex} />
                        <circle cx="48" cy="101" r="2.5" fill={reactionResult.precipitate.hex} />
                        <circle cx="58" cy="102" r="2" fill={reactionResult.precipitate.hex} />
                      </g>
                    )}

                    {/* Violent Flame Burst inside Flask */}
                    {reactionResult?.visualEffect === 'flame' && (
                      <g className="animate-pulse">
                        <polygon points="40,85 50,45 60,85" fill="#f97316" opacity="0.85" />
                        <polygon points="45,85 50,55 55,85" fill="#facc15" opacity="0.95" />
                      </g>
                    )}

                  </svg>
                </div>

                <div className="text-center mt-1">
                  <span className="text-[11px] font-mono font-bold text-slate-300">
                    {reactionResult ? reactionResult.name : beakerReagents.length > 0 ? 'Reagents Mixed in Vessel' : 'Empty Vessel'}
                  </span>
                </div>

              </div>

            </div>

            {/* Diagnostic Lab Tests Action Bar (Splint Test & Limewater Bubbler) */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunSplintTest}
                  disabled={!reactionResult}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    reactionResult ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  🪵 Wooden Splint Test
                </button>
                <button
                  onClick={handleRunLimewaterTest}
                  disabled={!reactionResult}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    reactionResult ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30' : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  🥛 Limewater Bubbler (CO₂)
                </button>
              </div>

              {/* Limewater Status Indicator */}
              {limewaterBubblerActive && (
                <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg ${
                  limewaterMilky ? 'bg-white text-slate-900 border border-slate-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  Limewater: {limewaterMilky ? '🥛 Turned Milky White (CO₂ Present)' : 'Clear (No CO₂)'}
                </span>
              )}
            </div>

            {/* Splint Test Output Alert */}
            {splintResult && (
              <div className="mb-4 p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl animate-in slide-in-from-top-2 text-xs font-mono font-bold text-amber-200">
                {splintResult}
              </div>
            )}

            {/* Reaction Result Banner */}
            {reactionResult && (
              <div className="p-4 bg-slate-900/90 border border-indigo-500/30 rounded-2xl animate-in slide-in-from-bottom-4 duration-300 space-y-2.5 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${reactionResult.category === 'no_reaction' ? 'bg-slate-500/20 text-slate-300' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                    {reactionResult.category === 'no_reaction' ? <Info className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white font-mono tracking-wide">
                        {reactionResult.equation}
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {reactionResult.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium leading-relaxed mt-1.5">{reactionResult.desc}</p>
                    
                    {reactionResult.ncertActivity && (
                      <div className="mt-2 text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 inline-block">
                        📚 {reactionResult.ncertActivity}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-2.5 text-[11px] font-mono font-bold text-slate-300 border-t border-white/10 pt-2">
                      <span>Temp: <strong className="text-orange-400">{reactionResult.tempChange}</strong></span>
                      <span>Final pH: <strong className="text-emerald-400">{reactionResult.finalPH.toFixed(1)}</strong></span>
                      {reactionResult.gasEvolved && <span>Gas: <strong className="text-cyan-300">{reactionResult.gasEvolved}</strong></span>}
                      {reactionResult.precipitate && <span>Ppt: <strong className="text-yellow-300">{reactionResult.precipitate.name}</strong></span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </main>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ⚛️ TAB 2: INTERACTIVE 118-ELEMENT PERIODIC TABLE EXPLORER     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'periodictable' && (
        <main className="max-w-7xl mx-auto space-y-6 relative z-10">
          
          {/* Controls & Filter Bar */}
          <div className="dark:bg-[#070916] bg-white dark:border-white/10 border-slate-200 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text"
                  value={ptSearchQuery}
                  onChange={(e) => setPtSearchQuery(e.target.value)}
                  placeholder="Search 118 elements (Name, Symbol, Z)..."
                  className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full p-1 bg-black/30 rounded-xl border border-white/5">
              <button
                onClick={() => setPtCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                  ptCategoryFilter === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                All 118
              </button>
              {Object.entries(CATEGORY_DETAILS).map(([catKey, details]) => (
                <button
                  key={catKey}
                  onClick={() => setPtCategoryFilter(catKey)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    ptCategoryFilter === catKey ? `${details.bg} ${details.text} font-black ring-1 ring-white/20 shadow` : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: details.color }} />
                  {details.name}
                </button>
              ))}
            </div>
          </div>

          {/* Periodic Table 18-Column Interactive Grid Canvas */}
          <div className="dark:bg-[#070916] bg-white dark:border-white/10 border-slate-200 rounded-3xl p-5 shadow-2xl backdrop-blur-xl overflow-x-auto">
            <div 
              className="min-w-[1020px] grid gap-1.5"
              style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}
            >
              {/* Group Numbers 1-18 */}
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={`group_header_${i + 1}`} className="text-center text-[10px] font-mono font-bold text-slate-500 py-0.5 select-none">
                  {i + 1}
                </div>
              ))}

              {/* Periods 1-10 (Rows 1-7 Main Table, Row 8 Spacer, Rows 9-10 Lanthanides & Actinides) */}
              {Array.from({ length: 10 }).map((_, rowIdx) => {
                const row = rowIdx + 1;
                return Array.from({ length: 18 }).map((_, colIdx) => {
                  const col = colIdx + 1;

                  // Row 8 is a visual gap between main table and f-block
                  if (row === 8) {
                    return <div key={`empty_${row}_${col}`} className="h-3 pointer-events-none" />;
                  }

                  const el = ALL_ELEMENTS.find(e => e.gridRow === row && e.gridCol === col);

                  if (!el) {
                    // Row 6, Col 3: Lanthanide anchor in main table
                    if (row === 6 && col === 3) {
                      return (
                        <div key={`empty_${row}_${col}`} className="h-14 p-1 rounded-xl border border-dashed border-yellow-500/40 bg-yellow-500/10 flex flex-col items-center justify-center text-[9px] font-bold text-yellow-400 text-center leading-tight">
                          <span>★ 57-71</span>
                          <span className="text-[8px] opacity-80 font-normal">La–Lu</span>
                        </div>
                      );
                    }
                    // Row 7, Col 3: Actinide anchor in main table
                    if (row === 7 && col === 3) {
                      return (
                        <div key={`empty_${row}_${col}`} className="h-14 p-1 rounded-xl border border-dashed border-teal-500/40 bg-teal-500/10 flex flex-col items-center justify-center text-[9px] font-bold text-teal-400 text-center leading-tight">
                          <span>★★ 89-103</span>
                          <span className="text-[8px] opacity-80 font-normal">Ac–Lr</span>
                        </div>
                      );
                    }
                    // Row 9, Col 3: Lanthanide series label row
                    if (row === 9 && col === 3) {
                      return (
                        <div key={`empty_${row}_${col}`} className="h-14 p-1 rounded-xl border border-yellow-500/40 bg-yellow-500/15 flex flex-col items-center justify-center text-[10px] font-black text-yellow-400 text-center leading-tight">
                          <span>★ 4f</span>
                          <span className="text-[8px] font-semibold opacity-90">Lanthanides</span>
                        </div>
                      );
                    }
                    // Row 10, Col 3: Actinide series label row
                    if (row === 10 && col === 3) {
                      return (
                        <div key={`empty_${row}_${col}`} className="h-14 p-1 rounded-xl border border-teal-500/40 bg-teal-500/15 flex flex-col items-center justify-center text-[10px] font-black text-teal-400 text-center leading-tight">
                          <span>★★ 5f</span>
                          <span className="text-[8px] font-semibold opacity-90">Actinides</span>
                        </div>
                      );
                    }
                    return <div key={`empty_${row}_${col}`} className="h-14" />;
                  }

                  const catDetail = CATEGORY_DETAILS[el.category] || CATEGORY_DETAILS.unknown;
                  const isMatch = periodicTableElements.some(m => m.number === el.number);

                  return (
                    <button
                      key={`el_grid_${el.number}`}
                      onClick={() => setSelectedElement(el)}
                      style={{ 
                        opacity: isMatch ? 1 : 0.22,
                        filter: isMatch ? 'none' : 'grayscale(60%)',
                      }}
                      className={`h-14 p-1 rounded-xl border flex flex-col justify-between items-center transition-all hover:scale-110 hover:z-20 hover:shadow-xl relative group ${catDetail.bg} ${catDetail.border}`}
                      title={`${el.number}. ${el.name} (${el.symbol}) - ${catDetail.name}`}
                    >
                      <div className="w-full flex justify-between items-center text-[9px] font-mono text-slate-400">
                        <span>{el.number}</span>
                        <span className="text-[8px] opacity-80">{el.state === 'gas' ? '💨' : el.state === 'liquid' ? '💧' : ''}</span>
                      </div>
                      <div className="text-sm font-black text-white drop-shadow-sm">{el.symbol}</div>
                      <div className="text-[8px] font-semibold text-slate-300 truncate w-full text-center">{el.name}</div>
                    </button>
                  );
                });
              })}
            </div>
          </div>

          {/* Element Inspector Drawer / Modal */}
          {selectedElement && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="dark:bg-[#070916] bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95">
                
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedElement(null)}
                  className="absolute right-4 top-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                  {/* Element Atomic Card Display */}
                  <div className={`w-28 h-32 rounded-2xl flex flex-col justify-between p-3 shrink-0 ${CATEGORY_DETAILS[selectedElement.category]?.bg} ${CATEGORY_DETAILS[selectedElement.category]?.border} border-2`}>
                    <div className="text-xs font-mono font-bold text-slate-400">{selectedElement.number}</div>
                    <div className="text-4xl font-black text-white text-center">{selectedElement.symbol}</div>
                    <div className="text-[10px] font-mono text-center text-slate-300">{selectedElement.atomicMass}</div>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <h3 className="text-2xl font-black text-white">{selectedElement.name}</h3>
                      <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${CATEGORY_DETAILS[selectedElement.category]?.bg} ${CATEGORY_DETAILS[selectedElement.category]?.text}`}>
                        {CATEGORY_DETAILS[selectedElement.category]?.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{selectedElement.summary}</p>
                    
                    <div className="mt-3 flex items-center gap-3 justify-center sm:justify-start">
                      <button
                        onClick={() => {
                          handleAddReagent({
                            id: selectedElement.symbol,
                            name: selectedElement.name,
                            symbol: selectedElement.symbol,
                            color: selectedElement.color,
                            pH: selectedElement.pH,
                            isElement: true
                          });
                          setSelectedElement(null);
                          setActiveTab('chemistry');
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                      >
                        <Beaker className="w-3.5 h-3.5" /> Place in Reaction Beaker
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bohr Atom Concentric Electron Shell Visualization */}
                <div className="p-4 bg-black/50 border border-white/10 rounded-2xl mb-4 flex flex-col sm:flex-row items-center gap-6">
                  
                  {/* Concentric Orbits SVG */}
                  <div className="w-36 h-36 relative shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 160 160">
                      {/* Nucleus */}
                      <circle cx="80" cy="80" r="12" fill="#818cf8" />
                      <text x="80" y="84" textAnchor="middle" fill="#ffffff" className="text-[8px] font-black font-mono">
                        {selectedElement.number}+
                      </text>

                      {/* Concentric Electron Shells */}
                      {selectedElement.shells.map((electrons, sIdx) => {
                        const radius = 22 + sIdx * 9;
                        return (
                          <g key={`shell_${sIdx}`}>
                            <circle cx="80" cy="80" r={radius} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />
                            {/* Electrons on orbit */}
                            {Array.from({ length: Math.min(electrons, 12) }).map((_, eIdx) => {
                              const angle = (eIdx / Math.min(electrons, 12)) * 2 * Math.PI;
                              const ex = 80 + radius * Math.cos(angle);
                              const ey = 80 + radius * Math.sin(angle);
                              return (
                                <circle key={`e_${sIdx}_${eIdx}`} cx={ex} cy={ey} r="2" fill="#38bdf8" />
                              );
                            })}
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="flex-1 space-y-1.5 text-xs font-mono">
                    <div className="text-[10px] font-black uppercase text-indigo-400">Bohr Electron Shell Distribution:</div>
                    <div className="text-white font-bold">
                      Config: <strong className="text-cyan-300">{selectedElement.electronConfig}</strong>
                    </div>
                    <div className="text-slate-300">
                      Shells [K, L, M, N, ...]: <strong className="text-emerald-400">{selectedElement.shells.join(', ')}</strong>
                    </div>
                    <div className="text-slate-300">
                      Electronegativity (Pauling): <strong className="text-amber-400">{selectedElement.electronegativity ?? 'N/A'}</strong>
                    </div>
                    <div className="text-slate-300">
                      Common Oxidation States: <strong className="text-purple-300">{selectedElement.oxidationStates}</strong>
                    </div>
                  </div>

                </div>

                {/* Element Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono mb-4">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">Melting Point</div>
                    <div className="font-bold text-white">{selectedElement.meltingPoint !== null ? `${selectedElement.meltingPoint}°C` : 'N/A'}</div>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">Boiling Point</div>
                    <div className="font-bold text-white">{selectedElement.boilingPoint !== null ? `${selectedElement.boilingPoint}°C` : 'N/A'}</div>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">Density</div>
                    <div className="font-bold text-white">{selectedElement.density}</div>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">Discovered In</div>
                    <div className="font-bold text-white">{selectedElement.year}</div>
                  </div>
                </div>

                {/* Real-World Applications */}
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-1.5">Key Real-World Applications:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedElement.applications.map((app, aIdx) => (
                      <span key={aIdx} className="text-xs bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-lg">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 📖 TAB 3: COMPREHENSIVE REACTIONS COMPENDIUM & NCERT LABS     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'compendium' && (
        <main className="max-w-7xl mx-auto space-y-6 relative z-10">
          
          {/* Compendium Filter Bar */}
          <div className="dark:bg-[#070916] bg-white dark:border-white/10 border-slate-200 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text"
                value={compendiumSearch}
                onChange={(e) => setCompendiumSearch(e.target.value)}
                placeholder="Search reactions (e.g. Activity 1.1, thermite, ester)..."
                className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Reaction Type Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full p-1 bg-black/30 rounded-xl border border-white/5">
              {[
                { id: 'all', label: 'All Reactions' },
                { id: 'combination', label: 'Combination' },
                { id: 'decomposition', label: 'Decomposition' },
                { id: 'displacement', label: 'Displacement' },
                { id: 'double_displacement', label: 'Double Displacement' },
                { id: 'neutralization', label: 'Neutralization' },
                { id: 'acid_carbonate', label: 'Acid + Carbonate' },
                { id: 'redox', label: 'Redox' },
                { id: 'organic', label: 'Organic' },
                { id: 'thermite', label: 'Thermite' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCompendiumCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                    compendiumCategory === cat.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reactions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCompendium.map(rxn => (
              <div 
                key={rxn.id}
                className="dark:bg-[#070916] bg-white dark:border-white/10 border-slate-200 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all hover:border-indigo-500/40 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {rxn.type}
                    </span>
                    {rxn.ncertActivity && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {rxn.ncertActivity}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black dark:text-white text-slate-900 font-mono mb-1">{rxn.equation}</h3>
                  <h4 className="text-xs font-bold text-indigo-400 mb-2">{rxn.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{rxn.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-slate-400">
                    Temp: <strong className="text-orange-400">{rxn.tempChange}</strong> • pH: <strong className="text-emerald-400">{rxn.finalPH}</strong>
                  </div>

                  <button
                    onClick={() => handleLoadReaction(rxn)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-white text-xs font-bold transition-all flex items-center gap-1.5 group-hover:shadow-lg group-hover:shadow-indigo-600/30"
                  >
                    <Zap className="w-3.5 h-3.5 text-yellow-300" /> Load into Lab
                  </button>
                </div>
              </div>
            ))}
          </div>

        </main>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 🔍 TAB 4: LIGHT OPTICS & RAY DIAGRAM SIMULATOR               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'optics' && (
        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          
          {/* Controls Panel (4 Cols) */}
          <div className="lg:col-span-4 dark:bg-[#070916] bg-white dark:border-white/10 border-slate-200 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col space-y-5">
            
            <div className="flex p-1 bg-black/40 border border-white/5 rounded-xl">
              <button
                onClick={() => setOpticsMode('ray_optics')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                  opticsMode === 'ray_optics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lenses & Mirrors
              </button>
              <button
                onClick={() => setOpticsMode('snell_refraction')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                  opticsMode === 'snell_refraction' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Snell's Refraction
              </button>
            </div>

            {/* Submode 1: Ray Optics */}
            {opticsMode === 'ray_optics' && (
              <>
                <div>
                  <label className="text-xs font-extrabold dark:text-slate-300 text-slate-800 block mb-2">Select Optical Element:</label>
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
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xs">{item.label}</span>
                        <span className="text-[10px] font-mono text-indigo-400 font-bold">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {elementType !== 'plane_mirror' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold dark:text-slate-300 text-slate-800">Focal Length magnitude (|f|):</label>
                      <span className="text-xs font-mono font-black text-indigo-400">{focalLength} cm</span>
                    </div>
                    <input 
                      type="range" min="15" max="60" value={focalLength}
                      onChange={(e) => setFocalLength(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-500 bg-white/10 rounded-lg cursor-pointer h-2"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-800">Object Distance (|u|):</label>
                    <span className="text-xs font-mono font-black text-indigo-400">{objectDistance} cm</span>
                  </div>
                  <input 
                    type="range" min="10" max="140" value={objectDistance}
                    onChange={(e) => setObjectDistance(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 bg-white/10 rounded-lg cursor-pointer h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-800">Object Height (hₒ):</label>
                    <span className="text-xs font-mono font-black text-indigo-400">{objectHeight} cm</span>
                  </div>
                  <input 
                    type="range" min="10" max="45" value={objectHeight}
                    onChange={(e) => setObjectHeight(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 bg-white/10 rounded-lg cursor-pointer h-2"
                  />
                </div>

                <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl space-y-1 text-xs font-mono">
                  <div className="text-[10px] font-black uppercase text-indigo-300">NCERT Sign Formula:</div>
                  <div className="text-white font-bold">
                    {elementType.includes('lens') ? '1/f = 1/v - 1/u (Lens)' : '1/f = 1/v + 1/u (Mirror)'}
                  </div>
                  <div className="text-emerald-400 font-bold">
                    Image v = {opticsRes.v === Infinity ? '∞' : `${opticsRes.v.toFixed(1)} cm`}
                  </div>
                </div>
              </>
            )}

            {/* Submode 2: Snell's Law Refraction */}
            {opticsMode === 'snell_refraction' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-800">Angle of Incidence (i):</label>
                    <span className="text-xs font-mono font-black text-indigo-400">{incidentAngle}°</span>
                  </div>
                  <input 
                    type="range" min="0" max="80" value={incidentAngle}
                    onChange={(e) => setIncidentAngle(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 bg-white/10 rounded-lg cursor-pointer h-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold dark:text-slate-300 text-slate-800 block mb-2">Select Refractive Medium (n₂):</label>
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
                          refractiveIndex === m.n ? 'bg-indigo-600/30 border-indigo-500 text-white font-extrabold' : 'bg-white/5 border-white/5 text-slate-400'
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
                  <div className="text-white font-bold">n₂₁ = sin(i) / sin(r) = {refractiveIndex}</div>
                  <div className="text-emerald-400 font-bold">Refracted Angle (r) = {refractedAngle.toFixed(2)}°</div>
                </div>
              </div>
            )}

          </div>

          {/* Canvas SVG Panel (8 Cols) */}
          <div className="lg:col-span-8 dark:bg-[#070916] bg-white dark:border-white/10 border-slate-200 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between relative overflow-hidden min-h-[580px]">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                {opticsMode === 'ray_optics' ? `Ray Diagram (${elementType.replace('_', ' ').toUpperCase()})` : `Refraction: Air  ${mediumName}`}
              </span>
              {opticsMode === 'ray_optics' && (
                <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  {opticsRes.natureText}
                </span>
              )}
            </div>

            {/* SVG Ray Canvas */}
            {opticsMode === 'ray_optics' && (
              <div className="my-auto w-full h-[360px] bg-black/60 rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 500 320">
                  <line x1="0" y1="160" x2="500" y2="160" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,4" />
                  <line x1="250" y1="20" x2="250" y2="300" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />
                  <circle cx="250" cy="160" r="3" fill="#818cf8" />
                  <text x="254" y="174" fill="#818cf8" className="text-[9px] font-mono font-bold">O / P</text>

                  {/* Optical Element Shape */}
                  {(() => {
                    if (elementType === 'convex_lens') {
                      return <path d="M 250 40 Q 270 160 250 280 Q 230 160 250 40 Z" fill="rgba(99, 102, 241, 0.2)" stroke="#818cf8" strokeWidth="2" />;
                    } else if (elementType === 'concave_lens') {
                      return <path d="M 240 40 L 260 40 Q 248 160 260 280 L 240 280 Q 252 160 240 40 Z" fill="rgba(99, 102, 241, 0.2)" stroke="#818cf8" strokeWidth="2" />;
                    } else if (elementType === 'concave_mirror') {
                      return <path d="M 250 40 Q 230 160 250 280" fill="none" stroke="#c084fc" strokeWidth="3" />;
                    } else if (elementType === 'convex_mirror') {
                      return <path d="M 250 40 Q 270 160 250 280" fill="none" stroke="#c084fc" strokeWidth="3" />;
                    } else {
                      return <line x1="250" y1="40" x2="250" y2="280" stroke="#cbd5e1" strokeWidth="3" />;
                    }
                  })()}

                  {/* Object Arrow */}
                  {(() => {
                    const scale = 1.8;
                    const objX = Math.max(30, 250 - objectDistance * scale);
                    const objH = objectHeight * scale;
                    const topY = 160 - objH;
                    return (
                      <g filter="drop-shadow(0 0 6px rgba(251, 191, 36, 0.8))">
                        <line x1={objX} y1="160" x2={objX} y2={topY} stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
                        <polygon points={`${objX},${topY - 6} ${objX - 5},${topY + 2} ${objX + 5},${topY + 2}`} fill="#fbbf24" />
                        <text x={objX - 12} y={topY - 8} fill="#fbbf24" className="text-[9px] font-mono font-bold">Object</text>
                      </g>
                    );
                  })()}

                  {/* Image Arrow */}
                  {opticsRes.v !== Infinity && (() => {
                    const scale = 1.8;
                    const imgX = 250 + opticsRes.v * scale;
                    const imgH = opticsRes.hi * scale;
                    const imgTopY = 160 - imgH;
                    if (imgX < 10 || imgX > 490) return null;
                    return (
                      <g filter="drop-shadow(0 0 6px rgba(16, 185, 129, 0.8))">
                        <line x1={imgX} y1="160" x2={imgX} y2={imgTopY} stroke="#10b981" strokeWidth="3" strokeDasharray={opticsRes.isReal ? "none" : "3,3"} />
                        <polygon points={`${imgX},${imgTopY + (opticsRes.isInverted ? 6 : -6)} ${imgX - 4},${imgTopY + (opticsRes.isInverted ? -2 : 2)} ${imgX + 4},${imgTopY + (opticsRes.isInverted ? -2 : 2)}`} fill="#10b981" />
                        <text x={imgX - 12} y={imgTopY + (opticsRes.isInverted ? 16 : -8)} fill="#10b981" className="text-[9px] font-mono font-bold">Image</text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
            )}

            {/* Snell's Law Canvas */}
            {opticsMode === 'snell_refraction' && (
              <div className="my-auto w-full h-[360px] bg-black/60 rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 400 300">
                  <rect x="0" y="0" width="400" height="150" fill="rgba(99, 102, 241, 0.05)" />
                  <text x="20" y="30" fill="#818cf8" className="text-xs font-mono font-bold">Air (n₁ = 1.0)</text>
                  <rect x="0" y="150" width="400" height="150" fill="rgba(168, 85, 247, 0.15)" />
                  <text x="20" y="180" fill="#c084fc" className="text-xs font-mono font-bold">{mediumName} (n₂ = {refractiveIndex})</text>
                  <line x1="0" y1="150" x2="400" y2="150" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="6,4" />
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
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Image Distance (v)</div>
                  <div className="text-xs font-mono font-black dark:text-white text-slate-900">
                    {opticsRes.v === Infinity ? '∞' : `${opticsRes.v.toFixed(1)} cm`}
                  </div>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Magnification (m)</div>
                  <div className="text-xs font-mono font-black text-indigo-400">
                    {opticsRes.m === Infinity ? '∞' : `${opticsRes.m.toFixed(2)}x`}
                  </div>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Image Height (hᵢ)</div>
                  <div className="text-xs font-mono font-black text-emerald-400">
                    {opticsRes.hi === Infinity ? '∞' : `${opticsRes.hi.toFixed(1)} cm`}
                  </div>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Image Location</div>
                  <div className="text-[10px] font-bold text-amber-300 line-clamp-1">
                    {opticsRes.positionText}
                  </div>
                </div>
              </div>
            )}

          </div>

        </main>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  TAB 5: ELECTRIC CIRCUIT BUILDER LAB                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'circuits' && (
        <main className="max-w-7xl mx-auto">
          <CircuitLab />
        </main>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  TAB 6: BIOLOGY MICROSCOPIC & ANATOMICAL EXPLORER             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'biology' && (
        <main className="max-w-7xl mx-auto">
          <BiologyLab />
        </main>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  TAB 7: ACID-BASE TITRATION LAB                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'titration' && (
        <main className="max-w-7xl mx-auto">
          <TitrationLab />
        </main>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  TAB 8: PROJECTILE LAUNCHER LAB                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'projectile' && (
        <main className="max-w-7xl mx-auto">
          <ProjectileLab />
        </main>
      )}

    </div>
  );
}