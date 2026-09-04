"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Accessibility, X, Eye, Type, MessageSquare, Check, ShieldCheck, 
  HelpCircle, CreditCard, Sparkles, Volume2, Award, Info, Loader2
} from "lucide-react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

export default function DivyangjanAccessibilitySuite() {
  const {
    bionicMode,
    highContrast,
    dyslexicFont,
    islSubtitles,
    udidVerified,
    udidDetails,
    toggleBionicMode,
    toggleHighContrast,
    toggleDyslexicFont,
    toggleIslSubtitles,
    verifyUdid,
    clearUdid,
    initialize
  } = useAccessibilityStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showUdidModal, setShowUdidModal] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [udidNumber, setUdidNumber] = useState("");
  const [disabilityCategory, setDisabilityCategory] = useState("Visual Impairment");
  const [stateName, setStateName] = useState("Delhi");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !udidNumber.trim()) return;

    setIsVerifying(true);

    // Play verification sound chime
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.35); // C6
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (_) {}

    setTimeout(() => {
      verifyUdid(name, udidNumber, disabilityCategory);
      setIsVerifying(false);
      setShowUdidModal(false);
    }, 1200);
  };

  return (
    <>
      {/* ── FLOATING ACCESSIBILITY WIDGET ICON ── */}
      <div className="fixed bottom-40 right-4 md:bottom-24 md:right-8 z-[130]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          title="Open Divyangjan Accessibility Menu"
          className="w-13 h-13 rounded-full bg-indigo-600 dark:bg-indigo-600 text-white flex items-center justify-center shadow-[0_8px_24px_rgba(99,102,241,0.4)] border border-indigo-400/40 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
          <Accessibility className="w-6 h-6 relative z-10" />
          {udidVerified && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border border-white dark:border-[#090d1f] flex items-center justify-center">
              <Check className="w-2 h-2 text-white" />
            </span>
          )}
        </motion.button>
      </div>

      {/* ── ACCESSIBILITY DRAWER PANEL ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click closer */}
            <div 
              onClick={() => setIsOpen(false)} 
              className="fixed inset-0 z-[140] bg-black/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="fixed top-0 bottom-0 right-0 z-[150] w-[320px] sm:w-[360px] bg-white dark:bg-[#070a1e] border-l border-indigo-500/20 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Accessibility className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-black text-sm tracking-wide text-slate-800 dark:text-white uppercase">
                      Divyangjan Settings
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* UDID Verification Status Box */}
                <div className="mb-6">
                  {udidVerified && udidDetails ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-2 right-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 fill-emerald-500/20" /> UDID Verified
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-xs">
                        {udidDetails.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        UDID: {udidDetails.id}
                      </p>
                      <p className="text-[10px] text-emerald-500 font-bold mt-1">
                        100% Free Scholar Access Granted 🔓
                      </p>
                      <button 
                        onClick={clearUdid}
                        className="mt-3 text-[10px] font-bold text-rose-500 hover:underline"
                      >
                        Disconnect Card
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center">
                      <CreditCard className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                      <h4 className="font-bold text-slate-800 dark:text-white text-xs">
                        Swavlamban UDID Verification
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                        Verify your Government UDID card to unlock 100% free premium Scholar access.
                      </p>
                      <button
                        onClick={() => setShowUdidModal(true)}
                        className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 hover:bg-indigo-750"
                      >
                        <Sparkles className="w-3 h-3 text-white" />
                        Verify UDID Card
                      </button>
                    </div>
                  )}
                </div>

                {/* Accessibility Options */}
                <div className="space-y-4">
                  {/* Bionic Reading */}
                  <div className="flex items-start justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Type className="w-4 h-4 text-indigo-500" /> Bionic Reading Mode
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-[220px]">
                        Bolds the first few letters of each word to assist Dyslexia and ADHD focus.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                      <input type="checkbox" checked={bionicMode} onChange={toggleBionicMode} className="sr-only peer" />
                      <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 relative" />
                    </label>
                  </div>

                  {/* High Contrast */}
                  <div className="flex items-start justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-indigo-500" /> High Contrast
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-[220px]">
                        Switches layout to high-visibility Stark White-on-Black style.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                      <input type="checkbox" checked={highContrast} onChange={toggleHighContrast} className="sr-only peer" />
                      <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 relative" />
                    </label>
                  </div>

                  {/* Dyslexic Font */}
                  <div className="flex items-start justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Type className="w-4 h-4 text-indigo-500" /> Readability Typography
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-[220px]">
                        Increases letter and word spacing with dyslexic-friendly alignment.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                      <input type="checkbox" checked={dyslexicFont} onChange={toggleDyslexicFont} className="sr-only peer" />
                      <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 relative" />
                    </label>
                  </div>

                  {/* ISL & Hearing Impaired Subtitles */}
                  <div className="flex items-start justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-indigo-500" /> Live Captions / ISL Helper
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-[220px]">
                        Forces visual subtitle boxes and glowing haptic indicators for audio events.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                      <input type="checkbox" checked={islSubtitles} onChange={toggleIslSubtitles} className="sr-only peer" />
                      <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 relative" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Footnote information */}
              <div className="text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-white/10 pt-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>EduTrack accessibility implements W3C WCAG 2.1 standards.</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── UDID VERIFICATION MODAL ── */}
      <AnimatePresence>
        {showUdidModal && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            {/* Modal backdrop */}
            <div 
              onClick={() => setShowUdidModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-[#080c21] border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10"
            >
              <button 
                onClick={() => setShowUdidModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                  Swavlamban UDID Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter credentials exactly as shown on Swavlamban PwD Card
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    UDID Card Number (18 Digits)
                  </label>
                  <input
                    type="text"
                    value={udidNumber}
                    onChange={(e) => setUdidNumber(e.target.value)}
                    placeholder="e.g. DL0110199800123456"
                    maxLength={18}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-bold tracking-wider"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      State / UT
                    </label>
                    <select
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {["Delhi", "Maharashtra", "Tamil Nadu", "Karnataka", "Uttar Pradesh", "Telangana", "West Bengal"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Disability Category
                    </label>
                    <select
                      value={disabilityCategory}
                      onChange={(e) => setDisabilityCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {["Visual Impairment", "Hearing Impairment", "Locomotor Disability", "Intellectual Disability", "Multiple Disabilities"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {isVerifying ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-white" />
                      Verify swavlamban.gov.in
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
