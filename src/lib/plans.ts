export interface StudyDay {
  day: number;
  date?: string;
  topic: string;
  activities: string[];
  durationMins: number;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  title: string;
  subject: string;
  daysTotal: number;
  createdAt: number;
  schedule: StudyDay[];
}

export interface GamificationState {
  totalXP: number;
  level: number;
  streakCount: number;
  lastCompletedDate?: string;
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', title: 'First Step', description: 'Completed your first study day!', icon: '🏆', points: 100 },
  { id: 'streak_3', title: 'High Voltage', description: 'Maintained a 3-day study streak!', icon: '⚡', points: 150 },
  { id: 'streak_7', title: 'Relentless', description: 'Maintained a 7-day study streak!', icon: '🔥', points: 300 },
  { id: 'complete_plan', title: 'Plan Conqueror', description: 'Completed 100% of an AI plan!', icon: '👑', points: 500 },
  { id: 'night_owl', title: 'Night Owl', description: 'Studied after 8:00 PM local time!', icon: '🦉', points: 100 },
];

const STORAGE_KEY = "edutrack_plans";

export function getPlans(): StudyPlan[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getActivePlan(): StudyPlan | null {
  const plans = getPlans();
  return plans.length > 0 ? plans[plans.length - 1] : null; // Return the most recent plan
}

export function savePlan(plan: StudyPlan) {
  if (typeof window === "undefined") return;
  const plans = getPlans();
  const index = plans.findIndex(p => p.id === plan.id);
  
  if (index >= 0) {
    plans[index] = plan;
  } else {
    plans.push(plan);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function deletePlan(id: string) {
  if (typeof window === "undefined") return;
  const plans = getPlans().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

// Gamification Persistence
export function getGamificationState(): GamificationState {
  if (typeof window === "undefined") {
    return { totalXP: 0, level: 1, streakCount: 0, unlockedAchievements: [] };
  }
  const data = localStorage.getItem("edutrack_gamification");
  return data ? JSON.parse(data) : { totalXP: 0, level: 1, streakCount: 0, unlockedAchievements: [] };
}

export function saveGamificationState(state: GamificationState) {
  if (typeof window === "undefined") return;
  localStorage.setItem("edutrack_gamification", JSON.stringify(state));
}

export function awardXP(amount: number): { state: GamificationState; leveledUp: boolean } {
  const state = getGamificationState();
  const oldLevel = state.level;
  
  state.totalXP = Math.max(0, state.totalXP + amount);
  state.level = Math.floor(state.totalXP / 500) + 1;
  
  const leveledUp = state.level > oldLevel;
  saveGamificationState(state);
  return { state, leveledUp };
}

export function updateStreak(isCompleting: boolean): GamificationState {
  const state = getGamificationState();
  const today = new Date().toISOString().split('T')[0];
  
  if (isCompleting) {
    if (state.lastCompletedDate === today) {
      // Already completed today, streak remains same
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (state.lastCompletedDate === yesterday) {
        state.streakCount += 1;
      } else {
        state.streakCount = 1;
      }
      state.lastCompletedDate = today;
    }
  }
  
  saveGamificationState(state);
  return state;
}

export function checkAchievements(plan: StudyPlan): string[] {
  const state = getGamificationState();
  const newlyUnlocked: string[] = [];
  
  const completedDays = plan.schedule.filter(d => d.completed).length;
  const isFinished = completedDays === plan.schedule.length;
  const hasFinishedDay = completedDays > 0;
  
  // 1. First Step
  if (hasFinishedDay && !state.unlockedAchievements.includes('first_step')) {
    state.unlockedAchievements.push('first_step');
    newlyUnlocked.push('first_step');
  }
  
  // 2. High Voltage
  if (state.streakCount >= 3 && !state.unlockedAchievements.includes('streak_3')) {
    state.unlockedAchievements.push('streak_3');
    newlyUnlocked.push('streak_3');
  }
  
  // 3. Relentless
  if (state.streakCount >= 7 && !state.unlockedAchievements.includes('streak_7')) {
    state.unlockedAchievements.push('streak_7');
    newlyUnlocked.push('streak_7');
  }
  
  // 4. Plan Conqueror
  if (isFinished && plan.schedule.length > 0 && !state.unlockedAchievements.includes('complete_plan')) {
    state.unlockedAchievements.push('complete_plan');
    newlyUnlocked.push('complete_plan');
  }
  
  // 5. Night Owl
  const currentHour = new Date().getHours();
  if (hasFinishedDay && currentHour >= 20 && !state.unlockedAchievements.includes('night_owl')) {
    state.unlockedAchievements.push('night_owl');
    newlyUnlocked.push('night_owl');
  }
  
  if (newlyUnlocked.length > 0) {
    newlyUnlocked.forEach(id => {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        state.totalXP += ach.points;
      }
    });
    state.level = Math.floor(state.totalXP / 500) + 1;
    saveGamificationState(state);
  }
  
  return newlyUnlocked;
}
