import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { studentResponse, maxMarks = 10, assignmentTitle = "Assignment", subject = "Science", classLevel = "10" } = await req.json();

    if (!studentResponse) {
      return NextResponse.json({ error: "Student response is required" }, { status: 400 });
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

    const prompt = `You are an expert, constructive teacher for Class ${classLevel} ${subject}.
You are grading a student's submission for an assignment titled: "${assignmentTitle}".
The maximum possible score is ${maxMarks}.

Student's Response:
"""
${studentResponse}
"""

Evaluate the student's response. Provide a score out of ${maxMarks} and constructive feedback.
The feedback should point out what they did well, and what they need to improve or clarify. 
Keep the feedback encouraging but pedagogically sound.

Return the output as a strictly formatted JSON object with this exact schema:
{
  "score": <number>,
  "feedback": "<string>"
}
`;

    const result = await model.generateContent(prompt);
    const resultText = result.response.text();
    let cleanText = resultText.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    
    const parsed = JSON.parse(cleanText);

    return NextResponse.json({ grading: parsed });
  } catch (error: any) {
    console.error("AI Grading Error:", error);
    return NextResponse.json({ error: error.message || "Failed to grade submission" }, { status: 500 });
  }
}
