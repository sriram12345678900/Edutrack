// EduTrack Adaptive Difficulty Engine
// Monitors student performance in chapter quizzes, PYQs, and mocks,
// and dynamically calibrates question complexity from Foundation to Olympiad level.

export type DifficultyLevel = "easy" | "medium" | "hard" | "olympiad";

export interface TopicPerformance {
  topicKey: string; // e.g. "science_acids-bases"
  attempts: number;
  correctAnswers: number;
  accuracy: number; // 0 - 100
  currentDifficulty: DifficultyLevel;
  lastAttemptTimestamp: number;
  streak: number; // consecutive correct answers
}

const STORAGE_KEY = "edutrack_adaptive_performance";

export function getTopicPerformance(topicKey: string): TopicPerformance {
  if (typeof window === "undefined") {
    return {
      topicKey,
      attempts: 0,
      correctAnswers: 0,
      accuracy: 0,
      currentDifficulty: "medium",
      lastAttemptTimestamp: Date.now(),
      streak: 0,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map: Record<string, TopicPerformance> = raw ? JSON.parse(raw) : {};
    if (map[topicKey]) return map[topicKey];
  } catch (e) {
    console.error("Adaptive Difficulty load error:", e);
  }

  return {
    topicKey,
    attempts: 0,
    correctAnswers: 0,
    accuracy: 0,
    currentDifficulty: "medium",
    lastAttemptTimestamp: Date.now(),
    streak: 0,
  };
}

export function recordAdaptiveAttempt(
  topicKey: string,
  wasCorrect: boolean
): { updatedDifficulty: DifficultyLevel; performance: TopicPerformance } {
  if (typeof window === "undefined") {
    return {
      updatedDifficulty: "medium",
      performance: getTopicPerformance(topicKey),
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map: Record<string, TopicPerformance> = raw ? JSON.parse(raw) : {};
    const perf = map[topicKey] || {
      topicKey,
      attempts: 0,
      correctAnswers: 0,
      accuracy: 0,
      currentDifficulty: "medium",
      lastAttemptTimestamp: Date.now(),
      streak: 0,
    };

    perf.attempts += 1;
    if (wasCorrect) {
      perf.correctAnswers += 1;
      perf.streak += 1;
    } else {
      perf.streak = 0;
    }

    perf.accuracy = Math.round((perf.correctAnswers / perf.attempts) * 100);
    perf.lastAttemptTimestamp = Date.now();

    // Determine difficulty transitions
    if (perf.streak >= 4 || perf.accuracy >= 85) {
      if (perf.currentDifficulty === "easy") perf.currentDifficulty = "medium";
      else if (perf.currentDifficulty === "medium") perf.currentDifficulty = "hard";
      else if (perf.currentDifficulty === "hard") perf.currentDifficulty = "olympiad";
    } else if (perf.accuracy < 40 && perf.attempts >= 3) {
      if (perf.currentDifficulty === "olympiad") perf.currentDifficulty = "hard";
      else if (perf.currentDifficulty === "hard") perf.currentDifficulty = "medium";
      else if (perf.currentDifficulty === "medium") perf.currentDifficulty = "easy";
    }

    map[topicKey] = perf;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));

    window.dispatchEvent(
      new CustomEvent("edutrack_adaptive_updated", { detail: perf })
    );

    return { updatedDifficulty: perf.currentDifficulty, performance: perf };
  } catch (e) {
    console.error("Failed to record adaptive attempt:", e);
    return { updatedDifficulty: "medium", performance: getTopicPerformance(topicKey) };
  }
}

export function getDifficultyPromptModifier(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case "easy":
      return "DIFFICULTY REQUIREMENT: Target Beginner / Foundation level. Focus on direct recall of definitions and basic fundamental formula applications.";
    case "medium":
      return "DIFFICULTY REQUIREMENT: Target Standard CBSE Board level. Include direct conceptual applications and NCERT exemplar style questions.";
    case "hard":
      return "DIFFICULTY REQUIREMENT: Target Advanced / HOTS (Higher Order Thinking Skills). Include multi-step problem solving, case study analysis, and cross-concept reasoning.";
    case "olympiad":
      return "DIFFICULTY REQUIREMENT: Target NTSE / Olympiad / Competitive Foundation level. Rigorous, tricky distractor options, non-trivial mathematical derivations or deep conceptual traps.";
    default:
      return "";
  }
}
