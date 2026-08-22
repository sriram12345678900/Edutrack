// ============================================================================
// EDU-ARCADE COMPREHENSIVE CURRICULUM GAME DATA & GENERATORS
// All 12 Mini-Game Modules with Rich NCERT/CBSE & General Academic Datasets
// ============================================================================

export interface PeriodicQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  points: number;
}

export interface FormulaRushLevel {
  id: string;
  title: string;
  subject: "Physics" | "Mathematics" | "Chemistry";
  chapter: string;
  description: string;
  correctTokens: string[];
  scrambledTokens: string[];
  explanation: string;
  points: number;
}

export interface WordDefenderItem {
  id: string;
  word: string;
  subject: "Biology" | "Chemistry" | "Physics" | "Social Science";
  clue: string;
  definition: string;
  hint: string;
  points: number;
}

export interface MemoryPair {
  id: string;
  cardA: string;
  cardB: string;
  category: string;
}

// ----------------------------------------------------------------------------
// 1. PERIODIC TABLE BLITZ QUESTIONS
// ----------------------------------------------------------------------------
export const PERIODIC_BLITZ_QUESTIONS: PeriodicQuestion[] = [
  {
    id: "pt-1",
    question: "What is the chemical symbol for Potassium?",
    options: ["P", "Pt", "K", "Po"],
    correctIndex: 2,
    explanation: "Potassium's symbol 'K' comes from the Neo-Latin word Kalium.",
    category: "Symbols",
    points: 100
  },
  {
    id: "pt-2",
    question: "Which element has atomic number 26?",
    options: ["Iron (Fe)", "Cobalt (Co)", "Nickel (Ni)", "Copper (Cu)"],
    correctIndex: 0,
    explanation: "Iron has atomic number 26 and is located in Group 8, Period 4.",
    category: "Atomic Numbers",
    points: 120
  },
  {
    id: "pt-3",
    question: "Which group of the periodic table do the Halogens belong to?",
    options: ["Group 1", "Group 16", "Group 17", "Group 18"],
    correctIndex: 2,
    explanation: "Group 17 elements (F, Cl, Br, I, At) are known as the Halogens.",
    category: "Groups & Families",
    points: 100
  },
  {
    id: "pt-4",
    question: "What is the valency of Aluminium (atomic number 13)?",
    options: ["+1", "+2", "+3", "+4"],
    correctIndex: 2,
    explanation: "Aluminium has electron configuration 2, 8, 3, so it loses 3 electrons.",
    category: "Valency & Shells",
    points: 110
  },
  {
    id: "pt-5",
    question: "Which noble gas has the atomic number 10?",
    options: ["Helium", "Neon", "Argon", "Krypton"],
    correctIndex: 1,
    explanation: "Neon has atomic number 10 with a stable octet (2, 8).",
    category: "Noble Gases",
    points: 100
  },
  {
    id: "pt-6",
    question: "Which is the only liquid non-metal at room temperature?",
    options: ["Mercury", "Bromine", "Gallium", "Chlorine"],
    correctIndex: 1,
    explanation: "Bromine (Br) is the only non-metallic element that is liquid at standard conditions.",
    category: "States of Matter",
    points: 130
  },
  {
    id: "pt-7",
    question: "What is the chemical symbol for Lead?",
    options: ["Ld", "Le", "Pb", "Pl"],
    correctIndex: 2,
    explanation: "Lead is 'Pb', derived from the Latin word Plumbum.",
    category: "Symbols",
    points: 100
  },
  {
    id: "pt-8",
    question: "Which of the following is an Alkali Metal?",
    options: ["Calcium", "Magnesium", "Sodium", "Aluminium"],
    correctIndex: 2,
    explanation: "Sodium (Na) is an alkali metal in Group 1.",
    category: "Groups & Families",
    points: 110
  },
  {
    id: "pt-9",
    question: "What is the atomic mass of Carbon (standard isotope)?",
    options: ["6 u", "12 u", "14 u", "16 u"],
    correctIndex: 1,
    explanation: "Carbon-12 has an exact standard atomic mass unit definition of 12 u.",
    category: "Atomic Mass",
    points: 100
  },
  {
    id: "pt-10",
    question: "Which element is the most electronegative on the Pauling scale?",
    options: ["Oxygen", "Fluorine", "Chlorine", "Nitrogen"],
    correctIndex: 1,
    explanation: "Fluorine is the most electronegative element with a value of 3.98.",
    category: "Trends",
    points: 140
  },
  {
    id: "pt-11",
    question: "What is the chemical symbol for Silver?",
    options: ["Si", "Ag", "Au", "Sr"],
    correctIndex: 1,
    explanation: "Silver is 'Ag' from the Latin Argentum.",
    category: "Symbols",
    points: 100
  },
  {
    id: "pt-12",
    question: "Which element has the electron configuration 2, 8, 7?",
    options: ["Sulfur", "Phosphorus", "Chlorine", "Argon"],
    correctIndex: 2,
    explanation: "2 + 8 + 7 = 17 electrons, which is Chlorine (Cl).",
    category: "Valency & Shells",
    points: 120
  }
];

