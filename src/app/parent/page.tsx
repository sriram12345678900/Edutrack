"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { 
  Shield, Lock, Activity, Trophy, Flame, Target, ChevronLeft, Calendar, 
  CheckCircle2, Bell, MessageSquare, Share2, Copy, Check, Send, Sparkles, 
  AlertCircle, Smartphone, Mail, Download, Clock, Star
} from "lucide-react";
import { useGamificationStore } from "@/store/useGamificationStore";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ParentNotification {
  id: string;
  type: "achievement" | "alert" | "digest" | "reminder";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function ParentPortal() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const { xp, level, streak } = useGamificationStore();
  
  const [pinEntry, setPinEntry] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "digest" | "notifications">("overview");

  // Notifications State
  const [notifications, setNotifications] = useState<ParentNotification[]>([
    {
      id: "notif-1",
      type: "achievement",
      title: "🔥 7-Day Study Streak Milestone!",
      message: `${profile?.displayName || "Your student"} completed their daily study mission for 7 consecutive days in Physics & Mathematics.`,
      time: "2 hours ago",
      read: false
    },
    {
      id: "notif-2",
      type: "digest",
      title: "📊 Weekly AI Performance Digest Ready",
      message: "Scored 92% in Science PYQ Practice and logged 12.5 active focus hours this week.",
      time: "1 day ago",
      read: false
    },
    {
      id: "notif-3",
      type: "alert",
      title: "⚠️ Error Vault Review Suggested",
      message: "A few recurring mistakes in 'Light Refraction Signs' were flagged by AI. Scheduled for 15-min flashcard review.",
      time: "2 days ago",
      read: true
    }
  ]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    
    // If profile exists and no PIN is set, auto-authenticate
    if (!loading && profile && !profile.parentPin) {
      setIsAuthenticated(true);
    }
  }, [loading, user, profile, router]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.parentPin === pinEntry) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPinEntry("");
    }
  };

  const getDigestMessage = () => {
    const name = profile?.displayName || "Your Student";
    return `*EduTrack Weekly Student Progress Digest* 🎓\n\n` +
      `👤 *Student:* ${name} (Class ${profile?.className || "10"})\n` +
      `🔥 *Active Streak:* ${streak} Days\n` +
      `⭐ *Level & XP:* Level ${level} (${xp} Total XP)\n` +
      `⏱️ *Weekly Study Time:* 14.5 Hours\n` +
      `📈 *Average Test Accuracy:* 88%\n` +
      `🏆 *Top Subject:* Physics (Light & Electricity)\n` +
      `🎯 *Focus Area for Next Week:* Carbon Compounds Revision\n\n` +
      `💡 *AI Coaching Tip:* ${name} is performing exceptionally well in problem solving. Encouraging a 10-minute active recall session before bed will further solidify retention!\n\n` +
      `_Sent securely via EduTrack Parent Bridge_`;
  };

  const handleCopyWhatsApp = () => {
    const text = getDigestMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getDigestMessage());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleRequestPushNotifications = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("EduTrack Parent Notifications Enabled", {
            body: "You will now receive weekly progress reports and study milestones directly on this device!",
            icon: "/favicon.ico"
          });
        }
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Parent Portal & AI Digest</h1>
            <p className="text-xs font-bold text-slate-400">Monitoring & Automated Weekly Notification Center</p>
          </div>
        </div>
        <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition-colors">
          <ChevronLeft className="w-4 h-4" /> Exit
        </Link>
      </header>

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto mt-16"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-slate-700">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Enter Parent PIN</h2>
                <p className="text-xs text-slate-400 mt-1">Please enter the 4-digit security PIN to view student progress.</p>
              </div>
              
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <input 
                  type="password" 
                  maxLength={4}
                  value={pinEntry}
                  onChange={(e) => {
                    setPinEntry(e.target.value.replace(/\D/g, ''));
                    setError(false);
                  }}
                  className={`w-full max-w-[200px] mx-auto text-center text-3xl tracking-[0.5em] font-black p-4 rounded-2xl border-2 ${error ? 'border-red-500 bg-red-950/40 text-red-400' : 'border-slate-800 bg-slate-950 text-white focus:border-indigo-500'}`}
                  placeholder="••••"
                />
                {error && <p className="text-red-400 text-xs font-bold">Incorrect PIN. Try again.</p>}
                
                <button 
                  type="submit"
                  disabled={pinEntry.length < 4}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30"
                >
                  Unlock Parent Dashboard
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-6"
          >
            {/* Tabs */}
            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-fit">
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all",
                  activeTab === "overview" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                )}
              >
                Student Overview
              </button>
              <button
                onClick={() => setActiveTab("digest")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                  activeTab === "digest" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                AI Weekly Digest (WhatsApp / Email)
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                  activeTab === "notifications" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                )}
              >
                <Bell className="w-3.5 h-3.5 text-indigo-400" />
                Notification Center ({notifications.filter(n => !n.read).length})
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Student Overview */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:col-span-2 flex items-center gap-6 shadow-xl">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl text-white font-black shadow-lg">
                      {(profile?.displayName || "S").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">{profile?.displayName || "Student"}</h2>
                      <p className="text-xs font-bold text-slate-400">Class {profile?.className || "10"} • Academic Dashboard</p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5 text-xs font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full">
                          <Trophy className="w-3.5 h-3.5" /> Level {level}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                          <Flame className="w-3.5 h-3.5" /> {streak} Day Streak
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weak Subjects Alert */}
                  <div className="bg-slate-900 border border-red-500/20 rounded-3xl p-6 shadow-xl space-y-3">
                    <h3 className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-4 h-4" /> AI Focus Recommendations
                    </h3>
                    <ul className="space-y-2">
                      <li className="text-xs font-bold text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        ⚡ Light - Refraction Sign Conventions
                      </li>
                      <li className="text-xs font-bold text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        🧪 Esterification Reaction Balancing
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <Activity className="w-6 h-6 text-emerald-400 mb-2" />
                    <div className="text-2xl font-black text-white">88%</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg Test Score</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <Clock className="w-6 h-6 text-blue-400 mb-2" />
                    <div className="text-2xl font-black text-white">14.5h</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Weekly Study Time</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <CheckCircle2 className="w-6 h-6 text-purple-400 mb-2" />
                    <div className="text-2xl font-black text-white">18</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Chapters Mastered</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <Flame className="w-6 h-6 text-amber-400 mb-2" />
                    <div className="text-2xl font-black text-white">{streak} Days</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active Streak</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI WEEKLY DIGEST (WHATSAPP / EMAIL) */}
            {activeTab === "digest" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Automated AI Weekly Digest
                      </span>
                      <h2 className="text-xl font-black text-white mt-1">Formatted Progress Report</h2>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      Generated Today
                    </span>
                  </div>

                  {/* Message Preview Box */}
                  <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 font-sans text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-line shadow-inner">
                    {getDigestMessage()}
                  </div>

                  {/* Share Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={handleShareWhatsApp}
                      className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
                    >
                      <Smartphone className="w-4 h-4" />
                      Send via WhatsApp
                    </button>

                    <button
                      onClick={handleCopyWhatsApp}
                      className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs flex items-center gap-2 transition-all"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied to Clipboard!" : "Copy Report Text"}
                    </button>

                    <button
                      onClick={handleRequestPushNotifications}
                      className="px-5 py-3 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-black text-xs flex items-center gap-2 transition-all"
                    >
                      <Bell className="w-4 h-4" />
                      Enable Web Notifications
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400" /> Key Takeaways for Parents
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      EduTrack analyzes all quiz attempts, error logs, and time-in-app to create actionable feedback rather than just raw marks.
                    </p>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-emerald-300">
                      ✅ Consistent 35 min daily study habit formed this week!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NOTIFICATION CENTER */}
            {activeTab === "notifications" && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-400" />
                    In-App Notification Dispatcher
                  </h2>
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="space-y-3">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex items-start gap-4",
                        !n.read ? "bg-indigo-950/20 border-indigo-500/40 shadow-sm" : "bg-slate-950/60 border-slate-800/80 opacity-80"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg shrink-0">
                        {n.type === "achievement" ? "🏆" : n.type === "digest" ? "📊" : "⚠️"}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs md:text-sm font-black text-white">{n.title}</h4>
                          <span className="text-[10px] text-slate-500">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
