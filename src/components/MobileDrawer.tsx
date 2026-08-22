"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, BookOpen, GraduationCap, Compass, MessageSquare, Camera, Calendar, 
  Sparkles, Palette, Timer, Zap, Users, Award, Target, Trophy, Settings, 
  LogOut, X, Search, ChevronRight, Shield, Moon, Sun, CheckCircle2, User, Video, Gamepad2,
  Globe, Mic, Radio, GitFork, Sliders, FileText, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_PORTAL_ROUTE } from "@/lib/admin";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  displayName: string;
  initials: string;
  userLevel: number;
  userXp: number;
  photoURL?: string | null;
  friendCode?: string;
  email?: string | null;
  userRole?: string;
  onOpenTour: () => void;
  onLogout: () => void;
}

interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: any;
  badge?: string;
  color: string;
  category: "Virtual School" | "Core Space" | "AI Study Lab" | "Testing & Analytics";
}

const ALL_TOOLS: NavItem[] = [
  // Virtual School & Bridge
  { href: "/community", label: "Global Doubts Forum", description: "Worldwide academic query exchange", icon: Globe, badge: "World", color: "from-blue-600 to-indigo-700", category: "Virtual School" },
  { href: "/arena", label: "Live Quiz Arena", description: "Multiplayer battle royale with powerups", icon: Gamepad2, badge: "Live", color: "from-amber-600 to-red-600", category: "Virtual School" },
  { href: "/classroom", label: "Student Classroom", description: "Enrolled classes, stream & homework", icon: GraduationCap, badge: "School", color: "from-blue-600 to-indigo-700", category: "Virtual School" },
  { href: "/teacher", label: "Teacher Command", description: "Manage classes, live host & grading", icon: Video, badge: "Portal", color: "from-purple-600 to-pink-600", category: "Virtual School" },
  { href: "/parent", label: "Parent AI Digest", description: "Weekly progress report & WhatsApp alerts", icon: Shield, badge: "Parent", color: "from-teal-600 to-emerald-700", category: "Virtual School" },

  // Core Space
  { href: "/dashboard", label: "Dashboard", description: "Missions, Streaks, Recall", icon: Home, badge: "Main", color: "from-blue-500 to-indigo-600", category: "Core Space" },
  { href: "/skill-tree", label: "Skill Trees", description: "RPG Topic & Prerequisite mastery", icon: GitFork, badge: "RPG", color: "from-indigo-600 to-purple-600", category: "Core Space" },
  { href: "/learn", label: "Subjects Hub", description: "CBSE Curriculum & Notes", icon: BookOpen, color: "from-indigo-500 to-purple-600", category: "Core Space" },
  { href: "/ncert", label: "NCERT Books", description: "PDF Reader & Smart AI", icon: GraduationCap, color: "from-purple-500 to-pink-600", category: "Core Space" },
  { href: "/formulas", label: "Formulas Hub", description: "Quick formulas & cheat sheets", icon: Compass, badge: "Master", color: "from-amber-500 to-orange-600", category: "Core Space" },

  // AI Study Lab
  { href: "/viva", label: "AI Voice Viva", description: "Conversational oral examination simulator", icon: Mic, badge: "Voice", color: "from-purple-600 to-indigo-600", category: "AI Study Lab" },
  { href: "/feynman", label: "Feynman Lab", description: "Teach concepts to an AI novice student", icon: Brain, badge: "Teach", color: "from-emerald-500 to-teal-600", category: "AI Study Lab" },
  { href: "/podcast", label: "AI Podcasts", description: "2-host audio discussion generator", icon: Radio, badge: "Audio", color: "from-pink-500 to-purple-600", category: "AI Study Lab" },
  { href: "/sandbox", label: "Simulations Lab", description: "Interactive physics & optics experiments", icon: Sliders, badge: "Lab", color: "from-cyan-500 to-blue-600", category: "AI Study Lab" },
  { href: "/tutor", label: "AI Tutor", description: "NCERT & Socratic AI Mentor", icon: MessageSquare, badge: "AI", color: "from-cyan-500 to-blue-600", category: "AI Study Lab" },
  { href: "/lens", label: "Doubt Lens", description: "Instant Camera Scanner", icon: Camera, badge: "Live", color: "from-emerald-500 to-teal-600", category: "AI Study Lab" },
  { href: "/plan", label: "Study Planner", description: "AI Timetable & Exam Prep", icon: Calendar, color: "from-blue-600 to-indigo-700", category: "AI Study Lab" },
  { href: "/flashcards", label: "AI Flashcards", description: "Active recall Leitner boxes", icon: Sparkles, color: "from-fuchsia-500 to-pink-600", category: "AI Study Lab" },
  { href: "/whiteboard", label: "Whiteboard", description: "Smart Pen & AI Solver Canvas", icon: Palette, color: "from-violet-500 to-purple-700", category: "AI Study Lab" },
  { href: "/pomodoro", label: "Pomodoro Timer", description: "Focus sessions & Forest growth", icon: Timer, color: "from-rose-500 to-red-600", category: "AI Study Lab" },

  // Testing & Analytics
  { href: "/exam-generator", label: "Exam Generator", description: "1-Click CBSE Question Paper & Rubric", icon: FileText, badge: "Print", color: "from-emerald-600 to-teal-600", category: "Testing & Analytics" },
  { href: "/games", label: "EduArcade", description: "Periodic blitz, formula rush & speed math", icon: Gamepad2, badge: "XP", color: "from-pink-500 to-rose-600", category: "Testing & Analytics" },
  { href: "/groups", label: "StudyCircles", description: "Multiplayer audio & live duels", icon: Users, color: "from-emerald-600 to-cyan-600", category: "Testing & Analytics" },
  { href: "/pyq", label: "PYQs Hub", description: "Previous Year Questions vault", icon: Award, color: "from-indigo-500 to-blue-600", category: "Testing & Analytics" },
  { href: "/analytics", label: "Performance", description: "Detailed mastery & radar analytics", icon: Target, color: "from-purple-600 to-indigo-600", category: "Testing & Analytics" },
  { href: "/trophies", label: "Achievements", description: "XP Badges, Ranks & Trophies", icon: Trophy, color: "from-yellow-500 to-amber-600", category: "Testing & Analytics" },
];

