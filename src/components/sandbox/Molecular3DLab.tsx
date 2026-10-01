"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Atom, Compass, Layers, Sliders, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type MoleculeType = "water" | "methane" | "co2" | "ammonia" | "nacl";

interface MoleculeData {
  name: string;
  formula: string;
  geometry: string;
  bondAngle: string;
  bondingType: string;
  description: string;
  cbseTip: string;
}

const MOLECULES: { [key in MoleculeType]: MoleculeData } = {
  water: {
    name: "Water Molecule",
    formula: "H₂O",
    geometry: "Bent / V-Shaped",
    bondAngle: "104.5°",
    bondingType: "Polar Covalent Bonds",
    description: "Two single O-H covalent bonds. Two lone pairs on oxygen repel bonding pairs, compressing the tetrahedral angle from 109.5° to 104.5°.",
    cbseTip: "High dielectric constant and hydrogen bonding make water a universal solvent."
  },
  methane: {
    name: "Methane Molecule",
    formula: "CH₄",
    geometry: "Regular Tetrahedral",
    bondAngle: "109.5°",
    bondingType: "Non-polar Covalent Bonds (sp³)",
    description: "Carbon shares 4 valence electrons with 4 Hydrogen atoms. Minimal electron repulsion achieves perfect tetrahedral symmetry.",
    cbseTip: "Principal component of Compressed Natural Gas (CNG) and Biogas."
  },
  co2: {
    name: "Carbon Dioxide",
    formula: "CO₂",
    geometry: "Linear",
    bondAngle: "180.0°",
    bondingType: "Covalent Double Bonds (O=C=O)",
    description: "Carbon forms two double covalent bonds with oxygen atoms. The linear geometry cancels out individual bond dipoles, resulting in net zero dipole moment.",
    cbseTip: "Turns lime water milky due to insoluble CaCO₃ precipitate formation."
  },
  ammonia: {
    name: "Ammonia Molecule",
    formula: "NH₃",
    geometry: "Trigonal Pyramidal",
    bondAngle: "107.0°",
    bondingType: "Polar Covalent Bonds",
    description: "Nitrogen has 3 bonding pairs and 1 lone pair. The lone pair-bond pair repulsion reduces the bond angle to 107°.",
    cbseTip: "Basic in nature; reacts with HCl gas to produce dense white fumes of NH₄Cl."
  },
  nacl: {
    name: "Sodium Chloride Crystal Lattice",
    formula: "NaCl",
    geometry: "Face-Centered Cubic (FCC) Ionic Lattice",
    bondAngle: "90.0°",
    bondingType: "Electrostatic Ionic Bond (Na⁺ - Cl⁻)",
    description: "Three-dimensional alternating array of Na⁺ (smaller cations) and Cl⁻ (larger anions). Each Na⁺ is coordinated by 6 Cl⁻ ions.",
    cbseTip: "Does not conduct electricity in solid state, but conducts in molten state or aqueous solution due to free mobile ions."
  }
};

