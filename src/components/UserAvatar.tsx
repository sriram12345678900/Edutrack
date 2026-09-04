"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  src?: string | null;
  name?: string;
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  frameId?: string | null;
  showLevel?: boolean;
  level?: number;
  className?: string;
  companionIcon?: string | null;
  title?: string;
}

const SIZE_MAP = {
  xs: { box: "w-6 h-6", text: "text-[9px]", badge: "text-[7px] px-1 -bottom-1 -right-1", iconBadge: "w-3 h-3 text-[8px] -top-1 -right-1" },
  sm: { box: "w-8 h-8", text: "text-[11px]", badge: "text-[8px] px-1 -bottom-1 -right-1", iconBadge: "w-4 h-4 text-[9px] -top-1 -right-1" },
  md: { box: "w-10 h-10", text: "text-xs", badge: "text-[9px] px-1.5 -bottom-1 -right-1", iconBadge: "w-5 h-5 text-[10px] -top-1.5 -right-1.5" },
  lg: { box: "w-14 h-14", text: "text-base font-black", badge: "text-[10px] px-2 -bottom-1.5 -right-1", iconBadge: "w-6 h-6 text-xs -top-2 -right-2" },
  xl: { box: "w-20 h-20", text: "text-2xl font-black", badge: "text-xs px-2.5 -bottom-2 -right-1", iconBadge: "w-7 h-7 text-sm -top-2 -right-2" },
  "2xl": { box: "w-28 h-28", text: "text-4xl font-black", badge: "text-xs px-3 -bottom-2.5 -right-2", iconBadge: "w-8 h-8 text-base -top-2.5 -right-2.5" },
};

const FRAME_DECORATIONS: Record<string, { badge: string; borderClass: string; glowColor: string }> = {
  "frame-gold": {
    badge: "👑",
    borderClass: "avatar-frame-gold",
    glowColor: "shadow-amber-500/40"
  },
  "frame-cyber": {
    badge: "⚡",
    borderClass: "avatar-frame-cyber",
    glowColor: "shadow-cyan-500/40"
  },
  "frame-cosmic": {
    badge: "🪐",
    borderClass: "avatar-frame-cosmic",
    glowColor: "shadow-purple-500/40"
  },
  "frame-fire": {
    badge: "🔥",
    borderClass: "avatar-frame-fire",
    glowColor: "shadow-orange-500/40"
  },
  "frame-frost": {
    badge: "❄️",
    borderClass: "avatar-frame-frost",
    glowColor: "shadow-sky-400/40"
  },
  "frame-emerald": {
    badge: "🧪",
    borderClass: "avatar-frame-emerald",
    glowColor: "shadow-emerald-500/40"
  }
};

export default function UserAvatar({
  src,
  name = "Scholar",
  initials,
  size = "md",
  frameId,
  showLevel = false,
  level = 1,
  className,
  companionIcon,
  title,
}: UserAvatarProps) {
  const [activeFrame, setActiveFrame] = useState<string | null>(frameId !== undefined ? frameId : null);
  const [activeCompanion, setActiveCompanion] = useState<string | null>(companionIcon || null);

  useEffect(() => {
    // If explicit frameId is provided, respect it
    if (frameId !== undefined) {
      setActiveFrame(frameId);
      return;
    }

    if (typeof window !== "undefined") {
      const storedFrame = localStorage.getItem("edutrack_equipped_frame");
      setActiveFrame(storedFrame || "frame-gold");

      const storedCompanion = localStorage.getItem("edutrack_equipped_companion");
      if (!companionIcon && storedCompanion) {
        const companionIcons: Record<string, string> = {
          "pet-owl": "🦉",
          "pet-robot": "🤖",
          "pet-dragon": "🐉",
          "pet-capybara": "🐾",
        };
        setActiveCompanion(companionIcons[storedCompanion] || null);
      }

      // Listen for shop equips
      const handleShopUpdate = (e: any) => {
        if (frameId === undefined) {
          setActiveFrame(e.detail?.equippedFrame || null);
        }
        if (!companionIcon) {
          const compId = e.detail?.equippedCompanion;
          const companionIcons: Record<string, string> = {
            "pet-owl": "🦉",
            "pet-robot": "🤖",
            "pet-dragon": "🐉",
            "pet-capybara": "🐾",
          };
          setActiveCompanion(compId ? companionIcons[compId] || null : null);
        }
      };

      window.addEventListener("edutrack_shop_updated", handleShopUpdate);
      return () => window.removeEventListener("edutrack_shop_updated", handleShopUpdate);
    }
  }, [frameId, companionIcon]);

  const displayInitials = initials || name.charAt(0).toUpperCase() || "S";
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const frameConfig = activeFrame ? FRAME_DECORATIONS[activeFrame] : null;

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center select-none", className)}
      title={title || name}
    >
      {/* Avatar Container */}
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 relative",
          sizeConfig.box,
          frameConfig ? frameConfig.borderClass : "border-2 border-indigo-500/40",
          frameConfig && frameConfig.glowColor
        )}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Fallback to initials on broken image link
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black shadow-inner">
            <span className={sizeConfig.text}>{displayInitials}</span>
          </div>
        )}
      </div>

      {/* Frame Top-Right Badge Accent */}
      {frameConfig && (size === "lg" || size === "xl" || size === "2xl") && (
        <div
          className={cn(
            "absolute rounded-full bg-slate-900/90 border border-white/20 flex items-center justify-center shadow-lg pointer-events-none animate-pulse",
            sizeConfig.iconBadge
          )}
        >
          {frameConfig.badge}
        </div>
      )}

      {/* Companion Mascot Badge (Bottom-Left) */}
      {activeCompanion && (size === "lg" || size === "xl" || size === "2xl") && (
        <div
          className={cn(
            "absolute -bottom-1 -left-1 rounded-full bg-slate-900/90 border border-white/20 flex items-center justify-center shadow-lg pointer-events-none z-10",
            sizeConfig.iconBadge
          )}
          title="Equipped Companion"
        >
          {activeCompanion}
        </div>
      )}

      {/* Level Badge (Bottom-Right) */}
      {showLevel && (
        <div
          className={cn(
            "absolute bg-indigo-600 text-white font-black rounded-full border border-black dark:border-white/10 shadow-md",
            sizeConfig.badge
          )}
          title={`Level ${level}`}
        >
          L{level}
        </div>
      )}
    </div>
  );
}
