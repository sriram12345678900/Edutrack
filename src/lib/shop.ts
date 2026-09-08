"use client";

export type ShopCategory = "frame" | "title" | "theme" | "companion" | "powerup" | "avatar_item";
export type ItemRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  cost: number;
  icon: string;
  desc: string;
  rarity: ItemRarity;
  perk: string;
  previewClass?: string;
  accentColor?: string;
  robloxSlot?: "hat" | "outfit" | "face" | "gear" | "skin";
  robloxValue?: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // ── 1. AVATAR FRAMES ──
  {
    id: "frame-gold",
    name: "Golden Scholar Laurels",
    category: "frame",
    cost: 200,
    icon: "👑",
    desc: "Shimmering 24k gold animated laurel wreath with a radiant halo for high-achieving scholars.",
    rarity: "rare",
    perk: "Glows gold in leaderboard and sidebar",
    previewClass: "avatar-frame-gold",
    accentColor: "from-amber-400 to-yellow-500"
  },
  {
    id: "frame-cyber",
    name: "Cyberpunk Neon Grid",
    category: "frame",
    cost: 350,
    icon: "⚡",
    desc: "Futuristic pulsating cyan and electric magenta border with cybernetic audio-reactive vibes.",
    rarity: "epic",
    perk: "Animated dual-tone neon pulse effect",
    previewClass: "avatar-frame-cyber",
    accentColor: "from-cyan-400 to-fuchsia-500"
  },
  {
    id: "frame-cosmic",
    name: "Cosmic Nebula Orbit",
    category: "frame",
    cost: 500,
    icon: "🪐",
    desc: "Deep space gravitational lens with orbiting stardust particles and violet stellar glow.",
    rarity: "legendary",
    perk: "Rotating interstellar particles",
    previewClass: "avatar-frame-cosmic",
    accentColor: "from-indigo-500 via-purple-500 to-pink-500"
  },
  {
    id: "frame-fire",
    name: "Phoenix Flame Aura",
    category: "frame",
    cost: 400,
    icon: "🔥",
    desc: "Blazing inferno halo awarded to students keeping intense study streaks burning bright.",
    rarity: "epic",
    perk: "Flickering amber fire glow aura",
    previewClass: "avatar-frame-fire",
    accentColor: "from-orange-500 to-red-600"
  },
  {
    id: "frame-frost",
    name: "Glacial Frost Crystal",
    category: "frame",
    cost: 300,
    icon: "❄️",
    desc: "Sub-zero crystalline hexagonal ring that shimmers with icy blue diamond reflections.",
    rarity: "rare",
    perk: "Crystalline shimmer border",
    previewClass: "avatar-frame-frost",
    accentColor: "from-sky-300 to-blue-500"
  },
  {
    id: "frame-emerald",
    name: "Emerald Matrix Circuit",
    category: "frame",
    cost: 250,
    icon: "🧪",
    desc: "Bio-luminescent circuit traces streaming binary digital data around your avatar.",
    rarity: "common",
    perk: "Matrix green digital pulse",
    previewClass: "avatar-frame-emerald",
    accentColor: "from-emerald-400 to-teal-600"
  },

  // ── 2. ACADEMIC TITLES & BADGES ──
  {
    id: "title-topper",
    name: "CBSE All-India Topper",
    category: "title",
    cost: 300,
    icon: "🏆",
    desc: "The pinnacle academic honorific displayed prominently under your name across EduTrack.",
    rarity: "mythic",
    perk: "Gold badge next to your nickname",
    accentColor: "from-amber-400 to-yellow-600"
  },
  {
    id: "title-prodigy",
    name: "Quantum Prodigy",
    category: "title",
    cost: 250,
    icon: "⚛️",
    desc: "Signifies mastery of fundamental physics, mathematical formulations, and chemistry concepts.",
    rarity: "legendary",
    perk: "Neon cyan atom badge",
    accentColor: "from-cyan-400 to-blue-600"
  },
  {
    id: "title-wizard",
    name: "Math Olympiad Wizard",
    category: "title",
    cost: 250,
    icon: "📐",
    desc: "Honors unmatched problem-solving speed and algebraic intuition in tests and quizzes.",
    rarity: "legendary",
    perk: "Geometric gold compass badge",
    accentColor: "from-purple-400 to-indigo-600"
  },
  {
    id: "title-feynman",
    name: "Feynman Master Teacher",
    category: "title",
    cost: 200,
    icon: "🧠",
    desc: "Recognizes exceptional intuition and ability to explain complex concepts simply in Feynman Lab.",
    rarity: "epic",
    perk: "Brain intellect badge",
    accentColor: "from-pink-400 to-rose-600"
  },
  {
    id: "title-polyglot",
    name: "Linguistic Polyglot",
    category: "title",
    cost: 200,
    icon: "🗣️",
    desc: "For scholars excelling in English Literature, Hindi Vyakaran, and multilingual analysis.",
    rarity: "rare",
    perk: "Multilingual speech badge",
    accentColor: "from-emerald-400 to-teal-500"
  },
  {
    id: "title-archivist",
    name: "NCERT Grand Archivist",
    category: "title",
    cost: 150,
    icon: "📜",
    desc: "Proof of comprehensive syllabus coverage and deep NCERT textbook revision.",
    rarity: "common",
    perk: "Scroll of wisdom badge",
    accentColor: "from-slate-400 to-zinc-600"
  },

  // ── 3. GLOBAL UI THEMES ──
  {
    id: "theme-cyberpunk",
    name: "Midnight Cyberpunk",
    category: "theme",
    cost: 300,
    icon: "🌆",
    desc: "Electric cyan and neon magenta UI theme with deep dark-space aesthetic and glowing accents.",
    rarity: "legendary",
    perk: "Changes app buttons, accents, and glows to Cyberpunk",
    accentColor: "from-cyan-400 via-fuchsia-500 to-purple-600"
  },
  {
    id: "theme-emerald",
    name: "Emerald Matrix",
    category: "theme",
    cost: 300,
    icon: "🧪",
    desc: "Bio-luminescent neon emerald and deep forest green accents inspired by biology labs.",
    rarity: "epic",
    perk: "Changes app buttons, accents, and glows to Emerald",
    accentColor: "from-emerald-400 to-teal-500"
  },
  {
    id: "theme-sunset",
    name: "Sunset Gold",
    category: "theme",
    cost: 300,
    icon: "🌅",
    desc: "Warm amber, golden honey, and rich crimson twilight hues designed for calm evening focus.",
    rarity: "epic",
    perk: "Changes app buttons, accents, and glows to Sunset Gold",
    accentColor: "from-amber-400 via-orange-500 to-rose-500"
  },
  {
    id: "theme-cosmic",
    name: "Cosmic Nebula",
    category: "theme",
    cost: 350,
    icon: "🌌",
    desc: "Starlight violet, deep indigo, and electric stardust purple highlights.",
    rarity: "mythic",
    perk: "Changes app buttons, accents, and glows to Cosmic Nebula",
    accentColor: "from-violet-400 via-purple-500 to-indigo-600"
  },

  // ── 4. STUDY COMPANIONS / MASCOTS ──
  {
    id: "pet-owl",
    name: "Athena the Wise Owl",
    category: "companion",
    cost: 400,
    icon: "🦉",
    desc: "A nocturnal academic companion perched on your workspace to keep you alert during late-night study.",
    rarity: "legendary",
    perk: "Appears in your wardrobe & study cards offering study tips",
    accentColor: "from-amber-300 to-yellow-600"
  },
  {
    id: "pet-robot",
    name: "Byte the AI Bot",
    category: "companion",
    cost: 350,
    icon: "🤖",
    desc: "Friendly AI co-pilot that celebrates correct answers and computes numerical formula shortcuts.",
    rarity: "epic",
    perk: "Animated robot cheer in wardrobe & quizzes",
    accentColor: "from-cyan-400 to-blue-500"
  },
  {
    id: "pet-dragon",
    name: "Ignis the Spark Drake",
    category: "companion",
    cost: 500,
    icon: "🐉",
    desc: "Fierce mini dragon who feeds on your study consistency and breathes sparks on daily streaks.",
    rarity: "mythic",
    perk: "Flames up when your streak increases",
    accentColor: "from-red-500 to-amber-500"
  },
  {
    id: "pet-capybara",
    name: "Zen the Chillbara",
    category: "companion",
    cost: 300,
    icon: "🐾",
    desc: "The most serene creature in the animal kingdom, proven to reduce exam anxiety and stress.",
    rarity: "rare",
    perk: "Soothing zen presence on your dashboard",
    accentColor: "from-amber-700 to-yellow-800"
  },

  // ── 5. POWER-UPS & UTILITIES ──
  {
    id: "pwr-freeze",
    name: "Streak Freeze Shield",
    category: "powerup",
    cost: 100,
    icon: "🧊",
    desc: "Automatically guards your daily study streak if you miss a day. Stackable up to 5 shields in inventory!",
    rarity: "rare",
    perk: "Auto-saves streak on inactive days (Stackable)",
    accentColor: "from-cyan-400 to-sky-600"
  },
  {
    id: "pwr-2x",
    name: "2x XP Booster (24 Hours)",
    category: "powerup",
    cost: 200,
    icon: "🚀",
    desc: "Doubles ALL XP earned across flashcards, mock tests, EduArcade games, and daily quests for 24 full hours.",
    rarity: "epic",
    perk: "True 2x multiplier on all XP earned everywhere",
    accentColor: "from-indigo-500 to-fuchsia-600"
  },
  {
    id: "pwr-hint",
    name: "AI Hint Battery Pack (x5)",
    category: "powerup",
    cost: 150,
    icon: "💡",
    desc: "Unlocks 5 high-tier conceptual hints and formula breakdowns in difficult mock tests and quizzes.",
    rarity: "common",
    perk: "5 instant deep-dive AI hints",
    accentColor: "from-yellow-400 to-amber-500"
  },
  {
    id: "pwr-lucky",
    name: "Lucky 7-Day Clover",
    category: "powerup",
    cost: 250,
    icon: "🍀",
    desc: "Grants a +20% bonus XP chance on every correct quiz answer and triggers rare rainbow celebratory confetti.",
    rarity: "legendary",
    perk: "+20% bonus XP chance for 7 days",
    accentColor: "from-emerald-400 to-green-600"
  },

  // ── 6. 3D ROBLOX AVATAR ACCESSORIES & SKINS ──
  // HATS
  {
    id: "rhat-scholar",
    name: "Scholar Mortarboard Cap",
    category: "avatar_item",
    cost: 150,
    icon: "🎓",
    desc: "Academic graduation cap with golden hanging tassel for your 3D Scholar Avatar.",
    rarity: "rare",
    perk: "Equips 3D Scholar Cap on avatar",
    robloxSlot: "hat",
    robloxValue: "scholar",
    accentColor: "from-indigo-600 to-slate-900"
  },
  {
    id: "rhat-crown",
    name: "24K Imperial Scholar Crown",
    category: "avatar_item",
    cost: 250,
    icon: "👑",
    desc: "Gleaming royal gold crown encrusted with ruby gems that sits atop your character's head.",
    rarity: "legendary",
    perk: "Equips 3D Golden Crown on avatar",
    robloxSlot: "hat",
    robloxValue: "crown",
    accentColor: "from-amber-400 to-yellow-600"
  },
  {
    id: "rhat-cyber",
    name: "Cyberpunk Neon HUD Visor",
    category: "avatar_item",
    cost: 200,
    icon: "⚡",
    desc: "Futuristic neon cyan & magenta glowing visor that covers your character's eyes.",
    rarity: "epic",
    perk: "Equips glowing neon visor on avatar",
    robloxSlot: "hat",
    robloxValue: "cyber",
    accentColor: "from-cyan-400 to-fuchsia-500"
  },
  {
    id: "rhat-astro",
    name: "Cosmic Astronaut Helmet",
    category: "avatar_item",
    cost: 250,
    icon: "🧑‍🚀",
    desc: "Translucent bubble spacesuit helmet with starlight reflections.",
    rarity: "legendary",
    perk: "Equips 3D Space Helmet on avatar",
    robloxSlot: "hat",
    robloxValue: "astro",
    accentColor: "from-sky-400 to-blue-600"
  },
  {
    id: "rhat-headphones",
    name: "RGB Gaming Study Headset",
    category: "avatar_item",
    cost: 200,
    icon: "🎧",
    desc: "High-fidelity glowing RGB ear cups designed for listening to lo-fi study podcasts.",
    rarity: "rare",
    perk: "Equips 3D Gaming Headphones on avatar",
    robloxSlot: "hat",
    robloxValue: "headphones",
    accentColor: "from-purple-500 to-pink-500"
  },
  {
    id: "rhat-halo",
    name: "Saint of 99th Percentile Halo",
    category: "avatar_item",
    cost: 250,
    icon: "😇",
    desc: "A floating celestial golden ring hovering softly above your character's head.",
    rarity: "mythic",
    perk: "Equips floating animated Halo on avatar",
    robloxSlot: "hat",
    robloxValue: "halo",
    accentColor: "from-yellow-300 to-amber-500"
  },
  {
    id: "rhat-wizard",
    name: "Arcane Olympiad Wizard Hat",
    category: "avatar_item",
    cost: 200,
    icon: "🧙",
    desc: "Conical purple wizard hat adorned with silver constellations and equation runes.",
    rarity: "epic",
    perk: "Equips 3D Wizard Hat on avatar",
    robloxSlot: "hat",
    robloxValue: "wizard",
    accentColor: "from-purple-600 to-indigo-800"
  },

  // OUTFITS
  {
    id: "routfit-white",
    name: "Pristine Studio Body",
    category: "avatar_item",
    cost: 100,
    icon: "⚪",
    desc: "The clean, minimalist studio-lighting white Scholar dummy from the classic character editor.",
    rarity: "common",
    perk: "Default studio white humanoid appearance",
    robloxSlot: "outfit",
    robloxValue: "default",
    accentColor: "from-slate-100 to-slate-300"
  },
  {
    id: "routfit-noob",
    name: "Classic Blocky Noob Outfit",
    category: "avatar_item",
    cost: 150,
    icon: "🟦",
    desc: "The iconic yellow skin, blue shirt, and green pants worn by millions of blocky avatar legends.",
    rarity: "rare",
    perk: "Equips classic blue torso & green legs",
    robloxSlot: "outfit",
    robloxValue: "noob",
    accentColor: "from-blue-500 to-green-500"
  },
  {
    id: "routfit-suit",
    name: "Oxford Scholar Blazer & Tie",
    category: "avatar_item",
    cost: 200,
    icon: "👔",
    desc: "Tailored navy school blazer with a white collared shirt and crimson red tie.",
    rarity: "rare",
    perk: "Equips formal scholar uniform & tie",
    robloxSlot: "outfit",
    robloxValue: "suit",
    accentColor: "from-slate-800 to-rose-700"
  },
  {
    id: "routfit-labcoat",
    name: "Chemistry Lab Coat & ID",
    category: "avatar_item",
    cost: 200,
    icon: "🥼",
    desc: "Protective white scientist lab coat with pockets, pens, and an EduTrack research badge.",
    rarity: "epic",
    perk: "Equips scientist lab coat on avatar",
    robloxSlot: "outfit",
    robloxValue: "labcoat",
    accentColor: "from-emerald-500 to-teal-700"
  },
  {
    id: "routfit-cyber",
    name: "Midnight Cyberpunk Techwear",
    category: "avatar_item",
    cost: 250,
    icon: "🌆",
    desc: "Carbon-fiber black armor reinforced with glowing neon cyan circuit lines.",
    rarity: "legendary",
    perk: "Equips glowing cyber armor on avatar",
    robloxSlot: "outfit",
    robloxValue: "cyber",
    accentColor: "from-cyan-400 to-fuchsia-600"
  },
  {
    id: "routfit-golden",
    name: "Grandmaster Ceremonial Robes",
    category: "avatar_item",
    cost: 300,
    icon: "✨",
    desc: "Regal ceremonial robes woven with liquid gold threads for top leaderboard scholars.",
    rarity: "mythic",
    perk: "Equips gilded master robes on avatar",
    robloxSlot: "outfit",
    robloxValue: "golden",
    accentColor: "from-amber-400 to-yellow-600"
  },

  // HANDHELD GEAR
  {
    id: "rgear-trophy",
    name: "CBSE Gold 1st Place Trophy",
    category: "avatar_item",
    cost: 200,
    icon: "🏆",
    desc: "Held proudly in your character's hand to showcase board examination excellence.",
    rarity: "legendary",
    perk: "Avatar holds 3D Golden Trophy",
    robloxSlot: "gear",
    robloxValue: "trophy",
    accentColor: "from-amber-400 to-yellow-500"
  },
  {
    id: "rgear-flask",
    name: "Luminescent Chemistry Flask",
    category: "avatar_item",
    cost: 150,
    icon: "🧪",
    desc: "Bubbling emerald bio-chemical compound flask held during revision.",
    rarity: "rare",
    perk: "Avatar holds glowing Science Flask",
    robloxSlot: "gear",
    robloxValue: "flask",
    accentColor: "from-emerald-400 to-teal-600"
  },
  {
    id: "rgear-wand",
    name: "Cosmic Equation Wand",
    category: "avatar_item",
    cost: 200,
    icon: "🪄",
    desc: "Star-crested magic wand that channels calculus formulas into sparkling spells.",
    rarity: "epic",
    perk: "Avatar holds Star Magic Wand",
    robloxSlot: "gear",
    robloxValue: "wand",
    accentColor: "from-purple-400 to-pink-500"
  },
  {
    id: "rgear-sword",
    name: "Laser Plasma Energy Blade",
    category: "avatar_item",
    cost: 250,
    icon: "🗡️",
    desc: "High-frequency glowing energy katana for slicing through tough physics derivations.",
    rarity: "mythic",
    perk: "Avatar holds glowing Laser Katana",
    robloxSlot: "gear",
    robloxValue: "sword",
    accentColor: "from-cyan-400 to-blue-600"
  },
  {
    id: "rgear-book",
    name: "NCERT Master Grimoire",
    category: "avatar_item",
    cost: 150,
    icon: "📖",
    desc: "Heavy leatherbound textbook packed with key definitions, diagrams, and formulas.",
    rarity: "common",
    perk: "Avatar holds hardbound NCERT Book",
    robloxSlot: "gear",
    robloxValue: "book",
    accentColor: "from-amber-800 to-yellow-900"
  },

  // FACES
  {
    id: "rface-classic",
    name: "Classic Scholar Smile Face",
    category: "avatar_item",
    cost: 50,
    icon: "🙂",
    desc: "The iconic, original curved smile and oval black eyes — the timeless blocky avatar expression.",
    rarity: "common",
    perk: "Equips classic blocky smiling face",
    robloxSlot: "face",
    robloxValue: "classic",
    accentColor: "from-slate-300 to-slate-500"
  },
  {
    id: "rface-chill",
    name: "Chill Sunglasses Face",
    category: "avatar_item",
    cost: 100,
    icon: "😎",
    desc: "Dark rectangular shades and a knowing smirk for effortless exam preparation.",
    rarity: "rare",
    perk: "Equips cool sunglasses face print",
    robloxSlot: "face",
    robloxValue: "chill",
    accentColor: "from-slate-700 to-slate-950"
  },
  {
    id: "rface-genius",
    name: "Genius Scholar Spectacles",
    category: "avatar_item",
    cost: 100,
    icon: "🧐",
    desc: "Round academic wireframe glasses with a studious, analytical expression.",
    rarity: "epic",
    perk: "Equips round intellectual glasses face",
    robloxSlot: "face",
    robloxValue: "genius",
    accentColor: "from-indigo-400 to-purple-600"
  },
  {
    id: "rface-laser",
    name: "Starstruck Focus Eyes",
    category: "avatar_item",
    cost: 150,
    icon: "🤩",
    desc: "Animated sparkling star pupils beaming with enthusiasm for new concepts.",
    rarity: "legendary",
    perk: "Equips sparkling star focus face",
    robloxSlot: "face",
    robloxValue: "laser",
    accentColor: "from-yellow-400 to-amber-500"
  }
];

