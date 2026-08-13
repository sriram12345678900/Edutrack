"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, BookOpen, MessageSquare, Target, Settings, LogOut, Menu, X, 
  GraduationCap, Moon, Sun, Calendar, Sparkles, Users, Award, Palette, Timer, Brain, Camera, Zap, Trophy, Shield, Compass
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
      { href: "/formulas", label: "Formulas Hub", icon: Compass, badge: "Master" },
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
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
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
      const pinnedState = localStorage.getItem("edutrack_sidebar_pinned");
      if (xpVal) setUserXp(parseInt(xpVal, 10));
      if (lvlVal) setUserLevel(parseInt(lvlVal, 10));
      if (pinnedState) setIsPinned(pinnedState === "true");
    }
  }, []);

  const togglePin = () => {
    const nextState = !isPinned;
    setIsPinned(nextState);
    localStorage.setItem("edutrack_sidebar_pinned", String(nextState));
  };

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
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff] dark:bg-[#03050c]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Neural Workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff] dark:bg-[#03050c]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Neural Workspace...</p>
        </div>
      </div>
    );
  }

  const firstName = user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "Student";
  const initials = (user.displayName || user.email || "S").charAt(0).toUpperCase();
  const isExpanded = isPinned || isHovered;

  return (
    <div className="h-screen max-h-screen bg-slate-50 dark:bg-[#03050c] text-slate-900 dark:text-slate-100 flex overflow-hidden grid-bg-overlay selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-md transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Interactive Unveiling Sidebar */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed md:sticky top-0 h-screen border-r border-slate-200/50 dark:border-white/10 bg-white/95 dark:bg-[#040614]/95 backdrop-blur-3xl flex flex-col z-50 transition-all duration-300 ease-out shadow-2xl",
          isExpanded ? "w-68 shadow-[0_0_40px_rgba(99,102,241,0.2)]" : "w-20 shadow-none",
          isMobileOpen ? "translate-x-0 w-68" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Ambient Top Beam Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Unveil Indicator Edge Light */}
        {!isExpanded && (
          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-indigo-500/40 animate-pulse pointer-events-none" />
        )}

        {/* Logo / Header */}
        <div className="p-4 border-b border-slate-200/40 dark:border-white/5 flex justify-between items-center shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group overflow-hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/10 group-hover:scale-105 transition-transform shrink-0">
              <Brain className="w-5.5 h-5.5 text-white" />
            </div>
            <div className={cn(
              "flex flex-col transition-all duration-300",
              isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 pointer-events-none"
            )}>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1 whitespace-nowrap">
                EduTrack
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 whitespace-nowrap">Next-Gen OS</span>
            </div>
          </Link>

          {isExpanded && (
            <button 
              onClick={togglePin}
              title={isPinned ? "Unpin sidebar (Auto-unveil on hover)" : "Pin sidebar"}
              className="hidden md:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-indigo-400 transition-all text-[10px] font-bold uppercase tracking-wider"
            >
              {isPinned ? "Pinned" : "Hover"}
            </button>
          )}

          <button className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400" onClick={() => setIsMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card & Theme Toggle */}
        <div className={cn(
          "p-2.5 mx-2.5 mt-3 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 dark:border-white/10 rounded-2xl flex items-center gap-2.5 shrink-0 relative overflow-hidden transition-all duration-300",
          !isExpanded && "justify-center"
        )}>
          <div className="relative shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt={firstName} className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/40 shadow-sm" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0 shadow-lg shadow-indigo-500/20 border border-white/20">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[7px] font-black px-1 rounded-full border border-black" title={`Level ${userLevel}`}>
              L{userLevel}
            </div>
          </div>

          <div className={cn(
            "overflow-hidden transition-all duration-300 flex-1",
            isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 hidden"
          )}>
            <p className="font-black text-xs text-slate-900 dark:text-white truncate">{user.displayName || firstName}</p>
            <p className="text-[8px] text-slate-500 dark:text-slate-400 font-bold truncate leading-none mt-0.5 uppercase tracking-wider">{user.email?.split("@")[0]}</p>
          </div>
          
          {isExpanded && (
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
              className="p-1.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all shrink-0 shadow-sm"
              title="Toggle Light/Dark Theme"
            >
              <Moon className="w-3.5 h-3.5 hidden dark:block text-indigo-400" />
              <Sun className="w-3.5 h-3.5 block dark:hidden text-amber-500" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar overflow-x-hidden">
          {categories.map((category, catIdx) => (
            <div key={catIdx} className="space-y-1">
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 px-3 block transition-all duration-300",
                isExpanded ? "opacity-100" : "opacity-0 hidden"
              )}>
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
                      title={!isExpanded ? link.label : undefined}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl font-extrabold text-xs transition-all relative group",
                        isActive
                          ? "bg-indigo-500/15 text-indigo-650 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/30 shadow-sm"
                          : "hover:bg-slate-100/70 dark:hover:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
                        <span className={cn(
                          "transition-all duration-300 whitespace-nowrap",
                          isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 hidden"
                        )}>
                          {link.label}
                        </span>
                      </div>

                      {link.badge && isExpanded && (
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
        <div className="p-3 border-t border-slate-200/40 dark:border-white/5 shrink-0 space-y-1">
          <Link 
            href="/setup" 
            prefetch={true}
            onClick={() => setIsMobileOpen(false)}
            title={!isExpanded ? "Account Setup" : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
          >
            <Settings className="w-4.5 h-4.5 text-slate-400 shrink-0" /> 
            <span className={cn(
              "transition-all duration-300 whitespace-nowrap",
              isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 hidden"
            )}>
              Account Setup
            </span>
          </Link>
          <button
            onClick={logout}
            title={!isExpanded ? "Log Out" : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 transition-all w-full text-left"
          >
            <LogOut className="w-4.5 h-4.5 text-red-400/80 shrink-0" /> 
            <span className={cn(
              "transition-all duration-300 whitespace-nowrap",
              isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 hidden"
            )}>
              Log Out
            </span>
          </button>
        </div>
      </aside>

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

        {(() => {
          const isFullHeightPage = 
            pathname === "/groups" || pathname.startsWith("/groups/") ||
            pathname === "/whiteboard" || pathname.startsWith("/whiteboard/") ||
            pathname === "/tutor" || pathname.startsWith("/tutor/") ||
            pathname === "/lens" || pathname.startsWith("/lens/");

          return (
            <main className={cn(
              "flex-1 relative flex flex-col min-h-0 transition-colors duration-300",
              isFullHeightPage ? "overflow-hidden" : "overflow-y-auto"
            )} style={{ backgroundColor: 'var(--background)' }}>
              <div className={cn(
                isFullHeightPage
                  ? "w-full flex-1 min-h-0 overflow-hidden relative flex flex-col"
                  : "p-6 md:p-10 max-w-7xl mx-auto w-full"
              )}>
                {children}
              </div>
            </main>
          );
        })()}
    </div>
  );
}
