"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Brain, Mail, Lock, ArrowRight, AlertCircle, Loader2, 
  Building, GraduationCap, Users, Eye, EyeOff, Zap
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { useRouter } from "next/navigation";
import { ADMIN_PORTAL_ROUTE } from "@/lib/admin";

export default function Login() {
  const { user, loading: authLoading, login, loginWithGoogle, loginAsGuest } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") router.push(ADMIN_PORTAL_ROUTE);
      else if (user.role === "teacher") router.push("/teacher");
      else router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return triggerError("Please fill in all fields.");
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      triggerError("Invalid email or password. You can also use the 1-Click Instant Demo below!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      triggerError("Google sign-in was cancelled or unavailable.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuestDemo = async (targetRole: "student" | "teacher" | "admin" = "student") => {
    setDemoLoading(true);
    try {
      await loginAsGuest(targetRole);
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoading(false);
    }
  };

  // 3D Card Hover Physics
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25; 
    const y = (e.clientY - top - height / 2) / 25;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-10, 10], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-10, 10], [-10, 10]), springConfig);

  // Dynamic Background Glow mapping to mouse position globally
  const bgMouseX = useMotionValue(0);
  const bgMouseY = useMotionValue(0);
  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    bgMouseX.set(e.clientX);
    bgMouseY.set(e.clientY);
  };
  
  const bgGlow = useMotionTemplate`radial-gradient(600px circle at ${bgMouseX}px ${bgMouseY}px, rgba(99, 102, 241, 0.08), transparent 80%)`;

  return (
    <motion.div 
      onMouseMove={handleGlobalMouseMove}
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden bg-slate-50 dark:bg-[#060814] text-slate-900 dark:text-white"
    >
      {/* Interactive Background ambient glow */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: bgGlow }}
      />
      
      {/* Static mesh blobs for base ambiance */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md relative z-10" style={{ perspective: 1200 }}>
        
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="flex justify-center mb-6"
        >
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 -skew-x-12" />
              <Brain className="w-7 h-7 relative z-10" />
            </div>
            <span className="text-3xl font-black tracking-tight group-hover:text-indigo-500 transition-colors">EduTrack</span>
          </Link>
        </motion.div>

        <motion.div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY }}
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={shake ? { duration: 0.4 } : undefined}
          layout
          className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden group/card"
        >
          {/* Internal hover glow that follows cursor over the card */}
          <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: `radial-gradient(400px circle at ${mouseX.get() * 25 + 200}px ${mouseY.get() * 25 + 200}px, rgba(255,255,255,0.05), transparent 40%)`
               }}
          />

          {/* Top accent bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />

          <div className="text-center mb-6 relative z-10">
            <h2 className="text-2xl font-black mb-1">Welcome Back</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to your account</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.9 }} 
                animate={{ opacity: 1, height: "auto", scale: 1 }} 
                exit={{ opacity: 0, height: 0, scale: 0.9 }} 
                className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl mb-6 text-xs font-medium border border-red-500/20 relative z-10"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleStandardLogin} className="space-y-4 relative z-10">
            <div className="group/input">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 group-focus-within/input:text-indigo-500 transition-colors">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all shadow-inner font-medium" 
                  required 
                />
              </div>
            </div>
            
            <div className="group/input">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 group-focus-within/input:text-indigo-500 transition-colors">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="w-full pl-12 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pr-10 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all shadow-inner font-medium" 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all mt-4 text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </motion.button>
            
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={handleGoogle} disabled={googleLoading} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-white/10">
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
          <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/10 relative z-10">
            <div className="flex items-center justify-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-[#0B0F19] px-2 absolute top-[-7px] rounded-full">
                1-Click Instant Demo
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" disabled={demoLoading} onClick={() => handleGuestDemo("student")} className="px-2 py-2 bg-indigo-50/50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Student
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" disabled={demoLoading} onClick={() => handleGuestDemo("teacher")} className="px-2 py-2 bg-purple-50/50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5" /> Teacher
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" disabled={demoLoading} onClick={() => handleGuestDemo("admin")} className="px-2 py-2 bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1">
                <Building className="w-3.5 h-3.5" /> Admin
              </motion.button>
            </div>
          </div>

          {/* Footer Signup Link */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10 text-center relative z-10">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account?{" "}
              <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
}
