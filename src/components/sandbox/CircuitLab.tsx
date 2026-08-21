"use client";

import React, { useState } from "react";
import { 
  Zap, Sliders, Play, RotateCcw, ShieldCheck, 
  Lightbulb, Activity, ArrowRight, Sparkles, Check, AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

export default function CircuitLab() {
  const [voltage, setVoltage] = useState<number>(12); // Volts
  const [circuitType, setCircuitType] = useState<"series" | "parallel">("series");
  const [r1, setR1] = useState<number>(4); // Ohms
  const [r2, setR2] = useState<number>(6); // Ohms
  const [r3, setR3] = useState<number>(12); // Ohms
  const [switchClosed, setSwitchClosed] = useState<boolean>(true);
  const [showElectrons, setShowElectrons] = useState<boolean>(true);

  // Electrical Calculations
  const rEquivalent = circuitType === "series"
    ? r1 + r2 + r3
    : 1 / (1 / r1 + 1 / r2 + 1 / r3);

  const totalCurrent = switchClosed ? voltage / rEquivalent : 0;
  const totalPower = switchClosed ? voltage * totalCurrent : 0;
  const heatPerMin = switchClosed ? totalCurrent * totalCurrent * rEquivalent * 60 : 0;

  // Individual Voltages and Currents
  const v1 = switchClosed ? (circuitType === "series" ? totalCurrent * r1 : voltage) : 0;
  const v2 = switchClosed ? (circuitType === "series" ? totalCurrent * r2 : voltage) : 0;
  const v3 = switchClosed ? (circuitType === "series" ? totalCurrent * r3 : voltage) : 0;

  const i1 = switchClosed ? (circuitType === "series" ? totalCurrent : voltage / r1) : 0;
  const i2 = switchClosed ? (circuitType === "series" ? totalCurrent : voltage / r2) : 0;
  const i3 = switchClosed ? (circuitType === "series" ? totalCurrent : voltage / r3) : 0;

  const bulbBrightness = switchClosed ? Math.min(100, Math.max(10, Math.round((totalPower / 30) * 100))) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black tracking-wider uppercase mb-1">
            <Zap className="w-3.5 h-3.5" /> Physics Electric Circuit Simulator
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Ohm's Law, Series & Parallel Circuit Workbench
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Test current flow, potential drop, and power consumption across dynamic resistor networks.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSwitchClosed(!switchClosed)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              switchClosed
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/25"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> {switchClosed ? "Switch Closed (ON)" : "Switch Open (OFF)"}
          </button>

          <button
            onClick={() => {
              setVoltage(12);
              setR1(4);
              setR2(6);
              setR3(12);
              setSwitchClosed(true);
            }}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10"
            title="Reset to default circuit"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Lab Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Circuit Schematic & Meters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Circuit Canvas Container */}
          <div className="p-6 rounded-3xl bg-[#090d16] border border-white/10 shadow-2xl relative overflow-hidden min-h-[380px] flex flex-col justify-between">
            {/* Top schematic info */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-2 text-indigo-400">
                <Activity className="w-4 h-4" /> Schematic: {circuitType === "series" ? "Series Network (R_eq = R₁ + R₂ + R₃)" : "Parallel Network (1/R_eq = Σ 1/Rᵢ)"}
              </span>
              <span className="text-amber-400 font-mono font-black">
                P = {totalPower.toFixed(1)} W
              </span>
            </div>

            {/* SVG Interactive Circuit Schematic */}
            <div className="relative w-full h-[260px] flex items-center justify-center my-2">
              <svg className="w-full h-full" viewBox="0 0 500 240">
                <defs>
                  <filter id="bulbGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Main Outer Wire Path */}
                <rect x="50" y="30" width="400" height="180" rx="16" fill="none" stroke="#334155" strokeWidth="4" />

                {/* Battery Source (Left) */}
                <g transform="translate(50, 120)">
                  <line x1="0" y1="-25" x2="0" y2="25" stroke="#38bdf8" strokeWidth="4" />
                  <line x1="-10" y1="-12" x2="10" y2="-12" stroke="#38bdf8" strokeWidth="4" />
                  <line x1="-6" y1="12" x2="6" y2="12" stroke="#94a3b8" strokeWidth="4" />
                  <text x="-35" y="4" fill="#38bdf8" className="text-[10px] font-mono font-bold">{voltage}V</text>
                  <text x="14" y="-8" fill="#38bdf8" className="text-[9px] font-bold">+</text>
                  <text x="10" y="16" fill="#94a3b8" className="text-[9px] font-bold">-</text>
                </g>

                {/* Ammeter (Top Left) */}
                <g transform="translate(140, 30)">
                  <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#6366f1" strokeWidth="2" />
                  <text x="0" y="4" textAnchor="middle" fill="#818cf8" className="text-[10px] font-mono font-black">A</text>
                  <text x="0" y="-18" textAnchor="middle" fill="#818cf8" className="text-[9px] font-mono">{totalCurrent.toFixed(2)} A</text>
                </g>

                {/* Key Switch (Bottom Wire) */}
                <g transform="translate(250, 210)">
                  <circle cx="-15" cy="0" r="3" fill="#ffffff" />
                  <circle cx="15" cy="0" r="3" fill="#ffffff" />
                  {switchClosed ? (
                    <line x1="-15" y1="0" x2="15" y2="0" stroke="#10b981" strokeWidth="3" />
                  ) : (
                    <line x1="-15" y1="0" x2="10" y2="-16" stroke="#ef4444" strokeWidth="3" />
                  )}
                  <text x="0" y="18" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">Key Switch (K)</text>
                </g>

                {/* Light Bulb (Right Wire) */}
                <g transform="translate(450, 120)">
                  <circle 
                    cx="0" 
                    cy="0" 
                    r="16" 
                    fill={switchClosed ? `rgba(251, 191, 36, ${bulbBrightness / 100})` : "#1e293b"} 
                    stroke="#f59e0b" 
                    strokeWidth="2"
                    filter={switchClosed && bulbBrightness > 20 ? "url(#bulbGlow)" : "none"}
                  />
                  <path d="M -6 -6 L 6 6 M -6 6 L 6 -6" stroke="#fef08a" strokeWidth="2" />
                  <text x="24" y="4" fill="#fbbf24" className="text-[9px] font-bold">Bulb ({bulbBrightness}%)</text>
                </g>

                {/* Series vs Parallel Resistor Layout */}
                {circuitType === "series" ? (
                  <g transform="translate(250, 30)">
                    {/* R1 */}
                    <g transform="translate(-70, 0)">
                      <rect x="-18" y="-8" width="36" height="16" rx="3" fill="#1e293b" stroke="#f43f5e" strokeWidth="2" />
                      <text x="0" y="3" textAnchor="middle" fill="#fda4af" className="text-[8px] font-mono font-bold">R₁ {r1}Ω</text>
                      <text x="0" y="-12" textAnchor="middle" fill="#fda4af" className="text-[8px] font-mono">{v1.toFixed(1)}V</text>
                    </g>
                    {/* R2 */}
                    <g transform="translate(0, 0)">
                      <rect x="-18" y="-8" width="36" height="16" rx="3" fill="#1e293b" stroke="#a855f7" strokeWidth="2" />
                      <text x="0" y="3" textAnchor="middle" fill="#d8b4fe" className="text-[8px] font-mono font-bold">R₂ {r2}Ω</text>
                      <text x="0" y="-12" textAnchor="middle" fill="#d8b4fe" className="text-[8px] font-mono">{v2.toFixed(1)}V</text>
                    </g>
                    {/* R3 */}
                    <g transform="translate(70, 0)">
                      <rect x="-18" y="-8" width="36" height="16" rx="3" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
                      <text x="0" y="3" textAnchor="middle" fill="#67e8f9" className="text-[8px] font-mono font-bold">R₃ {r3}Ω</text>
                      <text x="0" y="-12" textAnchor="middle" fill="#67e8f9" className="text-[8px] font-mono">{v3.toFixed(1)}V</text>
                    </g>
                  </g>
                ) : (
                  /* Parallel Branches */
                  <g transform="translate(250, 30)">
                    {/* Top branch R1 */}
                    <path d="M -80 0 L -50 -30 L 50 -30 L 80 0" fill="none" stroke="#334155" strokeWidth="3" />
                    <rect x="-18" y="-38" width="36" height="16" rx="3" fill="#1e293b" stroke="#f43f5e" strokeWidth="2" />
                    <text x="0" y="-27" textAnchor="middle" fill="#fda4af" className="text-[8px] font-mono font-bold">R₁ {r1}Ω</text>
                    <text x="0" y="-42" textAnchor="middle" fill="#fda4af" className="text-[8px] font-mono">{i1.toFixed(2)}A</text>

                    {/* Middle branch R2 */}
                    <line x1="-80" y1="0" x2="80" y2="0" stroke="#334155" strokeWidth="3" />
                    <rect x="-18" y="-8" width="36" height="16" rx="3" fill="#1e293b" stroke="#a855f7" strokeWidth="2" />
                    <text x="0" y="3" textAnchor="middle" fill="#d8b4fe" className="text-[8px] font-mono font-bold">R₂ {r2}Ω</text>
                    <text x="0" y="-12" textAnchor="middle" fill="#d8b4fe" className="text-[8px] font-mono">{i2.toFixed(2)}A</text>

                    {/* Bottom branch R3 */}
                    <path d="M -80 0 L -50 30 L 50 30 L 80 0" fill="none" stroke="#334155" strokeWidth="3" />
                    <rect x="-18" y="22" width="36" height="16" rx="3" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
                    <text x="0" y="33" textAnchor="middle" fill="#67e8f9" className="text-[8px] font-mono font-bold">R₃ {r3}Ω</text>
                    <text x="0" y="48" textAnchor="middle" fill="#67e8f9" className="text-[8px] font-mono">{i3.toFixed(2)}A</text>
                  </g>
                )}
              </svg>
            </div>

            {/* Bottom Real-time Measurement Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-3">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Equivalent Resistance</span>
                <span className="text-sm font-mono font-black text-indigo-400">{rEquivalent.toFixed(2)} Ω</span>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Current (I)</span>
                <span className="text-sm font-mono font-black text-emerald-400">{totalCurrent.toFixed(2)} A</span>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Power (P = VI)</span>
                <span className="text-sm font-mono font-black text-amber-400">{totalPower.toFixed(1)} W</span>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Heat Generated / Min</span>
                <span className="text-sm font-mono font-black text-rose-400">{heatPerMin.toFixed(0)} J</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Parameter Sliders & Formula Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Circuit Topology Selector */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Circuit Network Configuration</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCircuitType("series")}
                className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                  circuitType === "series"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25"
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                }`}
              >
                Series Circuit (Constant I)
              </button>
              <button
                onClick={() => setCircuitType("parallel")}
                className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                  circuitType === "parallel"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25"
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                }`}
              >
                Parallel Circuit (Constant V)
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Component Parameters
            </h3>

            {/* Voltage */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Battery Voltage (V)</span>
                <span className="font-mono text-cyan-400">{voltage} V</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                step="1"
                value={voltage}
                onChange={(e) => setVoltage(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Resistor 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-400">Resistor R₁ (Ω)</span>
                <span className="font-mono text-rose-400">{r1} Ω</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={r1}
                onChange={(e) => setR1(parseInt(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Resistor 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-purple-400">Resistor R₂ (Ω)</span>
                <span className="font-mono text-purple-400">{r2} Ω</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={r2}
                onChange={(e) => setR2(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Resistor 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-cyan-400">Resistor R₃ (Ω)</span>
                <span className="font-mono text-cyan-400">{r3} Ω</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={r3}
                onChange={(e) => setR3(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          {/* CBSE Principles Box */}
          <div className="p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-2 text-slate-300">
            <div className="flex items-center gap-2 font-black text-indigo-400 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" /> CBSE Board Exam Concept Box:
            </div>
            <ul className="space-y-1 text-[11px] list-disc list-inside leading-relaxed text-slate-300">
              <li><strong>Series Circuits:</strong> Current <code>I</code> is constant across all resistors. Total potential <code>V = V₁ + V₂ + V₃</code>.</li>
              <li><strong>Parallel Circuits:</strong> Potential <code>V</code> is constant across all branches. Total current <code>I = I₁ + I₂ + I₃</code>.</li>
              <li><strong>Domestic Wiring:</strong> Always connected in parallel so each appliance gets full 220V and operates independently.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
