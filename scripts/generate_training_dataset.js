import fs from 'fs';
import path from 'path';

// Import extracted PYQs
const pyqPath = path.join(process.cwd(), 'src', 'lib', 'extracted-pyqs.json');
let pyqs = [];

if (fs.existsSync(pyqPath)) {
  try {
    const rawData = fs.readFileSync(pyqPath, 'utf8');
    pyqs = JSON.parse(rawData);
  } catch (err) {
    console.error("Error reading extracted-pyqs.json:", err.message);
  }
}

// Add hardcoded exemplars
const hardcodedExamples = [
  {
    class: 10,
    subject: "Science",
    question: "Identify the type of reactions taking place in each of the following cases and write the balanced chemical equation for the reactions.\n(a) Zinc reacts with silver nitrate to produce zinc nitrate and silver.\n(b) Potassium iodide reacts with lead nitrate to produce potassium nitrate and lead iodide.",
    answer: "(a) Displacement reaction: Zn + 2AgNO₃ → Zn(NO₃)₂ + 2Ag\n(b) Double displacement reaction: 2KI + Pb(NO₃)₂ → 2KNO₃ + PbI₂"
  },
  {
    class: 10,
    subject: "Science",
    question: "Define a balanced chemical equation. Why should an equation be balanced?",
    answer: "A balanced chemical equation has an equal number of atoms of each element on both reactant and product sides. It must be balanced to satisfy the Law of Conservation of Mass, which states that mass can neither be created nor destroyed in a chemical reaction."
  },
  {
    class: 10,
    subject: "Mathematics",
    question: "Prove that: (sin A + cosec A)² + (cos A + sec A)² = 7 + tan² A + cot² A",
    answer: "Step 1: Expand using (a + b)²:\nLHS = sin²A + cosec²A + 2sinA·cosecA + cos²A + sec²A + 2cosA·secA\nStep 2: Group identities (sin²A + cos²A = 1, sinA·cosecA = 1, cosA·secA = 1):\nLHS = 1 + cosec²A + 2 + sec²A + 2 = 5 + cosec²A + sec²A\nStep 3: Substitute cosec²A = 1 + cot²A and sec²A = 1 + tan²A:\nLHS = 5 + (1 + cot²A) + (1 + tan²A) = 7 + tan²A + cot²A = RHS. Hence Proved."
  },
  {
    class: 9,
    subject: "Science",
    question: "State Newton's Second Law of Motion and derive F = ma.",
    answer: "Newton's Second Law of Motion states that the rate of change of momentum of an object is directly proportional to the applied unbalanced force in the direction of the force.\n\nDerivation:\nLet mass of object = m, initial velocity = u, final velocity = v in time t.\nInitial momentum (p₁) = mu\nFinal momentum (p₂) = mv\nChange in momentum = mv - mu = m(v - u)\nRate of change of momentum = m(v - u)/t = ma (since acceleration a = (v - u)/t)\nBy 2nd law: F ∝ ma ⟹ F = k·ma. In SI units k = 1, so F = ma."
  }
];

// Build OpenAI Fine-Tuning JSONL
const openAiDataset = [];
const geminiDataset = [];

const systemInstruction = "You are EduTrack AI, an expert, encouraging personal tutor for Indian school students (Classes 6-10) following the CBSE / NCERT curriculum. Explain step-by-step using clear headings, Unicode sub/superscripts (e.g. H₂O, x²), and simple analogies.";

// Process hardcoded
for (const ex of hardcodedExamples) {
  openAiDataset.push({
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: `[Class ${ex.class} ${ex.subject}] ${ex.question}` },
      { role: "assistant", content: ex.answer }
    ]
  });

  geminiDataset.push({
    input_text: `[Class ${ex.class} ${ex.subject}] ${ex.question}`,
    output_text: ex.answer
  });
}

// Process PYQs from json
for (const item of pyqs) {
  if (item.question && item.officialAnswer) {
    const userMsg = `[CBSE Class 10 PYQ - ${item.category || 'Exam Question'}] ${item.question}`;
    openAiDataset.push({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userMsg },
        { role: "assistant", content: item.officialAnswer }
      ]
    });

    geminiDataset.push({
      input_text: userMsg,
      output_text: item.officialAnswer
    });
  }
}

// Ensure output directories exist
const outputDir = path.join(process.cwd(), 'public', 'training');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Save OpenAI JSONL
const jsonlPath = path.join(outputDir, 'edutrack_openai_finetune.jsonl');
const jsonlContent = openAiDataset.map(d => JSON.stringify(d)).join('\n');
fs.writeFileSync(jsonlPath, jsonlContent, 'utf8');

// Save Gemini JSON
const geminiPath = path.join(outputDir, 'edutrack_gemini_dataset.json');
fs.writeFileSync(geminiPath, JSON.stringify(geminiDataset, null, 2), 'utf8');

console.log(`✅ Fine-tuning datasets generated successfully!`);
console.log(`- OpenAI Format JSONL: ${jsonlPath} (${openAiDataset.length} training examples)`);
console.log(`- Gemini Format JSON: ${geminiPath} (${geminiDataset.length} training examples)`);