export interface RobloxAvatarConfig {
  bodyColor?: string;
  face?: "classic" | "chill" | "genius" | "laser" | "laugh";
  hat?: "none" | "scholar" | "crown" | "cyber" | "astro" | "headphones" | "halo" | "wizard";
  outfit?: "default" | "noob" | "suit" | "labcoat" | "cyber" | "golden";
  gear?: "none" | "trophy" | "flask" | "wand" | "sword" | "book";
  pose?: "idle" | "wave" | "cheer" | "levitate";
}

export interface ShopState {
  unlockedItems: string[];
  equippedFrame: string | null;
  equippedTitle: string | null;
  equippedTheme: string | null;
  equippedCompanion: string | null;
  robloxAvatar: RobloxAvatarConfig;
  streakFreezes: number;
  boosterExpiresAt: number | null;
  luckyCloverExpiresAt: number | null;
  lastDailyRewardDate: string | null;
  hintsCount: number;
}

const DEFAULT_SHOP_STATE: ShopState = {
  unlockedItems: ["frame-gold", "rface-classic", "rhat-scholar", "routfit-white"],
  equippedFrame: "frame-gold",
  equippedTitle: null,
  equippedTheme: null,
  equippedCompanion: null,
  robloxAvatar: {
    bodyColor: "#f1f3f6", // Studio White Dummy like user image!
    face: "classic",
    hat: "scholar",
    outfit: "default",
    gear: "none",
    pose: "idle",
  },
  streakFreezes: 1,
  boosterExpiresAt: null,
  luckyCloverExpiresAt: null,
  lastDailyRewardDate: null,
  hintsCount: 3,
};

