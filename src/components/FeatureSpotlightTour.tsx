"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Check, 
  Camera, 
  Flame, 
  BookOpen, 
  Brain, 
  Award, 
  Layers, 
  Users, 
  Compass, 
  LucideIcon
} from "lucide-react";
import Confetti from "./Confetti";

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  preferredPosition?: "top" | "bottom" | "left" | "right" | "auto";
}

const DEFAULT_TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-streak-header",
    title: "Daily Streak & Habit Tracker",
    description: "Keep your daily study momentum going! Complete daily quests and active recall sessions to increase your streak and earn multiplier XP.",
    icon: Flame,
    badge: "Habit Engine",
    preferredPosition: "bottom"
  },
  {
    targetId: "tour-stats-hud",
    title: "Level & XP Command Deck",
    description: "Your academic progress at a glance. Level up from Study Novice to Grandmaster Scholar as you master concepts and syllabus chapters.",
    icon: Brain,
    badge: "Progression HUD",
    preferredPosition: "bottom"
  },
  {
    targetId: "tour-quick-lens",
    title: "AI Doubt-Solver Lens",
    description: "Stuck on a tricky textbook diagram or math problem? Snap a photo or crop an area to get instant step-by-step AI breakdown!",
    icon: Camera,
    badge: "AI Vision Tool",
    preferredPosition: "bottom"
  },
  {
    targetId: "tour-tools-aibot",
    title: "24/7 AI Personal Tutor",
    description: "Ask any academic doubt, request practice quizzes, or ask for analogies in your regional language anytime without hesitation.",
    icon: Sparkles,
    badge: "Instant Mentor",
    preferredPosition: "bottom"
  },
  {
    targetId: "tour-daily-quests",
    title: "Daily NCERT Quests & Gamification",
    description: "Complete targeted daily missions and active recall tasks to level up faster, unlock exclusive titles, and build winning study habits.",
    icon: Layers,
    badge: "Active Quests",
    preferredPosition: "top"
  },
  {
    targetId: "tour-leaderboard-section",
    title: "Live Leaderboard & Study Circles",
    description: "Study alongside your batchmates, compete on the XP leaderboard, or join 1v1 live quiz duels in collaborative study rooms!",
    icon: Users,
    badge: "Multiplayer Arena",
    preferredPosition: "top"
  }
];

interface FeatureSpotlightTourProps {
  steps?: TourStep[];
  tourKey?: string;
  onClose?: () => void;
}

