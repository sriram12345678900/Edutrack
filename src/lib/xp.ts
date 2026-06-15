export interface DailyMission {
  id: string;
  title: string;
  desc: string;
  xp: number;
  completed: boolean;
}

export const DEFAULT_MISSIONS: DailyMission[] = [
  { id: "theory", title: "NCERT Scholar", desc: "Read a dynamic AI Textbook chapter page today", xp: 50, completed: false },
  { id: "flashcards", title: "Recall Wizard", desc: "Promote at least one flashcard in Leitner boxes", xp: 50, completed: false },
  { id: "notes", title: "Quick Summary", desc: "Load/generate a chapter revision summary", xp: 30, completed: false }
];

/**
 * Ensures daily missions are initialized and reset if the day has changed.
 */
export function getOrInitializeMissions(): DailyMission[] {
  if (typeof window === "undefined") return DEFAULT_MISSIONS;
  
  const storedMissions = localStorage.getItem("edutrack_daily_missions");
  const storedDate = localStorage.getItem("edutrack_missions_date");
  const todayStr = new Date().toDateString();

  if (!storedMissions || storedDate !== todayStr) {
    // Reset missions for the new day
    localStorage.setItem("edutrack_daily_missions", JSON.stringify(DEFAULT_MISSIONS));
    localStorage.setItem("edutrack_missions_date", todayStr);
    return DEFAULT_MISSIONS;
  }

  try {
    const parsed = JSON.parse(storedMissions) as DailyMission[];
    // Merge to ensure all default properties exist
    return DEFAULT_MISSIONS.map(def => {
      const found = parsed.find(p => p.id === def.id);
      return found ? { ...def, completed: found.completed } : def;
    });
  } catch {
    localStorage.setItem("edutrack_daily_missions", JSON.stringify(DEFAULT_MISSIONS));
    localStorage.setItem("edutrack_missions_date", todayStr);
    return DEFAULT_MISSIONS;
  }
}

/**
 * Core function to award XP to the user. Handles leveling logic.
 */
export function awardUserXP(amount: number): { newXp: number; newLevel: number; leveledUp: boolean } {
  if (typeof window === "undefined") return { newXp: 0, newLevel: 1, leveledUp: false };

  const storedXp = localStorage.getItem("edutrack_xp") || "0";
  const storedLevel = localStorage.getItem("edutrack_level") || "1";

  let xp = parseInt(storedXp, 10);
  let level = parseInt(storedLevel, 10);
  
  let newXp = xp + amount;
  let nextLvlThreshold = level * 200;
  let newLvl = level;
  let leveledUp = false;

  while (newXp >= nextLvlThreshold) {
    newXp -= nextLvlThreshold;
    newLvl += 1;
    nextLvlThreshold = newLvl * 200;
    leveledUp = true;
  }

  localStorage.setItem("edutrack_xp", newXp.toString());
  localStorage.setItem("edutrack_level", newLvl.toString());

  // Also add to cumulative total XP
  const storedTotalXp = localStorage.getItem("edutrack_total_xp") || "0";
  const newTotalXp = parseInt(storedTotalXp, 10) + amount;
  localStorage.setItem("edutrack_total_xp", newTotalXp.toString());

  // Broadcast change event
  window.dispatchEvent(new CustomEvent("edutrack_xp_updated", {
    detail: { xp: newXp, level: newLvl, leveledUp, amount }
  }));

  return { newXp, newLevel: newLvl, leveledUp };
}

/**
 * Completes a daily mission, awards its corresponding XP, and saves to localStorage.
 */
export function completeDailyMission(missionId: string): boolean {
  if (typeof window === "undefined") return false;

  const missions = getOrInitializeMissions();
  const missionIdx = missions.findIndex(m => m.id === missionId);

  if (missionIdx === -1 || missions[missionIdx].completed) {
    return false; // Already completed or invalid
  }

  // Mark as completed
  missions[missionIdx].completed = true;
  localStorage.setItem("edutrack_daily_missions", JSON.stringify(missions));

  // Award the mission's XP
  awardUserXP(missions[missionIdx].xp);

  return true;
}
