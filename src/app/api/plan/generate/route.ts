import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { queryPythonServer } from "@/lib/python-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { subject, classLevel, days, weakAreas, examName } = await req.json();

    if (!subject || !days) {
      return NextResponse.json({ error: "Subject and days are required" }, { status: 400 });
    }

    const requestedDays = Number(days) || 5;

    // 1. Try Python Developed Local AI Server First (http://localhost:5000)
    const pythonResult = await queryPythonServer({
      task: "plan",
      subject,
      chapter: weakAreas || examName || "Curriculum Focus",
      days: requestedDays
    });

    if (pythonResult && (Array.isArray(pythonResult.schedule) || Array.isArray(pythonResult.plan))) {
      const scheduleItems = (pythonResult.schedule || pythonResult.plan || []).map((item: any, idx: number) => ({
        day: item.day || idx + 1,
        topic: item.topic || `Day ${idx + 1} NCERT Study`,
        activities: item.activities || [item.duration ? `Study topic for ${item.duration}` : "Read NCERT chapter", "Solve in-text questions"],
        durationMins: item.durationMins || 45
      }));
      if (scheduleItems.length > 0) {
        return NextResponse.json({ schedule: scheduleItems });
      }
    }

    // 2. Try Gemini API
    const apiKey = process.env.GEMINI_API_KEY_PLAN || process.env.GEMINI_API_KEY || "";
    if (!apiKey || process.env.USE_LOCAL_AI === "true") {
      const fallbackSchedule = Array.from({ length: requestedDays }, (_, i) => ({
        day: i + 1,
        topic: `${subject} - Core Concept Part ${i + 1}`,
        activities: ["Read NCERT Textbook sections", "Solve Exemplar Problems & In-text Questions", "Review Summary & Formulas"],
        durationMins: 45
      }));
      return NextResponse.json({ schedule: fallbackSchedule });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

    const prompt = `You are an expert AI Study Planner for Indian students. 
Create a ${requestedDays}-day study plan for a Class ${classLevel || '10'} student preparing for ${examName || 'their exam'} in ${subject}.
${weakAreas ? `The student is weak in: ${weakAreas}. Give extra focus to these areas.` : ""}

You MUST return a JSON object with a single key "schedule" containing an array of day objects.
Each day object must have:
- "day": integer (1 to ${requestedDays})
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
      let cleanText = resultText.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      
      const parsed = JSON.parse(cleanText);
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