/**
 * Safely load shop state from localStorage
 */
export function getShopState(): ShopState {
  if (typeof window === "undefined") return DEFAULT_SHOP_STATE;

  try {
    const rawUnlocked = localStorage.getItem("edutrack_shop_unlocked");
    const equippedFrame = localStorage.getItem("edutrack_equipped_frame");
    const equippedTitle = localStorage.getItem("edutrack_equipped_title");
    const equippedTheme = localStorage.getItem("edutrack_equipped_theme");
    const equippedCompanion = localStorage.getItem("edutrack_equipped_companion");
    const rawRoblox = localStorage.getItem("edutrack_roblox_avatar");
    const streakFreezes = localStorage.getItem("edutrack_streak_freezes");
    const boosterExpiresAt = localStorage.getItem("edutrack_xp_booster_until");
    const luckyCloverExpiresAt = localStorage.getItem("edutrack_lucky_clover_until");
    const lastDailyRewardDate = localStorage.getItem("edutrack_last_daily_reward");
    const hintsCount = localStorage.getItem("edutrack_hints_count");

    let unlockedItems: string[] = ["frame-gold", "rface-classic", "rhat-scholar", "routfit-white"];
    if (rawUnlocked) {
      try {
        unlockedItems = JSON.parse(rawUnlocked);
      } catch {
        unlockedItems = ["frame-gold", "rface-classic", "rhat-scholar", "routfit-white"];
      }
    }

    let robloxAvatar: RobloxAvatarConfig = DEFAULT_SHOP_STATE.robloxAvatar;
    if (rawRoblox) {
      try {
        robloxAvatar = { ...DEFAULT_SHOP_STATE.robloxAvatar, ...JSON.parse(rawRoblox) };
      } catch (_) {}
    }

    return {
      unlockedItems: Array.isArray(unlockedItems) ? unlockedItems : ["frame-gold", "rface-classic", "rhat-scholar", "routfit-white"],
      equippedFrame: equippedFrame || "frame-gold",
      equippedTitle: equippedTitle || null,
      equippedTheme: equippedTheme || null,
      equippedCompanion: equippedCompanion || null,
      robloxAvatar,
      streakFreezes: streakFreezes ? parseInt(streakFreezes, 10) : 1,
      boosterExpiresAt: boosterExpiresAt ? parseInt(boosterExpiresAt, 10) : null,
      luckyCloverExpiresAt: luckyCloverExpiresAt ? parseInt(luckyCloverExpiresAt, 10) : null,
      lastDailyRewardDate: lastDailyRewardDate || null,
      hintsCount: hintsCount ? parseInt(hintsCount, 10) : 3,
    };
  } catch {
    return DEFAULT_SHOP_STATE;
  }
}

