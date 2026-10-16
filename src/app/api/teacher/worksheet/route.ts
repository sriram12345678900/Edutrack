import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { topic, classLevel = "10", subject = "Science", difficulty = "medium", questionsCount = 10 } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || "";
    const apiKey = process.env.GEMINI_API_KEY || "";
    let cleanText = "";

    const prompt = `You are an expert curriculum designer and teacher for Class ${classLevel} ${subject}.
Generate a worksheet containing exactly ${questionsCount} questions on the topic: "${topic}".
The difficulty level should be: ${difficulty}.

The worksheet should include a mix of the following types of questions (try to distribute them evenly):
1. Multiple Choice Questions (mcq)
2. Fill in the blanks (fill_in)
3. Short Answer Questions (short_answer)

Return the output as a strictly formatted JSON object with this exact schema:
{
  "title": "A catchy title for the worksheet",
  "topic": "${topic}",
  "subject": "${subject}",
  "classLevel": "${classLevel}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "The actual question text",
      "options": ["A", "B", "C", "D"],
      "answer": "The correct answer or explanation"
    }
  ]
}
`;

    // 1. Try Hugging Face
    if (hfKey) {
      try {
        const { queryHuggingFace } = await import("@/lib/huggingface");
        const hfRes = await queryHuggingFace([
          { role: "system", content: "You are an expert CBSE NCERT worksheet generator. Return strictly valid JSON." },
          { role: "user", content: prompt }
        ], { jsonMode: true, max_tokens: 3000 });
        if (hfRes) cleanText = hfRes;
      } catch (err: any) {
        console.warn("HF worksheet generator failed:", err.message);
      }
    }

    // 2. Try Gemini
    if (!cleanText && apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        cleanText = result.response.text();
      } catch (geminiErr: any) {
        console.warn("Gemini worksheet generator failed:", geminiErr.message);
      }
    }

    if (!cleanText) {
      return NextResponse.json({ error: "AI service is currently unavailable. Please check API keys." }, { status: 500 });
    }

    const { extractJsonFromText } = await import("@/lib/huggingface");
    const parsed = extractJsonFromText(cleanText);

    if (!parsed) {
      return NextResponse.json({ error: "Failed to parse worksheet questions." }, { status: 500 });
    }

    return NextResponse.json({ worksheet: parsed });
  } catch (error: any) {
    console.error("Worksheet Gen Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate worksheet" }, { status: 500 });
  }
}
