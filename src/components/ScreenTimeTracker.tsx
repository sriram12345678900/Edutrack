"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Clock, Lock, Key, AlertTriangle, CheckCircle } from "lucide-react";

export default function ScreenTimeTracker() {
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [limitMinutes, setLimitMinutes] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [overridePasscode, setOverridePasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [extensionGranted, setExtensionGranted] = useState(false);

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const storedDate = localStorage.getItem("edutrack_screen_date");
    let currentMins = 0;

    if (storedDate === todayStr) {
      currentMins = parseInt(localStorage.getItem("edutrack_screen_minutes") || "0", 10);
    } else {
      localStorage.setItem("edutrack_screen_date", todayStr);
      localStorage.setItem("edutrack_screen_minutes", "0");
    }

    setMinutesUsed(currentMins);

    // Check parent configured limit (e.g. 180 mins / 3 hours default if active)
    const storedLimit = localStorage.getItem("edutrack_parent_limit_minutes");
    if (storedLimit) {
      const parsedLimit = parseInt(storedLimit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        setLimitMinutes(parsedLimit);
        if (currentMins >= parsedLimit) {
          setIsLocked(true);
        }
      }
    }

    // Active usage ticker (every 60 seconds if tab visible)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        setMinutesUsed((prev) => {
          const next = prev + 1;
          localStorage.setItem("edutrack_screen_minutes", String(next));
          const lim = localStorage.getItem("edutrack_parent_limit_minutes");
          if (lim) {
            const limVal = parseInt(lim, 10);
            if (limVal > 0 && next >= limVal) {
              setIsLocked(true);
            }
          }
          return next;
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleUnlockWithParentPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPasscode = localStorage.getItem("edutrack_parent_passcode") || "1234";
    if (overridePasscode.trim() === storedPasscode) {
      setIsLocked(false);
      setExtensionGranted(true);
      // Grant +30 minutes
      const newLimit = (limitMinutes || 180) + 30;
      setLimitMinutes(newLimit);
      localStorage.setItem("edutrack_parent_limit_minutes", String(newLimit));
      setPasscodeError("");
      setOverridePasscode("");
      setTimeout(() => setExtensionGranted(false), 3000);
    } else {
      setPasscodeError("Invalid Parent Passcode. Please check with your guardian.");
    }
  };

  return (
    <>
      {/* Soft lock modal overlay when limit exceeded */}
      <AnimatePresence>
        {isLocked && (
          <div className="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-amber-500/30 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
                <Lock className="w-8 h-8" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Parental Daily Study Limit Reached
              </span>

              <h2 className="text-xl font-black mt-3 text-slate-100">
                Daily Study Screen Time Completed
              </h2>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                You have reached your scheduled daily study limit ({limitMinutes} minutes). 
                Rest your eyes and review offline notes, or enter your parent passcode to request an extension.
              </p>

              <form onSubmit={handleUnlockWithParentPasscode} className="mt-6 space-y-3">
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter 4-digit Parent PIN"
                    value={overridePasscode}
                    onChange={(e) => setOverridePasscode(e.target.value)}
                    maxLength={8}
                    className="w-full bg-black/40 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {passcodeError && (
                  <p className="text-xs text-rose-400 font-bold">{passcodeError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-black text-sm text-white transition-all shadow-lg shadow-amber-600/20 active:scale-95"
                >
                  Authorize +30 Min Extension
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating HUD status indicator if limit is active */}
      {limitMinutes && !isLocked && (
        <div className="fixed bottom-4 left-4 z-40 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 text-[10px] font-bold backdrop-blur-md shadow-lg pointer-events-none">
          <Clock className="w-3 h-3 text-indigo-400" />
          <span>Screen Time: {minutesUsed}m / {limitMinutes}m</span>
        </div>
      )}
    </>
  );
}
