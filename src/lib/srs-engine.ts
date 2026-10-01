// EduTrack SuperMemo-2 (SM-2) Spaced Repetition Engine
// Unifies Flashcards and Error Vault mistakes into an adaptive daily memory queue

import { getDecks, saveDeck, Flashcard } from "./flashcards";
import { getVaultMistakes, saveVaultMistakes, VaultMistake } from "./error-vault";
import { awardUserXP } from "./xp";

export type SRSType = "flashcard" | "mistake";
export type SRSQuality = 1 | 2 | 4 | 5; // 1 = Again, 2 = Hard, 4 = Good, 5 = Easy

export interface SRSItem {
  id: string;
  type: SRSType;
  deckId?: string;
  subject: string;
  chapter?: string;
  front: string; // Question or prompt
  back: string;  // Answer / explanation
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: number; // Unix timestamp ms
  lastReviewed?: number;
  consecutiveGood: number;
}

export function calculateNextInterval(
  quality: SRSQuality,
  currentEF: number = 2.5,
  currentInterval: number = 0,
  repetitions: number = 0
): { easeFactor: number; intervalDays: number; repetitions: number } {
  let nextRep = repetitions;
  let nextInterval = currentInterval;
  let nextEF = currentEF;

  if (quality >= 3) {
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = quality === 5 ? 4 : 3;
    } else {
      const modifier = quality === 5 ? 1.3 : (quality === 2 ? 1.0 : 1.15);
      nextInterval = Math.max(1, Math.round(currentInterval * currentEF * modifier));
    }
    nextRep++;
  } else {
    // Again / blackout: reset interval to 1 day
    nextRep = 0;
    nextInterval = 1;
  }

  // Calculate new Ease Factor (EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  nextEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (nextEF < 1.3) nextEF = 1.3;
  if (nextEF > 2.8) nextEF = 2.8;

  return {
    easeFactor: Math.round(nextEF * 100) / 100,
    intervalDays: nextInterval,
    repetitions: nextRep
  };
}

/**
 * Collects all items due for spaced repetition today across Flashcards and Error Vault
 */
export function getDailyDueSRSItems(): {
  dueItems: SRSItem[];
  totalFlashcardsDue: number;
  totalMistakesDue: number;
  masteredCount: number;
} {
  if (typeof window === "undefined") {
    return { dueItems: [], totalFlashcardsDue: 0, totalMistakesDue: 0, masteredCount: 0 };
  }

  const now = Date.now();
  const dueItems: SRSItem[] = [];
  let flashcardsDue = 0;
  let mistakesDue = 0;
  let masteredCount = 0;

  // 1. Process Flashcards
  const decks = getDecks();
  for (const deck of decks) {
    for (const card of deck.cards) {
      if (card.status === "mastered") {
        masteredCount++;
      }
      const nextDate = card.nextReviewDate || (card.lastReviewed ? card.lastReviewed + (card.interval || 1) * 86400000 : 0);
      const isDue = nextDate <= now;

      if (isDue) {
        flashcardsDue++;
        dueItems.push({
          id: card.id,
          type: "flashcard",
          deckId: deck.id,
          subject: deck.subject || "General",
          chapter: deck.title,
          front: card.front,
          back: card.back,
          easeFactor: card.easeFactor || 2.5,
          intervalDays: card.interval || 0,
          repetitions: card.repetition || 0,
          nextReviewDate: nextDate,
          lastReviewed: card.lastReviewed,
          consecutiveGood: (card.repetition || 0)
        });
      }
    }
  }

  // 2. Process Error Vault Mistakes
  const mistakes = getVaultMistakes();
  for (const mistake of mistakes) {
    if (mistake.status === "mastered") {
      masteredCount++;
      continue;
    }

    // Parse review timing or default to immediate review
    const anyMistake = mistake as any;
    const nextDate = anyMistake.nextReviewDate || (anyMistake.lastPracticed ? new Date(anyMistake.lastPracticed).getTime() + (anyMistake.intervalDays || 1) * 86400000 : 0);
    const isDue = nextDate <= now;

    if (isDue) {
      mistakesDue++;
      dueItems.push({
        id: mistake.id,
        type: "mistake",
        subject: mistake.subject,
        chapter: mistake.chapter,
        front: mistake.question,
        back: `${mistake.correctAnswer}\n\n💡 Explanation: ${mistake.explanation}`,
        easeFactor: anyMistake.easeFactor || 2.2,
        intervalDays: anyMistake.intervalDays || 0,
        repetitions: anyMistake.repetitions || 0,
        nextReviewDate: nextDate,
        lastReviewed: anyMistake.lastPracticed ? new Date(anyMistake.lastPracticed).getTime() : undefined,
        consecutiveGood: anyMistake.consecutiveGood || 0
      });
    }
  }

  return {
    dueItems,
    totalFlashcardsDue: flashcardsDue,
    totalMistakesDue: mistakesDue,
    masteredCount
  };
}

/**
 * Record a review for an SRS item and update local persistence
 */
export function recordSRSReview(
  item: SRSItem,
  quality: SRSQuality
): { nextIntervalDays: number; newlyMastered: boolean } {
  const calculation = calculateNextInterval(
    quality,
    item.easeFactor,
    item.intervalDays,
    item.repetitions
  );

  const now = Date.now();
  const nextReviewDate = now + calculation.intervalDays * 86400000;
  let newlyMastered = false;

  if (item.type === "flashcard" && item.deckId) {
    const decks = getDecks();
    const deck = decks.find(d => d.id === item.deckId);
    if (deck) {
      const card = deck.cards.find(c => c.id === item.id);
      if (card) {
        card.easeFactor = calculation.easeFactor;
        card.interval = calculation.intervalDays;
        card.repetition = calculation.repetitions;
        card.lastReviewed = now;
        card.nextReviewDate = nextReviewDate;

        if (calculation.repetitions >= 4 && quality >= 4) {
          card.status = "mastered";
          newlyMastered = true;
          awardUserXP(25);
        } else {
          card.status = "learning";
          awardUserXP(10);
        }
        saveDeck(deck);
      }
    }
  } else if (item.type === "mistake") {
    const mistakes = getVaultMistakes();
    const mistake = mistakes.find(m => m.id === item.id);
    if (mistake) {
      const anyMistake = mistake as any;
      anyMistake.easeFactor = calculation.easeFactor;
      anyMistake.intervalDays = calculation.intervalDays;
      anyMistake.repetitions = calculation.repetitions;
      anyMistake.lastPracticed = new Date(now).toISOString();
      anyMistake.nextReviewDate = nextReviewDate;
      anyMistake.consecutiveGood = (quality >= 4) ? (item.consecutiveGood + 1) : 0;

      // Master if student answered Good/Easy 3 times consecutively
      if (anyMistake.consecutiveGood >= 3) {
        mistake.status = "mastered";
        newlyMastered = true;
        awardUserXP(50);
      } else {
        mistake.retriesCount = (mistake.retriesCount || 0) + 1;
        awardUserXP(15);
      }
      saveVaultMistakes(mistakes);
    }
  }

  // Dispatch events to re-render any listening widgets
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("edutrack_srs_updated", { detail: { itemId: item.id, quality, nextIntervalDays: calculation.intervalDays } }));
    window.dispatchEvent(new CustomEvent("edutrack_vault_updated"));
    window.dispatchEvent(new CustomEvent("edutrack_flashcards_updated"));
  }

  return {
    nextIntervalDays: calculation.intervalDays,
    newlyMastered
  };
}
