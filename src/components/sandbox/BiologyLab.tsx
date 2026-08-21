"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, Eye, Sparkles, ZoomIn, ZoomOut, 
  RotateCcw, ShieldCheck, ChevronRight, Check, Activity, Info, Droplet, 
  Volume2, VolumeX, Sliders, Play, Pause, Award, HelpCircle, Flame, Sun, Wind
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "@/components/Confetti";
import { awardUserXP } from "@/lib/xp";

type LabSpecimen = "heart" | "nephron" | "microscope" | "stomata";
type CellType = "plant" | "animal";
type StainType = "none" | "iodine" | "methylene" | "safranin";

interface HotspotInfo {
  id: string;
  name: string;
  x: number;
  y: number;
  category: string;
  role: string;
  cbseTip: string;
  oxygenated?: boolean;
}

const HEART_HOTSPOTS: HotspotInfo[] = [
  {
    id: "sa_node",
    name: "Sinoatrial (SA) Node - 'The Pacemaker'",
    x: 32,
    y: 26,
    category: "Electrical System",
    role: "Generates rhythmic electrical action potentials (72/min) causing simultaneous atrial contraction (Systole).",
    cbseTip: "Located in upper right wall of Right Atrium. Termed 'natural pacemaker' of the heart.",
    oxygenated: false
  },
  {
    id: "right_atrium",
    name: "Right Atrium",
    x: 28,
    y: 42,
    category: "Chamber",
    role: "Receives deoxygenated blood from the entire body via Superior and Inferior Vena Cava.",
    cbseTip: "Has thin muscular walls as it only pushes blood through the tricuspid valve into the adjacent right ventricle.",
    oxygenated: false
  },
  {
    id: "tricuspid_valve",
    name: "Tricuspid Atrioventricular Valve",
    x: 34,
    y: 56,
    category: "Valve",
    role: "Three-cusp valve that opens during diastole and snaps shut during ventricular systole to prevent backflow into right atrium.",
    cbseTip: "Produces the first heart sound (S1 'LUB') when closing during ventricular contraction.",
    oxygenated: false
  },
  {
    id: "right_ventricle",
    name: "Right Ventricle",
    x: 34,
    y: 72,
    category: "Chamber",
    role: "Pumps deoxygenated blood into the Pulmonary Artery towards the lungs for oxygenation.",
    cbseTip: "Thinner myocardium than left ventricle because pulmonary circulation requires much lower pressure (25 mmHg).",
    oxygenated: false
  },
  {
    id: "pulmonary_artery",
    name: "Pulmonary Artery",
    x: 44,
    y: 18,
    category: "Vessel",
    role: "Carries deoxygenated blood from right ventricle to lungs. The ONLY artery in the human body carrying deoxygenated blood.",
    cbseTip: "High CBSE Trap: All arteries carry oxygenated blood EXCEPT the Pulmonary Artery.",
    oxygenated: false
  },
  {
    id: "pulmonary_veins",
    name: "Pulmonary Veins (4 Inflow Ports)",
    x: 74,
    y: 36,
    category: "Vessel",
    role: "Bring freshly oxygenated blood from the lungs directly into the Left Atrium. The ONLY veins carrying oxygenated blood.",
    cbseTip: "High CBSE Trap: All veins carry deoxygenated blood EXCEPT the Pulmonary Veins.",
    oxygenated: true
  },
  {
    id: "left_atrium",
    name: "Left Atrium",
    x: 68,
    y: 42,
    category: "Chamber",
    role: "Receives oxygen-rich blood from the pulmonary veins and relaxes (atrial diastole) to fill with blood.",
    cbseTip: "Relatively thin-walled chamber on the posterior upper-left base of the heart.",
    oxygenated: true
  },
  {
    id: "bicuspid_valve",
    name: "Bicuspid (Mitral) Valve",
    x: 62,
    y: 56,
    category: "Valve",
    role: "Two-cusp valve between left atrium and left ventricle. Anchored by chordae tendineae and papillary muscles.",
    cbseTip: "Also known as the Mitral Valve. Prevents backward regurgitation into left atrium under high systolic pressure.",
    oxygenated: true
  },
  {
    id: "left_ventricle",
    name: "Left Ventricle",
    x: 62,
    y: 74,
    category: "Chamber",
    role: "Pumps oxygenated blood through aortic valve into systemic circulation at 120 mmHg systolic pressure.",
    cbseTip: "Possesses the thickest muscular myocardium wall (3x thicker than right ventricle) to overcome systemic vascular resistance.",
    oxygenated: true
  },
  {
    id: "aorta",
    name: "Aortic Arch & Systemic Aorta",
    x: 54,
    y: 12,
    category: "Vessel",
    role: "Largest artery in the body. Delivers oxygenated blood at high pressure to head, arms, and systemic organs.",
    cbseTip: "Highly elastic walls expand during systole and recoil during diastole (Windkessel effect) to maintain continuous blood flow.",
    oxygenated: true
  },
  {
    id: "septum",
    name: "Interventricular Muscular Septum",
    x: 49,
    y: 66,
    category: "Wall",
    role: "Thick muscular partition completely dividing right and left chambers, preventing mixing of oxygenated & deoxygenated blood.",
    cbseTip: "Crucial for mammals and birds to maintain high metabolic rates and constant 37°C endothermic body temperature.",
    oxygenated: false
  }
];