export default function Molecular3DLab() {
  const [molecule, setMolecule] = useState<MoleculeType>("water");
  const [autoRotate, setAutoRotate] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060814);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 12);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 2.0);
    dirLight1.position.set(10, 10, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 1.5);
    dirLight2.position.set(-10, -10, 10);
    scene.add(dirLight2);

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !groupRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      groupRef.current.rotation.y += deltaX * 0.01;
      groupRef.current.rotation.x += deltaY * 0.01;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

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

  // Helper to draw a bond rod between 2 points
  const createBond = (p1: THREE.Vector3, p2: THREE.Vector3, radius = 0.12, color = 0x94a3b8) => {
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const length = dir.length();
    const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const geo = new THREE.CylinderGeometry(radius, radius, length, 16);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2 });
    const cylinder = new THREE.Mesh(geo, mat);

    cylinder.position.copy(center);
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return cylinder;
  };

  // Helper to create an atom sphere
  const createAtom = (pos: THREE.Vector3, radius: number, color: number) => {
    const geo = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.1 });
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.copy(pos);
    return sphere;
  };

  // Build molecule mesh
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (groupRef.current) {
      scene.remove(groupRef.current);
    }

    const group = new THREE.Group();
    groupRef.current = group;

    if (molecule === "water") {
      // Oxygen in center
      const oPos = new THREE.Vector3(0, 0.4, 0);
      const h1Pos = new THREE.Vector3(-1.6, -0.8, 0);
      const h2Pos = new THREE.Vector3(1.6, -0.8, 0);

      group.add(createAtom(oPos, 1.1, 0xef4444)); // Oxygen Red
      group.add(createAtom(h1Pos, 0.65, 0xffffff)); // Hydrogen White
      group.add(createAtom(h2Pos, 0.65, 0xffffff));

      group.add(createBond(oPos, h1Pos));
      group.add(createBond(oPos, h2Pos));
    } else if (molecule === "co2") {
      // Carbon in center, Oxygens at +3 and -3
      const cPos = new THREE.Vector3(0, 0, 0);
      const o1Pos = new THREE.Vector3(-2.8, 0, 0);
      const o2Pos = new THREE.Vector3(2.8, 0, 0);

      group.add(createAtom(cPos, 1.0, 0x475569)); // Carbon Grey
      group.add(createAtom(o1Pos, 1.0, 0xef4444)); // Oxygen
      group.add(createAtom(o2Pos, 1.0, 0xef4444));

      // Double bonds
      group.add(createBond(new THREE.Vector3(0, 0.2, 0), new THREE.Vector3(-2.8, 0.2, 0), 0.08));
      group.add(createBond(new THREE.Vector3(0, -0.2, 0), new THREE.Vector3(-2.8, -0.2, 0), 0.08));
      group.add(createBond(new THREE.Vector3(0, 0.2, 0), new THREE.Vector3(2.8, 0.2, 0), 0.08));
      group.add(createBond(new THREE.Vector3(0, -0.2, 0), new THREE.Vector3(2.8, -0.2, 0), 0.08));
    } else if (molecule === "methane") {
      // Carbon in center, 4 Hydrogens tetrahedral
      const cPos = new THREE.Vector3(0, 0, 0);
      const hPositions = [
        new THREE.Vector3(0, 2.0, 0),
        new THREE.Vector3(1.9, -0.7, 0),
        new THREE.Vector3(-0.95, -0.7, 1.65),
        new THREE.Vector3(-0.95, -0.7, -1.65)
      ];

      group.add(createAtom(cPos, 1.0, 0x475569));
      hPositions.forEach(hPos => {
        group.add(createAtom(hPos, 0.6, 0xffffff));
        group.add(createBond(cPos, hPos));
      });
    } else if (molecule === "ammonia") {
      // Nitrogen at top, 3 Hydrogens at base
      const nPos = new THREE.Vector3(0, 0.8, 0);
      const hPositions = [
        new THREE.Vector3(1.6, -0.8, 0),
        new THREE.Vector3(-0.8, -0.8, 1.4),
        new THREE.Vector3(-0.8, -0.8, -1.4)
      ];

      group.add(createAtom(nPos, 1.0, 0x3b82f6)); // Nitrogen Blue
      hPositions.forEach(hPos => {
        group.add(createAtom(hPos, 0.6, 0xffffff));
        group.add(createBond(nPos, hPos));
      });
    } else if (molecule === "nacl") {
      // 3x3x3 Cubic crystal lattice
      const step = 1.5;
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const isNa = (x + y + z) % 2 === 0;
            const pos = new THREE.Vector3(x * step, y * step, z * step);
            const radius = isNa ? 0.35 : 0.55;
            const color = isNa ? 0xa855f7 : 0x22c55e; // Na+ Purple, Cl- Green
            group.add(createAtom(pos, radius, color));

            // Add connective lattice rods
            if (x < 1) group.add(createBond(pos, new THREE.Vector3((x + 1) * step, y * step, z * step), 0.04, 0x64748b));
            if (y < 1) group.add(createBond(pos, new THREE.Vector3(x * step, (y + 1) * step, z * step), 0.04, 0x64748b));
            if (z < 1) group.add(createBond(pos, new THREE.Vector3(x * step, y * step, (z + 1) * step), 0.04, 0x64748b));
          }
        }
      }
    }

    scene.add(group);
  }, [molecule]);

  // Animation Loop
  useEffect(() => {
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (autoRotate && groupRef.current) {
        groupRef.current.rotation.y += 0.005;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [autoRotate]);

  const currentData = MOLECULES[molecule];

  return (
    <div className="space-y-6">
      {/* Molecule Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {(["water", "methane", "co2", "ammonia", "nacl"] as const).map(mKey => (
          <button
            key={mKey}
            onClick={() => setMolecule(mKey)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border flex items-center gap-2",
              molecule === mKey
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            )}
          >
            <Atom className="h-4 w-4" />
            <span>{MOLECULES[mKey].name}</span>
            <span className="font-mono text-[11px] text-indigo-300">({MOLECULES[mKey].formula})</span>
          </button>
        ))}
      </div>

      {/* 3D Viewport & Chemical Data */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D WebGL Canvas */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-800 bg-[#060814] p-2 relative overflow-hidden shadow-2xl">
          <div 
            ref={containerRef} 
            className="w-full h-[460px] rounded-2xl cursor-grab active:cursor-grabbing relative"
          />

          {/* Floating HUD info */}
          <div className="absolute top-5 left-5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs font-bold text-slate-200 pointer-events-none flex items-center gap-2">
            <Compass className="h-4 w-4 text-indigo-400" />
            <span>{currentData.name} ({currentData.formula}) • {currentData.geometry}</span>
          </div>

          <div className="absolute bottom-5 right-5 flex items-center gap-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 backdrop-blur-md transition"
            >
              {autoRotate ? "Pause Spin" : "Auto Spin"}
            </button>
          </div>
        </div>

        {/* Right: Structural & CBSE Details */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              VSEPR Theory & Bonding
            </span>
            <h3 className="text-xl font-black text-white mt-0.5">{currentData.name}</h3>
            <span className="font-mono text-xs text-amber-400 font-bold">{currentData.formula}</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-slate-400">Molecular Geometry:</span>
              <span className="font-bold text-slate-200">{currentData.geometry}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-slate-400">Bond Angle:</span>
              <span className="font-bold font-mono text-emerald-400">{currentData.bondAngle}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-slate-400">Bonding Type:</span>
              <span className="font-bold text-slate-200">{currentData.bondingType}</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-300 leading-relaxed space-y-1">
            <div className="font-bold text-slate-200">Orbital & Electron Distribution:</div>
            <p className="text-slate-400">{currentData.description}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> CBSE Board Tip
            </div>
            <p className="leading-relaxed">{currentData.cbseTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
