"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Sparkles, CheckCircle2, Circle, Clock, Loader2, Target, Plus, Flame, Trophy, Award, Lock } from "lucide-react";
import { 
  StudyPlan, 
  StudyDay, 
  getActivePlan, 
  savePlan, 
  deletePlan,
  getGamificationState,
  awardXP,
  updateStreak,
  checkAchievements,
  ACHIEVEMENTS,
  GamificationState
} from "@/lib/plans";

export default function StudyPlanner() {
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [subject, setSubject] = useState("");
  const [days, setDays] = useState("7");
  const [weakAreas, setWeakAreas] = useState("");
  const [examName, setExamName] = useState("Final Exams");

  // Gamification State
  const [gamification, setGamification] = useState<GamificationState>({
    totalXP: 0,
    level: 1,
    streakCount: 0,
    unlockedAchievements: []
  });
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number } | null>(null);
  const [floatingXps, setFloatingXps] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  useEffect(() => {
    setActivePlan(getActivePlan());
    setGamification(getGamificationState());
  }, []);

  const getLevelTitle = (lvl: number) => {
    if (lvl === 1) return "Novice Scholar ☕";
    if (lvl === 2) return "Dedicated Apprentice ⚡";
    if (lvl === 3) return "Intellectual Master 👑";
    if (lvl === 4) return "Venerable Sage 🧠";
    return "Academic Legend 🌟";
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !days) return;
    
    setIsGenerating(true);
    try {
      const classLevel = localStorage.getItem("edutrack_class") || "10";
      
      const res = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subject, 
          days: parseInt(days), 
          weakAreas, 
          examName,
          classLevel 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const newPlan: StudyPlan = {
        id: Date.now().toString(),
        title: `${days}-Day ${subject} Plan`,
        subject,
        daysTotal: parseInt(days),
        createdAt: Date.now(),
        schedule: data.schedule.map((d: any) => ({
          ...d,
          completed: false
        }))
      };
      
      savePlan(newPlan);
      setActivePlan(newPlan);
      
    } catch (err: any) {
      alert("Failed to generate plan: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleDayStatus = (dayIndex: number, event?: React.MouseEvent) => {
    if (!activePlan) return;
    
    const updatedDays = [...activePlan.schedule];
    const wasCompleted = updatedDays[dayIndex].completed;
    updatedDays[dayIndex].completed = !wasCompleted;
    
    const updatedPlan = { ...activePlan, schedule: updatedDays };
    savePlan(updatedPlan);
    setActivePlan(updatedPlan);

    // Compute XP gains (100 base + 2 XP per minute)
    const duration = updatedPlan.schedule[dayIndex].durationMins || 45;
    const earnedXp = 100 + duration * 2;
    const xpChange = wasCompleted ? -earnedXp : earnedXp;

    // Trigger floating floating text if completing
    if (event && !wasCompleted) {
      const x = event.clientX;
      const y = event.clientY;
      const id = Date.now() + Math.random();
      setFloatingXps(prev => [...prev, { id, text: `+${earnedXp} XP`, x, y }]);
      setTimeout(() => {
        setFloatingXps(prev => prev.filter(f => f.id !== id));
      }, 1000);
    }

    // Award XP
    const oldLevel = gamification.level;
    const { state: newState, leveledUp } = awardXP(xpChange);
    
    // Update streak if completing
    if (!wasCompleted) {
      const stateWithStreak = updateStreak(true);
      newState.streakCount = stateWithStreak.streakCount;
      newState.lastCompletedDate = stateWithStreak.lastCompletedDate;
    }

    // Check achievement unlocks
    const unlockedIds = checkAchievements(updatedPlan);
    if (unlockedIds.length > 0) {
      const latestState = getGamificationState();
      newState.totalXP = latestState.totalXP;
      newState.level = latestState.level;
      newState.unlockedAchievements = latestState.unlockedAchievements;
      
      // Floating achievement toast
      unlockedIds.forEach(id => {
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (ach) {
          const achId = Date.now() + Math.random();
          setFloatingXps(prev => [...prev, { id: achId, text: `🔓 Unlocked: ${ach.title}!`, x: window.innerWidth / 2, y: 150 }]);
          setTimeout(() => {
            setFloatingXps(prev => prev.filter(f => f.id !== achId));
          }, 2500);
        }
      });
    }

    setGamification(newState);

    if (leveledUp && newState.level > oldLevel) {
      setLevelUpData({ oldLevel, newLevel: newState.level });
      setShowLevelUpModal(true);
    }
  };

  const createNewPlan = () => {
    if (confirm("This will replace your current active plan. Continue?")) {
      if (activePlan) deletePlan(activePlan.id);
      setActivePlan(null);
    }
  };

  const progress = activePlan 
    ? (activePlan.schedule.filter(d => d.completed).length / activePlan.schedule.length) * 100 
    : 0;

  const currentLevelXp = gamification.totalXP % 500;
  const levelProgress = (currentLevelXp / 500) * 100;

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto relative">
      {/* ── Floating XP Notifications ── */}
      <div className="fixed inset-0 pointer-events-none z-[130]">
        <AnimatePresence>
          {floatingXps.map(f => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: f.y, x: f.x, scale: 0.8 }}
              animate={{ opacity: 1, y: f.y - 80, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-sm font-extrabold px-4 py-2 rounded-2xl shadow-xl border border-emerald-400 backdrop-blur-md"
            >
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── LEVEL UP MODAL ── */}
      <AnimatePresence>
        {showLevelUpModal && levelUpData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border-2 border-amber-500/50 rounded-[3rem] p-8 md:p-12 shadow-[0_0_80px_rgba(245,158,11,0.25)] max-w-md w-full text-center relative overflow-hidden ring-1 ring-white/10"
            >
              {/* Glowing back bubbles */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl"></div>

              {/* Floating Confetti Sparks */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 200, x: Math.random() * 300 - 150, opacity: 1, scale: Math.random() * 0.5 + 0.5 }}
                    animate={{ y: -200, x: Math.random() * 300 - 150, opacity: 0, rotate: 360 }}
                    transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                    className="absolute bottom-0 left-1/2 w-3 h-3 bg-amber-400 rounded-full"
                  />
                ))}
              </div>

              <div className="relative z-10 space-y-6">
                <div className="w-24 h-24 bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
                  <Award className="w-12 h-12 text-amber-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 tracking-tight">LEVEL UP!</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">New Rank Unlocked</p>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 shadow-inner">
                  <span className="text-slate-500 text-sm font-semibold block">Level {levelUpData.oldLevel} ➔ Level {levelUpData.newLevel}</span>
                  <span className="text-white font-extrabold text-lg mt-1 block tracking-wide">{getLevelTitle(levelUpData.newLevel)}</span>
                </div>

                <p className="text-sm text-slate-400 font-medium px-4">
                  You are gaining XP rapidly! Keep reading and answering mock tests to reach the Rank of **Academic Legend**!
                </p>

                <button
                  onClick={() => setShowLevelUpModal(false)}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-base font-extrabold rounded-2xl shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Continue Studying!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="relative p-8 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 tracking-tight flex items-center gap-4">
            <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2.5 rounded-2xl shadow-inner border border-emerald-200 dark:border-emerald-500/30">
              <CalendarIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
            </div>
            AI Study Planner
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium ml-1">
            Let AI schedule your study days for maximum retention.
          </p>
        </div>
        
        {activePlan && (
          <button 
            onClick={createNewPlan}
            className="relative z-10 flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-xl transition-all border border-slate-200 dark:border-slate-700 shadow-sm font-bold w-fit"
          >
            <Plus className="w-5 h-5" /> New Plan
          </button>
        )}
      </header>

      {!activePlan ? (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] p-8 md:p-12 shadow-2xl border border-slate-200/50 dark:border-white/10 max-w-2xl mx-auto ring-1 ring-slate-900/5 dark:ring-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create a Master Plan</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Fill in your exam details and let our AI coach build a day-by-day roadmap.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject</label>
                <select 
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium appearance-none"
                >
                  <option value="" disabled>Select Subject</option>
                  <option value="Science">Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="English">English</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Days Until Exam</label>
                <input 
                  type="number" 
                  min="1" max="30"
                  required
                  value={days}
                  onChange={e => setDays(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">What are you weak at? (Optional)</label>
              <input 
                placeholder="e.g. Light reflection, Trigonometry formulas"
                value={weakAreas}
                onChange={e => setWeakAreas(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-70 text-lg mt-4"
            >
              {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Sparkles className="w-6 h-6" /> Generate Smart Plan</>}
            </button>
          </form>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Progress & Gamification Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Level Panel */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-200/50 dark:border-white/10 sticky top-8 space-y-6 hover:shadow-indigo-500/10 transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Your Rank</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">{getLevelTitle(gamification.level)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Level {gamification.level} Progress</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{currentLevelXp} / 500 XP</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-500 text-xs font-bold">Total Exp Earned</span>
                <span className="text-slate-800 dark:text-white font-extrabold text-sm">{gamification.totalXP} XP</span>
              </div>
            </div>

            {/* Streak Widget */}
            <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-500/15 border border-orange-500/30 rounded-3xl p-6 shadow-lg shadow-orange-500/5 sticky top-[18rem] space-y-4 hover:shadow-orange-500/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0 shadow-inner">
                  <Flame className={`w-7 h-7 text-orange-500 ${gamification.streakCount > 0 ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Active Hot Streak</h3>
                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-0.5">{gamification.streakCount} Day{gamification.streakCount !== 1 ? 's' : ''} studied</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {gamification.streakCount > 0 
                  ? "Your daily learning streak is burning bright! Complete another study day tomorrow to keep it alive."
                  : "Start complete study days to ignite your hot learning streak!"}
              </p>
            </div>

            {/* Achievements Trophy Hall */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-200/50 dark:border-white/10 sticky top-[30rem] space-y-4 hover:shadow-purple-500/10 transition-shadow">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Trophy Milestones</h4>
              <div className="grid grid-cols-1 gap-2.5">
                {ACHIEVEMENTS.map((ach) => {
                  const isUnlocked = gamification.unlockedAchievements.includes(ach.id);
                  return (
                    <div 
                      key={ach.id} 
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                        isUnlocked 
                          ? 'bg-slate-50/50 dark:bg-slate-900/30 border-indigo-200 dark:border-indigo-900/40 shadow-sm' 
                          : 'bg-slate-50/20 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800/60 opacity-60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                        isUnlocked ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-1 ring-indigo-300/30' : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        {isUnlocked ? ach.icon : <Lock className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-xs text-slate-800 dark:text-white truncate">{ach.title}</h5>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                            isUnlocked ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}>
                            +{ach.points} XP
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{ach.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plan Completion Progress */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-200/50 dark:border-white/10 sticky top-[48rem] hover:shadow-teal-500/10 transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Plan Completion</h3>
                  <p className="text-sm text-slate-500">{activePlan.subject}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500">Completion</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
              Your Day-by-Day Schedule
            </h2>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[1.7rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:to-teal-100 dark:before:to-teal-900">
              <AnimatePresence>
              {activePlan.schedule.map((day, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, type: "spring" }}
                  key={idx} 
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  {/* Timeline Node */}
                  <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-white dark:border-slate-950 bg-emerald-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 cursor-pointer hover:scale-110 transition-transform z-10"
                       onClick={(e) => toggleDayStatus(idx, e)}>
                    {day.completed ? (
                      <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                    ) : (
                      <span className="font-bold text-lg">D{day.day}</span>
                    )}
                  </div>
                  
                  {/* Card */}
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl shadow-xl backdrop-blur-xl border transition-all duration-300 ${day.completed ? 'bg-slate-50/60 dark:bg-slate-900/40 border-emerald-200/50 dark:border-emerald-900/30 opacity-80' : 'bg-white/80 dark:bg-slate-900/70 border-slate-200/50 dark:border-white/10 hover:border-emerald-300/80 dark:hover:border-emerald-500/50 hover:shadow-emerald-500/10 hover:-translate-y-1 hover:scale-[1.01]'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${day.completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                        {day.completed ? 'Completed' : 'Upcoming'}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                        <Clock className="w-4 h-4" /> {day.durationMins}m
                      </span>
                    </div>
                    
                    <h3 className={`text-xl font-bold mb-4 ${day.completed ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                      {day.topic}
                    </h3>
                    
                    <ul className="space-y-2">
                      {Array.isArray(day.activities) ? day.activities.map((activity, actIdx) => (
                        <li key={actIdx} className={`flex items-start gap-2 text-sm ${day.completed ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                          <Circle className="w-2 h-2 mt-1.5 fill-current shrink-0 text-emerald-500" />
                          <span>{activity}</span>
                        </li>
                      )) : typeof day.activities === 'string' ? (
                        <li className={`flex items-start gap-2 text-sm ${day.completed ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                          <Circle className="w-2 h-2 mt-1.5 fill-current shrink-0 text-emerald-500" />
                          <span>{day.activities}</span>
                        </li>
                      ) : null}
                    </ul>

                    {!day.completed && (
                      <button 
                        onClick={(e) => toggleDayStatus(idx, e)}
                        className="mt-6 w-full py-2.5 rounded-xl border-2 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                      >
                        Mark as Complete
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
