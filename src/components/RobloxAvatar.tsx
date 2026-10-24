"use client";

import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

export type RobloxFaceType =
  | "smile"
  | "cool"
  | "wink"
  | "star"
  | "ninja"
  | "fire"
  | "laser"
  | "classic"
  | "chill"
  | "genius"
  | "laugh"
  | (string & {});

export type RobloxHatType =
  | "none"
  | "scholar"
  | "crown"
  | "cyber"
  | "astro"
  | "headphones"
  | "halo"
  | "wizard"
  | (string & {});

export type RobloxOutfitType =
  | "default"
  | "noob"
  | "suit"
  | "labcoat"
  | "cyber"
  | "golden"
  | (string & {});

export type RobloxGearType =
  | "none"
  | "trophy"
  | "flask"
  | "wand"
  | "sword"
  | "book"
  | (string & {});

export type RobloxPoseType =
  | "idle"
  | "wave"
  | "hero"
  | "dance"
  | "cheer"
  | "levitate"
  | (string & {});

export interface RobloxAvatarConfig {
  bodyColor?: string;
  headColor?: string;
  torsoColor?: string;
  leftArmColor?: string;
  rightArmColor?: string;
  leftLegColor?: string;
  rightLegColor?: string;
  face?: RobloxFaceType;
  hat?: RobloxHatType;
  outfit?: RobloxOutfitType;
  gear?: RobloxGearType;
  pose?: RobloxPoseType;
  autoRotate?: boolean;
  [key: string]: any;
}

export const DEFAULT_ROBLOX_CONFIG: RobloxAvatarConfig = {
  bodyColor: "#f1f3f6",
  face: "classic",
  hat: "scholar",
  outfit: "default",
  gear: "none",
  pose: "idle",
  autoRotate: false,
};

interface RobloxAvatarProps {
  config?: RobloxAvatarConfig;
  className?: string;
  interactive?: boolean;
  size?: "sm" | "md" | "lg" | "full";
  showControls?: boolean;
  [key: string]: any;
}

