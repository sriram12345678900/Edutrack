"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, BookOpen, MessageSquare, Target, Settings, LogOut, Menu, X, 
  GraduationCap, Moon, Sun, Calendar, Sparkles, Users, Award, Palette, Timer, Brain
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// Categorized premium sidebar links (static definition outside component to avoid re-creation)
const categories = [
  {
    title: "Core Space",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/learn", label: "Subjects Hub", icon: BookOpen },
      { href: "/ncert", label: "NCERT Books", icon: GraduationCap },
    ]
  },
  {
    title: "AI Study Lab",
    items: [
      { href: "/tutor", label: "AI Tutor", icon: MessageSquare },
      { href: "/plan", label: "Study Planner", icon: Calendar },
      { href: "/flashcards", label: "AI Flashcards", icon: Sparkles },
      { href: "/whiteboard", label: "Whiteboard", icon: Palette },
      { href: "/pomodoro", label: "Pomodoro Timer", icon: Timer },
    ]
  },
  {
    title: "Testing & Groups",
    items: [
      { href: "/groups", label: "StudyCircles", icon: Users },
      { href: "/pyq", label: "PYQs Subject Hub", icon: Award },
      { href: "/analytics", label: "Performance", icon: Target },
    ]
  }
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  // Prefetch all sidebar routes on mount for fast navigation
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wide">Initializing Space...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "Student";
  const initials = (user.displayName || user.email || "S").charAt(0).toUpperCase();

  return (
    <div className="h-screen max-h-screen bg-slate-50 dark:bg-[#03050c] text-slate-900 dark:text-slate-100 flex overflow-hidden grid-bg-overlay">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 h-screen w-66 border-r border-slate-200/40 dark:border-white/5 bg-white/70 dark:bg-[#040612]/75 backdrop-blur-xl flex flex-col z-50 transition-transform duration-300 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo / Header */}
        <div className="p-6 border-b border-slate-200/30 dark:border-white/5 flex justify-between items-center shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Brain className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              EduTrack
            </span>
          </Link>
          <button className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl" onClick={() => setIsMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* User Info & Quick Theme Toggle */}
        <div className="p-4 mx-4 mt-5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/15 dark:border-white/5 rounded-2xl flex items-center gap-3 shrink-0 relative group">
          {user.photoURL ? (
            <img src={user.photoURL} alt={firstName} className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-550 to-pink-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0 shadow-lg shadow-indigo-500/10 border border-white/10">
              {initials}
            </div>
          )}
          <div className="overflow-hidden flex-1">
            <p className="font-extrabold text-xs text-slate-850 dark:text-white truncate">{user.displayName || firstName}</p>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold truncate leading-none mt-1.5 uppercase tracking-wider">{user.email?.split("@")[0]}</p>
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
            className="p-2 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-200/50 dark:border-white/5 text-slate-550 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all shrink-0"
            title="Toggle Theme"
          >
            <Moon className="w-3.5 h-3.5 hidden dark:block" />
            <Sun className="w-3.5 h-3.5 block dark:hidden" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-none">
          {categories.map((category, catIdx) => (
            <div key={catIdx} className="space-y-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 px-3 block mb-1">
                {category.title}
              </span>
              <div className="space-y-0.5">
                {category.items.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={true}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all relative group",
                        isActive
                          ? "bg-indigo-500/10 text-indigo-650 dark:bg-indigo-500/10 dark:text-indigo-400 border-l-2 border-indigo-500 shadow-sm"
                          : "hover:bg-slate-100/50 dark:hover:bg-white/[0.02] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-250"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-[-2px] top-1/4 bottom-1/4 w-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                      )}
                      <Icon className={cn(
                        "w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-105",
                        isActive ? "text-indigo-600 dark:text-indigo-400" : ""
                      )} /> 
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Settings & Logout */}
        <div className="p-4 border-t border-slate-200/30 dark:border-white/5 shrink-0 space-y-1">
          <Link 
            href="/setup" 
            prefetch={true}
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-white/[0.02] text-slate-500 dark:text-slate-400 transition-all mb-1"
          >
            <Settings className="w-4.5 h-4.5" /> 
            <span>Account Setup</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 transition-all w-full text-left"
          >
            <LogOut className="w-4.5 h-4.5" /> 
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <main className={cn(
        "flex-1 relative bg-slate-50/20 dark:bg-[#03050c]/25 flex flex-col min-h-0",
        (pathname === "/groups" || pathname.startsWith("/groups/") || pathname === "/whiteboard" || pathname.startsWith("/whiteboard/"))
          ? "overflow-hidden"
          : "overflow-y-auto"
      )}>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200/30 dark:border-white/5 bg-white/90 dark:bg-[#040612]/90 backdrop-blur sticky top-0 z-30 shrink-0">
          <button onClick={() => setIsMobileOpen(true)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-lg font-black text-indigo-650 dark:text-indigo-400 tracking-tight">EduTrack</span>
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-black text-indigo-650 dark:text-indigo-400 border border-indigo-500/20 uppercase">
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

