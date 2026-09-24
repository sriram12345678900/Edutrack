"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Brain, User as UserIcon, Mail, Lock, ArrowRight, AlertCircle, 
  Loader2, Eye, EyeOff, Sparkles, CheckCircle2, ShieldCheck, 
  GraduationCap, BookOpen, Trophy, ArrowLeft, Building, Users
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Signup() {
  const { user, loading: authLoading, signup, loginWithGoogle, loginAsGuest } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedClass, setSelectedClass] = useState("10");
  const [agreedTerms, setAgreedTerms] = useState(true);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Compute Password Strength
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "bg-slate-700" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 9) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password) || /[A-Z]/.test(password)) score += 1;

    switch(score) {
      case 1: return { score: 1, label: "Weak", color: "bg-rose-500" };
      case 2: return { score: 2, label: "Fair", color: "bg-amber-500" };
      case 3: return { score: 3, label: "Good", color: "bg-indigo-500" };
      case 4: return { score: 4, label: "Strong & Secure", color: "bg-emerald-500" };
      default: return { score: 0, label: "", color: "bg-slate-700" };
    }
  }, [password]);

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) return triggerError("Please complete all required fields.");
    if (password.length < 6) return triggerError("Password must be at least 6 characters.");
    if (!agreedTerms) return triggerError("Please accept the Terms of Service to continue.");

    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("edutrack_class", selectedClass);
      }
      await signup(email, password, name);
    } catch (err: any) {
      const msg = err.code === "auth/email-already-in-use"
        ? "This email is already registered. Please sign in instead."
        : err.code === "auth/weak-password"
        ? "Password must be at least 6 characters long."
        : "Failed to create account. Try signing in with Google or 1-Click Demo!";
      triggerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("edutrack_class", selectedClass);
      }
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
      if (typeof window !== "undefined") {
        localStorage.setItem("edutrack_class", selectedClass);
      }
      await loginAsGuest(targetRole);
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoadingRole(null);
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
  const rotateX = useSpring(useTransform(mouseY, [-10, 10], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-10, 10], [-8, 8]), springConfig);

  // Dynamic Background Glow
  const bgMouseX = useMotionValue(0);
  const bgMouseY = useMotionValue(0);
  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    bgMouseX.set(e.clientX);
    bgMouseY.set(e.clientY);
  };
  const bgGlow = useMotionTemplate`radial-gradient(700px circle at ${bgMouseX}px ${bgMouseY}px, rgba(168, 85, 247, 0.09), transparent 80%)`;

  return (
    <motion.div 
      onMouseMove={handleGlobalMouseMove}
      className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 relative overflow-x-hidden bg-[#060813] text-slate-100 font-sans"
    >
      {/* Interactive Global Background Glow */}
      <motion.div className="fixed inset-0 z-0 pointer-events-none" style={{ background: bgGlow }} />

      {/* Static mesh background blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />

      {/* Top Navigation Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between py-4 mb-4 relative z-20">
        <Link href="/" className="inline-flex items-center gap-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors group">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" /> Free Student Account
          </span>
        </div>
      </div>

      {/* Split-Screen Grid on Desktop */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* ── LEFT SHOWCASE PANEL (Desktop) ── */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500/15 to-indigo-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" /> Start Your CBSE Board Journey
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-100 to-indigo-200 tracking-tight leading-tight">
              Create Your Free Scholar Workspace.
            </h1>
            
            <p className="text-slate-400 text-base leading-relaxed max-w-lg">
              Unlock AI chapter roadmaps, 3D science simulations, daily recall streaks, and multiplayer study rooms tailored to your syllabus.
            </p>
          </div>

          {/* Interactive Curriculum Feature Grid */}
          <div className="space-y-3 pt-2">
            {[
              { icon: <GraduationCap className="w-4.5 h-4.5 text-indigo-400" />, title: "Full NCERT Syllabus Coverage", desc: "Line-by-line textbook guides, formulas, and NCERT exemplars." },
              { icon: <Trophy className="w-4.5 h-4.5 text-amber-400" />, title: "Gamified XP & Leaderboards", desc: "Level up from Novice to Grandmaster CBSE Scholar with every quiz." },
              { icon: <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />, title: "100% Free for Students", desc: "Zero subscriptions or paywalls for core learning modules." }
            ].map((feature, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4 hover:border-indigo-500/30 transition-all">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">{feature.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT SIGNUP CARD (Responsive) ── */}
        <div className="col-span-1 lg:col-span-6 w-full max-w-md mx-auto" style={{ perspective: 1200 }}>
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY }}
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={shake ? { duration: 0.4 } : undefined}
            className="bg-[#0b1026]/90 backdrop-blur-2xl border border-indigo-500/25 shadow-2xl rounded-[2.5rem] p-6 sm:p-9 relative overflow-hidden group/card"
          >
            {/* Hover Specular Glare */}
            <div 
              className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2.5rem]"
              style={{
                background: `radial-gradient(400px circle at ${mouseX.get() * 28 + 200}px ${mouseY.get() * 28 + 200}px, rgba(255,255,255,0.06), transparent 45%)`
              }}
            />

            {/* Top radiant border accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-400" />

            {/* Header & Auth Tab Switcher */}
            <div className="flex flex-col items-center mb-6 relative z-10">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 text-white group-hover:scale-105 transition-transform duration-300">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  EduTrack <span className="text-fuchsia-400 font-extrabold text-sm">AI</span>
                </span>
              </Link>

              {/* Seamless Tab Switcher */}
              <div className="w-full grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-2xl mb-1">
                <Link
                  href="/login"
                  className="py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all text-slate-400 hover:text-white text-center flex items-center justify-center"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  className="py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-md shadow-fuchsia-500/20"
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-2xl p-3.5 mb-5 text-xs font-bold leading-normal relative z-10"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Signup Button */}
            <div className="space-y-4 relative z-10 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl py-3.5 px-4 text-xs font-bold text-slate-200 transition-all shadow-sm active:scale-95"
              >
                {googleLoading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-fuchsia-400" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Sign Up with Google
              </motion.button>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">Or email registration</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              
              {/* Class Selector Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                  Select Your CBSE Grade
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["9", "10", "11", "12"].map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`py-2 rounded-xl text-xs font-black transition-all border ${
                        selectedClass === cls
                          ? "bg-fuchsia-600 text-white border-fuchsia-500 shadow-md shadow-fuchsia-500/25"
                          : "bg-white/5 text-slate-400 border-white/10 hover:border-slate-600"
                      }`}
                    >
                      Class {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav Sharma"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 font-medium"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@cbse.in"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 font-medium"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="pt-1 space-y-1">
                    <div className="flex gap-1.5 h-1.5 w-full">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            step <= passwordStrength.score ? passwordStrength.color : "bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                      <span>Strength: {passwordStrength.label}</span>
                      <span>Min 6 characters</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-300 pt-1">
                <input 
                  type="checkbox" 
                  checked={agreedTerms} 
                  onChange={e => setAgreedTerms(e.target.checked)} 
                  className="accent-fuchsia-500 w-4 h-4 rounded cursor-pointer mt-0.5"
                />
                <span>I agree to EduTrack's honor code and student privacy policy.</span>
              </label>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-xl shadow-fuchsia-500/25 transition-all active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="mt-6 pt-5 border-t border-white/10 relative z-10">
              <div className="flex items-center justify-center mb-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-[#0b1026] px-3 py-0.5 rounded-full border border-indigo-500/20">
                  ✨ Or Test Drive Instantly
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  type="button" 
                  disabled={demoLoadingRole !== null} 
                  onClick={() => handleGuestDemo("student")} 
                  className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Student</span>
                </button>
                <button 
                  type="button" 
                  disabled={demoLoadingRole !== null} 
                  onClick={() => handleGuestDemo("teacher")} 
                  className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Teacher</span>
                </button>
                <button 
                  type="button" 
                  disabled={demoLoadingRole !== null} 
                  onClick={() => handleGuestDemo("admin")} 
                  className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Bottom link to login */}
            <div className="mt-5 text-center relative z-10">
              <p className="text-xs text-slate-400 font-medium">
                Already have an account?{" "}
                <Link href="/login" className="text-fuchsia-400 hover:text-fuchsia-300 font-extrabold underline underline-offset-4">
                  Sign in here
                </Link>
              </p>
            </div>

          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
