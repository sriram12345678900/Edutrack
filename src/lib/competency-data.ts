// EduTrack CBSE Competency-Based Assessment Data (NEP 2020 Standards)
// Includes Real-World Case Studies and High-Order Thinking (HOTS) Assertion-Reasoning Puzzles

export interface CaseStudyQuestion {
  id: number;
  question: string;
  type: "mcq" | "numerical" | "assertion_reason" | "short_answer";
  options?: string[];
  correctOptionIndex?: number;
  assertion?: string;
  reason?: string;
  officialAnswer: string;
  stepExplanation: string;
  marks: number;
}

export interface CBSECaseStudy {
  id: string;
  title: string;
  subject: "Science" | "Mathematics" | "Social Science";
  grade: "Class 10" | "Class 9";
  chapter: string;
  realWorldContext: string;
  scenarioText: string;
  diagramSvgType?: "heart" | "circuit" | "arch" | "leaf";
  questions: CaseStudyQuestion[];
}

export const AUTHENTIC_CASE_STUDIES: CBSECaseStudy[] = [
  {
    id: "cs-sci-01",
    title: "Ocean Acidification and Marine Calcium Carbonate Shells",
    subject: "Science",
    grade: "Class 10",
    chapter: "Acids, Bases and Salts & Carbon Compounds",
    realWorldContext: "Environmental Chemistry & Marine Ecosystems (UN Sustainable Development Goal 14)",
    scenarioText: `Industrial emissions release approximately 36 billion metric tons of CO₂ into the atmosphere each year. Nearly 30% of this atmospheric carbon dioxide is absorbed by global oceans. When CO₂ dissolves in seawater, it reacts with water to form carbonic acid (H₂CO₃), which subsequently dissociates into hydrogen ions (H⁺) and bicarbonate ions (HCO₃⁻).

An increase in free H⁺ concentration decreases the ocean pH (from an alkaline 8.25 down to 8.05 since the industrial revolution). Marine mollusks, corals, and organisms like sea snails build their protective shells out of calcium carbonate (CaCO₃). When ocean acidity increases, calcium carbonate dissolves into soluble calcium ions and bicarbonate:
CaCO₃(s) + H⁺(aq) → Ca²⁺(aq) + HCO₃⁻(aq).

A high school marine biology research group collected shell samples from coastal regions with pH 7.8 and pH 8.2 to analyze mass loss over 60 days under controlled conditions.`,
    questions: [
      {
        id: 1,
        question: "Based on the scenario, what chemical reaction accounts for the initial increase in ocean acidity when excess industrial emissions occur?",
        type: "mcq",
        options: [
          "(A) CO₂ + H₂O → H₂CO₃ followed by H₂CO₃ → H⁺ + HCO₃⁻",
          "(B) 2CO₂ + O₂ → 2CO₃²⁻ followed by neutralisation",
          "(C) CaCO₃ + H₂O → Ca(OH)₂ + CO₂",
          "(D) SO₂ + H₂O → H₂SO₃ directly precipitating carbonates"
        ],
        correctOptionIndex: 0,
        officialAnswer: "(A) CO₂ + H₂O → H₂CO₃ followed by H₂CO₃ → H⁺ + HCO₃⁻",
        stepExplanation: "Dissolved carbon dioxide forms carbonic acid (a weak diprotic acid), which dissociates releasing hydronium/hydrogen ions, driving the solution pH downward.",
        marks: 1
      },
      {
        id: 2,
        question: "Assertion & Reason on Marine Shell Dissolution:",
        type: "assertion_reason",
        assertion: "Marine calcifying organisms suffer thinning and structural degradation of shells in oceans with lower pH.",
        reason: "Calcium carbonate reacts with excess hydrogen ions in acidic solutions to form soluble calcium and bicarbonate ions, preventing stable shell crystallization.",
        options: [
          "(A) Both Assertion and Reason are true, and Reason is the correct explanation of Assertion.",
          "(B) Both Assertion and Reason are true, but Reason is NOT the correct explanation of Assertion.",
          "(C) Assertion is true, but Reason is false.",
          "(D) Assertion is false, but Reason is true."
        ],
        correctOptionIndex: 0,
        officialAnswer: "(A) Both Assertion and Reason are true, and Reason is the correct explanation of Assertion.",
        stepExplanation: "The chemical equilibrium shifts towards dissolution of solid calcium carbonate as H+ consumes CO3(2-) ions, explaining why calcifying shells dissolve.",
        marks: 1
      },
      {
        id: 3,
        question: "If a water sample has a pH of 8.0, and another coastal pool has a pH of 6.0, what is the ratio of [H⁺] ion concentration in the pool compared to the seawater sample?",
        type: "mcq",
        options: [
          "(A) 2 times greater",
          "(B) 20 times greater",
          "(C) 100 times greater",
          "(D) 1000 times greater"
        ],
        correctOptionIndex: 2,
        officialAnswer: "(C) 100 times greater",
        stepExplanation: "pH is a logarithmic scale where pH = -log₁₀[H⁺]. A decrease of 2 pH units (from 8.0 to 6.0) corresponds to a 10² = 100-fold increase in hydrogen ion concentration.",
        marks: 2
      }
    ]
  },
  {
    id: "cs-math-02",
    title: "Parabolic Suspension Arch Design for the Chenab Railway Bridge",
    subject: "Mathematics",
    grade: "Class 10",
    chapter: "Polynomials & Quadratic Equations",
    realWorldContext: "Infrastructure Engineering & Indian Railways Mega Projects",
    scenarioText: `The Chenab River Bridge in Jammu and Kashmir is the world's highest railway bridge, elevated 359 meters above the river bed. The central span consists of a massive steel parabolic arch. 

A civil engineer models the profile of the main arch cross-section on a Cartesian coordinate plane where the river bed lies along the x-axis. The two base footing abutments of the arch touch the ground at x = -100 meters and x = +100 meters. The highest apex of the parabolic arch reaches 50 meters above the baseline. The mathematical relation for the parabolic trajectory is given by:
f(x) = ax² + bx + c`,
    questions: [
      {
        id: 1,
        question: "What are the roots (zeros) of the quadratic polynomial representing the arch touching the baseline?",
        type: "mcq",
        options: [
          "(A) x = 0 and x = 50",
          "(B) x = -100 and x = 100",
          "(C) x = -50 and x = 50",
          "(D) x = -200 and x = 0"
        ],
        correctOptionIndex: 1,
        officialAnswer: "(B) x = -100 and x = 100",
        stepExplanation: "The abutments intersect the x-axis baseline at x = -100 and x = +100, which are the zeros of the polynomial f(x) = 0.",
        marks: 1
      },
      {
        id: 2,
        question: "Determine the exact value of coefficient 'a' and write the polynomial equation for the arch.",
        type: "mcq",
        options: [
          "(A) a = -1/200, f(x) = -x²/200 + 50",
          "(B) a = 1/200, f(x) = x²/200 + 50",
          "(C) a = -1/50, f(x) = -x²/50 + 100",
          "(D) a = -2, f(x) = -2x² + 50"
        ],
        correctOptionIndex: 0,
        officialAnswer: "(A) a = -1/200, f(x) = -x²/200 + 50",
        stepExplanation: "Since the vertex is at (0, 50), c = 50 and b = 0. Substituting root x = 100: a(100)² + 50 = 0 → 10000a = -50 → a = -50/10000 = -1/200.",
        marks: 2
      },
      {
        id: 3,
        question: "At a horizontal distance of 60 meters from the central vertical axis, what is the clearance height of the bridge arch?",
        type: "mcq",
        options: [
          "(A) 36.4 meters",
          "(B) 32.0 meters",
          "(C) 42.8 meters",
          "(D) 25.5 meters"
        ],
        correctOptionIndex: 1,
        officialAnswer: "(B) 32.0 meters",
        stepExplanation: "Substitute x = 60 into f(x) = -x²/200 + 50: f(60) = -(3600)/200 + 50 = -18 + 50 = 32 meters.",
        marks: 1
      }
    ]
  },
  {
    id: "cs-sci-03",
    title: "Electric Vehicles (EV) Regenerative Braking and Joule's Law",
    subject: "Science",
    grade: "Class 10",
    chapter: "Electricity & Magnetic Effects of Electric Current",
    realWorldContext: "Automotive Technology & Energy Conservation",
    scenarioText: `Modern electric two-wheelers and buses in Indian smart cities utilize brushless DC (BLDC) motors connected to 48V lithium-ion battery packs. In normal driving mode, electrical energy from the battery turns the wheels. 

When the driver applies the brakes, the vehicle control unit flips the circuitry into 'Regenerative Braking Mode': the kinetic energy of the spinning wheels turns the motor into an electric generator, sending reverse charging current back into the battery pack and slowing the vehicle down. 

However, when emergency friction brakes are engaged simultaneously, mechanical energy dissipates as heat across the disc rotor of resistance R = 0.5 Ω with a peak surge current of 30 A for 4 seconds.`,
    questions: [
      {
        id: 1,
        question: "Which scientific principle explains how the spinning wheels generate electric current during regenerative braking?",
        type: "mcq",
        options: [
          "(A) Michael Faraday's Law of Electromagnetic Induction",
          "(B) Fleming's Left Hand Rule for Motors",
          "(C) Coulomb's Law of Electrostatic Attraction",
          "(D) Ohm's Law of Resistance"
        ],
        correctOptionIndex: 0,
        officialAnswer: "(A) Michael Faraday's Law of Electromagnetic Induction",
        stepExplanation: "Electromagnetic induction states that when a conductor moves in a magnetic field changing magnetic flux, an induced electromotive force (EMF) and current are generated.",
        marks: 1
      },
      {
        id: 2,
        question: "Calculate the total thermal energy generated in the brake disc according to Joule's Law of Heating during the 4-second emergency stop.",
        type: "mcq",
        options: [
          "(A) 900 Joules",
          "(B) 1,800 Joules",
          "(C) 3,600 Joules",
          "(D) 7,200 Joules"
        ],
        correctOptionIndex: 1,
        officialAnswer: "(B) 1,800 Joules",
        stepExplanation: "Joule's Law of Heating: H = I²Rt. Given I = 30 A, R = 0.5 Ω, t = 4 s. H = (30)² × 0.5 × 4 = 900 × 2 = 1800 Joules.",
        marks: 2
      }
    ]
  }
];
