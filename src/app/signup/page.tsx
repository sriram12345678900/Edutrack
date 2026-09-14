"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Brain, User as UserIcon, Mail, Lock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Signup() {
  const { user, loading: authLoading, signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) return triggerError("Please fill in all fields.");
    if (password.length < 6) return triggerError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      await signup(email, password, name);
    } catch (err: any) {
      const msg = err.code === "auth/email-already-in-use"
        ? "This email is already registered. Please log in instead."
        : err.code === "auth/weak-password"
        ? "Password must be at least 6 characters."
        : "Something went wrong. Please try again.";
      triggerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      triggerError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
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

  // Dynamic Background Glow
  const bgMouseX = useMotionValue(0);
  const bgMouseY = useMotionValue(0);
  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    bgMouseX.set(e.clientX);
    bgMouseY.set(e.clientY);
  };
  const bgGlow = useMotionTemplate`radial-gradient(600px circle at ${bgMouseX}px ${bgMouseY}px, rgba(168, 85, 247, 0.08), transparent 80%)`;

  return (
    <motion.div 
      onMouseMove={handleGlobalMouseMove}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-x-hidden bg-slate-50 dark:bg-[#060814] text-slate-900 dark:text-white transition-colors duration-300"
    >
      {/* Interactive Background */}
      <motion.div className="absolute inset-0 z-0 pointer-events-none" style={{ background: bgGlow }} />

      {/* Static mesh blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none -z-10 animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-fuchsia-500/10 dark:bg-fuchsia-500/5 rounded-full blur-[110px] pointer-events-none -z-10 animate-[pulse_8s_ease-in-out_infinite_delayed]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-[0.02] dark:opacity-[0.05] pointer-events-none -z-20" />

      <div className="w-full max-w-md relative z-10" style={{ perspective: 1200 }}>
        {/* Logo Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="flex justify-center mb-8"
        >
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/10 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 -skew-x-12" />
              <Brain className="w-6 h-6 text-white relative z-10" />
            </div>
            <span className="text-3xl font-black tracking-tighter group-hover:text-indigo-500 transition-colors">EduTrack</span>
          </Link>
        </motion.div>

        {/* Signup Form Card */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY }}
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={shake ? { duration: 0.4 } : undefined}
          layout
          className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-2xl p-8 sm:p-10 relative overflow-hidden rounded-3xl group/card"
        >
          {/* Internal hover glow */}
          <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{ background: `radial-gradient(400px circle at ${mouseX.get() * 25 + 200}px ${mouseY.get() * 25 + 200}px, rgba(255,255,255,0.05), transparent 40%)` }}
          />

          {/* Top glowing accent border */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-400" />

          <div className="text-center mb-8 relative z-10">
            <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-slate-200 bg-clip-text text-transparent tracking-tight">
              Create Account
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-2.5">
              Personalize your adaptive study workspace
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl px-4 py-3 mb-6 text-xs font-bold leading-normal relative z-10"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-5 relative z-10">
            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 px-5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-sm font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-200"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </motion.button>
            </div>

            <div className="flex items-center gap-4 py-1.5">
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
              <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Or register</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="group/input space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 group-focus-within/input:text-indigo-500 uppercase tracking-widest ml-1 transition-colors">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium shadow-inner"
                  />
                </div>
              </div>

              <div className="group/input space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 group-focus-within/input:text-indigo-500 uppercase tracking-widest ml-1 transition-colors">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium shadow-inner"
                  />
                </div>
              </div>

              <div className="group/input space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 group-focus-within/input:text-indigo-500 uppercase tracking-widest ml-1 transition-colors">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium shadow-inner"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors">
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all border border-white/10 disabled:opacity-75"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          {/* Footer Login Link */}
          <div className="mt-8 text-center border-t border-slate-200 dark:border-white/10 pt-5 relative z-10">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
