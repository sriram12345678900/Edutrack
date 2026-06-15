"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, RefreshCw, LogOut } from "lucide-react";
import { sendEmailVerification } from "firebase/auth";

export default function VerifyEmail() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user?.emailVerified) {
      if (!localStorage.getItem("edutrack_class")) {
        router.push("/setup");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  const handleResend = async () => {
    if (!user) return;
    setResending(true);
    setMessage("");
    try {
      await sendEmailVerification(user);
      setMessage("Verification email resent! Please check your inbox (and spam folder).");
    } catch (error: any) {
      if (error.code === "auth/too-many-requests") {
        setMessage("Please wait a minute before requesting another email.");
      } else {
        setMessage("Failed to resend email. Please try again later.");
      }
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerified = async () => {
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        if (!localStorage.getItem("edutrack_class")) {
          router.push("/setup");
        } else {
          router.push("/dashboard");
        }
      } else {
        setMessage("Your email is not verified yet. Please check your inbox and click the link.");
      }
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-700 text-center">
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify your email</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          We've sent a verification link to <span className="font-semibold text-slate-700 dark:text-slate-300">{user.email}</span>. 
          Please check your inbox and click the link to activate your account.
        </p>

        {message && (
          <div className="bg-slate-50 dark:bg-slate-700/50 text-indigo-600 dark:text-indigo-400 text-sm p-4 rounded-xl mb-6">
            {message}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCheckVerified}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            I have verified my email <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Resend Verification Email
          </button>
        </div>

        <button
          onClick={logout}
          className="mt-8 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center gap-2 mx-auto"
        >
          <LogOut className="w-4 h-4" /> Use a different account
        </button>
      </div>
    </div>
  );
}
