"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Sparkles, CheckCircle2, Circle, Clock, Loader2, Target, Plus, Flame, Trophy, Award, Lock, Printer } from "lucide-react";
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
  const [days, setDays] = useState("14");
  const [targetScore, setTargetScore] = useState("95");
  const [dailyHours, setDailyHours] = useState("3");
  const [weakAreas, setWeakAreas] = useState("");
  const [examName, setExamName] = useState("CBSE Board Exams");

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
    if (lvl === 1) return "Novice Scholar";
    if (lvl === 2) return "Dedicated Apprentice";
    if (lvl === 3) return "Intellectual Master";
    if (lvl === 4) return "Venerable Sage";
    return "Academic Legend";
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
          setFloatingXps(prev => [...prev, { id: achId, text: ` Unlocked: ${ach.title}!`, x: window.innerWidth / 2, y: 150 }]);
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
              className="dark:bg-slate-900 bg-slate-100 border-2 border-amber-500/50 rounded-[3rem] p-8 md:p-12 shadow-[0_0_80px_rgba(245,158,11,0.25)] max-w-md w-full text-center relative overflow-hidden ring-1 ring-white/10"
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
                  <Award className="w-12 h-12 dark:text-amber-400 text-amber-700" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 tracking-tight">LEVEL UP!</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">New Rank Unlocked</p>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 shadow-inner">
                  <span className="text-slate-500 text-sm font-semibold block">Level {levelUpData.oldLevel}  Level {levelUpData.newLevel}</span>
                  <span className="dark:text-white text-slate-900 font-extrabold text-lg mt-1 block tracking-wide">{getLevelTitle(levelUpData.newLevel)}</span>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium px-4">
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

      <header className="relative p-8 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 bg-slate-100 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 tracking-tight flex items-center gap-4">
            <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2.5 rounded-2xl shadow-inner border border-emerald-200 dark:border-emerald-500/30">
              <CalendarIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
            </div>
            AI Study Planner
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-500 dark:text-slate-400 font-medium ml-1">
            Let AI schedule your study days for maximum retention.
          </p>
        </div>
        
        {activePlan && (
          <div className="relative z-10 flex items-center gap-3 print:hidden">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-5 py-3 rounded-xl transition-all border border-indigo-200 dark:border-indigo-800 shadow-sm font-bold w-fit"
            >
              <Printer className="w-5 h-5" /> Export PDF
            </button>
            <button 
              onClick={createNewPlan}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-xl transition-all border border-slate-200 dark:border-slate-700 shadow-sm font-bold w-fit"
            >
              <Plus className="w-5 h-5" /> New Plan
            </button>
          </div>
        )}
      </header>

      {!activePlan ? (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          className="bg-white/80 dark:bg-slate-900/60 bg-slate-200/60 backdrop-blur-2xl rounded-[2rem] p-8 md:p-12 shadow-2xl border border-slate-200/50 dark:border-white/10 max-w-2xl mx-auto ring-1 ring-slate-900/5 dark:ring-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create a Master Plan</h2>
            <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 mt-2">Fill in your exam details and let our AI coach build a day-by-day roadmap.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subject</label>
                <select 
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="text-slate-900 dark:text-white w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xs font-semibold"
                >
                  <option value="" disabled>Select Subject</option>
                  <option value="Science">Science (Physics/Chem/Bio)</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="History">Social Science: History</option>
                  <option value="Geography">Social Science: Geography</option>
                  <option value="English">English Literature</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Score ({targetScore}%)</label>
                <input 
                  type="range" 
                  min="75" max="100" step="1"
                  value={targetScore}
                  onChange={e => setTargetScore(e.target.value)}
                  className="w-full accent-emerald-500 mt-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Daily Study ({dailyHours} hrs/day)</label>
                <input 
                  type="range" 
                  min="1" max="8" step="0.5"
                  value={dailyHours}
                  onChange={e => setDailyHours(e.target.value)}
                  className="w-full accent-emerald-500 mt-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Days Until Board Exam ({days} Days)</label>
              <input 
                type="range" 
                min="3" max="60" step="1"
                value={days}
                onChange={e => setDays(e.target.value)}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Panic-to-Peace Live Gauge */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">Pacing & Workload Gauge:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {((parseInt(targetScore) || 95) / 100) * 15 / ((parseInt(days) || 14) * (parseFloat(dailyHours) || 3)) < 0.35 
                    ? "🧘 Calm & Sustainable Pace" 
                    : ((parseInt(targetScore) || 95) / 100) * 15 / ((parseInt(days) || 14) * (parseFloat(dailyHours) || 3)) < 0.65 
                    ? "⚡ Optimal High-Yield Sprint" 
                    : "🔥 Intense Fast-Track Crunch"}
                </span>
              </div>
              <span className="text-xs font-mono font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
                ~{Math.round(((parseInt(days) || 14) * (parseFloat(dailyHours) || 3)) / 14)} hrs / chapter
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">What are you weak at? (Optional)</label>
              <input 
                placeholder="e.g. Light reflection, Trigonometry formulas"
                value={weakAreas}
                onChange={e => setWeakAreas(e.target.value)}
                className="text-slate-900 dark:text-white w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-70 text-sm mt-4"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Generate Custom Board Plan</>}
            </button>
          </form>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 print:block">
          {/* Progress & Gamification Sidebar */}
          <div className="lg:col-span-1 space-y-6 print:hidden">
            
            {/* Level Panel with Glowing Circular Ring */}
            <div className="bg-white/50 dark:bg-slate-900/40 bg-slate-200/40 backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl border border-slate-200/50 dark:border-white/10 sticky top-8 flex flex-col items-center group hover:shadow-indigo-500/20 transition-all">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-indigo-500" /> Your Rank
              </h3>
              <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-6">{getLevelTitle(gamification.level)}</p>

              {/* Glowing XP Ring */}
              <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle cx="50" cy="50" r="45" className="fill-none stroke-slate-200 dark:stroke-slate-800" strokeWidth="8" />
                  {/* Progress Glow */}
                  <circle cx="50" cy="50" r="45" className="fill-none stroke-indigo-500/30 blur-md" strokeWidth="12" strokeDasharray="283" strokeDashoffset={283 - (283 * levelProgress) / 100} strokeLinecap="round" />
                  {/* Active Progress */}
                  <circle cx="50" cy="50" r="45" className="fill-none stroke-indigo-500 transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * levelProgress) / 100} strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                    {gamification.level}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Level</span>
                </div>
              </div>

              <div className="text-center space-y-1 w-full mt-2">
                <div className="flex justify-between text-xs font-bold px-2">
                  <span className="text-slate-500">XP Progress</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{currentLevelXp} / 500</span>
                </div>
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
              <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {gamification.streakCount > 0 
                  ? "Your daily learning streak is burning bright! Complete another study day tomorrow to keep it alive."
                  : "Start complete study days to ignite your hot learning streak!"}
              </p>
            </div>

            {/* Achievements Trophy Hall */}
            <div className="bg-white/70 dark:bg-slate-900/70 bg-slate-200/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-200/50 dark:border-white/10 sticky top-[30rem] space-y-4 hover:shadow-purple-500/10 transition-shadow">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Trophy Milestones</h4>
              <div className="grid grid-cols-1 gap-2.5">
                {ACHIEVEMENTS.map((ach) => {
                  const isUnlocked = gamification.unlockedAchievements.includes(ach.id);
                  return (
                    <div 
                      key={ach.id} 
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                        isUnlocked 
                          ? 'bg-slate-50/50 dark:bg-slate-900/30 bg-slate-200/30 border-indigo-200 dark:border-indigo-900/40 shadow-sm' 
                          : 'bg-slate-50/20 dark:bg-slate-900/10 bg-slate-200/10 border-slate-100 dark:border-slate-800/60 opacity-60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                        isUnlocked ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-1 ring-indigo-300/30' : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        {isUnlocked ? ach.icon : <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-xs text-slate-800 dark:text-white truncate">{ach.title}</h5>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                            isUnlocked ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-500 dark:text-slate-400'
                          }`}>
                            +{ach.points} XP
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-400 truncate mt-0.5">{ach.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plan Completion Progress */}
            <div className="bg-white/70 dark:bg-slate-900/70 bg-slate-200/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-200/50 dark:border-white/10 sticky top-[48rem] hover:shadow-teal-500/10 transition-shadow">
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
            
            <div className="space-y-4 relative">
              <AnimatePresence>
              {activePlan.schedule.map((day, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, type: "spring" }}
                  key={idx} 
                  className="relative group"
                >
                  {/* Gantt-style Glassmorphic Card */}
                  <div className={`relative flex flex-col md:flex-row items-stretch md:items-center p-5 rounded-3xl shadow-xl backdrop-blur-xl border transition-all duration-300 gap-5 overflow-hidden ${day.completed ? 'bg-slate-50/40 dark:bg-slate-900/40 bg-slate-200/40 border-emerald-200/50 dark:border-emerald-900/30' : 'bg-white/60 dark:bg-slate-900/60 bg-slate-200/60 border-slate-200/50 dark:border-white/10 hover:border-emerald-300/80 dark:hover:border-emerald-500/50 hover:shadow-emerald-500/10'}`}>
                    
                    {/* Background Progress Bar (Gantt Fill) */}
                    <div className={`absolute top-0 left-0 h-full w-full opacity-10 ${day.completed ? 'bg-emerald-500' : 'bg-transparent'}`} style={{ width: day.completed ? '100%' : '0%' }}></div>
                    <div className={`absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-700`} style={{ width: day.completed ? '100%' : '0%' }}></div>

                    {/* Day Node */}
                    <div 
                      className={`flex items-center justify-center w-16 h-16 rounded-2xl shadow-inner shrink-0 cursor-pointer hover:scale-105 transition-all z-10 ${day.completed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-300'}`}
                      onClick={(e) => toggleDayStatus(idx, e)}
                    >
                      {day.completed ? (
                        <CheckCircle2 className="w-8 h-8" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Day</span>
                          <span className="font-extrabold text-xl leading-none">{day.day}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 z-10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-xl font-extrabold ${day.completed ? 'text-slate-500 dark:text-slate-400 line-through decoration-slate-400/50' : 'text-slate-900 dark:text-white'}`}>
                          {day.topic}
                        </h3>
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5" /> {day.durationMins}m
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(day.activities) ? day.activities.map((activity, actIdx) => (
                          <span key={actIdx} className={`text-xs px-2.5 py-1 rounded-lg border ${day.completed ? 'border-emerald-200/50 text-emerald-700/70 bg-emerald-50/50 dark:border-emerald-900/30 dark:text-emerald-400/70' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50'}`}>
                            {activity}
                          </span>
                        )) : typeof day.activities === 'string' ? (
                          <span className={`text-xs px-2.5 py-1 rounded-lg border ${day.completed ? 'border-emerald-200/50 text-emerald-700/70 bg-emerald-50/50 dark:border-emerald-900/30 dark:text-emerald-400/70' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50'}`}>
                            {day.activities}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Action */}
                    {!day.completed && (
                      <button 
                        onClick={(e) => toggleDayStatus(idx, e)}
                        className="shrink-0 md:ml-4 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:scale-105 transition-all text-sm z-10 bg-white/50 dark:bg-slate-900/50"
                      >
                        Complete
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