const NEPHRON_HOTSPOTS: HotspotInfo[] = [
  {
    id: "afferent_arteriole",
    name: "Afferent & Efferent Arterioles",
    x: 18,
    y: 22,
    category: "Blood Supply",
    role: "Afferent arteriole has a wider diameter than efferent arteriole, creating high hydrostatic pressure (55 mmHg) in Glomerulus.",
    cbseTip: "Diameter difference is the primary physical driving force behind ultrafiltration."
  },
  {
    id: "glomerulus",
    name: "Glomerulus & Bowman's Capsule",
    x: 24,
    y: 35,
    category: "Ultrafiltration",
    role: "Ultrafiltration of blood plasma through podocyte slit pores under high pressure. Filters water, glucose, salts, and urea while retaining RBCs and large proteins.",
    cbseTip: "Forms ~180 Litres of primary nephric filtrate daily in adult humans."
  },
  {
    id: "pct",
    name: "Proximal Convoluted Tubule (PCT)",
    x: 42,
    y: 28,
    category: "Selective Reabsorption",
    role: "100% of glucose & amino acids, and 70-80% of water, Na+, and Cl- are selectively reabsorbed by active transport.",
    cbseTip: "Lined by simple cuboidal brush border epithelium with millions of microvilli to maximize reabsorption surface area."
  },
  {
    id: "loop_henle_desc",
    name: "Descending Limb of Loop of Henle",
    x: 48,
    y: 72,
    category: "Counter-Current Osmosis",
    role: "Permeable to water via aquaporins, impermeable to salts. Water moves out into hypertonic renal medulla.",
    cbseTip: "Filtrate becomes progressively hypertonic (up to 1200 mOsm/L) towards the hairpin loop apex."
  },
  {
    id: "loop_henle_asc",
    name: "Ascending Limb of Loop of Henle",
    x: 58,
    y: 68,
    category: "Electrolyte Transport",
    role: "Impermeable to water, actively pumps Na+ and Cl- out into medullary interstitium to maintain hypertonic osmotic gradient.",
    cbseTip: "Filtrate becomes hypotonic (dilute) as it ascends towards the DCT."
  },
  {
    id: "dct",
    name: "Distal Convoluted Tubule (DCT)",
    x: 74,
    y: 32,
    category: "Hormonal Regulation",
    role: "Conditional reabsorption of Na+ under Aldosterone and water under ADH (Vasopressin). Active secretion of K+ and H+ ions to regulate blood pH.",
    cbseTip: "Maintains electrolyte balance and blood pressure homeostasis via Renin-Angiotensin system."
  },
  {
    id: "collecting_duct",
    name: "Collecting Duct & Renal Pelvis Outflow",
    x: 88,
    y: 50,
    category: "Urine Concentration",
    role: "Concentrates final urine by ADH-mediated water reabsorption. Drains into renal calyx, renal pelvis, ureter, and urinary bladder.",
    cbseTip: "Only ~1.5 Litres of final hypertonic urine is excreted per day out of 180 L initial filtrate (99% reabsorption efficiency!)."
  }
];