export default function FeatureSpotlightTour({ 
  steps = DEFAULT_TOUR_STEPS,
  tourKey = "edutrack_feature_spotlight_completed",
  onClose
}: FeatureSpotlightTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ 
    top: number; 
    left: number; 
    placement: "top" | "bottom" | "left" | "right";
    arrowLeft: number;
    arrowTop: number;
  }>({
    top: 0,
    left: 0,
    placement: "bottom",
    arrowLeft: 180,
    arrowTop: 0
  });
  const [confettiActive, setConfettiActive] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and check if user has seen the tour before
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasCompleted = localStorage.getItem(tourKey);
      if (!hasCompleted) {
        // Small delay on page load to allow layout to settle
        const timer = setTimeout(() => {
          setIsOpen(true);
          setCurrentStepIndex(0);
        }, 1200);
        return () => clearTimeout(timer);
      }

      // Event listener to open/replay the tour on demand
      const handleOpenEvent = (e: any) => {
        const initialIndex = e.detail?.stepIndex ?? 0;
        setCurrentStepIndex(Math.min(initialIndex, steps.length - 1));
        setIsOpen(true);
      };

      window.addEventListener("edutrack_open_feature_tour", handleOpenEvent);
      return () => {
        window.removeEventListener("edutrack_open_feature_tour", handleOpenEvent);
      };
    }
  }, [tourKey, steps.length]);

  // Dynamic positioning algorithm with strict non-overlap enforcement
  const updateTargetPosition = useCallback(() => {
    if (!isOpen || currentStepIndex >= steps.length) return;

    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    // Try finding the target element, or fallback to alternatives if missing
    let element = document.getElementById(currentStep.targetId);
    if (!element && currentStep.targetId === "tour-daily-quests") {
      element = document.getElementById("tour-daily-challenge") || document.getElementById("tour-flashcards-deck");
    } else if (!element && currentStep.targetId === "tour-flashcards-deck") {
      element = document.getElementById("tour-daily-quests");
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);

      // Measure real popover card dimensions
      const cardEl = popoverRef.current;
      const cardWidth = cardEl ? cardEl.offsetWidth : Math.min(380, window.innerWidth - 32);
      const cardHeight = cardEl ? cardEl.offsetHeight : 250;
      
      const margin = 16;
      const arrowSize = 10;
      const offset = margin + arrowSize;

      // Available space in all 4 directions
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      let preferred = currentStep.preferredPosition || "bottom";
      if (preferred === "auto") preferred = "bottom";

      // On narrow mobile screens, force vertical placement
      const isMobile = window.innerWidth < 768;
      if (isMobile && (preferred === "left" || preferred === "right")) {
        preferred = "bottom";
      }

      let placement: "top" | "bottom" | "left" | "right" = preferred;

      // Intelligent Flip Logic:
      if (placement === "bottom") {
        if (spaceBelow < cardHeight + offset && spaceAbove > cardHeight + offset) {
          placement = "top";
        }
      } else if (placement === "top") {
        if (spaceAbove < cardHeight + offset && spaceBelow > cardHeight + offset) {
          placement = "bottom";
        }
      } else if (placement === "right") {
        if (spaceRight < cardWidth + offset && spaceLeft > cardWidth + offset) {
          placement = "left";
        } else if (spaceRight < cardWidth + offset && spaceBelow > cardHeight + offset) {
          placement = "bottom";
        }
      } else if (placement === "left") {
        if (spaceLeft < cardWidth + offset && spaceRight > cardWidth + offset) {
          placement = "right";
        } else if (spaceLeft < cardWidth + offset && spaceBelow > cardHeight + offset) {
          placement = "bottom";
        }
      }

      // If neither top nor bottom has enough room, choose the side with MORE space
      if ((placement === "bottom" || placement === "top") && spaceBelow < cardHeight + offset && spaceAbove < cardHeight + offset) {
        placement = spaceBelow >= spaceAbove ? "bottom" : "top";
      }

      let top = 0;
      let left = 0;
      let arrowLeft = cardWidth / 2;
      let arrowTop = cardHeight / 2;

      const targetCenterX = rect.left + rect.width / 2;
      const targetCenterY = rect.top + rect.height / 2;

      if (placement === "bottom") {
        top = rect.bottom + offset;
        // Strictly prevent top from overlapping rect.bottom
        if (top < rect.bottom + margin) {
          top = rect.bottom + margin;
        }

        left = targetCenterX - cardWidth / 2;
        left = Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16));
        arrowLeft = Math.max(24, Math.min(targetCenterX - left, cardWidth - 24));
      } else if (placement === "top") {
        top = rect.top - cardHeight - offset;
        // Strictly prevent bottom of card from overlapping rect.top
        if (top + cardHeight > rect.top - margin) {
          top = rect.top - cardHeight - margin;
        }

        left = targetCenterX - cardWidth / 2;
        left = Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16));
        arrowLeft = Math.max(24, Math.min(targetCenterX - left, cardWidth - 24));
      } else if (placement === "right") {
        left = rect.right + offset;
        top = targetCenterY - cardHeight / 2;
        top = Math.max(16, Math.min(top, window.innerHeight - cardHeight - 16));
        arrowTop = Math.max(24, Math.min(targetCenterY - top, cardHeight - 24));
      } else if (placement === "left") {
        left = rect.left - cardWidth - offset;
        top = targetCenterY - cardHeight / 2;
        top = Math.max(16, Math.min(top, window.innerHeight - cardHeight - 16));
        arrowTop = Math.max(24, Math.min(targetCenterY - top, cardHeight - 24));
      }

      setPopoverPos({
        top,
        left,
        placement,
        arrowLeft,
        arrowTop
      });
    } else {
      // If target element is not in DOM, center popover cleanly
      setTargetRect(null);
      setPopoverPos({
        top: Math.max(20, window.innerHeight / 2 - 130),
        left: Math.max(16, window.innerWidth / 2 - 190),
        placement: "bottom",
        arrowLeft: 190,
        arrowTop: 0
      });
    }
  }, [isOpen, currentStepIndex, steps]);

  // Smooth scroll handler on step change
  useEffect(() => {
    if (!isOpen) return;

    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    let element = document.getElementById(currentStep.targetId);
    if (!element && currentStep.targetId === "tour-daily-quests") {
      element = document.getElementById("tour-daily-challenge") || document.getElementById("tour-flashcards-deck");
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      const isOutOfView = rect.top < 90 || rect.bottom > window.innerHeight - 90 || rect.left < 20 || rect.right > window.innerWidth - 20;

      if (isOutOfView) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }

    // Run positioning immediately and schedule recalcs to catch smooth scroll completion
    updateTargetPosition();
    const timer1 = setTimeout(updateTargetPosition, 100);
    const timer2 = setTimeout(updateTargetPosition, 350);
    const timer3 = setTimeout(updateTargetPosition, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen, currentStepIndex, steps, updateTargetPosition]);

  // Continuous tracking on resize, scroll, and content size changes
  useEffect(() => {
    if (!isOpen) return;

    const handleRecalc = () => {
      requestAnimationFrame(updateTargetPosition);
    };

    window.addEventListener("resize", handleRecalc);
    window.addEventListener("scroll", handleRecalc, true);

    // Watch popover DOM size changes via ResizeObserver
    let resizeObserver: ResizeObserver | null = null;
    if (popoverRef.current && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleRecalc();
      });
      resizeObserver.observe(popoverRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleRecalc);
      window.removeEventListener("scroll", handleRecalc, true);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [isOpen, updateTargetPosition]);

  const handleDismiss = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(tourKey, "true");
    }
    setIsOpen(false);
    if (onClose) onClose();
  }, [tourKey, onClose]);

  const handleComplete = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(tourKey, "true");
    }
    setConfettiActive(true);
    setTimeout(() => {
      setIsOpen(false);
      if (onClose) onClose();
    }, 1200);
  }, [tourKey, onClose]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStepIndex, steps.length, handleComplete]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleDismiss, handleNext, handlePrev]);

  if (!isOpen) return null;

  const currentStep = steps[currentStepIndex];
  if (!currentStep) return null;

  const IconComponent = currentStep.icon || Sparkles;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <>
      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />

      {/* Spotlight Backdrop Overlay with SVG Cutout Mask */}
      <div className="fixed inset-0 z-[100] pointer-events-auto">
        
        {/* SVG Mask Cutout: Surrounding area is dimmed, cutout hole is 100% crisp & transparent */}
        <svg 
          className="fixed inset-0 w-full h-full pointer-events-none z-[100]"
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="feature-tour-spotlight-mask">
              {/* Opaque white background fills screen */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Transparent black cutout exactly around targetRect */}
              {targetRect && (
                <rect
                  x={targetRect.left - 6}
                  y={targetRect.top - 6}
                  width={targetRect.width + 12}
                  height={targetRect.height + 12}
                  rx="18"
                  ry="18"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          {/* Dimmed backdrop filling screen, masked by cutout */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(3, 6, 20, 0.72)"
            mask="url(#feature-tour-spotlight-mask)"
            className="cursor-pointer pointer-events-auto transition-colors duration-300"
            onClick={handleDismiss}
          />
        </svg>

        {/* Dynamic Spotlight Glow & Animated Corner Brackets */}
        {targetRect && (
          <motion.div
            layoutId="spotlight-focus-ring"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed rounded-2xl pointer-events-none z-[101] border-2 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.55)] ring-4 ring-indigo-500/20"
          >
            {/* Animated Pulse Corner Indicators */}
            <span className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 rounded-tl shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 rounded-tr shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 rounded-bl shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 rounded-br shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </motion.div>
        )}

        {/* Floating Callout Popover Box with Directional Arrow */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${currentStepIndex}`}
            ref={popoverRef}
            initial={{ opacity: 0, y: popoverPos.placement === "bottom" ? -8 : 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{
              position: "fixed",
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              width: `${Math.min(380, window.innerWidth - 32)}px`
            }}
            className="z-[102] bg-[#0c1022] text-white border border-indigo-500/35 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_25px_rgba(99,102,241,0.25)] p-5 backdrop-blur-xl"
          >
            {/* Directional Arrow / Pointer pointing to Target */}
            {popoverPos.placement === "bottom" && (
              <div 
                style={{ left: `${popoverPos.arrowLeft}px` }}
                className="absolute -top-2 -translate-x-1/2 w-4 h-4 rotate-45 bg-[#0c1022] border-t border-l border-indigo-500/40 shadow-sm pointer-events-none"
              />
            )}
            {popoverPos.placement === "top" && (
              <div 
                style={{ left: `${popoverPos.arrowLeft}px` }}
                className="absolute -bottom-2 -translate-x-1/2 w-4 h-4 rotate-45 bg-[#0c1022] border-b border-r border-indigo-500/40 shadow-sm pointer-events-none"
              />
            )}
            {popoverPos.placement === "right" && (
              <div 
                style={{ top: `${popoverPos.arrowTop}px` }}
                className="absolute -left-2 -translate-y-1/2 w-4 h-4 rotate-45 bg-[#0c1022] border-b border-l border-indigo-500/40 shadow-sm pointer-events-none"
              />
            )}
            {popoverPos.placement === "left" && (
              <div 
                style={{ top: `${popoverPos.arrowTop}px` }}
                className="absolute -right-2 -translate-y-1/2 w-4 h-4 rotate-45 bg-[#0c1022] border-t border-r border-indigo-500/40 shadow-sm pointer-events-none"
              />
            )}

            {/* Top gradient stripe */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl" />

            {/* Header: Tag + Close */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <IconComponent className="w-4 h-4" />
                </div>
                {currentStep.badge && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/15 px-2.5 py-0.5 rounded-full border border-indigo-500/25">
                    {currentStep.badge}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                  {currentStepIndex + 1}/{steps.length}
                </span>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  title="Close Tour (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5 mb-4">
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                {currentStep.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {currentStep.description}
              </p>
            </div>

            {/* Progress Dots, Keyboard Hints & Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
              {/* Left: Progress Dots & Skip link */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  {steps.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentStepIndex 
                          ? "w-5 bg-gradient-to-r from-indigo-400 to-purple-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" 
                          : "w-1.5 bg-white/20 hover:bg-white/40"
                      }`}
                      title={`Go to step ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors ml-1 hidden sm:inline-block"
                >
                  Skip
                </button>
              </div>

              {/* Right: Navigation Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white rounded-xl hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3.5 py-1.5 text-xs font-black bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-md shadow-indigo-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isLastStep ? "Got it!" : "Next"}</span>
                  {isLastStep ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
