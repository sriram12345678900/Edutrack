"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Menu, X, ArrowRight, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Fallback for sections on page
      const feat = document.querySelector("#features");
      if (feat) feat.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed top-5 left-1/2 -translate-x-1/2 w-[94%] max-w-5xl z-50 backdrop-blur-3xl bg-[#0a0d20]/90 border border-white/15 rounded-full shadow-[0_15px_45px_rgba(0,0,0,0.7)] px-4 py-2.5 sm:px-6 sm:py-3 ring-1 ring-white/10"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between">
          {/* Logo matching mockup */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <div className="w-full h-full bg-[#0a0d20] rounded-[7px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-base">E</span>
              </div>
            </div>
            <span className="text-lg font-black tracking-tight text-white leading-none">
              EduTrack
            </span>
          </Link>

          {/* Desktop Centered Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.06]"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("edutrack_trigger_install"));
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 font-bold text-xs rounded-full transition-all active:scale-95"
              title="Install EduTrack App"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Install App</span>
            </button>

            <div className="hidden md:flex items-center gap-2">
              {loading ? (
                <div className="w-24 h-9 animate-pulse bg-white/10 rounded-full" />
              ) : user ? (
                <>
                  <button
                    onClick={logout}
                    className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5"
                  >
                    Log Out
                  </button>
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-xs rounded-full shadow-[0_0_25px_rgba(217,70,239,0.35)] hover:shadow-[0_0_35px_rgba(217,70,239,0.5)] transition-all hover:scale-105"
                  >
                    Dashboard
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-xs rounded-full shadow-[0_0_25px_rgba(217,70,239,0.35)] hover:shadow-[0_0_35px_rgba(217,70,239,0.5)] transition-all hover:scale-105"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-20 left-4 right-4 z-50 md:hidden bg-[#0a0d24]/98 backdrop-blur-3xl border border-white/15 rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
              role="dialog"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollTo(link.href)}
                    className="text-left px-4 py-3 text-base font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="h-px bg-white/10 my-2" />
                {loading ? null : user ? (
                  <>
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="text-left px-4 py-3 text-base font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
                    >
                      Log Out
                    </button>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-zinc-950 font-bold text-sm rounded-xl"
                    >
                      Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-left px-4 py-3 text-base font-semibold text-slate-300 hover:text-white rounded-xl transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-zinc-950 font-bold text-sm rounded-xl"
                    >
                      Get Started <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
