"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, User as UserIcon, Mail, Lock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!name || !email) return setError("Please enter your name and email.");
      // Mock sending OTP
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(2);
      }, 1000);
      return;
    }

    if (step === 2) {
      if (otp.length < 4) return setError("Please enter a valid OTP.");
      // Mock verifying OTP
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(3);
      }, 1000);
      return;
    }

    if (step === 3) {
      if (!password || !confirmPassword) return setError("Please enter your password.");
      if (password !== confirmPassword) return setError("Passwords do not match.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");

      setLoading(true);
      try {
        await signup(email, password, name);
      } catch (err: any) {
        const msg = err.code === "auth/email-already-in-use"
          ? "This email is already registered. Please log in instead."
          : err.code === "auth/weak-password"
          ? "Password must be at least 6 characters."
          : "Something went wrong. Please try again.";
        setError(msg);
      } finally {
        setLoading(false);
      }
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-x-hidden transition-colors duration-300" style={{ backgroundColor: "var(--background)" }}>
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
              <Brain className="w-6.5 h-6.5 dark:text-white text-slate-900 relative z-10" />
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">EduTrack</span>
          </Link>
        </div>

        {/* Signup Form Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="premium-glass-panel p-8 sm:p-10 relative overflow-hidden"
        >
          {/* Top glowing accent border */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-400" />

          <motion.div variants={itemVariants} className="text-center mb-8">
            <h2 className="text-3xl font-black bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-slate-200 bg-clip-text text-transparent tracking-tight">
              Create Account
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-2.5">
              Personalize your adaptive study workspace
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
            {step === 1 && (
              <>
                {/* Google Sign In */}
                <motion.div variants={itemVariants}>
                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3.5 bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 px-5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-200 disabled:opacity-60 hover:-translate-y-0.5"
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
                  <span className="text-[10px] dark:text-slate-400 text-slate-600 dark:text-slate-500 font-black tracking-widest uppercase">Or register</span>
                  <div className="flex-1 h-px bg-slate-200/70 dark:bg-white/5" />
                </motion.div>
              </>
            )}

            {step > 1 && (
              <motion.div variants={itemVariants} className="pb-2">
                <button
                  type="button"
                  onClick={() => setStep(step === 2 ? 1 : 2)}
                  className="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
                >
                  ← Back
                </button>
              </motion.div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 dark:text-slate-400 text-slate-600" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all text-xs font-bold text-slate-800 dark:text-white shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 dark:text-slate-400 text-slate-600" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all text-xs font-bold text-slate-800 dark:text-white shadow-inner"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                    {/* OTP */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Verification Code (OTP)</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 dark:text-slate-400 text-slate-600" />
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all text-xs font-bold text-slate-800 dark:text-white shadow-inner tracking-widest text-center"
                          maxLength={6}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">We sent a verification code to {email || "your email"}</p>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 dark:text-slate-400 text-slate-600" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all text-xs font-bold text-slate-800 dark:text-white shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 dark:text-slate-400 text-slate-600 hover:text-slate-800 dark:hover:text-slate-300 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 dark:text-slate-400 text-slate-600" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all text-xs font-bold text-slate-800 dark:text-white shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 dark:text-slate-400 text-slate-600 hover:text-slate-800 dark:hover:text-slate-300 focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                      <span>{step === 1 ? "Send Verification Code" : step === 2 ? "Verify OTP" : "Create Account"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </div>

          {/* Footer Login Link */}
          <motion.p variants={itemVariants} className="text-center text-slate-500 dark:text-slate-400 mt-8 text-xs font-bold">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline">
              Log in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
