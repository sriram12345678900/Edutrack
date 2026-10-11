// EduTrack Weekly Community Challenge Engine
// Rotates a nationwide co-op study objective every Monday with leaderboard progression

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  unit: string;
  xpReward: number;
  badgeName: string;
  badgeEmoji: string;
}

export const ROTATING_WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: "arena_conqueror",
    title: "National Quiz Arena Champion",
    description: "Compete and achieve victory in 5 live Multiplayer Quiz Arena battles this week.",
    targetCount: 5,
    unit: "Arena Duels Won",
    xpReward: 350,
    badgeName: "All-India Gladiator",
    badgeEmoji: "⚔️",
  },
  {
    id: "active_recall_titan",
    title: "SuperMemo-2 Spaced Recall Streak",
    description: "Clear and master 40 spaced repetition flashcards from your daily Leitner queue.",
    targetCount: 40,
    unit: "Cards Mastered",
    xpReward: 300,
    badgeName: "Memory Archon",
    badgeEmoji: "⚡",
  },
  {
    id: "feynman_mastery",
    title: "Feynman Simplicity Challenge",
    description: "Explain 3 complex CBSE science or mathematics concepts with 85%+ clarity score.",
    targetCount: 3,
    unit: "Concepts Explained",
    xpReward: 400,
    badgeName: "Feynman Laureate",
    badgeEmoji: "🧠",
  },
  {
    id: "whiteboard_mathematician",
    title: "Smart Whiteboard Theorem Sprint",
    description: "Draft, verify and solve 10 handwritten CBSE equations on the AI Whiteboard.",
    targetCount: 10,
    unit: "Equations Solved",
    xpReward: 250,
    badgeName: "Ramanujan Scholar",
    badgeEmoji: "📐",
  },
];

export function getActiveWeeklyChallenge(): { challenge: WeeklyChallenge; progress: number; completed: boolean } {
  // Rotate based on ISO week number
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
  const challenge = ROTATING_WEEKLY_CHALLENGES[weekNumber % ROTATING_WEEKLY_CHALLENGES.length];

  if (typeof window === "undefined") {
    return { challenge, progress: 0, completed: false };
  }

  const storedKey = `edutrack_weekly_challenge_${challenge.id}_w${weekNumber}`;
  const progress = parseInt(localStorage.getItem(storedKey) || "0", 10);
  const completed = progress >= challenge.targetCount;

  return { challenge, progress, completed };
}

export function incrementWeeklyProgress(count = 1) {
  if (typeof window === "undefined") return;
  const { challenge } = getActiveWeeklyChallenge();
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
  const storedKey = `edutrack_weekly_challenge_${challenge.id}_w${weekNumber}`;

  const current = parseInt(localStorage.getItem(storedKey) || "0", 10);
  const next = Math.min(challenge.targetCount, current + count);
  localStorage.setItem(storedKey, String(next));

  window.dispatchEvent(new CustomEvent("edutrack_weekly_challenge_progress", { detail: { next, target: challenge.targetCount } }));
}
