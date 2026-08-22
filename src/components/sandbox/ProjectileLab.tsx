"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, RotateCcw, Target, Info, Sparkles, HelpCircle, 
  Activity, Flame, Volume2, VolumeX, ArrowRight, ShieldCheck
} from "lucide-react";
import { awardXp } from "@/lib/xp";

interface ProjectilePoint {
  x: number;
  y: number;
}

export default function ProjectileLab() {
  // Simulator Parameters
  const [angle, setAngle] = useState<number>(45);
  const [velocity, setVelocity] = useState<number>(15);
  const [height, setHeight] = useState<number>(0);
  const [gravityType, setGravityType] = useState<"earth" | "moon" | "jupiter" | "space">("earth");
  
  // Simulation Running State
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const [showComplementary, setShowComplementary] = useState<boolean>(false);
  
  // Target Challenge
  const [targetDistance, setTargetDistance] = useState<number>(40);
  const [challengeWon, setChallengeWon] = useState<boolean>(false);
  const [claimedXP, setClaimedXP] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Real-time calculated kinematics parameters
  const gVal = {
    earth: 9.8,
    moon: 1.6,
    jupiter: 24.8,
    space: 0.5
  }[gravityType];

  // Kinematic Results
  const angleRad = (angle * Math.PI) / 180;
  const vx = velocity * Math.cos(angleRad);
  const vy = velocity * Math.sin(angleRad);
  
  // Time of Flight (T) solving: -0.5 * g * T^2 + vy * T + height = 0
  const timeOfFlight = (() => {
    const a = 0.5 * gVal;
    const b = -vy;
    const c = -height;
    if (a === 0) return 10;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return 0;
    const t = (-b + Math.sqrt(discriminant)) / (2 * a);
    return Math.max(0, t);
  })();

  const horizontalRange = vx * timeOfFlight;
  const maxProjHeight = height + (vy * vy) / (2 * gVal);

  // Generate target distance on mount
  useEffect(() => {
    resetChallenge();
  }, []);

  const resetChallenge = () => {
    setTargetDistance(Math.floor(Math.random() * 35) + 20); // 20m to 55m
    setChallengeWon(false);
    setClaimedXP(false);
    setIsFiring(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const playSynthSound = (frequency: number, duration: number, type: OscillatorType = "sine") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  };

  // Launch execution
  const handleFire = () => {
    if (isFiring) return;
    setIsFiring(true);
    playSynthSound(150, 0.4, "triangle"); // launch sound

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = 8; // 8 pixels per meter
    const groundY = 280;
    const x0 = 50;
    const y0 = groundY - height * scale;

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsedSec = (timestamp - startTime) / 1000 * 1.5; // sped up slightly for responsiveness
      
      // Calculate current position
      const t = Math.min(elapsedSec, timeOfFlight);
      const currentX = x0 + (vx * t) * scale;
      const currentY = y0 - (vy * t - 0.5 * gVal * t * t) * scale;

      // Draw everything
      drawStaticScene(ctx, canvas, scale, groundY, x0, y0);
      
      // Draw actual trajectory path up to current time
      ctx.beginPath();
      ctx.strokeStyle = "#818cf8";
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.moveTo(x0, y0);
      for (let tempT = 0; tempT <= t; tempT += timeOfFlight / 100) {
        const tx = x0 + (vx * tempT) * scale;
        const ty = y0 - (vy * tempT - 0.5 * gVal * tempT * tempT) * scale;
        ctx.lineTo(tx, ty);
      }
      ctx.stroke();

      // Draw firing ball (projectile)
      ctx.beginPath();
      ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "#ef4444";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ef4444";
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // End of flight
      if (elapsedSec >= timeOfFlight) {
        setIsFiring(false);
        // Check target hit
        const error = Math.abs(horizontalRange - targetDistance);
        if (error <= 1.8) {
          setChallengeWon(true);
          playSynthSound(523.25, 0.15); // C5 Chime
          setTimeout(() => playSynthSound(659.25, 0.3), 150); // E5
        } else {
          playSynthSound(100, 0.5, "sawtooth"); // explosion / fail buzz
        }
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const drawStaticScene = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    scale: number, 
    groundY: number, 
    x0: number, 
    y0: number
  ) => {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sky background grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Ground
    ctx.beginPath();
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 4;
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // Grass effect
    ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // Draw Target Challenge Bullseye
    const targetX = x0 + targetDistance * scale;
    ctx.beginPath();
    ctx.fillStyle = "#10b981";
    ctx.fillRect(targetX - 10, groundY - 2, 20, 4);
    
    ctx.beginPath();
    ctx.fillStyle = "#ef4444";
    ctx.arc(targetX, groundY, 12, Math.PI, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(targetX, groundY, 7, Math.PI, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "#ef4444";
    ctx.arc(targetX, groundY, 3, Math.PI, 2 * Math.PI);
    ctx.fill();

    // Target Label
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 9px sans-serif";
    ctx.fillText("TARGET CHALLENGE", targetX - 42, groundY + 15);
    ctx.fillText(`${targetDistance} m`, targetX - 14, groundY + 28);

    // Draw Launcher Stand
    ctx.fillStyle = "#475569";
    ctx.fillRect(x0 - 5, y0, 10, groundY - y0);

    // Draw Launcher barrel pointing at angle
    ctx.save();
    ctx.translate(x0, y0);
    ctx.rotate(-angleRad);
    ctx.fillStyle = "#64748b";
    ctx.fillRect(0, -4, 25, 8); // barrel
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // Draw complementary angle trajectory if toggled
    if (showComplementary && angle !== 45) {
      const compAngleRad = ((90 - angle) * Math.PI) / 180;
      const compVx = velocity * Math.cos(compAngleRad);
      const compVy = velocity * Math.sin(compAngleRad);
      
      const compT = (() => {
        const a = 0.5 * gVal;
        const b = -compVy;
        const c = -height;
        if (a === 0) return 10;
        return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      })();

      ctx.beginPath();
      ctx.strokeStyle = "rgba(236, 72, 153, 0.4)"; // dashed pink
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(x0, y0);
      for (let tempT = 0; tempT <= compT; tempT += compT / 100) {
        const tx = x0 + (compVx * tempT) * scale;
        const ty = y0 - (compVy * tempT - 0.5 * gVal * tempT * tempT) * scale;
        ctx.lineTo(tx, ty);
      }
      ctx.stroke();
      ctx.setLineDash([]); // reset
    }
  };

  // Draw initial state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scale = 8;
    const groundY = 280;
    const x0 = 50;
    const y0 = groundY - height * scale;
    drawStaticScene(ctx, canvas, scale, groundY, x0, y0);
  }, [angle, velocity, height, gravityType, targetDistance, showComplementary]);

  const handleClaimXP = () => {
    if (claimedXP) return;
    setClaimedXP(true);
    awardXp(50, "Completed Projectile Landing Challenge");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5">
      {/* Visual Launcher Sandbox (7 Cols) */}
      <div className="lg:col-span-7 dark:bg-[#070916] bg-white dark:border-white/10 border-slate-200 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <h2 className="text-sm font-black dark:text-white text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-orange-400" /> Projectile Motion Trajectory Lab
          </h2>
          <div className="flex items-center gap-3">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={resetChallenge}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset Target
            </button>
          </div>
        </div>

        {/* Canvas Screen */}
        <div className="relative border border-white/10 dark:bg-black/40 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={600}
            height={320}
            className="w-full h-auto aspect-[600/320]"
          />
          
          {/* Target Success Banner */}
          {challengeWon && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm z-20">
              <Sparkles className="w-12 h-12 text-emerald-400 animate-bounce mb-2" />
              <h3 className="text-xl font-black text-white">Direct Hit! Target Neutralized!</h3>
              <p className="text-xs text-slate-300 max-w-sm mt-1 mb-4">
                You adjusted the angle and speed perfectly to land within 1.5m of the target!
              </p>
              
              {!claimedXP ? (
                <button
                  onClick={handleClaimXP}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
                >
                  Claim +50 XP Reward
                </button>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> +50 XP Claimed Successfully!
                  </span>
                  <button
                    onClick={resetChallenge}
                    className="text-xs font-bold text-slate-300 hover:underline flex items-center gap-1.5 mt-2"
                  >
                    Try Another Challenge <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Math Outputs */}
        <div className="grid grid-cols-3 gap-3.5 mt-4 p-4 dark:bg-white/5 bg-slate-100 rounded-2xl border dark:border-white/5 border-slate-200">
          <div>
            <div className="text-[9px] font-bold dark:text-slate-400 text-slate-600 uppercase tracking-widest">Calculated Range:</div>
            <div className="text-base font-black dark:text-indigo-300 text-indigo-700 font-mono mt-0.5">{horizontalRange.toFixed(2)} m</div>
          </div>
          <div>
            <div className="text-[9px] font-bold dark:text-slate-400 text-slate-600 uppercase tracking-widest">Maximum Height:</div>
            <div className="text-base font-black dark:text-pink-300 text-pink-700 font-mono mt-0.5">{maxProjHeight.toFixed(2)} m</div>
          </div>
          <div>
            <div className="text-[9px] font-bold dark:text-slate-400 text-slate-600 uppercase tracking-widest">Time of Flight:</div>
            <div className="text-base font-black dark:text-emerald-300 text-emerald-700 font-mono mt-0.5">{timeOfFlight.toFixed(2)} s</div>
          </div>
        </div>

      </div>

      {/* Simulator Parameters Panel (5 Cols) */}
      <div className="lg:col-span-5 space-y-4">
        
        {/* Controls Panel */}
        <div className="p-6 rounded-3xl dark:bg-slate-900 bg-white border dark:border-white/10 border-slate-200 shadow-2xl space-y-5">
          <div className="border-b dark:border-white/10 border-slate-200 pb-3">
            <h3 className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-wide">Launcher Parameters</h3>
          </div>

          {/* Launch Angle Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold dark:text-slate-300 text-slate-700">Launch Angle (&theta;)</span>
              <span className="font-mono text-indigo-400 font-bold">{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              disabled={isFiring}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Initial Velocity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold dark:text-slate-300 text-slate-700">Initial Velocity (u)</span>
              <span className="font-mono text-pink-400 font-bold">{velocity} m/s</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={velocity}
              onChange={(e) => setVelocity(parseInt(e.target.value))}
              disabled={isFiring}
              className="w-full accent-pink-500"
            />
          </div>

          {/* Launcher Height Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold dark:text-slate-300 text-slate-700">Launcher Height (y0)</span>
              <span className="font-mono text-emerald-400 font-bold">{height} m</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value))}
              disabled={isFiring}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Environment Gravity Selector */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold dark:text-slate-300 text-slate-700 block">Environment Gravity (g)</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: "earth", label: "Earth (9.8 m/s²)" },
                { type: "moon", label: "Moon (1.6 m/s²)" },
                { type: "jupiter", label: "Jupiter (24.8 m/s²)" },
                { type: "space", label: "Deep Space (0.5 m/s²)" }
              ].map((env) => (
                <button
                  key={env.type}
                  onClick={() => setGravityType(env.type as any)}
                  disabled={isFiring}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    gravityType === env.type
                      ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/50"
                      : "dark:bg-white/5 bg-slate-100 hover:bg-white/10 dark:text-slate-400 text-slate-600 border-transparent"
                  }`}
                >
                  {env.label}
                </button>
              ))}
            </div>
          </div>

          {/* Complementary Trajectory Option */}
          <div className="flex items-center justify-between pt-2 border-t dark:border-white/10 border-slate-200">
            <div className="flex flex-col">
              <span className="text-xs font-bold dark:text-slate-200 text-slate-800">Show Complementary Angle</span>
              <span className="text-[9px] dark:text-slate-400 text-slate-600">Simulate trajectory for 90° - &theta;</span>
            </div>
            <button
              onClick={() => setShowComplementary(!showComplementary)}
              disabled={angle === 45}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-all ${
                showComplementary && angle !== 45 ? "bg-pink-600 flex justify-end" : "bg-slate-700 flex justify-start"
              }`}
            >
              <div className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={handleFire}
            disabled={isFiring}
            className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
              isFiring
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
            }`}
          >
            <Play className="w-4 h-4 fill-current" /> {isFiring ? "Flying..." : "Fire Projectile!"}
          </button>
        </div>

        {/* Educational Cheat Sheet */}
        <div className="p-5 rounded-3xl dark:bg-slate-900 bg-white border dark:border-white/10 border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black dark:text-indigo-400 text-indigo-700 uppercase tracking-wider">
            <Info className="w-4 h-4" /> CBSE Board Theory Guide:
          </div>
          
          <ul className="space-y-2 text-xs dark:text-slate-300 text-slate-700 list-disc list-inside leading-relaxed">
            <li>
              <strong className="dark:text-indigo-300 text-indigo-700">Complementary Angles:</strong> When firing from the ground (y0=0), two complementary angles (like 30° and 60°) will land at the <strong className="underline">exact same spot</strong> on the ground.
            </li>
            <li>
              <strong className="dark:text-pink-300 text-pink-700">Maximum Range:</strong> Under ideal conditions, a launch angle of <strong className="underline">45°</strong> yields the maximum horizontal range.
            </li>
            <li>
              <strong className="dark:text-emerald-300 text-emerald-700">Horizontal Component:</strong> Velocity along the X-axis (ux = u cos &theta;) remains <strong className="underline">constant</strong> since there is no horizontal force or air resistance.
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