// Helper to create face canvas texture
function createFaceTexture(faceType: RobloxFaceType = "classic"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.clearRect(0, 0, 256, 256);

  ctx.fillStyle = "#0f172a";
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";

  if (faceType === "chill" || faceType === "cool") {
    // Cool sunglasses
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(40, 75, 75, 45);
    ctx.fillRect(141, 75, 75, 45);
    ctx.fillRect(110, 85, 36, 12);
    // Highlights
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(50, 85);
    ctx.lineTo(85, 110);
    ctx.moveTo(151, 85);
    ctx.lineTo(186, 110);
    ctx.stroke();
    // Smirk
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(135, 160, 45, 0.1 * Math.PI, 0.65 * Math.PI, false);
    ctx.stroke();
  } else if (faceType === "genius") {
    // Spectacles
    ctx.lineWidth = 7;
    ctx.strokeStyle = "#475569";
    ctx.beginPath();
    ctx.arc(80, 95, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(176, 95, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(110, 95);
    ctx.lineTo(146, 95);
    ctx.stroke();
    // Eyes behind glass
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(80, 95, 10, 0, Math.PI * 2);
    ctx.arc(176, 95, 10, 0, Math.PI * 2);
    ctx.fill();
    // Studious slight smile
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(128, 160, 36, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else if (faceType === "laser" || faceType === "star") {
    // Star eyes
    const drawStar = (cx: number, cy: number, spikes: number, outer: number, inner: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outer);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outer;
        y = cy + Math.sin(rot) * outer;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * inner;
        y = cy + Math.sin(rot) * inner;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outer);
      ctx.closePath();
      ctx.fillStyle = "#f59e0b";
      ctx.fill();
    };
    drawStar(75, 95, 5, 32, 14);
    drawStar(181, 95, 5, 32, 14);
    // Excited open mouth
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(128, 160, 42, 0, Math.PI, false);
    ctx.fill();
  } else if (faceType === "wink") {
    // Left eye winking
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(55, 95);
    ctx.quadraticCurveTo(75, 75, 95, 95);
    ctx.stroke();
    // Right eye open
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.ellipse(176, 95, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    // Big happy smile
    ctx.beginPath();
    ctx.arc(128, 155, 45, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  } else {
    // Classic Scholar Smile
    ctx.fillStyle = "#0f172a";
    // Left eye
    ctx.beginPath();
    ctx.ellipse(78, 95, 12, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.ellipse(178, 95, 12, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    // Classic U smile
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(128, 150, 44, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function RobloxAvatar({
  config = DEFAULT_ROBLOX_CONFIG,
  className,
  interactive = true,
  size = "md",
}: RobloxAvatarProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseXRef = useRef<number>(0);
  const rotationYRef = useRef<number>(0.2);

  const activeConfig = { ...DEFAULT_ROBLOX_CONFIG, ...config };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 350;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(4, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.6);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xc084fc, 0.8);
    fillLight.position.set(0, -3, 3);
    scene.add(fillLight);

    // Ground podium
    const podiumGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.15, 32);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.8,
      roughness: 0.2,
    });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.y = -1.55;
    scene.add(podium);

    // Podium glowing rim
    const ringGeo = new THREE.TorusGeometry(1.65, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x6366f1 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.48;
    scene.add(ring);

    // 3. Build R6 Blocky Character Group
    const charGroup = new THREE.Group();
    characterGroupRef.current = charGroup;
    scene.add(charGroup);

    // Outfit Colors Calculation
    const outfit = activeConfig.outfit || "default";
    let torsoColor = activeConfig.torsoColor || activeConfig.bodyColor || "#f1f3f6";
    let legColor = activeConfig.leftLegColor || "#475569";
    let skinColor = activeConfig.bodyColor || "#f1f3f6";

    if (outfit === "noob") {
      skinColor = "#f5cd2f";
      torsoColor = "#0284c7";
      legColor = "#16a34a";
    } else if (outfit === "suit") {
      torsoColor = "#1e293b";
      legColor = "#0f172a";
    } else if (outfit === "labcoat") {
      torsoColor = "#f8fafc";
      legColor = "#0f172a";
    } else if (outfit === "cyber") {
      torsoColor = "#0f172a";
      legColor = "#090d16";
    } else if (outfit === "golden") {
      torsoColor = "#f59e0b";
      legColor = "#b45309";
    }

    const skinMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.4,
    });

    const torsoMat = new THREE.MeshStandardMaterial({
      color: torsoColor,
      roughness: 0.5,
    });

    const legMat = new THREE.MeshStandardMaterial({
      color: legColor,
      roughness: 0.6,
    });

    // TORSO: 2 x 2 x 1 (R6 proportion standard: 1.2 x 1.2 x 0.6 scaled)
    const torsoGeo = new THREE.BoxGeometry(1.2, 1.25, 0.62);
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.y = 0;
    charGroup.add(torsoMesh);

    // HEAD: 1 x 1 x 1 cube (scaled 0.9 x 0.9 x 0.9)
    const headGeo = new THREE.BoxGeometry(0.88, 0.88, 0.88);
    const faceTex = createFaceTexture(activeConfig.face);
    const headMaterials = [
      skinMat, // right
      skinMat, // left
      skinMat, // top
      skinMat, // bottom
      new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.4 }), // front face
      skinMat, // back
    ];
    const headMesh = new THREE.Mesh(headGeo, headMaterials);
    headMesh.position.y = 1.1;
    charGroup.add(headMesh);

    // HATS & HEADGEAR
    const hat = activeConfig.hat;
    if (hat === "scholar") {
      // Graduation Mortarboard Cap
      const capGroup = new THREE.Group();
      const boardGeo = new THREE.BoxGeometry(1.3, 0.08, 1.3);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.3 });
      const board = new THREE.Mesh(boardGeo, capMat);
      board.position.y = 1.58;
      board.rotation.y = Math.PI / 4;
      capGroup.add(board);

      const skullGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.25, 16);
      const skull = new THREE.Mesh(skullGeo, capMat);
      skull.position.y = 1.48;
      capGroup.add(skull);

      // Gold tassel
      const tasselGeo = new THREE.CylinderGeometry(0.02, 0.04, 0.4, 8);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7 });
      const tassel = new THREE.Mesh(tasselGeo, goldMat);
      tassel.position.set(0.48, 1.42, 0.48);
      capGroup.add(tassel);
      charGroup.add(capGroup);
    } else if (hat === "crown") {
      // Imperial Gold Crown
      const crownGeo = new THREE.CylinderGeometry(0.5, 0.46, 0.35, 8);
      const crownMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.9,
        roughness: 0.2,
      });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.y = 1.62;
      charGroup.add(crown);
    } else if (hat === "cyber") {
      // Cyber Neon Visor
      const visorGeo = new THREE.BoxGeometry(0.94, 0.22, 0.55);
      const visorMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 1.1, 0.24);
      charGroup.add(visor);
    } else if (hat === "halo") {
      // Floating Gold Halo
      const haloGeo = new THREE.TorusGeometry(0.55, 0.04, 16, 32);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 1.85;
      charGroup.add(halo);
    } else if (hat === "headphones") {
      // RGB Study Headphones
      const hpGroup = new THREE.Group();
      const bandGeo = new THREE.TorusGeometry(0.52, 0.05, 8, 24, Math.PI);
      const hpMat = new THREE.MeshStandardMaterial({ color: 0xa855f7 });
      const band = new THREE.Mesh(bandGeo, hpMat);
      band.position.y = 1.16;
      hpGroup.add(band);

      const earGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
      const leftEar = new THREE.Mesh(earGeo, hpMat);
      leftEar.rotation.z = Math.PI / 2;
      leftEar.position.set(-0.48, 1.1, 0);
      hpGroup.add(leftEar);

      const rightEar = leftEar.clone();
      rightEar.position.set(0.48, 1.1, 0);
      hpGroup.add(rightEar);
      charGroup.add(hpGroup);
    } else if (hat === "wizard") {
      // Arcane Wizard Hat
      const wizGeo = new THREE.ConeGeometry(0.55, 1.0, 16);
      const wizMat = new THREE.MeshStandardMaterial({ color: 0x6b21a8 });
      const wizHat = new THREE.Mesh(wizGeo, wizMat);
      wizHat.position.y = 1.95;
      charGroup.add(wizHat);
      const brimGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.05, 16);
      const brim = new THREE.Mesh(brimGeo, wizMat);
      brim.position.y = 1.48;
      charGroup.add(brim);
    }

    // LEFT ARM Group
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.85, 0.5, 0);
    const armGeo = new THREE.BoxGeometry(0.5, 1.25, 0.5);
    const leftArmMesh = new THREE.Mesh(armGeo, skinMat);
    leftArmMesh.position.y = -0.5;
    leftArmGroup.add(leftArmMesh);
    charGroup.add(leftArmGroup);
    leftArmRef.current = leftArmGroup;

    // RIGHT ARM Group (Holding Gear)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.85, 0.5, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, skinMat);
    rightArmMesh.position.y = -0.5;
    rightArmGroup.add(rightArmMesh);

    // GEAR
    const gear = activeConfig.gear;
    if (gear === "trophy") {
      const cupGeo = new THREE.CylinderGeometry(0.2, 0.1, 0.35, 16);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
      const trophy = new THREE.Mesh(cupGeo, goldMat);
      trophy.position.set(0, -1.0, 0.3);
      rightArmGroup.add(trophy);
    } else if (gear === "sword") {
      const bladeGeo = new THREE.BoxGeometry(0.08, 0.9, 0.04);
      const bladeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const sword = new THREE.Mesh(bladeGeo, bladeMat);
      sword.position.set(0, -0.9, 0.35);
      rightArmGroup.add(sword);
    } else if (gear === "flask") {
      const flaskGeo = new THREE.ConeGeometry(0.2, 0.35, 16);
      const flaskMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const flask = new THREE.Mesh(flaskGeo, flaskMat);
      flask.position.set(0, -1.0, 0.3);
      rightArmGroup.add(flask);
    } else if (gear === "wand") {
      const wandGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
      const wandMat = new THREE.MeshStandardMaterial({ color: 0xa855f7 });
      const wand = new THREE.Mesh(wandGeo, wandMat);
      wand.position.set(0, -0.9, 0.35);
      rightArmGroup.add(wand);
    } else if (gear === "book") {
      const bookGeo = new THREE.BoxGeometry(0.2, 0.45, 0.35);
      const bookMat = new THREE.MeshStandardMaterial({ color: 0x991b1b });
      const book = new THREE.Mesh(bookGeo, bookMat);
      book.position.set(0, -0.9, 0.3);
      rightArmGroup.add(book);
    }

    charGroup.add(rightArmGroup);
    rightArmRef.current = rightArmGroup;

    // LEFT LEG
    const legGeo = new THREE.BoxGeometry(0.55, 1.25, 0.55);
    const leftLegMesh = new THREE.Mesh(legGeo, legMat);
    leftLegMesh.position.set(-0.32, -1.18, 0);
    charGroup.add(leftLegMesh);

    // RIGHT LEG
    const rightLegMesh = new THREE.Mesh(legGeo, legMat);
    rightLegMesh.position.set(0.32, -1.18, 0);
    charGroup.add(rightLegMesh);

    // Pose adjustments
    const pose = activeConfig.pose || "idle";
    if (pose === "wave") {
      rightArmGroup.rotation.z = 2.4;
      rightArmGroup.rotation.x = -0.3;
    } else if (pose === "cheer") {
      leftArmGroup.rotation.z = 2.5;
      rightArmGroup.rotation.z = -2.5;
    } else if (pose === "hero") {
      leftArmGroup.rotation.z = 0.4;
      rightArmGroup.rotation.z = -0.4;
      charGroup.rotation.y = 0.35;
    }

    // 4. Interactive Drag rotation
    const onMouseDown = (e: MouseEvent) => {
      if (!interactive) return;
      isDraggingRef.current = true;
      prevMouseXRef.current = e.clientX;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMouseXRef.current;
      prevMouseXRef.current = e.clientX;
      rotationYRef.current += deltaX * 0.012;
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Touch support for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (!interactive || !e.touches[0]) return;
      isDraggingRef.current = true;
      prevMouseXRef.current = e.touches[0].clientX;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !e.touches[0]) return;
      const deltaX = e.touches[0].clientX - prevMouseXRef.current;
      prevMouseXRef.current = e.touches[0].clientX;
      rotationYRef.current += deltaX * 0.012;
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // 5. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (charGroup) {
        // Auto rotate if config enabled and not manually dragging
        if (activeConfig.autoRotate && !isDraggingRef.current) {
          rotationYRef.current += 0.01;
        }
        charGroup.rotation.y = rotationYRef.current;

        // Idle breathing / floating effect
        if (pose === "levitate") {
          charGroup.position.y = Math.sin(elapsedTime * 2.5) * 0.18 + 0.1;
        } else {
          charGroup.position.y = Math.sin(elapsedTime * 2.0) * 0.04;
        }

        // Wave animation
        if (pose === "wave" && rightArmRef.current) {
          rightArmRef.current.rotation.z = 2.4 + Math.sin(elapsedTime * 6.0) * 0.25;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 350;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      domElement.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [
    activeConfig.bodyColor,
    activeConfig.face,
    activeConfig.hat,
    activeConfig.outfit,
    activeConfig.gear,
    activeConfig.pose,
    activeConfig.autoRotate,
    interactive,
  ]);

  return (
    <div
      ref={mountRef}
      className={cn(
        "relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none",
        className
      )}
    />
  );
}
