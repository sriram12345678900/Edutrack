"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { 
  Heart, Eye, Sparkles, RotateCcw, Play, Pause, 
  Sliders, Info, CheckCircle2, ChevronRight, Activity, Zap, Compass
} from "lucide-react";
import { cn } from "@/lib/utils";

type AnatomyModelType = "heart" | "eye" | "stomata";

export default function Anatomy3DLab() {
  const [modelType, setModelType] = useState<AnatomyModelType>("heart");
  const [isPumping, setIsPumping] = useState(true);
  const [bpm, setBpm] = useState(72);
  const [bloodFlowActive, setBloodFlowActive] = useState(true);
  const [selectedPart, setSelectedPart] = useState<string>("Overview");

  // Eye simulator states
  const [eyeCondition, setEyeCondition] = useState<"normal" | "myopia" | "hypermetropia">("normal");
  const [correctiveLens, setCorrectiveLens] = useState<"none" | "concave" | "convex">("none");

  // Stomata states
  const [turgidity, setTurgidity] = useState(80); // 0-100%

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const meshesRef = useRef<{ [key: string]: THREE.Object3D }>({});

  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060814);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 2.0);
    dirLight1.position.set(10, 10, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xec4899, 1.5);
    dirLight2.position.set(-10, -10, 10);
    scene.add(dirLight2);

    // 5. Interactive Mouse Rotation Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sceneRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      scene.rotation.y += deltaX * 0.01;
      scene.rotation.x += deltaY * 0.01;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      domEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Build 3D Models on modelType change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous meshes
    Object.values(meshesRef.current).forEach(m => scene.remove(m));
    meshesRef.current = {};
    scene.rotation.set(0, 0, 0);

    if (modelType === "heart") {
      build3DHeart(scene);
    } else if (modelType === "eye") {
      build3DEye(scene);
    } else if (modelType === "stomata") {
      build3DStomata(scene);
    }
  }, [modelType, eyeCondition, correctiveLens, turgidity]);

  // Build 3D Human Heart Model
  const build3DHeart = (scene: THREE.Scene) => {
    const heartGroup = new THREE.Group();

    // 1. Left Ventricle (Thick muscular cone, oxygenated red)
    const lvGeo = new THREE.ConeGeometry(2.2, 4.2, 32);
    const lvMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      metalness: 0.1
    });
    const leftVentricle = new THREE.Mesh(lvGeo, lvMat);
    leftVentricle.position.set(-0.8, -1.2, 0);
    leftVentricle.rotation.z = Math.PI * 0.95;
    heartGroup.add(leftVentricle);
    meshesRef.current["left_ventricle"] = leftVentricle;

    // 2. Right Ventricle (Deoxygenated blue)
    const rvGeo = new THREE.ConeGeometry(1.8, 3.8, 32);
    const rvMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.3,
      metalness: 0.1
    });
    const rightVentricle = new THREE.Mesh(rvGeo, rvMat);
    rightVentricle.position.set(1.1, -1.0, 0.4);
    rightVentricle.rotation.z = Math.PI * 0.9;
    heartGroup.add(rightVentricle);
    meshesRef.current["right_ventricle"] = rightVentricle;

    // 3. Left Atrium
    const laGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const laMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const leftAtrium = new THREE.Mesh(laGeo, laMat);
    leftAtrium.position.set(-1.2, 1.4, 0);
    heartGroup.add(leftAtrium);
    meshesRef.current["left_atrium"] = leftAtrium;

    // 4. Right Atrium
    const raGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const raMat = new THREE.MeshStandardMaterial({ color: 0x2563eb });
    const rightAtrium = new THREE.Mesh(raGeo, raMat);
    rightAtrium.position.set(1.4, 1.3, 0);
    heartGroup.add(rightAtrium);
    meshesRef.current["right_atrium"] = rightAtrium;

    // 5. Aorta Arch (Oxygenated blood exit to entire body)
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.3, 1.5, 0),
      new THREE.Vector3(-0.2, 3.2, 0),
      new THREE.Vector3(0.5, 3.8, 0),
      new THREE.Vector3(1.4, 3.2, -0.5),
      new THREE.Vector3(1.6, 1.5, -0.8)
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 32, 0.55, 16, false);
    const aortaMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.2 });
    const aorta = new THREE.Mesh(aortaGeo, aortaMat);
    heartGroup.add(aorta);
    meshesRef.current["aorta"] = aorta;

    // 6. Superior & Inferior Vena Cava
    const venaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.2, 3.4, 0),
      new THREE.Vector3(2.0, 1.5, 0),
      new THREE.Vector3(2.0, -1.8, 0)
    ]);
    const venaGeo = new THREE.TubeGeometry(venaCurve, 32, 0.45, 16, false);
    const venaMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.2 });
    const venaCava = new THREE.Mesh(venaGeo, venaMat);
    heartGroup.add(venaCava);
    meshesRef.current["vena_cava"] = venaCava;

    scene.add(heartGroup);
    meshesRef.current["main"] = heartGroup;
  };

  // Build 3D Human Eye with Optics Ray Tracing
  const build3DEye = (scene: THREE.Scene) => {
    const eyeGroup = new THREE.Group();

    // Eyeball geometry: adjust elongation for myopia/hypermetropia
    const zScale = eyeCondition === "myopia" ? 1.35 : eyeCondition === "hypermetropia" ? 0.8 : 1.0;
    const eyeGeo = new THREE.SphereGeometry(3.5, 32, 32);
    eyeGeo.scale(1.0, 1.0, zScale);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
      transparent: true,
      opacity: 0.75
    });
    const eyeball = new THREE.Mesh(eyeGeo, eyeMat);
    eyeGroup.add(eyeball);

    // Cornea (Front transparent dome)
    const corneaGeo = new THREE.SphereGeometry(1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4);
    const corneaMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
    const cornea = new THREE.Mesh(corneaGeo, corneaMat);
    cornea.position.set(0, 0, 3.2 * zScale);
    eyeGroup.add(cornea);

    // Crystalline Lens
    const lensGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.4, 32);
    lensGeo.rotateX(Math.PI / 2);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x818cf8, transparent: true, opacity: 0.85 });
    const eyeLens = new THREE.Mesh(lensGeo, lensMat);
    eyeLens.position.set(0, 0, 2.0 * zScale);
    eyeGroup.add(eyeLens);

    // Retina (Back surface, amber yellow)
    const retinaGeo = new THREE.SphereGeometry(3.4, 32, 16, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.4);
    retinaGeo.scale(1.0, 1.0, zScale);
    const retinaMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, side: THREE.BackSide });
    const retina = new THREE.Mesh(retinaGeo, retinaMat);
    eyeGroup.add(retina);

    // Corrective Glass Lens in front if selected
    if (correctiveLens !== "none") {
      const cGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.2, 32);
      cGeo.rotateX(Math.PI / 2);
      const cMat = new THREE.MeshStandardMaterial({
        color: correctiveLens === "concave" ? 0x22d3ee : 0xa855f7,
        transparent: true,
        opacity: 0.5
      });
      const glass = new THREE.Mesh(cGeo, cMat);
      glass.position.set(0, 0, 5.2);
      eyeGroup.add(glass);
    }

    // Light Rays Line Simulation
    // Rays enter from z = 7 down into the eye
    const rayMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    
    // Convergence point: Normal lands on retina (z = -3.4 * zScale)
    // Myopia lands in front (z = -1.5) unless concave lens corrects it
    // Hypermetropia lands behind (z = -4.8) unless convex lens corrects it
    let focalZ = -3.4 * zScale;
    if (eyeCondition === "myopia") {
      focalZ = correctiveLens === "concave" ? -3.4 * zScale : -1.0;
    } else if (eyeCondition === "hypermetropia") {
      focalZ = correctiveLens === "convex" ? -3.4 * zScale : -4.8;
    }

    [-1.2, 0, 1.2].forEach(xOffset => {
      const points = [
        new THREE.Vector3(xOffset, 1.0, 7.5),
        new THREE.Vector3(xOffset * 0.8, 0.8, 2.0 * zScale),
        new THREE.Vector3(0, 0, focalZ)
      ];
      const rayGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(rayGeo, rayMat);
      eyeGroup.add(line);
    });

    scene.add(eyeGroup);
    meshesRef.current["main"] = eyeGroup;
  };

  // Build 3D Plant Stomata (Guard Cells swelling/closing)
  const build3DStomata = (scene: THREE.Scene) => {
    const stomataGroup = new THREE.Group();

    // Guard cell opening gap based on turgidity
    const aperture = (turgidity / 100) * 1.4;

    // Left Guard Cell (Crescent Torus)
    const leftGeo = new THREE.TorusGeometry(2.5, 0.7, 16, 32, Math.PI * 0.85);
    const cellMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.35,
      metalness: 0.05
    });
    const leftCell = new THREE.Mesh(leftGeo, cellMat);
    leftCell.position.set(-aperture, 0, 0);
    leftCell.rotation.z = Math.PI * 0.58;
    stomataGroup.add(leftCell);

    // Right Guard Cell (Opposing Crescent)
    const rightCell = leftCell.clone();
    rightCell.position.set(aperture, 0, 0);
    rightCell.rotation.z = -Math.PI * 0.42;
    stomataGroup.add(rightCell);

    // Chloroplast dots inside guard cells
    [-1, 0, 1].forEach(offset => {
      const chloroGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const chloroMat = new THREE.MeshStandardMaterial({ color: 0x14532d });
      const c1 = new THREE.Mesh(chloroGeo, chloroMat);
      c1.position.set(-aperture - 1.2, offset * 1.1, 0.3);
      stomataGroup.add(c1);

      const c2 = new THREE.Mesh(chloroGeo, chloroMat);
      c2.position.set(aperture + 1.2, offset * 1.1, 0.3);
      stomataGroup.add(c2);
    });

    scene.add(stomataGroup);
    meshesRef.current["main"] = stomataGroup;
  };

  // Animation Loop: Pumping heartbeat & smooth rotation
  useEffect(() => {
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // If Heart model and isPumping is active, apply diastolic/systolic scale pulse
      if (modelType === "heart" && isPumping && meshesRef.current["main"]) {
        const freq = (bpm / 60) * Math.PI * 2;
        const pulse = 1.0 + Math.sin(time * freq) * 0.06;
        meshesRef.current["main"].scale.set(pulse, pulse, pulse);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [modelType, isPumping, bpm]);

  return (
    <div className="space-y-6">
      {/* Specimen Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setModelType("heart"); setSelectedPart("Overview"); }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border",
              modelType === "heart"
                ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/25"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            )}
          >
            <Heart className="h-4 w-4" /> 3D Human Heart (Double Circulation)
          </button>
          <button
            onClick={() => { setModelType("eye"); setSelectedPart("Overview"); }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border",
              modelType === "eye"
                ? "bg-sky-600 border-sky-500 text-white shadow-lg shadow-sky-600/25"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            )}
          >
            <Eye className="h-4 w-4" /> 3D Human Eye & Optics Defects
          </button>
          <button
            onClick={() => { setModelType("stomata"); setSelectedPart("Overview"); }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border",
              modelType === "stomata"
                ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/25"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            )}
          >
            <Sparkles className="h-4 w-4" /> 3D Stomata & Guard Cell Turgor
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono">
          Interactive WebGL 3D • Drag mouse to rotate
        </span>
      </div>

      {/* Main 3D Canvas + Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D WebGL Canvas */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-800 bg-[#060814] p-2 relative overflow-hidden shadow-2xl">
          <div 
            ref={canvasContainerRef} 
            className="w-full h-[460px] rounded-2xl cursor-grab active:cursor-grabbing relative"
          />

          {/* Model Floating Badge */}
          <div className="absolute top-5 left-5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs font-bold text-slate-200 pointer-events-none flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-indigo-400" />
            <span>{modelType === "heart" ? "Human Heart (4 Chambers)" : modelType === "eye" ? "Human Eyeball (Ray Optics)" : "Stomatal Pore"}</span>
          </div>
        </div>

        {/* Right: Specimen Parameters & CBSE Insights */}
        <div className="lg:col-span-4 space-y-4">
          {modelType === "heart" && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <Heart className="h-4 w-4" /> Cardiac Controls & Circulation
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">Rhythmic Pumping</span>
                  <button
                    onClick={() => setIsPumping(!isPumping)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                  >
                    {isPumping ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Heart Rate (BPM)</span>
                    <span className="font-mono text-rose-400 font-bold">{bpm} BPM</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={140}
                    value={bpm}
                    onChange={e => setBpm(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-slate-200">CBSE Double Circulation Rules:</div>
                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                  <span><strong>Pulmonary:</strong> Deox blood from RV travels via Pulmonary Artery to lungs.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1" />
                  <span><strong>Systemic:</strong> Oxygenated blood from LA passes to LV, pumped via Aorta under high pressure.</span>
                </div>
              </div>
            </div>
          )}

          {modelType === "eye" && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <Eye className="h-4 w-4" /> Optical Defect & Correction Lab
              </h4>

              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300">Visual Defect Simulation:</div>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                  {[
                    { id: "normal", label: "Normal" },
                    { id: "myopia", label: "Myopia" },
                    { id: "hypermetropia", label: "Hypermetro." }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setEyeCondition(c.id as any)}
                      className={cn(
                        "p-2 rounded-xl border text-center transition",
                        eyeCondition === c.id
                          ? "bg-sky-600 border-sky-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-bold text-slate-300 pt-2">Corrective Spectacle Lens:</div>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                  {[
                    { id: "none", label: "None" },
                    { id: "concave", label: "Concave" },
                    { id: "convex", label: "Convex" }
                  ].map(l => (
                    <button
                      key={l.id}
                      onClick={() => setCorrectiveLens(l.id as any)}
                      className={cn(
                        "p-2 rounded-xl border text-center transition",
                        correctiveLens === l.id
                          ? "bg-purple-600 border-purple-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-amber-400">Ray Convergence Status:</div>
                {eyeCondition === "normal" && (
                  <p className="text-emerald-400">✓ Rays converge precisely on the Retina surface.</p>
                )}
                {eyeCondition === "myopia" && correctiveLens !== "concave" && (
                  <p className="text-rose-400">⚠️ Rays converge in front of Retina (Eyeball elongated). Apply a Concave diverging lens to correct.</p>
                )}
                {eyeCondition === "myopia" && correctiveLens === "concave" && (
                  <p className="text-emerald-400">✓ Concave lens diverges rays outward, shifting focus backward exactly onto Retina!</p>
                )}
                {eyeCondition === "hypermetropia" && correctiveLens !== "convex" && (
                  <p className="text-rose-400">⚠️ Rays converge behind Retina (Eyeball too short). Apply a Convex converging lens to correct.</p>
                )}
                {eyeCondition === "hypermetropia" && correctiveLens === "convex" && (
                  <p className="text-emerald-400">✓ Convex lens pre-converges rays, bringing the focal point forward onto Retina!</p>
                )}
              </div>
            </div>
          )}

          {modelType === "stomata" && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Guard Cell Turgor Pressure
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Water Influx & Turgidity</span>
                  <span className="font-mono text-emerald-400 font-bold">{turgidity}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={turgidity}
                  onChange={e => setTurgidity(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-slate-200">Stomatal Mechanism:</div>
                <p className="text-slate-300 leading-relaxed">
                  When guard cells absorb water by endosmosis, their thin outer walls stretch outwards while thick elastic inner walls bow apart, <strong>opening the stomatal pore</strong> for CO₂ entry and transpiration.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
