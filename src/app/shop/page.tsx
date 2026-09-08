"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, Trophy, ShoppingBag, Check, Lock, 
  Palette, Flame, ShieldCheck, Zap, Star, Award, RotateCcw,
  Volume2, VolumeX, Search, Filter, ArrowUpDown, Gift, Eye,
  Clock, CheckCircle2, AlertCircle, RefreshCw, X, ChevronRight,
  Wand2, Info, ArrowRight, Layers, RotateCw, Save, Smile, Shirt
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "@/components/Confetti";
import UserAvatar from "@/components/UserAvatar";
import RobloxAvatar, { 
  RobloxAvatarConfig, 
  DEFAULT_ROBLOX_CONFIG,
  RobloxFaceType,
  RobloxHatType,
  RobloxOutfitType,
  RobloxGearType,
  RobloxPoseType
} from "@/components/RobloxAvatar";
import {
  SHOP_ITEMS,
  ShopItem,
  ShopCategory,
  ItemRarity,
  ShopState,
  getShopState,
  buyShopItem,
  equipShopItem,
  unequipShopItem,
  claimDailyMysteryChest,
  isBoosterActive,
  getBoosterTimeRemaining,
  playShopSound,
  applyTheme,
  saveRobloxAvatarConfig
} from "@/lib/shop";

const SKIN_TONES = [
  { id: "#f1f3f6", label: "Studio White", color: "#f1f3f6", ring: "ring-slate-400" },
  { id: "#f5cd2f", label: "Classic Noob Yellow", color: "#f5cd2f", ring: "ring-amber-400" },
  { id: "#d4a373", label: "Warm Bronze", color: "#d4a373", ring: "ring-amber-700" },
  { id: "#38bdf8", label: "Cyber Cyan", color: "#38bdf8", ring: "ring-cyan-400" },
  { id: "#34d399", label: "Emerald Matrix", color: "#34d399", ring: "ring-emerald-400" },
  { id: "#a855f7", label: "Void Violet", color: "#a855f7", ring: "ring-purple-400" },
  { id: "#fbbf24", label: "Imperial Gold", color: "#fbbf24", ring: "ring-yellow-400" },
  { id: "#1e293b", label: "Dark Knight", color: "#1e293b", ring: "ring-slate-600" },
];

const POSES: { id: RobloxPoseType; label: string; icon: string }[] = [
  { id: "idle", label: "Idle Stance", icon: "🧍" },
  { id: "wave", label: "Wave", icon: "👋" },
  { id: "cheer", label: "Cheer", icon: "🎉" },
  { id: "levitate", label: "Float", icon: "✨" },
];

