"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, RotateCcw, Droplet, Info, Sparkles, 
  HelpCircle, CheckCircle, Volume2, VolumeX, ShieldCheck, ArrowRight
} from "lucide-react";
import { awardXp } from "@/lib/xp";

interface CurvePoint {
  volume: number;
  pH: number;
}

export default function TitrationLab() {
  // Parameters
  const [titrantType, setTitrantType] = useState<"acid" | "base">("base"); // base in burette = titrating acid
  const [indicator, setIndicator] = useState<"phenolphthalein" | "methyl_orange" | "litmus">("phenolphthalein");
  const [volumeAdded, setVolumeAdded] = useState<number>(0); // in mL
  const [isFlowing, setIsFlowing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Challenge State
  const [challengeWon, setChallengeWon] = useState<boolean>(false);
  const [claimedXP, setClaimedXP] = useState<boolean>(false);

  const flowIntervalRef = useRef<number | null>(null);

  // Chemistry Constants
  const vInitial = 25.0; // mL of analyte in flask
  const cAnalyte = 0.1;  // Molarity
  const cTitrant = 0.1;  // Molarity

  // Calculate pH dynamically based on strong acid/base titration math
  const calculatePH = (vAdded: number): number => {
    // Equivalence point is exactly at 25.0 mL
    const nInitial = (vInitial / 1000) * cAnalyte;
    const nAdded = (vAdded / 1000) * cTitrant;
    const vTotalL = (vInitial + vAdded) / 1000;

    if (titrantType === "base") {
      // Flask starts as Acid (pH low), Titrant is Base (NaOH)
      if (vAdded < 25.0) {
        const nRemainingAcid = nInitial - nAdded;
        const hConc = nRemainingAcid / vTotalL;
        const ph = -Math.log10(hConc);
        return Math.max(1.0, ph);
      } else if (Math.abs(vAdded - 25.0) < 0.001) {
        return 7.0; // Neutrality
      } else {
        const nExcessBase = nAdded - nInitial;
        const ohConc = nExcessBase / vTotalL;
        const poh = -Math.log10(ohConc);
        return Math.min(13.0, 14.0 - poh);
      }
    } else {
      // Flask starts as Base (pH high), Titrant is Acid (HCl)
      if (vAdded < 25.0) {
        const nRemainingBase = nInitial - nAdded;
        const ohConc = nRemainingBase / vTotalL;
        const poh = -Math.log10(ohConc);
        return Math.min(13.0, 14.0 - poh);
      } else if (Math.abs(vAdded - 25.0) < 0.001) {
        return 7.0; // Neutrality
      } else {
        const nExcessAcid = nAdded - nInitial;
        const hConc = nExcessAcid / vTotalL;
        const ph = -Math.log10(hConc);
        return Math.max(1.0, ph);
      }
    }
  };

  const currentPH = calculatePH(volumeAdded);

  // Indicator Liquid Color mapping
  const getIndicatorColor = (ph: number) => {
    if (indicator === "phenolphthalein") {
      // Phenolphthalein: colorless (<8.2) to bright pink (>10.0)
      if (ph < 8.2) return "rgba(241, 245, 249, 0.25)"; // colorless
      if (ph >= 8.2 && ph <= 9.8) {
        const ratio = (ph - 8.2) / 1.6;
        return `rgba(236, 72, 153, ${0.2 + ratio * 0.75})`; // transitioning pink
      }
      return "rgba(219, 39, 119, 0.95)"; // deep magenta
    } 
    else if (indicator === "methyl_orange") {
      // Methyl orange: red (<3.1) to yellow (>4.4)
      if (ph < 3.1) return "rgba(239, 68, 68, 0.85)"; // red
      if (ph >= 3.1 && ph <= 4.4) {
        const ratio = (ph - 3.1) / 1.3;
        // interpolate red to orange/yellow
        return `rgba(249, 115, 22, 0.85)`;
      }
      return "rgba(234, 179, 8, 0.9)"; // yellow
    } 
    else {
      // Litmus: red (<5.0) to purple (5.0-8.0) to blue (>8.0)
      if (ph < 5.0) return "rgba(239, 68, 68, 0.85)"; // red
      if (ph >= 5.0 && ph <= 8.0) return "rgba(139, 92, 246, 0.85)"; // purple
      return "rgba(59, 130, 246, 0.85)"; // blue
    }
  };

  // Sound Synthesizer
  const playDripSound = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      // brief high pitch ping for drop
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn(e);
    }
  };

  // Handlers
  const addDrip = (amount: number) => {
    setVolumeAdded((prev) => {
      const next = Math.min(50.0, parseFloat((prev + amount).toFixed(1)));
      if (next >= 50.0) {
        setIsFlowing(false);
      }
      return next;
    });
    playDripSound();
  };

  const handleReset = () => {
    setVolumeAdded(0);
    setIsFlowing(false);
    setChallengeWon(false);
    setClaimedXP(false);
  };

  // Continuous drip flow
  useEffect(() => {
    if (isFlowing) {
      flowIntervalRef.current = window.setInterval(() => {
        addDrip(0.1);
      }, 70); // 0.1 mL every 70ms
    } else {
      if (flowIntervalRef.current) {
        clearInterval(flowIntervalRef.current);
      }
    }
    return () => {
      if (flowIntervalRef.current) clearInterval(flowIntervalRef.current);
    };
  }, [isFlowing]);

  // Check Challenge Completion (neutralization)
  useEffect(() => {
    // Check if pH is close to 7 (between 6.2 and 7.8)
    if (currentPH >= 6.2 && currentPH <= 7.8 && !isFlowing) {
      setChallengeWon(true);
    } else {
      setChallengeWon(false);
    }
  }, [currentPH, isFlowing]);

  const handleClaimXP = () => {
    if (claimedXP) return;
    setClaimedXP(true);
    awardXp(100, "Successfully Neutralized Chemical Solution");
  };

  // Generate SVG path for the titration curve
  const getCurvePathPoints = (): string => {
    const points: CurvePoint[] = [];
    // Generate data from 0 to 50 mL
    for (let v = 0; v <= 50; v += 0.5) {
      points.push({ volume: v, pH: calculatePH(v) });
    }

    // Map to SVG coordinates: Width=180, Height=100
    // x range 0..50 -> 10..170
    // y range 14..0 -> 10..90
    return points.map((p, idx) => {
      const x = 15 + (p.volume / 50) * 155;
      const y = 90 - (p.pH / 14) * 80;
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5">
      {/* Interactive Titration Apparatus (7 Cols) */}
      <div className="lg:col-span-7 dark:bg-[#070916] bg-white dark:border-white/10 border-slate-200 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <h2 className="text-sm font-black dark:text-white text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <Droplet className="w-4 h-4 text-cyan-400" /> Acid-Base Titration Lab
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset Lab
            </button>
          </div>
        </div>

        {/* Visual Workstation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center dark:bg-black/30 bg-slate-100/30 p-4 rounded-2xl border dark:border-white/5 border-slate-200">
          
          {/* Apparatus Display (Left 5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center min-h-[350px] relative">
            
            {/* The Burette stand & tube */}
            <div className="w-24 h-[250px] relative border-x border-slate-400/40 bg-slate-400/10 flex flex-col justify-between items-center rounded-t-lg">
              {/* Liquid inside burette */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500/20 transition-all duration-300"
                style={{ height: `${Math.max(0, 100 - (volumeAdded / 50) * 100)}%` }}
              />
              
              {/* Burette measurements marks */}
              <div className="absolute inset-y-2 left-2 flex flex-col justify-between text-[8px] font-mono text-slate-500 select-none">
                <span>0mL</span>
                <span>10mL</span>
                <span>20mL</span>
                <span>30mL</span>
                <span>40mL</span>
                <span>50mL</span>
              </div>

              {/* Stopcock valve at bottom */}
              <div className="absolute -bottom-5 w-8 h-8 flex items-center justify-center bg-slate-600 rounded-lg border border-slate-500 shadow-md">
                <div 
                  className={`w-1.5 h-6 bg-rose-500 rounded transition-transform duration-300 ${
                    isFlowing ? "rotate-90" : "rotate-0"
                  }`} 
                />
              </div>
            </div>

            {/* Dripping Drop animation */}
            {isFlowing && (
              <div className="w-1 h-8 absolute top-[255px] overflow-hidden flex justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce mt-1" />
              </div>
            )}

            {/* Conical Flask at bottom */}
            <div className="mt-8 w-28 h-28 relative flex items-end justify-center">
              {/* SVG Flask outer outline */}
              <svg className="absolute inset-0 w-full h-full text-slate-400/60" viewBox="0 0 100 100" fill="none">
                <path d="M40 10 H60 V35 L85 85 A5 5 0 0 1 80 92 H20 A5 5 0 0 1 15 85 L40 35 V10 Z" stroke="currentColor" strokeWidth="2.5" />
              </svg>

              {/* Flask Liquid */}
              <div className="w-full px-5 pb-1 h-12 flex items-end">
                <div 
                  className="w-full rounded-b-md transition-all duration-500 shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                  style={{ 
                    height: `${Math.min(100, 30 + (volumeAdded / 50) * 40)}%`,
                    backgroundColor: getIndicatorColor(currentPH),
                    borderRadius: "0 0 6px 6px"
                  }}
                />
              </div>
            </div>

            {/* Labels */}
            <div className="text-center mt-3 text-[10px] font-bold uppercase tracking-wider dark:text-slate-400 text-slate-500">
              Flask: {vInitial} mL of {titrantType === "base" ? "Acid (HCl)" : "Base (NaOH)"}
            </div>

          </div>

          {/* Titration Curve Chart (Right 7 cols) */}
          <div className="md:col-span-7 space-y-4">
            
            {/* SVG Titration Curve plot */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-inner flex flex-col">
              <div className="flex justify-between items-center mb-1 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <span>Titration Curve (pH vs Volume)</span>
                <span className="text-indigo-400">Equivalent Point = 25.0 mL</span>
              </div>
              
              <div className="relative h-[160px] w-full">
                <svg className="w-full h-full" viewBox="0 0 180 100" preserveAspectRatio="none">
                  {/* Axis Grid lines */}
                  <line x1="15" y1="10" x2="15" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <line x1="15" y1="90" x2="170" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <line x1="15" y1="50" x2="170" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" /> {/* pH 7 */}

                  {/* Curve Path */}
                  <path 
                    d={getCurvePathPoints()} 
                    fill="none" 
                    stroke="#4f46e5" 
                    strokeWidth="2" 
                  />

                  {/* Current Position Marker dot */}
                  {(() => {
                    const cx = 15 + (volumeAdded / 50) * 155;
                    const cy = 90 - (currentPH / 14) * 80;
                    return (
                      <circle cx={cx} cy={cy} r="4" fill="#ef4444" className="animate-pulse" />
                    );
                  })()}
                </svg>

                {/* Y Axis Labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[7px] text-slate-600 font-mono select-none pl-1">
                  <span>pH 14</span>
                  <span>pH 7</span>
                  <span>pH 0</span>
                </div>
                {/* X Axis Labels */}
                <div className="absolute bottom-0 left-4 right-2 flex justify-between text-[7px] text-slate-600 font-mono select-none pt-0.5">
                  <span>0 mL</span>
                  <span>25 mL</span>
                  <span>50 mL</span>
                </div>
              </div>
            </div>

            {/* Diagnostics details */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Flask pH Indicator:</div>
                <div className="text-xl font-black font-mono text-indigo-400 mt-0.5">{currentPH.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Titrant Added:</div>
                <div className="text-xl font-black font-mono text-cyan-400 mt-0.5">{volumeAdded.toFixed(1)} mL</div>
              </div>
            </div>

          </div>

        </div>

        {/* Neutralization Challenge Banner */}
        {challengeWon && (
          <div className="mt-4 p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <Sparkles className="w-8 h-8 text-emerald-400 animate-bounce shrink-0" />
              <div>
                <h4 className="text-sm font-black text-white">Equivalence Achieved!</h4>
                <p className="text-xs text-slate-350 mt-0.5">
                  Solution neutralized precisely at {volumeAdded} mL added (pH = {currentPH.toFixed(1)})!
                </p>
              </div>
            </div>

            {!claimedXP ? (
              <button
                onClick={handleClaimXP}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-transform"
              >
                Claim +100 XP Reward
              </button>
            ) : (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-4 h-4" /> +100 XP Claimed!
              </span>
            )}
          </div>
        )}

      </div>

      {/* Control Panel (5 Cols) */}
      <div className="lg:col-span-5 space-y-4">
        
        <div className="p-6 rounded-3xl dark:bg-slate-900 bg-white border dark:border-white/10 border-slate-200 shadow-2xl space-y-5">
          <div className="border-b dark:border-white/10 border-slate-200 pb-3">
            <h3 className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-wide">Chemical Parameters</h3>
          </div>

          {/* Titration Mode */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold dark:text-slate-300 text-slate-700 block">Titration Setup:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setTitrantType("base");
                  handleReset();
                }}
                disabled={isFlowing}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                  titrantType === "base"
                    ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/50"
                    : "dark:bg-white/5 bg-slate-100 hover:bg-white/10 dark:text-slate-400 text-slate-600 border-transparent"
                }`}
              >
                Acid with NaOH
              </button>
              <button
                onClick={() => {
                  setTitrantType("acid");
                  handleReset();
                }}
                disabled={isFlowing}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                  titrantType === "acid"
                    ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/50"
                    : "dark:bg-white/5 bg-slate-100 hover:bg-white/10 dark:text-slate-400 text-slate-600 border-transparent"
                }`}
              >
                Base with HCl
              </button>
            </div>
          </div>

          {/* Indicator Selection */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold dark:text-slate-300 text-slate-700 block">Chemical Indicator:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "phenolphthalein", label: "Phenolphthalein" },
                { id: "methyl_orange", label: "Methyl Orange" },
                { id: "litmus", label: "Litmus" }
              ].map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => setIndicator(ind.id as any)}
                  className={`px-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border leading-tight ${
                    indicator === ind.id
                      ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/50"
                      : "dark:bg-white/5 bg-slate-100 hover:bg-white/10 dark:text-slate-400 text-slate-600 border-transparent"
                  }`}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>

          {/* Titration Valve Drip Operations */}
          <div className="space-y-3 pt-3 border-t dark:border-white/10 border-slate-200">
            <span className="text-xs font-bold dark:text-slate-300 text-slate-700 block">Valve Flow Control:</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addDrip(0.1)}
                disabled={volumeAdded >= 50.0 || isFlowing}
                className="py-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:hover:bg-white/5 hover:bg-slate-100 text-xs font-black uppercase tracking-wider transition-all dark:text-white text-slate-900 disabled:opacity-40"
              >
                +0.1 mL (Drop)
              </button>
              <button
                onClick={() => addDrip(1.0)}
                disabled={volumeAdded >= 50.0 || isFlowing}
                className="py-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:hover:bg-white/5 hover:bg-slate-100 text-xs font-black uppercase tracking-wider transition-all dark:text-white text-slate-900 disabled:opacity-40"
              >
                +1.0 mL (Squirt)
              </button>
            </div>

            <button
              onClick={() => setIsFlowing(!isFlowing)}
              disabled={volumeAdded >= 50.0}
              className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                isFlowing
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              }`}
            >
              {isFlowing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              {isFlowing ? "Stop Flow (Close Stopcock)" : "Drip Flow (Open Stopcock)"}
            </button>
          </div>
        </div>

        {/* Informative Theory Box */}
        <div className="p-5 rounded-3xl dark:bg-slate-900 bg-white border dark:border-white/10 border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black dark:text-indigo-400 text-indigo-700 uppercase tracking-wider">
            <Info className="w-4 h-4" /> CBSE Board Theory Guide:
          </div>
          
          <ul className="space-y-2.5 text-xs dark:text-slate-300 text-slate-700 list-disc list-inside leading-relaxed">
            <li>
              <strong className="dark:text-indigo-300 text-indigo-700">Equivalence Point:</strong> The point in a titration where the moles of acid exactly equal the moles of base. For strong acid-strong base titrations, this point has a pH of exactly <strong className="underline">7.0</strong>.
            </li>
            <li>
              <strong className="dark:text-pink-300 text-pink-700">Endpoint:</strong> The point in the titration where the chemical indicator undergoes a distinct color shift.
            </li>
            <li>
              <strong className="dark:text-emerald-300 text-emerald-700">Indicator Transitions:</strong>
              <ul className="pl-4 list-circle space-y-1 mt-1 text-[11px]">
                <li>Phenolphthalein changes from colorless to pink in basic range (8.2-10).</li>
                <li>Methyl Orange changes from red to orange-yellow in acidic range (3.1-4.4).</li>
              </ul>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
