"use client";

import React, { useState } from 'react';
import { Home, Beaker, Atom, Droplet, Flame, ArrowRight, Sparkles, RefreshCw, AlertTriangle, CheckCircle2, Compass, Eye, Zap, Layers } from 'lucide-react';
import Link from 'next/link';

type Element = { symbol: string; name: string; color: string; valency: number };
const ELEMENTS: Element[] = [
  { symbol: 'H', name: 'Hydrogen', color: 'bg-blue-400', valency: 1 },
  { symbol: 'O', name: 'Oxygen', color: 'bg-red-500', valency: 2 },
  { symbol: 'Na', name: 'Sodium', color: 'bg-purple-500', valency: 1 },
  { symbol: 'Cl', name: 'Chlorine', color: 'bg-emerald-500', valency: 1 },
  { symbol: 'C', name: 'Carbon', color: 'bg-slate-600', valency: 4 },
  { symbol: 'N', name: 'Nitrogen', color: 'bg-indigo-400', valency: 3 },
  { symbol: 'Fe', name: 'Iron', color: 'bg-amber-600', valency: 2 },
  { symbol: 'S', name: 'Sulfur', color: 'bg-yellow-400', valency: 2 },
];

const REACTIONS: Record<string, { product: string; name: string; type: string; desc: string }> = {
  'H-H-O': { product: 'H₂O', name: 'Water', type: 'Synthesis', desc: 'A universal solvent essential for life.' },
  'Cl-Na': { product: 'NaCl', name: 'Sodium Chloride (Salt)', type: 'Ionic', desc: 'Common table salt.' },
  'C-O-O': { product: 'CO₂', name: 'Carbon Dioxide', type: 'Covalent', desc: 'A greenhouse gas produced by respiration.' },
  'H-H-H-N': { product: 'NH₃', name: 'Ammonia', type: 'Covalent', desc: 'Pungent gas used in fertilizers.' },
  'Fe-S': { product: 'FeS', name: 'Iron(II) Sulfide', type: 'Combination', desc: 'Black compound formed by heating iron and sulfur.' }
};

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState<'chemistry' | 'optics'>('chemistry');

  // Chemistry Workbench States
  const [workspace, setWorkspace] = useState<Element[]>([]);
  const [result, setResult] = useState<{ product: string; name: string; type: string; desc: string } | null>(null);
  const [isReacting, setIsReacting] = useState(false);

  // Optics Physics States
  const [incidentAngle, setIncidentAngle] = useState<number>(45); // degrees
  const [refractiveIndex, setRefractiveIndex] = useState<number>(1.52); // Glass (n=1.52)
  const [mediumName, setMediumName] = useState<string>("Crown Glass");

  const addElement = (el: Element) => {
    if (workspace.length >= 4) return;
    setWorkspace([...workspace, el]);
    setResult(null);
  };

  const handleReact = () => {
    if (workspace.length < 2) return;
    setIsReacting(true);
    
    setTimeout(() => {
      const formulaKey = workspace.map(e => e.symbol).sort().join('-');
      let matched = REACTIONS[formulaKey];
      
      const symbols = workspace.map(e => e.symbol).sort().join('');
      if (symbols === 'HHO') matched = REACTIONS['H-H-O'];
      else if (symbols === 'ClNa' || symbols === 'NaCl') matched = REACTIONS['Cl-Na'];
      else if (symbols === 'COO') matched = REACTIONS['C-O-O'];
      else if (symbols === 'HHHN') matched = REACTIONS['H-H-H-N'];
      else if (symbols === 'FeS') matched = REACTIONS['Fe-S'];

      if (matched) {
        setResult(matched);
      } else {
        setResult({ product: 'Unknown', name: 'Unstable Ratio', type: 'Error', desc: 'These elements do not form a stable common NCERT compound in this exact ratio.' });
      }
      setIsReacting(false);
    }, 1200);
  };

  const clearWorkspace = () => {
    setWorkspace([]);
    setResult(null);
  };

  // Optics Calculations: sin(r) = sin(i) / n
  const radI = (incidentAngle * Math.PI) / 180;
  const sinR = Math.sin(radI) / refractiveIndex;
  const radR = Math.asin(Math.min(1, Math.max(-1, sinR)));
  const refractedAngle = (radR * 180) / Math.PI;

  return (
    <div className="min-h-screen bg-[#03050d] text-slate-100 font-sans p-4 sm:p-8 relative selection:bg-indigo-500/30">
      
      {/* Background Orbs */}
      <div className="fixed top-0 left-1/3 w-[45vw] h-[45vw] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/3 w-[45vw] h-[45vw] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3.5 rounded-2xl border border-white/10 shadow-lg shadow-indigo-500/30">
            <Beaker className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-300">
              Interactive Sim Sandbox
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-semibold">NCERT Virtual Physics & Chemistry Simulator</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab('chemistry')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'chemistry' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🧪 Molecular Lab
            </button>
            <button
              onClick={() => setActiveTab('optics')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'optics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              👁️ Light Optics Ray
            </button>
          </div>

          <Link href="/dashboard" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all border border-white/10 text-slate-300">
            <Home className="w-4 h-4" /> Exit Sandbox
          </Link>
        </div>
      </header>

      {/* ── TAB 1: CHEMISTRY MOLECULAR SANDBOX ── */}
      {activeTab === 'chemistry' && (
        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          
          {/* Left: Element Shelf */}
          <div className="bg-[#070916]/90 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col">
            <h2 className="text-base font-black text-white flex items-center gap-2.5 mb-4 uppercase tracking-wider">
              <Atom className="w-5 h-5 text-indigo-400" /> Element Shelf
            </h2>
            <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1">
              {ELEMENTS.map((el) => (
                <button 
                  key={el.symbol}
                  onClick={() => addElement(el)}
                  className={`p-3.5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${el.color} bg-opacity-15 hover:bg-opacity-30`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg ${el.color}`}>
                    {el.symbol}
                  </div>
                  <span className="text-[11px] font-bold text-slate-300">{el.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <p className="text-xs text-indigo-300 font-semibold leading-relaxed">
                💡 Try mixing 2 Hydrogen + 1 Oxygen (H₂O), 1 Sodium + 1 Chlorine (NaCl), or 1 Carbon + 2 Oxygen (CO₂).
              </p>
            </div>
          </div>

          {/* Right: Reaction Workbench */}
          <div className="lg:col-span-2 bg-[#070916]/90 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col relative overflow-hidden min-h-[460px]">
            
            <div className="flex items-center justify-between mb-6 relative z-10 border-b border-white/5 pb-4">
              <h2 className="text-base font-black text-white flex items-center gap-2.5 uppercase tracking-wider">
                <Flame className="w-5 h-5 text-orange-400 animate-flame-glow" /> Molecular Synthesis Deck
              </h2>
              <button 
                onClick={clearWorkspace}
                className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 hover:text-white transition-colors px-3.5 py-2 bg-white/5 rounded-xl border border-white/10"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Clear Workbench
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
              {workspace.length === 0 ? (
                <div className="text-center text-slate-500 flex flex-col items-center">
                  <Beaker className="w-16 h-16 mb-4 opacity-40 text-indigo-400" />
                  <p className="text-sm font-bold">Click elements on the shelf to place them on the workbench.</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-5 flex-wrap mb-10">
                  {workspace.map((el, idx) => (
                    <div key={idx} className="animate-in zoom-in duration-300">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-[0_0_25px_rgba(99,102,241,0.3)] border border-white/20 ${el.color}`}>
                        {el.symbol}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleReact}
                disabled={workspace.length < 2 || isReacting}
                className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl ${
                  workspace.length >= 2 && !isReacting 
                    ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:scale-105 active:scale-95 border border-white/20' 
                    : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                }`}
              >
                {isReacting ? (
                  <><RefreshCw className="w-5 h-5 animate-spin" /> Synthesizing Compound...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Trigger Chemical Reaction</>
                )}
              </button>
            </div>

            {/* Reaction Result Banner */}
            {result && (
              <div className="absolute bottom-0 inset-x-0 p-6 bg-[#080b1e]/95 backdrop-blur-2xl border-t border-white/10 animate-in slide-in-from-bottom-8 duration-300">
                <div className="max-w-md mx-auto flex items-start gap-4">
                  <div className={`p-3 rounded-2xl shrink-0 ${result.type === 'Error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                    {result.type === 'Error' ? <AlertTriangle className="w-7 h-7" /> : <CheckCircle2 className="w-7 h-7" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {result.product} <span className="text-sm font-semibold text-slate-400 ml-2">({result.name})</span>
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 my-1">{result.type} Reaction</p>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">{result.desc}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      )}

      {/* ── TAB 2: PHYSICS OPTICS RAY REFRACTION SIMULATOR ── */}
      {activeTab === 'optics' && (
        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          
          {/* Controls Panel */}
          <div className="bg-[#070916]/90 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col space-y-6">
            <h2 className="text-base font-black text-white flex items-center gap-2.5 uppercase tracking-wider">
              <Compass className="w-5 h-5 text-indigo-400" /> Optics Ray Controls
            </h2>

            {/* Incident Angle Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-extrabold text-slate-300">Angle of Incidence (i):</label>
                <span className="text-sm font-black text-indigo-400 font-mono">{incidentAngle}°</span>
              </div>
              <input 
                type="range"
                min="0"
                max="85"
                value={incidentAngle}
                onChange={(e) => setIncidentAngle(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Refractive Index Select */}
            <div>
              <label className="text-xs font-extrabold text-slate-300 block mb-2">Select Refractive Medium (n₂):</label>
              <div className="space-y-2">
                {[
                  { name: "Water", n: 1.33, desc: "n = 1.33" },
                  { name: "Crown Glass", n: 1.52, desc: "n = 1.52" },
                  { name: "Dense Flint Glass", n: 1.66, desc: "n = 1.66" },
                  { name: "Diamond", n: 2.42, desc: "n = 2.42" }
                ].map((m) => (
                  <button
                    key={m.name}
                    onClick={() => {
                      setRefractiveIndex(m.n);
                      setMediumName(m.name);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex justify-between items-center transition-all ${
                      refractiveIndex === m.n
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-white font-extrabold'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs">{m.name}</span>
                    <span className="text-xs font-mono font-bold text-indigo-400">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Snell's Law Formula Output */}
            <div className="bg-indigo-950/40 border border-indigo-500/25 p-4.5 rounded-2xl space-y-2 font-mono text-xs">
              <div className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">Snell's Law Formula:</div>
              <div className="text-white font-bold">n₂₁ = sin(i) / sin(r) = {refractiveIndex}</div>
              <div className="text-emerald-400 font-bold">Refracted Angle (r) = {refractedAngle.toFixed(2)}°</div>
            </div>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="lg:col-span-2 bg-[#070916]/90 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden min-h-[460px]">
            
            <div className="w-full flex justify-between items-center mb-4 relative z-10 border-b border-white/5 pb-3">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Interactive Snell's Law Ray Diagram</span>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Air (n₁=1.0) ➔ {mediumName} (n₂={refractiveIndex})
              </span>
            </div>

            {/* SVG Visual Ray Canvas */}
            <div className="relative w-full max-w-lg h-[320px] bg-black/60 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
              
              <svg className="w-full h-full" viewBox="0 0 400 300">
                {/* Upper Medium (Air) */}
                <rect x="0" y="0" width="400" height="150" fill="rgba(99, 102, 241, 0.05)" />
                <text x="20" y="30" fill="#818cf8" className="text-xs font-mono font-bold">Air (n₁ = 1.0)</text>

                {/* Lower Medium (Selected Glass/Water/Diamond) */}
                <rect x="0" y="150" width="400" height="150" fill="rgba(168, 85, 247, 0.15)" />
                <text x="20" y="180" fill="#c084fc" className="text-xs font-mono font-bold">{mediumName} (n₂ = {refractiveIndex})</text>

                {/* Interface Line */}
                <line x1="0" y1="150" x2="400" y2="150" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="6,4" />

                {/* Normal Line */}
                <line x1="200" y1="20" x2="200" y2="280" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />
                <text x="208" y="35" fill="#94a3b8" className="text-[10px] font-mono">Normal N</text>

                {/* Incident Ray Line (Red/Pink Laser) */}
                {(() => {
                  const length = 130;
                  const x1 = 200 - length * Math.sin(radI);
                  const y1 = 150 - length * Math.cos(radI);
                  return (
                    <g>
                      <line x1={x1} y1={y1} x2="200" y2="150" stroke="#ec4899" strokeWidth="3.5" filter="drop-shadow(0 0 6px rgba(236,72,153,0.8))" />
                      {/* Angle indicator arc */}
                      <path d={`M 200 ${150 - 35} A 35 35 0 0 0 ${200 - 35 * Math.sin(radI)} ${150 - 35 * Math.cos(radI)}`} fill="none" stroke="#ec4899" strokeWidth="1.5" />
                      <text x={200 - 45 * Math.sin(radI/2) - 10} y={150 - 45 * Math.cos(radI/2)} fill="#ec4899" className="text-[10px] font-mono font-bold">i={incidentAngle}°</text>
                    </g>
                  );
                })()}

                {/* Refracted Ray Line (Emerald Laser) */}
                {(() => {
                  const length = 130;
                  const x2 = 200 + length * Math.sin(radR);
                  const y2 = 150 + length * Math.cos(radR);
                  return (
                    <g>
                      <line x1="200" y1="150" x2={x2} y2={y2} stroke="#10b981" strokeWidth="3.5" filter="drop-shadow(0 0 6px rgba(16,185,129,0.8))" />
                      {/* Angle indicator arc */}
                      <path d={`M 200 ${150 + 35} A 35 35 0 0 0 ${200 + 35 * Math.sin(radR)} ${150 + 35 * Math.cos(radR)}`} fill="none" stroke="#10b981" strokeWidth="1.5" />
                      <text x={200 + 45 * Math.sin(radR/2) + 5} y={150 + 45 * Math.cos(radR/2) + 10} fill="#10b981" className="text-[10px] font-mono font-bold">r={refractedAngle.toFixed(1)}°</text>
                    </g>
                  );
                })()}

                {/* Incident Point Center Glow */}
                <circle cx="200" cy="150" r="4" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)" />
              </svg>
            </div>

            <p className="text-slate-400 text-xs font-semibold mt-4 text-center">
              Notice: As light enters a denser medium (higher <span className="text-indigo-400 font-mono">n</span>), the refracted ray bends <strong className="text-white">towards the normal</strong> (angle r &lt; angle i).
            </p>
          </div>
        </main>
      )}

    </div>
  );
}
