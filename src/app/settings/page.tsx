"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, User, Mail, GraduationCap, Globe, Monitor, 
  Lock, Save, Edit3, Shield, Award, Sparkles, Moon, Clock
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useProfileStore } from "@/store/useProfileStore";
import { useGamificationStore } from "@/store/useGamificationStore";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import { getNightModeConfig, saveNightModeConfig } from "@/lib/night-mode";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    nickname, userClass, userLanguage, 
    setNickname, setUserClass, setUserLanguage 
  } = useProfileStore();
  const { xp, level } = useGamificationStore();
  
  const [localNickname, setLocalNickname] = useState("");
  const [localClass, setLocalClass] = useState<number>(10);
  const [localLanguage, setLocalLanguage] = useState("English");
  const [localTheme, setLocalTheme] = useState("system");
  const [nightModeEnabled, setNightModeEnabled] = useState(true);
  const [dailyScreenLimit, setDailyScreenLimit] = useState(180);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalNickname(nickname || user?.displayName?.split(" ")[0] || "");
    setLocalClass(userClass || 10);
    setLocalLanguage(userLanguage || "English");
    const storedTheme = localStorage.getItem("edutrack_theme");
    if (storedTheme) setLocalTheme(storedTheme);
    const nightCfg = getNightModeConfig();
    setNightModeEnabled(nightCfg.enabled);
    const storedLimit = localStorage.getItem("edutrack_parent_limit_minutes");
    if (storedLimit) setDailyScreenLimit(parseInt(storedLimit, 10));
  }, [nickname, userClass, userLanguage, user]);

  const initials = (localNickname || user?.displayName || user?.email || "S").charAt(0).toUpperCase();

  const handleSave = () => {
    setIsSaving(true);
    // Simulate DB save delay
    setTimeout(() => {
      setNickname(localNickname);
      setUserClass(localClass);
      setUserLanguage(localLanguage);
      
      localStorage.setItem("edutrack_nickname", localNickname);
      localStorage.setItem("edutrack_class", localClass.toString());
      localStorage.setItem("edutrack_language", localLanguage);
      localStorage.setItem("edutrack_theme", localTheme);
      saveNightModeConfig({
        enabled: nightModeEnabled,
        startHour: 21,
        endHour: 6,
        temperature: "warm",
        bedtimeReminder: true
      });
      localStorage.setItem("edutrack_parent_limit_minutes", String(dailyScreenLimit));
      
      if (localTheme === 'dark' || (localTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("edutrack_profile_updated", {
          detail: { nickname: localNickname, className: localClass, language: localLanguage }
        }));
      }
      
      setIsSaving(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080f] pb-12 transition-colors duration-300 overflow-y-auto">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-8 px-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 font-bold transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </Link>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-70"
          >
            {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Profile Card */}
          <div className="md:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl text-center"
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-lg mb-4 relative group">
                {initials}
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">{localNickname || "Scholar"}</h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" /> {user?.email || "guest@edutrack.app"}
              </p>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 flex justify-around">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1 justify-center">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Level
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">{level}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Total XP</div>
                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{xp}</div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats / Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-100"
            >
              <h4 className="font-black text-sm flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-500" /> Account Status
              </h4>
              <p className="text-xs font-medium opacity-80">
                Your account is fully active and secured. Progress is syncing to the cloud automatically.
              </p>
            </motion.div>

            {/* Interactive Tours Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-950 dark:text-indigo-100 space-y-3"
            >
              <h4 className="font-black text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Guided Tours
              </h4>
              <p className="text-xs font-medium opacity-80">
                Want to refresh your knowledge of EduTrack tools and navigation?
              </p>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("edutrack_feature_spotlight_completed");
                    router.push("/dashboard");
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent("edutrack_open_feature_tour", { detail: { stepIndex: 0 } }));
                    }, 400);
                  }
                }}
                className="w-full text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Replay Spotlight Tour</span>
              </button>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Settings Form */}
          <div className="md:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl space-y-8"
            >
              
              {/* Nickname */}
              <div>
                <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-indigo-500" /> Display Nickname
                </label>
                <input 
                  type="text" 
                  value={localNickname}
                  onChange={(e) => setLocalNickname(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="What should we call you?"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Class Selection */}
                <div>
                  <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                    <GraduationCap className="w-4 h-4 text-purple-500" /> Academic Class
                  </label>
                  <select 
                    value={localClass}
                    onChange={(e) => setLocalClass(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  >
                    {[6, 7, 8, 9, 10].map(cls => (
                      <option key={cls} value={cls} className="bg-slate-900 text-white">Class {cls}</option>
                    ))}
                  </select>
                </div>

                {/* Theme Selection */}
                <div>
                  <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                    <Monitor className="w-4 h-4 text-amber-500" /> Interface Theme
                  </label>
                  <select 
                    value={localTheme}
                    onChange={(e) => setLocalTheme(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  >
                    <option value="system" className="bg-slate-900 text-white">System Default</option>
                    <option value="dark" className="bg-slate-900 text-white">Dark Mode</option>
                    <option value="light" className="bg-slate-900 text-white">Light Mode</option>
                  </select>
                </div>
              </div>

              {/* 🌙 Night Study Mode & Circadian Comfort */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Circadian Night Study Mode</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Auto-enables warm blue-light filter between 21:00 and 06:00 with gentle bedtime alerts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNightModeEnabled(!nightModeEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative p-1 shrink-0",
                    nightModeEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  )}
                >
                  <motion.div
                    animate={{ x: nightModeEnabled ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-4 h-4 rounded-full bg-white shadow-md"
                  />
                </button>
              </div>

              {/* 🔒 Screen Time Parental Limit Slider */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Daily Screen Time Limit</span>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-500">
                    {Math.floor(dailyScreenLimit / 60)}h {dailyScreenLimit % 60}m
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="480"
                  step="30"
                  value={dailyScreenLimit}
                  onChange={(e) => setDailyScreenLimit(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 Hour</span>
                  <span>4 Hours</span>
                  <span>8 Hours</span>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-emerald-500" /> Default Study Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1 pb-1">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setLocalLanguage(lang.code)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all",
                        localLanguage === lang.code 
                          ? "bg-emerald-500/10 border-emerald-500/50 shadow-inner scale-[1.02]" 
                          : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 hover:border-emerald-500/30"
                      )}
                    >
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{lang.code}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">{lang.nativeName}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Security */}
              <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-rose-500" /> Parent Portal PIN
                </label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="password" 
                    placeholder="****"
                    maxLength={4}
                    className="w-24 text-center bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-black tracking-[0.5em] text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition-all"
                  />
                  <span className="text-xs text-slate-500 font-semibold">Change your 4-digit security PIN for parent mode.</span>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
