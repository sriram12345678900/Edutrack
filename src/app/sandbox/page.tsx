"use client";

import React, { useState } from 'react';
import { Home, Beaker, Atom, Droplet, Flame, ArrowRight, Sparkles, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type Element = { symbol: string; name: string; color: string; valency: number };
const ELEMENTS: Element[] = [
  { symbol: 'H', name: 'Hydrogen', color: 'bg-blue-400', valency: 1 },
  { symbol: 'O', name: 'Oxygen', color: 'bg-red-500', valency: 2 },
  { symbol: 'Na', name: 'Sodium', color: 'bg-purple-500', valency: 1 },
  { symbol: 'Cl', name: 'Chlorine', color: 'bg-emerald-500', valency: 1 },
  { symbol: 'C', name: 'Carbon', color: 'bg-slate-700', valency: 4 },
];

const REACTIONS: Record<string, { product: string; name: string; type: string; desc: string }> = {
  'H-H-O': { product: 'H₂O', name: 'Water', type: 'Synthesis', desc: 'A universal solvent essential for life.' },
  'Na-Cl': { product: 'NaCl', name: 'Sodium Chloride (Salt)', type: 'Ionic', desc: 'Common table salt.' },
  'C-O-O': { product: 'CO₂', name: 'Carbon Dioxide', type: 'Covalent', desc: 'A greenhouse gas produced by respiration.' },
};

export default function SandboxPage() {
  const [workspace, setWorkspace] = useState<Element[]>([]);
  const [result, setResult] = useState<{ product: string; name: string; type: string; desc: string } | null>(null);
  const [isReacting, setIsReacting] = useState(false);

  const addElement = (el: Element) => {
    if (workspace.length >= 4) return;
    setWorkspace([...workspace, el]);
    setResult(null);
  };

  const handleReact = () => {
    if (workspace.length < 2) return;
    setIsReacting(true);
    
    setTimeout(() => {
      // Sort symbols to match reaction keys
      const formulaKey = workspace.map(e => e.symbol).sort().join('-');
      // For H2O: H-H-O, for NaCl: Cl-Na -> Na-Cl
      let matched = REACTIONS[formulaKey];
      
      // Try reverse just in case
      if (!matched) {
         const altKey = workspace.map(e => e.symbol).sort((a,b)=>b.localeCompare(a)).join('-');
         matched = REACTIONS[altKey];
      }

      // Hardcode common checks
      const symbols = workspace.map(e => e.symbol).sort().join('');
      if (symbols === 'HHO') matched = REACTIONS['H-H-O'];
      else if (symbols === 'ClNa' || symbols === 'NaCl') matched = REACTIONS['Na-Cl'];
      else if (symbols === 'COO') matched = REACTIONS['C-O-O'];

      if (matched) {
        setResult(matched);
      } else {
        setResult({ product: 'Unknown', name: 'Unstable Compound', type: 'Error', desc: 'These elements do not form a stable common compound in this ratio.' });
      }
      setIsReacting(false);
    }, 1500);
  };

  const clearWorkspace = () => {
    setWorkspace([]);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/20 p-3 rounded-2xl border border-indigo-500/30">
            <Beaker className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Virtual Molecular Sandbox</h1>
            <p className="text-slate-400 text-sm font-medium">Mix elements and discover chemical reactions.</p>
          </div>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-slate-700">
          <Home className="w-4 h-4" /> Back
        </Link>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Element Shelf */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Atom className="w-5 h-5 text-indigo-400" /> Element Shelf
          </h2>
          <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto pr-2">
            {ELEMENTS.map((el) => (
              <button 
                key={el.symbol}
                onClick={() => addElement(el)}
                className={`p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 ${el.color} bg-opacity-20 hover:bg-opacity-30`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg ${el.color}`}>
                  {el.symbol}
                </div>
                <span className="text-xs font-bold text-slate-300">{el.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <p className="text-xs text-indigo-300 font-medium">
              💡 Tip: Try mixing 2 Hydrogen + 1 Oxygen, or 1 Sodium + 1 Chlorine.
            </p>
          </div>
        </div>

        {/* Center/Right: Workbench */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" /> Reaction Workbench
            </h2>
            <button 
              onClick={clearWorkspace}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700"
            >
              <RefreshCw className="w-3 h-3" /> Clear
            </button>
          </div>

          <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center relative z-10">
            {workspace.length === 0 ? (
              <div className="text-center text-slate-500 flex flex-col items-center">
                <Beaker className="w-16 h-16 mb-4 opacity-50" />
                <p>Drag or click elements from the shelf to add them to the workbench.</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 flex-wrap mb-12">
                {workspace.map((el, idx) => (
                  <div key={idx} className="animate-in zoom-in spin-in-12 duration-300 relative group">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)] ${el.color}`}>
                      {el.symbol}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reaction Button */}
            <button
              onClick={handleReact}
              disabled={workspace.length < 2 || isReacting}
              className={`px-8 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-3 ${
                workspace.length >= 2 && !isReacting 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95' 
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {isReacting ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Synthesizing...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Trigger Reaction</>
              )}
            </button>
          </div>

          {/* Result Panel */}
          {result && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-800/95 backdrop-blur-xl border-t border-slate-700 animate-in slide-in-from-bottom-8 duration-300">
              <div className="max-w-md mx-auto">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl shrink-0 ${result.type === 'Error' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {result.type === 'Error' ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white mb-1">
                      {result.product} <span className="text-sm font-medium text-slate-400 ml-2">({result.name})</span>
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">{result.type} Reaction</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{result.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
