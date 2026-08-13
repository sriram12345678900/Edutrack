"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#03050c] text-white p-6 text-center">
      <div className="max-w-md w-full bg-[#080b18] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-200 mb-3">Page Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          The requested page could not be found or has moved to a new neural orbit.
        </p>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
