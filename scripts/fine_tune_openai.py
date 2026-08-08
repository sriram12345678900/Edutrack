"""
EduTrack AI - Python Script to Fine-Tune OpenAI GPT-4o-mini Model
Requirements: pip install openai
Set OPENAI_API_KEY environment variable before running.
"""
import os
import time
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print("❌ 'openai' python package not installed. Install with: pip install openai")
    exit(1)

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("❌ OPENAI_API_KEY environment variable is missing!")
    print("Usage: export OPENAI_API_KEY='your-key' (Linux/Mac) or $env:OPENAI_API_KEY='your-key' (PowerShell)")
    exit(1)

client = OpenAI(api_key=api_key)
jsonl_path = Path(__file__).resolve().parent.parent / "public" / "training" / "edutrack_openai_finetune.jsonl"

if not jsonl_path.exists():
    print(f"❌ Dataset file not found at {jsonl_path}. Run generate_dataset.py first!")
    exit(1)

print(f"🚀 Uploading training file: {jsonl_path}...")
with open(jsonl_path, "rb") as f:
    uploaded_file = client.files.create(file=f, purpose="fine-tune")

print(f"✅ Uploaded! File ID: {uploaded_file.id}")
print("Creating Fine-Tuning Job for model 'gpt-4o-mini-2024-07-18'...")

job = client.fine_tuning.jobs.create(
    training_file=uploaded_file.id,
    model="gpt-4o-mini-2024-07-18"
)

print(f"🎉 Job Created! Job ID: {job.id}")
print(f"Status: {job.status}")
print("Track your fine-tuning progress at https://platform.openai.com/finetuning")
