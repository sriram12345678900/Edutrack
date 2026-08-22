import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { topic, classLevel = "10", subject = "Science", difficulty = "medium", questionsCount = 10 } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is missing." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

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
      "type": "mcq" | "fill_in" | "short_answer",
      "question": "The actual question text",
      "options": ["A", "B", "C", "D"], // ONLY include for 'mcq' type
      "answer": "The correct answer or explanation"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const resultText = result.response.text();
    let cleanText = resultText.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    
    const parsed = JSON.parse(cleanText);

    return NextResponse.json({ worksheet: parsed });
  } catch (error: any) {
    console.error("Worksheet Gen Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate worksheet" }, { status: 500 });
  }
}
