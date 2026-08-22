"use client";

export interface DoubtAnswer {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: "Student" | "Teacher" | "Peer" | "AI Assistant";
  authorCountry: string;
  content: string;
  mathFormula?: string;
  createdAt: string;
  upvotes: number;
  isAccepted: boolean;
  isAiGenerated?: boolean;
}

export interface DoubtQuery {
  id: string;
  title: string;
  description: string;
  subject: "Physics" | "Mathematics" | "Chemistry" | "Biology" | "Computer Science" | "English";
  grade: string; // "Class 9", "Class 10", "Class 11", "Class 12", "College"
  examTarget?: string; // "CBSE", "JEE", "NEET", "ICSE", "SAT", "IGCSE"
  tags: string[];
  authorName: string;
  authorAvatar: string;
  authorCountry: string;
  authorCountryFlag: string;
  imageUrl?: string;
  mathFormula?: string;
  bountyXp: number;
  views: number;
  createdAt: string;
  answers: DoubtAnswer[];
  status: "open" | "solved" | "trending";
}

export const INITIAL_COMMUNITY_DOUBTS: DoubtQuery[] = [
  {
    id: "doubt-1",
    title: "Why does the magnetic field inside a long current-carrying solenoid remain uniform?",
    description: "In Class 10/12 Physics, we are taught that B = μ₀ n I inside a solenoid and lines are parallel straight lines. What physically causes the field to be constant across the whole cross-section and not decay towards the center?",
    subject: "Physics",
    grade: "Class 10",
    examTarget: "CBSE",
    tags: ["Electromagnetism", "Solenoids", "Magnetic Fields", "Ampere's Law"],
    authorName: "Aarav Sharma",
    authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aarav",
    authorCountry: "India",
    authorCountryFlag: "🇮🇳",
    mathFormula: "B = \\mu_0 n I",
    bountyXp: 150,
    views: 342,
    createdAt: "2 hours ago",
    status: "solved",
    answers: [
      {
        id: "ans-1",
        authorName: "Dr. Eleanor Vance",
        authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Eleanor",
        authorRole: "Teacher",
        authorCountry: "United Kingdom",
        content: "Every single circular loop of the solenoid produces a circular magnetic field. When multiple loops are packed tightly side-by-side, the radial components from adjacent loops cancel out due to symmetry, while the axial components add constructively! This produces parallel, uniformly spaced field lines throughout the core.",
        mathFormula: "\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{\\text{enc}} \\implies B L = \\mu_0 (N I) \\implies B = \\mu_0 n I",
        createdAt: "1 hour ago",
        upvotes: 24,
        isAccepted: true,
      },
      {
        id: "ans-2",
        authorName: "EduTrack AI Co-Pilot",
        authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EduAI",
        authorRole: "AI Assistant",
        authorCountry: "Global AI",
        content: "Core Intuition: Think of the solenoid as an infinite cylinder of surface current. Inside, by Ampèrian loop symmetry, no point is closer or farther from the symmetry axis in a way that creates a gradient. Outside, the cancellation is nearly complete (B ≈ 0).",
        createdAt: "2 hours ago",
        upvotes: 12,
        isAccepted: false,
        isAiGenerated: true,
      }
    ]
  },
  {
    id: "doubt-2",
    title: "How to solve for roots of quadratic equations with non-real discriminant in standard form?",
    description: "Given 2x² - 4x + 5 = 0, how do we break down the complex conjugate roots step by step using basic quadratic formula?",
    subject: "Mathematics",
    grade: "Class 11",
    examTarget: "JEE",
    tags: ["Algebra", "Complex Numbers", "Quadratic Equations"],
    authorName: "Sofia Rodriguez",
    authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sofia",
    authorCountry: "Spain",
    authorCountryFlag: "🇪🇸",
    mathFormula: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    bountyXp: 200,
    views: 512,
    createdAt: "4 hours ago",
    status: "solved",
    answers: [
      {
        id: "ans-3",
        authorName: "Kenji Sato",
        authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Kenji",
        authorRole: "Peer",
        authorCountry: "Japan",
        content: "Here are the steps:\n1. Identify a=2, b=-4, c=5.\n2. Calculate discriminant: D = b² - 4ac = (-4)² - 4(2)(5) = 16 - 40 = -24.\n3. Since D < 0, √(-24) = √24 · i = 2√6 · i.\n4. x = (4 ± 2√6 · i) / 4 = 1 ± (√6 / 2) · i.",
        mathFormula: "x = 1 \\pm \\frac{\\sqrt{6}}{2}i",
        createdAt: "3 hours ago",
        upvotes: 31,
        isAccepted: true,
      }
    ]
  },
  {
    id: "doubt-3",
    title: "Why is esterification with concentrated sulphuric acid reversible, and how do we maximize yield?",
    description: "In organic chemistry, when ethanoic acid reacts with absolute ethanol in the presence of acid catalyst, ethyl ethanoate and water are produced. Why is it an equilibrium reaction and what Le Chatelier principle conditions give 90%+ ester yield?",
    subject: "Chemistry",
    grade: "Class 10",
    examTarget: "CBSE",
    tags: ["Carbon Compounds", "Esters", "Reversible Reactions", "Equilibrium"],
    authorName: "Tariq Mansoor",
    authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Tariq",
    authorCountry: "UAE",
    authorCountryFlag: "🇦🇪",
    mathFormula: "\\text{CH}_3\\text{COOH} + \\text{C}_2\\text{H}_5\\text{OH} \\xrightleftharpoons{\\text{H}_2\\text{SO}_4} \\text{CH}_3\\text{COOC}_2\\text{H}_5 + \\text{H}_2\\text{O}",
    bountyXp: 120,
    views: 189,
    createdAt: "5 hours ago",
    status: "open",
    answers: [
      {
        id: "ans-4",
        authorName: "EduTrack AI Co-Pilot",
        authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EduAI",
        authorRole: "AI Assistant",
        authorCountry: "Global AI",
        content: "Key Mechanisms to Maximize Yield:\n1. Use Excess Reagent: Using an excess of ethanol shifts equilibrium to the product side.\n2. Remove Water as it Forms: Concentrated H₂SO₄ acts as both an acid catalyst and a dehydrating agent (absorbs water).\n3. Distillation: In industrial synthesis, ester is continuously distilled off.",
        createdAt: "5 hours ago",
        upvotes: 9,
        isAccepted: false,
        isAiGenerated: true,
      }
    ]
  },
  {
    id: "doubt-4",
    title: "What is the evolutionary advantage of double circulation in mammals over single circulation in fish?",
    description: "Fish have a 2-chambered heart with single circulation, whereas mammals and birds have a 4-chambered heart with double circulation (pulmonary + systemic). Why is high blood pressure essential for warm-blooded organisms?",
    subject: "Biology",
    grade: "Class 10",
    examTarget: "NEET",
    tags: ["Life Processes", "Circulation", "Heart Anatomy", "Evolution"],
    authorName: "Chloe Dupont",
    authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Chloe",
    authorCountry: "France",
    authorCountryFlag: "🇫🇷",
    bountyXp: 100,
    views: 275,
    createdAt: "7 hours ago",
    status: "open",
    answers: []
  }
];

const STORAGE_KEY = "edutrack_community_doubts_v1";

export function getStoredDoubts(): DoubtQuery[] {
  if (typeof window === "undefined") return INITIAL_COMMUNITY_DOUBTS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMMUNITY_DOUBTS));
      return INITIAL_COMMUNITY_DOUBTS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_COMMUNITY_DOUBTS;
  }
}

export function saveStoredDoubts(doubts: DoubtQuery[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doubts));
  } catch (e) {
    console.error("Failed to persist doubts", e);
  }
}