export default function MobileDrawer({
  isOpen,
  onClose,
  displayName,
  initials,
  userLevel,
  userXp,
  photoURL,
  friendCode,
  email,
  userRole,
  onOpenTour,
  onLogout,
}: MobileDrawerProps) {
  const pathname = usePathname() || "";
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    let tools = ALL_TOOLS.filter(item => {
      if (item.href === "/teacher" && userRole !== "teacher") return false;
      if (item.href === "/classroom" && userRole === "teacher") return false;
      if (item.href === ADMIN_PORTAL_ROUTE && userRole !== "admin") return false;
      if (userRole === "admin" && item.href !== ADMIN_PORTAL_ROUTE) return false;
      return true;
    });

    if (!searchQuery.trim()) return tools;
    const q = searchQuery.toLowerCase();
    return tools.filter(
      t => t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [searchQuery, userRole]);

  const categories: ("Core Space" | "AI Study Lab" | "Testing & Analytics")[] = [
    "Core Space",
    "AI Study Lab",
    "Testing & Analytics",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Slide-Up Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-h-[88vh] bg-white dark:bg-[#060814] bg-[#f8fafc] text-slate-900 dark:text-slate-100 rounded-t-[2.5rem] border-t border-slate-200/60 dark:border-white/15 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Ambient Top Glow */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            {/* Header & Drag Handle */}
            <div className="p-4 pb-2 flex flex-col items-center shrink-0 border-b border-slate-200/50 dark:border-white/5">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full mb-3 cursor-grab" onClick={onClose} />
              
              <div className="flex items-center justify-between w-full px-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-none">EduTrack OS</h3>
                    <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5">Explore All Features</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-all active:scale-95"
                  aria-label="Close Explore Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* User Profile Card */}
              <div className="p-3.5 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 dark:border-white/10 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {photoURL ? (
                      <img src={photoURL} alt={displayName} className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/50 shadow" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-md border border-white/20">
                        {initials}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-black shadow">
                      L{userLevel}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-black text-sm text-slate-900 dark:text-white truncate">{displayName}</p>
                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-mono font-bold truncate">
                      {friendCode || (email ? email.split("@")[0] : "Scholar")}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 flex-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${Math.min(100, (userXp % 500) / 5)}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-black text-slate-500">{userXp} XP</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTour();
                    }}
                    className="px-2.5 py-1 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-extrabold text-[10px] border border-indigo-500/30 flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>Tour</span>
                  </button>
                  <Link
                    href="/setup"
                    onClick={onClose}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-[10px] border border-slate-200/60 dark:border-white/10 flex items-center gap-1 text-center justify-center active:scale-95 transition-all"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Setup</span>
                  </Link>
                </div>
              </div>

              {/* Instant Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search all 12+ AI tools, books & features..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Categorized Tools Grid */}
              {searchQuery.trim() ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Search Results ({filteredTools.length})</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {filteredTools.map((tool) => {
                      const Icon = tool.icon;
                      const isActive = pathname === tool.href || (tool.href !== "/dashboard" && pathname.startsWith(tool.href + "/"));
                      return (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={onClose}
                          className={cn(
                            "p-3 rounded-2xl border transition-all flex flex-col justify-between relative group active:scale-98",
                            isActive
                              ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-900 dark:text-indigo-200"
                              : "bg-slate-50 dark:bg-white/[0.03] border-slate-200/60 dark:border-white/5 hover:border-indigo-500/30"
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-sm", tool.color)}>
                              <Icon className="w-4 h-4" />
                            </div>
                            {tool.badge && (
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-500 border border-indigo-500/30">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">{tool.label}</p>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{tool.description}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                categories.map((catName) => {
                  const toolsInCat = ALL_TOOLS.filter(t => t.category === catName);
                  return (
                    <div key={catName} className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
                        {catName}
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        {toolsInCat.map((tool) => {
                          const Icon = tool.icon;
                          const isActive = pathname === tool.href || (tool.href !== "/dashboard" && pathname.startsWith(tool.href + "/"));
                          return (
                            <Link
                              key={tool.href}
                              href={tool.href}
                              onClick={onClose}
                              className={cn(
                                "p-3 rounded-2xl border transition-all flex flex-col justify-between relative group active:scale-98 shadow-sm",
                                isActive
                                  ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-900 dark:text-indigo-200"
                                  : "bg-slate-50 dark:bg-white/[0.03] border-slate-200/60 dark:border-white/5 hover:border-indigo-500/30"
                              )}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-sm", tool.color)}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                {tool.badge && (
                                  <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-500 border border-indigo-500/30">
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">{tool.label}</p>
                                <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{tool.description}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Bottom Quick Logout Action */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex gap-2">
                <Link
                  href="/setup"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Account Setup</span>
                </Link>
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20 font-bold text-xs text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
