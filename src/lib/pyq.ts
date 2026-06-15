export interface PYQQuestion {
  id: string;
  year: number;
  marks: number;
  question: string;
  subjectCode: string;
  chapterNumber: number;
  category: "MCQ" | "ExtraPractice" | "ThreeMarker" | "FiveMarker";
  officialAnswer?: string;
}

export let hardcodedPYQs: PYQQuestion[] = [
  // Science Class 10 (code: jesc1) Chapter 1: Chemical Reactions and Equations
  {
    id: "sc-10-ch1-q1",
    year: 2020,
    marks: 3,
    subjectCode: "jesc1",
    chapterNumber: 1,
    category: "ThreeMarker",
    question: "Identify the type of reactions taking place in each of the following cases and write the balanced chemical equation for the reactions.\n(a) Zinc reacts with silver nitrate to produce zinc nitrate and silver.\n(b) Potassium iodide reacts with lead nitrate to produce potassium nitrate and lead iodide.",
    officialAnswer: "(a) Displacement reaction. Zn + 2AgNO3 -> Zn(NO3)2 + 2Ag\n(b) Double displacement reaction. 2KI + Pb(NO3)2 -> 2KNO3 + PbI2"
  },
  {
    id: "sc-10-ch1-q2",
    year: 2018,
    marks: 5,
    subjectCode: "jesc1",
    chapterNumber: 1,
    category: "FiveMarker",
    question: "Define a balanced chemical equation. Why should an equation be balanced? Write the balanced chemical equation for the following reaction: Phosphorus burns in chlorine to form phosphorus pentachloride.",
    officialAnswer: "A balanced chemical equation has an equal number of atoms of each element on both reactants and products sides. It must be balanced to satisfy the Law of Conservation of Mass. Equation: P4 + 10Cl2 -> 4PCl5."
  },
  
  // Math Class 10 (code: jemh1) Chapter 8: Introduction to Trigonometry
  {
    id: "mh-10-ch8-q1",
    year: 2019,
    marks: 4,
    subjectCode: "jemh1",
    chapterNumber: 8,
    category: "FiveMarker",
    question: "Prove that: (sin A + cosec A)² + (cos A + sec A)² = 7 + tan² A + cot² A",
    officialAnswer: "Expand using (a+b)². sin²A + cosec²A + 2sinA*cosecA + cos²A + sec²A + 2cosA*secA. Since sinA*cosecA = 1 and cosA*secA = 1, and sin²A + cos²A = 1. The expression simplifies to 1 + cosec²A + 2 + sec²A + 2. Use identities cosec²A = 1+cot²A and sec²A = 1+tan²A. Total = 7 + tan²A + cot²A. Proved."
  },
  {
    id: "mh-10-ch8-q2",
    year: 2021,
    marks: 3,
    subjectCode: "jemh1",
    chapterNumber: 8,
    category: "ThreeMarker",
    question: "If 3 cot A = 4, check whether (1 - tan²A)/(1 + tan²A) = cos²A - sin²A or not.",
    officialAnswer: "cot A = 4/3, so tan A = 3/4. LHS: (1 - 9/16)/(1 + 9/16) = (7/16)/(25/16) = 7/25. RHS: cos A = 4/5, sin A = 3/5. cos²A - sin²A = 16/25 - 9/25 = 7/25. LHS = RHS."
  }
];

import { extractedPYQs } from './extracted-pyqs';

// Try to load dynamically generated PYQs if they exist
try {
  if (Array.isArray(extractedPYQs) && extractedPYQs.length > 0) {
    hardcodedPYQs = [...hardcodedPYQs, ...(extractedPYQs as PYQQuestion[])];
  }
} catch (e) {
  // Ignore
}

export function getPYQsForChapter(subjectCode: string, chapterNumber: number): PYQQuestion[] {
  return hardcodedPYQs.filter(q => q.subjectCode === subjectCode && q.chapterNumber === chapterNumber);
}
