import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { topic, classLevel, subject, count = 10 } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });

    const prompt = `You are an expert AI tutor for Indian students. Create exactly ${count} highly effective flashcards for a Class ${classLevel || '10'} student studying ${subject || 'Science'}, focusing on the topic: "${topic}".
    
You MUST return a JSON object with a single key "flashcards" containing an array of card objects.
Each card object must have exactly two keys: "front" (the question/term) and "back" (the answer/definition).

Example format:
{
  "flashcards": [
    { "front": "What is the powerhouse of the cell?", "back": "Mitochondria" }
  ]
}`;

    const result = await model.generateContent(prompt);
    const resultText = result.response.text();

    let flashcards = [];
    try {
      const parsed = JSON.parse(resultText);
      flashcards = parsed.flashcards || [];
    } catch(e) {
      console.error("JSON parse error from Gemini:", e);
    }

    return NextResponse.json({ flashcards });
  } catch (error: any) {
    console.error("Flashcard Gen Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate flashcards" }, { status: 500 });
  }
}