export default function ShopPage() {
  // Core user state
  const [userXp, setUserXp] = useState<number>(350);
  const [shopState, setShopState] = useState<ShopState>(getShopState);
  const [displayName, setDisplayName] = useState<string>("Scholar");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  
  // Showroom View Mode: "roblox" (3D Studio) vs "classic" (2D Mirror)
  const [showroomMode, setShowroomMode] = useState<"roblox" | "classic">("roblox");
  const [autoRotate3D, setAutoRotate3D] = useState<boolean>(false);

  // 3D Avatar Studio Preview State
  const [previewRoblox, setPreviewRoblox] = useState<RobloxAvatarConfig>(DEFAULT_ROBLOX_CONFIG);

  // UI & interactive state
  const [activeTab, setActiveTab] = useState<"all" | ShopCategory>("all");
  const [avatarSubTab, setAvatarSubTab] = useState<"all" | "hat" | "outfit" | "face" | "gear">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "owned" | "affordable" | "locked">("all");
  const [sortBy, setSortBy] = useState<"recommended" | "price-asc" | "price-desc" | "rarity">("recommended");
  
  // Classic Fitting Room / Wardrobe Try-On state
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [previewCompanion, setPreviewCompanion] = useState<string | null>(null);

  // Purchase modal & celebrations
  const [pendingPurchaseItem, setPendingPurchaseItem] = useState<ShopItem | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [boosterTimeRemaining, setBoosterTimeRemaining] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedXp = localStorage.getItem("edutrack_xp") || "350";
      setUserXp(parseInt(storedXp, 10));

      const nick = localStorage.getItem("edutrack_nickname");
      if (nick) setDisplayName(nick);

      const muted = localStorage.getItem("edutrack_shop_mute") === "true";
      setIsMuted(muted);

      const state = getShopState();
      setShopState(state);
      setPreviewFrame(state.equippedFrame);
      setPreviewTitle(state.equippedTitle);
      setPreviewTheme(state.equippedTheme);
      setPreviewCompanion(state.equippedCompanion);
      setPreviewRoblox(state.robloxAvatar);

      setBoosterTimeRemaining(getBoosterTimeRemaining());

      // Interval to update booster countdown timer
      const interval = setInterval(() => {
        setBoosterTimeRemaining(getBoosterTimeRemaining());
      }, 10000);

      // Listen for global shop and XP updates
      const handleShopUpdate = (e: any) => {
        if (e.detail) {
          setShopState(e.detail);
          if (e.detail.robloxAvatar) {
            setPreviewRoblox(e.detail.robloxAvatar);
          }
        }
      };

      const handleXpUpdate = (e: any) => {
        if (e.detail?.xp !== undefined) {
          setUserXp(e.detail.xp);
        }
      };

      window.addEventListener("edutrack_shop_updated", handleShopUpdate);
      window.addEventListener("edutrack_xp_updated", handleXpUpdate);

      return () => {
        clearInterval(interval);
        window.removeEventListener("edutrack_shop_updated", handleShopUpdate);
        window.removeEventListener("edutrack_xp_updated", handleXpUpdate);
      };
    }
  }, []);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem("edutrack_shop_mute", String(nextMuted));
  };

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Purchase Handling ──
  const handleOpenPurchase = (item: ShopItem) => {
    if (userXp < item.cost) {
      playShopSound("error");
      showToast(`You need ${item.cost - userXp} more XP for ${item.name}! Complete quizzes or study flashcards to earn XP.`, "error");
      return;
    }
    setPendingPurchaseItem(item);
  };

  const handleConfirmPurchase = () => {
    if (!pendingPurchaseItem) return;
    const item = pendingPurchaseItem;
    const result = buyShopItem(item);

    if (result.success) {
      setConfettiActive(true);
      showToast(result.message, "success");
      setPendingPurchaseItem(null);

      // Update wardrobe preview if cosmetic
      if (item.category === "frame") setPreviewFrame(item.id);
      if (item.category === "title") setPreviewTitle(item.id);
      if (item.category === "theme") setPreviewTheme(item.id);
      if (item.category === "companion") setPreviewCompanion(item.id);
      if (item.category === "avatar_item" && item.robloxSlot && item.robloxValue) {
        setPreviewRoblox((prev) => ({ ...prev, [item.robloxSlot!]: item.robloxValue }));
        setShowroomMode("roblox");
      }

      setTimeout(() => setConfettiActive(false), 3000);
    } else {
      playShopSound("error");
      showToast(result.message, "error");
    }
  };

  // ── Equip / Unequip Handling ──
  const handleEquipToggle = (item: ShopItem) => {
    if (item.category === "avatar_item" && item.robloxSlot && item.robloxValue) {
      const isCurrentlyEquipped = (shopState.robloxAvatar as any)[item.robloxSlot] === item.robloxValue;
      if (isCurrentlyEquipped) {
        unequipShopItem("avatar_item", item.robloxSlot);
        const fallbackVal = item.robloxSlot === "hat" ? "none" : item.robloxSlot === "gear" ? "none" : item.robloxSlot === "outfit" ? "default" : "classic";
        setPreviewRoblox(prev => ({ ...prev, [item.robloxSlot!]: fallbackVal }));
        showToast(`Unequipped ${item.name}`, "info");
      } else {
        equipShopItem(item.id, "avatar_item");
        setPreviewRoblox(prev => ({ ...prev, [item.robloxSlot!]: item.robloxValue }));
        setShowroomMode("roblox");
        showToast(`Equipped ${item.name} on 3D Character!`, "success");
      }
      return;
    }

    const isEquipped =
      (item.category === "frame" && shopState.equippedFrame === item.id) ||
      (item.category === "title" && shopState.equippedTitle === item.id) ||
      (item.category === "theme" && shopState.equippedTheme === item.id) ||
      (item.category === "companion" && shopState.equippedCompanion === item.id);

    if (isEquipped) {
      unequipShopItem(item.category);
      if (item.category === "frame") setPreviewFrame(null);
      if (item.category === "title") setPreviewTitle(null);
      if (item.category === "theme") setPreviewTheme(null);
      if (item.category === "companion") setPreviewCompanion(null);
      showToast(`Unequipped ${item.name}`, "info");
    } else {
      equipShopItem(item.id, item.category);
      if (item.category === "frame") setPreviewFrame(item.id);
      if (item.category === "title") setPreviewTitle(item.id);
      if (item.category === "theme") setPreviewTheme(item.id);
      if (item.category === "companion") setPreviewCompanion(item.id);
      showToast(`Equipped ${item.name}!`, "success");
    }
  };

  // ── Wardrobe Try-On Handling ──
  const handleTryOn = (item: ShopItem) => {
    playShopSound("equip");
    if (item.category === "avatar_item" && item.robloxSlot && item.robloxValue) {
      setShowroomMode("roblox");
      setPreviewRoblox((prev) => ({
        ...prev,
        [item.robloxSlot!]: item.robloxValue,
      }));
      showToast(`Trying on ${item.name} in 3D Studio! Drag character to rotate 360°`, "info");
      window.scrollTo({ top: 180, behavior: "smooth" });
      return;
    }

    if (item.category === "frame") setPreviewFrame(item.id);
    if (item.category === "title") setPreviewTitle(item.id);
    if (item.category === "theme") {
      setPreviewTheme(item.id);
      applyTheme(item.id);
    }
    if (item.category === "companion") setPreviewCompanion(item.id);
    showToast(`Trying on ${item.name} in Wardrobe`, "info");
  };

  const handleResetClassicPreview = () => {
    setPreviewFrame(shopState.equippedFrame);
    setPreviewTitle(shopState.equippedTitle);
    setPreviewTheme(shopState.equippedTheme);
    setPreviewCompanion(shopState.equippedCompanion);
    applyTheme(shopState.equippedTheme);
    showToast("Reverted preview to currently equipped loadout", "info");
  };

  // ── 3D Avatar Studio Handlers ──
  const handleSaveRobloxAvatar = () => {
    saveRobloxAvatarConfig(previewRoblox);
    playShopSound("buy");
    showToast("💾 Saved 3D Avatar! Displaying across your profile and sidebar.", "success");
  };

  const handleResetRobloxAvatar = () => {
    setPreviewRoblox(shopState.robloxAvatar);
    showToast("Reverted 3D avatar to equipped look.", "info");
  };

  // ── Daily Mystery Chest ──
  const handleClaimChest = () => {
    const res = claimDailyMysteryChest();
    if (res.success) {
      setConfettiActive(true);
      showToast(res.message, "success");
      setTimeout(() => setConfettiActive(false), 3500);
    } else {
      playShopSound("error");
      showToast(res.message, "info");
    }
  };

  // ── Quick XP grant for testing ──
  const handleClaimStarterBonus = () => {
    const cur = parseInt(localStorage.getItem("edutrack_xp") || "0", 10);
    const next = cur + 300;
    localStorage.setItem("edutrack_xp", next.toString());
    setUserXp(next);
    window.dispatchEvent(new CustomEvent("edutrack_xp_updated", { detail: { xp: next } }));
    playShopSound("buy");
    showToast("🎁 Claimed +300 Explorer Bonus XP for the Rewards Shop!", "success");
  };

  // ── Filtering & Sorting ──
  const filteredItems = useMemo(() => {
    return SHOP_ITEMS.filter((item) => {
      // Main category filter
      if (activeTab !== "all" && item.category !== activeTab) return false;

      // Sub-filter for 3D avatar gear
      if (activeTab === "avatar_item" && avatarSubTab !== "all") {
        if (item.robloxSlot !== avatarSubTab) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.name.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.perk.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status filter
      const isUnlocked = shopState.unlockedItems.includes(item.id);
      const canAfford = userXp >= item.cost;

      if (statusFilter === "owned" && !isUnlocked) return false;
      if (statusFilter === "affordable" && (!canAfford || isUnlocked)) return false;
      if (statusFilter === "locked" && isUnlocked) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.cost - b.cost;
      if (sortBy === "price-desc") return b.cost - a.cost;
      if (sortBy === "rarity") {
        const rarityWeights: Record<ItemRarity, number> = {
          mythic: 5,
          legendary: 4,
          epic: 3,
          rare: 2,
          common: 1,
        };
        return rarityWeights[b.rarity] - rarityWeights[a.rarity];
      }
      return 0; // recommended order
    });
  }, [activeTab, avatarSubTab, searchQuery, statusFilter, sortBy, shopState, userXp]);

  const isClassicPreviewDifferent =
    previewFrame !== shopState.equippedFrame ||
    previewTitle !== shopState.equippedTitle ||
    previewTheme !== shopState.equippedTheme ||
    previewCompanion !== shopState.equippedCompanion;

  const isRobloxPreviewModified =
    previewRoblox.bodyColor !== shopState.robloxAvatar.bodyColor ||
    previewRoblox.face !== shopState.robloxAvatar.face ||
    previewRoblox.hat !== shopState.robloxAvatar.hat ||
    previewRoblox.outfit !== shopState.robloxAvatar.outfit ||
    previewRoblox.gear !== shopState.robloxAvatar.gear ||
    previewRoblox.pose !== shopState.robloxAvatar.pose;

  const isDailyChestClaimed = shopState.lastDailyRewardDate === new Date().toDateString();

  const previewItemTitleObj = SHOP_ITEMS.find((i) => i.id === previewTitle);
  const previewItemCompanionObj = SHOP_ITEMS.find((i) => i.id === previewCompanion);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080f] text-slate-900 dark:text-slate-100 p-3 sm:p-6 lg:p-8 space-y-8">
      <Confetti active={confettiActive} />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[99999] px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2.5 backdrop-blur-xl border ${
              toastMessage.type === "success"
                ? "bg-emerald-600/95 text-white border-emerald-400/30 shadow-emerald-500/20"
                : toastMessage.type === "error"
                ? "bg-rose-600/95 text-white border-rose-400/30 shadow-rose-500/20"
                : "bg-indigo-600/95 text-white border-indigo-400/30 shadow-indigo-500/20"
            }`}
          >
            {toastMessage.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {toastMessage.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
            {toastMessage.type === "info" && <Info className="w-4 h-4 shrink-0" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ── 1. HEADER & USER WALLET HUD ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white dark:bg-slate-900/80 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-black tracking-wider uppercase">
              <ShoppingBag className="w-3.5 h-3.5" /> Rewards & Armory Marketplace
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              Scholar Rewards Shop
              <span className="text-sm font-black px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                3D Studio v2.5
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
              Unlock blocky 3D Scholar Avatars, animated avatar frames, academic honorifics, UI themes, companions, and functional XP boosters.
            </p>
          </div>

          {/* Wallet Cards Cluster */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            {/* XP Balance Badge */}
            <div className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 flex items-center gap-3 shadow-lg shadow-amber-500/5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl font-black text-amber-500">
                ⚡
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Available Balance</span>
                <span className="text-2xl font-black text-amber-500 font-mono tracking-tight">{userXp} XP</span>
              </div>
            </div>

            {/* Active 2x Booster Pill */}
            {boosterTimeRemaining && (
              <div className="px-4 py-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center gap-2.5 animate-pulse">
                <RocketIcon className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 block">2x XP Multiplier</span>
                  <span className="text-xs font-black text-indigo-300 font-mono">{boosterTimeRemaining}</span>
                </div>
              </div>
            )}

            {/* Streak Shields Badge */}
            <div className="px-4 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2.5">
              <span className="text-lg">🧊</span>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-cyan-500 block">Streak Shields</span>
                <span className="text-xs font-black text-cyan-400 font-mono">{shopState.streakFreezes} / 5 Ready</span>
              </div>
            </div>

            {/* Audio Mute Toggle */}
            <button
              onClick={toggleMute}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all hover:scale-105 active:scale-95"
              title={isMuted ? "Unmute Shop Audio" : "Mute Shop Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>
        </div>

        {/* ── 2. INTERACTIVE FITTING ROOM & SHOWROOM ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Fitting Room Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/40 via-slate-900/90 to-purple-950/40 p-5 sm:p-7 rounded-3xl border border-indigo-500/30 shadow-xl relative overflow-hidden backdrop-blur-2xl flex flex-col justify-between">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Card Header & Mode Switcher */}
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-black text-base shadow-[0_0_12px_rgba(99,102,241,0.35)] border border-indigo-500/30">
                  {showroomMode === "roblox" ? "🎮" : "👑"}
                </div>
                <div>
                  <h2 className="text-base font-extrabold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                    {showroomMode === "roblox" ? "3D Scholar Avatar Studio" : "Scholar Portrait Mirror"}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {showroomMode === "roblox"
                      ? "Interactive 360° Studio Turntable • Drag character to rotate • Try on gear below"
                      : "Live preview of equipped animated avatar frames, titles, and companions"}
                  </p>
                </div>
              </div>

              {/* View Switcher Pills */}
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                <button
                  onClick={() => setShowroomMode("roblox")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                    showroomMode === "roblox"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>🎮</span>
                  <span>3D Avatar Studio</span>
                </button>
                <button
                  onClick={() => setShowroomMode("classic")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                    showroomMode === "classic"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>👑</span>
                  <span>Classic Mirror</span>
                </button>
              </div>
            </div>

            {/* ── SHOWROOM MODE: 3D AVATAR STUDIO ── */}
            {showroomMode === "roblox" ? (
              <div className="relative pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* 3D Character Viewport Column (Generous 450px Height) */}
                <div className="md:col-span-7 flex flex-col items-center justify-center">
                  <div className="relative w-full h-[450px] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center" style={{ background: "#06080f", boxShadow: "0 0 0 1px rgba(99,102,241,0.25), 0 0 30px rgba(99,102,241,0.12), 0 25px 50px -12px rgba(0,0,0,0.8)" }}>
                    
                    {/* Top Floating Drag Cue & Auto-Spin Toolbar */}
                    <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
                      <span className="text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-black/60 text-indigo-300 border border-indigo-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-md">
                        <RotateCw className="w-2.5 h-2.5 text-indigo-400" />
                        <span>Drag 360° to Inspect</span>
                      </span>

                      <button
                        onClick={() => setAutoRotate3D(!autoRotate3D)}
                        className="pointer-events-auto text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-black/60 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                      >
                        {autoRotate3D ? "🌀 Spinning" : "🔄 Auto-Spin"}
                      </button>
                    </div>

                    {/* The 3D Scholar Avatar */}
                    <RobloxAvatar
                      size="full"
                      interactive={true}
                      showControls={false}
                      config={{ ...previewRoblox, autoRotate: autoRotate3D }}
                      className="w-full h-full"
                    />

                    {/* Bottom Emote/Pose Selector Bar (Clean Glass Pill) */}
                    <div className="absolute bottom-3 inset-x-4 z-30 flex items-center justify-center gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl">
                      {POSES.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPreviewRoblox((prev) => ({ ...prev, pose: p.id }))}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 ${
                            previewRoblox.pose === p.id
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                              : "text-slate-400 hover:text-white hover:bg-white/10"
                          }`}
                          title={p.label}
                        >
                          <span>{p.icon}</span>
                          <span className="hidden sm:inline">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Character Customization & Studio Controls Column */}
                <div className="md:col-span-5 space-y-4 text-left">
                  
                  {/* Title & Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        {displayName}
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          R6 Humanoid
                        </span>
                      </h3>
                      <span className="text-xs text-slate-400">Scholar Avatar Studio</span>
                    </div>

                    {isRobloxPreviewModified ? (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                        Unsaved Changes
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Saved & Active
                      </span>
                    )}
                  </div>

                  {/* 1. Skin Tone Swatches (With Crisp White Borders) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block">
                      Body & Skin Tone Finish
                    </label>
                    <div className="flex flex-wrap items-center gap-2.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                      {SKIN_TONES.map((tone) => {
                        const isSelected = previewRoblox.bodyColor?.toLowerCase() === tone.color.toLowerCase();
                        return (
                          <button
                            key={tone.id}
                            onClick={() => setPreviewRoblox((prev) => ({ ...prev, bodyColor: tone.color }))}
                            className={`w-9 h-9 rounded-full border-2 border-white/30 transition-all flex items-center justify-center shadow-md relative ${
                              isSelected
                                ? `ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-125 shadow-lg shadow-white/20`
                                : "hover:scale-110 opacity-85 hover:opacity-100 hover:border-white/60"
                            }`}
                            style={{ backgroundColor: tone.color }}
                            title={tone.label}
                          >
                            {isSelected && (
                              <Check className={`w-4 h-4 ${tone.id === "#f1f3f6" || tone.id === "#f5cd2f" ? "text-slate-950" : "text-white"} stroke-[3]`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Equipped Slots Summary (With Instant Remove Buttons) */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">3D Hat</span>
                        <span className="text-xs font-black text-white truncate block max-w-[90px]">
                          {previewRoblox.hat && previewRoblox.hat !== "none"
                            ? previewRoblox.hat.charAt(0).toUpperCase() + previewRoblox.hat.slice(1)
                            : "None"}
                        </span>
                      </div>
                      {previewRoblox.hat && previewRoblox.hat !== "none" && (
                        <button
                          onClick={() => setPreviewRoblox((prev) => ({ ...prev, hat: "none" }))}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors text-[10px]"
                          title="Take off Hat"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Outfit</span>
                        <span className="text-xs font-black text-white truncate block max-w-[90px]">
                          {previewRoblox.outfit && previewRoblox.outfit !== "default"
                            ? previewRoblox.outfit.charAt(0).toUpperCase() + previewRoblox.outfit.slice(1)
                            : "Studio Dummy"}
                        </span>
                      </div>
                      {previewRoblox.outfit && previewRoblox.outfit !== "default" && (
                        <button
                          onClick={() => setPreviewRoblox((prev) => ({ ...prev, outfit: "default" }))}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors text-[10px]"
                          title="Reset to Studio Dummy"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Face Print</span>
                        <span className="text-xs font-black text-white truncate block max-w-[90px]">
                          {previewRoblox.face && previewRoblox.face !== "classic"
                            ? previewRoblox.face.charAt(0).toUpperCase() + previewRoblox.face.slice(1)
                            : "Classic Smile : )"}
                        </span>
                      </div>
                      {previewRoblox.face && previewRoblox.face !== "classic" && (
                        <button
                          onClick={() => setPreviewRoblox((prev) => ({ ...prev, face: "classic" }))}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors text-[10px]"
                          title="Reset to Classic Smile"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Handheld Gear</span>
                        <span className="text-xs font-black text-white truncate block max-w-[90px]">
                          {previewRoblox.gear && previewRoblox.gear !== "none"
                            ? previewRoblox.gear.charAt(0).toUpperCase() + previewRoblox.gear.slice(1)
                            : "None"}
                        </span>
                      </div>
                      {previewRoblox.gear && previewRoblox.gear !== "none" && (
                        <button
                          onClick={() => setPreviewRoblox((prev) => ({ ...prev, gear: "none" }))}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors text-[10px]"
                          title="Put away Gear"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3. Actions Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={handleSaveRobloxAvatar}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
                      style={{ boxShadow: "0 0 20px rgba(16,185,129,0.35), 0 4px 15px rgba(16,185,129,0.2)" }}
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Avatar</span>
                    </button>

                    {isRobloxPreviewModified && (
                      <button
                        onClick={handleResetRobloxAvatar}
                        className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                        title="Revert preview back to equipped avatar"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Revert</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* ── SHOWROOM MODE: CLASSIC MIRROR ── */
              <div className="relative pt-4 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Live Preview Avatar */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="p-3 rounded-3xl bg-white/5 border border-white/10 shadow-inner">
                    <UserAvatar
                      src={userPhoto}
                      name={displayName}
                      size="xl"
                      frameId={previewFrame}
                      companionIcon={previewItemCompanionObj ? previewItemCompanionObj.icon : undefined}
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Portrait Mirror</span>
                </div>

                {/* Loadout Details */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-black text-white">{displayName}</span>
                    {previewTitle && previewItemTitleObj && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-lg">
                        <span>{previewItemTitleObj.icon}</span>
                        <span>{previewItemTitleObj.name}</span>
                      </span>
                    )}
                    {isClassicPreviewDifferent ? (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                        🔍 Previewing Try-On
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        🟢 Currently Equipped
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Preview your 2D portrait card with active animated laurel frames, academic honorifics, themes, and study companions.
                  </p>

                  {/* Equipped Badges Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-left">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Frame</span>
                      <span className="text-xs font-black text-white truncate block">
                        {previewFrame ? SHOP_ITEMS.find(i => i.id === previewFrame)?.name || "Default" : "None"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-left">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Title</span>
                      <span className="text-xs font-black text-white truncate block">
                        {previewTitle ? SHOP_ITEMS.find(i => i.id === previewTitle)?.name || "None" : "None"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-left">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Theme</span>
                      <span className="text-xs font-black text-white truncate block">
                        {previewTheme ? SHOP_ITEMS.find(i => i.id === previewTheme)?.name.replace(" Theme", "") : "Default Dark"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-left">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Companion</span>
                      <span className="text-xs font-black text-white truncate block">
                        {previewCompanion ? SHOP_ITEMS.find(i => i.id === previewCompanion)?.name || "None" : "None"}
                      </span>
                    </div>
                  </div>

                  {/* Reset Preview Button */}
                  {isClassicPreviewDifferent && (
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                      <button
                        onClick={handleResetClassicPreview}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Revert Preview
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Daily Scholar Mystery Chest Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent p-6 rounded-3xl border border-amber-500/30 flex flex-col justify-between space-y-4 shadow-sm backdrop-blur-xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Gift className="w-4 h-4" /> Daily Mystery Drop
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isDailyChestClaimed 
                    ? "bg-slate-500/20 text-slate-400 border border-slate-500/20" 
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse"
                }`}>
                  {isDailyChestClaimed ? "Claimed" : "Ready to Open"}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Scholar Mystery Chest
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Claim once every 24 hours to receive free Academic XP (up to 85 XP), a Streak Freeze Shield, or a 2-Hour 2x Booster!
              </p>
            </div>

            <div className="flex items-center justify-center py-3">
              <motion.div
                animate={!isDailyChestClaimed ? { rotate: [-2, 2, -2], scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="text-6xl select-none filter drop-shadow-lg"
              >
                {isDailyChestClaimed ? "📭" : "🎁"}
              </motion.div>
            </div>

            <button
              onClick={handleClaimChest}
              disabled={isDailyChestClaimed}
              className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isDailyChestClaimed
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent"
                  : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95"
              }`}
            >
              {isDailyChestClaimed ? (
                <>
                  <Check className="w-4 h-4" /> Next Chest Drops Tomorrow
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Open Daily Chest (Free)
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── 3. SEARCH, CATEGORIES & FILTER TOOLBAR ── */}
        <div className="space-y-4">
          {/* Main Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
            {[
              { id: "all", label: "🌟 All Items", count: SHOP_ITEMS.length },
              { id: "avatar_item", label: "🎮 3D Avatar Gear", count: SHOP_ITEMS.filter(i => i.category === "avatar_item").length },
              { id: "frame", label: "👑 Avatar Frames", count: SHOP_ITEMS.filter(i => i.category === "frame").length },
              { id: "title", label: "🏆 Titles & Badges", count: SHOP_ITEMS.filter(i => i.category === "title").length },
              { id: "theme", label: "🎨 UI Themes", count: SHOP_ITEMS.filter(i => i.category === "theme").length },
              { id: "companion", label: "🐾 Study Companions", count: SHOP_ITEMS.filter(i => i.category === "companion").length },
              { id: "powerup", label: "⚡ Boosts & Shields", count: SHOP_ITEMS.filter(i => i.category === "powerup").length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === "avatar_item") {
                    setShowroomMode("roblox");
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sub-tabs for 3D Avatar Gear when selected */}
          {activeTab === "avatar_item" && (
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 px-2 flex items-center gap-1">
                <Shirt className="w-3 h-3" /> Slot:
              </span>
              {[
                { id: "all", label: "All 3D Gear", icon: "✨" },
                { id: "hat", label: "Hats & Headgear", icon: "🎓" },
                { id: "outfit", label: "Outfits & Uniforms", icon: "👔" },
                { id: "face", label: "Faces & Prints", icon: "🙂" },
                { id: "gear", label: "Handheld Items", icon: "🏆" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setAvatarSubTab(sub.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    avatarSubTab === sub.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search, Status & Sort Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-white/10">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hats, outfits, frames, titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {/* Status Chips */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
                {[
                  { id: "all", label: "All" },
                  { id: "owned", label: "Owned" },
                  { id: "affordable", label: "Affordable" },
                  { id: "locked", label: "Locked" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      statusFilter === f.id
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-white/5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="recommended" className="dark:bg-slate-900">Recommended</option>
                  <option value="price-asc" className="dark:bg-slate-900">Price: Low to High</option>
                  <option value="price-desc" className="dark:bg-slate-900">Price: High to Low</option>
                  <option value="rarity" className="dark:bg-slate-900">Highest Rarity</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. ITEMS GRID ── */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 p-8 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-2xl">
              🔍
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No items found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No reward matching your current search and filter settings. Try switching category tabs or clearing your search.
            </p>
            <button
              onClick={() => {
                setActiveTab("all");
                setAvatarSubTab("all");
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isUnlocked = shopState.unlockedItems.includes(item.id);
              const canAfford = userXp >= item.cost;
              
              const isEquipped =
                item.category === "avatar_item"
                  ? item.robloxSlot && (shopState.robloxAvatar as any)[item.robloxSlot] === item.robloxValue
                  : (item.category === "frame" && shopState.equippedFrame === item.id) ||
                    (item.category === "title" && shopState.equippedTitle === item.id) ||
                    (item.category === "theme" && shopState.equippedTheme === item.id) ||
                    (item.category === "companion" && shopState.equippedCompanion === item.id);

              const isCosmetic = item.category !== "powerup";

              const rarityBadgeConfig: Record<ItemRarity, { label: string; bg: string; text: string; border: string }> = {
                mythic: { label: "Mythic", bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
                legendary: { label: "Legendary", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
                epic: { label: "Epic", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
                rare: { label: "Rare", bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/30" },
                common: { label: "Common", bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30" },
              };

              const rCfg = rarityBadgeConfig[item.rarity];

              return (
                <motion.div
                  key={item.id}
                  layout
                  whileHover={{ y: -3 }}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 shadow-sm bg-white dark:bg-slate-900 ${
                    isEquipped
                      ? "border-emerald-500/50 shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                      : isUnlocked
                      ? "border-slate-300 dark:border-white/15"
                      : "border-slate-200 dark:border-white/10"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Card Top: Icon & Rarity / Price */}
                    <div className="flex items-start justify-between">
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                          item.accentColor ? `bg-gradient-to-br ${item.accentColor} bg-opacity-20` : "bg-slate-100 dark:bg-slate-800"
                        }`}>
                          {item.icon}
                        </div>
                        {isEquipped && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5">
                          {item.robloxSlot && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              3D {item.robloxSlot}
                            </span>
                          )}
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${rCfg.bg} ${rCfg.text} ${rCfg.border}`}>
                            {rCfg.label}
                          </span>
                        </div>

                        {isUnlocked && isCosmetic ? (
                          <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3" /> Unlocked
                          </span>
                        ) : (
                          <span className="text-xs font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg font-mono">
                            {item.cost} XP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    {/* Perk Feature Highlight */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="font-semibold">{item.perk}</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    {/* Try On Button (For Cosmetics) */}
                    {isCosmetic && (
                      <button
                        onClick={() => handleTryOn(item)}
                        className="w-full py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-all flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{item.category === "avatar_item" ? "Try On in 3D Studio" : "Try On in Wardrobe"}</span>
                      </button>
                    )}

                    {/* Primary Equip / Purchase Button */}
                    {isUnlocked && isCosmetic ? (
                      <button
                        onClick={() => handleEquipToggle(item)}
                        className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                          isEquipped
                            ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 active:scale-98"
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Currently Equipped
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3.5 h-3.5" /> Equip Item
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenPurchase(item)}
                        disabled={!canAfford}
                        className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                          canAfford
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-600/25 active:scale-98"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-white/5"
                        }`}
                      >
                        {canAfford ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5" /> Unlock for {item.cost} XP
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" /> Need {item.cost - userXp} More XP
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── 5. CONFIRM PURCHASE MODAL ── */}
        <AnimatePresence>
          {pendingPurchaseItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPendingPurchaseItem(null)}
                className="fixed inset-0 bg-black/70 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-7 space-y-6"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Confirm Academic Unlock
                  </span>
                  <button
                    onClick={() => setPendingPurchaseItem(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-4xl shrink-0">
                    {pendingPurchaseItem.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {pendingPurchaseItem.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {pendingPurchaseItem.desc}
                    </p>
                  </div>
                </div>

                {/* Balance Math Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Current Balance:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{userXp} XP</span>
                  </div>
                  <div className="flex justify-between text-rose-500 font-bold">
                    <span>Item Price:</span>
                    <span className="font-mono">-{pendingPurchaseItem.cost} XP</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between font-extrabold text-slate-900 dark:text-white">
                    <span>Balance After Unlock:</span>
                    <span className="font-mono text-emerald-500">{userXp - pendingPurchaseItem.cost} XP</span>
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPendingPurchaseItem(null)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPurchase}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" /> Confirm Unlock
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── 6. STARTER BONUS / FAQ FOOTER ── */}
        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl shrink-0">
              💡
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Need XP for more Avatar Gear?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Earn XP by reading NCERT chapters, reviewing spaced-repetition flashcards, solving PYQs, and competing in the Arena!
              </p>
            </div>
          </div>

          <button
            onClick={handleClaimStarterBonus}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all shrink-0 active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+300 Explorer XP</span>
          </button>
        </div>

      </div>
    </div>
  );
}

function RocketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
