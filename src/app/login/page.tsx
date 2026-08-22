"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, Mail, Lock, ArrowRight, AlertCircle, Loader2, Building, GraduationCap, Users, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ADMIN_PORTAL_ROUTE } from "@/lib/admin";

export default function Login() {
  const { user, loading: authLoading, login, loginWithGoogle, loginWithOrg } = useAuth();
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
      setError("Invalid email or password.");
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
      setError(err.message || "Invalid credentials.");
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
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (authLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-6 relative overflow-x-hidden transition-colors duration-300 bg-slate-50 dark:bg-[#060814]">
      <div className="w-full max-w-md relative z-10">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg text-white">
              <Brain className="w-6.5 h-6.5" />
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">EduTrack</span>
          </Link>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 shadow-xl rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!role ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">Who are you?</h2>
                <p className="text-sm text-slate-500 text-center mb-8">Select your role to continue</p>
                <div className="space-y-3">
                  <button onClick={() => setRole("student")} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group text-left">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform"><GraduationCap className="w-6 h-6" /></div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">I am a Student</h3>
                      <p className="text-xs text-slate-500">Access classes and homework</p>
                    </div>
                  </button>
                  <button onClick={() => setRole("teacher")} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all group text-left">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Users className="w-6 h-6" /></div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">I am a Teacher</h3>
                      <p className="text-xs text-slate-500">Manage classes and grading</p>
                    </div>
                  </button>
                  <button onClick={() => setRole("admin")} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group text-left">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Building className="w-6 h-6" /></div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">School Admin</h3>
                      <p className="text-xs text-slate-500">Manage organization credentials</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            ) : !loginMethod && role !== "admin" ? (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <button onClick={() => setRole(null)} className="text-xs font-bold text-indigo-500 mb-6 flex items-center gap-1 hover:underline">← Back</button>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">Login Method</h2>
                <p className="text-sm text-slate-500 text-center mb-8">How would you like to sign in?</p>
                <div className="space-y-4">
                  <button onClick={() => setLoginMethod("org")} className="w-full flex flex-col items-center justify-center p-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                    <Building className="w-8 h-8 mb-2" />
                    <span className="font-bold">Organization Login</span>
                    <span className="text-xs text-indigo-200 mt-1">Use credentials provided by your school</span>
                  </button>
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">OR</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                  </div>
                  <button onClick={() => setLoginMethod("standard")} className="w-full py-4 rounded-2xl border border-slate-200 dark:border-white/10 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    Standard Email Login
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <button onClick={() => { if (role === "admin") setRole(null); else setLoginMethod(null); }} className="text-xs font-bold text-indigo-500 mb-6 flex items-center gap-1 hover:underline">← Back</button>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">
                  {role === "admin" ? "Admin Portal Login" : loginMethod === "org" ? "School Credentials" : "Welcome Back"}
                </h2>
                <p className="text-sm text-slate-500 text-center mb-8">Enter your details to continue</p>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl mb-6 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {(loginMethod === "org" || role === "admin") ? (
                  <form onSubmit={handleOrgLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                      <input type="text" value={orgUsername} onChange={e => setOrgUsername(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={orgPassword} onChange={e => setOrgPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pr-12 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none">
                          {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all mt-4">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Sign In to Organization"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleStandardLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pr-12 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none">
                          {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3.5 rounded-xl transition-all mt-4">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Sign In"}
                    </button>
                    <button type="button" onClick={handleGoogle} disabled={googleLoading} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-xl transition-all mt-2">
                      Sign In with Google
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}
