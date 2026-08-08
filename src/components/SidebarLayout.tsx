"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, BookOpen, MessageSquare, Target, Settings, LogOut, Menu, X, 
  GraduationCap, Moon, Sun, Calendar, Sparkles, Users, Award, Palette, Timer, Brain, Camera, Zap, Trophy, Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// Categorized premium sidebar links
const categories = [
  {
    title: "Core Space",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home, badge: "Main" },
      { href: "/learn", label: "Subjects Hub", icon: BookOpen },
      { href: "/ncert", label: "NCERT Books", icon: GraduationCap },
    ]
  },
  {
    title: "AI Study Lab",
    items: [
      { href: "/tutor", label: "AI Tutor", icon: MessageSquare, badge: "AI" },
      { href: "/lens", label: "Doubt-Solver Lens", icon: Camera, badge: "Live" },
      { href: "/plan", label: "Study Planner", icon: Calendar },
      { href: "/flashcards", label: "AI Flashcards", icon: Sparkles },
      { href: "/whiteboard", label: "Whiteboard", icon: Palette },
      { href: "/pomodoro", label: "Pomodoro Timer", icon: Timer },
      { href: "/sandbox", label: "Sim Sandbox", icon: Zap },
    ]
  },
  {
    title: "Testing & Analytics",
    items: [
      { href: "/groups", label: "StudyCircles", icon: Users },
      { href: "/pyq", label: "PYQs Hub", icon: Award },
      { href: "/analytics", label: "Performance", icon: Target },
      { href: "/trophies", label: "Achievements", icon: Trophy },
    ]
  }
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userXp, setUserXp] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Route guard — redirect to login if not authenticated, or verify-email if not verified
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!user.emailVerified) {
        router.push("/verify-email");
      }
    }
  }, [user, loading, router]);

  // Load XP stats
  useEffect(() => {
    if (typeof window !== "undefined") {
      const xpVal = localStorage.getItem("edutrack_xp");
      const lvlVal = localStorage.getItem("edutrack_level");
      if (xpVal) setUserXp(parseInt(xpVal, 10));
      if (lvlVal) setUserLevel(parseInt(lvlVal, 10));
    }
  }, []);

  // Prefetch all sidebar routes on mount for ultra-fast navigation
  useEffect(() => {
    categories.forEach(category => {
      category.items.forEach(item => {
        router.prefetch(item.href);
      });
    });
    router.prefetch("/setup");
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#03050c] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Neural Space...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "Student";
  const initials = (user.displayName || user.email || "S").charAt(0).toUpperCase();

  return (
    <div className="h-screen max-h-screen bg-slate-50 dark:bg-[#03050c] text-slate-900 dark:text-slate-100 flex overflow-hidden grid-bg-overlay selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-md transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 h-screen w-68 border-r border-slate-200/50 dark:border-white/5 bg-white/80 dark:bg-[#040612]/80 backdrop-blur-2xl flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Logo / Header */}
        <div className="p-6 border-b border-slate-200/40 dark:border-white/5 flex justify-between items-center shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/10 group-hover:scale-105 transition-transform">
              <Brain className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                EduTrack
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Next-Gen OS</span>
            </div>
          </Link>
          <button className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400" onClick={() => setIsMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card & Quick Theme Toggle */}
        <div className="p-4 mx-4 mt-5 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 dark:border-white/10 rounded-2xl flex items-center gap-3 shrink-0 relative overflow-hidden group shadow-sm">
          <div className="relative">
            {user.photoURL ? (
              <img src={user.photoURL} alt={firstName} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/40 shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg shadow-indigo-500/20 border border-white/20">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[8px] font-black px-1 rounded-full border border-black" title={`Level ${userLevel}`}>
              L{userLevel}
            </div>
          </div>

          <div className="overflow-hidden flex-1">
            <p className="font-black text-xs text-slate-900 dark:text-white truncate">{user.displayName || firstName}</p>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold truncate leading-none mt-1 uppercase tracking-wider">{user.email?.split("@")[0]}</p>
          </div>
          
          <button 
            onClick={() => {
              const isDark = document.documentElement.classList.contains('dark');
              if (isDark) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('edutrack_theme', 'light');
              } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('edutrack_theme', 'dark');
              }
            }}
            className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all shrink-0 shadow-sm"
            title="Toggle Light/Dark Theme"
          >
            <Moon className="w-4 h-4 hidden dark:block text-indigo-400" />
            <Sun className="w-4 h-4 block dark:hidden text-amber-500" />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-none">
          {categories.map((category, catIdx) => (
            <div key={catIdx} className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 px-3 block mb-1">
                {category.title}
              </span>
              <div className="space-y-1">
                {category.items.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href + "/"));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={true}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl font-extrabold text-xs transition-all relative group",
                        isActive
                          ? "bg-indigo-500/10 text-indigo-650 dark:bg-indigo-500/15 dark:text-indigo-400 border border-indigo-500/25 shadow-sm"
                          : "hover:bg-slate-100/70 dark:hover:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                      )}
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          "w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110",
                          isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-500"
                        )} /> 
                        <span>{link.label}</span>
                      </div>

                      {link.badge && (
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border",
                          isActive ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-white/5 text-slate-400 border-white/10"
                        )}>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Settings & Logout Footer */}
        <div className="p-4 border-t border-slate-200/40 dark:border-white/5 shrink-0 space-y-1">
          <Link 
            href="/setup" 
            prefetch={true}
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
          >
            <Settings className="w-4.5 h-4.5 text-slate-400" /> 
            <span>Account Setup</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 transition-all w-full text-left"
          >
            <LogOut className="w-4.5 h-4.5 text-red-400/80" /> 
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Display Viewport */}
      <main className={cn(
        "flex-1 relative bg-slate-50/40 dark:bg-[#03050c]/40 flex flex-col min-h-0",
        (pathname === "/groups" || pathname.startsWith("/groups/") || pathname === "/whiteboard" || pathname.startsWith("/whiteboard/"))
          ? "overflow-hidden"
          : "overflow-y-auto"
      )}>

        {/* Mobile Navbar Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200/40 dark:border-white/5 bg-white/90 dark:bg-[#040612]/90 backdrop-blur-xl sticky top-0 z-30 shrink-0">
          <button onClick={() => setIsMobileOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-500" />
            <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">EduTrack</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-black text-indigo-500 border border-indigo-500/20 uppercase">
            {initials}
          </div>
        </header>

        <div className={cn(
          (pathname === "/groups" || pathname.startsWith("/groups/") || pathname === "/whiteboard" || pathname.startsWith("/whiteboard/"))
            ? "w-full flex-1 min-h-0 overflow-hidden relative flex flex-col"
            : "p-6 md:p-10 max-w-7xl mx-auto w-full"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}
