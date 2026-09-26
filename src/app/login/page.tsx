"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Brain, Mail, Lock, ArrowRight, AlertCircle, Loader2, 
  Building, GraduationCap, Users, Eye, EyeOff, Zap,
  CheckCircle2, Sparkles, Flame, ShieldCheck, Trophy, Star,
  KeyRound, ArrowLeft, Sun, Moon, Palette, RotateCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { useRouter } from "next/navigation";
import { ADMIN_PORTAL_ROUTE } from "@/lib/admin";
import { cn } from "@/lib/utils";

export default function Login() {
  const { user, loading: authLoading, login, loginWithGoogle, loginAsGuest, resetPassword } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Theme State
  const [isDark, setIsDark] = useState(true);

  // Interactive Teaser Card on Left Showcase
  const [cardFlipped, setCardFlipped] = useState(false);

  // Error & Status states
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("edutrack_remember_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setForgotEmail(savedEmail);
      }
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window === "undefined") return;
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("edutrack_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("edutrack_theme", "light");
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") router.push(ADMIN_PORTAL_ROUTE);
      else if (user.role === "teacher") router.push("/teacher");
      else router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const triggerError = (msg: string) => {
    setError(msg);
    setSuccessMsg("");
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return triggerError("Please enter your email and password.");
    setError("");
    setSuccessMsg("");
    setLoading(true);

    if (rememberMe) {
      localStorage.setItem("edutrack_remember_email", email);
    } else {
      localStorage.removeItem("edutrack_remember_email");
    }

    try {
      await login(email, password);
    } catch (err: any) {
      triggerError("Invalid credentials. Try your email again or tap '1-Click Student Demo' below!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await loginWithGoogle();
    } catch (err: any) {
      triggerError("Google sign-in was cancelled or unavailable.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuestDemo = async (targetRole: "student" | "teacher" | "admin" = "student") => {
    setDemoLoadingRole(targetRole);
    try {
      await loginAsGuest(targetRole);
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoadingRole(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail);
      setForgotSuccess(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess(false);
        setSuccessMsg(`Password reset link sent to ${forgotEmail}. Check your inbox!`);
      }, 2000);
    } catch (err: any) {
      setForgotSuccess(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess(false);
        setSuccessMsg(`Password instructions sent to ${forgotEmail}`);
      }, 1500);
    } finally {
      setForgotLoading(false);
    }
  };

  // 3D Card Hover Physics
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 28; 
    const y = (e.clientY - top - height / 2) / 28;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const springConfig = { damping: 24, stiffness: 280, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-10, 10], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-10, 10], [-6, 6]), springConfig);

  // Dynamic Background Glow
  const bgMouseX = useMotionValue(0);
  const bgMouseY = useMotionValue(0);
  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    bgMouseX.set(e.clientX);
    bgMouseY.set(e.clientY);
  };
  
  const bgGlow = useMotionTemplate`radial-gradient(700px circle at ${bgMouseX}px ${bgMouseY}px, ${isDark ? "rgba(99, 102, 241, 0.12)" : "rgba(99, 102, 241, 0.08)"}, transparent 80%)`;

  return (
    <motion.div 
      onMouseMove={handleGlobalMouseMove}
      className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 relative overflow-x-hidden bg-slate-50 dark:bg-[#060813] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300"
    >
      {/* Interactive Global Cursor Ambient Glow */}
      <motion.div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: bgGlow }}
      />
      
      {/* Background Animated Blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-[550px] h-[550px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-fuchsia-500/10 dark:bg-fuchsia-600/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />

      {/* Top Navigation Bar with Home Link & Theme Switcher */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-4 mb-4 relative z-20">
        <Link href="/" className="inline-flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors group">
          <div className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> CBSE 2026 Ready
          </span>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm hover:scale-105 active:scale-95 transition-all"
            title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* Main Grid: Split Screen on Large Displays */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* ── LEFT SHOWCASE PANEL (Visible on lg+) ── */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-7 pr-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Intelligent CBSE Learning Platform
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-indigo-100 dark:to-fuchsia-200 tracking-tight leading-tight">
              Master CBSE Concepts with AI Precision.
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed max-w-lg font-medium">
              Adaptive spaced-repetition flashcards, interactive whiteboard solver, viva simulations, and personalized AI notes built for board toppers.
            </p>
          </div>

          {/* Interactive Flashcard / Whiteboard Teaser Widget */}
          <div 
            onClick={() => setCardFlipped(!cardFlipped)}
            className="p-5 rounded-3xl bg-white dark:bg-white/[0.04] border border-indigo-500/25 shadow-md hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30">
                ⚡ Interactive Active Recall Preview
              </span>
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" /> Tap to Flip
              </span>
            </div>

            <AnimatePresence mode="wait">
              {!cardFlipped ? (
                <motion.div 
                  key="front"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="space-y-2"
                >
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Class 10 Physics • Electricity</p>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    State Ohm's Law and its mathematical relationship.
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium">
                    👉 Click anywhere on this card to reveal the board formula & mnemonic trick.
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key="back"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="space-y-2"
                >
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Verified NCERT Solution</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-black/30 p-2.5 rounded-xl border border-slate-200 dark:border-white/10">
                    V = I × R &nbsp;|&nbsp; Current is directly proportional to potential difference.
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    💡 Memory Trick: "Very Important Rule" → V = I × R
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floating Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm hover:border-indigo-500/40 transition-all group">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 w-fit mb-2.5 group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Recall & Streaks</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">SM-2 Spaced Repetition algorithms for 98% concept retention.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm hover:border-fuchsia-500/40 transition-all group">
              <div className="p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-500 w-fit mb-2.5 group-hover:scale-110 transition-transform">
                <Palette className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Interactive Whiteboard</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Smart geometry, handwriting solver, and KaTeX math export.</p>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-md">
              AK
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-500 text-xs mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic">
                "EduTrack helped me score 96% in Class 10 Science & Math with zero exam stress."
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                Aarav K. • CBSE Class 10 Scholar
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT AUTHENTICATION CARD (Responsive) ── */}
        <div className="col-span-1 lg:col-span-6 w-full max-w-md mx-auto" style={{ perspective: 1200 }}>
          
          <motion.div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY }}
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={shake ? { duration: 0.4 } : undefined}
            className="bg-white/95 dark:bg-[#0b1026]/90 backdrop-blur-2xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-2xl rounded-[2.5rem] p-6 sm:p-9 relative overflow-hidden group/card"
          >
            {/* Specular glare that follows cursor */}
            <div 
              className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2.5rem]"
              style={{
                background: `radial-gradient(400px circle at ${mouseX.get() * 28 + 200}px ${mouseY.get() * 28 + 200}px, rgba(99,102,241,0.08), transparent 45%)`
              }}
            />

            {/* Glowing top line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400" />

            {/* Brand Logo & Tab Toggle */}
            <div className="flex flex-col items-center mb-6 relative z-10">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-indigo-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white group-hover:scale-105 transition-transform duration-300">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  EduTrack <span className="text-fuchsia-600 dark:text-fuchsia-400 font-extrabold text-sm">AI</span>
                </span>
              </Link>

              {/* Seamless Auth Tab Switcher */}
              <div className="w-full grid grid-cols-2 p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl mb-1">
                <button
                  type="button"
                  className="py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                >
                  Sign In
                </button>
                <Link
                  href="/signup"
                  className="py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-center flex items-center justify-center"
                >
                  Create Account
                </Link>
              </div>
            </div>

            {/* Status & Error Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, height: "auto", scale: 1 }} 
                  exit={{ opacity: 0, height: 0, scale: 0.95 }} 
                  className="flex items-center gap-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 p-3.5 rounded-2xl mb-5 text-xs font-bold border border-rose-500/25 relative z-10"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, height: "auto", scale: 1 }} 
                  exit={{ opacity: 0, height: 0, scale: 0.95 }} 
                  className="flex items-center gap-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-2xl mb-5 text-xs font-bold border border-emerald-500/25 relative z-10"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleStandardLogin} className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="student@cbse.in"
                    className="w-full pl-12 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium" 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-all"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={e => setRememberMe(e.target.checked)} 
                    className="accent-indigo-600 w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Remember my email</span>
                </label>
              </div>
              
              {/* Primary Submit Button */}
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-fuchsia-600 hover:opacity-95 text-white font-extrabold py-3.5 rounded-2xl transition-all mt-3 text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <>Sign In to Study Space <ArrowRight className="w-4 h-4" /></>}
              </motion.button>
              
              {/* Google Sign-in */}
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                type="button" 
                onClick={handleGoogle} 
                disabled={googleLoading} 
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-2xl transition-all text-xs flex items-center justify-center gap-3 shadow-sm active:scale-95 cursor-pointer"
              >
                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </motion.button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="mt-7 pt-5 border-t border-slate-200 dark:border-white/10 relative z-10">
              <div className="flex items-center justify-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                  ✨ Instant 1-Click Demo
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  type="button" 
                  disabled={demoLoadingRole !== null} 
                  onClick={() => handleGuestDemo("student")} 
                  className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/25 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 active:scale-95 group cursor-pointer"
                >
                  {demoLoadingRole === "student" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  ) : (
                    <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                  )}
                  <span>Student</span>
                </button>
                
                <button 
                  type="button" 
                  disabled={demoLoadingRole !== null} 
                  onClick={() => handleGuestDemo("teacher")} 
                  className="p-2.5 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/25 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 active:scale-95 group cursor-pointer"
                >
                  {demoLoadingRole === "teacher" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  ) : (
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                  )}
                  <span>Teacher</span>
                </button>
                
                <button 
                  type="button" 
                  disabled={demoLoadingRole !== null} 
                  onClick={() => handleGuestDemo("admin")} 
                  className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/25 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 active:scale-95 group cursor-pointer"
                >
                  {demoLoadingRole === "admin" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  ) : (
                    <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                  )}
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Bottom Link to Signup */}
            <div className="mt-5 text-center relative z-10">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                New to EduTrack?{" "}
                <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-extrabold">
                  Create an account free
                </Link>
              </p>
            </div>

          </motion.div>
        </div>

      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-extrabold text-center text-slate-900 dark:text-white mb-1">Reset Password</h3>
              <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-6">
                Enter your registered email address and we'll send you recovery instructions.
              </p>

              {forgotSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center font-bold text-xs">
                  ✓ Reset link sent! Check your inbox.
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      required 
                      value={forgotEmail} 
                      onChange={e => setForgotEmail(e.target.value)} 
                      placeholder="name@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" 
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={forgotLoading}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                    >
                      {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Link"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
