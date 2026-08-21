"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Trophy, ShoppingBag, Check, Lock, 
  Palette, Flame, ShieldCheck, Zap, Star, Award, RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "@/components/Confetti";

interface ShopItem {
  id: string;
  name: string;
  category: "frame" | "title" | "theme" | "powerup";
  cost: number;
  icon: string;
  desc: string;
  previewClass?: string;
}

const SHOP_ITEMS: ShopItem[] = [
  // Avatar Frames
  { id: "frame-gold", name: "Golden Scholar Laurels", category: "frame", cost: 200, icon: "👑", desc: "Golden glowing laurel ring for your profile avatar." },
  { id: "frame-cyber", name: "Cyberpunk Neon Grid", category: "frame", cost: 350, icon: "⚡", desc: "Animated neon cyan & magenta pulsating border." },
  { id: "frame-cosmic", name: "Cosmic Nebula Orbit", category: "frame", cost: 500, icon: "🪐", desc: "Interstellar particles orbiting around your avatar." },
  
  // Custom Academic Titles
  { id: "title-topper", name: "CBSE All-India Topper", category: "title", cost: 300, icon: "🏆", desc: "Exclusive badge displayed alongside your name in StudyCircles." },
  { id: "title-prodigy", name: "Quantum Prodigy", category: "title", cost: 250, icon: "⚛️", desc: "Signifies elite Science and Physics mastery." },
  { id: "title-wizard", name: "Math Olympiad Wizard", category: "title", cost: 250, icon: "📐", desc: "Signifies top percentile problem solving speed." },

  // Themes
  { id: "theme-cyberpunk", name: "Midnight Cyberpunk Theme", category: "theme", cost: 300, icon: "🌆", desc: "Neon purple and vibrant cyan UI accent system." },
  { id: "theme-emerald", name: "Emerald Matrix Theme", category: "theme", cost: 300, icon: "🧪", desc: "Bio-luminescent emerald green study accents." },
  { id: "theme-sunset", name: "Sunset Gold Theme", category: "theme", cost: 300, icon: "🌅", desc: "Warm amber and golden scholar hues." },

  // Streak & Powerups
  { id: "pwr-freeze", name: "Streak Freeze Token", category: "powerup", cost: 100, icon: "🧊", desc: "Protects your daily study streak if you miss 1 day." },
  { id: "pwr-2x", name: "2x XP Booster (24 Hours)", category: "powerup", cost: 200, icon: "🚀", desc: "Doubles all XP earned from quizzes and mock tests for 24 hours." }
];

export default function ShopPage() {
  const [userXp, setUserXp] = useState<number>(0);
  const [unlockedItems, setUnlockedItems] = useState<string[]>(["frame-gold"]);
  const [activeTab, setActiveTab] = useState<"all" | "frame" | "title" | "theme" | "powerup">("all");
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const [purchaseToast, setPurchaseToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedXp = localStorage.getItem("edutrack_xp") || "350";
      setUserXp(parseInt(storedXp, 10));

      const storedUnlocked = localStorage.getItem("edutrack_shop_unlocked");
      if (storedUnlocked) {
        try {
          setUnlockedItems(JSON.parse(storedUnlocked));
        } catch {
          setUnlockedItems(["frame-gold"]);
        }
      }
    }
  }, []);

  const handleBuyItem = (item: ShopItem) => {
    if (unlockedItems.includes(item.id)) return;
    if (userXp < item.cost) {
      alert(`You need ${item.cost - userXp} more XP to unlock ${item.name}! Complete more quizzes to earn XP.`);
      return;
    }

    const newXp = userXp - item.cost;
    const newUnlocked = [...unlockedItems, item.id];

    setUserXp(newXp);
    setUnlockedItems(newUnlocked);

    if (typeof window !== "undefined") {
      localStorage.setItem("edutrack_xp", newXp.toString());
      localStorage.setItem("edutrack_shop_unlocked", JSON.stringify(newUnlocked));
      window.dispatchEvent(new CustomEvent("edutrack_xp_updated", { detail: { xp: newXp } }));
    }

    setConfettiActive(true);
    setPurchaseToast(`🎉 Unlocked ${item.name}!`);
    setTimeout(() => {
      setConfettiActive(false);
      setPurchaseToast(null);
    }, 3000);
  };

  const filteredItems = SHOP_ITEMS.filter(i => activeTab === "all" || i.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8">
      <Confetti active={confettiActive} />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black tracking-wider uppercase mb-2">
              <ShoppingBag className="w-3.5 h-3.5" /> Avatar & Theme XP Marketplace
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight dark:text-white text-slate-900">
              Student Rewards & Item Shop
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Spend your hard-earned academic XP on exclusive avatar borders, titles, UI themes, and streak shields.
            </p>
          </div>

          {/* XP Balance Badge */}
          <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center gap-3 shadow-lg shadow-amber-500/10 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block">Available XP Balance</span>
              <span className="text-xl font-black text-amber-400 font-mono">{userXp} XP</span>
            </div>
          </div>
        </div>

        {/* Purchase Toast */}
        <AnimatePresence>
          {purchaseToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 rounded-2xl bg-emerald-600 text-white font-black text-sm text-center shadow-xl shadow-emerald-600/30"
            >
              {purchaseToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {[
            { id: "all", label: "All Items" },
            { id: "frame", label: "👑 Avatar Frames" },
            { id: "title", label: "🏆 Titles & Badges" },
            { id: "theme", label: "🎨 UI Themes" },
            { id: "powerup", label: "⚡ Streak & Power-Ups" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === cat.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isUnlocked = unlockedItems.includes(item.id);
            const canAfford = userXp >= item.cost;

            return (
              <motion.div
                key={item.id}
                layout
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                  isUnlocked
                    ? "bg-white dark:bg-slate-900 border-emerald-500/40"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 inline-block">
                      {item.icon}
                    </span>
                    {isUnlocked ? (
                      <span className="text-xs font-black uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Owned
                      </span>
                    ) : (
                      <span className="text-xs font-black uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-mono">
                        {item.cost} XP
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyItem(item)}
                  disabled={isUnlocked}
                  className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isUnlocked
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default"
                      : canAfford
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isUnlocked ? (
                    <>
                      <Check className="w-4 h-4" /> Active in Inventory
                    </>
                  ) : canAfford ? (
                    <>
                      <Sparkles className="w-4 h-4" /> Unlock for {item.cost} XP
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Need {item.cost} XP
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