/**
 * Save shop state to localStorage and broadcast event
 */
export function saveShopState(state: ShopState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("edutrack_shop_unlocked", JSON.stringify(state.unlockedItems));
    localStorage.setItem("edutrack_roblox_avatar", JSON.stringify(state.robloxAvatar));
    
    if (state.equippedFrame) {
      localStorage.setItem("edutrack_equipped_frame", state.equippedFrame);
    } else {
      localStorage.removeItem("edutrack_equipped_frame");
    }

    if (state.equippedTitle) {
      localStorage.setItem("edutrack_equipped_title", state.equippedTitle);
    } else {
      localStorage.removeItem("edutrack_equipped_title");
    }

    if (state.equippedTheme) {
      localStorage.setItem("edutrack_equipped_theme", state.equippedTheme);
    } else {
      localStorage.removeItem("edutrack_equipped_theme");
    }

    if (state.equippedCompanion) {
      localStorage.setItem("edutrack_equipped_companion", state.equippedCompanion);
    } else {
      localStorage.removeItem("edutrack_equipped_companion");
    }

    localStorage.setItem("edutrack_streak_freezes", state.streakFreezes.toString());
    
    if (state.boosterExpiresAt) {
      localStorage.setItem("edutrack_xp_booster_until", state.boosterExpiresAt.toString());
    } else {
      localStorage.removeItem("edutrack_xp_booster_until");
    }

    if (state.luckyCloverExpiresAt) {
      localStorage.setItem("edutrack_lucky_clover_until", state.luckyCloverExpiresAt.toString());
    } else {
      localStorage.removeItem("edutrack_lucky_clover_until");
    }

    if (state.lastDailyRewardDate) {
      localStorage.setItem("edutrack_last_daily_reward", state.lastDailyRewardDate);
    }

    localStorage.setItem("edutrack_hints_count", state.hintsCount.toString());

    // Apply theme changes to document
    applyTheme(state.equippedTheme);

    // Broadcast reactive update
    window.dispatchEvent(new CustomEvent("edutrack_shop_updated", { detail: state }));
  } catch (err) {
    console.error("Failed to save shop state:", err);
  }
}

