import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const openaiPath = path.join(process.cwd(), "public", "training", "edutrack_openai_finetune.jsonl");
    const geminiPath = path.join(process.cwd(), "public", "training", "edutrack_gemini_dataset.json");

    const openaiExists = fs.existsSync(openaiPath);
    const geminiExists = fs.existsSync(geminiPath);

    return NextResponse.json({
      status: "success",
      datasets: {
        openai: {
          exists: openaiExists,
          downloadUrl: "/training/edutrack_openai_finetune.jsonl",
          format: "JSONL (OpenAI / Fine-Tuning Console)"
        },
        gemini: {
          exists: geminiExists,
          downloadUrl: "/training/edutrack_gemini_dataset.json",
          format: "JSON (Google AI Studio / Vertex AI)"
        }
      },
      message: "Training datasets are ready for model fine-tuning."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
