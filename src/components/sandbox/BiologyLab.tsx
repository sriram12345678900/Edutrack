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

type LabSpecimen = "heart" | "nephron" | "microscope" | "stomata" | "photosynthesis";
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Nephron Simulator States
  const [bloodPressure, setBloodPressure] = useState<number>(120);
  const [adhHormoneActive, setAdhHormoneActive] = useState<boolean>(true);
  const [glucoseFilterActive, setGlucoseFilterActive] = useState<boolean>(true);
  const [glucoseOverload, setGlucoseOverload] = useState<boolean>(false);

  // Microscope Simulator States
  const [cellType, setCellType] = useState<CellType>("plant");
  const [stain, setStain] = useState<StainType>("none");
  const [magnification, setMagnification] = useState<number>(40);
  const [focusKnob, setFocusKnob] = useState<number>(50); // 50 = perfect focus
  const [illumination, setIllumination] = useState<number>(85);
  const [selectedOrganelle, setSelectedOrganelle] = useState<string | null>(null);

  // Stomata Simulator States
  const [isStomaOpen, setIsStomaOpen] = useState<boolean>(true);
  const [lightLux, setLightLux] = useState<number>(75);
  const [co2Ppm, setCo2Ppm] = useState<number>(420);
  const [temperature, setTemperature] = useState<number>(25);
  const [windSpeed, setWindSpeed] = useState<number>(3);

  // Photosynthesis Simulator States
  const [photoLightWavelength, setPhotoLightWavelength] = useState<"white" | "red" | "blue" | "green">("white");
  const [photoLightIntensity, setPhotoLightIntensity] = useState<number>(100);
  const [photoCo2, setPhotoCo2] = useState<number>(400);
  const [photoTemp, setPhotoTemp] = useState<number>(25);
  const [starchTestBoiled, setStarchTestBoiled] = useState<boolean>(false);
  const [starchTestIodineAdded, setStarchTestIodineAdded] = useState<boolean>(false);

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

  const playSynthSound = (frequency: number, duration: number, type: OscillatorType = "sine") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
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

  // EKG Canvas Rendering Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;
    const points: number[] = new Array(width).fill(centerY);

    const render = () => {
      const beatDurationMs = (60 / heartBpm) * 1000;
      const now = Date.now();
      const cycleTime = now % beatDurationMs;
      const t = cycleTime / beatDurationMs; // 0 to 1

      // Calculate ECG amplitude at phase t
      let amp = 0;
      if (t >= 0.05 && t < 0.15) {
        // P Wave (atrial depolarization)
        amp = 0.12 * Math.sin(((t - 0.05) / 0.1) * Math.PI);
      } else if (t >= 0.19 && t < 0.21) {
        // Q Wave
        amp = -0.1 * Math.sin(((t - 0.19) / 0.02) * Math.PI);
      } else if (t >= 0.21 && t < 0.25) {
        // R Wave (ventricular depolarization peak)
        amp = 0.95 * Math.sin(((t - 0.21) / 0.04) * Math.PI);
      } else if (t >= 0.25 && t < 0.27) {
        // S Wave
        amp = -0.22 * Math.sin(((t - 0.25) / 0.02) * Math.PI);
      } else if (t >= 0.35 && t < 0.5) {
        // T Wave (ventricular repolarization)
        amp = 0.25 * Math.sin(((t - 0.35) / 0.15) * Math.PI);
      }

      const yVal = centerY - amp * (height * 0.38);

      points.push(yVal);
      if (points.length > width) {
        points.shift();
      }

      // Draw dark background
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, width, height);

      // Draw faint medical grid lines
      ctx.strokeStyle = "rgba(16, 185, 129, 0.06)";
      ctx.lineWidth = 1;
      for (let gX = 0; gX < width; gX += 20) {
        ctx.beginPath();
        ctx.moveTo(gX, 0);
        ctx.lineTo(gX, height);
        ctx.stroke();
      }
      for (let gY = 0; gY < height; gY += 20) {
        ctx.beginPath();
        ctx.moveTo(0, gY);
        ctx.lineTo(width, gY);
        ctx.stroke();
      }

      // Draw EKG green wave line
      ctx.strokeStyle = "#10b981";
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 3;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, points[0]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(i, points[i]);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      animationId = requestAnimationFrame(render);
    };

    if (isCardiacBeating) {
      render();
    } else {
      // Flatline
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.06)";
      ctx.lineWidth = 1;
      for (let gX = 0; gX < width; gX += 20) {
        ctx.beginPath();
        ctx.moveTo(gX, 0);
        ctx.lineTo(gX, height);
        ctx.stroke();
      }
      for (let gY = 0; gY < height; gY += 20) {
        ctx.beginPath();
        ctx.moveTo(0, gY);
        ctx.lineTo(width, gY);
        ctx.stroke();
      }

      ctx.strokeStyle = "#ef4444"; // Red flatline
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
    }

    return () => cancelAnimationFrame(animationId);
  }, [heartBpm, isCardiacBeating]);

  const handleSelectLab = (selected: LabSpecimen) => {
    setLab(selected);
    setSelectedOrganelle(null);
    if (selected === "heart") setActiveHotspot(HEART_HOTSPOTS[0]);
    else if (selected === "nephron") setActiveHotspot(NEPHRON_HOTSPOTS[0]);
  };

  const getOrganelleDetails = (cell: CellType, id: string) => {
    if (cell === "plant") {
      switch (id) {
        case "cell_wall":
          return {
            name: "Cell Wall",
            category: "Structure",
            functionText: "A rigid, protective outer layer made of cellulose. It provides structural support, shapes the plant cell, and maintains turgidity.",
            cbseTip: "High-Yield Board Question: Exclusive to plants, fungi, and bacteria. The cell wall prevents cell lysis (bursting) when placed in a hypotonic solution by exerting an equal counter-pressure (wall pressure) against turgor pressure.",
          };
        case "vacuole":
          return {
            name: "Large Central Vacuole",
            category: "Osmoregulation & Storage",
            functionText: "Occupies up to 90% of the cell volume, filled with cell sap. It stores salts, sugars, amino acids, and metabolic wastes while maintaining the cell's turgidity.",
            cbseTip: "Anatomical Difference: Because of its massive size, it pushes the cytoplasm and nucleus to the peripheral edge. Animal cells either lack vacuoles or have small, temporary ones.",
          };
        case "nucleus":
          return {
            name: "Nucleus (Peripheral)",
            category: "Genetic Control Center",
            functionText: "The coordinate center containing chromosomes and genetic DNA. It controls cell metabolism, protein synthesis, and division.",
            cbseTip: "Practical Exam Note: Stains heavily with Iodine/Safranin, making it stand out as a dark circular body pushed against the cell wall boundary.",
          };
        case "chloroplast":
          return {
            name: "Chloroplast (Plastid)",
            category: "Photosynthesis Site",
            functionText: "Double-membraned organelle containing green pigment Chlorophyll. It traps solar energy to synthesize glucose from CO2 and H2O.",
            cbseTip: "Board Key point: Only found in photosynthetic plant tissues. Contains its own DNA and 70S ribosomes (semi-autonomous). Colored plastids are chromoplasts; white/colorless starch-storing ones are leucoplasts.",
          };
        default:
          return null;
      }
    } else {
      switch (id) {
        case "plasma_membrane":
          return {
            name: "Plasma Membrane",
            category: "Selectively Permeable Barrier",
            functionText: "A flexible, dynamic phospholipid bilayer that controls the selective entry and exit of ions, water, and nutrients.",
            cbseTip: "Active/Passive Transport: Controls osmosis (diffusion of water). When placed in hypertonic saline, animal cells undergo crenation (shriveling) due to lack of a protective cell wall.",
          };
        case "nucleus":
          return {
            name: "Nucleus (Centric)",
            category: "Cellular Command Center",
            functionText: "Houses genetic information in chromatin fibers. Orchestrates all physiological activities of the animal cell.",
            cbseTip: "Staining Tip: Stained with Methylene Blue. Appears centrally located (centric) since there is no massive central vacuole to displace it.",
          };
        case "mitochondria":
          return {
            name: "Mitochondria - 'Powerhouse'",
            category: "ATP Synthesis",
            functionText: "Sites of aerobic respiration. Contains inner membrane folds (cristae) to maximize the surface area for oxidative phosphorylation.",
            cbseTip: "Energy Currency: Synthesizes ATP (Adenosine Triphosphate), which the cell uses to perform work. Like chloroplasts, it contains its own circular DNA and ribosomes.",
          };
        case "centrosome":
          return {
            name: "Centrosome & Centrioles",
            category: "Spindle Organization",
            functionText: "Located near the nucleus, organizing microtubules that form spindle fibers during cell division to separate chromosomes.",
            cbseTip: "Cytological Detail: Present in animal cells to direct cell cleavage, but absent in plant cells, which use polar caps to organize cell division.",
          };
        default:
          return null;
      }
    }
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

  const calculateTranspirationRate = () => {
    if (!isStomaOpen) return 3; // Minimal cuticular transpiration
    // Scales with light, temperature, and wind speed
    const tempFactor = Math.max(0.4, (temperature - 5) / 25); // 0.4 at 15C, 1.6 at 45C
    const windFactor = 1 + windSpeed / 10; // 1 at 0m/s, 2.2 at 12m/s
    const lightFactor = 0.5 + (lightLux / 200); // 0.5 at 0lux, 1.0 at 100lux
    const rate = Math.round(22 * tempFactor * windFactor * lightFactor);
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
          <button
            onClick={() => handleSelectLab("photosynthesis")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              lab === "photosynthesis" ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-300" /> ☀️ Photosynthesis
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

                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes flow-reverse {
                      to {
                        stroke-dashoffset: 28;
                      }
                    }
                    .flow-blue {
                      stroke-dasharray: 6 8;
                      animation: flow-reverse 1.2s linear infinite;
                    }
                    .flow-red {
                      stroke-dasharray: 6 8;
                      animation: flow-reverse 1.2s linear infinite;
                    }
                  `}} />

                  {/* 1. Superior & Inferior Vena Cava (Deox Blue) */}
                  <path d="M 170 30 L 170 140 M 170 280 L 170 360" stroke="#3b82f6" strokeWidth="22" strokeLinecap="round" />
                  <path d="M 170 30 L 170 140" stroke="#bfdbfe" strokeWidth="3" strokeLinecap="round" className="flow-blue" />
                  <path d="M 170 360 L 170 280" stroke="#bfdbfe" strokeWidth="3" strokeLinecap="round" className="flow-blue" />
                  <text x="110" y="55" fill="#60a5fa" className="text-[10px] font-black font-mono">Superior Vena Cava</text>
                  <text x="110" y="380" fill="#60a5fa" className="text-[10px] font-black font-mono">Inferior Vena Cava</text>

                  {/* 2. Aorta Arch (Ox Red) */}
                  <path d="M 310 160 C 310 40 400 40 400 110 L 400 160" fill="none" stroke="#ef4444" strokeWidth="26" strokeLinecap="round" />
                  <path d="M 310 160 C 310 40 400 40 400 110 L 400 160" fill="none" stroke="#fecaca" strokeWidth="3" strokeLinecap="round" className="flow-red" />
                  <path d="M 330 50 L 330 20 M 355 42 L 365 15 M 380 48 L 400 20" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                  <text x="360" y="15" fill="#f87171" className="text-[11px] font-black font-mono">Aortic Arch</text>

                  {/* 3. Pulmonary Artery Arch (Deox Blue) */}
                  <path d="M 270 160 C 270 70 200 80 140 100" fill="none" stroke="#3b82f6" strokeWidth="20" strokeLinecap="round" />
                  <path d="M 270 160 C 270 70 200 80 140 100" fill="none" stroke="#bfdbfe" strokeWidth="3" strokeLinecap="round" className="flow-blue" />
                  <text x="70" y="110" fill="#60a5fa" className="text-[10px] font-black font-mono">To Lungs (Pulmonary Artery)</text>

                  {/* 4. Pulmonary Veins (Ox Red) */}
                  <path d="M 460 140 L 380 160 M 460 170 L 380 180" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 460 140 L 380 160" stroke="#fecaca" strokeWidth="2.5" strokeLinecap="round" className="flow-red" />
                  <path d="M 460 170 L 380 180" stroke="#fecaca" strokeWidth="2.5" strokeLinecap="round" className="flow-red" />
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

              {/* Dynamic Cardiac Cycle Phase Details */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs my-2">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block mb-0.5">Active Cardiac Cycle Phase:</span>
                  <span className={`font-extrabold text-xs px-2 py-0.5 rounded ${cardiacCyclePhase === 'systole' ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'}`}>
                    {cardiacCyclePhase === "systole" 
                      ? "Systole (Atrial & Ventricular Contraction)" 
                      : "Joint Diastole (Relaxation & Filling)"}
                  </span>
                </div>
                <div className="text-slate-350 text-[10px] leading-relaxed max-w-full sm:max-w-[65%]">
                  {cardiacCyclePhase === "systole" 
                    ? "AV valves snap shut (LUB sound) preventing backflow, while ventricles contract forcefully to pump blood into Aorta & Pulmonary Artery." 
                    : "Semilunar valves snap shut (DUB sound) preventing reflux, while all four chambers relax to receive blood from body & lungs."}
                </div>
              </div>

              {/* Real-time ECG/EKG Monitor */}
              <div className="space-y-1.5 mb-2">
                <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isCardiacBeating ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    Physiological ECG Monitor (Electrocardiogram)
                  </span>
                  <span className={isCardiacBeating ? 'text-emerald-400' : 'text-red-400'}>
                    {isCardiacBeating ? 'ACTIVE MONITORING' : 'HEART STOPPED / FLATLINE'}
                  </span>
                </div>
                <canvas ref={canvasRef} width={600} height={90} className="w-full h-[90px] rounded-2xl bg-slate-950 border border-white/10 shadow-inner block" />
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
              <div className="border-t border-white/10 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Blood Pressure Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-slate-400">Blood Pressure:</span>
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

                {/* ADH Hormone Toggle */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <div className="text-[11px] font-bold text-white">ADH (Vasopressin)</div>
                    <div className="text-[9px] text-slate-400">Water reabsorption</div>
                  </div>
                  <button
                    onClick={() => setAdhHormoneActive(!adhHormoneActive)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                      adhHormoneActive ? "bg-emerald-600 text-white" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {adhHormoneActive ? "Active" : "Low"}
                  </button>
                </div>

                {/* Glucose Overload Toggle */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <div className="text-[11px] font-bold text-white">Glucose Load</div>
                    <div className="text-[9px] text-slate-400">Diabetes Sim</div>
                  </div>
                  <button
                    onClick={() => setGlucoseOverload(!glucoseOverload)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                      glucoseOverload ? "bg-red-650 text-white animate-pulse border border-red-500" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {glucoseOverload ? "Overload" : "Normal"}
                  </button>
                </div>
              </div>

              {/* Real-time Filtrate Composition Analyzer Table */}
              <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> Real-time Nephron Filtrate Composition Analyzer
                  </span>
                  {glucoseOverload && (
                    <span className="text-[9px] font-black uppercase bg-red-950 text-red-300 px-2 py-0.5 rounded animate-pulse border border-red-500/30">
                      ⚠️ Glucosuria Detected (Diabetes Sim)
                    </span>
                  )}
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-bold">
                        <th className="p-2">Segment</th>
                        <th className="p-2 text-center">Proteins</th>
                        <th className="p-2 text-center">Glucose</th>
                        <th className="p-2 text-center">Amino Acids</th>
                        <th className="p-2 text-center">Salts</th>
                        <th className="p-2 text-center">Urea</th>
                        <th className="p-2 text-center">Water</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-350 font-mono">
                      {/* Row 1: Bowman's Capsule */}
                      <tr>
                        <td className="p-2 font-sans font-bold text-white">Bowman's Cap.</td>
                        <td className="p-2 text-center text-slate-500">0%</td>
                        <td className="p-2 text-center text-amber-400">{glucoseOverload ? "300 mg/dL" : "90 mg/dL"}</td>
                        <td className="p-2 text-center text-emerald-400 font-bold">100%</td>
                        <td className="p-2 text-center text-blue-400">100%</td>
                        <td className="p-2 text-center text-yellow-400">Normal</td>
                        <td className="p-2 text-center text-blue-400">100%</td>
                      </tr>
                      {/* Row 2: PCT */}
                      <tr>
                        <td className="p-2 font-sans font-bold text-white">PCT</td>
                        <td className="p-2 text-center text-slate-500">0%</td>
                        <td className={`p-2 text-center ${glucoseOverload ? "text-red-400 font-bold" : "text-emerald-400"}`}>
                          {glucoseOverload ? "150 mg/dL" : "0% (Reabsorbed)"}
                        </td>
                        <td className="p-2 text-center text-emerald-400">0% (Reabsorbed)</td>
                        <td className="p-2 text-center text-blue-400">30%</td>
                        <td className="p-2 text-center text-yellow-400">Normal</td>
                        <td className="p-2 text-center text-blue-400">30%</td>
                      </tr>
                      {/* Row 3: Descending Loop */}
                      <tr>
                        <td className="p-2 font-sans font-bold text-white">Desc. Loop</td>
                        <td className="p-2 text-center text-slate-500">0%</td>
                        <td className={`p-2 text-center ${glucoseOverload ? "text-red-400 font-bold" : "text-slate-500"}`}>
                          {glucoseOverload ? "150 mg/dL" : "0%"}
                        </td>
                        <td className="p-2 text-center text-slate-500">0%</td>
                        <td className="p-2 text-center text-blue-400 font-bold">30% (Concentrated)</td>
                        <td className="p-2 text-center text-yellow-400">Elevated</td>
                        <td className="p-2 text-center text-blue-400">10%</td>
                      </tr>
                      {/* Row 4: Ascending Loop */}
                      <tr>
                        <td className="p-2 font-sans font-bold text-white">Asc. Loop</td>
                        <td className="p-2 text-center text-slate-500">0%</td>
                        <td className={`p-2 text-center ${glucoseOverload ? "text-red-400 font-bold" : "text-slate-500"}`}>
                          {glucoseOverload ? "150 mg/dL" : "0%"}
                        </td>
                        <td className="p-2 text-center text-slate-500">0%</td>
                        <td className="p-2 text-center text-blue-400">5% (Diluted)</td>
                        <td className="p-2 text-center text-yellow-400 font-bold">Elevated</td>
                        <td className="p-2 text-center text-blue-400">10%</td>
                      </tr>
                      {/* Row 5: DCT */}
                      <tr>
                        <td className="p-2 font-sans font-bold text-white">DCT</td>
                        <td className="p-2 text-center text-slate-500">0%</td>
                        <td className={`p-2 text-center ${glucoseOverload ? "text-red-400 font-bold" : "text-slate-500"}`}>
                          {glucoseOverload ? "150 mg/dL" : "0%"}
                        </td>
                        <td className="p-2 text-center text-slate-500">0%</td>
                        <td className="p-2 text-center text-blue-400">4%</td>
                        <td className="p-2 text-center text-yellow-400 font-bold">Elevated</td>
                        <td className="p-2 text-center text-blue-400">8%</td>
                      </tr>
                      {/* Row 6: Collecting Duct (Urine) */}
                      <tr className="bg-white/5 font-extrabold">
                        <td className="p-2 font-sans text-amber-400">Urine Output</td>
                        <td className="p-2 text-center text-slate-500">0% (Healthy)</td>
                        <td className={`p-2 text-center ${glucoseOverload ? "text-red-500 font-black animate-pulse" : "text-emerald-450"}`}>
                          {glucoseOverload ? "150 mg/dL (Glucosuria)" : "0% (Healthy)"}
                        </td>
                        <td className="p-2 text-center text-emerald-400">0% (Healthy)</td>
                        <td className="p-2 text-center text-blue-400">{adhHormoneActive ? "3% (Normal)" : "1% (Diluted)"}</td>
                        <td className="p-2 text-center text-yellow-500">HIGH (Concentrated)</td>
                        <td className={`p-2 text-center ${adhHormoneActive ? "text-blue-400" : "text-blue-500 font-black"}`}>
                          {adhHormoneActive ? "1% (Concentrated)" : "12% (Excessive Output)"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="text-[9px] text-slate-450 italic leading-tight">
                  Note: Healthy kidneys selectively reabsorb 100% of glucose and amino acids in the PCT. Under ADH action, water channels open in the collecting duct to reabsorb 99% of water, making urine highly concentrated.
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
                    onClick={() => { setCellType("plant"); setSelectedOrganelle(null); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      cellType === "plant" ? "bg-emerald-600 text-white" : "text-slate-400"
                    }`}
                  >
                    🌱 Onion Peel (Plant Cell)
                  </button>
                  <button
                    onClick={() => { setCellType("animal"); setSelectedOrganelle(null); }}
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
                        stroke={selectedOrganelle === "cell_wall" ? "#fbbf24" : stain === "safranin" ? "#f43f5e" : "#10b981"}
                        strokeWidth={selectedOrganelle === "cell_wall" ? "10" : "7"}
                        className="cursor-pointer hover:stroke-amber-450 transition-all"
                        onClick={() => setSelectedOrganelle("cell_wall")}
                      />
                      {/* Large Central Vacuole */}
                      <g className="cursor-pointer group" onClick={() => setSelectedOrganelle("vacuole")}>
                        <ellipse 
                          cx="160" cy="150" rx="70" ry="45" 
                          fill={selectedOrganelle === "vacuole" ? "rgba(6, 182, 212, 0.35)" : "rgba(6, 182, 212, 0.2)"} 
                          stroke={selectedOrganelle === "vacuole" ? "#fbbf24" : "#06b6d4"} 
                          strokeWidth="2" strokeDasharray="3 3" 
                          className="group-hover:fill-cyan-500/25 transition-all" 
                        />
                        <text x="160" y="153" textAnchor="middle" fill="#67e8f9" className="text-[8px] font-black group-hover:fill-white">Central Vacuole</text>
                      </g>

                      {/* Peripheral Nucleus (Pushed to side by vacuole) */}
                      <g className="cursor-pointer group" onClick={() => setSelectedOrganelle("nucleus")}>
                        <circle 
                          cx="85" cy="110" r="24" 
                          fill={stain === "methylene" ? "rgba(59, 130, 246, 0.7)" : "rgba(168, 85, 247, 0.4)"} 
                          stroke={selectedOrganelle === "nucleus" ? "#fbbf24" : "#a855f7"} 
                          strokeWidth={selectedOrganelle === "nucleus" ? "4.5" : "2.5"} 
                          className="group-hover:stroke-purple-300 transition-all" 
                        />
                        <circle cx="85" cy="110" r="8" fill="#a855f7" />
                      </g>

                      {/* Chloroplasts */}
                      <g className="cursor-pointer group" onClick={() => setSelectedOrganelle("chloroplast")}>
                        <ellipse cx="220" cy="90" rx="16" ry="10" fill="#10b981" stroke={selectedOrganelle === "chloroplast" ? "#fbbf24" : "none"} strokeWidth="2.5" className="group-hover:fill-emerald-400 transition-all" />
                        <ellipse cx="225" cy="210" rx="16" ry="10" fill="#10b981" stroke={selectedOrganelle === "chloroplast" ? "#fbbf24" : "none"} strokeWidth="2.5" className="group-hover:fill-emerald-400 transition-all" />
                        <ellipse cx="90" cy="210" rx="16" ry="10" fill="#10b981" stroke={selectedOrganelle === "chloroplast" ? "#fbbf24" : "none"} strokeWidth="2.5" className="group-hover:fill-emerald-400 transition-all" />
                      </g>
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
                        stroke={selectedOrganelle === "plasma_membrane" ? "#fbbf24" : stain === "methylene" ? "#3b82f6" : "#f43f5e"}
                        strokeWidth={selectedOrganelle === "plasma_membrane" ? "7" : "3.5"}
                        className="cursor-pointer hover:stroke-amber-450 transition-all"
                        onClick={() => setSelectedOrganelle("plasma_membrane")}
                      />
                      {/* Central Large Nucleus */}
                      <g className="cursor-pointer group" onClick={() => setSelectedOrganelle("nucleus")}>
                        <circle 
                          cx="150" cy="150" r="38" 
                          fill={stain === "methylene" ? "rgba(59, 130, 246, 0.8)" : "rgba(168, 85, 247, 0.5)"} 
                          stroke={selectedOrganelle === "nucleus" ? "#fbbf24" : "#a855f7"} 
                          strokeWidth={selectedOrganelle === "nucleus" ? "4.5" : "2.5"} 
                          className="group-hover:stroke-purple-300 transition-all" 
                        />
                        <circle cx="150" cy="150" r="14" fill="#a855f7" />
                        <text x="150" y="204" textAnchor="middle" fill="#d8b4fe" className="text-[8px] font-black group-hover:fill-white">Nucleus & Chromatin</text>
                      </g>

                      {/* Mitochondria with Cristae */}
                      <g className="cursor-pointer group" onClick={() => setSelectedOrganelle("mitochondria")}>
                        <ellipse cx="80" cy="110" rx="18" ry="10" fill="rgba(239, 68, 68, 0.6)" stroke={selectedOrganelle === "mitochondria" ? "#fbbf24" : "#ef4444"} strokeWidth={selectedOrganelle === "mitochondria" ? "2.5" : "1"} className="group-hover:fill-rose-500 transition-all" />
                        <ellipse cx="220" cy="180" rx="18" ry="10" fill="rgba(239, 68, 68, 0.6)" stroke={selectedOrganelle === "mitochondria" ? "#fbbf24" : "#ef4444"} strokeWidth={selectedOrganelle === "mitochondria" ? "2.5" : "1"} className="group-hover:fill-rose-500 transition-all" />
                      </g>

                      {/* Centrosome */}
                      <g className="cursor-pointer group" onClick={() => setSelectedOrganelle("centrosome")}>
                        <circle cx="190" cy="100" r="8" fill="#f59e0b" stroke={selectedOrganelle === "centrosome" ? "#fbbf24" : "none"} strokeWidth="2.5" className="group-hover:fill-amber-400 transition-all" />
                      </g>
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
            {selectedOrganelle && getOrganelleDetails(cellType, selectedOrganelle) ? (
              // Selected Organelle Details
              (() => {
                const details = getOrganelleDetails(cellType, selectedOrganelle)!;
                return (
                  <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-5">
                    <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {details.category}
                        </span>
                        <h3 className="text-lg font-black text-white mt-1">
                          {details.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedOrganelle(null)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-350 text-[10px] font-bold transition-all"
                      >
                        ← Back to Table
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Structure & Function:
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {details.functionText}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-black text-amber-400 uppercase text-[10px] tracking-wide">
                        <ShieldCheck className="w-4 h-4" /> CBSE Syllabus Focus:
                      </div>
                      <p className="text-xs text-slate-305 leading-relaxed font-sans">
                        {details.cbseTip}
                      </p>
                    </div>
                    
                    <div className="text-[10px] text-slate-500 italic text-center pt-2">
                      💡 Click on other cell structures in the eyepiece to view their details.
                    </div>
                  </div>
                );
              })()
            ) : (
              // Standard Comparative Cytology Table
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
                
                <div className="text-[10px] text-slate-500 italic text-center pt-2">
                  💡 Hint: Click on organelles inside the microscope eyepiece to dissect them!
                </div>
              </div>
            )}
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
              <div className="border-t border-white/10 pt-3 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Guard Cell Turgidity Controller */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="text-[11px] font-bold text-white">Stomatal Pore</div>
                      <div className="text-[9px] text-slate-400">Osmotic turgidity</div>
                    </div>
                    <button
                      onClick={() => setIsStomaOpen(!isStomaOpen)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                        isStomaOpen ? "bg-emerald-600 text-white shadow-md" : "bg-rose-600 text-white shadow-md"
                      }`}
                    >
                      {isStomaOpen ? "Open" : "Closed"}
                    </button>
                  </div>

                  {/* Temperature Slider */}
                  <div className="space-y-1 p-2 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-slate-400">Air Temp:</span>
                      <span className="font-mono font-bold text-emerald-400">{temperature}°C</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="45"
                      value={temperature}
                      onChange={(e) => setTemperature(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  {/* Wind Speed Slider */}
                  <div className="space-y-1 p-2 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-slate-400">Wind Speed:</span>
                      <span className="font-mono font-bold text-emerald-400">{windSpeed} m/s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      value={windSpeed}
                      onChange={(e) => setWindSpeed(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>

                {/* Physiology Rate Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photosynthetic Rate */}
                  <div className="space-y-1 bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-400">Photosynthetic Rate:</span>
                      <span className="font-mono font-bold text-emerald-400">{isStomaOpen ? calculatePhotosynthesisRate() : 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${isStomaOpen ? calculatePhotosynthesisRate() : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Transpiration Rate */}
                  <div className="space-y-1 bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-400">Transpiration Pull Rate:</span>
                      <span className="font-mono font-bold text-cyan-400">{calculateTranspirationRate()}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                        style={{ width: `${calculateTranspirationRate()}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Safety / Transpiration Pull Warning Indicator */}
                <div className="p-2.5 rounded-xl border border-white/5 bg-white/5 flex items-center gap-2 text-xs text-[11px] leading-tight justify-center text-center">
                  {(() => {
                    const rate = calculateTranspirationRate();
                    if (!isStomaOpen) {
                      return (
                        <span className="text-amber-400 flex items-center gap-1.5 font-bold">
                          ⚠️ Guard cells flaccid. Stomata closed. Transpiration minimized. Carbon dioxide uptake blocked.
                        </span>
                      );
                    }
                    if (rate > 80) {
                      return (
                        <span className="text-red-450 font-black flex items-center gap-1.5 animate-pulse">
                          🚨 Warning: Excessive Transpiration! High wind/heat risk cell wilting (loss of turgor).
                        </span>
                      );
                    }
                    if (rate < 15) {
                      return (
                        <span className="text-blue-400 flex items-center gap-1.5 font-bold">
                          💧 Warning: Low Transpiration Pull! Insufficient suction to pull minerals from roots.
                        </span>
                      );
                    }
                    return (
                      <span className="text-emerald-450 flex items-center gap-1.5 font-bold">
                        ✅ Healthy Transpiration Pull: Optimal sap ascent and thermoregulation active.
                      </span>
                    );
                  })()}
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
      {/*  TAB 5: PHOTOSYNTHESIS & STARCH EXPERIMENT LAB                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {lab === "photosynthesis" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          <style>{`
            @keyframes riseBubble {
              0% { transform: translateY(110px) translateX(0); opacity: 0; }
              10% { opacity: 0.8; }
              90% { opacity: 0.8; }
              100% { transform: translateY(10px) translateX(var(--drift)); opacity: 0; }
            }
            .animate-bubble-1 { animation: riseBubble 2.4s infinite ease-in; }
            .animate-bubble-2 { animation: riseBubble 1.7s infinite ease-in 0.4s; }
            .animate-bubble-3 { animation: riseBubble 3.0s infinite ease-in 0.9s; }
            .animate-bubble-4 { animation: riseBubble 2.1s infinite ease-in 1.4s; }
          `}</style>

          {/* Visual Panel (7 Cols) */}
          <div className="lg:col-span-7 dark:bg-[#070916] bg-white dark:border-white/10 border-slate-200 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col">
            
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-sm font-black dark:text-white text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Sun className="w-4 h-4 text-amber-400" /> Plant Photosynthesis Workbench
              </h3>
              
              <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                Wavelength: {photoLightWavelength.toUpperCase()}
              </span>
            </div>

            {/* Simulated Apparatus screen */}
            <div className="relative border border-white/10 dark:bg-black/40 bg-slate-900 rounded-2xl overflow-hidden min-h-[300px] flex items-center justify-center p-4">
              
              {/* Light beam overlay */}
              {photoLightIntensity > 0 && (
                <div 
                  className="absolute inset-0 transition-colors duration-500 pointer-events-none"
                  style={{
                    backgroundColor: 
                      photoLightWavelength === "white" ? `rgba(253, 224, 71, ${0.05 + (photoLightIntensity/200)*0.1})` :
                      photoLightWavelength === "red" ? `rgba(239, 68, 68, ${0.05 + (photoLightIntensity/200)*0.12})` :
                      photoLightWavelength === "blue" ? `rgba(59, 130, 246, ${0.05 + (photoLightIntensity/200)*0.12})` :
                      `rgba(52, 211, 153, ${0.05 + (photoLightIntensity/200)*0.08})`
                  }}
                />
              )}

              {/* The Hydrilla Bubbling Setup (Left) */}
              <div className="flex flex-col items-center justify-center relative w-1/2">
                {/* SVG Beaker, funnel, and inverted test tube */}
                <svg className="w-40 h-56 text-slate-400/50" viewBox="0 0 100 120" fill="none">
                  {/* Beaker */}
                  <rect x="15" y="40" width="70" height="75" rx="2" stroke="currentColor" strokeWidth="2" />
                  <line x1="15" y1="50" x2="20" y2="50" stroke="currentColor" strokeWidth="1" />
                  <line x1="15" y1="70" x2="20" y2="70" stroke="currentColor" strokeWidth="1" />
                  <line x1="15" y1="90" x2="20" y2="90" stroke="currentColor" strokeWidth="1" />

                  {/* Water line */}
                  <line x1="16" y1="48" x2="84" y2="48" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,2" />

                  {/* Glass funnel */}
                  <path d="M25 105 L45 80 V55 H55 V80 L75 105 Z" stroke="currentColor" strokeWidth="1.5" />

                  {/* Inverted test tube */}
                  <rect x="44" y="20" width="12" height="50" rx="4" stroke="currentColor" strokeWidth="1.5" />

                  {/* Green Hydrilla Plant */}
                  {/* Stem */}
                  <path d="M50 110 C48 95 52 85 50 78" stroke="#10b981" strokeWidth="2.5" />
                  {/* Leaves */}
                  <path d="M47 100 Q40 98 44 94 Q48 97 48 100 Z" fill="#047857" />
                  <path d="M53 102 Q60 100 56 96 Q52 99 53 102 Z" fill="#047857" />
                  <path d="M48 88 Q41 85 45 81 Q49 84 48 88 Z" fill="#047857" />
                  <path d="M52 90 Q59 87 55 83 Q51 86 52 90 Z" fill="#047857" />
                  <path d="M48 76 Q42 70 46 67 Q49 71 48 76 Z" fill="#047857" />
                </svg>

                {/* Oxygen Bubbles rising from cut stem (approx x=50, y=78 to y=20) */}
                {photoLightIntensity > 0 && (
                  <div className="absolute inset-0 pointer-events-none flex justify-center">
                    {/* Only render rising bubbles if rate is positive */}
                    {(() => {
                      // Calculate bubble rate
                      const intensityFactor = photoLightIntensity / 100;
                      const co2Factor = 0.3 + (photoCo2 / 400) * 0.7;
                      const tempFactor = photoTemp < 10 ? 0.1 : photoTemp > 45 ? 0.05 : 1.0 - Math.abs(25 - photoTemp) * 0.025;
                      const wavelengthFactor = photoLightWavelength === "white" ? 1.0 : photoLightWavelength === "red" ? 1.25 : photoLightWavelength === "blue" ? 0.9 : 0.08;
                      const rate = Math.round(45 * intensityFactor * co2Factor * tempFactor * wavelengthFactor);
                      
                      if (rate < 4) return null;
                      return (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-white/70 absolute animate-bubble-1" style={{ left: "calc(50% - 2px)", "--drift": "-8px" } as any} />
                          <div className="w-2 h-2 rounded-full bg-white/60 absolute animate-bubble-2" style={{ left: "calc(50% + 2px)", "--drift": "6px" } as any} />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/70 absolute animate-bubble-3" style={{ left: "calc(50% - 4px)", "--drift": "-4px" } as any} />
                          {rate > 20 && (
                            <div className="w-1 h-1 rounded-full bg-white/85 absolute animate-bubble-4" style={{ left: "calc(50% + 1px)", "--drift": "8px" } as any} />
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Starch Test Simulator (Right) */}
              <div className="w-1/2 flex flex-col items-center justify-center border-l border-white/5 pl-4">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Starch Test Leaf</span>
                
                {/* Leaf graphic */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                  <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                    {/* Leaf main shape */}
                    <path 
                      d="M50 15 C85 45 75 80 50 85 C25 80 15 45 50 15 Z" 
                      fill={
                        starchTestIodineAdded
                          ? "rgba(15, 23, 42, 0.95)" // blue-black (starch present)
                          : starchTestBoiled
                          ? "rgba(241, 245, 249, 0.85)" // white (chlorophyll extracted)
                          : "#10b981" // fresh green
                      } 
                      stroke="#047857" 
                      strokeWidth="2.5" 
                      className="transition-colors duration-1000"
                    />
                    
                    {/* Starch test variegation or partial light block */}
                    {starchTestIodineAdded && (
                      <path 
                        d="M50 25 C65 45 65 65 50 80 C35 65 35 45 50 25 Z" 
                        fill="rgba(241, 245, 249, 0.85)" // center remained white/brown (no starch due to covered stripe)
                        stroke="rgba(0,0,0,0.1)"
                      />
                    )}

                    {/* Leaf Veins */}
                    <path d="M50 15 L50 85" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
                    <path d="M50 35 Q65 45 70 48" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
                    <path d="M50 35 Q35 45 30 48" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
                    <path d="M50 55 Q70 65 72 68" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
                    <path d="M50 55 Q30 65 28 68" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
                  </svg>
                  
                  {/* Black paper clip (CBSE light screening experiment) */}
                  {!starchTestBoiled && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-4 bg-slate-900 border border-slate-700 rounded shadow-md flex items-center justify-center text-[7px] font-black text-slate-400 select-none">
                      LIGHT SCREEN
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setStarchTestBoiled(true);
                      playSynthSound(300, 0.3, "triangle");
                    }}
                    disabled={starchTestBoiled}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase text-white disabled:opacity-40"
                  >
                    1. Boil in Alcohol
                  </button>
                  <button
                    onClick={() => {
                      if (!starchTestBoiled) return;
                      setStarchTestIodineAdded(true);
                      playSynthSound(440, 0.25);
                      // Award XP for completing starch test
                      awardUserXP(35);
                    }}
                    disabled={!starchTestBoiled || starchTestIodineAdded}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[9px] font-black uppercase text-white disabled:opacity-40"
                  >
                    2. Add Iodine
                  </button>
                </div>
              </div>

            </div>

            {/* Output Diagnostics */}
            <div className="grid grid-cols-2 gap-3.5 mt-4 p-4 dark:bg-white/5 bg-slate-100 rounded-2xl border dark:border-white/5 border-slate-200">
              <div>
                <div className="text-[9px] font-bold dark:text-slate-400 text-slate-600 uppercase tracking-widest">Rate of Photosynthesis:</div>
                <div className="text-sm font-black dark:text-teal-300 text-teal-700 font-mono mt-0.5">
                  {(() => {
                    const intensityFactor = photoLightIntensity / 100;
                    const co2Factor = 0.3 + (photoCo2 / 400) * 0.7;
                    const tempFactor = photoTemp < 10 ? 0.1 : photoTemp > 45 ? 0.05 : 1.0 - Math.abs(25 - photoTemp) * 0.025;
                    const wavelengthFactor = photoLightWavelength === "white" ? 1.0 : photoLightWavelength === "red" ? 1.25 : photoLightWavelength === "blue" ? 0.9 : 0.08;
                    const rate = Math.round(45 * intensityFactor * co2Factor * tempFactor * wavelengthFactor);
                    return photoLightIntensity === 0 ? "0 bubbles/min" : `${rate} bubbles/min`;
                  })()}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-bold dark:text-slate-400 text-slate-600 uppercase tracking-widest">Starch Test Status:</div>
                <div className="text-sm font-black dark:text-indigo-300 text-indigo-700 font-mono mt-0.5">
                  {starchTestIodineAdded ? "Blue-Black (Starch Present)" : starchTestBoiled ? "Chlorophyll Extracted" : "Untested leaf"}
                </div>
              </div>
            </div>

          </div>

          {/* Controls Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="p-6 rounded-3xl dark:bg-slate-900 bg-white border dark:border-white/10 border-slate-200 shadow-2xl space-y-5">
              <div className="border-b dark:border-white/10 border-slate-200 pb-3">
                <h3 className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-wide">Environment Controls</h3>
              </div>

              {/* Light Wavelength Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold dark:text-slate-300 text-slate-700 block">Light Wavelength (Color):</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "white", color: "bg-slate-200 text-slate-900", border: "border-slate-400" },
                    { id: "red", color: "bg-red-500 text-white", border: "border-red-650" },
                    { id: "blue", color: "bg-blue-500 text-white", border: "border-blue-650" },
                    { id: "green", color: "bg-emerald-500 text-white", border: "border-emerald-650" }
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setPhotoLightWavelength(w.id as any)}
                      className={`py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${w.color} ${
                        photoLightWavelength === w.id ? "scale-105 border-white ring-2 ring-indigo-500/50" : "opacity-75 border-transparent"
                      }`}
                    >
                      {w.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Light Intensity Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold dark:text-slate-300 text-slate-700">Light Intensity (Lux)</span>
                  <span className="font-mono text-amber-400 font-bold">{photoLightIntensity} Lux</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={photoLightIntensity}
                  onChange={(e) => setPhotoLightIntensity(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* CO2 Concentration Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold dark:text-slate-300 text-slate-700">CO₂ Concentration</span>
                  <span className="font-mono text-cyan-400 font-bold">{photoCo2} ppm</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={photoCo2}
                  onChange={(e) => setPhotoCo2(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold dark:text-slate-300 text-slate-700">Temperature (°C)</span>
                  <span className="font-mono text-rose-450 font-bold">{photoTemp} °C</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={photoTemp}
                  onChange={(e) => setPhotoTemp(parseInt(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              {/* Action Reset */}
              <button
                onClick={() => {
                  setStarchTestBoiled(false);
                  setStarchTestIodineAdded(false);
                }}
                className="w-full py-2.5 rounded-xl border dark:border-white/10 border-slate-200 hover:bg-white/5 text-[10px] font-black uppercase tracking-wider text-slate-300 transition-colors"
              >
                Reset Leaf Starch Test
              </button>
            </div>

            {/* Informative Theory Box */}
            <div className="p-5 rounded-3xl dark:bg-slate-900 bg-white border dark:border-white/10 border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black dark:text-indigo-400 text-indigo-700 uppercase tracking-wider">
                <Info className="w-4 h-4" /> CBSE Board Theory Guide:
              </div>
              
              <ul className="space-y-2.5 text-xs dark:text-slate-300 text-slate-700 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="dark:text-indigo-300 text-indigo-700">Photosynthesis Equation:</strong>
                  <div className="my-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono text-[10px] text-indigo-300 overflow-x-auto">
                    6CO₂ + 12H₂O &rarr; C₆H₁₂O₆ + 6O₂ + 6H₂O
                  </div>
                </li>
                <li>
                  <strong className="dark:text-pink-300 text-pink-700">Wavelength Effect:</strong> Chlorophyll absorbs <strong className="underline">Red</strong> and <strong className="underline">Blue</strong> light best. It <strong className="underline">reflects Green light</strong>, which is why photosynthesis slows down dramatically under green illumination.
                </li>
                <li>
                  <strong className="dark:text-emerald-300 text-emerald-700">Starch Test:</strong> Chlorophyll is extracted by boiling the leaf in alcohol in a water bath (alcohol is flammable). Iodine turns starch <strong className="underline">blue-black</strong>. Covered parts remain brown/white, showing light is essential for starch synthesis.
                </li>
              </ul>
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
