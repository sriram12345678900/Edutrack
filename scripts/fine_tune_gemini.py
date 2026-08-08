"""
EduTrack AI - Python Script to Fine-Tune Google Gemini Model
Requirements: pip install google-generativeai
Set GEMINI_API_KEY environment variable before running.
"""
import os
import json
import time
from pathlib import Path

try:
    import google.generativeai as genai
except ImportError:
    print("❌ 'google-generativeai' module not installed. Install with: pip install google-generativeai")
    exit(1)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ GEMINI_API_KEY environment variable is missing!")
    print("Usage: export GEMINI_API_KEY='your-api-key' (Linux/Mac) or $env:GEMINI_API_KEY='your-key' (PowerShell)")
    exit(1)

genai.configure(api_key=api_key)

dataset_path = Path(__file__).resolve().parent.parent / "public" / "training" / "edutrack_gemini_dataset.json"

if not dataset_path.exists():
    print(f"❌ Dataset file not found at {dataset_path}. Run generate_dataset.py first!")
    exit(1)

with open(dataset_path, "r", encoding="utf-8") as f:
    training_data = json.load(f)

print(f"🚀 Loaded {len(training_data)} CBSE training pairs.")
print("Starting Gemini Fine-Tuning Job on model 'models/gemini-1.5-flash-001'...")

try:
    operation = genai.create_tuned_model(
        source_model="models/gemini-1.5-flash-001",
        training_data=training_data,
        id="edutrack-cbse-tutor-v1",
        display_name="EduTrack CBSE Tutor Model",
        description="Fine-tuned model for CBSE Class 6-10 students on NCERT & PYQs",
        epoch_count=5,
        batch_size=4,
        learning_rate=0.001,
    )

    print(f"⏳ Fine-tuning job created! Operation name: {operation.name}")
    print("Waiting for tuning to complete (this may take a few minutes)...")

    for status in operation.wait_for_complete():
        print(f"Status update: {status}")

    tuned_model_id = operation.result.name
    print(f"✅ Training Complete! Tuned Model Name: {tuned_model_id}")
    print(f"Add this to your .env.local file:\nGEMINI_TUNED_MODEL_ID='{tuned_model_id}'")

except Exception as e:
    print(f"❌ Fine-tuning failed or API not supported in your tier: {e}")
    print("Tip: You can also upload edutrack_gemini_dataset.json manually to Google AI Studio at https://aistudio.google.com/")
