"""
EduTrack AI - NCERT Textbook RAG (Retrieval-Augmented Generation) Reader & Tutor
Reads NCERT textbook content and answers user questions strictly based on the textbook!
"""

import os
import json
import re
from pathlib import Path

# NCERT Knowledge Base Reader
class NcertReader:
    def __init__(self, data_path=None):
        self.documents = []
        self.base_dir = Path(__file__).resolve().parent.parent
        self.data_path = data_path or self.base_dir / "raw-text.txt"
        self._load_ncert_text()

    def _load_ncert_text(self):
        # 1. Try reading raw-text.txt if available
        if os.path.exists(self.data_path):
            try:
                with open(self.data_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    # Chunk content into paragraphs
                    chunks = [c.strip() for c in content.split("\n\n") if len(c.strip()) > 50]
                    self.documents.extend(chunks)
                print(f"📖 Loaded {len(self.documents)} NCERT textbook excerpts from {self.data_path}")
            except Exception as e:
                print(f"Warning reading NCERT text: {e}")

        # 2. Add built-in NCERT Class 10 Core Text Excerpts
        self.documents.extend([
            "NCERT Class 10 History Chapter 2: Nationalism in India. The growth of modern nationalism in India is intimately connected to the anti-colonial movement. Mahatma Gandhi returned to India in January 1915. He introduced the concept of Satyagraha, which emphasized the power of truth and non-violence. Major movements included the Champaran Satyagraha (1917), Kheda Satyagraha (1917), and Ahmedabad Mill Workers Satyagraha (1918). In 1919, the Rowlatt Act gave the British government enormous powers to repress political activities. The Jallianwala Bagh massacre occurred on 13 April 1919 in Amritsar.",
            "NCERT Class 10 History Chapter 2: Non-Cooperation Movement (1920-1922). At the Nagpur session of the Indian National Congress in December 1920, the Non-Cooperation programme was adopted. It involved surrendering government titles, boycotting civil services, army, police, courts, legislative councils, schools, and foreign goods. The movement was called off by Gandhi in February 1922 following the Chauri Chaura violence in Gorakhpur, UP.",
            "NCERT Class 10 History Chapter 2: Civil Disobedience Movement (1930). Mahatma Gandhi started his famous Salt March accompanied by 78 trusted volunteers. The march was over 240 miles, from Sabarmati ashram to Dandi. On 6 April 1930 he reached Dandi, broke the salt law by manufacturing salt by boiling sea water. This marked the beginning of the Civil Disobedience Movement.",
            "NCERT Class 10 Science Chapter 6: Life Processes - Photosynthesis. Photosynthesis is the process by which autotrophs take in substances from the outside and convert them into stored forms of energy (glucose). Carbon dioxide and water are converted into carbohydrates in the presence of sunlight and chlorophyll. Equation: 6CO2 + 6H2O + Sunlight -> C6H12O6 + 6O2. Events: (i) Absorption of light energy by chlorophyll, (ii) Conversion of light energy to chemical energy and splitting of water molecules, (iii) Reduction of carbon dioxide to carbohydrates."
        ])

    def search_ncert(self, query, top_k=2):
        keywords = [w.lower() for w in re.findall(r'\w+', query) if len(w) > 3]
        results = []

        for doc in self.documents:
            doc_lower = doc.lower()
            score = sum(1 for kw in keywords if kw in doc_lower)
            if score > 0:
                results.append((score, doc))

        # Sort by relevance score
        results.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in results[:top_k]]

def generate_ncert_grounded_answer(user_prompt):
    reader = NcertReader()
    retrieved_excerpts = reader.search_ncert(user_prompt)

    if not retrieved_excerpts:
        ncert_context = "NCERT Standard Curriculum Guidelines for CBSE Class 10."
    else:
        ncert_context = "\n\n".join(retrieved_excerpts)

    print("=" * 60)
    print(f"🔍 RETRIEVED NCERT TEXTBOOK CONTEXT FOR: '{user_prompt}'")
    print("=" * 60)
    print(ncert_context)
    print("=" * 60)

    # Structured Prompt for PyTorch Model / LLM
    final_prompt = (
        f"<|im_start|>system\n"
        f"You are EduTrack AI, an expert NCERT tutor. Answer the student's question STRICTLY using the following NCERT Textbook passage.\n\n"
        f"--- NCERT TEXTBOOK EXCERPT ---\n{ncert_context}\n--- END EXCERPT ---\n"
        f"<|im_end|>\n"
        f"<|im_start|>user\n{user_prompt}<|im_end|>\n"
        f"<|im_start|>assistant\n"
    )

    return final_prompt, ncert_context

if __name__ == "__main__":
    prompt = "Explain Nationalism in India for Class 10 history."
    full_prompt, context = generate_ncert_grounded_answer(prompt)