/**
 * Apply the equipped theme to document.documentElement
 */
export function applyTheme(themeId: string | null): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  
  if (!themeId) {
    root.removeAttribute("data-theme");
    return;
  }

  // Format e.g. theme-cyberpunk -> cyberpunk
  const themeName = themeId.replace("theme-", "");
  root.setAttribute("data-theme", themeName);
}

/**
 * Initialize theme on page load
 */
export function initTheme(): void {
  if (typeof window === "undefined") return;
  const equippedTheme = localStorage.getItem("edutrack_equipped_theme");
  applyTheme(equippedTheme);
}

/**
 * Check if 2x XP booster is currently active
 */
export function isBoosterActive(): boolean {
  if (typeof window === "undefined") return false;
  const exp = localStorage.getItem("edutrack_xp_booster_until");
  if (!exp) return false;
  const expTime = parseInt(exp, 10);
  return expTime > Date.now();
}

/**
 * Get human-readable time remaining on 2x booster
 */
export function getBoosterTimeRemaining(): string | null {
  if (typeof window === "undefined") return null;
  const exp = localStorage.getItem("edutrack_xp_booster_until");
  if (!exp) return null;
  const diff = parseInt(exp, 10) - Date.now();
  if (diff <= 0) return null;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

/**
 * Buy a shop item
 */
export function buyShopItem(item: ShopItem): { success: boolean; message: string } {
  if (typeof window === "undefined") return { success: false, message: "Window unavailable" };

  const currentXpStr = localStorage.getItem("edutrack_xp") || "350";
  const currentXp = parseInt(currentXpStr, 10);

  if (currentXp < item.cost) {
    return {
      success: false,
      message: `You need ${item.cost - currentXp} more XP to purchase ${item.name}! Complete more quizzes to earn XP.`,
    };
  }

  const state = getShopState();

  // Deduct XP
  const newXp = currentXp - item.cost;
  localStorage.setItem("edutrack_xp", newXp.toString());

  // Also sync with Zustand Gamification Store if available
  try {
    const rawGami = localStorage.getItem("edutrack-gamification-storage");
    if (rawGami) {
      const parsed = JSON.parse(rawGami);
      if (parsed.state) {
        parsed.state.xp = newXp;
        localStorage.setItem("edutrack-gamification-storage", JSON.stringify(parsed));
      }
    }
  } catch (_) {}

  // Handle item specific unlock / inventory logic
  if (item.id === "pwr-freeze") {
    // Consumable streak freeze
    state.streakFreezes = Math.min(state.streakFreezes + 1, 5);
  } else if (item.id === "pwr-2x") {
    // 24-hour booster (extend if already running)
    const now = Date.now();
    const duration = 24 * 60 * 60 * 1000;
    if (state.boosterExpiresAt && state.boosterExpiresAt > now) {
      state.boosterExpiresAt += duration;
    } else {
      state.boosterExpiresAt = now + duration;
    }
  } else if (item.id === "pwr-hint") {
    state.hintsCount = (state.hintsCount || 0) + 5;
  } else if (item.id === "pwr-lucky") {
    const duration = 7 * 24 * 60 * 60 * 1000;
    state.luckyCloverExpiresAt = Date.now() + duration;
  } else {
    // Permanent cosmetic item
    if (!state.unlockedItems.includes(item.id)) {
      state.unlockedItems.push(item.id);
    }
    // Auto-equip cosmetics on purchase!
    if (item.category === "frame") state.equippedFrame = item.id;
    if (item.category === "title") state.equippedTitle = item.id;
    if (item.category === "theme") state.equippedTheme = item.id;
    if (item.category === "companion") state.equippedCompanion = item.id;
    if (item.category === "avatar_item" && item.robloxSlot && item.robloxValue) {
      state.robloxAvatar = { ...state.robloxAvatar, [item.robloxSlot]: item.robloxValue };
    }
  }

  saveShopState(state);

  // Broadcast XP event
  window.dispatchEvent(new CustomEvent("edutrack_xp_updated", { detail: { xp: newXp } }));

  // Play purchase fanfare
  playShopSound("buy");

  return {
    success: true,
    message: `🎉 Successfully unlocked ${item.name}!`,
  };
}

/**
 * Equip an unlocked item
 */
export function equipShopItem(itemId: string, category: ShopCategory): boolean {
  const state = getShopState();
  if (!state.unlockedItems.includes(itemId)) return false;

  if (category === "frame") state.equippedFrame = itemId;
  if (category === "title") state.equippedTitle = itemId;
  if (category === "theme") state.equippedTheme = itemId;
  if (category === "companion") state.equippedCompanion = itemId;
  if (category === "avatar_item") {
    const itm = SHOP_ITEMS.find(i => i.id === itemId);
    if (itm && itm.robloxSlot && itm.robloxValue) {
      state.robloxAvatar = { ...state.robloxAvatar, [itm.robloxSlot]: itm.robloxValue };
    }
  }

  saveShopState(state);
  playShopSound("equip");
  return true;
}

/**
 * Unequip an item in a category
 */
export function unequipShopItem(category: ShopCategory, robloxSlot?: "hat" | "outfit" | "face" | "gear"): boolean {
  const state = getShopState();

  if (category === "frame") state.equippedFrame = null;
  if (category === "title") state.equippedTitle = null;
  if (category === "theme") state.equippedTheme = null;
  if (category === "companion") state.equippedCompanion = null;
  if (category === "avatar_item" && robloxSlot) {
    if (robloxSlot === "hat") state.robloxAvatar.hat = "none";
    if (robloxSlot === "gear") state.robloxAvatar.gear = "none";
    if (robloxSlot === "outfit") state.robloxAvatar.outfit = "default";
    if (robloxSlot === "face") state.robloxAvatar.face = "classic";
  }

  saveShopState(state);
  playShopSound("equip");
  return true;
}

/**
 * Save Scholar Avatar custom config
 */
export function saveRobloxAvatarConfig(newConfig: Partial<RobloxAvatarConfig>): void {
  const state = getShopState();
  state.robloxAvatar = { ...state.robloxAvatar, ...newConfig };
  saveShopState(state);
}

/**
 * Claim Daily Free Mystery Chest
 */
export function claimDailyMysteryChest(): {
  success: boolean;
  rewardType?: "xp" | "freeze" | "booster";
  amount?: number;
  message: string;
} {
  if (typeof window === "undefined") return { success: false, message: "Window unavailable" };

  const state = getShopState();
  const todayStr = new Date().toDateString();

  if (state.lastDailyRewardDate === todayStr) {
    return {
      success: false,
      message: "You have already claimed today's Mystery Chest! Return tomorrow for another drop.",
    };
  }

  // Roll random reward: 70% XP (35-80 XP), 20% Streak Freeze, 10% 2h Mini Booster
  const roll = Math.random();
  let rewardType: "xp" | "freeze" | "booster" = "xp";
  let amount = 50;
  let rewardLabel = "50 Bonus XP";

  if (roll < 0.70) {
    rewardType = "xp";
    amount = Math.floor(Math.random() * 50) + 35; // 35 to 85 XP
    rewardLabel = `${amount} Academic XP`;

    const curXp = parseInt(localStorage.getItem("edutrack_xp") || "350", 10);
    const newXp = curXp + amount;
    localStorage.setItem("edutrack_xp", newXp.toString());
    window.dispatchEvent(new CustomEvent("edutrack_xp_updated", { detail: { xp: newXp } }));
  } else if (roll < 0.90) {
    rewardType = "freeze";
    amount = 1;
    rewardLabel = "1 Streak Freeze Shield";
    state.streakFreezes = Math.min(state.streakFreezes + 1, 5);
  } else {
    rewardType = "booster";
    amount = 2; // 2 hours
    rewardLabel = "2-Hour 2x XP Mini Booster";
    const duration = 2 * 60 * 60 * 1000;
    const now = Date.now();
    state.boosterExpiresAt = (state.boosterExpiresAt && state.boosterExpiresAt > now)
      ? state.boosterExpiresAt + duration
      : now + duration;
  }

  state.lastDailyRewardDate = todayStr;
  saveShopState(state);
  playShopSound("chest");

  return {
    success: true,
    rewardType,
    amount,
    message: `🎁 You opened the Mystery Chest and received ${rewardLabel}!`,
  };
}

/**
 * Web Audio API synthesizer for zero-dependency sound effects
 */
export function playShopSound(type: "buy" | "equip" | "error" | "chest"): void {
  if (typeof window === "undefined") return;

  const isMuted = localStorage.getItem("edutrack_shop_mute") === "true";
  if (isMuted) return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "buy") {
      // Fanfare arpeggio: C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.24);
      });
    } else if (type === "equip") {
      // Crisp click / snap chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.14);
    } else if (type === "error") {
      // Low buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.setValueAtTime(130, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "chest") {
      // Shimmering mystery opening
      const baseFreqs = [440, 554.37, 659.25, 880, 1108.73];
      baseFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.36);
      });
    }
  } catch (_) {
    // AudioContext blocked or unsupported, silently skip
  }
}
