import json
import os
from pathlib import Path

# Paths
base_dir = Path(__file__).resolve().parent.parent
pyq_file = base_dir / "src" / "lib" / "extracted-pyqs.json"
output_dir = base_dir / "public" / "training"
output_dir.mkdir(parents=True, exist_ok=True)

# System Instruction
SYSTEM_INSTRUCTION = (
    "You are EduTrack AI, an expert, encouraging personal tutor for Indian school students "
    "(Classes 6-10) following the CBSE / NCERT curriculum. Explain step-by-step using clear headings, "
    "Unicode sub/superscripts (e.g. H₂O, x²), and simple analogies."
)

# Core Hardcoded CBSE Exemplars
hardcoded_examples = [
    {
        "class": 10,
        "subject": "Science",
        "question": "Identify the type of reactions taking place in each of the following cases and write the balanced chemical equation for the reactions.\n(a) Zinc reacts with silver nitrate to produce zinc nitrate and silver.\n(b) Potassium iodide reacts with lead nitrate to produce potassium nitrate and lead iodide.",
        "answer": "(a) Displacement reaction: Zn + 2AgNO₃ → Zn(NO₃)₂ + 2Ag\n(b) Double displacement reaction: 2KI + Pb(NO₃)₂ → 2KNO₃ + PbI₂"
    },
    {
        "class": 10,
        "subject": "Science",
        "question": "Define a balanced chemical equation. Why should an equation be balanced?",
        "answer": "A balanced chemical equation has an equal number of atoms of each element on both reactant and product sides. It must be balanced to satisfy the Law of Conservation of Mass, which states that mass can neither be created nor destroyed in a chemical reaction."
    },
    {
        "class": 10,
        "subject": "Mathematics",
        "question": "Prove that: (sin A + cosec A)² + (cos A + sec A)² = 7 + tan² A + cot² A",
        "answer": "Step 1: Expand using (a + b)²:\nLHS = sin²A + cosec²A + 2sinA·cosecA + cos²A + sec²A + 2cosA·secA\nStep 2: Group identities (sin²A + cos²A = 1, sinA·cosecA = 1, cosA·secA = 1):\nLHS = 1 + cosec²A + 2 + sec²A + 2 = 5 + cosec²A + sec²A\nStep 3: Substitute cosec²A = 1 + cot²A and sec²A = 1 + tan²A:\nLHS = 5 + (1 + cot²A) + (1 + tan²A) = 7 + tan²A + cot²A = RHS. Hence Proved."
    },
    {
        "class": 9,
        "subject": "Science",
        "question": "State Newton's Second Law of Motion and derive F = ma.",
        "answer": "Newton's Second Law of Motion states that the rate of change of momentum of an object is directly proportional to the applied unbalanced force in the direction of the force.\n\nDerivation:\nLet mass of object = m, initial velocity = u, final velocity = v in time t.\nInitial momentum (p₁) = mu\nFinal momentum (p₂) = mv\nChange in momentum = mv - mu = m(v - u)\nRate of change of momentum = m(v - u)/t = ma (since acceleration a = (v - u)/t)\nBy 2nd law: F ∝ ma ⟹ F = k·ma. In SI units k = 1, so F = ma."
    }
]

openai_dataset = []
gemini_dataset = []

# Process hardcoded
for ex in hardcoded_examples:
    user_msg = f"[Class {ex['class']} {ex['subject']}] {ex['question']}"
    openai_dataset.append({
        "messages": [
            {"role": "system", "content": SYSTEM_INSTRUCTION},
            {"role": "user", "content": user_msg},
            {"role": "assistant", "content": ex["answer"]}
        ]
    })
    gemini_dataset.append({
        "input_text": user_msg,
        "output_text": ex["answer"]
    })

# Process PYQs from json file if exists
if pyq_file.exists():
    try:
        with open(pyq_file, "r", encoding="utf-8") as f:
            pyqs = json.load(f)
            for item in pyqs:
                if item.get("question") and item.get("officialAnswer"):
                    user_msg = f"[CBSE Class 10 PYQ - {item.get('category', 'Exam Question')}] {item['question']}"
                    openai_dataset.append({
                        "messages": [
                            {"role": "system", "content": SYSTEM_INSTRUCTION},
                            {"role": "user", "content": user_msg},
                            {"role": "assistant", "content": item["officialAnswer"]}
                        ]
                    })
                    gemini_dataset.append({
                        "input_text": user_msg,
                        "output_text": item["officialAnswer"]
                    })
    except Exception as e:
        print(f"Warning loading PYQ json: {e}")

# Save OpenAI JSONL
jsonl_path = output_dir / "edutrack_openai_finetune.jsonl"
with open(jsonl_path, "w", encoding="utf-8") as f:
    for entry in openai_dataset:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

# Save Gemini JSON
gemini_path = output_dir / "edutrack_gemini_dataset.json"
with open(gemini_path, "w", encoding="utf-8") as f:
    json.dump(gemini_dataset, f, indent=2, ensure_ascii=False)

print("🐍 Python Training Dataset Generator Success!")
print(f" - OpenAI JSONL: {jsonl_path} ({len(openai_dataset)} entries)")
print(f" - Gemini JSON: {gemini_path} ({len(gemini_dataset)} entries)")