export default function BiologyLab() {
  const [lab, setLab] = useState<LabSpecimen>("heart");
  const [activeHotspot, setActiveHotspot] = useState<HotspotInfo>(HEART_HOTSPOTS[0]);
  
  // Heart Simulator States
  const [heartBpm, setHeartBpm] = useState<number>(75);
  const [isHeartSoundOn, setIsHeartSoundOn] = useState<boolean>(false);
  const [isCardiacBeating, setIsCardiacBeating] = useState<boolean>(true);
  const [cardiacCyclePhase, setCardiacCyclePhase] = useState<"systole" | "diastole">("systole");
  const [ecgPoints, setEcgPoints] = useState<number[]>([]);

  // Nephron Simulator States
  const [bloodPressure, setBloodPressure] = useState<number>(120);
  const [adhHormoneActive, setAdhHormoneActive] = useState<boolean>(true);
  const [glucoseFilterActive, setGlucoseFilterActive] = useState<boolean>(true);

  // Microscope Simulator States
  const [cellType, setCellType] = useState<CellType>("plant");
  const [stain, setStain] = useState<StainType>("none");
  const [magnification, setMagnification] = useState<number>(40);
  const [focusKnob, setFocusKnob] = useState<number>(50); // 50 = perfect focus
  const [illumination, setIllumination] = useState<number>(85);

  // Stomata Simulator States
  const [isStomaOpen, setIsStomaOpen] = useState<boolean>(true);
  const [lightLux, setLightLux] = useState<number>(75);
  const [co2Ppm, setCo2Ppm] = useState<number>(420);

  // Gamification & Quiz
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Sound Synthesizers for Heart S1 ("Lub") and S2 ("Dub")
  // ─────────────────────────────────────────────────────────────
  const playHeartSound = (isS1: boolean) => {
    if (!isHeartSoundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // S1 is lower pitch (50-80 Hz) and slightly longer; S2 is crisper (90-120 Hz)
      osc.type = "sine";
      osc.frequency.setValueAtTime(isS1 ? 65 : 100, ctx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(isS1 ? 140 : 200, ctx.currentTime);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isS1 ? 0.16 : 0.11));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + (isS1 ? 0.16 : 0.11));
    } catch {}
  };

  // Cardiac Loop Simulation
  useEffect(() => {
    if (!isCardiacBeating) return;

    const intervalMs = (60 / heartBpm) * 1000;
    
    const interval = setInterval(() => {
      // Systole: "LUB"
      setCardiacCyclePhase("systole");
      playHeartSound(true);

      setTimeout(() => {
        // Diastole: "DUB"
        setCardiacCyclePhase("diastole");
        playHeartSound(false);
      }, intervalMs * 0.35);

    }, intervalMs);

    return () => clearInterval(interval);
  }, [heartBpm, isHeartSoundOn, isCardiacBeating]);

  const handleSelectLab = (selected: LabSpecimen) => {
    setLab(selected);
    if (selected === "heart") setActiveHotspot(HEART_HOTSPOTS[0]);
    else if (selected === "nephron") setActiveHotspot(NEPHRON_HOTSPOTS[0]);
  };

  const calculateGfr = () => {
    // GFR = Kf * (Pgc - Pbc - Pic)
    const netPressure = (bloodPressure * 0.45) - 15 - 30;
    const gfrVal = Math.max(20, Math.round(netPressure * 4.2));
    return gfrVal;
  };

  const calculatePhotosynthesisRate = () => {
    // Blackman's Law
    const rate = Math.round((lightLux / 100) * (co2Ppm / 400) * 85);
    return Math.min(100, Math.max(5, rate));
  };

  const handleClaimQuiz = () => {
    awardUserXP(50);
    setConfettiActive(true);
    setQuizActive(false);
    setTimeout(() => setConfettiActive(false), 3000);
  };

  return (
    <div className="space-y-6">
      <Confetti active={confettiActive} />

      {/* Top Banner & Mode Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-wider uppercase mb-1">
            <Activity className="w-3.5 h-3.5" /> High-Fidelity Biology & Physiological Simulation Suite
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Virtual BioLab: Interactive Anatomy, Transport & Microscopic Optics
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Class 10 CBSE Life Processes: Circulatory Dynamics, Renal Ultrafiltration, Stomatal Transpiration, and Cellular Microscopy.
          </p>
        </div>

        {/* 4 Laboratory Selectors */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto max-w-full">
          <button
            onClick={() => handleSelectLab("heart")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              lab === "heart" ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> 🫀 Human Heart
          </button>
          <button
            onClick={() => handleSelectLab("nephron")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              lab === "nephron" ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <Droplet className="w-3.5 h-3.5" /> 🧪 Nephron Unit
          </button>
          <button
            onClick={() => handleSelectLab("microscope")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              lab === "microscope" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> 🔬 Microscope Cell
          </button>
          <button
            onClick={() => handleSelectLab("stomata")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              lab === "stomata" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <Wind className="w-3.5 h-3.5" /> 🌿 Stomata Lab
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  LABORATORY 1: HUMAN CARDIAC & DOUBLE CIRCULATION SIMULATOR   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {lab === "heart" && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Graphic & EKG Canvas (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-950 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
              
              {/* Cardiac Top Control Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-black text-white">
                    Double Circulation System ({cardiacCyclePhase.toUpperCase()})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sound Toggle */}
                  <button
                    onClick={() => setIsHeartSoundOn(!isHeartSoundOn)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isHeartSoundOn ? "bg-rose-600 border-rose-500 text-white shadow-md" : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                    title="Lub-Dub Acoustic Heart Sounds"
                  >
                    {isHeartSoundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Lub-Dub Audio</span>
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={() => setIsCardiacBeating(!isCardiacBeating)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
                  >
                    {isCardiacBeating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Heart SVG Animation Container */}
              <div className="relative w-full h-[360px] flex items-center justify-center my-2 select-none">
                <motion.svg
                  viewBox="0 0 600 420"
                  className="w-full h-full filter drop-shadow-[0_0_20px_rgba(225,29,72,0.25)]"
                  animate={isCardiacBeating ? {
                    scale: cardiacCyclePhase === "systole" ? 1.04 : 0.98
                  } : { scale: 1 }}
                  transition={{ duration: (60 / heartBpm) * 0.35, ease: "easeInOut" }}
                >
                  <defs>
                    {/* Oxygenated Red Gradient */}
                    <linearGradient id="oxygenGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#991b1b" stopOpacity="0.9" />
                    </linearGradient>
                    {/* Deoxygenated Blue Gradient */}
                    <linearGradient id="deoxygenGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.9" />
                    </linearGradient>
                    {/* Septum Muscle Gradient */}
                    <linearGradient id="muscleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#64748b" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>
                  </defs>

                  {/* 1. Superior & Inferior Vena Cava (Deox Blue) */}
                  <path d="M 170 30 L 170 140 M 170 280 L 170 360" stroke="#3b82f6" strokeWidth="22" strokeLinecap="round" />
                  <text x="110" y="55" fill="#60a5fa" className="text-[10px] font-black font-mono">Superior Vena Cava</text>
                  <text x="110" y="380" fill="#60a5fa" className="text-[10px] font-black font-mono">Inferior Vena Cava</text>

                  {/* 2. Aorta Arch (Ox Red) */}
                  <path d="M 310 160 C 310 40 400 40 400 110 L 400 160" fill="none" stroke="#ef4444" strokeWidth="26" strokeLinecap="round" />
                  <path d="M 330 50 L 330 20 M 355 42 L 365 15 M 380 48 L 400 20" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                  <text x="360" y="15" fill="#f87171" className="text-[11px] font-black font-mono">Aortic Arch</text>

                  {/* 3. Pulmonary Artery Arch (Deox Blue) */}
                  <path d="M 270 160 C 270 70 200 80 140 100" fill="none" stroke="#3b82f6" strokeWidth="20" strokeLinecap="round" />
                  <text x="70" y="110" fill="#60a5fa" className="text-[10px] font-black font-mono">To Lungs (Pulmonary Artery)</text>

                  {/* 4. Pulmonary Veins (Ox Red) */}
                  <path d="M 460 140 L 380 160 M 460 170 L 380 180" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
                  <text x="470" y="155" fill="#f87171" className="text-[10px] font-black font-mono">From Lungs (Pulmonary Veins)</text>

                  {/* 5. Right Atrium Outer Wall */}
                  <path d="M 240 130 C 140 130 140 230 220 250 L 240 250 Z" fill="url(#deoxygenGrad)" stroke="#60a5fa" strokeWidth="3" />
                  
                  {/* 6. Right Ventricle Outer Wall */}
                  <path d="M 220 250 C 170 300 220 370 290 380 L 290 250 Z" fill="url(#deoxygenGrad)" stroke="#60a5fa" strokeWidth="3" />

                  {/* 7. Left Atrium Outer Wall */}
                  <path d="M 340 130 C 440 130 440 230 360 250 L 340 250 Z" fill="url(#oxygenGrad)" stroke="#f87171" strokeWidth="3" />

                  {/* 8. Left Ventricle Outer Wall (Thick Myocardium) */}
                  <path d="M 360 250 C 410 300 370 380 290 395 L 290 250 Z" fill="url(#oxygenGrad)" stroke="#f87171" strokeWidth="5" />

                  {/* 9. Central Interventricular Septum */}
                  <path d="M 285 130 L 285 390 L 295 390 L 295 130 Z" fill="url(#muscleGrad)" stroke="#475569" strokeWidth="2" />
                  <text x="290" y="270" textAnchor="middle" fill="#cbd5e1" className="text-[9px] font-bold">Interventricular Septum</text>

                  {/* 10. Valves (Tricuspid & Bicuspid) */}
                  <line x1="225" y1="248" x2="255" y2="248" stroke="#facc15" strokeWidth="4" strokeDasharray="3 2" />
                  <line x1="325" y1="248" x2="355" y2="248" stroke="#facc15" strokeWidth="4" strokeDasharray="3 2" />

                  {/* Chamber Annotations */}
                  <text x="180" y="190" fill="#bfdbfe" className="text-[12px] font-black">Right Atrium</text>
                  <text x="180" y="320" fill="#93c5fd" className="text-[12px] font-black">Right Ventricle</text>
                  <text x="350" y="190" fill="#fecaca" className="text-[12px] font-black">Left Atrium</text>
                  <text x="340" y="320" fill="#fca5a5" className="text-[12px] font-black">Left Ventricle</text>
                </motion.svg>

                {/* Hotspot Interactive Pins */}
                {HEART_HOTSPOTS.map((hs, idx) => {
                  const isSelected = activeHotspot.id === hs.id;
                  return (
                    <motion.button
                      key={hs.id}
                      onClick={() => setActiveHotspot(hs)}
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        position: "absolute",
                        left: `${hs.x}%`,
                        top: `${hs.y}%`,
                        transform: "translate(-50%, -50%)"
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shadow-2xl border-2 z-30 transition-all ${
                        isSelected
                          ? "bg-white text-slate-950 border-amber-400 ring-4 ring-amber-400/40"
                          : hs.oxygenated
                          ? "bg-rose-600 text-white border-rose-300"
                          : "bg-blue-600 text-white border-blue-300"
                      }`}
                      title={hs.name}
                    >
                      <span className="text-[10px] font-black">{idx + 1}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Bottom Real-time Telemetry & BPM Slider */}
              <div className="border-t border-white/10 pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Heart Rate:</span>
                    <span className="text-sm font-black font-mono text-rose-400">{heartBpm} BPM</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="160"
                    value={heartBpm}
                    onChange={(e) => setHeartBpm(parseInt(e.target.value))}
                    className="accent-rose-500 w-32"
                  />
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Deoxygenated Inflow
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Oxygenated Outflow
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Physiological & CBSE Board Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHotspot.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {activeHotspot.category}
                    </span>
                    <h3 className="text-lg font-black text-white">{activeHotspot.name}</h3>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border ${
                    activeHotspot.oxygenated
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                  }`}>
                    {activeHotspot.oxygenated ? "🔴 Oxygenated (Lungs → Body)" : "🔵 Deoxygenated (Body → Lungs)"}
                  </span>
                </div>

                {/* Role Description */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Anatomical Mechanism & Function:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeHotspot.role}
                  </p>
                </div>

                {/* CBSE Examiner Step Marks */}
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-black text-indigo-400 uppercase text-[10px] tracking-wide">
                    <ShieldCheck className="w-4 h-4" /> CBSE 5-Mark Diagram & Theory Key:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {activeHotspot.cbseTip}
                  </p>
                </div>

                {/* Double Circulation Summary */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Why Double Circulation is Essential:</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Blood travels through the heart twice during one complete cardiac cycle (Pulmonary circuit + Systemic circuit). Prevents oxygen-rich and oxygen-poor blood from ever mixing, maximizing cellular ATP efficiency.
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  LABORATORY 2: NEPHRON ULTRAFILTRATION & REABSORPTION UNIT    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {lab === "nephron" && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-950 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-black text-amber-400 flex items-center gap-2">
                  <Droplet className="w-4 h-4" /> Renal Excretory Unit: Glomerulus to Collecting Duct
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  GFR: <strong className="text-emerald-400">{calculateGfr()} mL/min</strong> (~180 L/day)
                </span>
              </div>

              {/* Nephron Detailed SVG Diagram */}
              <div className="relative w-full h-[360px] flex items-center justify-center select-none">
                <svg viewBox="0 0 600 380" className="w-full h-full">
                  {/* Cortex vs Medulla Background division */}
                  <rect x="0" y="0" width="600" height="150" fill="rgba(245, 158, 11, 0.05)" />
                  <rect x="0" y="150" width="600" height="230" fill="rgba(245, 158, 11, 0.12)" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#f59e0b" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" />
                  <text x="15" y="25" fill="#f59e0b" className="text-[10px] font-bold uppercase tracking-widest">Renal Cortex (300 mOsm/L)</text>
                  <text x="15" y="170" fill="#fbbf24" className="text-[10px] font-bold uppercase tracking-widest">Renal Medulla (Hypertonic: Up to 1200 mOsm/L)</text>

                  {/* Afferent / Efferent Arterioles */}
                  <path d="M 60 50 L 110 80" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />
                  <path d="M 110 80 L 150 45" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />

                  {/* Bowman's Capsule Cup */}
                  <path d="M 80 50 C 140 20 180 110 130 140 C 90 160 60 100 80 50 Z" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="4" />
                  {/* Glomerular Capillary Knot */}
                  <circle cx="115" cy="85" r="20" fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" strokeWidth="3" strokeDasharray="4 2" />

                  {/* Proximal Convoluted Tubule (PCT) */}
                  <path d="M 130 140 Q 200 170 230 100 T 290 145" fill="none" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Hairpin Loop of Henle (Descending -> Ascending) */}
                  <path d="M 290 145 L 290 320 C 290 360 350 360 350 320 L 350 140" fill="none" stroke="#eab308" strokeWidth="10" strokeLinecap="round" />

                  {/* Distal Convoluted Tubule (DCT) */}
                  <path d="M 350 140 Q 400 70 460 120" fill="none" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" />

                  {/* Collecting Duct Column */}
                  <line x1="460" y1="30" x2="460" y2="360" stroke="#ca8a04" strokeWidth="18" strokeLinecap="round" />

                  {/* Filtration Stream Animation Indicators */}
                  <circle cx="115" cy="115" r="4" fill="#38bdf8" className="animate-ping" />
                  <text x="115" y="115" fill="#38bdf8" textAnchor="middle" className="text-[8px] font-bold">Filtration</text>
                </svg>

                {/* Hotspot Pins */}
                {NEPHRON_HOTSPOTS.map((hs, idx) => {
                  const isSelected = activeHotspot.id === hs.id;
                  return (
                    <motion.button
                      key={hs.id}
                      onClick={() => setActiveHotspot(hs)}
                      whileHover={{ scale: 1.25 }}
                      style={{
                        position: "absolute",
                        left: `${hs.x}%`,
                        top: `${hs.y}%`,
                        transform: "translate(-50%, -50%)"
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shadow-2xl border-2 z-30 transition-all ${
                        isSelected
                          ? "bg-white text-slate-950 border-amber-400 ring-4 ring-amber-400/40"
                          : "bg-amber-600 text-white border-amber-300"
                      }`}
                      title={hs.name}
                    >
                      <span className="text-[10px] font-black">{idx + 1}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Nephron Interactive Parameter Controls */}
              <div className="border-t border-white/10 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">Systemic Blood Pressure:</span>
                    <span className="font-mono font-bold text-amber-400">{bloodPressure} mmHg</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="180"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <div className="text-[11px] font-bold text-white">ADH (Vasopressin) Hormone</div>
                    <div className="text-[9px] text-slate-400">Controls collecting duct water channels</div>
                  </div>
                  <button
                    onClick={() => setAdhHormoneActive(!adhHormoneActive)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      adhHormoneActive ? "bg-emerald-600 text-white" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {adhHormoneActive ? "ADH Active" : "ADH Low"}
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHotspot.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-5"
              >
                <div className="border-b border-white/10 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {activeHotspot.category}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">{activeHotspot.name}</h3>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Filtration & Transport Mechanism:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{activeHotspot.role}</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-black text-amber-400 uppercase text-[10px] tracking-wide">
                    <ShieldCheck className="w-4 h-4" /> CBSE Board Core Principle:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeHotspot.cbseTip}</p>
                </div>

                {/* Dialysis / Artificial Kidney Box */}
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                    <Activity className="w-3.5 h-3.5" /> Hemodialysis (Artificial Kidney) Note:
                  </span>
                  <p className="text-[11px] text-cyan-200/90 leading-relaxed">
                    Uses semi-permeable cellulose tubes bathed in dialysing fluid with identical osmotic pressure as blood, except it contains NO nitrogenous wastes (urea). Crucially: <strong>Hemodialysis involves filtration without reabsorption</strong>.
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  LABORATORY 3: VIRTUAL OPTICAL MICROSCOPE & CELL DISSECTION   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {lab === "microscope" && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-950 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
              
              {/* Microscope Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                  <button
                    onClick={() => setCellType("plant")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      cellType === "plant" ? "bg-emerald-600 text-white" : "text-slate-400"
                    }`}
                  >
                    🌱 Onion Peel (Plant Cell)
                  </button>
                  <button
                    onClick={() => setCellType("animal")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      cellType === "animal" ? "bg-indigo-600 text-white" : "text-slate-400"
                    }`}
                  >
                    🧬 Human Cheek (Animal Cell)
                  </button>
                </div>

                {/* Magnification Turret */}
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  {[10, 40, 100].map((mag) => (
                    <button
                      key={mag}
                      onClick={() => setMagnification(mag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                        magnification === mag ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {mag}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Microscope Circular Field of View */}
              <div className="relative w-[320px] h-[320px] mx-auto rounded-full border-8 border-slate-800 shadow-[inset_0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(99,102,241,0.2)] overflow-hidden flex items-center justify-center my-3 bg-black">
                {/* Visual blur layer driven by focus knob */}
                <div 
                  className="w-full h-full flex items-center justify-center transition-all duration-200"
                  style={{
                    filter: `blur(${Math.abs(focusKnob - 50) * 0.25}px) brightness(${illumination / 100})`,
                    transform: `scale(${magnification === 10 ? 1 : magnification === 40 ? 1.4 : 2.1})`
                  }}
                >
                  {cellType === "plant" ? (
                    /* Plant Cell Detailed Structure */
                    <svg viewBox="0 0 300 300" className="w-full h-full">
                      {/* Cell Wall (Stained or unstained) */}
                      <polygon
                        points="50,40 250,40 280,150 250,260 50,260 20,150"
                        fill={stain === "safranin" ? "rgba(244, 63, 94, 0.25)" : stain === "iodine" ? "rgba(180, 83, 9, 0.2)" : "rgba(16, 185, 129, 0.15)"}
                        stroke={stain === "safranin" ? "#f43f5e" : "#10b981"}
                        strokeWidth="8"
                      />
                      {/* Large Central Vacuole */}
                      <ellipse cx="160" cy="150" rx="70" ry="45" fill="rgba(6, 182, 212, 0.2)" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 3" />
                      <text x="160" y="154" textAnchor="middle" fill="#67e8f9" className="text-[9px] font-bold">Central Vacuole</text>

                      {/* Peripheral Nucleus (Pushed to side by vacuole) */}
                      <circle cx="85" cy="110" r="24" fill={stain === "methylene" ? "rgba(59, 130, 246, 0.7)" : "rgba(168, 85, 247, 0.4)"} stroke="#a855f7" strokeWidth="3" />
                      <circle cx="85" cy="110" r="8" fill="#a855f7" />

                      {/* Chloroplasts */}
                      <ellipse cx="220" cy="90" rx="16" ry="10" fill="#10b981" />
                      <ellipse cx="225" cy="210" rx="16" ry="10" fill="#10b981" />
                      <ellipse cx="90" cy="210" rx="16" ry="10" fill="#10b981" />
                    </svg>
                  ) : (
                    /* Animal Cell Detailed Structure */
                    <svg viewBox="0 0 300 300" className="w-full h-full">
                      {/* Flexible Plasma Membrane */}
                      <circle
                        cx="150"
                        cy="150"
                        r="115"
                        fill={stain === "methylene" ? "rgba(59, 130, 246, 0.15)" : "rgba(244, 63, 94, 0.1)"}
                        stroke={stain === "methylene" ? "#3b82f6" : "#f43f5e"}
                        strokeWidth="4"
                      />
                      {/* Central Large Nucleus */}
                      <circle cx="150" cy="150" r="38" fill={stain === "methylene" ? "rgba(59, 130, 246, 0.8)" : "rgba(168, 85, 247, 0.5)"} stroke="#a855f7" strokeWidth="3" />
                      <circle cx="150" cy="150" r="14" fill="#a855f7" />
                      <text x="150" y="205" textAnchor="middle" fill="#d8b4fe" className="text-[9px] font-bold">Nucleus & Chromatin</text>

                      {/* Mitochondria with Cristae */}
                      <ellipse cx="80" cy="110" rx="18" ry="10" fill="rgba(239, 68, 68, 0.6)" stroke="#ef4444" strokeWidth="1.5" />
                      <ellipse cx="220" cy="180" rx="18" ry="10" fill="rgba(239, 68, 68, 0.6)" stroke="#ef4444" strokeWidth="1.5" />

                      {/* Centrosome */}
                      <circle cx="190" cy="100" r="8" fill="#f59e0b" />
                    </svg>
                  )}
                </div>

                {/* Crosshairs */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                  <div className="w-full h-[1px] bg-white/40" />
                  <div className="h-full w-[1px] bg-white/40 absolute" />
                </div>
              </div>

              {/* Optical Knobs & Staining Tray */}
              <div className="border-t border-white/10 pt-3 grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">Coarse / Fine Focus Knob:</span>
                    <span className={`font-mono font-bold ${Math.abs(focusKnob - 50) < 5 ? "text-emerald-400" : "text-rose-400"}`}>
                      {Math.abs(focusKnob - 50) < 5 ? "In Sharp Focus ✓" : "Out of Focus"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={focusKnob}
                    onChange={(e) => setFocusKnob(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Staining Droppers */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Histological Stains:</span>
                  <div className="flex gap-1.5">
                    {[
                      { id: "none", label: "No Stain" },
                      { id: "methylene", label: "Methylene Blue" },
                      { id: "iodine", label: "Iodine" },
                      { id: "safranin", label: "Safranin" }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStain(s.id as any)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                          stain === s.id
                            ? "bg-indigo-600 text-white border-indigo-500"
                            : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-5">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Comparative Cytology
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {cellType === "plant" ? "Plant Cell Architecture" : "Animal Cell Architecture"}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <span className="text-slate-400">Cell Wall:</span>
                  <span className="font-bold text-white">
                    {cellType === "plant" ? "Present (Cellulose)" : "Absent"}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <span className="text-slate-400">Chloroplasts / Plastids:</span>
                  <span className="font-bold text-white">
                    {cellType === "plant" ? "Present (Photosynthesis)" : "Absent"}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <span className="text-slate-400">Vacuole:</span>
                  <span className="font-bold text-white">
                    {cellType === "plant" ? "Large & Permanent (Central)" : "Small & Temporary"}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <span className="text-slate-400">Nucleus Position:</span>
                  <span className="font-bold text-white">
                    {cellType === "plant" ? "Peripheral (Pushed to edge)" : "Centric"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
                <div className="flex items-center gap-1.5 font-black text-emerald-400 uppercase text-[10px] tracking-wide">
                  <ShieldCheck className="w-4 h-4" /> CBSE Practical Exam Key:
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When preparing a temporary mount of an onion peel or cheek cell, always mount in <strong>Glycerine</strong> to prevent drying out and use <strong>Safranin / Methylene Blue</strong> to clearly contrast nucleus chromatin.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  LABORATORY 4: STOMATA & TRANSPIRATION TURGOR LAB             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {lab === "stomata" && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-950 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-2">
                  <Wind className="w-4 h-4" /> Stomatal Aperture & Guard Cell Turgor Pressure
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  Status: <strong className={isStomaOpen ? "text-emerald-400" : "text-rose-400"}>
                    {isStomaOpen ? "Stoma OPEN (Gas Exchange Active)" : "Stoma CLOSED (Water Conserved)"}
                  </strong>
                </span>
              </div>

              {/* Interactive Stomata Vector Animation */}
              <div className="relative w-[340px] h-[300px] mx-auto flex items-center justify-center my-4 select-none">
                <svg viewBox="0 0 400 320" className="w-full h-full">
                  {/* Epidermal Cells around Stomata */}
                  <rect x="20" y="20" width="360" height="280" rx="30" fill="rgba(16, 185, 129, 0.05)" stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" />

                  {/* Left Kidney Guard Cell */}
                  <motion.path
                    d={isStomaOpen 
                      ? "M 170 60 C 90 90 90 230 170 260 C 140 220 140 100 170 60 Z" 
                      : "M 195 60 C 130 90 130 230 195 260 C 185 220 185 100 195 60 Z"}
                    fill="#10b981"
                    stroke="#047857"
                    strokeWidth="4"
                    animate={{ scale: isStomaOpen ? 1.05 : 0.95 }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Right Kidney Guard Cell */}
                  <motion.path
                    d={isStomaOpen 
                      ? "M 230 60 C 310 90 310 230 230 260 C 260 220 260 100 230 60 Z" 
                      : "M 205 60 C 270 90 270 230 205 260 C 215 220 215 100 205 60 Z"}
                    fill="#10b981"
                    stroke="#047857"
                    strokeWidth="4"
                    animate={{ scale: isStomaOpen ? 1.05 : 0.95 }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Stomatal Pore Aperture */}
                  {isStomaOpen && (
                    <ellipse cx="200" cy="160" rx="22" ry="60" fill="#090d16" stroke="#047857" strokeWidth="3" />
                  )}

                  {/* Chloroplasts inside Guard Cells */}
                  <circle cx="130" cy="120" r="6" fill="#047857" />
                  <circle cx="130" cy="190" r="6" fill="#047857" />
                  <circle cx="270" cy="120" r="6" fill="#047857" />
                  <circle cx="270" cy="190" r="6" fill="#047857" />

                  {/* Guard Cell Nuclei */}
                  <circle cx="145" cy="160" r="10" fill="#a855f7" />
                  <circle cx="255" cy="160" r="10" fill="#a855f7" />

                  <text x="200" y="295" textAnchor="middle" fill="#6ee7b7" className="text-[10px] font-bold">
                    {isStomaOpen ? "Turgid (Water in via Endosmosis)" : "Flaccid (Water out via Exosmosis)"}
                  </text>
                </svg>
              </div>

              {/* Turgor Toggle & Environmental Conditions */}
              <div className="border-t border-white/10 pt-3 grid sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <div className="text-xs font-bold text-white">Guard Cell Turgidity</div>
                    <div className="text-[9px] text-slate-400">Simulate K+ and Water Osmosis</div>
                  </div>
                  <button
                    onClick={() => setIsStomaOpen(!isStomaOpen)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                      isStomaOpen ? "bg-emerald-600 text-white shadow-md" : "bg-rose-600 text-white shadow-md"
                    }`}
                  >
                    {isStomaOpen ? "Close Stoma" : "Open Stoma"}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">Photosynthetic Rate:</span>
                    <span className="font-mono font-bold text-emerald-400">{isStomaOpen ? calculatePhotosynthesisRate() : 0}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${isStomaOpen ? calculatePhotosynthesisRate() : 0}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-5">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Plant Physiology Core
                </span>
                <h3 className="text-lg font-black text-white mt-1">Stomatal Opening & Closing Mechanism</h3>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-200">
                <span className="font-bold text-emerald-400 block">Step-by-Step Turgor Mechanism:</span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>In daylight, Potassium ions (K+) are actively transported into Guard cells.</li>
                  <li>Internal osmotic potential decreases, causing water to rush into guard cells via <strong>Endosmosis</strong>.</li>
                  <li>Guard cells swell. The thin outer wall expands outward while the thick, elastic inner wall curves, opening the stomatal pore.</li>
                  <li>In darkness/drought, water leaves via <strong>Exosmosis</strong>; cells become flaccid and the pore snaps shut.</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-1.5">
                <div className="flex items-center gap-1.5 font-black text-indigo-400 uppercase text-[10px] tracking-wide">
                  <ShieldCheck className="w-4 h-4" /> CBSE Board Exam Note:
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Transpiration creates a <strong>transpiration pull (suction force)</strong> in xylem vessels which pulls water and dissolved minerals from roots up to leaves in tall trees (Ascent of Sap).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/*  BIOLOGY DIAGRAM MASTERY & ACTIVE RECALL CHALLENGE             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-indigo-950/40 border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl">
            🏆
          </div>
          <div>
            <h3 className="text-base font-black text-white">Class 10 Biology 5-Mark Mastery Challenge</h3>
            <p className="text-xs text-slate-400">Complete the quick diagram identification to claim +50 XP!</p>
          </div>
        </div>

        <button
          onClick={handleClaimQuiz}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" /> Claim Mastery (+50 XP)
        </button>
      </div>
    </div>
  );
}
