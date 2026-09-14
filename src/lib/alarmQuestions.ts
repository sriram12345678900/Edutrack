// ============================================================================
// SMART STUDY ALARM CLOCK — CURRICULUM QUESTION BANK & PROCEDURAL GENERATOR
// High-yield NCERT / CBSE Class 6-10 questions across all core subjects
// ============================================================================

export interface AlarmMCQ {
  id: string;
  subject: "Science" | "Mathematics" | "Social Science" | "English";
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const CURATED_ALARM_QUESTIONS: AlarmMCQ[] = [
  // ── SCIENCE: PHYSICS & CHEMISTRY ──
  {
    id: "sci-1",
    subject: "Science",
    topic: "Electricity",
    question: "According to Ohm's law, if a circuit has voltage V = 12V and resistance R = 4Ω, what is the current I?",
    options: ["48 Amperes", "3 Amperes", "0.33 Amperes", "8 Amperes"],
    correctIndex: 1,
    explanation: "I = V / R = 12 / 4 = 3 Amperes."
  },
  {
    id: "sci-2",
    subject: "Science",
    topic: "Acids & Bases",
    question: "What is the approximate pH of a neutral aqueous solution at 25°C?",
    options: ["0", "14", "7", "1"],
    correctIndex: 2,
    explanation: "Pure neutral water has a pH of 7 at 25°C."
  },
  {
    id: "sci-3",
    subject: "Science",
    topic: "Optics & Light",
    question: "A convex mirror always produces which type of image?",
    options: [
      "Real, inverted, and magnified",
      "Virtual, erect, and diminished",
      "Real, erect, and enlarged",
      "Virtual, inverted, and same size"
    ],
    correctIndex: 1,
    explanation: "Convex mirrors always form virtual, erect, and diminished images regardless of object position."
  },
  {
    id: "sci-4",
    subject: "Science",
    topic: "Chemical Reactions",
    question: "What type of reaction is represented by: 2H₂ + O₂ → 2H₂O?",
    options: ["Decomposition", "Displacement", "Combination Reaction", "Double Displacement"],
    correctIndex: 2,
    explanation: "Two elements combine to form a single product, so it is a Combination Reaction."
  },
  {
    id: "sci-5",
    subject: "Science",
    topic: "Life Processes",
    question: "In human digestion, which enzyme in saliva begins breaking down starch into maltose?",
    options: ["Pepsin", "Salivary Amylase", "Lipase", "Trypsin"],
    correctIndex: 1,
    explanation: "Salivary amylase (ptyalin) in saliva breaks down complex starches into simpler sugars."
  },
  {
    id: "sci-6",
    subject: "Science",
    topic: "Metals & Non-metals",
    question: "Which metal is liquid at standard room temperature?",
    options: ["Sodium", "Bromine", "Mercury", "Gallium"],
    correctIndex: 2,
    explanation: "Mercury (Hg) is the only metal that remains liquid at standard room temperature."
  },

  // ── MATHEMATICS ──
  {
    id: "math-1",
    subject: "Mathematics",
    topic: "Trigonometry",
    question: "What is the exact value of sin(30°) + cos(60°)?",
    options: ["0.5", "1", "√3", "0"],
    correctIndex: 1,
    explanation: "sin(30°) = 1/2 and cos(60°) = 1/2. Sum = 1/2 + 1/2 = 1."
  },
  {
    id: "math-2",
    subject: "Mathematics",
    topic: "Quadratic Equations",
    question: "What are the roots of the quadratic equation x² - 5x + 6 = 0?",
    options: ["x = 2 and x = 3", "x = -2 and x = -3", "x = 1 and x = 6", "x = -1 and x = 6"],
    correctIndex: 0,
    explanation: "(x - 2)(x - 3) = 0, therefore x = 2 and x = 3."
  },
  {
    id: "math-3",
    subject: "Mathematics",
    topic: "Coordinate Geometry",
    question: "What is the distance between the origin (0, 0) and the point (3, 4)?",
    options: ["7 units", "12 units", "5 units", "25 units"],
    correctIndex: 2,
    explanation: "Distance = √(3² + 4²) = √(9 + 16) = √25 = 5 units."
  },
  {
    id: "math-4",
    subject: "Mathematics",
    topic: "Arithmetic Progressions",
    question: "In the AP 4, 7, 10, 13..., what is the common difference (d)?",
    options: ["4", "3", "7", "2"],
    correctIndex: 1,
    explanation: "Common difference d = 7 - 4 = 3."
  },
  {
    id: "math-5",
    subject: "Mathematics",
    topic: "Probability",
    question: "What is the probability of rolling a prime number on a standard 6-sided die?",
    options: ["1/6", "1/3", "1/2", "2/3"],
    correctIndex: 2,
    explanation: "Prime numbers on a die are {2, 3, 5} (3 outcomes out of 6). P = 3/6 = 1/2."
  },

  // ── SOCIAL SCIENCE ──
  {
    id: "sst-1",
    subject: "Social Science",
    topic: "Indian History",
    question: "In which year did the historic Dandi Salt March led by Mahatma Gandhi take place?",
    options: ["1919", "1930", "1942", "1920"],
    correctIndex: 1,
    explanation: "Mahatma Gandhi launched the Salt March to Dandi on March 12, 1930."
  },
  {
    id: "sst-2",
    subject: "Social Science",
    topic: "Civics & Governance",
    question: "Which organ of the government is responsible for interpreting and upholding the Constitution in India?",
    options: ["Legislature", "Executive", "Judiciary", "Election Commission"],
    correctIndex: 2,
    explanation: "The Judiciary (Supreme Court and High Courts) acts as the guardian and interpreter of the Constitution."
  },
  {
    id: "sst-3",
    subject: "Social Science",
    topic: "Geography",
    question: "Which soil type, also called Regur soil, is most ideal for growing cotton in India?",
    options: ["Alluvial Soil", "Black Soil", "Laterite Soil", "Red Soil"],
    correctIndex: 1,
    explanation: "Black soil (Regur soil), found in the Deccan plateau, has high moisture retention ideal for cotton cultivation."
  },

  // ── ENGLISH & GRAMMAR ──
  {
    id: "eng-1",
    subject: "English",
    topic: "Tenses & Voice",
    question: "Identify the correct passive voice of: 'The student solved the complex equation.'",
    options: [
      "The complex equation had been solved by the student.",
      "The complex equation was solved by the student.",
      "The complex equation is being solved by the student.",
      "The student was solving the complex equation."
    ],
    correctIndex: 1,
    explanation: "Simple past tense converts to 'was/were + past participle' in the passive voice."
  },
  {
    id: "eng-2",
    subject: "English",
    topic: "Vocabulary",
    question: "What is the synonym of 'METICULOUS'?",
    options: ["Careless", "Thorough & Precise", "Aggressive", "Temporary"],
    correctIndex: 1,
    explanation: "Meticulous means showing great attention to detail; very careful and precise."
  }
];

/**
 * Procedural Dynamic Math Question Generator
 * Generates an infinite stream of unique wake-up math questions
 */
export function generateProceduralMathQuestion(): AlarmMCQ {
  const types = ["arithmetic", "algebra", "percentage"];
  const selectedType = types[Math.floor(Math.random() * types.length)];

  if (selectedType === "arithmetic") {
    const a = Math.floor(Math.random() * 40) + 12;
    const b = Math.floor(Math.random() * 25) + 6;
    const isAdd = Math.random() > 0.5;
    const ans = isAdd ? a + b : a * b;
    const operator = isAdd ? "+" : "×";
    const wrong1 = ans + (Math.floor(Math.random() * 5) + 2);
    const wrong2 = ans - (Math.floor(Math.random() * 5) + 2);
    const wrong3 = ans + 10;

    const opts = [ans.toString(), wrong1.toString(), wrong2.toString(), wrong3.toString()];
    const shuffled = [...opts].sort(() => Math.random() - 0.5);
    const correctIdx = shuffled.indexOf(ans.toString());

    return {
      id: `proc-math-${Date.now()}`,
      subject: "Mathematics",
      topic: "Speed Calculation",
      question: `Wake-Up Math: Calculate the value of ${a} ${operator} ${b}`,
      options: shuffled,
      correctIndex: correctIdx,
      explanation: `${a} ${operator} ${b} = ${ans}.`
    };
  }

  if (selectedType === "algebra") {
    const x = Math.floor(Math.random() * 9) + 2;
    const coeff = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
    const a = Math.floor(Math.random() * 15) + 3;
    const b = coeff * x + a;

    const opts = [x.toString(), (x + 1).toString(), (x - 1).toString(), (x + 2).toString()].sort(() => Math.random() - 0.5);
    const correctIdx = opts.indexOf(x.toString());

    return {
      id: `proc-alg-${Date.now()}`,
      subject: "Mathematics",
      topic: "Linear Equations",
      question: `Find the value of x if: ${coeff}x + ${a} = ${b}`,
      options: opts,
      correctIndex: correctIdx,
      explanation: `${coeff}x = ${b} - ${a} = ${coeff * x} ⇒ x = ${x}.`
    };
  }

  // Percentage problem
  const pct = [10, 20, 25, 50, 75][Math.floor(Math.random() * 5)];
  const total = [40, 80, 120, 160, 200, 300][Math.floor(Math.random() * 6)];
  const ans = (pct / 100) * total;
  const opts = [ans.toString(), (ans + 10).toString(), (ans - 5).toString(), (ans * 2).toString()].sort(() => Math.random() - 0.5);
  const correctIdx = opts.indexOf(ans.toString());

  return {
    id: `proc-pct-${Date.now()}`,
    subject: "Mathematics",
    topic: "Percentages",
    question: `What is ${pct}% of ${total}?`,
    options: opts,
    correctIndex: correctIdx,
    explanation: `(${pct} / 100) × ${total} = ${ans}.`
  };
}

/**
 * Returns a random challenge question tailored to the selected subject or random mixed
 */
export function getRandomAlarmQuestion(subjectFilter?: string): AlarmMCQ {
  if ((!subjectFilter || subjectFilter === "all" || subjectFilter === "Mathematics") && Math.random() < 0.4) {
    return generateProceduralMathQuestion();
  }

  let pool = CURATED_ALARM_QUESTIONS;
  if (subjectFilter && subjectFilter !== "all") {
    pool = pool.filter(q => q.subject.toLowerCase() === subjectFilter.toLowerCase());
  }

  if (pool.length === 0) pool = CURATED_ALARM_QUESTIONS;

  const selected = pool[Math.floor(Math.random() * pool.length)];
  return { ...selected, id: `${selected.id}-${Date.now()}` };
}
