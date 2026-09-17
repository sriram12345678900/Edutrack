"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Sparkles, Share, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already running in standalone PWA / installed mode
    const isStandaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Check dismissal timeout (don't show banner for 3 days after user dismisses)
    const dismissedTimestamp = localStorage.getItem("edutrack_pwa_dismissed");
    if (dismissedTimestamp) {
      const timeSinceDismiss = Date.now() - parseInt(dismissedTimestamp, 10);
      if (timeSinceDismiss < 3 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
      localStorage.setItem("edutrack_pwa_installed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Custom event to trigger install from any button in the app
    const handleTriggerInstall = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            setIsInstallable(false);
            setDeferredPrompt(null);
          }
        });
      } else if (isIosDevice) {
        setShowIosGuide(true);
      } else {
        // Fallback for browsers that don't support beforeinstallprompt
        alert("To install EduTrack: Tap your browser's menu (⋮ or Share) and select 'Install App' or 'Add to Home Screen'.");
      }
    };

    window.addEventListener("edutrack_trigger_install", handleTriggerInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("edutrack_trigger_install", handleTriggerInstall);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("edutrack_pwa_dismissed", Date.now().toString());
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom Banner for mobile/tablet browsers */}
      <AnimatePresence>
        {(isInstallable || (isIos && !isDismissed)) && !isDismissed && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-md mx-auto z-50 p-3.5 bg-slate-900/95 dark:bg-[#080d24]/95 text-white backdrop-blur-2xl border border-indigo-500/30 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shrink-0 shadow-md">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black tracking-tight text-white leading-tight">Install EduTrack AI</h4>
                  <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-indigo-500/30 text-indigo-300 rounded border border-indigo-500/40">App</span>
                </div>
                <p className="text-[10px] text-slate-300 truncate mt-0.5">Offline mode & fast 1-tap launch</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg active:scale-90 transition-all"
                aria-label="Dismiss install banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Safari Step-by-Step Installation Modal */}
      <AnimatePresence>
        {showIosGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowIosGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black">Install on iPhone / iPad</h3>
                  <p className="text-xs text-slate-400">Add to Home Screen in 2 taps</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">1</div>
                  <div className="flex-1">
                    Tap the <strong className="text-white">Share button</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> in Safari&apos;s bottom bar.
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">2</div>
                  <div className="flex-1">
                    Scroll down and tap <strong className="text-white">&quot;Add to Home Screen&quot;</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-purple-400" />.
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">3</div>
                  <div className="flex-1">
                    Tap <strong className="text-white">&quot;Add&quot;</strong> in the top-right corner. Enjoy EduTrack as a native app!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIosGuide(false)}
                className="w-full mt-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-extrabold text-xs text-white transition-colors shadow-lg"
              >
                Got It!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default PwaInstallPrompt;
