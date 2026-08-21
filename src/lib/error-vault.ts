import { awardUserXP } from "./xp";

export type MistakeType = "conceptual" | "calculation" | "misread" | "formula";

export interface VaultMistake {
  id: string;
  subject: string;
  chapter: string;
  question: string;
  userAnswer?: string;
  correctAnswer: string;
  explanation: string;
  mistakeType: MistakeType;
  status: "active" | "mastered";
  retriesCount: number;
  dateAdded: string;
  lastPracticed?: string;
}

const STORAGE_KEY = "edutrack_error_vault";

export const INITIAL_MISTAKES: VaultMistake[] = [
  {
    id: "err-demo-1",
    subject: "Science",
    chapter: "Chemical Reactions & Equations",
    question: "Why is respiration considered an exothermic reaction?",
    userAnswer: "Because it absorbs heat from the surrounding environment during breathing.",
    correctAnswer: "Respiration releases energy because glucose oxidizes to form carbon dioxide, water, and ATP/heat energy.",
    explanation: "Exothermic reactions release energy (heat/ATP). In respiration, C6H12O6 + 6O2 ↑ 6CO2 + 6H2O + Energy.",
    mistakeType: "conceptual",
    status: "active",
    retriesCount: 0,
    dateAdded: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "err-demo-2",
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    question: "Find the discriminant of 2x² - 4x + 3 = 0 and describe the nature of its roots.",
    userAnswer: "D = 16 - 24 = -8, so two real and unequal roots.",
    correctAnswer: "D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Since D < 0 there are NO REAL ROOTS.",
    explanation: "When D < 0 the quadratic equation has imaginary / no real roots. D > 0 yields two distinct real roots.",
    mistakeType: "calculation",
    status: "active",
    retriesCount: 1,
    dateAdded: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: "err-demo-3",
    subject: "Science",
    chapter: "Light - Reflection and Refraction",
    question: "An object is placed at 2F₁ of a convex lens. Where is the image formed?",
    userAnswer: "Between F₂ and 2F₂",
    correctAnswer: "At 2F₂ on the other side of the lens (Real, Inverted, Same Size).",
    explanation: "When object is at 2F of a convex lens, the image is formed at 2F on the opposite side with magnification m = -1.",
    mistakeType: "formula",
    status: "active",
    retriesCount: 0,
    dateAdded: new Date(Date.now() - 43200000).toISOString()
  }
];

export function getVaultMistakes(): VaultMistake[] {
  if (typeof window === "undefined") return INITIAL_MISTAKES;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MISTAKES));
    return INITIAL_MISTAKES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_MISTAKES;
  }
}

export function saveVaultMistakes(mistakes: VaultMistake[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
  window.dispatchEvent(new CustomEvent("edutrack_vault_updated", { detail: { count: mistakes.length } }));
}

export function recordMistake(mistake: Omit<VaultMistake, "id" | "dateAdded" | "status" | "retriesCount">): VaultMistake {
  const current = getVaultMistakes();
  
  const existingIdx = current.findIndex(m => m.question.trim().toLowerCase() === mistake.question.trim().toLowerCase());
  
  if (existingIdx !== -1) {
    current[existingIdx] = {
      ...current[existingIdx],
      ...mistake,
      status: "active",
      retriesCount: current[existingIdx].retriesCount + 1,
      lastPracticed: new Date().toISOString()
    };
    saveVaultMistakes(current);
    return current[existingIdx];
  }

  const newMistake: VaultMistake = {
    ...mistake,
    id: "err-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    status: "active",
    retriesCount: 0,
    dateAdded: new Date().toISOString()
  };

  const updated = [newMistake, ...current];
  saveVaultMistakes(updated);
  return newMistake;
}

export function markMistakeMastered(id: string): { success: boolean; xpAwarded: number } {
  const current = getVaultMistakes();
  const index = current.findIndex(m => m.id === id);
  if (index === -1) return { success: false, xpAwarded: 0 };

  current[index].status = "mastered";
  current[index].lastPracticed = new Date().toISOString();
  saveVaultMistakes(current);

  awardUserXP(50);

  return { success: true, xpAwarded: 50 };
}

export function deleteVaultMistake(id: string): void {
  const current = getVaultMistakes();
  const updated = current.filter(m => m.id !== id);
  saveVaultMistakes(updated);
}