// ----------------------------------------------------------------------------
// 2. FORMULA RUSH LEVELS
// ----------------------------------------------------------------------------
export const FORMULA_RUSH_LEVELS: FormulaRushLevel[] = [
  {
    id: "fr-1",
    title: "Ohm's Law",
    subject: "Physics",
    chapter: "Electricity",
    description: "Build the fundamental equation relating Voltage, Current, and Resistance.",
    correctTokens: ["V", "=", "I", "×", "R"],
    scrambledTokens: ["R", "=", "V", "I", "×", "P", "t"],
    explanation: "Ohm's Law states Voltage (V) equals Current (I) multiplied by Resistance (R).",
    points: 150
  },
  {
    id: "fr-2",
    title: "Newton's Second Law",
    subject: "Physics",
    chapter: "Force and Laws of Motion",
    description: "Form the equation calculating Net Force from mass and acceleration.",
    correctTokens: ["F", "=", "m", "×", "a"],
    scrambledTokens: ["a", "m", "=", "F", "×", "v", "g"],
    explanation: "Force (F) is equal to mass (m) multiplied by acceleration (a).",
    points: 150
  },
  {
    id: "fr-3",
    title: "Einstein's Mass-Energy Equivalence",
    subject: "Physics",
    chapter: "Modern Physics",
    description: "Assemble the most famous physics formula in history.",
    correctTokens: ["E", "=", "m", "×", "c²"],
    scrambledTokens: ["c²", "=", "E", "m", "×", "h", "v"],
    explanation: "Energy equals mass times the speed of light squared.",
    points: 160
  },
  {
    id: "fr-4",
    title: "Pythagorean Trigonometric Identity",
    subject: "Mathematics",
    chapter: "Introduction to Trigonometry",
    description: "Construct the fundamental trigonometric square identity.",
    correctTokens: ["sin²θ", "+", "cos²θ", "=", "1"],
    scrambledTokens: ["1", "cos²θ", "=", "sin²θ", "+", "tan²θ", "0"],
    explanation: "For any angle θ, sin²θ + cos²θ is always equal to 1.",
    points: 180
  },
  {
    id: "fr-5",
    title: "Kinetic Energy Equation",
    subject: "Physics",
    chapter: "Work and Energy",
    description: "Form the expression for energy possessed by a body due to motion.",
    correctTokens: ["K.E.", "=", "½", "×", "m", "×", "v²"],
    scrambledTokens: ["v²", "m", "½", "K.E.", "=", "×", "×", "h", "g"],
    explanation: "Kinetic Energy is one-half mass times the velocity squared.",
    points: 180
  },
  {
    id: "fr-6",
    title: "Joule's Law of Heating",
    subject: "Physics",
    chapter: "Electricity",
    description: "Build the formula for heat generated in a resistor over time.",
    correctTokens: ["H", "=", "I²", "×", "R", "×", "t"],
    scrambledTokens: ["t", "R", "I²", "=", "H", "×", "×", "V", "P"],
    explanation: "Heat produced is directly proportional to square of current (I²Rt).",
    points: 190
  },
  {
    id: "fr-7",
    title: "Standard Lens Formula",
    subject: "Physics",
    chapter: "Light - Reflection & Refraction",
    description: "Assemble the relationship between focal length (f), image distance (v), and object distance (u).",
    correctTokens: ["1/f", "=", "1/v", "-", "1/u"],
    scrambledTokens: ["1/u", "-", "1/v", "=", "1/f", "+", "m"],
    explanation: "Lens Formula: 1/f = 1/v - 1/u (notice the minus sign for lenses).",
    points: 200
  },
  {
    id: "fr-8",
    title: "Quadratic Identity Expansion",
    subject: "Mathematics",
    chapter: "Polynomials",
    description: "Assemble the algebraic expansion of (a + b)².",
    correctTokens: ["(a+b)²", "=", "a²", "+", "2ab", "+", "b²"],
    scrambledTokens: ["b²", "2ab", "+", "+", "a²", "=", "(a+b)²", "-"],
    explanation: "(a + b)² = a² + 2ab + b².",
    points: 180
  },
  {
    id: "fr-9",
    title: "Density Formula",
    subject: "Physics",
    chapter: "Gravitation & Fluids",
    description: "Assemble the ratio defining density of a substance.",
    correctTokens: ["ρ", "=", "m", "/", "V"],
    scrambledTokens: ["V", "/", "m", "=", "ρ", "×", "A"],
    explanation: "Density (ρ) is equal to mass (m) divided by volume (V).",
    points: 150
  },
  {
    id: "fr-10",
    title: "Universal Law of Gravitation",
    subject: "Physics",
    chapter: "Gravitation",
    description: "Build Newton's equation for gravitational attraction between two masses.",
    correctTokens: ["F", "=", "G", "×", "(m₁m₂)", "/", "r²"],
    scrambledTokens: ["r²", "/", "(m₁m₂)", "G", "=", "F", "×", "g", "R"],
    explanation: "F = G · (m₁ · m₂) / r²",
    points: 220
  }
];

