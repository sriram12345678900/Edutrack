export interface Flashcard {
  id: string;
  front: string;
  back: string;
  status: "new" | "learning" | "mastered";
  lastReviewed?: number;
  interval?: number;      // Spacing interval in days
  repetition?: number;    // Number of successful consecutive reviews
  easeFactor?: number;    // SM-2 ease factor
  nextReviewDate?: number; // Timestamp for next review
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  createdAt: number;
  lastStudied?: number;
  cards: Flashcard[];
}

/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * @param quality 0-5 (0 = complete blackout, 5 = perfect response)
 * @param easeFactor Current ease factor (default 2.5)
 * @param interval Current interval in days (default 0)
 * @param repetition Current repetitions (default 0)
 */
export function calculateSM2(
  quality: number,
  easeFactor: number = 2.5,
  interval: number = 0,
  repetition: number = 0
) {
  let nextRepetition = repetition;
  let nextInterval = interval;
  let nextEaseFactor = easeFactor;

  if (quality >= 3) {
    // Correct response
    if (repetition === 0) {
      nextInterval = 1;
    } else if (repetition === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * easeFactor);
    }
    nextRepetition++;
  } else {
    // Incorrect response
    nextRepetition = 0;
    nextInterval = 1;
  }

  // Calculate new ease factor
  nextEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (nextEaseFactor < 1.3) nextEaseFactor = 1.3;

  return {
    easeFactor: nextEaseFactor,
    interval: nextInterval,
    repetition: nextRepetition
  };
}

const STORAGE_KEY = "edutrack_flashcards";

export function getDecks(): FlashcardDeck[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getDeck(id: string): FlashcardDeck | undefined {
  return getDecks().find(d => d.id === id);
}

export function saveDeck(deck: FlashcardDeck) {
  if (typeof window === "undefined") return;
  const decks = getDecks();
  const index = decks.findIndex(d => d.id === deck.id);
  
  if (index >= 0) {
    decks[index] = deck;
  } else {
    decks.push(deck);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

export function deleteDeck(id: string) {
  if (typeof window === "undefined") return;
  const decks = getDecks().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}
