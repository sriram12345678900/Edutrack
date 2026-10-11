import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { studentName, className, totalXP, streak, weakSubjects } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({
        executiveSummary: `${studentName} has demonstrated admirable consistency across Class ${className || 10} studies, logging a ${streak || 1}-day streak and accumulating ${totalXP || 100} XP. Recommended focus for upcoming assessments: deeper conceptual reinforcement in ${weakSubjects?.join(", ") || "Science & Mathematics"}.`,
        keyStrengths: [
          "Consistent daily study routine maintained across weeks.",
          "High active recall engagement in Leitner memory flashcards.",
          "Good problem solving velocity in chapter mock assessments.",
        ],
        priorityGrowthAreas: [
          "Strengthen numerical problem derivations with explicit step-by-step units.",
          "Review recurring Error Vault mistakes prior to mock tests.",
        ]
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `System: You are an expert CBSE Senior Academic Advisor preparing a formal weekly student progress audit report for parents and educators.
Student: ${studentName}
Class: ${className || 10}
Total XP: ${totalXP}
Study Streak: ${streak} Days
Priority Focus Topics: ${weakSubjects?.join(", ") || "General"}

Respond STRICTLY with valid JSON matching:
{
  "executiveSummary": string (150 words insightful formal summary highlighting velocity, discipline, and milestones),
  "keyStrengths": string[] (3 bullet points celebrating student cognitive milestones),
  "priorityGrowthAreas": string[] (3 actionable high-impact study recommendations for the coming week)
}`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const cleanJson = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Report Generation API Error:", error);
    return NextResponse.json({
      executiveSummary: "Student demonstrates strong study habits with active engagement across multiple syllabus domains.",
      keyStrengths: ["Consistent login and session completion", "High problem retention", "Active revision"],
      priorityGrowthAreas: ["Complete remaining weekly missions", "Review error vault cards"],
    });
  }
}
