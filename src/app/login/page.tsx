"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Brain, Mail, Lock, ArrowRight, AlertCircle, Loader2, 
  Building, GraduationCap, Users, Eye, EyeOff, Sparkles, Shield, Zap
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ADMIN_PORTAL_ROUTE, DEFAULT_MASTER_ADMIN } from "@/lib/admin";

export default function Login() {
  const { user, loading: authLoading, login, loginWithGoogle, loginWithOrg, loginAsGuest } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<"student" | "teacher" | "admin" | null>(null);
  const [loginMethod, setLoginMethod] = useState<"standard" | "org" | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [orgUsername, setOrgUsername] = useState("");
  const [orgPassword, setOrgPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") router.push(ADMIN_PORTAL_ROUTE);
      else if (user.role === "teacher") router.push("/teacher");
      else router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill in all fields.");
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError("Invalid email or password. You can also use the 1-Click Instant Demo below!");
    } finally {
      setLoading(false);
    }
  };

  const handleOrgLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgUsername || !orgPassword) return setError("Please enter your organization credentials.");
    setError("");
    setLoading(true);
    try {
      await loginWithOrg(orgUsername, orgPassword);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Try using default credentials or Demo login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError("Google sign-in was cancelled or unavailable. Use 1-Click Demo Login to enter!");
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

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden bg-slate-50 dark:bg-[#060814] text-slate-900 dark:text-white">
      {/* Background ambient glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white">
              <Brain className="w-6 h-6" />
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tight">EduTrack</span>
          </Link>
        </div>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden"
        >
          {/* Top accent bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />

          {/* Quick Demo Access Bar */}
          <div className="mb-6 p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/60 dark:border-indigo-500/20 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 1-Click Instant Demo
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                No Signup Required
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={demoLoading}
                onClick={() => handleGuestDemo("student")}
                className="px-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student
              </button>
              <button
                type="button"
                disabled={demoLoading}
                onClick={() => handleGuestDemo("teacher")}
                className="px-2 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Users className="w-3.5 h-3.5" />
                Teacher
              </button>
              <button
                type="button"
                disabled={demoLoading}
                onClick={() => handleGuestDemo("admin")}
                className="px-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>
          </div>

          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
            <span className="flex-shrink-0 mx-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Or sign in with account</span>
            <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
          </div>
          
          <AnimatePresence mode="wait">
            {!role ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}>
                <h2 className="text-xl font-black mb-1 text-center">Select Role</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-5">Choose your account type</p>
                <div className="space-y-2.5">
                  <button onClick={() => setRole("student")} className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform"><GraduationCap className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-sm">I am a Student</h3>
                      <p className="text-[11px] text-slate-500">Access Feynman Lab, Flashcards & AI Viva</p>
                    </div>
                  </button>
                  <button onClick={() => setRole("teacher")} className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-500/10 transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform"><Users className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-sm">I am a Teacher</h3>
                      <p className="text-[11px] text-slate-500">Manage classroom & auto-grade tests</p>
                    </div>
                  </button>
                  <button onClick={() => setRole("admin")} className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform"><Building className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-sm">School Admin</h3>
                      <p className="text-[11px] text-slate-500">Manage school portal & batches</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            ) : !loginMethod && role !== "admin" ? (
              <motion.div key="step2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}>
                <button onClick={() => setRole(null)} className="text-xs font-bold text-indigo-500 mb-4 flex items-center gap-1 hover:underline">← Back</button>
                <h2 className="text-xl font-black mb-1 text-center">Login Method</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-5">How would you like to sign in?</p>
                <div className="space-y-3">
                  <button onClick={() => setLoginMethod("standard")} className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors shadow-md shadow-indigo-500/20">
                    Standard Email / Password
                  </button>
                  <button onClick={() => setLoginMethod("org")} className="w-full py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                    <Building className="w-4 h-4 text-indigo-500" />
                    School Organization Login
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step3" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}>
                <button onClick={() => { if (role === "admin") setRole(null); else setLoginMethod(null); }} className="text-xs font-bold text-indigo-500 mb-4 flex items-center gap-1 hover:underline">← Back</button>
                <h2 className="text-xl font-black mb-1 text-center">
                  {role === "admin" ? "Admin Portal Login" : loginMethod === "org" ? "School Credentials" : "Welcome Back"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-5">Enter your details to continue</p>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 text-xs font-medium border border-red-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {(loginMethod === "org" || role === "admin") ? (
                  <form onSubmit={handleOrgLogin} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Username</label>
                      <input 
                        type="text" 
                        value={orgUsername} 
                        onChange={e => setOrgUsername(e.target.value)} 
                        placeholder={role === "admin" ? DEFAULT_MASTER_ADMIN.username : "std_1234"}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={orgPassword} 
                          onChange={e => setOrgPassword(e.target.value)} 
                          placeholder="••••••••"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                          required 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {role === "admin" && (
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-600 dark:text-emerald-400">
                        Default: <span className="font-mono font-bold">ADMIN_MASTER_2026</span> / <span className="font-mono font-bold">EduTrack@Master#2026!</span>
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all mt-2 text-sm shadow-md">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Sign In"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleStandardLogin} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="student@example.com"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                          placeholder="••••••••"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                          required 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all mt-2 text-sm shadow-md">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Sign In"}
                    </button>
                    <button type="button" onClick={handleGoogle} disabled={googleLoading} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl transition-all text-xs">
                      Sign In with Google
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Signup Link */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account?{" "}
              <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
