"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Menu, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Tools", href: "#tools" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-4 left-4 right-4 z-50 backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-5 py-3 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white leading-none">
                EduTrack
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-indigo-400/70 leading-none mt-0.5 hidden sm:block">
                AI Learning OS
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              {loading ? (
                <div className="w-20 h-8 animate-pulse bg-white/10 rounded-full" />
              ) : user ? (
                <>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2"
                  >
                    Log Out
                  </button>
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 px-5 py-2 bg-white text-zinc-950 font-bold text-sm rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-shadow"
                  >
                    Dashboard
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="group inline-flex items-center gap-2 px-5 py-2 bg-white text-zinc-950 font-bold text-sm rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-shadow"
                  >
                    Get Started
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
              className="fixed top-20 left-4 right-4 z-50 md:hidden bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
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
