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
    preferredPosition: "right"
  },
  {
    targetId: "tour-flashcards-deck",
    title: "Leitner Recall Flashcards",
    description: "Harness cognitive science and spaced repetition! Swipe cards right if mastered or left to review again until permanently retained.",
    icon: Layers,
    badge: "Spaced Repetition",
    preferredPosition: "left"
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
}

export default function FeatureSpotlightTour({ 
  steps = DEFAULT_TOUR_STEPS,
  tourKey = "edutrack_feature_spotlight_completed"
}: FeatureSpotlightTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; placement: "top" | "bottom" | "left" | "right" }>({
    top: 0,
    left: 0,
    placement: "bottom"
  });
  const [confettiActive, setConfettiActive] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  // Position calculation helper
  const updateTargetPosition = useCallback(() => {
    if (!isOpen || currentStepIndex >= steps.length) return;

    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    const element = document.getElementById(currentStep.targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);

      // Scroll element smoothly into view if needed
      const isOutOfView = rect.top < 80 || rect.bottom > window.innerHeight - 80 || rect.left < 20 || rect.right > window.innerWidth - 20;
      if (isOutOfView) {
        element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }

      // Calculate best popover placement
      const popoverWidth = Math.min(360, window.innerWidth - 32);
      const popoverHeight = 220; // estimated
      const margin = 16;
      let placement: "top" | "bottom" | "left" | "right" = currentStep.preferredPosition === "auto" || !currentStep.preferredPosition 
        ? "bottom" 
        : currentStep.preferredPosition;

      // Check available space
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      if (placement === "bottom" && spaceBelow < popoverHeight + margin && spaceAbove > popoverHeight + margin) {
        placement = "top";
      } else if (placement === "top" && spaceAbove < popoverHeight + margin && spaceBelow > popoverHeight + margin) {
        placement = "bottom";
      } else if (placement === "right" && spaceRight < popoverWidth + margin && spaceLeft > popoverWidth + margin) {
        placement = "left";
      } else if (placement === "left" && spaceLeft < popoverWidth + margin && spaceRight > popoverWidth + margin) {
        placement = "right";
      }

      // If mobile screen, force top or bottom
      if (window.innerWidth < 768) {
        placement = spaceBelow >= popoverHeight ? "bottom" : "top";
      }

      let top = 0;
      let left = 0;

      if (placement === "bottom") {
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2 - popoverWidth / 2;
      } else if (placement === "top") {
        top = rect.top - popoverHeight - margin;
        left = rect.left + rect.width / 2 - popoverWidth / 2;
      } else if (placement === "right") {
        top = rect.top + rect.height / 2 - popoverHeight / 2;
        left = rect.right + margin;
      } else if (placement === "left") {
        top = rect.top + rect.height / 2 - popoverHeight / 2;
        left = rect.left - popoverWidth - margin;
      }

      // Clamp within viewport
      const clampedLeft = Math.max(16, Math.min(left, window.innerWidth - popoverWidth - 16));
      const clampedTop = Math.max(16, Math.min(top, window.innerHeight - popoverHeight - 16));

      setPopoverPos({
        top: clampedTop,
        left: clampedLeft,
        placement
      });
    } else {
      // If target element not in DOM, center popover
      setTargetRect(null);
      setPopoverPos({
        top: window.innerHeight / 2 - 110,
        left: window.innerWidth / 2 - 180,
        placement: "bottom"
      });
    }
  }, [isOpen, currentStepIndex, steps]);

  // Recalculate on step change, resize, scroll
  useEffect(() => {
    if (!isOpen) return;

    updateTargetPosition();

    // Listen to resize and scroll
    const handleRecalc = () => {
      requestAnimationFrame(updateTargetPosition);
    };

    window.addEventListener("resize", handleRecalc);
    window.addEventListener("scroll", handleRecalc, true);

    // Re-check after small timeout in case dynamic elements just finished rendering
    const timer = setTimeout(updateTargetPosition, 300);

    return () => {
      window.removeEventListener("resize", handleRecalc);
      window.removeEventListener("scroll", handleRecalc, true);
      clearTimeout(timer);
    };
  }, [isOpen, currentStepIndex, updateTargetPosition]);

  const handleDismiss = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(tourKey, "true");
    }
    setIsOpen(false);
  }, [tourKey]);

  const handleComplete = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(tourKey, "true");
    }
    setConfettiActive(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 1200);
  }, [tourKey]);

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

      {/* Spotlight Backdrop Overlay with Target Cutout / Glow */}
      <div className="fixed inset-0 z-[100] pointer-events-auto transition-opacity duration-300">
        
        {/* Semi-transparent dark backdrop */}
        <div 
          onClick={handleDismiss}
          className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] cursor-pointer" 
        />

        {/* Dynamic Spotlight Cutout Glow around Target Element */}
        {targetRect && (
          <motion.div
            layoutId="spotlight-focus-ring"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="absolute rounded-2xl pointer-events-none z-[101] border-2 border-indigo-400/90 shadow-[0_0_0_9999px_rgba(4,6,20,0.65),0_0_25px_rgba(99,102,241,0.6)] ring-4 ring-indigo-500/20"
          >
            {/* Animated Pulse Corner Indicators */}
            <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
            <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
            <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400 rounded-br" />
          </motion.div>
        )}

        {/* Floating Callout Popover Box */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${currentStepIndex}`}
            ref={popoverRef}
            initial={{ opacity: 0, y: popoverPos.placement === "bottom" ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              position: "fixed",
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              width: `${Math.min(360, window.innerWidth - 32)}px`
            }}
            className="z-[102] bg-[#0c1022] text-white border border-indigo-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(99,102,241,0.25)] p-5 overflow-hidden"
          >
            {/* Top gradient stripe */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            {/* Header: Tag + Close */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <IconComponent className="w-4 h-4" />
                </div>
                {currentStep.badge && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    {currentStep.badge}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 font-mono">
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

            {/* Progress Dots & Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStepIndex 
                        ? "w-5 bg-gradient-to-r from-indigo-400 to-purple-400" 
                        : "w-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                    title={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-all flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3.5 py-1.5 text-xs font-black bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-md shadow-indigo-500/25 active:scale-95 transition-all flex items-center gap-1.5"
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
