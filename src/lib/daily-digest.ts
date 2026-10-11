// EduTrack Daily Digest Notification Engine
// Aggregates due SRS items, habit status, and motivational academic axioms for morning notifications

import { getDailyDueSRSItems } from "./srs-engine";
import { getOrInitializeMissions } from "./xp";

export interface DailyDigestSummary {
  headline: string;
  dueFlashcards: number;
  incompleteQuests: number;
  streakCount: number;
  motivationalAxiom: string;
  recommendedAction: string;
}

const AXIOMS = [
  "Small daily consistent efforts produce exponential academic mastery over time.",
  "Repetition is the mother of all retention. Review your spaced flashcards today!",
  "Difficult concepts become intuitive once you break them into first principles.",
  "Your focus today directly sculpts your confidence in the board examinations.",
];

export function generateDailyDigest(): DailyDigestSummary {
  let dueFlashcards = 0;
  let incompleteQuests = 0;
  let streakCount = 0;

  if (typeof window !== "undefined") {
    try {
      const srs = getDailyDueSRSItems();
      dueFlashcards = srs.dueItems?.length || 0;
    } catch {}

    try {
      const missions = getOrInitializeMissions();
      incompleteQuests = missions.filter((m) => !m.completed).length;
    } catch {}

    try {
      const storedStreak = localStorage.getItem("edutrack_streak");
      if (storedStreak) streakCount = parseInt(storedStreak, 10);
    } catch {}
  }

  const axiom = AXIOMS[Math.floor(Math.random() * AXIOMS.length)];

  return {
    headline: streakCount > 0 ? `🔥 Day ${streakCount} Study Streak in Progress!` : "🚀 Begin Your Study Voyage Today!",
    dueFlashcards,
    incompleteQuests,
    streakCount,
    motivationalAxiom: axiom,
    recommendedAction: dueFlashcards > 0 ? "Review Leitner flashcard queue" : "Read Chapter notes in Study Hub",
  };
}
