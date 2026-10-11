// EduTrack "Surprise Me" Intelligent Activity Engine
// Dynamically analyzes student state (due spaced repetition items, pending missions,
// time of day, current streak) and computes the single highest-yield study action.

import { getDailyDueSRSItems } from "./srs-engine";
import { getOrInitializeMissions } from "./xp";

export interface SurpriseAction {
  route: string;
  label: string;
  reason: string;
  emoji: string;
  category: "memory" | "focus" | "practice" | "streak" | "quest";
  priority: number;
}

export function computeSurpriseAction(): SurpriseAction {
  if (typeof window === "undefined") {
    return {
      route: "/learn",
      label: "Explore NCERT Study Hub",
      reason: "Start your daily learning voyage!",
      emoji: "🚀",
      category: "focus",
      priority: 50,
    };
  }

  const actions: SurpriseAction[] = [];
  const now = new Date();
  const currentHour = now.getHours();

  // 1. Spaced Repetition Due Queue (Priority: Very High)
  try {
    const srs = getDailyDueSRSItems();
    if (srs.dueItems && srs.dueItems.length > 0) {
      actions.push({
        route: "/flashcards",
        label: `Review ${srs.dueItems.length} Due Flashcards`,
        reason: "Active recall today preserves 80% long-term retention according to the forgetting curve.",
        emoji: "⚡",
        category: "memory",
        priority: 95,
      });
    }
  } catch {}

  // 2. Pending Daily Quests
  try {
    const missions = getOrInitializeMissions();
    const incomplete = missions.filter((m) => !m.completed);
    if (incomplete.length > 0) {
      const topMission = incomplete[0];
      const route =
        topMission.id === "flashcards"
          ? "/flashcards"
          : topMission.id === "theory"
          ? "/learn"
          : "/learn";
      actions.push({
        route,
        label: `Complete Quest: ${topMission.title}`,
        reason: `Earn +${topMission.xp} XP to level up today's rank!`,
        emoji: "🎯",
        category: "quest",
        priority: 88,
      });
    }
  } catch {}

  // 3. Time-of-day contextual recommendations
  if (currentHour >= 21 || currentHour < 5) {
    // Late night -> Low cognitive strain revision
    actions.push({
      route: "/podcast",
      label: "Listen to an Audio AI Podcast",
      reason: "Auditory learning is gentle on visual fatigue before sleep.",
      emoji: "🎧",
      category: "focus",
      priority: 85,
    });
  } else if (currentHour >= 6 && currentHour <= 10) {
    // Morning peak alertness -> Hard problem solving / Math / Whiteboard
    actions.push({
      route: "/whiteboard",
      label: "Solve Complex Equations on AI Whiteboard",
      reason: "Morning cortisol primes the brain for analytical problem solving.",
      emoji: "📐",
      category: "practice",
      priority: 82,
    });
  } else if (currentHour >= 16 && currentHour <= 19) {
    // Afternoon / Evening -> Competitive Arena 1v1
    actions.push({
      route: "/arena",
      label: "Compete in Multiplayer Quiz Arena",
      reason: "Challenge classmates in real-time speed quiz duels!",
      emoji: "⚔️",
      category: "practice",
      priority: 80,
    });
  }

  // 4. Default Fallback
  actions.push({
    route: "/learn",
    label: "Explore Interactive Study Hub",
    reason: "Read dynamic CBSE chapter theories with instant self-check quizzes.",
    emoji: "📖",
    category: "focus",
    priority: 60,
  });

  actions.sort((a, b) => b.priority - a.priority);
  return actions[0];
}
