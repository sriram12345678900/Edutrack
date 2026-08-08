"""
EduTrack AI - Standalone Local AI Model Trainer (100% Custom, No External APIs)
Framework: PyTorch + Hugging Face Transformers
Train a local model (e.g., Qwen1.5-0.5B, Llama-3-8B, or Mistral) on your own CBSE dataset.
"""

import os
import json
import torch
from pathlib import Path

def train_custom_local_ai():
    print("=" * 60)
    print("🚀 EDUTRACK CUSTOM LOCAL AI MODEL TRAINER (NO THIRD-PARTY APIS)")
    print("=" * 60)
    
    # Check PyTorch availability
    print(f"📦 PyTorch Version: {torch.__version__}")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"⚡ Compute Device: {device.upper()}")
    if device == "cuda":
        print(f"🎮 GPU: {torch.cuda.get_device_name(0)}")
    else:
        print("💡 Running on CPU (Works fine for smaller models like Qwen1.5-0.5B or Pythia-410m)")

    # Dataset path
    base_dir = Path(__file__).resolve().parent.parent
    dataset_file = base_dir / "public" / "training" / "edutrack_openai_finetune.jsonl"
    output_model_dir = base_dir / "models" / "edutrack-local-ai"
    output_model_dir.mkdir(parents=True, exist_ok=True)

    if not dataset_file.exists():
        print(f"❌ Dataset file not found at {dataset_file}. Run scripts/generate_dataset.py first!")
        return

    # Check if transformers & trl are installed
    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments
        from datasets import Dataset
    except ImportError:
        print("\n❌ Required Python packages missing! Install them via:")
        print("pip install torch transformers datasets accelerate trl\n")
        print("Script blueprint generated below for reference:\n")
        print_standalone_pytorch_script()
        return

    # 1. Load Dataset
    print(f"📖 Loading local CBSE dataset from {dataset_file}...")
    formatted_texts = []
    with open(dataset_file, "r", encoding="utf-8") as f:
        for line in f:
            data = json.loads(line)
            msgs = data.get("messages", [])
            full_text = ""
            for m in msgs:
                role = m["role"].capitalize()
                content = m["content"]
                full_text += f"<|im_start|>{role}\n{content}<|im_end|>\n"
            formatted_texts.append({"text": full_text})

    dataset = Dataset.from_list(formatted_texts)
    print(f"✅ Prepared {len(dataset)} training samples.")

    # 2. Select Open-Source Base Model (Free & Self-Hosted)
    # Recommended small fast model: Qwen/Qwen1.5-0.5B-Chat or TinyLlama/TinyLlama-1.1B-Chat-v1.0
    model_name = "Qwen/Qwen1.5-0.5B-Chat"
    print(f"🤖 Loading Base Model: {model_name}...")

    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        device_map="auto" if device == "cuda" else None,
        trust_remote_code=True
    )

    # 3. Training Config
    training_args = TrainingArguments(
        output_dir=str(output_model_dir),
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        logging_steps=5,
        num_train_epochs=3,
        save_strategy="epoch",
        fp16=(device == "cuda"),
        report_to="none"
    )

    # 4. Tokenize & Train
    def tokenize_fn(examples):
        return tokenizer(examples["text"], truncation=True, max_length=512, padding="max_length")

    tokenized_dataset = dataset.map(tokenize_fn, batched=True)

    from transformers import Trainer, DataCollatorForLanguageModeling
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False),
    )

    print("🔥 Starting Local Model Training...")
    trainer.train()

    # 5. Save Final Custom Model
    print(f"💾 Saving your trained custom EduTrack AI model to {output_model_dir}...")
    model.save_pretrained(output_model_dir)
    tokenizer.save_pretrained(output_model_dir)
    print("🎉 CUSTOM LOCAL AI MODEL TRAINED SUCCESSFULLY!")
    print(f"Your model files are saved in: {output_model_dir}")

def print_standalone_pytorch_script():
    code = '''
# -------------------------------------------------------------
# Standalone PyTorch Training Script (Run on Google Colab or PC)
# -------------------------------------------------------------
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModelForCausalLM

# Load local dataset & train with PyTorch Trainer
'''
    print(code)

if __name__ == "__main__":
    train_custom_local_ai()
