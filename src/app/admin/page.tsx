"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

export default function LockedAdmin() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 selection:bg-red-500/30">
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Top warning line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-500/20 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black mb-2 tracking-tight text-white">403 — Endpoint Relocated & Isolated</h1>
        
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          The public <code className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-mono text-xs">/admin</code> route has been permanently locked down and moved to an isolated private vault URL for security.
        </p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <Lock className="w-4 h-4" />
            <span>Go to Admin Login</span>
          </Link>
          
          <Link
            href="/dashboard"
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
