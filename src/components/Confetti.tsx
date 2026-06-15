"use client";

import { useEffect, useRef } from "react";

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
}

export default function Confetti({ active, onComplete }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
    if (active) {
      initConfetti();
    }
  }, [active]);

  const colors = [
    "#f43f5e", // rose-500
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#eab308", // yellow-500
    "#a855f7", // purple-500
    "#ff7849", // orange
    "#ff49db", // pink
  ];

  const initConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resize canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Generate particles
    const list: Particle[] = [];
    const count = 120;
    
    // Confetti bursts from bottom corners and center
    for (let i = 0; i < count; i++) {
      const isLeft = i < count / 3;
      const isRight = i > (2 * count) / 3;
      
      let startX = window.innerWidth / 2;
      let startY = window.innerHeight + 10;
      let speedX = (Math.random() - 0.5) * 15;
      let speedY = -Math.random() * 20 - 15;

      if (isLeft) {
        startX = 0;
        startY = window.innerHeight - 50;
        speedX = Math.random() * 15 + 5;
        speedY = -Math.random() * 20 - 15;
      } else if (isRight) {
        startX = window.innerWidth;
        startY = window.innerHeight - 50;
        speedX = -Math.random() * 15 - 5;
        speedY = -Math.random() * 20 - 15;
      }

      list.push({
        x: startX,
        y: startY,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: speedX,
        speedY: speedY,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        wobble: Math.random() * Math.PI,
        wobbleSpeed: Math.random() * 0.1 + 0.05
      });
    }

    particlesRef.current = list;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    tick();
  };

  const tick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    let particlesStillActive = false;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Gravity and air resistance
      p.speedY += 0.45; // gravity
      p.speedX *= 0.98; // friction
      p.speedY *= 0.98;

      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;

      // Draw particle
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      
      const width = p.size * Math.sin(p.wobble);
      const height = p.size;

      ctx.fillStyle = p.color;
      ctx.fillRect(-width / 2, -height / 2, width, height);
      ctx.restore();

      // Check if particle is on screen
      if (p.y < window.innerHeight + 50 && p.x > -50 && p.x < window.innerWidth + 50) {
        particlesStillActive = true;
      }
    }

    if (particlesStillActive && activeRef.current) {
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (onComplete) {
        onComplete();
      }
    }
  };

  // Keep responsive on resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ display: active ? "block" : "none" }}
    />
  );
}
