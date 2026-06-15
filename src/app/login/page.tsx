"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, Mail, Lock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill in all fields.");
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      const msg = err.code === "auth/invalid-credential"
        ? "Invalid email or password. Please try again."
        : err.code === "auth/too-many-requests"
        ? "Too many attempts. Please wait a moment."
        : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.08,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Immersive Glowing Mesh Gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] bg-indigo-500/10 dark:bg-indigo-550/5 rounded-full blur-[110px] pointer-events-none -z-10 animate-float-slow" />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-fuchsia-500/10 dark:bg-fuchsia-550/5 rounded-full blur-[110px] pointer-events-none -z-10 animate-float-delayed" />
      <div className="absolute inset-0 grid-bg-overlay opacity-60 pointer-events-none -z-20"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Header */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-indigo-650 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/10 group-hover:scale-105 transition-transform duration-350 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 -skew-x-12" />
              <Brain className="w-6.5 h-6.5 text-white relative z-10" />
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">EduTrack</span>
          </Link>
        </div>

        {/* Login Form Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/80 dark:bg-[#0c0f1d]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(99,102,241,0.1)] p-8 sm:p-10 border border-white/40 dark:border-white/10 relative overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5"
        >
          {/* Top glowing accent border */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-400" />

          <motion.div variants={itemVariants} className="text-center mb-8">
            <h2 className="text-3xl font-black bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-slate-200 bg-clip-text text-transparent tracking-tight">
              Welcome back!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-2.5">
              Log in to continue your learning journey
            </p>
          </motion.div>

          {/* Alert messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 bg-red-500/5 dark:bg-red-500/5 border border-red-500/20 text-red-650 dark:text-red-400 rounded-2xl px-4.5 py-3.5 mb-6 text-xs font-bold leading-normal"
            >
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="space-y-5">
            {/* Google Sign In */}
            <motion.div variants={itemVariants}>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 px-5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-200 disabled:opacity-60 hover:-translate-y-0.5"
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
              </button>
            </motion.div>

            {/* Separator Divider */}
            <motion.div variants={itemVariants} className="flex items-center gap-4 py-1.5">
              <div className="flex-1 h-px bg-slate-200/70 dark:bg-white/5" />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase">Or email</span>
              <div className="flex-1 h-px bg-slate-200/70 dark:bg-white/5" />
            </motion.div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Address */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#040612]/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all text-xs font-bold text-slate-800 dark:text-white shadow-inner"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-[#040612]/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all text-xs font-bold text-slate-800 dark:text-white shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </motion.div>

              {/* Submit CTA */}
              <motion.div variants={itemVariants} className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-650 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/5 transition-all border border-white/10 disabled:opacity-75 disabled:hover:scale-100"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </div>

          {/* Footer Signup Link */}
          <motion.p variants={itemVariants} className="text-center text-slate-500 dark:text-slate-400 mt-8 text-xs font-bold">
            New to EduTrack?{" "}
            <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline">
              Create an account
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
