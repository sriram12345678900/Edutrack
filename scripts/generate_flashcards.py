"""
EduTrack AI - Standalone Flashcard Generator (Python)
Generates structured JSON flashcards from any CBSE NCERT topic using your trained PyTorch local model or NCERT dataset.
"""

import json
import sys
from pathlib import Path

def generate_python_flashcards(topic="Photosynthesis", count=5):
    print("=" * 60)
    print(f"🎴 EDUTRACK PYTHON FLASHCARD GENERATOR for Topic: '{topic}'")
    print("=" * 60)

    dataset_path = Path(__file__).resolve().parent.parent / "public" / "training" / "edutrack_gemini_dataset.json"
    cards = []

    if dataset_path.exists():
        with open(dataset_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for item in data:
                txt = item.get("input_text", "").lower()
                if topic.lower() in txt:
                    front = item["input_text"].replace("[Class 10 Science]", "").strip()
                    cards.append({
                        "front": front,
                        "back": item["output_text"]
                    })
                if len(cards) >= count:
                    break

    if not cards:
        # Template flashcards
        cards = [
            {
                "front": f"What is the definition of {topic}?",
                "back": f"Essential Class 10 CBSE concept covering {topic} definitions, formula, and applications."
            },
            {
                "front": f"Key Law / Principle governing {topic}",
                "back": f"Review key NCERT laws, SI units, and chemical equations associated with {topic}."
            }
        ]

    output_result = {
        "topic": topic,
        "total_cards": len(cards),
        "flashcards": cards
    }

    print(json.dumps(output_result, indent=2))
    return output_result

if __name__ == "__main__":
    t = sys.argv[1] if len(sys.argv) > 1 else "Photosynthesis"
    c = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    generate_python_flashcards(t, c)
