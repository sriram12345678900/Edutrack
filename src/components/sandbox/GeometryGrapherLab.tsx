"use client";

import React, { useState, useEffect, useRef } from "react";
import { Compass, Sliders, CheckCircle2, RotateCcw, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type GraphMode = "linear" | "quadratic" | "circle_tangents";

export default function GeometryGrapherLab() {
  const [mode, setMode] = useState<GraphMode>("quadratic");

  // Linear states: y = mx + c
  const [slope, setSlope] = useState(2);
  const [intercept, setIntercept] = useState(-3);

  // Quadratic states: y = ax^2 + bx + c
  const [aCoeff, setACoeff] = useState(1);
  const [bCoeff, setBCoeff] = useState(-2);
  const [cCoeff, setCCoeff] = useState(-3);

  // Circle & Tangents states: (x - h)^2 + (y - k)^2 = r^2
  const [circleR, setCircleR] = useState(4);
  const [pointPX, setPointPX] = useState(7);
  const [pointPY, setPointPY] = useState(5);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height / 2;
    const scale = 25; // 25 pixels = 1 unit

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Grid lines
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let x = originX % scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = originY % scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Draw X & Y Axes
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    for (let i = -10; i <= 10; i += 2) {
      if (i === 0) continue;
      ctx.fillText(String(i), originX + i * scale - 4, originY + 14);
      ctx.fillText(String(-i), originX + 6, originY + i * scale + 4);
    }

    const toScreenX = (mathX: number) => originX + mathX * scale;
    const toScreenY = (mathY: number) => originY - mathY * scale;

    // 3. Render Graph based on mode
    if (mode === "linear") {
      // Line: y = mx + c
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 3;
      ctx.beginPath();
      const xStart = -15;
      const xEnd = 15;
      ctx.moveTo(toScreenX(xStart), toScreenY(slope * xStart + intercept));
      ctx.lineTo(toScreenX(xEnd), toScreenY(slope * xEnd + intercept));
      ctx.stroke();

      // Intercept points
      const yIntX = 0;
      const yIntY = intercept;
      const xIntX = slope !== 0 ? -intercept / slope : 0;
      const xIntY = 0;

      // Draw Y-Intercept point
      ctx.fillStyle = "#ec4899";
      ctx.beginPath();
      ctx.arc(toScreenX(yIntX), toScreenY(yIntY), 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`Y-Int (0, ${intercept})`, toScreenX(yIntX) + 8, toScreenY(yIntY) - 6);

      // Draw X-Intercept point if slope != 0
      if (slope !== 0) {
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(toScreenX(xIntX), toScreenY(xIntY), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(`X-Int (${xIntX.toFixed(1)}, 0)`, toScreenX(xIntX) - 20, toScreenY(xIntY) + 16);
      }
    } else if (mode === "quadratic") {
      // Parabola: y = ax^2 + bx + c
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 3;
      ctx.beginPath();
      let first = true;
      for (let x = -15; x <= 15; x += 0.1) {
        const y = aCoeff * x * x + bCoeff * x + cCoeff;
        const sx = toScreenX(x);
        const sy = toScreenY(y);
        if (first) {
          ctx.moveTo(sx, sy);
          first = false;
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      ctx.stroke();

      // Vertex: (-b/2a, c - b^2/4a)
      if (aCoeff !== 0) {
        const vx = -bCoeff / (2 * aCoeff);
        const vy = aCoeff * vx * vx + bCoeff * vx + cCoeff;
        ctx.fillStyle = "#ec4899";
        ctx.beginPath();
        ctx.arc(toScreenX(vx), toScreenY(vy), 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(`Vertex (${vx.toFixed(2)}, ${vy.toFixed(2)})`, toScreenX(vx) + 8, toScreenY(vy) - 8);

        // Real Zeros if D >= 0
        const D = bCoeff * bCoeff - 4 * aCoeff * cCoeff;
        if (D >= 0) {
          const root1 = (-bCoeff + Math.sqrt(D)) / (2 * aCoeff);
          const root2 = (-bCoeff - Math.sqrt(D)) / (2 * aCoeff);

          [root1, root2].forEach((r, idx) => {
            ctx.fillStyle = "#10b981";
            ctx.beginPath();
            ctx.arc(toScreenX(r), toScreenY(0), 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText(`Root ${idx + 1}: ${r.toFixed(2)}`, toScreenX(r) - 20, toScreenY(0) + 16);
          });
        }
      }
    } else if (mode === "circle_tangents") {
      // Circle at (0,0) with radius R
      ctx.strokeStyle = "#0ea5e9";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(originX, originY, circleR * scale, 0, Math.PI * 2);
      ctx.stroke();

      // External Point P(px, py)
      const d = Math.sqrt(pointPX * pointPX + pointPY * pointPY);
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(toScreenX(pointPX), toScreenY(pointPY), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`External Point P (${pointPX}, ${pointPY})`, toScreenX(pointPX) + 8, toScreenY(pointPY) - 8);

      if (d > circleR) {
        // Tangent points A and B
        const tangentLength = Math.sqrt(d * d - circleR * circleR);
        const alpha = Math.atan2(pointPY, pointPX);
        const beta = Math.asin(circleR / d);

        const aAngle = alpha + (Math.PI / 2 - beta);
        const bAngle = alpha - (Math.PI / 2 - beta);

        const ax = circleR * Math.cos(aAngle);
        const ay = circleR * Math.sin(aAngle);
        const bx = circleR * Math.cos(bAngle);
        const by = circleR * Math.sin(bAngle);

        // Draw Tangent PA
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toScreenX(pointPX), toScreenY(pointPY));
        ctx.lineTo(toScreenX(ax), toScreenY(ay));
        ctx.stroke();

        // Draw Tangent PB
        ctx.beginPath();
        ctx.moveTo(toScreenX(pointPX), toScreenY(pointPY));
        ctx.lineTo(toScreenX(bx), toScreenY(by));
        ctx.stroke();

        // Radii OA and OB (dashed)
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#94a3b8";
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(toScreenX(ax), toScreenY(ay));
        ctx.moveTo(originX, originY);
        ctx.lineTo(toScreenX(bx), toScreenY(by));
        ctx.stroke();
        ctx.setLineDash([]);

        // Mark points A and B
        ctx.fillStyle = "#10b981";
        [
          { x: ax, y: ay, label: `A (PA = ${tangentLength.toFixed(2)})` },
          { x: bx, y: by, label: `B (PB = ${tangentLength.toFixed(2)})` }
        ].forEach(pt => {
          ctx.beginPath();
          ctx.arc(toScreenX(pt.x), toScreenY(pt.y), 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText(pt.label, toScreenX(pt.x) - 20, toScreenY(pt.y) - 8);
        });
      }
    }
  }, [mode, slope, intercept, aCoeff, bCoeff, cCoeff, circleR, pointPX, pointPY]);

  // Quadratic calculations
  const quadD = bCoeff * bCoeff - 4 * aCoeff * cCoeff;

  return (
    <div className="space-y-6">
      {/* Mode Selectors */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "quadratic", label: "Quadratic Parabola (Roots & Vertex)" },
          { id: "circle_tangents", label: "CBSE Circle Tangents Theorem" },
          { id: "linear", label: "Linear Equation (y = mx + c)" }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition border",
              mode === m.id
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Grid Layout: Canvas + Parameter Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Canvas */}
        <div className="lg:col-span-8 p-3 rounded-3xl border border-slate-800 bg-[#060814] flex flex-col items-center shadow-2xl">
          <canvas
            ref={canvasRef}
            width={640}
            height={460}
            className="w-full h-auto rounded-2xl bg-[#090d1f] shadow-inner"
          />
        </div>

        {/* Right: Controls & Formulas */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
          {mode === "linear" && (
            <>
              <div>
                <span className="text-[11px] font-bold uppercase text-indigo-400">Class 10 Coordinate Geometry</span>
                <h3 className="text-lg font-black text-white">Line: y = {slope}x {intercept >= 0 ? `+ ${intercept}` : intercept}</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Slope (m)</span>
                    <span className="font-mono text-indigo-400 font-bold">{slope}</span>
                  </div>
                  <input
                    type="range"
                    min={-5}
                    max={5}
                    step={0.5}
                    value={slope}
                    onChange={e => setSlope(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Y-Intercept (c)</span>
                    <span className="font-mono text-pink-400 font-bold">{intercept}</span>
                  </div>
                  <input
                    type="range"
                    min={-8}
                    max={8}
                    value={intercept}
                    onChange={e => setIntercept(Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>
              </div>
            </>
          )}

          {mode === "quadratic" && (
            <>
              <div>
                <span className="text-[11px] font-bold uppercase text-purple-400">Class 10 Polynomials</span>
                <h3 className="text-lg font-black text-white">
                  y = {aCoeff}x² {bCoeff >= 0 ? `+ ${bCoeff}x` : `${bCoeff}x`} {cCoeff >= 0 ? `+ ${cCoeff}` : cCoeff}
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Leading Coeff (a)</span>
                    <span className="font-mono text-purple-400 font-bold">{aCoeff}</span>
                  </div>
                  <input
                    type="range"
                    min={-3}
                    max={3}
                    step={0.5}
                    value={aCoeff}
                    onChange={e => setACoeff(Number(e.target.value) || 0.1)}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Linear Coeff (b)</span>
                    <span className="font-mono text-purple-400 font-bold">{bCoeff}</span>
                  </div>
                  <input
                    type="range"
                    min={-6}
                    max={6}
                    value={bCoeff}
                    onChange={e => setBCoeff(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Constant Term (c)</span>
                    <span className="font-mono text-purple-400 font-bold">{cCoeff}</span>
                  </div>
                  <input
                    type="range"
                    min={-6}
                    max={6}
                    value={cCoeff}
                    onChange={e => setCCoeff(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Discriminant (D = b² - 4ac):</span>
                  <span className={cn("font-bold font-mono", quadD > 0 ? "text-emerald-400" : quadD === 0 ? "text-amber-400" : "text-rose-400")}>
                    {quadD}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {quadD > 0 ? "Two distinct real roots (intersects x-axis twice)." : quadD === 0 ? "Two equal real roots (touches x-axis)." : "No real roots (does not intersect x-axis)."}
                </div>
              </div>
            </>
          )}

          {mode === "circle_tangents" && (
            <>
              <div>
                <span className="text-[11px] font-bold uppercase text-sky-400">CBSE Class 10 Circles Theorem</span>
                <h3 className="text-lg font-black text-white">Theorem 10.2: Tangent Lengths</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Circle Radius (r)</span>
                    <span className="font-mono text-sky-400 font-bold">{circleR} units</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={6}
                    value={circleR}
                    onChange={e => setCircleR(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>External Point P_x</span>
                    <span className="font-mono text-amber-400 font-bold">{pointPX}</span>
                  </div>
                  <input
                    type="range"
                    min={circleR + 1}
                    max={10}
                    value={pointPX}
                    onChange={e => setPointPX(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>External Point P_y</span>
                    <span className="font-mono text-amber-400 font-bold">{pointPY}</span>
                  </div>
                  <input
                    type="range"
                    min={-6}
                    max={8}
                    value={pointPY}
                    onChange={e => setPointPY(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Equal Tangent Theorem Verified!
                </div>
                <p className="text-[11px] text-slate-400">
                  By Pythagoras in right triangles ΔOPA and ΔOPB (where OA ⊥ PA and OB ⊥ PB):
                  <br />
                  <code className="text-indigo-300 font-mono">PA = PB = √(OP² - r²)</code>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