// ----------------------------------------------------------------------------
// 3. SPEED MATH BLITZ GENERATOR
// ----------------------------------------------------------------------------
export interface SpeedMathQuestion {
  id: string;
  prompt: string;
  options: number[];
  correctAnswer: number;
  topic: string;
  points: number;
}

export function generateSpeedMathQuestion(level: number = 1): SpeedMathQuestion {
  const types = ["arithmetic", "square", "root", "algebra", "percent"];
  const selectedType = types[Math.floor(Math.random() * types.length)];
  const id = `sm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  if (selectedType === "arithmetic") {
    const a = Math.floor(Math.random() * (20 * level)) + 5;
    const b = Math.floor(Math.random() * (12 * level)) + 3;
    const isMult = Math.random() > 0.4;

    if (isMult) {
      const ans = a * b;
      const options = generateOptions(ans, 4);
      return {
        id,
        prompt: `${a} × ${b} = ?`,
        options,
        correctAnswer: ans,
        topic: "Speed Multiplication",
        points: 100 * level
      };
    } else {
      const sum = a + b;
      const isSub = Math.random() > 0.5;
      if (isSub) {
        const options = generateOptions(a, 4);
        return {
          id,
          prompt: `${sum} - ${b} = ?`,
          options,
          correctAnswer: a,
          topic: "Quick Subtraction",
          points: 80 * level
        };
      } else {
        const options = generateOptions(sum, 4);
        return {
          id,
          prompt: `${a} + ${b} = ?`,
          options,
          correctAnswer: sum,
          topic: "Rapid Addition",
          points: 80 * level
        };
      }
    }
  } else if (selectedType === "square") {
    const base = Math.floor(Math.random() * (15 + level * 5)) + 4;
    const ans = base * base;
    const options = generateOptions(ans, 4);
    return {
      id,
      prompt: `${base}² = ?`,
      options,
      correctAnswer: ans,
      topic: "Perfect Squares",
      points: 120 * level
    };
  } else if (selectedType === "root") {
    const roots = [4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const square = root * root;
    const options = generateOptions(root, 4);
    return {
      id,
      prompt: `√${square} = ?`,
      options,
      correctAnswer: root,
      topic: "Square Roots",
      points: 120 * level
    };
  } else if (selectedType === "percent") {
    const percents = [10, 20, 25, 50, 75];
    const p = percents[Math.floor(Math.random() * percents.length)];
    const val = (Math.floor(Math.random() * 10) + 1) * (100 / (p === 10 ? 10 : p === 20 ? 5 : p === 25 ? 4 : p === 50 ? 2 : 4));
    const ans = Math.round((p / 100) * val);
    const options = generateOptions(ans, 4);
    return {
      id,
      prompt: `${p}% of ${val} = ?`,
      options,
      correctAnswer: ans,
      topic: "Mental Percentages",
      points: 140 * level
    };
  } else {
    const x = Math.floor(Math.random() * 10) + 2;
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 15) + 3;
    const c = a * x + b;
    const options = generateOptions(x, 4);
    return {
      id,
      prompt: `${a}x + ${b} = ${c}  →  x = ?`,
      options,
      correctAnswer: x,
      topic: "Linear Algebra",
      points: 150 * level
    };
  }
}

function generateOptions(correct: number, count: number): number[] {
  const set = new Set<number>();
  set.add(correct);

  while (set.size < count) {
    const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const val = correct + offset;
    if (val >= 0 && val !== correct) {
      set.add(val);
    }
  }

  const arr = Array.from(set);
  return arr.sort(() => Math.random() - 0.5);
}

// ----------------------------------------------------------------------------
// 4. ACADEMIC WORD DEFENDER (ACTIVE RECALL)
// ----------------------------------------------------------------------------
export const WORD_DEFENDER_ITEMS: WordDefenderItem[] = [
  {
    id: "wd-1",
    word: "MITOCHONDRIA",
    subject: "Biology",
    clue: "The organelle known as the powerhouse of eukaryotic cells that generates ATP.",
    definition: "Double-membraned cell organelle responsible for aerobic cellular respiration.",
    hint: "Starts with M and ends with A. Plural form.",
    points: 200
  },
  {
    id: "wd-2",
    word: "PHOTOSYNTHESIS",
    subject: "Biology",
    clue: "Process used by autotrophic plants to convert light energy into chemical energy.",
    definition: "6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂ inside chlorophyll chloroplasts.",
    hint: "Contains 'PHOTO' meaning light.",
    points: 220
  },
  {
    id: "wd-3",
    word: "CHLOROPLAST",
    subject: "Biology",
    clue: "Plastid in plant cells containing green chlorophyll pigments.",
    definition: "Site of photosynthesis in green plants and algae.",
    hint: "Contains 'CHLORO'.",
    points: 180
  },
  {
    id: "wd-4",
    word: "REFRACTION",
    subject: "Physics",
    clue: "The bending of a wave when it enters a medium where its speed is different.",
    definition: "Governed by Snell's law: n₁ sin(i) = n₂ sin(r).",
    hint: "Responsible for why a pencil in water looks bent.",
    points: 180
  },
  {
    id: "wd-5",
    word: "DIFFRACTION",
    subject: "Physics",
    clue: "The slight bending of light or sound waves around the edges of an obstacle.",
    definition: "Wave phenomenon prominent when obstacle size is comparable to wavelength.",
    hint: "Starts with DI...",
    points: 190
  },
  {
    id: "wd-6",
    word: "ELECTROLYSIS",
    subject: "Chemistry",
    clue: "Chemical decomposition produced by passing an electric current through a liquid.",
    definition: "Separation of compounds using anode and cathode electrode reactions.",
    hint: "Water can be split into H₂ and O₂ using this process.",
    points: 190
  },
  {
    id: "wd-7",
    word: "ENDOTHERMIC",
    subject: "Chemistry",
    clue: "A chemical reaction that absorbs thermal energy from its surroundings.",
    definition: "Enthalpy change ΔH is positive; cools down the surroundings.",
    hint: "Opposite of Exothermic.",
    points: 180
  },
  {
    id: "wd-8",
    word: "CONSTITUTION",
    subject: "Social Science",
    clue: "The supreme legal document that sets out the fundamental principles of governance.",
    definition: "Dr. B.R. Ambedkar was the chairman of its drafting committee in India.",
    hint: "Celebrated on Republic Day (Jan 26).",
    points: 200
  },
  {
    id: "wd-9",
    word: "CHROMOSOME",
    subject: "Biology",
    clue: "Thread-like structure of nucleic acids and protein carrying genetic information.",
    definition: "Humans have 23 pairs (46 total) in somatic cell nuclei.",
    hint: "Contains DNA tightly wound around histone proteins.",
    points: 190
  },
  {
    id: "wd-10",
    word: "PRECIPITATE",
    subject: "Chemistry",
    clue: "An insoluble solid that emerges from a liquid solution during a reaction.",
    definition: "Formed in double displacement reactions (e.g. BaSO₄ white precipitate).",
    hint: "Often represented with a downward arrow (↓).",
    points: 190
  },
  {
    id: "wd-11",
    word: "LITHOSPHERE",
    subject: "Social Science",
    clue: "The rigid outer part of the earth, consisting of the crust and upper mantle.",
    definition: "Broken into tectonic plates that float on the asthenosphere.",
    hint: "Comes from Greek 'lithos' meaning rock/stone.",
    points: 190
  },
  {
    id: "wd-12",
    word: "RESISTANCE",
    subject: "Physics",
    clue: "The opposition that a substance offers to the flow of electric current.",
    definition: "Measured in Ohms (Ω); depends on length, area, and resistivity (R = ρL/A).",
    hint: "Symbol is R.",
    points: 170
  }
];

// ----------------------------------------------------------------------------
// 5. CONCEPT MEMORY FLIP PAIRS
// ----------------------------------------------------------------------------
export const MEMORY_CONCEPT_PAIRS: MemoryPair[] = [
  { id: "mp-1", cardA: "Ohm (Ω)", cardB: "Unit of Resistance", category: "Physics Units" },
  { id: "mp-2", cardA: "Mitochondria", cardB: "Cell Powerhouse", category: "Biology" },
  { id: "mp-3", cardA: "Pascal (Pa)", cardB: "Unit of Pressure", category: "Physics Units" },
  { id: "mp-4", cardA: "Chlorophyll", cardB: "Green Light Pigment", category: "Biology" },
  { id: "mp-5", cardA: "Joule (J)", cardB: "Unit of Energy & Work", category: "Physics Units" },
  { id: "mp-6", cardA: "Alkali Metals", cardB: "Group 1 Elements", category: "Chemistry" },
  { id: "mp-7", cardA: "Newton (N)", cardB: "Unit of Force", category: "Physics Units" },
  { id: "mp-8", cardA: "Halogens", cardB: "Group 17 Elements", category: "Chemistry" },
  { id: "mp-9", cardA: "Ampere (A)", cardB: "Unit of Current", category: "Physics Units" },
  { id: "mp-10", cardA: "Nephron", cardB: "Kidney Filtration Unit", category: "Biology" },
  { id: "mp-11", cardA: "Volt (V)", cardB: "Electric Potential Difference", category: "Physics Units" },
  { id: "mp-12", cardA: "Synapse", cardB: "Gap Between Neurons", category: "Biology" }
];

// ============================================================================
// 6. CHEMICAL REACTION BALANCER (ALCHEMY TYCOON)
// ============================================================================
export interface ReactionParticipant {
  formula: string;
  defaultCoeff: number;
  correctCoeff: number;
  atoms: Record<string, number>;
}

export interface ReactionBalancerLevel {
  id: string;
  title: string;
  reactants: ReactionParticipant[];
  products: ReactionParticipant[];
  type: string;
  explanation: string;
  points: number;
}

export const REACTION_BALANCER_LEVELS: ReactionBalancerLevel[] = [
  {
    id: "rb-1",
    title: "Rusting of Iron (Redox Reaction)",
    type: "Oxidation",
    reactants: [
      { formula: "Fe", defaultCoeff: 1, correctCoeff: 3, atoms: { Fe: 1 } },
      { formula: "H₂O", defaultCoeff: 1, correctCoeff: 4, atoms: { H: 2, O: 1 } }
    ],
    products: [
      { formula: "Fe₃O₄", defaultCoeff: 1, correctCoeff: 1, atoms: { Fe: 3, O: 4 } },
      { formula: "H₂", defaultCoeff: 1, correctCoeff: 4, atoms: { H: 2 } }
    ],
    explanation: "3Fe + 4H₂O → Fe₃O₄ + 4H₂: Balancing requires 3 Iron, 8 Hydrogen, and 4 Oxygen atoms.",
    points: 200
  },
  {
    id: "rb-2",
    title: "Combustion of Methane",
    type: "Exothermic Combustion",
    reactants: [
      { formula: "CH₄", defaultCoeff: 1, correctCoeff: 1, atoms: { C: 1, H: 4 } },
      { formula: "O₂", defaultCoeff: 1, correctCoeff: 2, atoms: { O: 2 } }
    ],
    products: [
      { formula: "CO₂", defaultCoeff: 1, correctCoeff: 1, atoms: { C: 1, O: 2 } },
      { formula: "H₂O", defaultCoeff: 1, correctCoeff: 2, atoms: { H: 2, O: 1 } }
    ],
    explanation: "CH₄ + 2O₂ → CO₂ + 2H₂O: Produces Carbon Dioxide and Water with intense heat.",
    points: 180
  },
  {
    id: "rb-3",
    title: "Synthesis of Ammonia (Haber Process)",
    type: "Combination",
    reactants: [
      { formula: "N₂", defaultCoeff: 1, correctCoeff: 1, atoms: { N: 2 } },
      { formula: "H₂", defaultCoeff: 1, correctCoeff: 3, atoms: { H: 2 } }
    ],
    products: [
      { formula: "NH₃", defaultCoeff: 1, correctCoeff: 2, atoms: { N: 1, H: 3 } }
    ],
    explanation: "N₂ + 3H₂ → 2NH₃: Fundamental industrial reaction under high pressure.",
    points: 170
  },
  {
    id: "rb-4",
    title: "Aluminium Oxidation (Thermite Spark)",
    type: "Combination",
    reactants: [
      { formula: "Al", defaultCoeff: 1, correctCoeff: 4, atoms: { Al: 1 } },
      { formula: "O₂", defaultCoeff: 1, correctCoeff: 3, atoms: { O: 2 } }
    ],
    products: [
      { formula: "Al₂O₃", defaultCoeff: 1, correctCoeff: 2, atoms: { Al: 2, O: 3 } }
    ],
    explanation: "4Al + 3O₂ → 2Al₂O₃: Forms a tough protective amphoteric oxide layer.",
    points: 210
  },
  {
    id: "rb-5",
    title: "Decomposition of Potassium Chlorate",
    type: "Thermal Decomposition",
    reactants: [
      { formula: "KClO₃", defaultCoeff: 1, correctCoeff: 2, atoms: { K: 1, Cl: 1, O: 3 } }
    ],
    products: [
      { formula: "KCl", defaultCoeff: 1, correctCoeff: 2, atoms: { K: 1, Cl: 1 } },
      { formula: "O₂", defaultCoeff: 1, correctCoeff: 3, atoms: { O: 2 } }
    ],
    explanation: "2KClO₃ → 2KCl + 3O₂: Releases pure oxygen gas upon heating with MnO₂ catalyst.",
    points: 220
  }
];

// ============================================================================
// 7. CIRCUIT MASTER & LOGIC GATE PUZZLE
// ============================================================================
export interface CircuitTile {
  id: string;
  type: "straight" | "corner" | "t_junction" | "battery" | "lamp" | "switch" | "gate_and";
  rotation: number; // 0, 90, 180, 270
  validRotations: number[];
  label: string;
}

export interface CircuitMasterPuzzle {
  id: string;
  title: string;
  gridSize: 3;
  description: string;
  tiles: CircuitTile[];
  points: number;
}

export const CIRCUIT_PUZZLES: CircuitMasterPuzzle[] = [
  {
    id: "cp-1",
    title: "Closed Loop Series Circuit",
    gridSize: 3,
    description: "Rotate the wire segments and battery to connect the power loop to the incandescent bulb.",
    points: 200,
    tiles: [
      { id: "t-0", type: "battery", rotation: 90, validRotations: [0, 360], label: "🔋 Power (6V)" },
      { id: "t-1", type: "straight", rotation: 0, validRotations: [0, 180], label: "─ Wire" },
      { id: "t-2", type: "corner", rotation: 270, validRotations: [90], label: "┐ Corner" },
      { id: "t-3", type: "straight", rotation: 90, validRotations: [90, 270], label: "│ Wire" },
      { id: "t-4", type: "lamp", rotation: 180, validRotations: [0, 180, 360], label: "💡 Lamp" },
      { id: "t-5", type: "straight", rotation: 0, validRotations: [90, 270], label: "│ Wire" },
      { id: "t-6", type: "corner", rotation: 90, validRotations: [270], label: "└ Corner" },
      { id: "t-7", type: "straight", rotation: 90, validRotations: [0, 180], label: "─ Wire" },
      { id: "t-8", type: "corner", rotation: 0, validRotations: [180], label: "┘ Corner" }
    ]
  },
  {
    id: "cp-2",
    title: "Logic Gate AND Activation",
    gridSize: 3,
    description: "Align the inputs into the AND gate to pass current and illuminate the security beacon.",
    points: 250,
    tiles: [
      { id: "t-0", type: "battery", rotation: 0, validRotations: [0], label: "🔋 Input A" },
      { id: "t-1", type: "corner", rotation: 90, validRotations: [0], label: "┌ Corner" },
      { id: "t-2", type: "battery", rotation: 0, validRotations: [0], label: "🔋 Input B" },
      { id: "t-3", type: "straight", rotation: 0, validRotations: [90, 270], label: "│ Wire" },
      { id: "t-4", type: "gate_and", rotation: 90, validRotations: [0], label: "🔲 AND Gate" },
      { id: "t-5", type: "straight", rotation: 0, validRotations: [90, 270], label: "│ Wire" },
      { id: "t-6", type: "corner", rotation: 0, validRotations: [270], label: "└ Corner" },
      { id: "t-7", type: "lamp", rotation: 90, validRotations: [0, 180], label: "🚨 Beacon" },
      { id: "t-8", type: "corner", rotation: 90, validRotations: [180], label: "┘ Corner" }
    ]
  }
];

// ============================================================================
// 8. HISTORY TIMELINE & GEOMAP RUSH
// ============================================================================
export interface TimelineEventItem {
  id: string;
  title: string;
  year: number;
  era: string;
  clue: string;
}

export interface TimelineChallenge {
  id: string;
  theme: string;
  events: TimelineEventItem[];
  points: number;
}

export const TIMELINE_CHALLENGES: TimelineChallenge[] = [
  {
    id: "tc-1",
    theme: "Indian Freedom Struggle & Nation Building",
    points: 250,
    events: [
      { id: "e-1", title: "Non-Cooperation Movement", year: 1920, era: "Gandhian Era", clue: "Launched by Mahatma Gandhi following the Jallianwala Bagh massacre." },
      { id: "e-2", title: "Dandi Salt March", year: 1930, era: "Civil Disobedience", clue: "24-day 240-mile march to break the salt tax monopoly." },
      { id: "e-3", title: "Quit India Movement", year: 1942, era: "Do or Die", clue: "Historic resolution passed at Gowalia Tank Maidan, Mumbai." },
      { id: "e-4", title: "Constitution of India Takes Effect", year: 1950, era: "Republic", clue: "Adopted on 26 Nov 1949 and in full effect on 26 Jan 1950." }
    ]
  },
  {
    id: "tc-2",
    theme: "World Revolutions & Epochs",
    points: 250,
    events: [
      { id: "e-5", title: "Fall of the Bastille (French Revolution)", year: 1789, era: "Liberty, Equality, Fraternity", clue: "Beginning of the French Revolution against Louis XVI." },
      { id: "e-6", title: "Unification of Germany", year: 1871, era: "Bismarck Era", clue: "Otto von Bismarck proclaims the German Empire at Versailles." },
      { id: "e-7", title: "Russian Bolshevik Revolution", year: 1917, era: "Soviet Genesis", clue: "Lenin leads the overthrow of the Russian Provisional Government." },
      { id: "e-8", title: "Founding of the United Nations", year: 1945, era: "Post-WWII", clue: "Charter signed in San Francisco to preserve world peace." }
    ]
  }
];

// ============================================================================
// 9. BIO-SORT CONVEYOR (ORGANELLE & TAXONOMY)
// ============================================================================
export interface BioSortItem {
  id: string;
  name: string;
  hint: string;
  targetBin: "plant" | "animal" | "bacteria" | "virus";
  fact: string;
  points: number;
}

export const BIO_SORT_ITEMS: BioSortItem[] = [
  { id: "bs-1", name: "Large Central Vacuole", hint: "Maintains turgor pressure", targetBin: "plant", fact: "Occupies up to 90% of plant cell volume.", points: 100 },
  { id: "bs-2", name: "Centriole & Centrosome", hint: "Organizes spindle fibers during animal mitosis", targetBin: "animal", fact: "Found exclusively in animal cells to guide chromosome separation.", points: 100 },
  { id: "bs-3", name: "Peptidoglycan Cell Wall", hint: "Bacterial cell wall polymer", targetBin: "bacteria", fact: "Target of beta-lactam antibiotics like penicillin.", points: 120 },
  { id: "bs-4", name: "Protein Capsid & Spike RNA", hint: "Acellular obligate parasite", targetBin: "virus", fact: "Viruses have no cytoplasm or organelles and require a host to replicate.", points: 120 },
  { id: "bs-5", name: "Chloroplast Stroma & Grana", hint: "Site of photosynthesis", targetBin: "plant", fact: "Contains thylakoids where the light-dependent reactions occur.", points: 100 },
  { id: "bs-6", name: "Lysosome Suicide Bags", hint: "Contains hydrolytic enzymes", targetBin: "animal", fact: "Digests cellular waste and broken organelles in animal cells.", points: 110 },
  { id: "bs-7", name: "70S Ribosomes in Nucleoid", hint: "Prokaryotic protein synthesis", targetBin: "bacteria", fact: "Bacterial ribosomes are 70S compared to 80S eukaryotic ribosomes.", points: 120 },
  { id: "bs-8", name: "Reverse Transcriptase Envelope", hint: "Retrovirus replication enzyme", targetBin: "virus", fact: "Converts viral RNA into DNA inside host cells.", points: 130 }
];

// ============================================================================
// 10. COORDINATE & GRAPH LASER SNIPER
// ============================================================================
export interface GraphSniperTarget {
  id: string;
  prompt: string;
  targetPoint: { x: number; y: number };
  correctSlope: number; // m in y = mx + c
  correctIntercept: number; // c in y = mx + c
  explanation: string;
  points: number;
}

export const GRAPH_SNIPER_TARGETS: GraphSniperTarget[] = [
  {
    id: "gs-1",
    prompt: "Zap the drone at coordinate (2, 5) passing through y-intercept c = 1",
    targetPoint: { x: 2, y: 5 },
    correctSlope: 2, // y = 2x + 1 -> 2(2) + 1 = 5
    correctIntercept: 1,
    explanation: "Line equation: y = 2x + 1. When x = 2, y = 5.",
    points: 150
  },
  {
    id: "gs-2",
    prompt: "Destroy the asteroid at (3, 7) passing through y-intercept c = -2",
    targetPoint: { x: 3, y: 7 },
    correctSlope: 3, // y = 3x - 2 -> 3(3) - 2 = 7
    correctIntercept: -2,
    explanation: "Line equation: y = 3x - 2. When x = 3, y = 7.",
    points: 180
  },
  {
    id: "gs-3",
    prompt: "Intercept the phantom at (-2, -4) with slope m = 1",
    targetPoint: { x: -2, y: -4 },
    correctSlope: 1, // y = 1x - 2 -> 1(-2) - 2 = -4
    correctIntercept: -2,
    explanation: "Line equation: y = x - 2. When x = -2, y = -4.",
    points: 180
  },
  {
    id: "gs-4",
    prompt: "Target the satellite at (4, 2) passing through origin (c = 0)",
    targetPoint: { x: 4, y: 2 },
    correctSlope: 0.5, // y = 0.5x + 0 -> 0.5(4) = 2
    correctIntercept: 0,
    explanation: "Line equation: y = 0.5x. Direct proportional relationship.",
    points: 200
  }
];

// ============================================================================
// 11. GRAMMAR & VOCAB SPELL-CASTER
// ============================================================================
export interface GrammarQuestion {
  id: string;
  type: "Figure of Speech" | "Voice Change" | "Vocabulary & Root" | "Error Spotting";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export const GRAMMAR_SPELL_QUESTIONS: GrammarQuestion[] = [
  {
    id: "gq-1",
    type: "Figure of Speech",
    question: "Identify the figure of speech: 'The wind whispered secrets through the dark night.'",
    options: ["Metaphor", "Personification", "Simile", "Hyperbole"],
    correctIndex: 1,
    explanation: "Personification gives human qualities (whispering secrets) to non-human elements (the wind).",
    points: 120
  },
  {
    id: "gq-2",
    type: "Voice Change",
    question: "Convert to Passive Voice: 'The brilliant scholar solved the complex theorem.'",
    options: [
      "The complex theorem was solved by the brilliant scholar.",
      "The complex theorem is being solved by the brilliant scholar.",
      "The complex theorem had been solved by the brilliant scholar.",
      "The complex theorem solves the brilliant scholar."
    ],
    correctIndex: 0,
    explanation: "Simple past active 'solved' becomes 'was solved' in passive voice.",
    points: 140
  },
  {
    id: "gq-3",
    type: "Vocabulary & Root",
    question: "What does the Greek root word 'CHRONO' mean in 'Chronology' and 'Synchronize'?",
    options: ["Color", "Sound", "Time", "Earth"],
    correctIndex: 2,
    explanation: "'Chrono' comes from the Greek 'khronos' meaning time.",
    points: 110
  },
  {
    id: "gq-4",
    type: "Error Spotting",
    question: "Which part contains an error: 'Neither the principal (A) / nor the teachers (B) / was present at the assembly (C)'",
    options: ["Part A", "Part B", "Part C (should be 'were present')", "No Error"],
    correctIndex: 2,
    explanation: "In 'Neither... nor' constructions, the verb agrees with the closer subject ('teachers' is plural → 'were').",
    points: 150
  },
  {
    id: "gq-5",
    type: "Figure of Speech",
    question: "Identify the device: 'I have told you a million times to balance the chemical equation!'",
    options: ["Hyperbole", "Alliteration", "Oxymoron", "Onomatopoeia"],
    correctIndex: 0,
    explanation: "Hyperbole is an intentional exaggeration not meant to be taken literally.",
    points: 110
  }
];

// ============================================================================
// 12. ASSERTION-REASON LIGHTNING STORM (SUDDEN DEATH)
// ============================================================================
export interface AssertionReasonItem {
  id: string;
  subject: string;
  assertion: string;
  reason: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export const ASSERTION_REASON_ITEMS: AssertionReasonItem[] = [
  {
    id: "ar-1",
    subject: "Physics",
    assertion: "A ray of light passing through the optical center of a thin lens undergoes no deviation.",
    reason: "The central part of the lens acts like a very thin parallel-sided glass slab.",
    options: [
      "Both A and R are true and R is the correct explanation of A.",
      "Both A and R are true but R is NOT the correct explanation of A.",
      "A is true but R is false.",
      "A is false but R is true."
    ],
    correctIndex: 0,
    explanation: "Light passing through the optical center experiences virtually zero lateral displacement and no angular deviation.",
    points: 180
  },
  {
    id: "ar-2",
    subject: "Chemistry",
    assertion: "Metals generally conduct electricity efficiently.",
    reason: "Metals possess free delocalized valence electrons that drift under an applied electric potential.",
    options: [
      "Both A and R are true and R is the correct explanation of A.",
      "Both A and R are true but R is NOT the correct explanation of A.",
      "A is true but R is false.",
      "A is false but R is true."
    ],
    correctIndex: 0,
    explanation: "Metallic bonding allows valence electrons to form a mobile electron sea, enabling electrical conductivity.",
    points: 180
  },
  {
    id: "ar-3",
    subject: "Biology",
    assertion: "Blood in human arteries flows at higher pressure than in veins.",
    reason: "Arteries possess thick, elastic muscular walls and carry blood directly pumped from the heart ventricles.",
    options: [
      "Both A and R are true and R is the correct explanation of A.",
      "Both A and R are true but R is NOT the correct explanation of A.",
      "A is true but R is false.",
      "A is false but R is true."
    ],
    correctIndex: 0,
    explanation: "Ventricle systolic pumping generates strong hydrostatic pressure, requiring thick arterial walls.",
    points: 180
  },
  {
    id: "ar-4",
    subject: "Mathematics",
    assertion: "The equation x² + 4x + 5 = 0 has two distinct real roots.",
    reason: "The discriminant D = b² - 4ac for this equation is 16 - 20 = -4, which is negative.",
    options: [
      "Both A and R are true and R is the correct explanation of A.",
      "Both A and R are true but R is NOT the correct explanation of A.",
      "A is false but R is true.",
      "A is true but R is false."
    ],
    correctIndex: 2,
    explanation: "When D < 0, the quadratic equation has NO real roots (only complex conjugates). Assertion is false; Reason is true.",
    points: 200
  },
  {
    id: "ar-5",
    subject: "Chemistry",
    assertion: "Sodium is stored submerged in kerosene oil.",
    reason: "Sodium is highly reactive and catches fire vigorously upon contact with atmospheric moisture and oxygen.",
    options: [
      "Both A and R are true and R is the correct explanation of A.",
      "Both A and R are true but R is NOT the correct explanation of A.",
      "A is true but R is false.",
      "A is false but R is true."
    ],
    correctIndex: 0,
    explanation: "Sodium reacts exothermically with water: 2Na + 2H₂O → 2NaOH + H₂ + Heat.",
    points: 180
  }
];
