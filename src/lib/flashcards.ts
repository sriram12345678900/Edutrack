export interface Flashcard {
  id: string;
  front: string;
  back: string;
  status: "new" | "learning" | "mastered";
  lastReviewed?: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  createdAt: number;
  lastStudied?: number;
  cards: Flashcard[];
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
