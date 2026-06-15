import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { subject, classLevel, days, weakAreas, examName } = await req.json();

    if (!subject || !days) {
      return NextResponse.json({ error: "Subject and days are required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });

    const prompt = `You are an expert AI Study Planner for Indian students. 
Create a ${days}-day study plan for a Class ${classLevel || '10'} student preparing for ${examName || 'their exam'} in ${subject}.
${weakAreas ? `The student is weak in: ${weakAreas}. Give extra focus to these areas.` : ""}

You MUST return a JSON object with a single key "schedule" containing an array of day objects.
Each day object must have:
- "day": integer (1 to ${days})
- "topic": string (the main topic for the day, short)
- "activities": array of strings (2-3 specific, actionable tasks)
- "durationMins": integer (suggested study time in minutes)

Example format:
{
  "schedule": [
    { "day": 1, "topic": "Acids", "activities": ["Read NCERT Chapter 2"], "durationMins": 45 }
  ]
}`;

    const result = await model.generateContent(prompt);
    const resultText = result.response.text();
    
    let schedule = [];
    try {
      const parsed = JSON.parse(resultText);
      schedule = parsed.schedule || [];
    } catch(e) {
      console.error("JSON parse error from Gemini:", e);
    }

    return NextResponse.json({ schedule });
  } catch (error: any) {
    console.error("Plan Gen Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate plan" }, { status: 500 });
  }
}
