import { awardUserXP } from "./xp";

export interface ConceptMicroQuiz {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ConceptNode {
  id: string;
  title: string;
  chapter: string;
  subject: "Science" | "Mathematics" | "Social Science";
  classLevel: number;
  description: string;
  keyPoints: string[];
  formula?: string;
  prerequisites: string[]; // Node IDs that must be understood first
  x: number; // Percentage coordinate (0 - 100)
  y: number; // Percentage coordinate (0 - 100)
  tier: number; // 1 = Fundamentals, 2 = Intermediate, 3 = Advanced, 4 = Board Master
  quiz: ConceptMicroQuiz;
}

export const MINDMAP_CHAPTERS: { subject: string; chapter: string; nodes: ConceptNode[] }[] = [
  {
    subject: "Science",
    chapter: "Chemical Reactions & Equations",
    nodes: [
      {
        id: "chem-1",
        title: "Physical vs Chemical Changes",
        chapter: "Chemical Reactions & Equations",
        subject: "Science",
        classLevel: 10,
        description: "Understanding chemical transformation where chemical bonds break and new substances form.",
        keyPoints: [
          "Change in state, color, temperature, or gas evolution indicates a chemical reaction.",
          "Law of Conservation of Mass: Mass of reactants = Mass of products."
        ],
        prerequisites: [],
        x: 20,
        y: 20,
        tier: 1,
        quiz: {
          question: "Which of the following is a definitive observation of a chemical change?",
          options: [
            "Melting of ice into liquid water",
            "Evolution of hydrogen gas with a pop sound",
            "Dissolving sugar in warm milk",
            "Tearing a piece of paper"
          ],
          correctAnswer: "Evolution of hydrogen gas with a pop sound",
          explanation: "Evolution of a new gas with chemical properties confirms a chemical change."
        }
      },
      {
        id: "chem-2",
        title: "Balancing Chemical Equations",
        chapter: "Chemical Reactions & Equations",
        subject: "Science",
        classLevel: 10,
        description: "Equating atoms on LHS and RHS to satisfy the Law of Conservation of Mass.",
        keyPoints: [
          "Count atoms of each element on reactant and product sides.",
          "Use integer coefficients; never change chemical sub-indices (e.g. H₂O remains H₂O)."
        ],
        formula: "aA + bB → cC + dD",
        prerequisites: ["chem-1"],
        x: 50,
        y: 20,
        tier: 2,
        quiz: {
          question: "What are the stoichiometric coefficients (x, y, z) for: xFe + yH₂O → Fe₃O₄ + zH₂?",
          options: ["3, 4, 4", "1, 2, 2", "3, 2, 2", "2, 3, 3"],
          correctAnswer: "3, 4, 4",
          explanation: "3Fe + 4H₂O → Fe₃O₄ + 4H₂ balances 3 iron, 8 hydrogen, and 4 oxygen atoms."
        }
      },
      {
        id: "chem-3",
        title: "Combination & Decomposition",
        chapter: "Chemical Reactions & Equations",
        subject: "Science",
        classLevel: 10,
        description: "Synthesis of single product from multiple reactants vs breakdown of single compound.",
        keyPoints: [
          "Combination: A + B → AB (e.g., Quicklime + Water → Slaked Lime).",
          "Thermal Decomposition: CaCO₃ → CaO + CO₂.",
          "Photolytic Decomposition: 2AgCl → 2Ag + Cl₂ (Black & white photography)."
        ],
        prerequisites: ["chem-2"],
        x: 25,
        y: 55,
        tier: 2,
        quiz: {
          question: "Which reaction is used in black-and-white photography?",
          options: [
            "Decomposition of silver chloride by sunlight",
            "Thermal decomposition of lead nitrate",
            "Combination of calcium oxide with water",
            "Electrolysis of acidified water"
          ],
          correctAnswer: "Decomposition of silver chloride by sunlight",
          explanation: "2AgCl(s) + Sunlight → 2Ag(s) + Cl₂(g) is a photolytic decomposition reaction."
        }
      },
      {
        id: "chem-4",
        title: "Displacement & Double Displacement",
        chapter: "Chemical Reactions & Equations",
        subject: "Science",
        classLevel: 10,
        description: "Reactivity series displacement and mutual exchange of ions forming precipitates.",
        keyPoints: [
          "Single displacement: Highly reactive metal displaces lesser reactive metal.",
          "Double displacement: Exchange of ions (e.g., Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl)."
        ],
        prerequisites: ["chem-2"],
        x: 75,
        y: 55,
        tier: 3,
        quiz: {
          question: "What precipitate is formed when sodium sulphate reacts with barium chloride?",
          options: ["White BaSO₄", "Yellow PbI₂", "Blue Cu(OH)₂", "Black FeS"],
          correctAnswer: "White BaSO₄",
          explanation: "Na₂SO₄(aq) + BaCl₂(aq) → BaSO₄(s)↓ (white precipitate) + 2NaCl(aq)."
        }
      },
      {
        id: "chem-5",
        title: "Redox, Corrosion & Rancidity",
        chapter: "Chemical Reactions & Equations",
        subject: "Science",
        classLevel: 10,
        description: "Simultaneous oxidation and reduction; environmental prevention methods.",
        keyPoints: [
          "Oxidation: Gain of oxygen or loss of electrons / hydrogen.",
          "Reduction: Loss of oxygen or gain of electrons / hydrogen.",
          "Corrosion prevention: Galvanization, painting, electroplating.",
          "Rancidity prevention: Flushing with Nitrogen gas, adding antioxidants."
        ],
        formula: "CuO + H₂ → Cu + H₂O (CuO is reduced, H₂ is oxidized)",
        prerequisites: ["chem-3", "chem-4"],
        x: 50,
        y: 85,
        tier: 4,
        quiz: {
          question: "In the reaction ZnO + C → Zn + CO, which substance is oxidized and which is the reducing agent?",
          options: [
            "C is oxidized and C is the reducing agent",
            "ZnO is oxidized and Zn is the reducing agent",
            "C is reduced and ZnO is the oxidizing agent",
            "CO is oxidized and C is the reducing agent"
          ],
          correctAnswer: "C is oxidized and C is the reducing agent",
          explanation: "Carbon gains oxygen (oxidized) and acts as the reducing agent by reducing ZnO to Zn."
        }
      }
    ]
  },
  {
    subject: "Science",
    chapter: "Light - Reflection and Refraction",
    nodes: [
      {
        id: "opt-1",
        title: "Laws of Reflection & Spherical Mirrors",
        chapter: "Light - Reflection and Refraction",
        subject: "Science",
        classLevel: 10,
        description: "Incident, reflected rays and normal in same plane; angle i = angle r.",
        keyPoints: [
          "Concave mirror: Converging, forms real inverted (or virtual erect when u < f).",
          "Convex mirror: Diverging, always forms virtual erect diminished image."
        ],
        formula: "f = R / 2",
        prerequisites: [],
        x: 20,
        y: 25,
        tier: 1,
        quiz: {
          question: "Why are convex mirrors preferred as rear-view mirrors in vehicles?",
          options: [
            "They give an erect, diminished image and a wider field of view",
            "They form magnified real images of distant vehicles",
            "They have a small focal length and high convergence",
            "They absorb glare from headlights at night"
          ],
          correctAnswer: "They give an erect, diminished image and a wider field of view",
          explanation: "Convex mirrors always produce virtual, erect, and diminished images covering a wide rear field."
        }
      },
      {
        id: "opt-2",
        title: "Mirror Formula & Magnification",
        chapter: "Light - Reflection and Refraction",
        subject: "Science",
        classLevel: 10,
        description: "Cartesian sign convention and algebraic calculation of image positions.",
        keyPoints: [
          "Mirror formula: 1/v + 1/u = 1/f.",
          "Magnification: m = -v/u = h_i / h_o."
        ],
        formula: "1/v + 1/u = 1/f,  m = -v/u",
        prerequisites: ["opt-1"],
        x: 50,
        y: 25,
        tier: 2,
        quiz: {
          question: "If magnification m = -1 for a concave mirror, where is the object located?",
          options: ["At the Center of Curvature C", "At the Focus F", "Between P and F", "Beyond C"],
          correctAnswer: "At the Center of Curvature C",
          explanation: "At C, image is real, inverted and same size (m = -1, v = u)."
        }
      },
      {
        id: "opt-3",
        title: "Refraction & Snell's Law",
        chapter: "Light - Reflection and Refraction",
        subject: "Science",
        classLevel: 10,
        description: "Bending of light across optical media due to change in light velocity.",
        keyPoints: [
          "Snell's Law: sin(i) / sin(r) = n₂ / n₁ = constant.",
          "Refractive index n = c / v.",
          "Light traveling from rarer to denser medium bends towards the normal."
        ],
        formula: "n = c / v,  n₂₁ = sin(i) / sin(r)",
        prerequisites: ["opt-1"],
        x: 25,
        y: 65,
        tier: 2,
        quiz: {
          question: "When a ray of light passes from glass (n=1.5) into water (n=1.33), what happens?",
          options: [
            "It speeds up and bends away from the normal",
            "It slows down and bends towards the normal",
            "It travels undeviated with unchanged wavelength",
            "It suffers total internal reflection at all angles"
          ],
          correctAnswer: "It speeds up and bends away from the normal",
          explanation: "Glass is denser than water; moving into a rarer medium causes light to speed up and bend away from the normal."
        }
      },
      {
        id: "opt-4",
        title: "Lens Formula & Power of Lens",
        chapter: "Light - Reflection and Refraction",
        subject: "Science",
        classLevel: 10,
        description: "Refraction through thin lenses and optical power calculation in Dioptres.",
        keyPoints: [
          "Lens formula: 1/v - 1/u = 1/f.",
          "Lens magnification: m = v / u = h_i / h_o.",
          "Power: P = 1 / f (f in meters, unit Dioptre D)."
        ],
        formula: "1/v - 1/u = 1/f,  P = 1/f (m)",
        prerequisites: ["opt-2", "opt-3"],
        x: 70,
        y: 65,
        tier: 3,
        quiz: {
          question: "A doctor prescribes a corrective lens of power -2.0 D. What is its focal length and type?",
          options: [
            "f = -0.5 m (-50 cm), Concave Lens (Myopia)",
            "f = +0.5 m (+50 cm), Convex Lens (Hypermetropia)",
            "f = -2.0 m, Concave Lens",
            "f = +2.0 m, Convex Lens"
          ],
          correctAnswer: "f = -0.5 m (-50 cm), Concave Lens (Myopia)",
          explanation: "f = 1/P = 1/(-2.0) = -0.5 m (-50 cm). Negative power corresponds to a concave diverging lens for myopia."
        }
      }
    ]
  },
  {
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    nodes: [
      {
        id: "math-1",
        title: "Standard Form & Degree",
        chapter: "Quadratic Equations",
        subject: "Mathematics",
        classLevel: 10,
        description: "Polynomial equation of degree 2 in standard form ax² + bx + c = 0.",
        keyPoints: [
          "Condition: a ≠ 0.",
          "Has exactly 2 roots (real or complex)."
        ],
        formula: "ax² + bx + c = 0 (a ≠ 0)",
        prerequisites: [],
        x: 20,
        y: 25,
        tier: 1,
        quiz: {
          question: "Which of the following is a quadratic equation?",
          options: [
            "(x - 2)² + 1 = 2x - 3",
            "x(x + 1) + 8 = (x + 2)(x - 2)",
            "x(2x + 3) = x² + 1",
            "Both A and C"
          ],
          correctAnswer: "Both A and C",
          explanation: "(A) simplifies to x² - 6x + 8 = 0 and (C) simplifies to x² + 3x - 1 = 0, both of degree 2."
        }
      },
      {
        id: "math-2",
        title: "Factorisation (Splitting Middle Term)",
        chapter: "Quadratic Equations",
        subject: "Mathematics",
        classLevel: 10,
        description: "Finding two numbers p and q such that p + q = b and pq = ac.",
        keyPoints: [
          "Split middle term bx into px + qx.",
          "Group and extract common binomial factors."
        ],
        prerequisites: ["math-1"],
        x: 50,
        y: 25,
        tier: 2,
        quiz: {
          question: "What are the roots of x² - 3x - 10 = 0 by factorisation?",
          options: ["5 and -2", "-5 and 2", "5 and 2", "-5 and -2"],
          correctAnswer: "5 and -2",
          explanation: "(x - 5)(x + 2) = 0 ⟹ x = 5, x = -2."
        }
      },
      {
        id: "math-3",
        title: "Quadratic Formula (Sridharacharya)",
        chapter: "Quadratic Equations",
        subject: "Mathematics",
        classLevel: 10,
        description: "Direct algebraic method to compute roots for any quadratic equation.",
        keyPoints: [
          "x = (-b ± √(b² - 4ac)) / (2a).",
          "Applicable even when middle term cannot be factored with integers."
        ],
        formula: "x = (-b ± √D) / 2a",
        prerequisites: ["math-1", "math-2"],
        x: 25,
        y: 65,
        tier: 3,
        quiz: {
          question: "Find the roots of 2x² - 5x + 3 = 0 using the quadratic formula.",
          options: ["x = 1 and x = 3/2", "x = -1 and x = -3/2", "x = 2 and x = 3", "x = 1/2 and x = 3"],
          correctAnswer: "x = 1 and x = 3/2",
          explanation: "D = 25 - 24 = 1. x = (5 ± 1)/4 ⟹ x = 6/4 = 1.5 and x = 4/4 = 1."
        }
      },
      {
        id: "math-4",
        title: "Discriminant & Nature of Roots",
        chapter: "Quadratic Equations",
        subject: "Mathematics",
        classLevel: 10,
        description: "Analyzing D = b² - 4ac to determine root character without full solution.",
        keyPoints: [
          "D > 0: Two distinct real roots.",
          "D = 0: Two equal real roots (x = -b/2a).",
          "D < 0: No real roots (imaginary)."
        ],
        formula: "D = b² - 4ac",
        prerequisites: ["math-3"],
        x: 75,
        y: 65,
        tier: 4,
        quiz: {
          question: "For what value of k does 2x² + kx + 3 = 0 have two equal real roots?",
          options: ["k = ±√24 = ±2√6", "k = ±6", "k = 12", "k = ±4"],
          correctAnswer: "k = ±√24 = ±2√6",
          explanation: "For equal roots, D = 0 ⟹ k² - 4(2)(3) = 0 ⟹ k² = 24 ⟹ k = ±2√6."
        }
      }
    ]
  }
];

const MASTERY_KEY = "edutrack_mindmap_mastery";

export function getMasteredNodeIds(): string[] {
  if (typeof window === "undefined") return ["chem-1", "opt-1", "math-1"];
  const raw = localStorage.getItem(MASTERY_KEY);
  if (!raw) {
    const initial = ["chem-1", "opt-1", "math-1"];
    localStorage.setItem(MASTERY_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return ["chem-1", "opt-1", "math-1"];
  }
}

export function unlockNodeMastery(nodeId: string): { success: boolean; xp: number } {
  if (typeof window === "undefined") return { success: false, xp: 0 };
  const current = getMasteredNodeIds();
  if (!current.includes(nodeId)) {
    const updated = [...current, nodeId];
    localStorage.setItem(MASTERY_KEY, JSON.stringify(updated));
    awardUserXP(50);
    window.dispatchEvent(new CustomEvent("edutrack_mindmap_updated", { detail: { nodeId } }));
    return { success: true, xp: 50 };
  }
  return { success: false, xp: 0 };
}
